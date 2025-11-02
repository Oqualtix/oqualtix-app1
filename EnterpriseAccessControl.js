// 🏢 ENTERPRISE LICENSING & ACCESS CONTROL SYSTEM
// Company-based licensing with admin control and user verification

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';

// 🏢 ENTERPRISE LICENSING MANAGER
export class EnterpriseLicensingManager {
  
  // Company license validation
  static async validateCompanyLicense(companyCode, userEmail) {
    try {
      // Get company licenses from storage
      const licensesData = await AsyncStorage.getItem('company_licenses');
      const licenses = licensesData ? JSON.parse(licensesData) : [];
      
      // Find company license
      const companyLicense = licenses.find(license => 
        license.companyCode.toLowerCase() === companyCode.toLowerCase() &&
        license.status === 'ACTIVE'
      );
      
      if (!companyLicense) {
        return { 
          valid: false, 
          error: 'Invalid company code or license expired' 
        };
      }
      
      // Check if user email is authorized
      const isAuthorizedEmail = this.checkEmailAuthorization(userEmail, companyLicense);
      
      if (!isAuthorizedEmail) {
        return { 
          valid: false, 
          error: 'Email not authorized for this company license' 
        };
      }
      
      // Check user limits
      if (companyLicense.currentUsers >= companyLicense.maxUsers) {
        return { 
          valid: false, 
          error: 'Company has reached maximum user limit' 
        };
      }
      
      return {
        valid: true,
        companyLicense,
        permissions: companyLicense.permissions || ['basic_fraud_detection']
      };
      
    } catch (error) {
      console.error('License validation failed:', error);
      return { 
        valid: false, 
        error: 'License validation system error' 
      };
    }
  }
  
  // Check email authorization
  static checkEmailAuthorization(userEmail, companyLicense) {
    // Check if email domain matches company domain
    if (companyLicense.allowedDomains && companyLicense.allowedDomains.length > 0) {
      const emailDomain = userEmail.split('@')[1]?.toLowerCase();
      return companyLicense.allowedDomains.some(domain => 
        domain.toLowerCase() === emailDomain
      );
    }
    
    // Check specific email whitelist
    if (companyLicense.authorizedEmails && companyLicense.authorizedEmails.length > 0) {
      return companyLicense.authorizedEmails.some(email => 
        email.toLowerCase() === userEmail.toLowerCase()
      );
    }
    
    // If no restrictions, allow all emails
    return true;
  }
  
  // Register user with company license
  static async registerUserWithLicense(companyCode, userEmail, userDetails) {
    try {
      const validation = await this.validateCompanyLicense(companyCode, userEmail);
      
      if (!validation.valid) {
        throw new Error(validation.error);
      }
      
      // Create user session
      const userSession = {
        userId: `USER_${Date.now()}`,
        email: userEmail,
        companyCode: companyCode,
        companyName: validation.companyLicense.companyName,
        permissions: validation.permissions,
        registeredAt: new Date().toISOString(),
        status: 'ACTIVE',
        tier: validation.companyLicense.tier || 'BUSINESS'
      };
      
      // Save user session
      await AsyncStorage.setItem('user_session', JSON.stringify(userSession));
      
      // Update company user count
      await this.incrementCompanyUserCount(companyCode);
      
      // Log registration
      await this.logUserRegistration(userSession);
      
      return {
        success: true,
        userSession
      };
      
    } catch (error) {
      console.error('User registration failed:', error);
      throw error;
    }
  }
  
  // Increment company user count
  static async incrementCompanyUserCount(companyCode) {
    try {
      const licensesData = await AsyncStorage.getItem('company_licenses');
      const licenses = licensesData ? JSON.parse(licensesData) : [];
      
      const licenseIndex = licenses.findIndex(l => l.companyCode === companyCode);
      if (licenseIndex !== -1) {
        licenses[licenseIndex].currentUsers = (licenses[licenseIndex].currentUsers || 0) + 1;
        await AsyncStorage.setItem('company_licenses', JSON.stringify(licenses));
      }
    } catch (error) {
      console.error('Failed to update user count:', error);
    }
  }
  
  // Log user registration for admin tracking
  static async logUserRegistration(userSession) {
    try {
      const logsData = await AsyncStorage.getItem('user_registration_logs');
      const logs = logsData ? JSON.parse(logsData) : [];
      
      logs.unshift({
        id: Date.now().toString(),
        userId: userSession.userId,
        email: userSession.email,
        companyCode: userSession.companyCode,
        timestamp: new Date().toISOString(),
        action: 'USER_REGISTERED'
      });
      
      // Keep only last 1000 logs
      const trimmedLogs = logs.slice(0, 1000);
      await AsyncStorage.setItem('user_registration_logs', JSON.stringify(trimmedLogs));
      
    } catch (error) {
      console.error('Failed to log user registration:', error);
    }
  }
}

// 👨‍💼 COMPANY LICENSE CREATION (ADMIN FUNCTIONS)
export class CompanyLicenseManager {
  
  // Create new company license (admin only)
  static async createCompanyLicense(licenseData) {
    try {
      const newLicense = {
        id: `LIC_${Date.now()}`,
        companyCode: await this.generateCompanyCode(licenseData.companyName),
        companyName: licenseData.companyName,
        contactEmail: licenseData.contactEmail,
        tier: licenseData.tier || 'BUSINESS',
        maxUsers: licenseData.maxUsers || 50,
        currentUsers: 0,
        permissions: this.getTierPermissions(licenseData.tier),
        allowedDomains: licenseData.allowedDomains || [],
        authorizedEmails: licenseData.authorizedEmails || [],
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
        expiresAt: licenseData.expiresAt || this.getDefaultExpiration(),
        monthlyFee: this.getTierPricing(licenseData.tier),
        features: this.getTierFeatures(licenseData.tier)
      };
      
      // Save license
      const licensesData = await AsyncStorage.getItem('company_licenses');
      const licenses = licensesData ? JSON.parse(licensesData) : [];
      licenses.push(newLicense);
      await AsyncStorage.setItem('company_licenses', JSON.stringify(licenses));
      
      return newLicense;
      
    } catch (error) {
      console.error('License creation failed:', error);
      throw new Error('Failed to create company license');
    }
  }
  
  // Generate unique company code
  static async generateCompanyCode(companyName) {
    const baseCode = companyName
      .toUpperCase()
      .replace(/[^A-Z]/g, '')
      .substring(0, 4)
      .padEnd(4, 'X');
    
    const timestamp = Date.now().toString().slice(-4);
    return `${baseCode}${timestamp}`;
  }
  
  // Get tier permissions
  static getTierPermissions(tier) {
    const permissions = {
      INDIVIDUAL: ['basic_fraud_detection', 'personal_analytics'],
      BUSINESS: ['basic_fraud_detection', 'personal_analytics', 'team_collaboration', 'advanced_analytics', 'reporting'],
      ENTERPRISE: ['all_features', 'api_access', 'white_labeling', 'custom_integrations', 'priority_support']
    };
    
    return permissions[tier] || permissions.BUSINESS;
  }
  
  // Get tier pricing (what companies pay you)
  static getTierPricing(tier) {
    const pricing = {
      INDIVIDUAL: 29,    // $29/month per company for individual tier
      BUSINESS: 99,      // $99/month per company for business tier  
      ENTERPRISE: 499    // $499/month per company for enterprise tier
    };
    
    return pricing[tier] || pricing.BUSINESS;
  }
  
  // Get tier features
  static getTierFeatures(tier) {
    const features = {
      INDIVIDUAL: {
        maxAnalyses: 100,
        supportLevel: 'Email',
        features: ['Basic Fraud Detection', 'Personal Dashboard']
      },
      BUSINESS: {
        maxAnalyses: 1000,
        supportLevel: 'Priority Email',
        features: ['Advanced Analytics', 'Team Collaboration', 'PDF Reports', 'Excel Export']
      },
      ENTERPRISE: {
        maxAnalyses: -1, // Unlimited
        supportLevel: 'Dedicated Account Manager',
        features: ['All Features', 'API Access', 'White Labeling', 'Custom Integrations']
      }
    };
    
    return features[tier] || features.BUSINESS;
  }
  
  // Get default expiration (1 year)
  static getDefaultExpiration() {
    const expDate = new Date();
    expDate.setFullYear(expDate.getFullYear() + 1);
    return expDate.toISOString();
  }
  
  // Get all company licenses (admin view)
  static async getAllLicenses() {
    try {
      const licensesData = await AsyncStorage.getItem('company_licenses');
      return licensesData ? JSON.parse(licensesData) : [];
    } catch (error) {
      console.error('Failed to get licenses:', error);
      return [];
    }
  }
  
  // Update license status
  static async updateLicenseStatus(licenseId, newStatus) {
    try {
      const licenses = await this.getAllLicenses();
      const licenseIndex = licenses.findIndex(l => l.id === licenseId);
      
      if (licenseIndex !== -1) {
        licenses[licenseIndex].status = newStatus;
        licenses[licenseIndex].updatedAt = new Date().toISOString();
        await AsyncStorage.setItem('company_licenses', JSON.stringify(licenses));
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Failed to update license:', error);
      return false;
    }
  }
  
  // Create demo licenses for testing
  static async createDemoLicenses() {
    const demoCompanies = [
      {
        companyName: 'Acme Financial Services',
        contactEmail: 'admin@acmefinancial.com',
        tier: 'BUSINESS',
        maxUsers: 25,
        allowedDomains: ['acmefinancial.com']
      },
      {
        companyName: 'SecureBank Corp',
        contactEmail: 'it@securebank.com',
        tier: 'ENTERPRISE',
        maxUsers: 100,
        allowedDomains: ['securebank.com']
      },
      {
        companyName: 'GlobeCredit Union',
        contactEmail: 'tech@globecredit.org',
        tier: 'BUSINESS',
        maxUsers: 50,
        allowedDomains: ['globecredit.org']
      }
    ];
    
    const createdLicenses = [];
    for (const company of demoCompanies) {
      try {
        const license = await this.createCompanyLicense(company);
        createdLicenses.push(license);
      } catch (error) {
        console.error('Failed to create demo license for', company.companyName);
      }
    }
    
    return createdLicenses;
  }
}

// 🔐 USER LOGIN & VERIFICATION COMPONENT
export const EnterpriseLoginScreen = ({ onLoginSuccess, theme }) => {
  const [step, setStep] = useState('company_code'); // 'company_code' or 'user_details'
  const [companyCode, setCompanyCode] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userFullName, setUserFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [companyInfo, setCompanyInfo] = useState(null);

  const handleCompanyCodeSubmit = async () => {
    if (!companyCode.trim()) {
      Alert.alert('Error', 'Please enter your company code');
      return;
    }

    setIsLoading(true);
    
    try {
      // Validate company code exists
      const licensesData = await AsyncStorage.getItem('company_licenses');
      const licenses = licensesData ? JSON.parse(licensesData) : [];
      
      const company = licenses.find(l => 
        l.companyCode.toLowerCase() === companyCode.toLowerCase() &&
        l.status === 'ACTIVE'
      );
      
      if (!company) {
        Alert.alert('Invalid Code', 'Company code not found or license inactive');
        setIsLoading(false);
        return;
      }
      
      setCompanyInfo(company);
      setStep('user_details');
      setIsLoading(false);
      
    } catch (error) {
      Alert.alert('Error', 'Failed to validate company code');
      setIsLoading(false);
    }
  };

  const handleUserRegistration = async () => {
    if (!userEmail.trim() || !userFullName.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userEmail)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    
    try {
      const userSession = await EnterpriseLicensingManager.registerUserWithLicense(
        companyCode,
        userEmail,
        { fullName: userFullName }
      );
      
      Alert.alert(
        'Welcome to Oqualtix!',
        `Successfully registered with ${companyInfo.companyName}.\nYou now have access to ${companyInfo.tier} tier features.`,
        [{ text: 'Continue', onPress: () => onLoginSuccess(userSession.userSession) }]
      );
      
    } catch (error) {
      Alert.alert('Registration Failed', error.message);
    }
    
    setIsLoading(false);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background[0] }]}>
      <View style={styles.loginContainer}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.logo, { color: theme.text }]}>🚀 Oqualtix Enterprise</Text>
          <Text style={[styles.subtitle, { color: theme.text }]}>
            Professional Fraud Detection Platform
          </Text>
        </View>

        {step === 'company_code' ? (
          // Step 1: Company Code Entry
          <View style={styles.formSection}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              🏢 Enter Your Company Code
            </Text>
            <Text style={[styles.helpText, { color: theme.text }]}>
              Your company administrator provided you with an access code
            </Text>
            
            <TextInput
              style={[styles.input, { backgroundColor: theme.card, color: theme.text }]}
              placeholder="Company Code (e.g., ACME2024)"
              placeholderTextColor={theme.text + '80'}
              value={companyCode}
              onChangeText={setCompanyCode}
              autoCapitalize="characters"
              autoCorrect={false}
            />
            
            <TouchableOpacity
              style={[styles.button, { backgroundColor: theme.accent }]}
              onPress={handleCompanyCodeSubmit}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>
                {isLoading ? 'Validating...' : 'Verify Company Code'}
              </Text>
            </TouchableOpacity>
            
            {/* Demo codes section */}
            <View style={styles.demoSection}>
              <Text style={[styles.demoTitle, { color: theme.text }]}>
                📋 Demo Company Codes:
              </Text>
              <Text style={[styles.demoCode, { color: theme.accent }]}>
                ACME1234 - Acme Financial (Business Tier)
              </Text>
              <Text style={[styles.demoCode, { color: theme.accent }]}>
                SECU5678 - SecureBank (Enterprise Tier)
              </Text>
              <Text style={[styles.demoCode, { color: theme.accent }]}>
                GLOB9012 - GlobeCredit (Business Tier)
              </Text>
            </View>
          </View>
        ) : (
          // Step 2: User Details Entry
          <View style={styles.formSection}>
            <View style={[styles.companyInfo, { backgroundColor: theme.card }]}>
              <Text style={[styles.companyName, { color: theme.success }]}>
                ✅ {companyInfo?.companyName}
              </Text>
              <Text style={[styles.tierInfo, { color: theme.text }]}>
                {companyInfo?.tier} License • {companyInfo?.currentUsers}/{companyInfo?.maxUsers} users
              </Text>
            </View>
            
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              👤 Create Your Account
            </Text>
            
            <TextInput
              style={[styles.input, { backgroundColor: theme.card, color: theme.text }]}
              placeholder="Full Name"
              placeholderTextColor={theme.text + '80'}
              value={userFullName}
              onChangeText={setUserFullName}
              autoCapitalize="words"
            />
            
            <TextInput
              style={[styles.input, { backgroundColor: theme.card, color: theme.text }]}
              placeholder="Email Address"
              placeholderTextColor={theme.text + '80'}
              value={userEmail}
              onChangeText={setUserEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.secondaryButton, { borderColor: theme.accent }]}
                onPress={() => setStep('company_code')}
              >
                <Text style={[styles.secondaryButtonText, { color: theme.accent }]}>
                  Back
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.button, { backgroundColor: theme.success, flex: 1, marginLeft: 10 }]}
                onPress={handleUserRegistration}
                disabled={isLoading}
              >
                <Text style={styles.buttonText}>
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.text }]}>
            🛡️ Bank-grade security • 📱 Local processing • 🏢 Enterprise ready
          </Text>
          <Text style={[styles.footerText, { color: theme.text }]}>
            Need help? Contact your company administrator
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

// 🎨 STYLES
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loginContainer: {
    padding: 30,
    justifyContent: 'center',
    minHeight: 600,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.8,
    textAlign: 'center',
  },
  formSection: {
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  helpText: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 20,
  },
  companyInfo: {
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    alignItems: 'center',
  },
  companyName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  tierInfo: {
    fontSize: 14,
    opacity: 0.8,
  },
  input: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  button: {
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  secondaryButton: {
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 2,
    flex: 0.3,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  demoSection: {
    marginTop: 30,
    padding: 20,
    borderRadius: 15,
    backgroundColor: 'rgba(0,123,255,0.1)',
  },
  demoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  demoCode: {
    fontSize: 14,
    marginBottom: 5,
    fontFamily: 'monospace',
  },
  footer: {
    alignItems: 'center',
    paddingTop: 30,
  },
  footerText: {
    fontSize: 12,
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: 5,
  },
});

export default {
  EnterpriseLicensingManager,
  CompanyLicenseManager,
  EnterpriseLoginScreen
};