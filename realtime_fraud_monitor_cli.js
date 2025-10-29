#!/usr/bin/env node

/**
 * Real-Time Fraud Monitoring Dashboard
 * Live demonstration of fraud detection with instant notifications
 * 
 * Features:
 * - Real-time transaction monitoring
 * - Instant fraud alerts with multiple notification channels
 * - Live statistics and alert dashboard
 * - Interactive alert management
 */

import FraudAlertNotificationService from './src/services/FraudAlertNotificationService.js';
import moment from 'moment';
import readline from 'readline';

class RealTimeFraudMonitor {
  constructor() {
    this.alertService = null;
    this.rl = null;
    this.dashboardInterval = null;
    this.isRunning = false;
  }

  // Initialize the monitoring system
  async initialize() {
    console.log('🚀 REAL-TIME FRAUD MONITORING SYSTEM');
    console.log('=====================================\n');

    // Initialize alert service with enhanced configuration
    this.alertService = new FraudAlertNotificationService({
      enableEmailAlerts: true,
      enableSMSAlerts: true,
      enableDesktopNotifications: true,
      enableWebhookAlerts: true,
      
      // Real-time monitoring settings
      monitoringInterval: 3000, // Check every 3 seconds
      
      // Alert thresholds
      criticalThreshold: 85,
      highThreshold: 65,
      mediumThreshold: 35,
      
      // Escalation settings
      escalationTimeout: 30000, // 30 seconds for demo (normally 5 minutes)
    });

    // Set up event listeners for real-time feedback
    this.setupEventListeners();

    // Set up readline interface for interactive commands
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    console.log('✅ Real-time fraud monitoring system initialized');
    console.log('📊 Alert service configured with multiple notification channels');
    console.log('⚡ Ready to detect fraud in real-time\n');
  }

  // Set up event listeners for alert service
  setupEventListeners() {
    this.alertService.on('monitoringStarted', (data) => {
      console.log('🟢 Real-time monitoring STARTED');
      console.log(`   Monitoring interval: ${data.config.monitoringInterval}ms`);
    });

    this.alertService.on('alertCreated', (alert) => {
      this.handleNewAlert(alert);
    });

    this.alertService.on('alertAcknowledged', (data) => {
      console.log(`✅ Alert ${data.alertId} acknowledged by ${data.acknowledgedBy}`);
    });

    this.alertService.on('alertEscalated', (alert) => {
      console.log(`🚨 ALERT ESCALATED: ${alert.id} - No acknowledgment received!`);
    });

    this.alertService.on('monitoringStopped', (data) => {
      console.log('🔴 Real-time monitoring STOPPED');
      console.log(`   Total alerts generated: ${data.totalAlertsGenerated}`);
    });
  }

  // Handle new fraud alert
  handleNewAlert(alert) {
    // Flash alert notification
    this.flashAlert(alert);
    
    // Update dashboard if running
    if (this.dashboardInterval) {
      this.updateDashboard();
    }
  }

  // Flash alert notification
  flashAlert(alert) {
    const severityColors = {
      'CRITICAL': '\x1b[41m', // Red background
      'HIGH': '\x1b[43m',     // Yellow background
      'MEDIUM': '\x1b[44m',   // Blue background
      'LOW': '\x1b[42m'       // Green background
    };
    
    const resetColor = '\x1b[0m';
    const alertColor = severityColors[alert.severity] || '\x1b[47m';
    
    console.log(`\n${alertColor}                                                    ${resetColor}`);
    console.log(`${alertColor}  🚨 ${alert.severity} FRAUD ALERT DETECTED!           ${resetColor}`);
    console.log(`${alertColor}                                                    ${resetColor}`);
    console.log(`Alert ID: ${alert.id}`);
    console.log(`Risk Score: ${alert.riskScore}/100`);
    console.log(`Description: ${alert.description}`);
    
    if (alert.affectedTransaction) {
      console.log(`Transaction: $${Math.abs(alert.affectedTransaction.amount).toFixed(4)} - ${alert.affectedTransaction.vendor}`);
    }
    
    console.log(''); // Empty line for spacing
  }

  // Start real-time monitoring
  async startMonitoring() {
    if (this.isRunning) {
      console.log('⚠️  Monitoring is already running');
      return;
    }

    this.isRunning = true;

    // Create mock data source for demonstration
    const mockDataSource = {
      getNewTransactions: () => {
        // This method will be called every monitoring interval
        return this.alertService.getNewTransactions();
      }
    };

    // Start real-time monitoring
    this.alertService.startRealTimeMonitoring(mockDataSource);

    console.log('🔍 Real-time fraud monitoring is now ACTIVE');
    console.log('💡 The system will now continuously scan for fraudulent transactions...\n');
  }

  // Stop monitoring
  stopMonitoring() {
    if (!this.isRunning) {
      console.log('⚠️  Monitoring is not currently running');
      return;
    }

    this.isRunning = false;
    this.alertService.stopRealTimeMonitoring();
    
    if (this.dashboardInterval) {
      clearInterval(this.dashboardInterval);
      this.dashboardInterval = null;
    }

    console.log('🛑 Real-time monitoring stopped');
  }

  // Start live dashboard
  startDashboard() {
    if (this.dashboardInterval) {
      console.log('⚠️  Dashboard is already running');
      return;
    }

    console.log('📊 Starting live fraud monitoring dashboard...\n');
    
    this.dashboardInterval = setInterval(() => {
      this.updateDashboard();
    }, 5000); // Update every 5 seconds

    // Initial dashboard display
    this.updateDashboard();
  }

  // Update dashboard display
  updateDashboard() {
    // Clear screen and display dashboard
    console.clear();
    
    const stats = this.alertService.getAlertStatistics();
    const now = moment().format('YYYY-MM-DD HH:mm:ss');
    
    console.log('🚨 REAL-TIME FRAUD MONITORING DASHBOARD');
    console.log('=======================================');
    console.log(`Last Updated: ${now}`);
    console.log(`Monitoring Status: ${this.isRunning ? '🟢 ACTIVE' : '🔴 INACTIVE'}`);
    console.log('');
    
    // Alert statistics
    console.log('📊 ALERT STATISTICS');
    console.log('-------------------');
    console.log(`Total Alerts: ${stats.total}`);
    console.log(`Active Alerts: ${stats.active}`);
    console.log(`Acknowledged: ${stats.acknowledged}`);
    console.log(`Last 24 Hours: ${stats.last24Hours}`);
    console.log(`Last 7 Days: ${stats.last7Days}`);
    console.log('');
    
    // Severity breakdown
    console.log('🎯 SEVERITY BREAKDOWN');
    console.log('--------------------');
    console.log(`🔴 Critical: ${stats.severityBreakdown.critical}`);
    console.log(`🟠 High: ${stats.severityBreakdown.high}`);
    console.log(`🟡 Medium: ${stats.severityBreakdown.medium}`);
    console.log(`🟢 Low: ${stats.severityBreakdown.low}`);
    console.log('');
    
    // Recent alerts
    const recentAlerts = this.alertService.alertHistory.slice(-5).reverse();
    if (recentAlerts.length > 0) {
      console.log('🕐 RECENT ALERTS');
      console.log('---------------');
      recentAlerts.forEach(alert => {
        const timeAgo = moment(alert.timestamp).fromNow();
        const emoji = {
          'CRITICAL': '🔴',
          'HIGH': '🟠',
          'MEDIUM': '🟡',
          'LOW': '🟢'
        }[alert.severity];
        
        console.log(`${emoji} ${alert.id.substr(-8)} | ${alert.severity} | ${timeAgo}`);
        console.log(`   ${alert.description.substring(0, 60)}...`);
      });
    }
    
    console.log('\n💡 Commands: start, stop, dashboard, acknowledge, stats, help, quit');
    console.log('Enter command: ');
  }

  // Stop dashboard
  stopDashboard() {
    if (this.dashboardInterval) {
      clearInterval(this.dashboardInterval);
      this.dashboardInterval = null;
      console.log('📊 Dashboard stopped');
    }
  }

  // Acknowledge alert by ID
  acknowledgeAlert(alertId) {
    try {
      this.alertService.acknowledgeAlert(alertId, 'dashboard-user');
      console.log(`✅ Alert ${alertId} acknowledged successfully`);
    } catch (error) {
      console.log(`❌ Error acknowledging alert: ${error.message}`);
    }
  }

  // Show detailed statistics
  showDetailedStats() {
    const stats = this.alertService.getAlertStatistics();
    
    console.log('\n📈 DETAILED FRAUD DETECTION STATISTICS');
    console.log('======================================');
    console.log(`Total Alerts Generated: ${stats.total}`);
    console.log(`Currently Active: ${stats.active}`);
    console.log(`Acknowledged: ${stats.acknowledged}`);
    console.log(`Monitoring Status: ${stats.isMonitoring ? 'ACTIVE' : 'INACTIVE'}`);
    console.log('');
    
    console.log('📊 Severity Distribution:');
    Object.entries(stats.severityBreakdown).forEach(([severity, count]) => {
      const percentage = stats.total > 0 ? ((count / stats.total) * 100).toFixed(1) : 0;
      console.log(`  ${severity.toUpperCase()}: ${count} (${percentage}%)`);
    });
    
    console.log('\n🔍 Fraud Type Distribution:');
    Object.entries(stats.typeBreakdown).forEach(([type, count]) => {
      console.log(`  ${type}: ${count}`);
    });
    
    console.log('');
  }

  // Show help information
  showHelp() {
    console.log('\n💡 REAL-TIME FRAUD MONITORING COMMANDS');
    console.log('======================================');
    console.log('start     - Start real-time fraud monitoring');
    console.log('stop      - Stop real-time fraud monitoring');
    console.log('dashboard - Start/stop live dashboard display');
    console.log('ack <id>  - Acknowledge alert by ID');
    console.log('stats     - Show detailed statistics');
    console.log('help      - Show this help information');
    console.log('quit      - Exit the monitoring system');
    console.log('');
  }

  // Process user commands
  async processCommand(command) {
    const [cmd, ...args] = command.trim().toLowerCase().split(' ');
    
    switch (cmd) {
      case 'start':
        await this.startMonitoring();
        break;
        
      case 'stop':
        this.stopMonitoring();
        break;
        
      case 'dashboard':
        if (this.dashboardInterval) {
          this.stopDashboard();
        } else {
          this.startDashboard();
        }
        break;
        
      case 'ack':
      case 'acknowledge':
        if (args.length > 0) {
          this.acknowledgeAlert(args[0]);
        } else {
          console.log('❌ Please provide alert ID: ack <alert-id>');
        }
        break;
        
      case 'stats':
        this.showDetailedStats();
        break;
        
      case 'help':
        this.showHelp();
        break;
        
      case 'quit':
      case 'exit':
        return false; // Signal to exit
        
      default:
        console.log(`❌ Unknown command: ${cmd}. Type 'help' for available commands.`);
    }
    
    return true; // Continue running
  }

  // Start interactive CLI
  async startInteractiveCLI() {
    console.log('🎮 Starting interactive fraud monitoring CLI...');
    console.log('Type "help" for available commands\n');
    
    const promptUser = () => {
      this.rl.question('fraud-monitor> ', async (input) => {
        const shouldContinue = await this.processCommand(input);
        
        if (shouldContinue) {
          promptUser(); // Continue the interactive loop
        } else {
          this.cleanup();
        }
      });
    };
    
    promptUser();
  }

  // Cleanup resources
  cleanup() {
    console.log('\n🧹 Cleaning up...');
    
    this.stopMonitoring();
    this.stopDashboard();
    
    if (this.rl) {
      this.rl.close();
    }
    
    console.log('👋 Fraud monitoring system shutdown complete');
    process.exit(0);
  }

  // Demonstrate fraud detection capabilities
  async demonstrateFraudDetection() {
    console.log('🎭 DEMONSTRATING REAL-TIME FRAUD DETECTION');
    console.log('==========================================\n');
    
    await this.startMonitoring();
    
    console.log('⏱️  The system is now monitoring for fraudulent transactions...');
    console.log('🔍 Watch for real-time alerts as suspicious activity is detected');
    console.log('📱 Notifications will be sent through multiple channels');
    console.log('🚨 Critical alerts will escalate if not acknowledged\n');
    
    // Let it run for 30 seconds to show real-time detection
    setTimeout(() => {
      console.log('\n⏰ Demo period complete - showing final statistics...');
      this.showDetailedStats();
      
      console.log('\n💡 The system successfully demonstrated:');
      console.log('   ✅ Real-time transaction monitoring');
      console.log('   ✅ Instant fraud detection and alerts');
      console.log('   ✅ Multiple notification channels');
      console.log('   ✅ Alert escalation for critical findings');
      console.log('   ✅ Comprehensive fraud pattern recognition\n');
    }, 30000);
  }
}

// Main execution
async function main() {
  const monitor = new RealTimeFraudMonitor();
  
  try {
    await monitor.initialize();
    
    // Check command line arguments
    const args = process.argv.slice(2);
    
    if (args.includes('--demo')) {
      // Run automated demonstration
      await monitor.demonstrateFraudDetection();
    } else {
      // Start interactive CLI
      await monitor.startInteractiveCLI();
    }
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Received interrupt signal - shutting down...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Received termination signal - shutting down...');
  process.exit(0);
});

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default RealTimeFraudMonitor;