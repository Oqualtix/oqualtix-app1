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
            We've updated your profile to better recognize similar transactions in the future.
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
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#8E8E93',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    backgroundColor: '#F2F2F7',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  confirmationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  iconContainer: {
    marginBottom: 24,
  },
  thankYouTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 12,
  },
  confirmationMessage: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
  },
  transactionSummary: {
    width: '100%',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 14,
    color: '#000000',
    fontWeight: '600',
  },
  aiLearningSection: {
    width: '100%',
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    alignItems: 'center',
  },
  aiIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  aiLearningTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 8,
  },
  aiLearningText: {
    fontSize: 14,
    color: '#1976D2',
    textAlign: 'center',
    lineHeight: 20,
  },
  benefitsSection: {
    width: '100%',
    marginBottom: 30,
  },
  benefitsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 16,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  benefitText: {
    fontSize: 14,
    color: '#000000',
    marginLeft: 12,
  },
  actionButtons: {
    width: '100%',
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#007AFF',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PurchaseConfirmationScreen;