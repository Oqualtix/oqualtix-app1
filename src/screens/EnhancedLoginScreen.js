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
    { email: 'Oqualtix@outlook.com', password: 'OqualtixAdmin2025!', role: 'Admin' },
    { email: 'user@example.com', password: 'DEMO2025', role: 'User (with access code)' },
    { email: 'test@company.com', password: 'DEMO2025', role: 'User (with access code)' }
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
              <Text style={styles.linkButtonText}>Don&apos;t have an account? Sign Up</Text>
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
  demoAccount: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E5EA',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  demoAccountText: {
    color: '#007AFF',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 8,
  },
  demoSection: {
    backgroundColor: '#F0F8FF',
    borderRadius: 12,
    marginBottom: 20,
    padding: 16,
  },
  demoTitle: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  formContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    elevation: 10,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  infoCard: {
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    flexDirection: 'row',
    marginBottom: 20,
    padding: 16,
  },
  infoText: {
    color: '#1976D2',
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    marginLeft: 12,
  },
  inputContainer: {
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderColor: '#E5E5EA',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputIcon: {
    marginRight: 12,
  },
  inputRow: {
    flexDirection: 'row',
    marginBottom: 0,
  },
  keyboardAvoid: {
    flex: 1,
  },
  linkButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  linkButtonText: {
    color: '#007AFF',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  loginButton: {
    alignItems: 'center',
    backgroundColor: '#007AFF',
    borderRadius: 12,
    elevation: 6,
    marginBottom: 16,
    marginTop: 8,
    paddingVertical: 16,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  logoCircle: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 40,
    height: 80,
    justifyContent: 'center',
    marginBottom: 16,
    width: 80,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoSubtext: {
    color: '#FFFFFF',
    fontSize: 16,
    opacity: 0.8,
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  securityNotice: {
    alignItems: 'center',
    borderTopColor: '#E5E5EA',
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
    paddingTop: 16,
  },
  securityNoticeText: {
    color: '#34C759',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 6,
  },
  textInput: {
    color: '#000000',
    flex: 1,
    fontSize: 16,
  },
});

export default EnhancedLoginScreen;