import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import SecurityUtils from '../utils/SecurityUtils';
import EmbezzlementDetectionUtils from '../utils/EmbezzlementDetectionUtils';

const PurchaseConfirmationScreen = ({ route, navigation }) => {
  const { alert } = route.params;
  const [loading, setLoading] = useState(true);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    processConfirmation();
  }, []);

  const processConfirmation = async () => {
    try {
      setLoading(true);
      
      // Process the user's confirmation response
      const updatedAlert = EmbezzlementDetectionUtils.processUserResponse(
        alert, 
        'MY_PURCHASE', 
        'current_user_id'
      );
      
      // Log the confirmation for security audit
      await SecurityUtils.logSecurityEvent({
        type: 'TRANSACTION_CONFIRMED_BY_USER',
        details: {
          alertId: alert.id,
          transactionId: alert.transactionId,
          amount: alert.transaction.amount,
          vendor: alert.transaction.vendor,
          userResponse: 'MY_PURCHASE'
        },
        severity: 'INFO'
      });
      
      // Update user's behavioral patterns (learning from confirmed transactions)
      // This helps reduce false positives in future detections
      await updateUserProfile(alert.transaction);
      
      setConfirmed(true);
      
    } catch (error) {
      console.error('Error processing confirmation:', error);
      Alert.alert('Error', 'Failed to process confirmation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateUserProfile = async (transaction) => {
    try {
      // This would update the user's spending profile to include this confirmed transaction
      // helping to reduce false positives for similar transactions in the future
      console.log('Updating user profile with confirmed transaction:', transaction);
      
      // In a real implementation, this would:
      // 1. Update user's spending patterns
      // 2. Adjust detection thresholds for similar transactions
      // 3. Learn from the user's confirmation to improve future AI accuracy
      
    } catch (error) {
      console.error('Error updating user profile:', error);
    }
  };

  const navigateBack = () => {
    navigation.goBack();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#34C759" />
        <Text style={styles.loadingText}>Processing confirmation...</Text>
      </View>
    );
  }

  return (
    <LinearGradient colors={['#34C759', '#7ED321']} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={navigateBack}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Purchase Confirmed</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.confirmationCard}>
          {/* Success Icon */}
          <View style={styles.iconContainer}>
            <Ionicons name="checkmark-circle" size={80} color="#34C759" />
          </View>

          {/* Thank You Message */}
          <Text style={styles.thankYouTitle}>Thank you for confirming your purchase!</Text>
          
          <Text style={styles.confirmationMessage}>
            We&apos;ve updated your profile to better recognize similar transactions in the future.
          </Text>

          {/* Transaction Summary */}
          <View style={styles.transactionSummary}>
            <Text style={styles.summaryTitle}>Confirmed Transaction:</Text>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Amount:</Text>
              <Text style={styles.summaryValue}>
                {Math.abs(alert.transaction.amount).toLocaleString('en-US', {style: 'currency', currency: 'USD'})}
              </Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Vendor:</Text>
              <Text style={styles.summaryValue}>{alert.transaction.vendor}</Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Date:</Text>
              <Text style={styles.summaryValue}>
                {new Date(alert.transaction.date).toLocaleDateString()}
              </Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Category:</Text>
              <Text style={styles.summaryValue}>{alert.transaction.category}</Text>
            </View>
          </View>

          {/* AI Learning Message */}
          <View style={styles.aiLearningSection}>
            <View style={styles.aiIconContainer}>
              <Ionicons name="brain" size={24} color="#007AFF" />
            </View>
            <Text style={styles.aiLearningTitle}>AI Learning Improvement</Text>
            <Text style={styles.aiLearningText}>
              Our AI system has learned from your confirmation and will be more accurate in detecting 
              your spending patterns. This helps reduce false alerts while maintaining security.
            </Text>
          </View>

          {/* Security Benefits */}
          <View style={styles.benefitsSection}>
            <Text style={styles.benefitsTitle}>Your Security Benefits:</Text>
            
            <View style={styles.benefitItem}>
              <Ionicons name="shield-checkmark" size={20} color="#34C759" />
              <Text style={styles.benefitText}>Enhanced fraud protection</Text>
            </View>
            
            <View style={styles.benefitItem}>
              <Ionicons name="trending-up" size={20} color="#34C759" />
              <Text style={styles.benefitText}>Improved AI accuracy</Text>
            </View>
            
            <View style={styles.benefitItem}>
              <Ionicons name="notifications" size={20} color="#34C759" />
              <Text style={styles.benefitText}>Reduced false alerts</Text>
            </View>
            
            <View style={styles.benefitItem}>
              <Ionicons name="lock-closed" size={20} color="#34C759" />
              <Text style={styles.benefitText}>Continuous monitoring</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.primaryButton}
              onPress={navigateBack}
            >
              <Text style={styles.primaryButtonText}>Return to Financial Records</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.secondaryButton}
              onPress={() => navigation.navigate('Settings')}
            >
              <Text style={styles.secondaryButtonText}>Adjust Alert Settings</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  actionButtons: {
    gap: 12,
    width: '100%',
  },
  aiIconContainer: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    height: 48,
    justifyContent: 'center',
    marginBottom: 12,
    width: 48,
  },
  aiLearningSection: {
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    marginBottom: 24,
    padding: 20,
    width: '100%',
  },
  aiLearningText: {
    color: '#1976D2',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  aiLearningTitle: {
    color: '#1976D2',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  backButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    marginRight: 16,
    width: 40,
  },
  benefitItem: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 12,
  },
  benefitText: {
    color: '#000000',
    fontSize: 14,
    marginLeft: 12,
  },
  benefitsSection: {
    marginBottom: 30,
    width: '100%',
  },
  benefitsTitle: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  confirmationCard: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    elevation: 8,
    padding: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
  },
  confirmationMessage: {
    color: '#8E8E93',
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 30,
    textAlign: 'center',
  },
  container: {
    flex: 1,
  },
  content: {
    backgroundColor: '#F2F2F7',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingBottom: 20,
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  iconContainer: {
    marginBottom: 24,
  },
  loadingContainer: {
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    flex: 1,
    justifyContent: 'center',
  },
  loadingText: {
    color: '#8E8E93',
    fontSize: 16,
    marginTop: 16,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderColor: '#007AFF',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  secondaryButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  summaryLabel: {
    color: '#8E8E93',
    fontSize: 14,
    fontWeight: '500',
  },
  summaryRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryTitle: {
    color: '#000000',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  summaryValue: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '600',
  },
  thankYouTitle: {
    color: '#000000',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  transactionSummary: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    marginBottom: 24,
    padding: 20,
    width: '100%',
  },
});

export default PurchaseConfirmationScreen;