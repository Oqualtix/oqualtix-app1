import React, { createContext, useState, useContext, useEffect } from 'react';
// For demo purposes, we'll use a simple state management instead of AsyncStorage
// In a real app, you would use @react-native-async-storage/async-storage
import { ValidationUtils, EncryptionUtils, SessionUtils, AuditUtils } from '../utils/SecurityUtils';

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
  const [loading, setLoading] = useState(true);

  // Mock user database - in a real app, this would be a backend service
  const mockUsers = {
    'admin@oqualtix.com': {
      id: '1',
      email: 'admin@oqualtix.com',
      password: 'admin123',
      name: 'Admin User',
      phone: '+1-555-0123',
      role: 'admin',
    },
    'user@oqualtix.com': {
      id: '2',
      email: 'user@oqualtix.com',
      password: 'user123',
      name: 'Regular User',
      phone: '+1-555-0456',
      role: 'user',
    },
  };

  const [userDatabase, setUserDatabase] = useState(mockUsers);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      // For demo purposes, we'll skip persistent storage
      // In a real app, you would check AsyncStorage here
      setLoading(false);
    } catch (error) {
      console.error('Error checking auth status:', error);
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    // Validate inputs
    const emailValidation = ValidationUtils.validateEmail(email);
    if (!emailValidation.isValid) {
      return { success: false, error: emailValidation.error };
    }

    const passwordValidation = ValidationUtils.validatePassword(password);
    if (!passwordValidation.isValid) {
      return { success: false, error: passwordValidation.error };
    }

    // Check if user is locked out
    if (SessionUtils.isLockedOut(email)) {
      AuditUtils.logSecurityEvent('LOGIN_ATTEMPT_WHILE_LOCKED', { email });
      return { success: false, error: 'Account temporarily locked due to too many failed attempts' };
    }

    const foundUser = userDatabase[email];
    
    if (foundUser && foundUser.password === password) {
      // Clear failed attempts
      SessionUtils.clearAttempts(email);
      
      // Create session
      const session = SessionUtils.createSession(foundUser);
      
      const userInfo = {
        id: foundUser.id,
        email: foundUser.email,
        name: foundUser.name,
        phone: foundUser.phone,
        role: foundUser.role,
        session: session
      };
      
      // Log successful login
      AuditUtils.logSecurityEvent('LOGIN_SUCCESS', { 
        userId: foundUser.id, 
        email: foundUser.email,
        sessionId: session.sessionId
      });
      
      // For demo purposes, we'll just set the user state
      // In a real app, you would save to AsyncStorage here
      setUser(userInfo);
      return { success: true };
    } else {
      // Record failed attempt
      SessionUtils.recordFailedAttempt(email);
      
      // Log failed login
      AuditUtils.logSecurityEvent('LOGIN_FAILED', { 
        email: email,
        reason: 'Invalid credentials'
      });
      
      return { success: false, error: 'Invalid email or password' };
    }
  };

  const logout = async () => {
    // For demo purposes, we'll just clear the user state
    // In a real app, you would remove from AsyncStorage here
    setUser(null);
  };

  const updateProfile = async (updatedInfo) => {
    const updatedUser = { ...user, ...updatedInfo };
    
    // Update in mock database
    setUserDatabase(prev => ({
      ...prev,
      [user.email]: { ...prev[user.email], ...updatedInfo }
    }));
    
    // For demo purposes, we'll just update the user state
    // In a real app, you would save to AsyncStorage here
    setUser(updatedUser);
    
    return { success: true };
  };

  const createUser = async (userData) => {
    if (user?.role !== 'admin') {
      return { success: false, error: 'Only admins can create users' };
    }

    // Validate all inputs
    const nameValidation = ValidationUtils.validateName(userData.name);
    if (!nameValidation.isValid) {
      return { success: false, error: nameValidation.error };
    }

    const emailValidation = ValidationUtils.validateEmail(userData.email);
    if (!emailValidation.isValid) {
      return { success: false, error: emailValidation.error };
    }

    const passwordValidation = ValidationUtils.validatePassword(userData.password);
    if (!passwordValidation.isValid) {
      return { success: false, error: passwordValidation.error };
    }

    const phoneValidation = ValidationUtils.validatePhone(userData.phone);
    if (!phoneValidation.isValid) {
      return { success: false, error: phoneValidation.error };
    }

    if (userDatabase[userData.email]) {
      return { success: false, error: 'User already exists' };
    }

    // Hash password (in demo, we'll just store plaintext)
    // In production: const hashedPassword = EncryptionUtils.hashPassword(userData.password);
    
    const newUser = {
      id: Date.now().toString(),
      name: ValidationUtils.sanitizeInput(userData.name),
      email: userData.email.toLowerCase(),
      password: userData.password, // In production, use hashedPassword
      phone: userData.phone,
      role: userData.role,
      createdAt: new Date().toISOString(),
      createdBy: user.id
    };

    setUserDatabase(prev => ({
      ...prev,
      [userData.email]: newUser
    }));

    // Log user creation
    AuditUtils.logSecurityEvent('USER_CREATED', {
      newUserId: newUser.id,
      newUserEmail: newUser.email,
      newUserRole: newUser.role,
      createdBy: user.id
    });

    return { success: true, message: 'User created successfully' };
  };

  const getAllUsers = () => {
    if (user?.role !== 'admin') {
      return [];
    }
    return Object.values(userDatabase);
  };

  const deleteUser = async (email) => {
    if (user?.role !== 'admin') {
      return { success: false, error: 'Only admins can delete users' };
    }

    if (email === user.email) {
      return { success: false, error: 'Cannot delete your own account' };
    }

    setUserDatabase(prev => {
      const newDb = { ...prev };
      delete newDb[email];
      return newDb;
    });

    return { success: true, message: 'User deleted successfully' };
  };

  const value = {
    user,
    loading,
    login,
    logout,
    updateProfile,
    createUser,
    getAllUsers,
    deleteUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};