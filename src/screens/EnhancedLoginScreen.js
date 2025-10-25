import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/EnhancedAuthContext';
import { TermsAndConditionsModal, TermsCheckbox } from '../components/TermsAndConditions';

const EnhancedLoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showCreateAccount, setShowCreateAccount] = useState(false);
  const [newUserData, setNewUserData] = useState({
    firstName: '',
    lastName: '',
    company: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const { login, verifyEmail, createUser, pendingVerification } = useAuth();

  // Pre-filled demo accounts for easy testing
  const demoAccounts = [
    { email: 'admin@oqualtix.com', password: 'AdminPass123!', role: 'Admin' },
    { email: 'john.doe@companyA.com', password: 'UserPass123!', role: 'Company A User' },
    { email: 'mike.wilson@companyB.com', password: 'UserPass123!', role: 'Company B User' }
  ];

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    if (!termsAccepted) {
      Alert.alert('Terms Required', 'You must accept the terms and conditions to continue');
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await login(email, password, termsAccepted);
      
      if (result.success && result.requiresVerification) {
        Alert.alert(
          'Verification Required',
          result.message + '\n\nFor demo purposes, the verification code will be shown in the console.',
          [{ text: 'OK' }]
        );
      } else if (!result.success) {
        Alert.alert('Login Failed', result.message);
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerification = async () => {
    if (!verificationCode) {
      Alert.alert('Error', 'Please enter the verification code');
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await verifyEmail(verificationCode);
      
      if (result.success) {
        Alert.alert('Success', 'Welcome to Oqualtix!');
      } else {
        Alert.alert('Verification Failed', result.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAccount = async () => {
    if (!newUserData.firstName || !newUserData.lastName || !newUserData.email || !newUserData.password) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (newUserData.password !== newUserData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (!termsAccepted) {
      Alert.alert('Terms Required', 'You must accept the terms and conditions to create an account');
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await createUser(newUserData, termsAccepted);
      
      if (result.success) {
        Alert.alert('Account Created', result.message);
        setShowCreateAccount(false);
        setEmail(newUserData.email);
      } else {
        Alert.alert('Account Creation Failed', result.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoAccount = (account) => {
    setEmail(account.email);
    setPassword(account.password);
    setTermsAccepted(true);
  };

  const handleAcceptTerms = () => {
    setTermsAccepted(true);
    setShowTermsModal(false);
    Alert.alert('Terms Accepted', 'Thank you for accepting the terms and conditions.');
  };

  const handleDeclineTerms = () => {
    setTermsAccepted(false);
    setShowTermsModal(false);
    Alert.alert('Terms Required', 'You must accept the terms and conditions to use the Oqualtix App.');
  };

  // Show verification screen if pending verification
  if (pendingVerification) {
    return (
      <LinearGradient colors={['#007AFF', '#5856D6']} style={styles.container}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoid}
        >
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <View style={styles.logoContainer}>
              <View style={styles.logoCircle}>
                <Ionicons name="mail" size={40} color="#FFFFFF" />
              </View>
              <Text style={styles.logoText}>Email Verification</Text>
              <Text style={styles.logoSubtext}>Check your inbox for verification code</Text>
            </View>

            <View style={styles.formContainer}>
              <View style={styles.infoCard}>
                <Ionicons name="information-circle" size={24} color="#007AFF" />
                <Text style={styles.infoText}>
                  A verification email has been sent to {pendingVerification.email} from oqualtix@outlook.com
                </Text>
              </View>

              <View style={styles.inputContainer}>
                <Ionicons name="shield-checkmark" size={20} color="#8E8E93" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter verification code"
                  value={verificationCode}
                  onChangeText={setVerificationCode}
                  autoCapitalize="characters"
                  autoCorrect={false}
                  maxLength={6}
                />
              </View>

              <TouchableOpacity
                style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
                onPress={handleVerification}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.loginButtonText}>Verify Email</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.linkButton}
                onPress={() => {
                  // Resend verification code logic
                  Alert.alert('Code Sent', 'A new verification code has been sent to your email.');
                }}
              >
                <Text style={styles.linkButtonText}>Resend verification code</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    );
  }

  // Show create account screen
  if (showCreateAccount) {
    return (
      <LinearGradient colors={['#007AFF', '#5856D6']} style={styles.container}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoid}
        >
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <View style={styles.logoContainer}>
              <View style={styles.logoCircle}>
                <Ionicons name="person-add" size={40} color="#FFFFFF" />
              </View>
              <Text style={styles.logoText}>Create Account</Text>
              <Text style={styles.logoSubtext}>Join Oqualtix Forensics</Text>
            </View>

            <View style={styles.formContainer}>
              <View style={styles.inputRow}>
                <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
                  <Ionicons name="person" size={20} color="#8E8E93" style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="First Name"
                    value={newUserData.firstName}
                    onChangeText={(text) => setNewUserData({...newUserData, firstName: text})}
                  />
                </View>
                <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
                  <Ionicons name="person" size={20} color="#8E8E93" style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Last Name"
                    value={newUserData.lastName}
                    onChangeText={(text) => setNewUserData({...newUserData, lastName: text})}
                  />
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Ionicons name="business" size={20} color="#8E8E93" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Company Name"
                  value={newUserData.company}
                  onChangeText={(text) => setNewUserData({...newUserData, company: text})}
                />
              </View>

              <View style={styles.inputContainer}>
                <Ionicons name="mail" size={20} color="#8E8E93" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Email Address"
                  value={newUserData.email}
                  onChangeText={(text) => setNewUserData({...newUserData, email: text})}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed" size={20} color="#8E8E93" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Password"
                  value={newUserData.password}
                  onChangeText={(text) => setNewUserData({...newUserData, password: text})}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color="#8E8E93" />
                </TouchableOpacity>
              </View>

              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed" size={20} color="#8E8E93" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Confirm Password"
                  value={newUserData.confirmPassword}
                  onChangeText={(text) => setNewUserData({...newUserData, confirmPassword: text})}
                  secureTextEntry={!showPassword}
                />
              </View>

              <TermsCheckbox
                checked={termsAccepted}
                onToggle={() => setTermsAccepted(!termsAccepted)}
                showTerms={() => setShowTermsModal(true)}
              />

              <TouchableOpacity
                style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
                onPress={handleCreateAccount}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.loginButtonText}>Create Account</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.linkButton}
                onPress={() => setShowCreateAccount(false)}
              >
                <Text style={styles.linkButtonText}>Already have an account? Sign In</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

        <TermsAndConditionsModal
          visible={showTermsModal}
          onAccept={handleAcceptTerms}
          onDecline={handleDeclineTerms}
        />
      </LinearGradient>
    );
  }

  // Main login screen
  return (
    <LinearGradient colors={['#007AFF', '#5856D6']} style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Ionicons name="shield-checkmark" size={40} color="#FFFFFF" />
            </View>
            <Text style={styles.logoText}>Oqualtix</Text>
            <Text style={styles.logoSubtext}>Forensic Financial Analytics</Text>
          </View>

          <View style={styles.formContainer}>
            {/* Demo Accounts Section */}
            <View style={styles.demoSection}>
              <Text style={styles.demoTitle}>Demo Accounts (Tap to fill):</Text>
              {demoAccounts.map((account, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.demoAccount}
                  onPress={() => fillDemoAccount(account)}
                >
                  <Ionicons name="person-circle" size={16} color="#007AFF" />
                  <Text style={styles.demoAccountText}>{account.role}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="mail" size={20} color="#8E8E93" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="Email Address"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed" size={20} color="#8E8E93" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color="#8E8E93" />
              </TouchableOpacity>
            </View>

            <TermsCheckbox
              checked={termsAccepted}
              onToggle={() => setTermsAccepted(!termsAccepted)}
              showTerms={() => setShowTermsModal(true)}
            />

            <TouchableOpacity
              style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.loginButtonText}>Sign In</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.linkButton}
              onPress={() => setShowCreateAccount(true)}
            >
              <Text style={styles.linkButtonText}>Don't have an account? Sign Up</Text>
            </TouchableOpacity>

            <View style={styles.securityNotice}>
              <Ionicons name="shield" size={16} color="#34C759" />
              <Text style={styles.securityNoticeText}>
                Secured with enterprise-grade encryption
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <TermsAndConditionsModal
        visible={showTermsModal}
        onAccept={handleAcceptTerms}
        onDecline={handleDeclineTerms}
      />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  logoSubtext: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.8,
  },
  formContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  demoSection: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#F0F8FF',
    borderRadius: 12,
  },
  demoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 12,
    textAlign: 'center',
  },
  demoAccount: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  demoAccountText: {
    fontSize: 12,
    color: '#007AFF',
    marginLeft: 8,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  inputRow: {
    flexDirection: 'row',
    marginBottom: 0,
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#000000',
  },
  loginButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  linkButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  linkButtonText: {
    fontSize: 14,
    color: '#007AFF',
    textDecorationLine: 'underline',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  infoText: {
    fontSize: 14,
    color: '#1976D2',
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
  securityNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  securityNoticeText: {
    fontSize: 12,
    color: '#34C759',
    marginLeft: 6,
    fontWeight: '500',
  },
});

export default EnhancedLoginScreen;