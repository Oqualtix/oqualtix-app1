import CryptoJS from 'crypto-js';
import validator from 'validator';

// Security configuration
const SECURITY_CONFIG = {
  // Encryption key - in production, this should be from secure environment variables
  ENCRYPTION_KEY: 'OqualtixSecureKey2024!@#$%^&*()',
  
  // Password requirements
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_REQUIRE_UPPERCASE: true,
  PASSWORD_REQUIRE_LOWERCASE: true,
  PASSWORD_REQUIRE_NUMBERS: true,
  PASSWORD_REQUIRE_SPECIAL: true,
  
  // Session management
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes
  
  // Rate limiting
  API_RATE_LIMIT: 100, // requests per minute
  AI_RATE_LIMIT: 20, // AI requests per minute
};

// Input validation utilities
export const ValidationUtils = {
  // Email validation
  validateEmail: (email) => {
    if (!email) return { isValid: false, error: 'Email is required' };
    if (!validator.isEmail(email)) {
      return { isValid: false, error: 'Please enter a valid email address' };
    }
    if (email.length > 254) {
      return { isValid: false, error: 'Email address is too long' };
    }
    return { isValid: true };
  },

  // Password validation
  validatePassword: (password) => {
    if (!password) return { isValid: false, error: 'Password is required' };
    
    if (password.length < SECURITY_CONFIG.PASSWORD_MIN_LENGTH) {
      return { 
        isValid: false, 
        error: `Password must be at least ${SECURITY_CONFIG.PASSWORD_MIN_LENGTH} characters long` 
      };
    }
    
    if (SECURITY_CONFIG.PASSWORD_REQUIRE_UPPERCASE && !/[A-Z]/.test(password)) {
      return { isValid: false, error: 'Password must contain at least one uppercase letter' };
    }
    
    if (SECURITY_CONFIG.PASSWORD_REQUIRE_LOWERCASE && !/[a-z]/.test(password)) {
      return { isValid: false, error: 'Password must contain at least one lowercase letter' };
    }
    
    if (SECURITY_CONFIG.PASSWORD_REQUIRE_NUMBERS && !/\d/.test(password)) {
      return { isValid: false, error: 'Password must contain at least one number' };
    }
    
    if (SECURITY_CONFIG.PASSWORD_REQUIRE_SPECIAL && !/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
      return { isValid: false, error: 'Password must contain at least one special character' };
    }
    
    return { isValid: true };
  },

  // Name validation
  validateName: (name) => {
    if (!name) return { isValid: false, error: 'Name is required' };
    if (name.length < 2) return { isValid: false, error: 'Name must be at least 2 characters' };
    if (name.length > 50) return { isValid: false, error: 'Name must be less than 50 characters' };
    if (!/^[a-zA-Z\s'-]+$/.test(name)) {
      return { isValid: false, error: 'Name can only contain letters, spaces, hyphens, and apostrophes' };
    }
    return { isValid: true };
  },

  // Phone validation
  validatePhone: (phone) => {
    if (!phone) return { isValid: true }; // Phone is optional
    if (!validator.isMobilePhone(phone)) {
      return { isValid: false, error: 'Please enter a valid phone number' };
    }
    return { isValid: true };
  },

  // Sanitize input to prevent XSS
  sanitizeInput: (input) => {
    if (typeof input !== 'string') return input;
    return validator.escape(input);
  },

  // Validate file uploads
  validateFile: (file) => {
    const allowedTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv',
      'application/pdf'
    ];
    
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    if (!allowedTypes.includes(file.mimeType)) {
      return { 
        isValid: false, 
        error: 'File type not allowed. Please upload Excel, CSV, or PDF files only.' 
      };
    }
    
    if (file.size > maxSize) {
      return { 
        isValid: false, 
        error: 'File size too large. Maximum size is 10MB.' 
      };
    }
    
    return { isValid: true };
  }
};

// Encryption utilities
export const EncryptionUtils = {
  // Hash password
  hashPassword: (password) => {
    const salt = CryptoJS.lib.WordArray.random(128/8);
    const hash = CryptoJS.PBKDF2(password, salt, {
      keySize: 256/32,
      iterations: 10000
    });
    return {
      salt: salt.toString(),
      hash: hash.toString()
    };
  },

  // Verify password
  verifyPassword: (password, storedHash, storedSalt) => {
    const salt = CryptoJS.enc.Hex.parse(storedSalt);
    const hash = CryptoJS.PBKDF2(password, salt, {
      keySize: 256/32,
      iterations: 10000
    });
    return hash.toString() === storedHash;
  },

  // Encrypt sensitive data
  encryptData: (data) => {
    try {
      const encrypted = CryptoJS.AES.encrypt(
        JSON.stringify(data), 
        SECURITY_CONFIG.ENCRYPTION_KEY
      ).toString();
      return encrypted;
    } catch (error) {
      console.error('Encryption error:', error);
      return null;
    }
  },

  // Decrypt sensitive data
  decryptData: (encryptedData) => {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedData, SECURITY_CONFIG.ENCRYPTION_KEY);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);
      return JSON.parse(decrypted);
    } catch (error) {
      console.error('Decryption error:', error);
      return null;
    }
  },

  // Generate secure tokens
  generateSecureToken: () => {
    return CryptoJS.lib.WordArray.random(32).toString();
  }
};

// Session management utilities
export const SessionUtils = {
  // Track login attempts
  loginAttempts: new Map(),

  // Check if user is locked out
  isLockedOut: (identifier) => {
    const attempts = SessionUtils.loginAttempts.get(identifier);
    if (!attempts) return false;
    
    if (attempts.count >= SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS) {
      const timeSinceLockout = Date.now() - attempts.lastAttempt;
      return timeSinceLockout < SECURITY_CONFIG.LOCKOUT_DURATION;
    }
    
    return false;
  },

  // Record failed login attempt
  recordFailedAttempt: (identifier) => {
    const current = SessionUtils.loginAttempts.get(identifier) || { count: 0, lastAttempt: 0 };
    current.count += 1;
    current.lastAttempt = Date.now();
    SessionUtils.loginAttempts.set(identifier, current);
  },

  // Clear login attempts on successful login
  clearAttempts: (identifier) => {
    SessionUtils.loginAttempts.delete(identifier);
  },

  // Generate session data
  createSession: (user) => {
    return {
      userId: user.id,
      email: user.email,
      role: user.role,
      sessionId: EncryptionUtils.generateSecureToken(),
      createdAt: Date.now(),
      expiresAt: Date.now() + SECURITY_CONFIG.SESSION_TIMEOUT,
      lastActivity: Date.now()
    };
  },

  // Validate session
  isSessionValid: (session) => {
    if (!session) return false;
    return Date.now() < session.expiresAt;
  },

  // Update session activity
  updateActivity: (session) => {
    if (session) {
      session.lastActivity = Date.now();
      session.expiresAt = Date.now() + SECURITY_CONFIG.SESSION_TIMEOUT;
    }
    return session;
  }
};

// Rate limiting utilities
export const RateLimitUtils = {
  requests: new Map(),

  // Check if request is within rate limits
  checkRateLimit: (identifier, limit = SECURITY_CONFIG.API_RATE_LIMIT) => {
    const now = Date.now();
    const windowStart = now - 60000; // 1 minute window
    
    const userRequests = RateLimitUtils.requests.get(identifier) || [];
    
    // Remove old requests outside the window
    const recentRequests = userRequests.filter(timestamp => timestamp > windowStart);
    
    if (recentRequests.length >= limit) {
      return { allowed: false, retryAfter: 60 };
    }
    
    // Add current request
    recentRequests.push(now);
    RateLimitUtils.requests.set(identifier, recentRequests);
    
    return { allowed: true, remaining: limit - recentRequests.length };
  }
};

// Audit logging utilities
export const AuditUtils = {
  logs: [],

  // Log security events
  logSecurityEvent: (event, details = {}) => {
    const logEntry = {
      id: EncryptionUtils.generateSecureToken(),
      timestamp: new Date().toISOString(),
      event,
      details,
      severity: AuditUtils.getEventSeverity(event),
      userAgent: navigator?.userAgent || 'Unknown'
    };
    
    AuditUtils.logs.push(logEntry);
    
    // Keep only last 1000 logs to prevent memory issues
    if (AuditUtils.logs.length > 1000) {
      AuditUtils.logs = AuditUtils.logs.slice(-1000);
    }
    
    console.log('Security Event:', logEntry);
    return logEntry;
  },

  // Get event severity
  getEventSeverity: (event) => {
    const highSeverityEvents = [
      'FAILED_LOGIN_ATTEMPT',
      'ACCOUNT_LOCKED',
      'UNAUTHORIZED_ACCESS',
      'DATA_BREACH_ATTEMPT'
    ];
    
    const mediumSeverityEvents = [
      'PASSWORD_CHANGE',
      'PROFILE_UPDATE',
      'FILE_UPLOAD',
      'USER_CREATED'
    ];
    
    if (highSeverityEvents.includes(event)) return 'HIGH';
    if (mediumSeverityEvents.includes(event)) return 'MEDIUM';
    return 'LOW';
  },

  // Get recent security events
  getRecentEvents: (limit = 50) => {
    return AuditUtils.logs
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);
  }
};

export default {
  ValidationUtils,
  EncryptionUtils,
  SessionUtils,
  RateLimitUtils,
  AuditUtils,
  SECURITY_CONFIG
};