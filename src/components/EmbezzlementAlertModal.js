import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Vibration,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const EmbezzlementAlertModal = ({ 
  visible, 
  alert, 
  onNotMyPurchase, 
  onMyPurchase, 
  onDismiss 
}) => {
  const [slideAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.8));

  useEffect(() => {
    if (visible) {
      // Vibrate to get user attention
      Vibration.vibrate([0, 200, 100, 200]);
      
      // Animate modal appearance
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Reset animations
      slideAnim.setValue(0);
      scaleAnim.setValue(0.8);
    }
  }, [visible]);

  const handleNotMyPurchase = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onNotMyPurchase(alert);
    });
  };

  const handleMyPurchase = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onMyPurchase(alert);
    });
  };

  const getRiskColor = (riskLevel) => {
    switch (riskLevel) {
      case 'HIGH': return '#FF3B30';
      case 'MEDIUM': return '#FF9500';
      case 'LOW': return '#FFCC00';
      default: return '#8E8E93';
    }
  };

  const getRiskGradient = (riskLevel) => {
    switch (riskLevel) {
      case 'HIGH': return ['#FF3B30', '#FF6B6B'];
      case 'MEDIUM': return ['#FF9500', '#FFB347'];
      case 'LOW': return ['#FFCC00', '#FFD700'];
      default: return ['#8E8E93', '#B0B0B0'];
    }
  };

  if (!alert) return null;

  const transaction = alert.transaction;
  const amount = Math.abs(transaction.amount);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={onDismiss}
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.modalContainer,
            {
              transform: [
                {
                  translateY: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [300, 0],
                  }),
                },
                { scale: scaleAnim },
              ],
            },
          ]}
        >
          <LinearGradient
            colors={getRiskGradient(alert.riskLevel)}
            style={styles.alertHeader}
          >
            <View style={styles.alertIcon}>
              <Ionicons name="warning" size={32} color="#FFFFFF" />
            </View>
            <Text style={styles.alertTitle}>Suspicious Transaction Detected</Text>
            <Text style={styles.riskLevelText}>{alert.riskLevel} RISK</Text>
          </LinearGradient>

          <ScrollView style={styles.alertContent} showsVerticalScrollIndicator={false}>
            {/* Transaction Details */}
            <View style={styles.transactionSection}>
              <Text style={styles.sectionTitle}>Transaction Details</Text>
              
              <View style={styles.detailRow}>
                <Ionicons name="card" size={20} color="#007AFF" />
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Amount</Text>
                  <Text style={styles.detailValue}>
                    {amount.toLocaleString('en-US', {style: 'currency', currency: 'USD'})}
                  </Text>
                </View>
              </View>

              <View style={styles.detailRow}>
                <Ionicons name="storefront" size={20} color="#007AFF" />
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Vendor</Text>
                  <Text style={styles.detailValue}>{transaction.vendor}</Text>
                </View>
              </View>

              <View style={styles.detailRow}>
                <Ionicons name="calendar" size={20} color="#007AFF" />
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Date & Time</Text>
                  <Text style={styles.detailValue}>
                    {new Date(transaction.date).toLocaleString()}
                  </Text>
                </View>
              </View>

              <View style={styles.detailRow}>
                <Ionicons name="pricetag" size={20} color="#007AFF" />
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Category</Text>
                  <Text style={styles.detailValue}>{transaction.category}</Text>
                </View>
              </View>
            </View>

            {/* Suspicious Patterns */}
            <View style={styles.patternsSection}>
              <Text style={styles.sectionTitle}>Why This Transaction is Suspicious</Text>
              
              {alert.suspiciousPatterns.map((pattern, index) => (
                <View key={index} style={styles.patternItem}>
                  <View style={[styles.patternIndicator, { backgroundColor: getRiskColor(pattern.severity) }]} />
                  <View style={styles.patternContent}>
                    <Text style={styles.patternDescription}>{pattern.description}</Text>
                    <Text style={styles.patternSeverity}>{pattern.severity} SEVERITY</Text>
                  </View>
                </View>
              ))}
            </View>

            {/* AI Analysis */}
            <View style={styles.aiSection}>
              <View style={styles.aiHeader}>
                <Ionicons name="brain" size={24} color="#007AFF" />
                <Text style={styles.aiTitle}>AI Analysis</Text>
              </View>
              <Text style={styles.aiAnalysis}>
                Our AI forensic system detected unusual patterns in this transaction based on your 
                spending history. This transaction deviates significantly from your normal behavior 
                and may require verification.
              </Text>
            </View>

            {/* Question */}
            <View style={styles.questionSection}>
              <Text style={styles.questionText}>
                Did you authorize this transaction?
              </Text>
              <Text style={styles.questionSubtext}>
                Your response helps improve our fraud detection and protects your account.
              </Text>
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.notMyPurchaseButton]}
              onPress={handleNotMyPurchase}
              activeOpacity={0.8}
            >
              <Ionicons name="close-circle" size={24} color="#FFFFFF" />
              <Text style={styles.notMyPurchaseText}>Not My Purchase</Text>
              <Text style={styles.buttonSubtext}>Investigate this transaction</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionButton, styles.myPurchaseButton]}
              onPress={handleMyPurchase}
              activeOpacity={0.8}
            >
              <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
              <Text style={styles.myPurchaseText}>My Purchase</Text>
              <Text style={styles.buttonSubtext}>Confirm authorization</Text>
            </TouchableOpacity>
          </View>

          {/* Close Button */}
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={onDismiss}
          >
            <Ionicons name="close" size={24} color="#8E8E93" />
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '90%',
    maxHeight: '85%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
  },
  alertHeader: {
    padding: 24,
    alignItems: 'center',
  },
  alertIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  alertTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  riskLevelText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    opacity: 0.9,
  },
  alertContent: {
    maxHeight: 400,
    paddingHorizontal: 20,
  },
  transactionSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  detailContent: {
    marginLeft: 12,
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  patternsSection: {
    marginBottom: 24,
  },
  patternItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  patternIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
    marginRight: 12,
  },
  patternContent: {
    flex: 1,
  },
  patternDescription: {
    fontSize: 14,
    color: '#000000',
    lineHeight: 20,
    marginBottom: 4,
  },
  patternSeverity: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#8E8E93',
  },
  aiSection: {
    backgroundColor: '#F0F8FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  aiTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
    marginLeft: 8,
  },
  aiAnalysis: {
    fontSize: 14,
    color: '#007AFF',
    lineHeight: 20,
  },
  questionSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  questionText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 8,
  },
  questionSubtext: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 18,
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
  },
  notMyPurchaseButton: {
    backgroundColor: '#FF3B30',
  },
  myPurchaseButton: {
    backgroundColor: '#34C759',
  },
  notMyPurchaseText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4,
  },
  myPurchaseText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4,
  },
  buttonSubtext: {
    color: '#FFFFFF',
    fontSize: 12,
    opacity: 0.8,
    textAlign: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default EmbezzlementAlertModal;