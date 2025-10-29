#!/usr/bin/env node
/**
 * Simplified Micro-Skimming CLI Report Generator
 * Generates detailed micro-skimming investigation reports without external dependencies
 */

import fs from 'fs';
import path from 'path';

// Simplified micro-skimming detection (same logic as the test file)
const MicroSkimmingDetector = {
  detectMicroSkimming: (transactions, options = {}) => {
    const { minVendorTransactions = 10, aggregationThresholds = { warning: 1.0, critical: 5.0 }, useIntegerMath = false } = options;
    
    // Convert to milli-cents if using integer math
    const convertAmount = (amount) => useIntegerMath ? Math.round(amount * 1000) : amount;
    const convertBack = (amount) => useIntegerMath ? amount / 1000 : amount;
    
    // Group by vendor
    const vendorTransactions = {};
    transactions.forEach(tx => {
      if (!vendorTransactions[tx.vendor]) {
        vendorTransactions[tx.vendor] = [];
      }
      vendorTransactions[tx.vendor].push({
        ...tx,
        amount: convertAmount(tx.amount)
      });
    });
    
    const findings = [];
    
    Object.entries(vendorTransactions).forEach(([vendor, txs]) => {
      if (txs.length < minVendorTransactions) return;
      
      // Calculate micro-transaction amounts (< 0.01 or 10 milli-cents)
      const threshold = useIntegerMath ? 10 : 0.01;
      const microTxs = txs.filter(tx => tx.amount > 0 && tx.amount < threshold);
      
      if (microTxs.length > 0) {
        const totalMicroAmount = convertBack(microTxs.reduce((sum, tx) => sum + tx.amount, 0));
        const avgMicroAmount = convertBack(microTxs.reduce((sum, tx) => sum + tx.amount, 0) / microTxs.length);
        
        if (totalMicroAmount >= aggregationThresholds.warning) {
          findings.push({
            vendor,
            type: 'micro_skimming',
            severity: totalMicroAmount >= aggregationThresholds.critical ? 'critical' : 'warning',
            microTransactionCount: microTxs.length,
            totalMicroAmount: Math.round(totalMicroAmount * 100) / 100,
            averageMicroAmount: Math.round(avgMicroAmount * 1000) / 1000,
            details: {
              totalTransactions: txs.length,
              microTransactionRatio: Math.round((microTxs.length / txs.length) * 100 * 100) / 100
            }
          });
        }
      }
    });
    
    return findings;
  },
  
  detectFractionalResiduePatterns: (transactions, options = {}) => {
    const { minPatternOccurrences = 5, residueThresholds = { suspicious: 0.05, highly_suspicious: 0.10 }, useIntegerMath = false } = options;
    
    // Convert to milli-cents if using integer math
    const convertAmount = (amount) => useIntegerMath ? Math.round(amount * 1000) : amount;
    const convertBack = (amount) => useIntegerMath ? amount / 1000 : amount;
    
    // Extract fractional parts (tenths of cents)
    const residuePattern = {};
    transactions.forEach(tx => {
      const amount = convertAmount(tx.amount);
      let residue;
      
      if (useIntegerMath) {
        residue = amount % 10; // Last digit in milli-cents
      } else {
        const centsAmount = Math.round(amount * 100);
        residue = centsAmount % 10; // Tenths of cents
      }
      
      if (!residuePattern[residue]) {
        residuePattern[residue] = [];
      }
      residuePattern[residue].push(tx);
    });
    
    const findings = [];
    const totalTransactions = transactions.length;
    
    Object.entries(residuePattern).forEach(([residue, txs]) => {
      if (txs.length >= minPatternOccurrences) {
        const frequency = txs.length / totalTransactions;
        const expectedFrequency = 0.1; // 10% for each tenth
        const deviation = Math.abs(frequency - expectedFrequency);
        
        if (deviation >= residueThresholds.suspicious) {
          const totalAmount = convertBack(txs.reduce((sum, tx) => sum + convertAmount(tx.amount), 0));
          
          findings.push({
            residue: parseInt(residue),
            type: 'fractional_residue_pattern',
            severity: deviation >= residueThresholds.highly_suspicious ? 'critical' : 'warning',
            occurrences: txs.length,
            frequency: Math.round(frequency * 100 * 100) / 100,
            expectedFrequency: Math.round(expectedFrequency * 100 * 100) / 100,
            deviation: Math.round(deviation * 100 * 100) / 100,
            totalAmount: Math.round(totalAmount * 100) / 100,
            details: {
              totalTransactions,
              suspiciousPattern: deviation >= residueThresholds.highly_suspicious
            }
          });
        }
      }
    });
    
    return findings;
  }
};

// Report generator class
class SimpleMicroSkimmingReportGenerator {
  constructor() {
    this.findings = [];
    this.reportData = {};
  }
  
  // Load transaction data from JSON file
  loadTransactionData(filePath) {
    try {
      if (!fs.existsSync(filePath)) {
        console.log(`⚠️  Transaction file not found: ${filePath}`);
        return this.generateSampleData();
      }
      
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      console.log(`📁 Loaded ${data.length} transactions from ${filePath}`);
      return data;
    } catch (error) {
      console.log(`⚠️  Error loading transaction data: ${error.message}`);
      return this.generateSampleData();
    }
  }
  
  // Generate sample data for demonstration
  generateSampleData() {
    console.log('📊 Generating sample transaction data for demonstration...');
    
    const vendors = ['TechCorp', 'DataSystems', 'CloudServices', 'FinanceHub', 'ProcessorInc'];
    const transactions = [];
    let id = 1;
    
    // Generate normal transactions
    for (let v = 0; v < vendors.length; v++) {
      const vendor = vendors[v];
      
      // Normal transactions
      for (let i = 0; i < 50; i++) {
        transactions.push({
          id: id++,
          vendor,
          amount: parseFloat((Math.random() * 200 + 10).toFixed(2)),
          date: new Date(2024, 0, Math.floor(Math.random() * 30) + 1).toISOString().split('T')[0],
          description: `Transaction from ${vendor}`
        });
      }
      
      // Add micro-skimming patterns for some vendors
      if (v < 2) { // First 2 vendors have micro-skimming
        for (let i = 0; i < 25; i++) {
          transactions.push({
            id: id++,
            vendor,
            amount: parseFloat((Math.random() * 0.009 + 0.001).toFixed(3)), // 0.001 to 0.010
            date: new Date(2024, 0, Math.floor(Math.random() * 30) + 1).toISOString().split('T')[0],
            description: `Micro transaction from ${vendor}`
          });
        }
      }
      
      // Add fractional residue patterns for one vendor
      if (v === 1) { // Second vendor has residue pattern
        for (let i = 0; i < 30; i++) {
          const baseAmount = Math.random() * 100 + 10;
          const suspiciousAmount = Math.floor(baseAmount * 10) / 10 + 0.07; // Force .x7 pattern
          transactions.push({
            id: id++,
            vendor,
            amount: parseFloat(suspiciousAmount.toFixed(3)),
            date: new Date(2024, 0, Math.floor(Math.random() * 30) + 1).toISOString().split('T')[0],
            description: `Residue pattern transaction from ${vendor}`
          });
        }
      }
    }
    
    return transactions.sort((a, b) => a.id - b.id);
  }
  
  // Analyze transactions for micro-skimming patterns
  analyzeTransactions(transactions) {
    console.log('🔍 Analyzing transactions for micro-skimming patterns...');
    
    // Detection parameters
    const detectionOptions = {
      minVendorTransactions: 20,
      aggregationThresholds: { warning: 0.05, critical: 0.20 },
      useIntegerMath: true
    };
    
    const residueOptions = {
      minPatternOccurrences: 8,
      residueThresholds: { suspicious: 0.08, highly_suspicious: 0.15 },
      useIntegerMath: true
    };
    
    // Run detection algorithms
    const microSkimmingFindings = MicroSkimmingDetector.detectMicroSkimming(transactions, detectionOptions);
    const residueFindings = MicroSkimmingDetector.detectFractionalResiduePatterns(transactions, residueOptions);
    
    this.findings = [...microSkimmingFindings, ...residueFindings];
    
    // Calculate summary statistics
    this.reportData = {
      totalTransactions: transactions.length,
      totalVendors: new Set(transactions.map(tx => tx.vendor)).size,
      totalAmount: transactions.reduce((sum, tx) => sum + tx.amount, 0),
      findingsCount: this.findings.length,
      criticalFindings: this.findings.filter(f => f.severity === 'critical').length,
      warningFindings: this.findings.filter(f => f.severity === 'warning').length,
      detectionParameters: { detectionOptions, residueOptions }
    };
    
    console.log(`📈 Analysis complete: ${this.findings.length} suspicious patterns detected`);
    return this.findings;
  }
  
  // Generate comprehensive report
  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: this.reportData,
      findings: this.findings,
      recommendations: this.generateRecommendations()
    };
    
    return report;
  }
  
  // Generate investigation recommendations
  generateRecommendations() {
    const recommendations = [];
    
    if (this.findings.length === 0) {
      recommendations.push({
        priority: 'info',
        action: 'No suspicious patterns detected',
        description: 'All transaction patterns appear normal. Continue regular monitoring.'
      });
    } else {
      // Critical findings recommendations
      const criticalFindings = this.findings.filter(f => f.severity === 'critical');
      if (criticalFindings.length > 0) {
        recommendations.push({
          priority: 'critical',
          action: 'Immediate Investigation Required',
          description: `${criticalFindings.length} critical micro-skimming pattern(s) detected. Begin forensic analysis immediately.`
        });
        
        criticalFindings.forEach(finding => {
          if (finding.type === 'micro_skimming') {
            recommendations.push({
              priority: 'critical',
              action: `Investigate ${finding.vendor}`,
              description: `Review all micro-transactions (${finding.microTransactionCount} detected, total: $${finding.totalMicroAmount}). Check payment processing logs.`
            });
          } else if (finding.type === 'fractional_residue_pattern') {
            recommendations.push({
              priority: 'critical',
              action: `Analyze residue pattern ${finding.residue}`,
              description: `Suspicious .${finding.residue} cent pattern detected in ${finding.occurrences} transactions (${finding.frequency}% frequency).`
            });
          }
        });
      }
      
      // Warning findings recommendations
      const warningFindings = this.findings.filter(f => f.severity === 'warning');
      if (warningFindings.length > 0) {
        recommendations.push({
          priority: 'warning',
          action: 'Enhanced Monitoring',
          description: `${warningFindings.length} warning-level pattern(s) detected. Increase monitoring frequency.`
        });
      }
      
      // General recommendations
      recommendations.push({
        priority: 'info',
        action: 'Document Findings',
        description: 'Create detailed investigation report with transaction IDs and timestamps for audit trail.'
      });
      
      recommendations.push({
        priority: 'info',
        action: 'Review Access Controls',
        description: 'Verify who has access to payment processing systems and transaction modification capabilities.'
      });
    }
    
    return recommendations;
  }
  
  // Print formatted report to console
  printReport() {
    const report = this.generateReport();
    
    console.log('\\n='.repeat(80));
    console.log('🔍 MICRO-SKIMMING INVESTIGATION REPORT');
    console.log('='.repeat(80));
    console.log(`📅 Generated: ${new Date(report.timestamp).toLocaleString()}`);
    console.log(`📊 Transactions Analyzed: ${report.summary.totalTransactions.toLocaleString()}`);
    console.log(`🏪 Vendors: ${report.summary.totalVendors}`);
    console.log(`💰 Total Amount: $${report.summary.totalAmount.toLocaleString('en-US', {minimumFractionDigits: 2})}`);
    console.log(`\\n🚨 FINDINGS SUMMARY:`);
    console.log(`   • Total Patterns: ${report.summary.findingsCount}`);
    console.log(`   • Critical: ${report.summary.criticalFindings}`);
    console.log(`   • Warnings: ${report.summary.warningFindings}`);
    
    if (report.findings.length > 0) {
      console.log('\\n📋 DETAILED FINDINGS:');
      console.log('-'.repeat(80));
      
      report.findings.forEach((finding, index) => {
        const severity = finding.severity === 'critical' ? '🚨' : '⚠️';
        console.log(`\\n${severity} Finding #${index + 1}: ${finding.type.replace('_', ' ').toUpperCase()}`);
        console.log(`   Severity: ${finding.severity.toUpperCase()}`);
        
        if (finding.type === 'micro_skimming') {
          console.log(`   Vendor: ${finding.vendor}`);
          console.log(`   Micro-Transactions: ${finding.microTransactionCount}`);
          console.log(`   Total Micro Amount: $${finding.totalMicroAmount}`);
          console.log(`   Average Micro Amount: $${finding.averageMicroAmount}`);
          console.log(`   Transaction Ratio: ${finding.details.microTransactionRatio}%`);
        } else if (finding.type === 'fractional_residue_pattern') {
          console.log(`   Residue Pattern: .${finding.residue} cents`);
          console.log(`   Occurrences: ${finding.occurrences}`);
          console.log(`   Frequency: ${finding.frequency}% (expected: ${finding.expectedFrequency}%)`);
          console.log(`   Deviation: ${finding.deviation}%`);
          console.log(`   Total Amount: $${finding.totalAmount}`);
        }
      });
      
      console.log('\\n📋 INVESTIGATION RECOMMENDATIONS:');
      console.log('-'.repeat(80));
      
      report.recommendations.forEach((rec, index) => {
        const icon = rec.priority === 'critical' ? '🚨' : rec.priority === 'warning' ? '⚠️' : 'ℹ️';
        console.log(`\\n${icon} ${index + 1}. ${rec.action}`);
        console.log(`   ${rec.description}`);
      });
    } else {
      console.log('\\n✅ No suspicious patterns detected in the analyzed transactions.');
      console.log('   Continue regular monitoring and periodic analysis.');
    }
    
    console.log('\\n' + '='.repeat(80));
    console.log('📄 Report generated by Oqualtix Micro-Skimming Detector');
    console.log('='.repeat(80));
  }
  
  // Save report to file
  saveReport(outputPath) {
    const report = this.generateReport();
    const fileName = `micro_skimming_report_${new Date().toISOString().split('T')[0]}.json`;
    const fullPath = path.join(outputPath || '.', fileName);
    
    try {
      fs.writeFileSync(fullPath, JSON.stringify(report, null, 2));
      console.log(`\\n💾 Report saved to: ${fullPath}`);
      return fullPath;
    } catch (error) {
      console.error(`❌ Error saving report: ${error.message}`);
      return null;
    }
  }
}

// CLI interface
async function main() {
  console.log('🔍 Oqualtix Micro-Skimming Detection CLI');
  console.log('==========================================\\n');
  
  const args = process.argv.slice(2);
  const inputFile = args[0] || 'oqualtix_fraud_anomalies.json';
  const outputDir = args[1] || '.';
  
  console.log(`📄 Input file: ${inputFile}`);
  console.log(`📁 Output directory: ${outputDir}\\n`);
  
  // Initialize report generator
  const generator = new SimpleMicroSkimmingReportGenerator();
  
  // Load and analyze data
  const transactions = generator.loadTransactionData(inputFile);
  const findings = generator.analyzeTransactions(transactions);
  
  // Generate and display report
  generator.printReport();
  
  // Save report to file
  const savedPath = generator.saveReport(outputDir);
  
  if (savedPath) {
    console.log(`\\n✨ Analysis complete! Check ${savedPath} for detailed results.`);
  }
  
  return findings.length;
}

// Run CLI if called directly
main().catch(error => {
  console.error('💥 Error:', error);
  process.exit(1);
});

export { SimpleMicroSkimmingReportGenerator };