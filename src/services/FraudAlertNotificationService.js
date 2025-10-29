/**
 * Real-Time Fraud Alert & Notification Service
 * Provides instant notifications for potential embezzlement and fraud detection
 * 
 * Features:
 * - Real-time transaction monitoring
 * - Instant fraud alerts with severity levels
 * - Multiple notification channels (email, SMS, desktop, webhook)
 * - Configurable alert thresholds
 * - Alert escalation and acknowledgment
 * - Audit trail and alert history
 */

import EventEmitter from 'events';
import moment from 'moment';
import fs from 'fs';
import path from 'path';

class FraudAlertNotificationService extends EventEmitter {
  constructor(config = {}) {
    super();
    
    this.config = {
      // Alert thresholds
      criticalThreshold: 80,
      highThreshold: 60,
      mediumThreshold: 30,
      
      // Notification settings
      enableEmailAlerts: true,
      enableSMSAlerts: true,
      enableDesktopNotifications: true,
      enableWebhookAlerts: true,
      
      // Real-time monitoring
      enableRealTimeMonitoring: true,
      monitoringInterval: 5000, // 5 seconds
      batchSize: 100,
      
      // Alert escalation
      escalationTimeout: 300000, // 5 minutes
      maxRetries: 3,
      
      // Storage
      alertHistoryPath: './fraud_alerts_history.json',
      maxHistorySize: 10000,
      
      ...config
    };
    
    this.activeAlerts = new Map();
    this.alertHistory = [];
    this.isMonitoring = false;
    this.monitoringTimer = null;
    this.acknowledgedAlerts = new Set();
    
    // Initialize notification channels
    this.initializeNotificationChannels();
    
    // Load alert history
    this.loadAlertHistory();
    
    console.log('🚨 Fraud Alert & Notification Service initialized');
  }

  // Initialize notification channels
  initializeNotificationChannels() {
    this.notificationChannels = {
      email: {
        enabled: this.config.enableEmailAlerts,
        send: this.sendEmailAlert.bind(this)
      },
      sms: {
        enabled: this.config.enableSMSAlerts,
        send: this.sendSMSAlert.bind(this)
      },
      desktop: {
        enabled: this.config.enableDesktopNotifications,
        send: this.sendDesktopNotification.bind(this)
      },
      webhook: {
        enabled: this.config.enableWebhookAlerts,
        send: this.sendWebhookAlert.bind(this)
      },
      console: {
        enabled: true, // Always enabled for development
        send: this.sendConsoleAlert.bind(this)
      }
    };
  }

  // Start real-time fraud monitoring
  startRealTimeMonitoring(dataSource) {
    if (this.isMonitoring) {
      console.log('⚠️  Real-time monitoring already active');
      return;
    }

    this.isMonitoring = true;
    this.dataSource = dataSource;
    
    console.log('🔍 Starting real-time fraud monitoring...');
    console.log(`📊 Monitoring interval: ${this.config.monitoringInterval}ms`);
    console.log(`🎯 Critical threshold: ${this.config.criticalThreshold}%`);
    
    this.monitoringTimer = setInterval(() => {
      this.performRealTimeCheck();
    }, this.config.monitoringInterval);

    // Emit monitoring started event
    this.emit('monitoringStarted', {
      timestamp: new Date().toISOString(),
      config: this.config
    });

    return this;
  }

  // Stop real-time monitoring
  stopRealTimeMonitoring() {
    if (!this.isMonitoring) {
      console.log('⚠️  Real-time monitoring is not active');
      return;
    }

    this.isMonitoring = false;
    
    if (this.monitoringTimer) {
      clearInterval(this.monitoringTimer);
      this.monitoringTimer = null;
    }

    console.log('🛑 Real-time fraud monitoring stopped');
    
    // Emit monitoring stopped event
    this.emit('monitoringStopped', {
      timestamp: new Date().toISOString(),
      totalAlertsGenerated: this.alertHistory.length
    });

    return this;
  }

  // Perform real-time fraud check
  async performRealTimeCheck() {
    try {
      // Get new transactions to analyze
      const newTransactions = await this.getNewTransactions();
      
      if (newTransactions.length === 0) {
        return; // No new transactions to check
      }

      console.log(`🔍 Checking ${newTransactions.length} new transactions for fraud...`);

      // Analyze transactions for fraud indicators
      const fraudAnalysis = await this.analyzeTransactionsForFraud(newTransactions);

      // Process fraud indicators and generate alerts
      if (fraudAnalysis.fraudIndicators.length > 0) {
        await this.processFraudIndicators(fraudAnalysis.fraudIndicators, newTransactions);
      }

    } catch (error) {
      console.error('❌ Real-time fraud check error:', error);
      
      // Generate system error alert
      await this.generateSystemAlert({
        type: 'SYSTEM_ERROR',
        severity: 'HIGH',
        message: `Real-time monitoring error: ${error.message}`,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Get new transactions (mock implementation - replace with actual data source)
  async getNewTransactions() {
    // Mock implementation - in production, this would connect to:
    // - Banking APIs
    // - Database change streams
    // - File system watchers
    // - Webhook endpoints
    
    if (!this.dataSource || typeof this.dataSource.getNewTransactions !== 'function') {
      // Generate mock transactions for demonstration
      return this.generateMockTransactions();
    }

    return await this.dataSource.getNewTransactions();
  }

  // Generate mock transactions for demonstration
  generateMockTransactions() {
    const mockTransactions = [];
    
    // Randomly generate 0-5 new transactions
    const transactionCount = Math.floor(Math.random() * 6);
    
    for (let i = 0; i < transactionCount; i++) {
      const isFraudulent = Math.random() < 0.15; // 15% chance of fraudulent transaction
      
      if (isFraudulent) {
        // Generate potentially fraudulent transaction
        mockTransactions.push(this.generateFraudulentMockTransaction());
      } else {
        // Generate normal transaction
        mockTransactions.push(this.generateNormalMockTransaction());
      }
    }
    
    return mockTransactions;
  }

  // Generate fraudulent mock transaction
  generateFraudulentMockTransaction() {
    const fraudTypes = [
      // Micro-skimming
      {
        amount: -(0.001 + Math.random() * 0.099),
        description: 'Processing Fee',
        vendor: 'MicroSkimProcessor',
        type: 'MICRO_SKIMMING'
      },
      // After-hours activity
      {
        amount: -(500 + Math.random() * 2000),
        description: 'System Transfer',
        vendor: 'AutoTransferSystem',
        type: 'AFTER_HOURS',
        hour: Math.random() < 0.5 ? 2 : 23
      },
      // Round amount fraud
      {
        amount: -[1000, 1500, 2000, 2500, 5000][Math.floor(Math.random() * 5)],
        description: 'Consulting Services',
        vendor: 'RoundAmountConsulting',
        type: 'ROUND_AMOUNT'
      }
    ];

    const fraudType = fraudTypes[Math.floor(Math.random() * fraudTypes.length)];
    const now = moment();
    
    if (fraudType.hour !== undefined) {
      now.hour(fraudType.hour);
    }

    return {
      id: `FRAUD_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      date: now.format('YYYY-MM-DD HH:mm:ss'),
      description: fraudType.description,
      amount: fraudType.amount,
      balance: 50000 + Math.random() * 100000,
      type: fraudType.type,
      account: 'CHK-001-4829',
      vendor: fraudType.vendor,
      category: 'SUSPICIOUS_ACTIVITY',
      isMockFraudulent: true
    };
  }

  // Generate normal mock transaction
  generateNormalMockTransaction() {
    const normalTransactions = [
      { description: 'Office Rent Payment', amount: -2500, vendor: 'Metro Office Center' },
      { description: 'Utility Bill', amount: -150, vendor: 'PowerGrid Utilities' },
      { description: 'Client Payment', amount: 5000, vendor: 'Client Corp' },
      { description: 'Software License', amount: -899.99, vendor: 'TechSoft Inc' }
    ];

    const normalTx = normalTransactions[Math.floor(Math.random() * normalTransactions.length)];

    return {
      id: `NORMAL_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      date: moment().format('YYYY-MM-DD HH:mm:ss'),
      description: normalTx.description,
      amount: normalTx.amount,
      balance: 50000 + Math.random() * 100000,
      type: 'BUSINESS_TRANSACTION',
      account: 'CHK-001-4829',
      vendor: normalTx.vendor,
      category: 'BUSINESS_EXPENSE'
    };
  }

  // Analyze transactions for fraud (simplified version)
  async analyzeTransactionsForFraud(transactions) {
    const fraudIndicators = [];

    transactions.forEach(transaction => {
      const indicators = this.quickFraudCheck(transaction);
      fraudIndicators.push(...indicators);
    });

    return { fraudIndicators };
  }

  // Quick fraud check for real-time processing
  quickFraudCheck(transaction) {
    const indicators = [];
    const amount = Math.abs(transaction.amount);

    // Micro-skimming detection
    if (amount > 0 && amount <= 0.1) {
      indicators.push({
        type: 'MICRO_SKIMMING_REAL_TIME',
        severity: 'HIGH',
        transaction: transaction,
        confidence: 85,
        description: `Micro-transaction detected: $${amount.toFixed(4)}`,
        detectedAt: new Date().toISOString()
      });
    }

    // After-hours detection
    const hour = moment(transaction.date).hour();
    if (hour < 6 || hour > 22) {
      indicators.push({
        type: 'AFTER_HOURS_REAL_TIME',
        severity: 'MEDIUM',
        transaction: transaction,
        confidence: 70,
        description: `After-hours transaction at ${hour}:00`,
        detectedAt: new Date().toISOString()
      });
    }

    // Large amount detection
    if (amount > 10000) {
      indicators.push({
        type: 'LARGE_AMOUNT_REAL_TIME',
        severity: 'HIGH',
        transaction: transaction,
        confidence: 75,
        description: `Large transaction: $${amount.toLocaleString()}`,
        detectedAt: new Date().toISOString()
      });
    }

    // Round amount detection
    if (amount >= 100 && (amount % 100 === 0 || amount % 50 === 0)) {
      indicators.push({
        type: 'ROUND_AMOUNT_REAL_TIME',
        severity: 'MEDIUM',
        transaction: transaction,
        confidence: 60,
        description: `Suspicious round amount: $${amount}`,
        detectedAt: new Date().toISOString()
      });
    }

    return indicators;
  }

  // Process fraud indicators and generate alerts
  async processFraudIndicators(fraudIndicators, transactions) {
    for (const indicator of fraudIndicators) {
      const alert = await this.createFraudAlert(indicator, transactions);
      
      if (alert) {
        await this.sendAlert(alert);
      }
    }
  }

  // Create fraud alert from indicator
  async createFraudAlert(indicator, context = []) {
    const alertId = `ALERT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const alert = {
      id: alertId,
      type: 'FRAUD_DETECTION',
      subType: indicator.type,
      severity: indicator.severity,
      timestamp: new Date().toISOString(),
      confidence: indicator.confidence,
      description: indicator.description,
      
      // Fraud details
      fraudIndicator: indicator,
      affectedTransaction: indicator.transaction,
      context: context,
      
      // Alert metadata
      acknowledged: false,
      escalated: false,
      resolved: false,
      
      // Risk assessment
      riskScore: this.calculateRiskScore(indicator),
      impactLevel: this.calculateImpactLevel(indicator),
      
      // Recommended actions
      recommendedActions: this.generateRecommendedActions(indicator)
    };

    // Store alert
    this.activeAlerts.set(alertId, alert);
    this.alertHistory.push(alert);
    
    // Maintain history size limit
    if (this.alertHistory.length > this.config.maxHistorySize) {
      this.alertHistory = this.alertHistory.slice(-this.config.maxHistorySize);
    }

    // Save alert history
    this.saveAlertHistory();

    // Emit alert created event
    this.emit('alertCreated', alert);

    return alert;
  }

  // Calculate risk score for alert
  calculateRiskScore(indicator) {
    let baseScore = indicator.confidence;
    
    // Adjust based on severity
    switch (indicator.severity) {
      case 'CRITICAL':
        baseScore += 20;
        break;
      case 'HIGH':
        baseScore += 10;
        break;
      case 'MEDIUM':
        baseScore += 5;
        break;
    }

    // Adjust based on fraud type
    if (indicator.type.includes('MICRO_SKIMMING')) {
      baseScore += 15; // Micro-skimming is highly suspicious
    }

    return Math.min(100, baseScore);
  }

  // Calculate impact level
  calculateImpactLevel(indicator) {
    const amount = indicator.transaction ? Math.abs(indicator.transaction.amount) : 0;
    
    if (amount > 10000) return 'HIGH';
    if (amount > 1000) return 'MEDIUM';
    if (amount > 0.1) return 'LOW';
    return 'MICRO'; // For micro-skimming
  }

  // Generate recommended actions
  generateRecommendedActions(indicator) {
    const actions = [];
    
    switch (indicator.type) {
      case 'MICRO_SKIMMING_REAL_TIME':
        actions.push('Immediately investigate vendor for systematic micro-theft');
        actions.push('Review all transactions from this vendor in past 30 days');
        actions.push('Consider blocking future transactions from this vendor');
        break;
        
      case 'AFTER_HOURS_REAL_TIME':
        actions.push('Verify authorization for after-hours transaction');
        actions.push('Check employee access logs for this time period');
        actions.push('Review security camera footage if available');
        break;
        
      case 'LARGE_AMOUNT_REAL_TIME':
        actions.push('Verify transaction with authorized personnel');
        actions.push('Confirm transaction legitimacy with counterparty');
        actions.push('Review approval workflow compliance');
        break;
        
      default:
        actions.push('Investigate transaction details and authorization');
        actions.push('Review related transactions for patterns');
    }
    
    return actions;
  }

  // Send alert through all enabled notification channels
  async sendAlert(alert) {
    console.log(`🚨 FRAUD ALERT GENERATED: ${alert.id}`);
    console.log(`   Severity: ${alert.severity} | Confidence: ${alert.confidence}%`);
    console.log(`   Description: ${alert.description}`);

    const notificationPromises = [];

    // Send through all enabled channels
    for (const [channelName, channel] of Object.entries(this.notificationChannels)) {
      if (channel.enabled) {
        notificationPromises.push(
          channel.send(alert).catch(error => {
            console.error(`❌ Failed to send alert via ${channelName}:`, error);
          })
        );
      }
    }

    // Wait for all notifications to complete
    await Promise.allSettled(notificationPromises);

    // Start escalation timer for critical alerts
    if (alert.severity === 'CRITICAL') {
      this.startEscalationTimer(alert.id);
    }

    // Emit alert sent event
    this.emit('alertSent', alert);
  }

  // Console alert (always enabled for development)
  async sendConsoleAlert(alert) {
    const severityEmoji = {
      'CRITICAL': '🔴',
      'HIGH': '🟠', 
      'MEDIUM': '🟡',
      'LOW': '🟢'
    };

    console.log('\n' + '='.repeat(60));
    console.log(`${severityEmoji[alert.severity]} REAL-TIME FRAUD ALERT`);
    console.log('='.repeat(60));
    console.log(`Alert ID: ${alert.id}`);
    console.log(`Timestamp: ${alert.timestamp}`);
    console.log(`Severity: ${alert.severity}`);
    console.log(`Confidence: ${alert.confidence}%`);
    console.log(`Risk Score: ${alert.riskScore}/100`);
    console.log(`Description: ${alert.description}`);
    
    if (alert.affectedTransaction) {
      console.log('\nAffected Transaction:');
      console.log(`  ID: ${alert.affectedTransaction.id}`);
      console.log(`  Amount: $${Math.abs(alert.affectedTransaction.amount).toFixed(4)}`);
      console.log(`  Vendor: ${alert.affectedTransaction.vendor}`);
      console.log(`  Date: ${alert.affectedTransaction.date}`);
    }
    
    console.log('\nRecommended Actions:');
    alert.recommendedActions.forEach((action, index) => {
      console.log(`  ${index + 1}. ${action}`);
    });
    
    console.log('='.repeat(60) + '\n');
  }

  // Email alert implementation (mock)
  async sendEmailAlert(alert) {
    console.log(`📧 Sending email alert for ${alert.id}`);
    
    // Mock email sending - in production, integrate with:
    // - SendGrid, Mailgun, AWS SES, etc.
    const emailData = {
      to: 'fraud-team@company.com',
      subject: `🚨 FRAUD ALERT: ${alert.severity} - ${alert.description}`,
      body: this.generateEmailBody(alert)
    };
    
    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    console.log(`✅ Email alert sent successfully`);
    return { success: true, channel: 'email', alertId: alert.id };
  }

  // SMS alert implementation (mock)
  async sendSMSAlert(alert) {
    console.log(`📱 Sending SMS alert for ${alert.id}`);
    
    // Mock SMS sending - in production, integrate with:
    // - Twilio, AWS SNS, etc.
    const smsData = {
      to: '+1234567890',
      message: `FRAUD ALERT: ${alert.severity} - ${alert.description.substring(0, 100)}... Alert ID: ${alert.id}`
    };
    
    // Simulate SMS sending delay
    await new Promise(resolve => setTimeout(resolve, 150));
    
    console.log(`✅ SMS alert sent successfully`);
    return { success: true, channel: 'sms', alertId: alert.id };
  }

  // Desktop notification implementation
  async sendDesktopNotification(alert) {
    console.log(`🖥️  Sending desktop notification for ${alert.id}`);
    
    // In a real implementation, use node-notifier or similar
    try {
      // Mock desktop notification
      console.log(`💻 Desktop notification: ${alert.severity} Fraud Alert - ${alert.description}`);
      
      return { success: true, channel: 'desktop', alertId: alert.id };
    } catch (error) {
      console.error('Desktop notification failed:', error);
      return { success: false, channel: 'desktop', alertId: alert.id, error: error.message };
    }
  }

  // Webhook alert implementation (mock)
  async sendWebhookAlert(alert) {
    console.log(`🔗 Sending webhook alert for ${alert.id}`);
    
    // Mock webhook sending - in production, make HTTP POST to configured endpoints
    const webhookData = {
      alertId: alert.id,
      timestamp: alert.timestamp,
      severity: alert.severity,
      type: alert.subType,
      description: alert.description,
      riskScore: alert.riskScore,
      transaction: alert.affectedTransaction
    };
    
    // Simulate webhook sending delay
    await new Promise(resolve => setTimeout(resolve, 200));
    
    console.log(`✅ Webhook alert sent successfully`);
    return { success: true, channel: 'webhook', alertId: alert.id };
  }

  // Generate email body
  generateEmailBody(alert) {
    return `
FRAUD DETECTION ALERT

Alert ID: ${alert.id}
Timestamp: ${alert.timestamp}
Severity: ${alert.severity}
Confidence: ${alert.confidence}%
Risk Score: ${alert.riskScore}/100

Description: ${alert.description}

Affected Transaction:
- ID: ${alert.affectedTransaction?.id}
- Amount: $${alert.affectedTransaction ? Math.abs(alert.affectedTransaction.amount).toFixed(4) : 'N/A'}
- Vendor: ${alert.affectedTransaction?.vendor}
- Date: ${alert.affectedTransaction?.date}

Recommended Actions:
${alert.recommendedActions.map((action, i) => `${i + 1}. ${action}`).join('\n')}

Please investigate immediately and acknowledge this alert in the fraud management system.
    `;
  }

  // Acknowledge alert
  acknowledgeAlert(alertId, acknowledgedBy = 'system') {
    const alert = this.activeAlerts.get(alertId);
    
    if (!alert) {
      throw new Error(`Alert ${alertId} not found`);
    }
    
    alert.acknowledged = true;
    alert.acknowledgedBy = acknowledgedBy;
    alert.acknowledgedAt = new Date().toISOString();
    
    this.acknowledgedAlerts.add(alertId);
    
    console.log(`✅ Alert ${alertId} acknowledged by ${acknowledgedBy}`);
    
    // Emit acknowledgment event
    this.emit('alertAcknowledged', { alertId, acknowledgedBy, alert });
    
    return alert;
  }

  // Start escalation timer
  startEscalationTimer(alertId) {
    setTimeout(() => {
      if (!this.acknowledgedAlerts.has(alertId)) {
        this.escalateAlert(alertId);
      }
    }, this.config.escalationTimeout);
  }

  // Escalate unacknowledged alert
  async escalateAlert(alertId) {
    const alert = this.activeAlerts.get(alertId);
    
    if (!alert || alert.acknowledged) {
      return; // Alert was acknowledged or doesn't exist
    }
    
    alert.escalated = true;
    alert.escalatedAt = new Date().toISOString();
    
    console.log(`🚨 ESCALATING UNACKNOWLEDGED CRITICAL ALERT: ${alertId}`);
    
    // Send escalation notifications
    await this.sendEscalationNotifications(alert);
    
    // Emit escalation event
    this.emit('alertEscalated', alert);
  }

  // Send escalation notifications
  async sendEscalationNotifications(alert) {
    // Send to management/emergency contacts
    console.log(`📞 Sending escalation notifications for alert ${alert.id}`);
    
    // In production, this would send to:
    // - Management email list
    // - Emergency phone numbers
    // - Slack/Teams channels
    // - PagerDuty/OpsGenie
  }

  // Get alert statistics
  getAlertStatistics() {
    const now = moment();
    const last24Hours = now.clone().subtract(24, 'hours');
    const last7Days = now.clone().subtract(7, 'days');
    
    const recent24h = this.alertHistory.filter(alert => 
      moment(alert.timestamp).isAfter(last24Hours)
    );
    
    const recent7d = this.alertHistory.filter(alert => 
      moment(alert.timestamp).isAfter(last7Days)
    );
    
    return {
      total: this.alertHistory.length,
      active: this.activeAlerts.size,
      acknowledged: this.acknowledgedAlerts.size,
      last24Hours: recent24h.length,
      last7Days: recent7d.length,
      
      severityBreakdown: {
        critical: this.alertHistory.filter(a => a.severity === 'CRITICAL').length,
        high: this.alertHistory.filter(a => a.severity === 'HIGH').length,
        medium: this.alertHistory.filter(a => a.severity === 'MEDIUM').length,
        low: this.alertHistory.filter(a => a.severity === 'LOW').length
      },
      
      typeBreakdown: this.getTypeBreakdown(),
      
      isMonitoring: this.isMonitoring
    };
  }

  // Get type breakdown
  getTypeBreakdown() {
    const breakdown = {};
    
    this.alertHistory.forEach(alert => {
      const type = alert.subType || alert.type;
      breakdown[type] = (breakdown[type] || 0) + 1;
    });
    
    return breakdown;
  }

  // Load alert history from file
  loadAlertHistory() {
    try {
      if (fs.existsSync(this.config.alertHistoryPath)) {
        const data = fs.readFileSync(this.config.alertHistoryPath, 'utf8');
        this.alertHistory = JSON.parse(data);
        console.log(`📁 Loaded ${this.alertHistory.length} alerts from history`);
      }
    } catch (error) {
      console.warn('⚠️  Could not load alert history:', error.message);
      this.alertHistory = [];
    }
  }

  // Save alert history to file
  saveAlertHistory() {
    try {
      fs.writeFileSync(
        this.config.alertHistoryPath, 
        JSON.stringify(this.alertHistory, null, 2)
      );
    } catch (error) {
      console.error('❌ Could not save alert history:', error);
    }
  }

  // Cleanup old alerts
  cleanupOldAlerts(daysToKeep = 30) {
    const cutoffDate = moment().subtract(daysToKeep, 'days');
    
    const beforeCount = this.alertHistory.length;
    this.alertHistory = this.alertHistory.filter(alert => 
      moment(alert.timestamp).isAfter(cutoffDate)
    );
    
    const removedCount = beforeCount - this.alertHistory.length;
    
    if (removedCount > 0) {
      console.log(`🧹 Cleaned up ${removedCount} old alerts`);
      this.saveAlertHistory();
    }
  }
}

export default FraudAlertNotificationService;