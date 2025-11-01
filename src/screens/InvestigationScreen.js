import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Linking,
  Share
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import EmbezzlementDetectionUtils from '../utils/EmbezzlementDetectionUtils';
import SecurityUtils from '../utils/SecurityUtils';

const InvestigationScreen = ({ route, navigation }) => {
  const { alert } = route.params;
  const [investigationSteps, setInvestigationSteps] = useState([]);
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [reportGenerated, setReportGenerated] = useState(false);

  useEffect(() => {
    loadInvestigationData();
  }, []);

  const loadInvestigationData = async () => {
    try {
      setLoading(true);
      
      // Generate investigation steps based on the alert
      const steps = EmbezzlementDetectionUtils.generateInvestigationSteps(alert);
      setInvestigationSteps(steps);
      
      // Log security incident
      await SecurityUtils.logSecurityEvent({
        type: 'FRAUD_INVESTIGATION_INITIATED',
        details: {
          alertId: alert.id,
          transactionId: alert.transactionId,
          amount: alert.transaction.amount,
          vendor: alert.transaction.vendor
        },
        severity: 'HIGH'
      });
      
    } catch (error) {
      console.error('Error loading investigation data:', error);
      Alert.alert('Error', 'Failed to load investigation steps. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleStepCompletion = (stepIndex) => {
    const newCompletedSteps = new Set(completedSteps);
    if (completedSteps.has(stepIndex)) {
      newCompletedSteps.delete(stepIndex);
    } else {
      newCompletedSteps.add(stepIndex);
    }
    setCompletedSteps(newCompletedSteps);
  };

  const generateFraudReport = async () => {
    try {
      setReportGenerated(true);
      
      const transaction = alert.transaction;
      const reportContent = `
FRAUD INVESTIGATION REPORT
Generated: ${new Date().toLocaleString()}
Report ID: ${alert.id}

TRANSACTION DETAILS:
- Amount: ${Math.abs(transaction.amount).toLocaleString('en-US', {style: 'currency', currency: 'USD'})}
- Vendor: ${transaction.vendor}
- Date: ${new Date(transaction.date).toLocaleString()}
- Category: ${transaction.category}
- Transaction ID: ${transaction.id}

SUSPICIOUS PATTERNS DETECTED:
${alert.suspiciousPatterns.map((pattern, index) => 
  `${index + 1}. ${pattern.description} (Severity: ${pattern.severity})`
).join('\n')}

RISK ASSESSMENT:
- Risk Level: ${alert.riskLevel}
- Alert Type: ${alert.alertType}
- Detection Time: ${new Date(alert.detectedAt).toLocaleString()}

USER RESPONSE:
- Response: NOT MY PURCHASE (Unauthorized Transaction)
- Response Time: ${new Date().toLocaleString()}

RECOMMENDED ACTIONS:
${investigationSteps.map((step, index) => 
  `${index + 1}. [${step.priority}] ${step.action}
   ${step.description}`
).join('\n\n')}

NEXT STEPS:
1. Contact financial institution immediately
2. File fraud report with relevant authorities
3. Monitor accounts for additional unauthorized activity
4. Update security credentials

This report should be provided to your bank, credit card company, and law enforcement if filing a police report.
      `;

      await Share.share({
        message: reportContent,
        title: 'Fraud Investigation Report'
      });

    } catch (error) {
      console.error('Error generating report:', error);
      Alert.alert('Error', 'Failed to generate fraud report. Please try again.');
    }
  };

  const callEmergencyNumber = (number, description) => {
    Alert.alert(
      'Emergency Contact',
      `Call ${description}?\n\nNumber: ${number}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Call', 
          onPress: () => Linking.openURL(`tel:${number}`)
        }
      ]
    );
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'IMMEDIATE': return '#FF3B30';
      case 'HIGH': return '#FF9500';
      case 'MEDIUM': return '#FFCC00';
      default: return '#34C759';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'IMMEDIATE': return 'alert-circle';
      case 'HIGH': return 'warning';
      case 'MEDIUM': return 'information-circle';
      default: return 'checkmark-circle';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading investigation steps...</Text>
      </View>
    );
  }

  return (
    <LinearGradient colors={['#FF6B6B', '#FFE66D']} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Fraud Investigation</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Alert Summary */}
        <View style={styles.alertSummary}>
          <View style={styles.alertHeader}>
            <Ionicons name="shield-outline" size={32} color="#FF3B30" />
            <Text style={styles.alertTitle}>Unauthorized Transaction Detected</Text>
          </View>
          
          <View style={styles.transactionDetails}>
            <Text style={styles.detailLabel}>Transaction Amount:</Text>
            <Text style={styles.detailValue}>
              {Math.abs(alert.transaction.amount).toLocaleString('en-US', {style: 'currency', currency: 'USD'})}
            </Text>
            
            <Text style={styles.detailLabel}>Vendor:</Text>
            <Text style={styles.detailValue}>{alert.transaction.vendor}</Text>
            
            <Text style={styles.detailLabel}>Date:</Text>
            <Text style={styles.detailValue}>
              {new Date(alert.transaction.date).toLocaleString()}
            </Text>
            
            <Text style={styles.detailLabel}>Risk Level:</Text>
            <View style={[styles.riskBadge, { backgroundColor: alert.riskLevel === 'HIGH' ? '#FF3B30' : alert.riskLevel === 'MEDIUM' ? '#FF9500' : '#FFCC00' }]}>
              <Text style={styles.riskText}>{alert.riskLevel}</Text>
            </View>
          </View>
        </View>

        {/* Immediate Actions */}
        <View style={styles.emergencySection}>
          <Text style={styles.sectionTitle}>🚨 Immediate Actions Required</Text>
          
          <TouchableOpacity 
            style={styles.emergencyButton}
            onPress={() => callEmergencyNumber('1-800-FRAUD', 'National Fraud Hotline')}
          >
            <Ionicons name="call" size={20} color="#FFFFFF" />
            <Text style={styles.emergencyButtonText}>Call Fraud Hotline</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.emergencyButton, styles.reportButton]}
            onPress={generateFraudReport}
          >
            <Ionicons name="document-text" size={20} color="#FFFFFF" />
            <Text style={styles.emergencyButtonText}>Generate Fraud Report</Text>
          </TouchableOpacity>
        </View>

        {/* Investigation Steps */}
        <View style={styles.stepsSection}>
          <Text style={styles.sectionTitle}>Investigation Checklist</Text>
          <Text style={styles.sectionSubtitle}>
            Follow these steps to protect your accounts and investigate this unauthorized transaction:
          </Text>

          {investigationSteps.map((step, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.stepCard,
                completedSteps.has(index) && styles.completedStep
              ]}
              onPress={() => toggleStepCompletion(index)}
            >
              <View style={styles.stepHeader}>
                <View style={styles.stepPriority}>
                  <Ionicons 
                    name={getPriorityIcon(step.priority)}
                    size={16}
                    color={getPriorityColor(step.priority)}
                  />
                  <Text style={[styles.priorityText, { color: getPriorityColor(step.priority) }]}>
                    {step.priority}
                  </Text>
                </View>
                
                <Ionicons 
                  name={completedSteps.has(index) ? "checkmark-circle" : "ellipse-outline"}
                  size={24}
                  color={completedSteps.has(index) ? "#34C759" : "#8E8E93"}
                />
              </View>
              
              <Text style={styles.stepAction}>{step.action}</Text>
              <Text style={styles.stepDescription}>{step.description}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Progress Summary */}
        <View style={styles.progressSection}>
          <Text style={styles.sectionTitle}>Progress Summary</Text>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${(completedSteps.size / investigationSteps.length) * 100}%` }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>
            {completedSteps.size} of {investigationSteps.length} steps completed
          </Text>
        </View>

        {/* Important Notice */}
        <View style={styles.noticeSection}>
          <Ionicons name="information-circle" size={24} color="#007AFF" />
          <Text style={styles.noticeText}>
            Time is critical in fraud cases. Complete the immediate actions as soon as possible. 
            Keep records of all communications with financial institutions and law enforcement.
          </Text>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  alertHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 16,
  },
  alertSummary: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    elevation: 4,
    marginBottom: 16,
    marginTop: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  alertTitle: {
    color: '#FF3B30',
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 12,
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
  bottomPadding: {
    height: 40,
  },
  completedStep: {
    backgroundColor: '#E8F5E8',
    borderColor: '#34C759',
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
  },
  detailLabel: {
    color: '#8E8E93',
    fontSize: 14,
    fontWeight: '500',
  },
  detailValue: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  emergencyButton: {
    alignItems: 'center',
    backgroundColor: '#FF3B30',
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  emergencyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  emergencySection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    elevation: 4,
    marginBottom: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
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
  noticeSection: {
    alignItems: 'flex-start',
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    flexDirection: 'row',
    marginBottom: 16,
    padding: 16,
  },
  noticeText: {
    color: '#1976D2',
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    marginLeft: 12,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  progressBar: {
    backgroundColor: '#E5E5EA',
    borderRadius: 4,
    height: 8,
    marginVertical: 12,
  },
  progressFill: {
    backgroundColor: '#34C759',
    borderRadius: 4,
    height: '100%',
  },
  progressSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    elevation: 4,
    marginBottom: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  progressText: {
    color: '#8E8E93',
    fontSize: 14,
    textAlign: 'center',
  },
  reportButton: {
    backgroundColor: '#007AFF',
  },
  riskBadge: {
    alignSelf: 'flex-start',
    borderRadius: 12,
    marginTop: 4,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  riskText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  sectionSubtitle: {
    color: '#8E8E93',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#000000',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  stepAction: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  stepCard: {
    backgroundColor: '#F8F9FA',
    borderColor: '#E5E5EA',
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    padding: 16,
  },
  stepDescription: {
    color: '#8E8E93',
    fontSize: 14,
    lineHeight: 18,
  },
  stepHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  stepPriority: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  stepsSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    elevation: 4,
    marginBottom: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  transactionDetails: {
    gap: 8,
  },
});

export default InvestigationScreen;