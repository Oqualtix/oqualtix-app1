#!/usr/bin/env node

/**
 * Financial Records & Bank Statement Scanner CLI
 * Comprehensive fraud detection for financial documents
 * 
 * Features:
 * - Bank statement analysis with fraud pattern detection
 * - General ledger entry examination
 * - Cross-reference reconciliation
 * - Micro-skimming detection (down to hundredth of a cent)
 * - Financial risk scoring
 * - Detailed investigation reports
 */

import EnhancedAnomalyDetectionUtils from './src/utils/EnhancedAnomalyDetectionUtils.js';
import moment from 'moment';

class FinancialRecordsScanner {
  constructor() {
    this.scanResults = null;
    this.reportGenerated = false;
  }

  // Generate comprehensive demo financial data
  generateDemoFinancialData() {
    const demoData = {
      bankStatements: [],
      ledgerEntries: [],
      creditCardStatements: [],
      invoices: []
    };

    // Generate 180 days of bank statement data with embedded fraud patterns
    const startDate = moment().subtract(180, 'days');
    
    console.log('🏦 Generating demo bank statements with embedded fraud patterns...');
    
    // Normal business transactions
    for (let i = 0; i < 150; i++) {
      const date = startDate.clone().add(Math.floor(Math.random() * 180), 'days');
      
      // Normal business transaction
      demoData.bankStatements.push({
        id: `BANK_${String(i).padStart(4, '0')}`,
        date: date.format('YYYY-MM-DD HH:mm:ss'),
        description: this.getRandomBusinessDescription(),
        amount: this.getRandomBusinessAmount(),
        balance: 50000 + Math.random() * 100000,
        type: 'BUSINESS_PAYMENT',
        account: 'CHK-001-4829',
        vendor: this.getRandomVendor(),
        category: 'BUSINESS_EXPENSE'
      });
    }

    // Inject sophisticated fraud patterns
    console.log('💰 Injecting sophisticated fraud patterns...');
    
    // 1. Micro-skimming fraud (systematic tiny amounts)
    for (let i = 0; i < 25; i++) {
      const date = startDate.clone().add(Math.floor(Math.random() * 180), 'days');
      demoData.bankStatements.push({
        id: `FRAUD_MICRO_${i}`,
        date: date.format('YYYY-MM-DD HH:mm:ss'),
        description: 'Processing Fee',
        amount: -0.012 - (Math.random() * 0.088), // -$0.012 to -$0.10
        balance: 50000 + Math.random() * 100000,
        type: 'FEE',
        account: 'CHK-001-4829',
        vendor: 'MicroTheftProcessor',
        category: 'FEES'
      });
    }

    // 2. After-hours suspicious activity
    for (let i = 0; i < 15; i++) {
      const date = startDate.clone().add(Math.floor(Math.random() * 180), 'days')
        .hour(Math.random() < 0.5 ? 2 : 23).minute(Math.floor(Math.random() * 60));
      
      demoData.bankStatements.push({
        id: `FRAUD_AFTERHOURS_${i}`,
        date: date.format('YYYY-MM-DD HH:mm:ss'),
        description: 'System Transfer',
        amount: -(500 + Math.random() * 2000),
        balance: 50000 + Math.random() * 100000,
        type: 'TRANSFER',
        account: 'CHK-001-4829',
        vendor: 'AutoTransferSystem',
        category: 'INTERNAL_TRANSFER'
      });
    }

    // 3. Duplicate transaction fraud
    const duplicateBase = {
      description: 'Office Supplies',
      amount: -847.50,
      vendor: 'OfficeMax Business',
      category: 'OFFICE_SUPPLIES'
    };
    
    for (let i = 0; i < 4; i++) {
      const date = startDate.clone().add(45, 'days').add(i * 30, 'minutes');
      demoData.bankStatements.push({
        id: `FRAUD_DUP_${i}`,
        date: date.format('YYYY-MM-DD HH:mm:ss'),
        ...duplicateBase,
        balance: 50000 + Math.random() * 100000,
        type: 'PURCHASE',
        account: 'CHK-001-4829'
      });
    }

    // 4. Round amount pattern (suspicious)
    for (let i = 0; i < 20; i++) {
      const date = startDate.clone().add(Math.floor(Math.random() * 180), 'days');
      const roundAmounts = [1000, 1500, 2000, 2500, 5000, 7500, 10000];
      
      demoData.bankStatements.push({
        id: `FRAUD_ROUND_${i}`,
        date: date.format('YYYY-MM-DD HH:mm:ss'),
        description: 'Consulting Services',
        amount: -roundAmounts[Math.floor(Math.random() * roundAmounts.length)],
        balance: 50000 + Math.random() * 100000,
        type: 'CONSULTING',
        account: 'CHK-001-4829',
        vendor: 'RoundAmountConsulting',
        category: 'PROFESSIONAL_SERVICES'
      });
    }

    // 5. Check fraud patterns
    for (let i = 0; i < 8; i++) {
      const date = startDate.clone().add(Math.floor(Math.random() * 180), 'days');
      demoData.bankStatements.push({
        id: `FRAUD_CHECK_${i}`,
        date: date.format('YYYY-MM-DD HH:mm:ss'),
        description: 'Check Payment',
        amount: -(1200 + Math.random() * 3000),
        balance: 50000 + Math.random() * 100000,
        type: 'CHECK',
        account: 'CHK-001-4829',
        vendor: 'Cash Recipient',
        category: 'CHECK_PAYMENT',
        checkNumber: i < 3 ? '1001' : `${2000 + i * 100}` // Duplicate check number fraud
      });
    }

    // 6. Velocity fraud (high transaction bursts)
    const burstDate = startDate.clone().add(90, 'days').hour(14);
    for (let i = 0; i < 15; i++) {
      demoData.bankStatements.push({
        id: `FRAUD_VELOCITY_${i}`,
        date: burstDate.clone().add(i * 3, 'minutes').format('YYYY-MM-DD HH:mm:ss'),
        description: `Rapid Transaction ${i + 1}`,
        amount: -(200 + Math.random() * 500),
        balance: 50000 + Math.random() * 100000,
        type: 'RAPID_TRANSACTION',
        account: 'CHK-001-4829',
        vendor: 'VelocityFraudCorp',
        category: 'SUSPICIOUS_ACTIVITY'
      });
    }

    // Generate corresponding ledger entries (some missing for reconciliation fraud)
    console.log('📚 Generating general ledger entries...');
    
    // Add legitimate ledger entries for most bank transactions
    demoData.bankStatements.slice(0, 120).forEach((bankTx, index) => {
      demoData.ledgerEntries.push({
        id: `LEDGER_${String(index).padStart(4, '0')}`,
        date: bankTx.date,
        account: this.mapCategoryToAccount(bankTx.category),
        description: bankTx.description,
        debit: bankTx.amount < 0 ? Math.abs(bankTx.amount) : 0,
        credit: bankTx.amount > 0 ? bankTx.amount : 0,
        amount: Math.abs(bankTx.amount),
        reference: bankTx.id,
        journalId: `JE_${Math.floor(index / 10)}`
      });
    });

    // Add some unbalanced journal entries (fraud indicator)
    demoData.ledgerEntries.push({
      id: 'LEDGER_FRAUD_UNBALANCED',
      date: startDate.clone().add(60, 'days').format('YYYY-MM-DD HH:mm:ss'),
      account: 'CASH',
      description: 'Suspicious Entry',
      debit: 5000,
      credit: 0,
      amount: 5000,
      reference: 'MANUAL_ENTRY_001',
      journalId: 'JE_FRAUD'
    });

    console.log(`✅ Generated ${demoData.bankStatements.length} bank statements`);
    console.log(`✅ Generated ${demoData.ledgerEntries.length} ledger entries`);
    
    return demoData;
  }

  // Helper methods for demo data generation
  getRandomBusinessDescription() {
    const descriptions = [
      'Office Rent Payment', 'Utility Bill - Electric', 'Internet Service',
      'Insurance Premium', 'Legal Services', 'Accounting Fees',
      'Marketing Campaign', 'Equipment Lease', 'Travel Expenses',
      'Employee Reimbursement', 'Software License', 'Banking Fees'
    ];
    return descriptions[Math.floor(Math.random() * descriptions.length)];
  }

  getRandomBusinessAmount() {
    const amounts = [
      -150.00, -250.00, -500.00, -750.00, -1200.00, -1850.00,
      -2400.00, -3200.00, 5000.00, 7500.00, 12000.00
    ];
    return amounts[Math.floor(Math.random() * amounts.length)];
  }

  getRandomVendor() {
    const vendors = [
      'Metro Office Center', 'PowerGrid Utilities', 'FiberNet Communications',
      'SecureShield Insurance', 'LegalEagle LLP', 'NumberCrunch Accounting',
      'BrandBoost Marketing', 'TechLease Solutions', 'TravelSmart Corp',
      'ExpenseTrack Inc', 'CloudSoft Technologies', 'MegaBank Services'
    ];
    return vendors[Math.floor(Math.random() * vendors.length)];
  }

  mapCategoryToAccount(category) {
    const accountMap = {
      'BUSINESS_EXPENSE': 'OPERATING_EXPENSES',
      'OFFICE_SUPPLIES': 'OFFICE_EXPENSES',
      'PROFESSIONAL_SERVICES': 'CONSULTING_FEES',
      'INTERNAL_TRANSFER': 'CASH',
      'CHECK_PAYMENT': 'ACCOUNTS_PAYABLE',
      'FEES': 'BANK_FEES',
      'SUSPICIOUS_ACTIVITY': 'MISCELLANEOUS'
    };
    return accountMap[category] || 'GENERAL_EXPENSES';
  }

  // Perform comprehensive financial records analysis
  async scanFinancialRecords(financialData, options = {}) {
    console.log('\n🔍 FINANCIAL RECORDS & BANK STATEMENT SCANNER');
    console.log('='.repeat(55));
    
    const scanOptions = {
      includeStatements: true,
      includeLedgers: true,
      includeReconciliation: true,
      fraudThresholds: {
        largeTransactionMultiplier: 3.0,
        roundAmountThreshold: 0.5,
        duplicateTransactionWindow: 12,
        velocityThreshold: 8,
        afterHoursThreshold: 0.15,
        weekendThreshold: 0.12
      },
      analysisDepth: 'comprehensive',
      ...options
    };

    try {
      // Perform comprehensive analysis
      this.scanResults = await EnhancedAnomalyDetectionUtils.analyzeFinancialRecords(
        financialData, 
        scanOptions
      );

      console.log(`\n📊 SCAN RESULTS SUMMARY`);
      console.log('-'.repeat(25));
      console.log(`Records Analyzed: ${this.scanResults.recordsAnalyzed}`);
      console.log(`Fraud Indicators: ${this.scanResults.fraudIndicators.length}`);
      console.log(`Risk Score: ${this.scanResults.riskScore}/100`);
      console.log(`Risk Level: ${this.getRiskLevelEmoji(this.scanResults.riskScore)} ${this.getRiskLevel(this.scanResults.riskScore)}`);

      return this.scanResults;

    } catch (error) {
      console.error('❌ Financial scan error:', error);
      throw error;
    }
  }

  // Generate detailed investigation report
  generateInvestigationReport() {
    if (!this.scanResults) {
      console.log('❌ No scan results available. Please run a scan first.');
      return;
    }

    console.log('\n📋 DETAILED INVESTIGATION REPORT');
    console.log('='.repeat(40));

    // Group fraud indicators by type
    const indicatorsByType = {};
    this.scanResults.fraudIndicators.forEach(indicator => {
      if (!indicatorsByType[indicator.type]) {
        indicatorsByType[indicator.type] = [];
      }
      indicatorsByType[indicator.type].push(indicator);
    });

    // Display findings by category
    Object.entries(indicatorsByType).forEach(([type, indicators]) => {
      console.log(`\n🚨 ${type.replace(/_/g, ' ')}`);
      console.log('-'.repeat(30));
      
      indicators.forEach((indicator, index) => {
        console.log(`\n${index + 1}. ${this.getSeverityEmoji(indicator.severity)} ${indicator.severity} RISK`);
        console.log(`   Description: ${indicator.description}`);
        console.log(`   Confidence: ${indicator.confidence}%`);
        
        if (indicator.details) {
          console.log(`   Details:`);
          Object.entries(indicator.details).forEach(([key, value]) => {
            if (typeof value === 'object' && value !== null) {
              console.log(`     ${key}: ${JSON.stringify(value)}`);
            } else {
              console.log(`     ${key}: ${value}`);
            }
          });
        }
        
        if (indicator.transaction) {
          console.log(`   Transaction: ${indicator.transaction.id} - $${Math.abs(indicator.transaction.amount).toFixed(4)}`);
        }
        
        if (indicator.transactions && indicator.transactions.length > 0) {
          console.log(`   Affected Transactions: ${indicator.transactions.length}`);
          indicator.transactions.slice(0, 3).forEach(tx => {
            console.log(`     - ${tx.id}: $${Math.abs(tx.amount).toFixed(4)} (${tx.date})`);
          });
          if (indicator.transactions.length > 3) {
            console.log(`     ... and ${indicator.transactions.length - 3} more`);
          }
        }
      });
    });

    // Display recommendations
    if (this.scanResults.recommendations && this.scanResults.recommendations.length > 0) {
      console.log('\n💡 INVESTIGATION RECOMMENDATIONS');
      console.log('-'.repeat(35));
      
      this.scanResults.recommendations.forEach((rec, index) => {
        console.log(`\n${index + 1}. ${this.getPriorityEmoji(rec.priority)} ${rec.action}`);
        console.log(`   Priority: ${rec.priority.toUpperCase()}`);
        console.log(`   ${rec.description}`);
      });
    }

    // Display statistical summary
    console.log('\n📈 STATISTICAL ANALYSIS');
    console.log('-'.repeat(25));
    
    const criticalCount = this.scanResults.fraudIndicators.filter(i => i.severity === 'CRITICAL').length;
    const highCount = this.scanResults.fraudIndicators.filter(i => i.severity === 'HIGH').length;
    const mediumCount = this.scanResults.fraudIndicators.filter(i => i.severity === 'MEDIUM').length;
    
    console.log(`Critical Issues: ${criticalCount}`);
    console.log(`High Risk Issues: ${highCount}`);
    console.log(`Medium Risk Issues: ${mediumCount}`);
    
    const avgConfidence = this.scanResults.fraudIndicators.length > 0 ?
      (this.scanResults.fraudIndicators.reduce((sum, i) => sum + i.confidence, 0) / this.scanResults.fraudIndicators.length).toFixed(1) :
      0;
    
    console.log(`Average Confidence: ${avgConfidence}%`);

    this.reportGenerated = true;
  }

  // Helper methods for formatting
  getRiskLevel(score) {
    if (score >= 80) return 'CRITICAL';
    if (score >= 60) return 'HIGH';
    if (score >= 30) return 'MEDIUM';
    return 'LOW';
  }

  getRiskLevelEmoji(score) {
    if (score >= 80) return '🔴';
    if (score >= 60) return '🟠';
    if (score >= 30) return '🟡';
    return '🟢';
  }

  getSeverityEmoji(severity) {
    const emojiMap = {
      'CRITICAL': '🔴',
      'HIGH': '🟠',
      'MEDIUM': '🟡',
      'LOW': '🟢'
    };
    return emojiMap[severity] || '⚪';
  }

  getPriorityEmoji(priority) {
    const emojiMap = {
      'critical': '🚨',
      'high': '⚠️',
      'medium': '⚡',
      'low': 'ℹ️',
      'info': 'ℹ️'
    };
    return emojiMap[priority] || 'ℹ️';
  }

  // Export results to JSON
  exportResults(filename = null) {
    if (!this.scanResults) {
      console.log('❌ No scan results to export');
      return;
    }

    const exportData = {
      scanTimestamp: new Date().toISOString(),
      summary: {
        recordsAnalyzed: this.scanResults.recordsAnalyzed,
        fraudIndicatorsCount: this.scanResults.fraudIndicators.length,
        riskScore: this.scanResults.riskScore,
        riskLevel: this.getRiskLevel(this.scanResults.riskScore)
      },
      fraudIndicators: this.scanResults.fraudIndicators,
      recommendations: this.scanResults.recommendations
    };

    const exportFilename = filename || `financial_scan_results_${Date.now()}.json`;
    
    try {
      require('fs').writeFileSync(exportFilename, JSON.stringify(exportData, null, 2));
      console.log(`\n💾 Results exported to: ${exportFilename}`);
    } catch (error) {
      console.error('❌ Export failed:', error.message);
    }
  }
}

// CLI execution
async function main() {
  const scanner = new FinancialRecordsScanner();
  
  try {
    console.log('🚀 Financial Records Scanner CLI - Starting Analysis...\n');
    
    // Generate demo data with embedded fraud patterns
    const demoData = scanner.generateDemoFinancialData();
    
    // Perform comprehensive scan
    await scanner.scanFinancialRecords(demoData);
    
    // Generate detailed investigation report
    scanner.generateInvestigationReport();
    
    // Export results
    scanner.exportResults('financial_fraud_investigation_report.json');
    
    console.log('\n🎯 NEXT STEPS:');
    console.log('1. Review all CRITICAL and HIGH severity findings immediately');
    console.log('2. Investigate flagged transactions and patterns');
    console.log('3. Implement recommended security controls');
    console.log('4. Consider forensic accounting review for significant findings');
    console.log('5. Update fraud detection thresholds based on results');
    
    console.log('\n✅ Financial Records Analysis Complete');
    
  } catch (error) {
    console.error('❌ Analysis failed:', error);
    process.exit(1);
  }
}

// Run the CLI if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default FinancialRecordsScanner;