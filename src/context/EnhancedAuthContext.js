import React, { createContext, useContext, useState, useEffect } from 'react';
import { Alert } from 'react-native';
import SecurityUtils from '../utils/SecurityUtils';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingVerification, setPendingVerification] = useState(null);

  // Enhanced user database with company assignments and admin roles
  const userDatabase = {
    // Admin users
    'admin@oqualtix.com': {
      id: 'admin_001',
      email: 'admin@oqualtix.com',
      password: 'AdminPass123!', // In real app, this would be hashed
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      isAdmin: true,
      company: 'Oqualtix Forensics',
      companyId: 'oqualtix_admin',
      accessLevel: 'GLOBAL', // Can see all companies
      verificationStatus: 'VERIFIED',
      termsAccepted: true,
      termsAcceptedDate: '2024-01-01T00:00:00.000Z',
      createdAt: '2024-01-01T00:00:00.000Z',
      lastLogin: null,
      permissions: ['READ_ALL', 'WRITE_ALL', 'ADMIN_PANEL', 'USER_MANAGEMENT']
    },
    'support@oqualtix.com': {
      id: 'admin_002',
      email: 'support@oqualtix.com',
      password: 'SupportPass123!',
      firstName: 'Support',
      lastName: 'Admin',
      role: 'SUPPORT_ADMIN',
      isAdmin: true,
      company: 'Oqualtix Forensics',
      companyId: 'oqualtix_admin',
      accessLevel: 'GLOBAL',
      verificationStatus: 'VERIFIED',
      termsAccepted: true,
      termsAcceptedDate: '2024-01-01T00:00:00.000Z',
      createdAt: '2024-01-01T00:00:00.000Z',
      lastLogin: null,
      permissions: ['READ_ALL', 'SUPPORT_TOOLS', 'USER_ASSISTANCE']
    },
    
    // Company A users
    'john.doe@companyA.com': {
      id: 'user_001',
      email: 'john.doe@companyA.com',
      password: 'UserPass123!',
      firstName: 'John',
      lastName: 'Doe',
      role: 'COMPANY_USER',
      isAdmin: false,
      company: 'Company A Corp',
      companyId: 'company_a',
      accessLevel: 'COMPANY_ONLY',
      verificationStatus: 'VERIFIED',
      termsAccepted: true,
      termsAcceptedDate: '2024-01-10T00:00:00.000Z',
      createdAt: '2024-01-10T00:00:00.000Z',
      lastLogin: null,
      permissions: ['READ_COMPANY', 'WRITE_COMPANY']
    },
    'jane.smith@companyA.com': {
      id: 'user_002',
      email: 'jane.smith@companyA.com',
      password: 'UserPass123!',
      firstName: 'Jane',
      lastName: 'Smith',
      role: 'COMPANY_MANAGER',
      isAdmin: false,
      company: 'Company A Corp',
      companyId: 'company_a',
      accessLevel: 'COMPANY_ONLY',
      verificationStatus: 'VERIFIED',
      termsAccepted: true,
      termsAcceptedDate: '2024-01-11T00:00:00.000Z',
      createdAt: '2024-01-11T00:00:00.000Z',
      lastLogin: null,
      permissions: ['READ_COMPANY', 'WRITE_COMPANY', 'MANAGE_COMPANY_USERS']
    },
    
    // Company B users
    'mike.wilson@companyB.com': {
      id: 'user_003',
      email: 'mike.wilson@companyB.com',
      password: 'UserPass123!',
      firstName: 'Mike',
      lastName: 'Wilson',
      role: 'COMPANY_USER',
      isAdmin: false,
      company: 'Company B Industries',
      companyId: 'company_b',
      accessLevel: 'COMPANY_ONLY',
      verificationStatus: 'VERIFIED',
      termsAccepted: true,
      termsAcceptedDate: '2024-01-12T00:00:00.000Z',
      createdAt: '2024-01-12T00:00:00.000Z',
      lastLogin: null,
      permissions: ['READ_COMPANY', 'WRITE_COMPANY']
    },
    'sarah.johnson@companyB.com': {
      id: 'user_004',
      email: 'sarah.johnson@companyB.com',
      password: 'UserPass123!',
      firstName: 'Sarah',
      lastName: 'Johnson',
      role: 'COMPANY_USER',
      isAdmin: false,
      company: 'Company B Industries',
      companyId: 'company_b',
      accessLevel: 'COMPANY_ONLY',
      verificationStatus: 'PENDING', // Pending verification example
      termsAccepted: false,
      termsAcceptedDate: null,
      createdAt: '2024-01-13T00:00:00.000Z',
      lastLogin: null,
      permissions: ['READ_COMPANY']
    }
  };

  // Company database for admin access
  const companyDatabase = {
    'company_a': {
      id: 'company_a',
      name: 'Company A Corp',
      industry: 'Technology',
      employees: ['user_001', 'user_002'],
      subscription: 'PREMIUM',
      status: 'ACTIVE',
      createdAt: '2024-01-01T00:00:00.000Z'
    },
    'company_b': {
      id: 'company_b',
      name: 'Company B Industries',
      industry: 'Manufacturing',
      employees: ['user_003', 'user_004'],
      subscription: 'STANDARD',
      status: 'ACTIVE',
      createdAt: '2024-01-02T00:00:00.000Z'
    },
    'oqualtix_admin': {
      id: 'oqualtix_admin',
      name: 'Oqualtix Forensics',
      industry: 'Financial Technology',
      employees: ['admin_001', 'admin_002'],
      subscription: 'ENTERPRISE',
      status: 'ACTIVE',
      createdAt: '2024-01-01T00:00:00.000Z'
    }
  };

  useEffect(() => {
    // Check for existing session
    checkExistingSession();
  }, []);

  const checkExistingSession = async () => {
    try {
      // In a real app, this would check for stored tokens
      const storedUser = localStorage.getItem('oqualtix_user');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        if (userData.verificationStatus === 'VERIFIED' && userData.termsAccepted) {
          setUser(userData);
        }
      }
    } catch (error) {
      console.error('Session check error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendVerificationEmail = async (email, verificationCode) => {
    try {
      // Simulate sending email via oqualtix@outlook.com
      console.log(`
🔐 VERIFICATION EMAIL SENT
==========================================
From: oqualtix@outlook.com
To: ${email}
Subject: Verify Your Oqualtix Account

Dear User,

Please DO NOT respond to this email as this is an automated message. 

To complete your account verification, please click the link below:

[VERIFY ACCOUNT - Code: ${verificationCode}]

This verification code will expire in 10 minutes.

Best regards,
Oqualtix Forensics Team

==========================================
      `);
      
      return { success: true, message: 'Verification email sent successfully' };
    } catch (error) {
      console.error('Email sending error:', error);
      return { success: false, message: 'Failed to send verification email' };
    }
  };

  const login = async (email, password, termsAccepted = false) => {
    try {
      setIsLoading(true);
      
      // Validate input
      const validation = SecurityUtils.validateInput(email, 'email');
      if (!validation.isValid) {
        throw new Error(validation.message);
      }
      
      // Check if user exists in database
      const userData = userDatabase[email.toLowerCase()];
      if (!userData) {
        throw new Error('Invalid email or password');
      }
      
      // Verify password (in real app, would compare hashed passwords)
      if (userData.password !== password) {
        throw new Error('Invalid email or password');
      }
      
      // Check terms acceptance
      if (!termsAccepted && !userData.termsAccepted) {
        throw new Error('You must accept the terms and conditions to continue');
      }
      
      // Generate verification code for email verification
      const verificationCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      
      // Send verification email
      const emailResult = await sendVerificationEmail(email, verificationCode);
      if (!emailResult.success) {
        throw new Error('Failed to send verification email');
      }
      
      // Store pending verification
      setPendingVerification({
        ...userData,
        verificationCode,
        verificationExpiry: Date.now() + (10 * 60 * 1000), // 10 minutes
        termsAcceptedInSession: termsAccepted
      });
      
      return {
        success: true,
        requiresVerification: true,
        message: 'Verification email sent. Please check your inbox.'
      };
      
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: error.message || 'Login failed'
      };
    } finally {
      setIsLoading(false);
    }
  };

  const verifyEmail = async (verificationCode) => {
    try {
      if (!pendingVerification) {
        throw new Error('No pending verification found');
      }
      
      if (Date.now() > pendingVerification.verificationExpiry) {
        throw new Error('Verification code has expired');
      }
      
      if (verificationCode.toUpperCase() !== pendingVerification.verificationCode) {
        throw new Error('Invalid verification code');
      }
      
      // Update user data
      const verifiedUser = {
        ...pendingVerification,
        verificationStatus: 'VERIFIED',
        lastLogin: new Date().toISOString(),
        termsAccepted: pendingVerification.termsAcceptedInSession || pendingVerification.termsAccepted,
        termsAcceptedDate: pendingVerification.termsAcceptedInSession ? new Date().toISOString() : pendingVerification.termsAcceptedDate
      };
      
      // Update database (in real app, this would be API call)
      userDatabase[verifiedUser.email] = verifiedUser;
      
      // Store session
      localStorage.setItem('oqualtix_user', JSON.stringify(verifiedUser));
      
      setUser(verifiedUser);
      setPendingVerification(null);
      
      // Log successful login
      await SecurityUtils.logSecurityEvent({
        type: 'USER_LOGIN_SUCCESS',
        userId: verifiedUser.id,
        details: {
          email: verifiedUser.email,
          role: verifiedUser.role,
          company: verifiedUser.company
        }
      });
      
      return {
        success: true,
        message: 'Email verified successfully'
      };
      
    } catch (error) {
      console.error('Verification error:', error);
      return {
        success: false,
        message: error.message || 'Verification failed'
      };
    }
  };

  const logout = async () => {
    try {
      // Log logout event
      if (user) {
        await SecurityUtils.logSecurityEvent({
          type: 'USER_LOGOUT',
          userId: user.id,
          details: { email: user.email }
        });
      }
      
      // Clear session
      localStorage.removeItem('oqualtix_user');
      setUser(null);
      setPendingVerification(null);
      
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const createUser = async (userData, termsAccepted = false) => {
    try {
      if (!termsAccepted) {
        throw new Error('You must accept the terms and conditions to create an account');
      }
      
      // Validate email
      const validation = SecurityUtils.validateInput(userData.email, 'email');
      if (!validation.isValid) {
        throw new Error(validation.message);
      }
      
      // Check if user already exists
      if (userDatabase[userData.email.toLowerCase()]) {
        throw new Error('User with this email already exists');
      }
      
      // Create new user
      const newUser = {
        id: `user_${Date.now()}`,
        email: userData.email.toLowerCase(),
        password: userData.password, // In real app, would be hashed
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: 'COMPANY_USER',
        isAdmin: false,
        company: userData.company,
        companyId: userData.companyId || 'company_new',
        accessLevel: 'COMPANY_ONLY',
        verificationStatus: 'PENDING',
        termsAccepted: true,
        termsAcceptedDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        lastLogin: null,
        permissions: ['READ_COMPANY']
      };
      
      // Add to database
      userDatabase[newUser.email] = newUser;
      
      return {
        success: true,
        message: 'Account created successfully. Please verify your email.'
      };
      
    } catch (error) {
      console.error('User creation error:', error);
      return {
        success: false,
        message: error.message || 'Failed to create account'
      };
    }
  };

  // Admin function to get all users and companies
  const getAllUsersAndCompanies = () => {
    if (!user || !user.isAdmin) {
      throw new Error('Unauthorized: Admin access required');
    }
    
    return {
      users: Object.values(userDatabase),
      companies: Object.values(companyDatabase)
    };
  };

  // Get users for a specific company (for company managers)
  const getCompanyUsers = (companyId) => {
    if (!user) return [];
    
    // Admin can see all companies
    if (user.isAdmin) {
      return Object.values(userDatabase).filter(userData => userData.companyId === companyId);
    }
    
    // Regular users can only see their own company
    if (user.companyId === companyId) {
      return Object.values(userDatabase).filter(userData => userData.companyId === companyId);
    }
    
    return [];
  };

  // Get company data based on user access level
  const getAccessibleCompanies = () => {
    if (!user) return [];
    
    if (user.isAdmin) {
      return Object.values(companyDatabase);
    }
    
    return Object.values(companyDatabase).filter(company => company.id === user.companyId);
  };

  // Admin function to delete a user
  const deleteUser = (userIdToDelete) => {
    if (!user || !user.isAdmin) {
      throw new Error('Unauthorized: Admin access required');
    }

    // Find user to delete
    const userToDelete = Object.values(userDatabase).find(userData => userData.id === userIdToDelete);
    if (!userToDelete) {
      return false;
    }

    // Prevent admin from deleting themselves
    if (userIdToDelete === user.id) {
      throw new Error('Cannot delete your own account');
    }

    // Find and remove user from userDatabase
    const userEmailToDelete = userToDelete.email;
    if (userDatabase[userEmailToDelete]) {
      delete userDatabase[userEmailToDelete];
      
      // Log the deletion for audit purposes
      console.log(`[AUDIT] User deleted: ${userToDelete.firstName} ${userToDelete.lastName} (${userToDelete.email}) by admin: ${user.email} at ${new Date().toISOString()}`);
      
      // Security logging
      SecurityUtils.logSecurityEvent({
        type: 'USER_DELETED',
        adminUserId: user.id,
        adminEmail: user.email,
        deletedUserId: userIdToDelete,
        deletedUserEmail: userToDelete.email,
        timestamp: new Date().toISOString(),
        ipAddress: 'localhost', // In real app, get actual IP
        userAgent: 'Oqualtix Mobile App'
      });

      return true;
    }

    return false;
  };

  const value = {
    user,
    isLoading,
    pendingVerification,
    login,
    verifyEmail,
    logout,
    createUser,
    deleteUser,
    getAllUsersAndCompanies,
    getCompanyUsers,
    getAccessibleCompanies,
    // Helper functions
    isAdmin: () => user?.isAdmin || false,
    canAccessCompany: (companyId) => user?.isAdmin || user?.companyId === companyId,
    hasPermission: (permission) => user?.permissions?.includes(permission) || false
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Export with alias for enhanced features
export const EnhancedAuthProvider = AuthProvider;