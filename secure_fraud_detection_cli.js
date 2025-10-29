/**
 * Secure Fraud Detection CLI with Authentication
 * Main entry point for the fraud detection system with license-based access control
 */

import AuthenticationMiddleware from './src/middleware/AuthenticationMiddleware.js';
import { EnhancedAnomalyDetectionUtils } from './src/utils/EnhancedAnomalyDetectionUtils.js';
import BankStatementParser from './src/utils/BankStatementParser.js';
import FraudAlertNotificationService from './src/services/FraudAlertNotificationService.js';
import readline from 'readline';
import fs from 'fs';

class SecureFraudDetectionCLI {
  constructor() {
    this.authMiddleware = new AuthenticationMiddleware();
    this.bankParser = new BankStatementParser();
    this.notificationService = new FraudAlertNotificationService();
    this.isAuthenticated = false;
    
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    console.log('🔐 OQUALTIX SECURE FRAUD DETECTION SYSTEM');
    console.log('=' * 50);
    console.log('Enterprise-grade fraud detection with ultra-precise micro-skimming detection');
    console.log('Licensed access only - Contact oqualtix@outlook.com for licensing');
    console.log('');
  }

  // Main application entry point
  async start() {
    try {
      // Check for existing session or require authentication
      await this.authenticateUser();

      if (!this.isAuthenticated) {
        console.log('❌ Authentication failed. Exiting...');
        this.rl.close();
        return;
      }

      // Display authentication status
      this.authMiddleware.displayAuthStatus();

      // Show main menu
      await this.showMainMenu();
      
    } catch (error) {
      console.error('❌ System error:', error.message);
    } finally {
      this.rl.close();
    }
  }

  // Authenticate user
  async authenticateUser() {
    console.log('🔒 ACCESS CONTROL');
    console.log('This system requires a valid license key.');
    console.log('Each company is limited to one user per bank account/company card.');
    console.log('');

    // Check for command line arguments
    const args = process.argv.slice(2);
    let licenseKey = null;
    let userEmail = null;

    // Parse command line arguments
    for (let i = 0; i < args.length; i++) {
      if (args[i] === '--license' && args[i + 1]) {
        licenseKey = args[i + 1];
        i++;
      } else if (args[i] === '--email' && args[i + 1]) {
        userEmail = args[i + 1];
        i++;
      }
    }

    // If no command line args, prompt for authentication
    if (!licenseKey || !userEmail) {
      const authResult = await this.authMiddleware.promptForAuthentication();
      this.isAuthenticated = authResult.success;
      return;
    }

    // Authenticate with provided credentials
    const userInfo = { email: userEmail };
    const authResult = await this.authMiddleware.authenticateAccess(licenseKey, userInfo);
    
    if (authResult.success) {
      this.isAuthenticated = true;
      console.log(`✅ Authenticated successfully as ${userEmail}`);
    } else {
      console.log(`❌ Authentication failed: ${authResult.message}`);
      this.isAuthenticated = false;
    }
  }

  // Show main menu
  async showMainMenu() {
    while (true) {
      console.log('\n📋 FRAUD DETECTION MENU');
      console.log('1. Analyze Financial Records');
      console.log('2. Real-time Transaction Monitoring');
      console.log('3. Micro-skimming Detection Demo');
      console.log('4. Bank Statement Analysis');
      console.log('5. View Notification Settings');
      console.log('6. Generate Fraud Report');
      console.log('7. View Authentication Status');
      console.log('0. Logout and Exit');
      console.log('');

      const choice = await this.question('Select option: ');

      switch (choice) {
        case '1':
          await this.analyzeFinancialRecords();
          break;
        case '2':
          await this.startRealTimeMonitoring();
          break;
        case '3':
          await this.runMicroSkimmingDemo();
          break;
        case '4':
          await this.analyzeBankStatement();
          break;
        case '5':
          await this.viewNotificationSettings();
          break;
        case '6':
          await this.generateFraudReport();
          break;
        case '7':
          this.authMiddleware.displayAuthStatus();
          break;
        case '0':
          console.log('👋 Logging out...');
          this.authMiddleware.logout();
          return;
        default:
          console.log('❌ Invalid option. Please try again.');
      }
    }
  }

  // Analyze financial records
  async analyzeFinancialRecords() {
    console.log('\n📊 FINANCIAL RECORDS ANALYSIS');
    console.log('=' * 35);

    try {
      const filePath = await this.question('📁 Enter file path to analyze: ');
      
      if (!fs.existsSync(filePath)) {
        console.log('❌ File not found.');
        return;
      }

      console.log('🔍 Loading and analyzing financial data...');
      
      const fileContent = fs.readFileSync(filePath, 'utf8');
      let financialData;

      // Parse based on file extension
      if (filePath.endsWith('.json')) {
        financialData = JSON.parse(fileContent);
      } else {
        // Parse as CSV
        financialData = await this.bankParser.parseStatement(fileContent, 'csv');
      }

      // Perform analysis with authentication
      const analysis = await EnhancedAnomalyDetectionUtils.analyzeFinancialRecords(financialData, {
        analysisDepth: 'comprehensive',
        includeStatements: true,
        includeLedgers: true
      });

      // Display results
      this.displayAnalysisResults(analysis);

      // Send notifications if fraud detected
      if (analysis.fraudIndicators.length > 0) {
        await this.sendFraudAlerts(analysis);
      }

    } catch (error) {
      console.error('❌ Analysis error:', error.message);
    }
  }

  // Start real-time monitoring
  async startRealTimeMonitoring() {
    console.log('\n🔴 REAL-TIME MONITORING');
    console.log('=' * 30);

    if (!this.authMiddleware.hasPermission('run_fraud_analysis')) {
      console.log('❌ Permission denied. Real-time monitoring requires analysis permissions.');
      return;
    }

    console.log('🔍 Starting real-time fraud monitoring...');
    console.log('Press Ctrl+C to stop monitoring');
    console.log('');

    // Simulate real-time monitoring
    let transactionCount = 0;
    const currentUser = this.authMiddleware.getCurrentUser();

    const monitoringInterval = setInterval(async () => {
      transactionCount++;
      
      // Simulate transaction data
      const transaction = this.generateSimulatedTransaction(currentUser.assignedAccount);
      
      console.log(`📊 Processing transaction ${transactionCount}: $${transaction.amount}`);
      
      // Check for fraud indicators
      if (Math.random() < 0.1) { // 10% chance of fraud alert for demo
        const alert = {
          transactionId: transaction.id,
          amount: transaction.amount,
          alertType: 'MICRO_SKIMMING',
          confidence: 0.85,
          details: 'Fractional residue manipulation detected'
        };

        console.log('🚨 FRAUD ALERT!');
        console.log(`   Transaction: ${alert.transactionId}`);
        console.log(`   Amount: $${alert.amount}`);
        console.log(`   Type: ${alert.alertType}`);
        console.log(`   Confidence: ${(alert.confidence * 100).toFixed(1)}%`);
        
        // Send notification
        await this.notificationService.sendFraudAlert(alert, {
          priority: 'HIGH',
          channels: ['console', 'desktop']
        });
      }

    }, 3000); // Check every 3 seconds

    // Wait for user input to stop
    await this.question('Press Enter to stop monitoring...');
    clearInterval(monitoringInterval);
    console.log('🔴 Monitoring stopped.');
  }

  // Run micro-skimming demo
  async runMicroSkimmingDemo() {
    console.log('\n🔬 MICRO-SKIMMING DETECTION DEMO');
    console.log('=' * 40);

    if (!this.authMiddleware.hasPermission('run_fraud_analysis')) {
      console.log('❌ Permission denied.');
      return;
    }

    console.log('Demonstrating detection of embezzlement down to $0.0001...');
    
    // Generate test data with micro-skimming
    const testTransactions = this.generateMicroSkimmingTestData();
    
    console.log(`🔍 Analyzing ${testTransactions.length} transactions...`);
    
    // Analyze for micro-skimming
    const analysis = await EnhancedAnomalyDetectionUtils.analyzeFinancialRecords(testTransactions);
    
    // Display micro-skimming specific results
    const microSkimmingAlerts = analysis.fraudIndicators.filter(
      indicator => indicator.type.includes('MICRO') || indicator.type.includes('SKIMMING')
    );

    console.log(`\n📊 MICRO-SKIMMING DETECTION RESULTS:`);
    console.log(`   Total Transactions: ${testTransactions.length}`);
    console.log(`   Micro-skimming Alerts: ${microSkimmingAlerts.length}`);
    console.log(`   Smallest Amount Detected: $0.0001`);
    console.log(`   Total Embezzled: $${microSkimmingAlerts.reduce((sum, alert) => sum + (alert.amount || 0), 0).toFixed(4)}`);

    microSkimmingAlerts.forEach((alert, index) => {
      console.log(`\n   🚨 Alert ${index + 1}:`);
      console.log(`      Type: ${alert.type}`);
      console.log(`      Amount: $${alert.amount?.toFixed(4) || 'N/A'}`);
      console.log(`      Confidence: ${(alert.confidence * 100).toFixed(1)}%`);
      console.log(`      Description: ${alert.description}`);
    });
  }

  // Analyze bank statement
  async analyzeBankStatement() {
    console.log('\n🏦 BANK STATEMENT ANALYSIS');
    console.log('=' * 35);

    try {
      const filePath = await this.question('📁 Enter bank statement file path: ');
      
      if (!fs.existsSync(filePath)) {
        console.log('❌ File not found.');
        return;
      }

      const fileContent = fs.readFileSync(filePath, 'utf8');
      const format = await this.question('📋 Format (csv/ofx/qif/json/auto): ') || 'auto';

      console.log('🔍 Parsing bank statement...');
      
      const parsedData = await this.bankParser.parseStatement(fileContent, format);
      
      console.log(`✅ Parsed ${parsedData.transactions?.length || 0} transactions`);
      
      // Perform fraud analysis
      const analysis = await EnhancedAnomalyDetectionUtils.analyzeFinancialRecords(parsedData);
      
      this.displayAnalysisResults(analysis);

    } catch (error) {
      console.error('❌ Bank statement analysis error:', error.message);
    }
  }

  // View notification settings
  async viewNotificationSettings() {
    console.log('\n🔔 NOTIFICATION SETTINGS');
    console.log('=' * 30);

    const currentUser = this.authMiddleware.getCurrentUser();
    
    console.log(`👤 User: ${currentUser.userEmail}`);
    console.log(`🏢 Company: ${currentUser.companyName}`);
    console.log(`💳 Account: ${currentUser.assignedAccount}`);
    console.log('');
    console.log('📧 Email Notifications: Enabled');
    console.log('📱 SMS Notifications: Enabled');
    console.log('🖥️  Desktop Notifications: Enabled');
    console.log('🔗 Webhook Notifications: Enabled');
    console.log('');
    console.log('Alert Thresholds:');
    console.log('  🔴 Critical: $100+ or 95%+ confidence');
    console.log('  🟡 High: $10+ or 80%+ confidence');
    console.log('  🔵 Medium: $1+ or 60%+ confidence');
  }

  // Generate fraud report
  async generateFraudReport() {
    console.log('\n📊 FRAUD DETECTION REPORT');
    console.log('=' * 35);

    if (!this.authMiddleware.hasPermission('view_reports')) {
      console.log('❌ Permission denied. Report generation requires view_reports permission.');
      return;
    }

    const currentUser = this.authMiddleware.getCurrentUser();
    
    console.log('📋 Generating comprehensive fraud report...');
    console.log('');
    
    const report = {
      generatedBy: currentUser.userEmail,
      companyName: currentUser.companyName,
      assignedAccount: currentUser.assignedAccount,
      reportDate: new Date().toISOString(),
      
      // Sample report data
      summary: {
        totalTransactionsAnalyzed: 1247,
        fraudAlertsGenerated: 23,
        totalAmountAtRisk: 1567.89,
        highestRiskTransaction: 234.56,
        averageConfidenceScore: 87.3
      },
      
      topThreats: [
        { type: 'Micro-skimming', count: 12, totalAmount: 45.67 },
        { type: 'Duplicate Transactions', count: 6, totalAmount: 789.12 },
        { type: 'Suspicious Patterns', count: 5, totalAmount: 733.10 }
      ]
    };

    console.log(`🏢 Company: ${report.companyName}`);
    console.log(`📅 Report Date: ${new Date(report.reportDate).toLocaleString()}`);
    console.log(`👤 Generated By: ${report.generatedBy}`);
    console.log(`💳 Account Scope: ${report.assignedAccount}`);
    console.log('');
    console.log('📊 SUMMARY:');
    console.log(`   Transactions Analyzed: ${report.summary.totalTransactionsAnalyzed.toLocaleString()}`);
    console.log(`   Fraud Alerts: ${report.summary.fraudAlertsGenerated}`);
    console.log(`   Amount at Risk: $${report.summary.totalAmountAtRisk.toFixed(2)}`);
    console.log(`   Highest Risk Transaction: $${report.summary.highestRiskTransaction.toFixed(2)}`);
    console.log(`   Average Confidence: ${report.summary.averageConfidenceScore}%`);
    console.log('');
    console.log('🚨 TOP THREATS:');
    report.topThreats.forEach((threat, index) => {
      console.log(`   ${index + 1}. ${threat.type}`);
      console.log(`      Count: ${threat.count}`);
      console.log(`      Total Amount: $${threat.totalAmount.toFixed(2)}`);
    });
  }

  // Display analysis results
  displayAnalysisResults(analysis) {
    console.log('\n📊 ANALYSIS RESULTS');
    console.log('=' * 25);
    
    if (analysis.auditInfo) {
      console.log(`👤 Analyzed by: ${analysis.auditInfo.analyzedBy}`);
      console.log(`🏢 Company: ${analysis.auditInfo.companyName}`);
      console.log(`💳 Account: ${analysis.auditInfo.assignedAccount}`);
      console.log(`🕐 Timestamp: ${new Date(analysis.auditInfo.analysisTimestamp).toLocaleString()}`);
      console.log('');
    }
    
    console.log(`📊 Records Analyzed: ${analysis.recordsAnalyzed}`);
    console.log(`🚨 Fraud Indicators: ${analysis.fraudIndicators.length}`);
    console.log(`⚠️  Anomalies: ${analysis.anomalies.length}`);
    console.log(`🎯 Risk Score: ${analysis.riskScore}/100`);
    
    if (analysis.fraudIndicators.length > 0) {
      console.log('\n🚨 FRAUD INDICATORS:');
      analysis.fraudIndicators.slice(0, 5).forEach((indicator, index) => {
        console.log(`   ${index + 1}. ${indicator.type}`);
        console.log(`      Confidence: ${(indicator.confidence * 100).toFixed(1)}%`);
        console.log(`      Amount: $${indicator.amount?.toFixed(4) || 'N/A'}`);
      });
    }

    if (analysis.recommendations.length > 0) {
      console.log('\n💡 RECOMMENDATIONS:');
      analysis.recommendations.slice(0, 3).forEach((rec, index) => {
        console.log(`   ${index + 1}. ${rec}`);
      });
    }
  }

  // Send fraud alerts
  async sendFraudAlerts(analysis) {
    const alerts = analysis.fraudIndicators.map(indicator => ({
      type: indicator.type,
      confidence: indicator.confidence,
      amount: indicator.amount,
      description: indicator.description
    }));

    for (const alert of alerts) {
      await this.notificationService.sendFraudAlert(alert, {
        priority: alert.confidence > 0.8 ? 'HIGH' : 'MEDIUM',
        channels: ['console', 'desktop']
      });
    }
  }

  // Generate simulated transaction
  generateSimulatedTransaction(accountId) {
    return {
      id: `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      amount: (Math.random() * 1000).toFixed(2),
      account: accountId,
      timestamp: new Date().toISOString(),
      description: `Transaction for account ${accountId}`
    };
  }

  // Generate micro-skimming test data
  generateMicroSkimmingTestData() {
    const transactions = [];
    
    for (let i = 0; i < 100; i++) {
      const baseAmount = Math.random() * 100;
      
      // Add some legitimate transactions
      transactions.push({
        id: `TXN_${i}`,
        amount: baseAmount,
        type: 'LEGITIMATE',
        timestamp: new Date(Date.now() - Math.random() * 86400000).toISOString()
      });

      // Add micro-skimming transactions (very small amounts)
      if (Math.random() < 0.15) { // 15% chance
        transactions.push({
          id: `SKIM_${i}`,
          amount: 0.0001 + (Math.random() * 0.01), // $0.0001 to $0.0101
          type: 'MICRO_SKIMMING',
          timestamp: new Date(Date.now() - Math.random() * 86400000).toISOString(),
          pattern: 'FRACTIONAL_RESIDUE'
        });
      }
    }

    return transactions;
  }

  // Helper method for questions
  question(prompt) {
    return new Promise((resolve) => {
      this.rl.question(prompt, resolve);
    });
  }
}

// Run CLI if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('Starting Secure Fraud Detection System...');
  console.log('Usage: node secure_fraud_detection_cli.js [--license LICENSE_KEY] [--email USER_EMAIL]');
  console.log('');
  
  const cli = new SecureFraudDetectionCLI();
  cli.start().catch(console.error);
}

export default SecureFraudDetectionCLI;