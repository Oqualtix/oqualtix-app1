/**
 * Authentication Middleware
 * Provides secure access control for the fraud detection system
 */

import LicenseAuthenticationService from './LicenseAuthenticationService.js';

class AuthenticationMiddleware {
  constructor() {
    this.licenseService = new LicenseAuthenticationService();
    this.currentSession = null;
    
    console.log('🔐 Authentication Middleware initialized');
  }

  // Main authentication check - requires valid license key
  async authenticateAccess(licenseKey, userInfo) {
    try {
      console.log('🔍 Authenticating access...');
      console.log(`📧 User: ${userInfo.email}`);
      console.log(`🔑 License Key: ${licenseKey ? licenseKey.substring(0, 12) + '...' : 'Not provided'}`);

      if (!licenseKey) {
        return this.createAuthResponse(false, 'License key is required to access this system. Please contact oqualtix@outlook.com to obtain a valid license.', 'NO_LICENSE');
      }

      if (!userInfo || !userInfo.email) {
        return this.createAuthResponse(false, 'User information is required for authentication.', 'NO_USER_INFO');
      }

      // Perform authentication through license service
      const authResult = await this.licenseService.authenticateUser(licenseKey, userInfo);

      if (authResult.success) {
        // Store successful session
        this.currentSession = {
          sessionToken: authResult.sessionToken,
          licenseKey: licenseKey,
          userEmail: userInfo.email,
          companyName: authResult.license.companyName,
          role: authResult.user.role,
          permissions: authResult.user.permissions,
          assignedAccount: authResult.license.assignedAccount,
          authenticatedAt: new Date().toISOString()
        };

        console.log('✅ Authentication successful!');
        console.log(`🏢 Company: ${authResult.license.companyName}`);
        console.log(`👤 Role: ${authResult.user.role}`);
        console.log(`💳 Assigned Account: ${authResult.license.assignedAccount}`);

        return this.createAuthResponse(true, 'Authentication successful', 'AUTH_SUCCESS', {
          session: this.currentSession,
          license: authResult.license,
          user: authResult.user
        });
      } else {
        console.log('❌ Authentication failed:', authResult.error);
        return this.createAuthResponse(false, authResult.error, authResult.code);
      }

    } catch (error) {
      console.error('❌ Authentication error:', error);
      return this.createAuthResponse(false, 'System authentication error. Please try again or contact support.', 'SYSTEM_ERROR');
    }
  }

  // Validate existing session
  async validateSession(sessionToken) {
    try {
      const validation = await this.licenseService.validateSession(sessionToken);
      
      if (validation.valid) {
        console.log('✅ Session valid for:', validation.userEmail);
        return { valid: true, userEmail: validation.userEmail, licenseKey: validation.licenseKey };
      } else {
        console.log('❌ Session invalid:', validation.reason);
        this.currentSession = null;
        return { valid: false, reason: validation.reason };
      }
    } catch (error) {
      console.error('❌ Session validation error:', error);
      return { valid: false, reason: 'Session validation error' };
    }
  }

  // Check if user has specific permission
  hasPermission(permission) {
    if (!this.currentSession) {
      return false;
    }

    return this.currentSession.permissions.includes(permission);
  }

  // Check if user is admin
  isAdmin() {
    if (!this.currentSession) {
      return false;
    }

    return this.currentSession.role === 'ADMIN';
  }

  // Get current user info
  getCurrentUser() {
    return this.currentSession;
  }

  // Logout current session
  logout() {
    if (this.currentSession) {
      console.log(`👋 User ${this.currentSession.userEmail} logged out`);
      this.currentSession = null;
    }
  }

  // Create standardized auth response
  createAuthResponse(success, message, code, data = null) {
    const response = {
      success: success,
      message: message,
      code: code,
      timestamp: new Date().toISOString()
    };

    if (data) {
      response.data = data;
    }

    return response;
  }

  // Require authentication wrapper for functions
  requireAuth(fn) {
    return async (...args) => {
      if (!this.currentSession) {
        throw new Error('Authentication required. Please provide a valid license key.');
      }

      return await fn.apply(this, args);
    };
  }

  // Require specific permission wrapper
  requirePermission(permission) {
    return (fn) => {
      return async (...args) => {
        if (!this.currentSession) {
          throw new Error('Authentication required.');
        }

        if (!this.hasPermission(permission)) {
          throw new Error(`Permission denied. Required permission: ${permission}`);
        }

        return await fn.apply(this, args);
      };
    };
  }

  // Require admin access wrapper
  requireAdmin(fn) {
    return async (...args) => {
      if (!this.currentSession) {
        throw new Error('Authentication required.');
      }

      if (!this.isAdmin()) {
        throw new Error('Administrator access required.');
      }

      return await fn.apply(this, args);
    };
  }

  // Interactive authentication prompt
  async promptForAuthentication() {
    console.log('\n🔐 OQUALTIX FRAUD DETECTION SYSTEM - AUTHENTICATION REQUIRED');
    console.log('=' * 65);
    console.log('This system requires a valid license key from oqualtix@outlook.com');
    console.log('Each company is limited to one user per bank account/company card.');
    console.log('');

    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const question = (prompt) => {
      return new Promise((resolve) => {
        rl.question(prompt, (answer) => {
          resolve(answer);
        });
      });
    };

    try {
      console.log('Please provide your authentication details:');
      
      const licenseKey = await question('🔑 License Key: ');
      const email = await question('📧 Email Address: ');
      const name = await question('👤 Full Name (optional): ');
      const requestedAccount = await question('💳 Specific Account ID (optional, leave blank for auto-assignment): ');

      rl.close();

      const userInfo = {
        email: email.trim(),
        name: name.trim() || email.trim(),
        requestedAccount: requestedAccount.trim() || null
      };

      console.log('\n🔍 Authenticating...');
      
      const authResult = await this.authenticateAccess(licenseKey.trim(), userInfo);

      if (authResult.success) {
        console.log('\n✅ Authentication Successful!');
        console.log(`🏢 Welcome to ${authResult.data.license.companyName}`);
        console.log(`👤 Logged in as: ${authResult.data.user.role}`);
        console.log(`💳 Assigned to account: ${authResult.data.license.assignedAccount}`);
        console.log(`🔒 Session expires: ${new Date(Date.now() + 24*60*60*1000).toLocaleString()}`);
        console.log('');
        
        return authResult;
      } else {
        console.log('\n❌ Authentication Failed!');
        console.log(`Error: ${authResult.message}`);
        console.log('');
        console.log('Please check your license key and contact oqualtix@outlook.com if you need assistance.');
        
        return authResult;
      }

    } catch (error) {
      rl.close();
      console.error('❌ Authentication prompt error:', error);
      return this.createAuthResponse(false, 'Authentication prompt failed', 'PROMPT_ERROR');
    }
  }

  // Display authentication status
  displayAuthStatus() {
    if (!this.currentSession) {
      console.log('🔒 Not authenticated');
      return;
    }

    console.log('\n🔐 AUTHENTICATION STATUS');
    console.log('=' * 30);
    console.log(`👤 User: ${this.currentSession.userEmail}`);
    console.log(`🏢 Company: ${this.currentSession.companyName}`);
    console.log(`👮 Role: ${this.currentSession.role}`);
    console.log(`💳 Account: ${this.currentSession.assignedAccount}`);
    console.log(`🕐 Authenticated: ${new Date(this.currentSession.authenticatedAt).toLocaleString()}`);
    console.log(`🔑 License: ${this.currentSession.licenseKey.substring(0, 12)}...`);
    console.log(`🛡️  Permissions: ${this.currentSession.permissions.join(', ')}`);
    console.log('');
  }
}

export default AuthenticationMiddleware;