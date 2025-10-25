import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import EmbezzlementDetectionUtils from '../utils/EmbezzlementDetectionUtils';

const EmbezzlementTestPanel = ({ onTriggerAlert, transactions, userProfile }) => {
  
  const createTestAlert = (alertType) => {
    let testTransaction;
    
    switch (alertType) {
      case 'LARGE_AMOUNT':
        testTransaction = {
          id: 'test_large',
          date: new Date(),
          description: 'Suspicious Large Payment',
          amount: -25000.00, // Very large amount
          category: 'Operating Expenses',
          account: 'Business Checking',
          type: 'expense',
          vendor: 'Unknown Vendor Inc.',
          reference: 'TEST-LARGE-001',
        };
        break;
        
      case 'NEW_VENDOR':
        testTransaction = {
          id: 'test_vendor',
          date: new Date(),
          description: 'Payment to New Vendor',
          amount: -8500.00,
          category: 'Professional Services',
          account: 'Business Checking',
          type: 'expense',
          vendor: 'Suspicious Services LLC', // New vendor
          reference: 'TEST-VENDOR-001',
        };
        break;
        
      case 'OFF_HOURS':
        const offHoursDate = new Date();
        offHoursDate.setHours(2, 30, 0, 0); // 2:30 AM
        testTransaction = {
          id: 'test_hours',
          date: offHoursDate,
          description: 'Late Night Purchase',
          amount: -3500.00,
          category: 'Operating Expenses',
          account: 'Business Credit Card',
          type: 'expense',
          vendor: 'Midnight Electronics',
          reference: 'TEST-HOURS-001',
        };
        break;
        
      case 'ROUND_NUMBER':
        testTransaction = {
          id: 'test_round',
          date: new Date(),
          description: 'Round Number Transaction',
          amount: -5000.00, // Exact round number
          category: 'Equipment',
          account: 'Business Checking',
          type: 'expense',
          vendor: 'Round Number Corp',
          reference: 'TEST-ROUND-001',
        };
        break;
    }
    
    // Analyze this single transaction
    const analysisResult = EmbezzlementDetectionUtils.analyzeForEmbezzlement(
      [testTransaction], 
      userProfile
    );
    
    if (analysisResult.alerts.length > 0) {
      onTriggerAlert(analysisResult.alerts[0]);
    } else {
      Alert.alert('Test Alert', 'No suspicious patterns detected in test transaction.');
    }
  };

  const runFullAnalysis = () => {
    const analysisResult = EmbezzlementDetectionUtils.analyzeForEmbezzlement(
      transactions, 
      userProfile
    );
    
    Alert.alert(
      'Analysis Results',
      `Found ${analysisResult.alerts.length} suspicious transactions:\n` +
      `• High Risk: ${analysisResult.summary.highRiskAlerts}\n` +
      `• Medium Risk: ${analysisResult.summary.mediumRiskAlerts}\n` +
      `• Low Risk: ${analysisResult.summary.lowRiskAlerts}`
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🧪 Embezzlement Detection Testing</Text>
      
      <View style={styles.buttonGrid}>
        <TouchableOpacity 
          style={[styles.testButton, styles.largeAmountButton]}
          onPress={() => createTestAlert('LARGE_AMOUNT')}
        >
          <Ionicons name="trending-up" size={20} color="#FFFFFF" />
          <Text style={styles.buttonText}>Large Amount Alert</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.testButton, styles.newVendorButton]}
          onPress={() => createTestAlert('NEW_VENDOR')}
        >
          <Ionicons name="business" size={20} color="#FFFFFF" />
          <Text style={styles.buttonText}>New Vendor Alert</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.testButton, styles.offHoursButton]}
          onPress={() => createTestAlert('OFF_HOURS')}
        >
          <Ionicons name="moon" size={20} color="#FFFFFF" />
          <Text style={styles.buttonText}>Off-Hours Alert</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.testButton, styles.roundNumberButton]}
          onPress={() => createTestAlert('ROUND_NUMBER')}
        >
          <Ionicons name="calculator" size={20} color="#FFFFFF" />
          <Text style={styles.buttonText}>Round Number Alert</Text>
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity 
        style={styles.analysisButton}
        onPress={runFullAnalysis}
      >
        <Ionicons name="analytics" size={24} color="#FFFFFF" />
        <Text style={styles.analysisButtonText}>Run Full Analysis</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  testButton: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  largeAmountButton: {
    backgroundColor: '#FF3B30',
  },
  newVendorButton: {
    backgroundColor: '#FF9500',
  },
  offHoursButton: {
    backgroundColor: '#5856D6',
  },
  roundNumberButton: {
    backgroundColor: '#FFCC00',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
    textAlign: 'center',
  },
  analysisButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  analysisButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default EmbezzlementTestPanel;