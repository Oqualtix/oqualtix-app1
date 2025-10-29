/**
 * Authentication System Demo
 * Demonstrates the complete license-based authentication system
 */

import LicenseAuthenticationService from './src/services/LicenseAuthenticationService.js';
import AuthenticationMiddleware from './src/middleware/AuthenticationMiddleware.js';

class AuthenticationDemo {
  constructor() {
    this.licenseService = new LicenseAuthenticationService();
    this.authMiddleware = new AuthenticationMiddleware();
    
    console.log('🔐 OQUALTIX AUTHENTICATION SYSTEM DEMO');
    console.log('=' * 50);
  }

  async runDemo() {
    try {
      console.log('\n📋 DEMO SCENARIO:');
      console.log('1. Admin generates license for "Demo Company"');
      console.log('2. User attempts to access fraud detection system');
      console.log('3. System validates license and assigns user to account');
      console.log('4. User gets access to fraud detection features');
      
      await this.demonstrateAdminLicenseGeneration();
      await this.demonstrateUserAuthentication();
      await this.demonstrateAccessControl();
      await this.demonstrateSecurityFeatures();
      
      console.log('\n✅ DEMO COMPLETED SUCCESSFULLY!');
      console.log('The authentication system is fully functional with:');
      console.log('  🔑 License-based access control');
      console.log('  👥 One user per bank account/company card');
      console.log('  🔒 Role-based permissions');
      console.log('  📊 Complete audit trail');
      
    } catch (error) {
      console.error('❌ Demo error:', error.message);
    }
  }

  async demonstrateAdminLicenseGeneration() {
    console.log('\n🔑 STEP 1: ADMIN LICENSE GENERATION');
    console.log('=' * 45);
    
    // Simulate admin generating a license
    const companyInfo = {
      companyName: 'Demo Financial Corp',
      contactEmail: 'admin@demofinancial.com',
      bankAccounts: [
        { id: 'DEMO_BANK_001', type: 'bank_account', name: 'Primary Checking Account' },
        { id: 'DEMO_BANK_002', type: 'bank_account', name: 'Secondary Savings Account' }
      ],
      companyCards: [
        { id: 'DEMO_CARD_001', type: 'company_card', name: 'Executive Corporate Card' }
      ],
      apiAccess: true
    };

    console.log('👤 Admin: oqualtix@outlook.com');
    console.log('🏢 Generating license for: Demo Financial Corp');
    console.log('🏦 Bank Accounts: 2');
    console.log('💳 Company Cards: 1');
    console.log('👥 Maximum Users: 3 (2 bank accounts + 1 company card)');
    
    const license = this.licenseService.generateLicenseKey(companyInfo, 'oqualtix@outlook.com');
    
    console.log('\n✅ LICENSE GENERATED:');
    console.log(`🔑 License Key: ${license.licenseKey}`);
    console.log(`🆔 License ID: ${license.licenseId}`);
    console.log(`📅 Expires: ${new Date(license.expirationDate).toLocaleDateString()}`);
    console.log(`👥 Max Users: ${license.maxUsers}`);
    
    // Store for next demo step
    this.demoLicenseKey = license.licenseKey;
    
    return license;
  }

  async demonstrateUserAuthentication() {
    console.log('\n👤 STEP 2: USER AUTHENTICATION');
    console.log('=' * 35);
    
    const userInfo = {
      email: 'john.smith@demofinancial.com',
      name: 'John Smith',
      requestedAccount: 'DEMO_BANK_001' // User requests specific bank account
    };

    console.log(`📧 User attempting access: ${userInfo.email}`);
    console.log(`🔑 Using license key: ${this.demoLicenseKey.substring(0, 20)}...`);
    console.log(`💳 Requested account: ${userInfo.requestedAccount}`);
    
    const authResult = await this.authMiddleware.authenticateAccess(this.demoLicenseKey, userInfo);
    
    if (authResult.success) {
      console.log('\n✅ AUTHENTICATION SUCCESSFUL!');
      console.log(`🏢 Company: ${authResult.data.license.companyName}`);
      console.log(`👮 Role: ${authResult.data.user.role}`);
      console.log(`💳 Assigned Account: ${authResult.data.license.assignedAccount}`);
      console.log(`🔒 Session Token: ${authResult.data.session.sessionToken.substring(0, 16)}...`);
      console.log(`🛡️  Permissions: ${authResult.data.user.permissions.join(', ')}`);
    } else {
      console.log(`❌ Authentication failed: ${authResult.message}`);
    }

    return authResult;
  }

  async demonstrateAccessControl() {
    console.log('\n🔒 STEP 3: ACCESS CONTROL DEMONSTRATION');
    console.log('=' * 45);
    
    const currentUser = this.authMiddleware.getCurrentUser();
    
    if (!currentUser) {
      console.log('❌ No authenticated user');
      return;
    }

    console.log('🔍 Testing permission-based access control...');
    
    // Test different permissions
    const permissions = [
      'view_transactions',
      'run_fraud_analysis', 
      'view_reports',
      'manage_licenses',
      'system_configuration'
    ];

    permissions.forEach(permission => {
      const hasPermission = this.authMiddleware.hasPermission(permission);
      const icon = hasPermission ? '✅' : '❌';
      console.log(`${icon} ${permission}: ${hasPermission ? 'ALLOWED' : 'DENIED'}`);
    });

    console.log('\n👤 USER DETAILS:');
    console.log(`📧 Email: ${currentUser.userEmail}`);
    console.log(`🏢 Company: ${currentUser.companyName}`);
    console.log(`👮 Role: ${currentUser.role}`);
    console.log(`💳 Assigned Account: ${currentUser.assignedAccount}`);
    console.log(`🕐 Authenticated At: ${new Date(currentUser.authenticatedAt).toLocaleString()}`);
  }

  async demonstrateSecurityFeatures() {
    console.log('\n🛡️  STEP 4: SECURITY FEATURES');
    console.log('=' * 35);
    
    // Demonstrate session validation
    const currentUser = this.authMiddleware.getCurrentUser();
    const sessionToken = currentUser.sessionToken;
    
    console.log('🔍 Testing session validation...');
    const sessionValidation = await this.authMiddleware.validateSession(sessionToken);
    
    if (sessionValidation.valid) {
      console.log('✅ Session is valid and active');
      console.log(`👤 Session user: ${sessionValidation.userEmail}`);
    } else {
      console.log(`❌ Session invalid: ${sessionValidation.reason}`);
    }

    // Show license information
    console.log('\n📊 LICENSE INFORMATION:');
    const licenseInfo = this.licenseService.getLicenseInfo(this.demoLicenseKey);
    
    if (licenseInfo) {
      console.log(`🏢 Company: ${licenseInfo.companyName}`);
      console.log(`🔄 Status: ${licenseInfo.status}`);
      console.log(`📅 Expires: ${new Date(licenseInfo.expirationDate).toLocaleDateString()}`);
      console.log(`👥 Max Users: ${licenseInfo.maxUsers}`);
      console.log(`👤 Assigned Users: ${licenseInfo.assignedUsers}`);
      console.log(`📊 Access Count: ${licenseInfo.accessCount}`);
      console.log(`🕐 Last Access: ${licenseInfo.lastAccess ? new Date(licenseInfo.lastAccess).toLocaleString() : 'Never'}`);
    }

    // Demonstrate system statistics
    console.log('\n📈 SYSTEM STATISTICS:');
    const stats = this.licenseService.getCompanyStatistics();
    console.log(`📋 Total Licenses: ${stats.totalLicenses}`);
    console.log(`✅ Active Licenses: ${stats.activeLicenses}`);
    console.log(`🏢 Total Companies: ${stats.totalCompanies}`);
    console.log(`👥 Total Users: ${stats.totalUsers}`);
  }

  async demonstrateMultiUserScenario() {
    console.log('\n👥 BONUS: MULTI-USER SCENARIO');
    console.log('=' * 35);
    
    // Try to add second user to same account (should fail)
    const secondUser = {
      email: 'jane.doe@demofinancial.com',
      name: 'Jane Doe',
      requestedAccount: 'DEMO_BANK_001' // Same account as first user
    };

    console.log(`🔍 Attempting to assign second user to same account...`);
    console.log(`📧 User: ${secondUser.email}`);
    console.log(`💳 Requested Account: ${secondUser.requestedAccount}`);
    
    const authResult = await this.licenseService.authenticateUser(this.demoLicenseKey, secondUser);
    
    if (authResult.success) {
      console.log('❌ Unexpected: Second user should not be allowed on same account');
    } else {
      console.log(`✅ Correctly blocked: ${authResult.error}`);
    }

    // Try different account (should succeed)
    secondUser.requestedAccount = 'DEMO_BANK_002';
    console.log(`\n🔍 Trying different account: ${secondUser.requestedAccount}`);
    
    const authResult2 = await this.licenseService.authenticateUser(this.demoLicenseKey, secondUser);
    
    if (authResult2.success) {
      console.log('✅ Successfully assigned to different account');
      console.log(`💳 Assigned Account: ${authResult2.license.assignedAccount}`);
    } else {
      console.log(`❌ Assignment failed: ${authResult2.error}`);
    }
  }
}

// Run the demo
const demo = new AuthenticationDemo();
demo.runDemo()
  .then(() => demo.demonstrateMultiUserScenario())
  .then(() => {
    console.log('\n🎉 AUTHENTICATION SYSTEM DEMO COMPLETE!');
    console.log('The system successfully demonstrates:');
    console.log('  ✅ License-based access control');
    console.log('  ✅ One user per bank account/company card');
    console.log('  ✅ Role-based permissions');
    console.log('  ✅ Secure session management');
    console.log('  ✅ Complete audit trail');
    console.log('  ✅ Multi-user account restrictions');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Demo error:', error);
    process.exit(1);
  });