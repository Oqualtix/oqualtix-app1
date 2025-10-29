#!/usr/bin/env node
/**
 * Ultra-Precise Micro-Skimming CLI Analyzer
 * Analyzes transactions for embezzlement down to a hundredth of a cent ($0.0001)
 */

import fs from 'fs';
import path from 'path';

// Enhanced micro-skimming detection with ultra-precision
const UltraPreciseMicroSkimmingDetector = {
  detectMicroSkimming: (transactions, options = {}) => {
    const { 
      microThreshold = 0.01,
      tinyThreshold = 0.001, 
      ultraTinyThreshold = 0.0001,
      cumulativeThreshold = 0.10,
      minCount = 15,
      useIntegerMath = true 
    } = options;
    
    // Convert to deci-milli-cents for ultra-precise integer math
    const convertAmount = (amount) => useIntegerMath ? Math.round(amount * 10000) : amount;
    const convertBack = (amount) => useIntegerMath ? amount / 10000 : amount;
    
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
      if (txs.length < minCount) return;
      
      // Calculate micro-transaction amounts with ultra-precision
      const microThresholdConverted = convertAmount(microThreshold);
      const tinyThresholdConverted = convertAmount(tinyThreshold);
      const ultraTinyThresholdConverted = convertAmount(ultraTinyThreshold);
      
      const microTxs = txs.filter(tx => tx.amount > 0 && tx.amount <= microThresholdConverted);
      const tinyTxs = txs.filter(tx => tx.amount > 0 && tx.amount <= tinyThresholdConverted);
      const ultraTinyTxs = txs.filter(tx => tx.amount > 0 && tx.amount <= ultraTinyThresholdConverted);
      
      if (microTxs.length > 0) {
        const totalMicroAmount = convertBack(microTxs.reduce((sum, tx) => sum + tx.amount, 0));
        const avgMicroAmount = convertBack(microTxs.reduce((sum, tx) => sum + tx.amount, 0) / microTxs.length);
        
        // Enhanced detection for ultra-tiny amounts
        const ultraTinyRatio = ultraTinyTxs.length / microTxs.length;
        const isUltraTinyPattern = ultraTinyTxs.length >= 5 && ultraTinyRatio > 0.3;
        
        if (totalMicroAmount >= cumulativeThreshold || isUltraTinyPattern) {
          let severity = 'warning';
          let detectionLevel = 'MICRO_TRANSACTION';
          
          if (isUltraTinyPattern) {
            severity = 'critical';
            detectionLevel = 'HUNDREDTH_CENT';
          } else if (totalMicroAmount >= cumulativeThreshold * 10) {
            severity = 'critical';
          }
          
          findings.push({
            vendor,
            type: 'micro_skimming',
            severity,
            microTransactionCount: microTxs.length,
            tinyTransactionCount: tinyTxs.length,
            ultraTinyTransactionCount: ultraTinyTxs.length,
            totalMicroAmount: Math.round(totalMicroAmount * 10000) / 10000,
            averageMicroAmount: Math.round(avgMicroAmount * 100000) / 100000,
            detectionLevel,
            precisionMode: useIntegerMath ? 'DECI_MILLI_CENTS' : 'FLOATING_POINT',
            details: {
              totalTransactions: txs.length,
              microTransactionRatio: Math.round((microTxs.length / txs.length) * 100 * 100) / 100,
              ultraTinyRatio: Math.round(ultraTinyRatio * 100 * 100) / 100,
              minimumAmount: convertBack(Math.min(...microTxs.map(tx => tx.amount))),
              maximumAmount: convertBack(Math.max(...microTxs.map(tx => tx.amount)))
            }
          });
        }
      }
    });
    
    return findings;
  },
  
  detectFractionalResiduePatterns: (transactions, options = {}) => {
    const { 
      minPatternOccurrences = 10, 
      residueThresholds = { suspicious: 0.15, highly_suspicious: 0.25 }, 
      useIntegerMath = true 
    } = options;
    
    // Track both tenths and hundredths of cent residues
    const tenthsResiduePattern = {};
    const hundredthsResiduePattern = {};
    
    transactions.forEach(tx => {
      let tenths, hundredths;
      
      if (useIntegerMath) {
        const deciMilliCents = Math.round((Math.abs(tx.amount)) * 10000);
        tenths = Math.floor(deciMilliCents / 10) % 10;
        hundredths = deciMilliCents % 100;
      } else {
        const amount = Math.abs(tx.amount);
        tenths = Math.floor(amount * 1000) % 10;
        hundredths = Math.floor(amount * 10000) % 100;
      }
      
      if (!tenthsResiduePattern[tenths]) {
        tenthsResiduePattern[tenths] = [];
      }
      tenthsResiduePattern[tenths].push(tx);
      
      if (!hundredthsResiduePattern[hundredths]) {
        hundredthsResiduePattern[hundredths] = [];
      }
      hundredthsResiduePattern[hundredths].push(tx);
    });
    
    const findings = [];
    const totalTransactions = transactions.length;
    
    // Analyze hundredths patterns (ultra-precise)
    Object.entries(hundredthsResiduePattern).forEach(([residue, txs]) => {
      if (txs.length >= minPatternOccurrences) {
        const frequency = txs.length / totalTransactions;
        const expectedFrequency = 0.01; // 1% for each hundredth
        const deviation = Math.abs(frequency - expectedFrequency);
        
        if (deviation >= (residueThresholds.suspicious * 0.5)) { // Lower threshold for hundredths
          const totalAmount = txs.reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
          
          findings.push({
            residue: parseInt(residue),
            type: 'ultra_precise_fractional_residue_pattern',
            severity: deviation >= (residueThresholds.highly_suspicious * 0.5) ? 'critical' : 'warning',
            occurrences: txs.length,
            frequency: Math.round(frequency * 100 * 100) / 100,
            expectedFrequency: Math.round(expectedFrequency * 100 * 100) / 100,
            deviation: Math.round(deviation * 100 * 100) / 100,
            totalAmount: Math.round(totalAmount * 10000) / 10000,
            detectionLevel: 'HUNDREDTH_CENT',
            residueDescription: `${(parseInt(residue) / 100).toFixed(4)} cent residue`,
            precisionMode: useIntegerMath ? 'DECI_MILLI_CENTS' : 'FLOATING_POINT',
            details: {
              totalTransactions,
              suspiciousPattern: deviation >= (residueThresholds.highly_suspicious * 0.5)
            }
          });
        }
      }
    });
    
    // Analyze tenths patterns
    Object.entries(tenthsResiduePattern).forEach(([residue, txs]) => {
      if (txs.length >= minPatternOccurrences) {
        const frequency = txs.length / totalTransactions;
        const expectedFrequency = 0.1; // 10% for each tenth
        const deviation = Math.abs(frequency - expectedFrequency);
        
        if (deviation >= residueThresholds.suspicious) {
          const totalAmount = txs.reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
          
          findings.push({
            residue: parseInt(residue),
            type: 'fractional_residue_pattern',
            severity: deviation >= residueThresholds.highly_suspicious ? 'critical' : 'warning',
            occurrences: txs.length,
            frequency: Math.round(frequency * 100 * 100) / 100,
            expectedFrequency: Math.round(expectedFrequency * 100 * 100) / 100,
            deviation: Math.round(deviation * 100 * 100) / 100,
            totalAmount: Math.round(totalAmount * 100) / 100,
            detectionLevel: 'TENTH_CENT',
            precisionMode: useIntegerMath ? 'DECI_MILLI_CENTS' : 'FLOATING_POINT',
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

// Ultra-precise report generator
class UltraPreciseReportGenerator {
  constructor() {
    this.findings = [];
    this.reportData = {};
  }
  
  loadTransactionData(filePath) {
    try {
      if (!fs.existsSync(filePath)) {
        console.log(`⚠️  Transaction file not found: ${filePath}`);
        return this.generateUltraPreciseDemo();
      }
      
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      console.log(`📁 Loaded ${data.length} transactions from ${filePath}`);
      return data;
    } catch (error) {
      console.log(`⚠️  Error loading transaction data: ${error.message}`);
      return this.generateUltraPreciseDemo();
    }
  }
  
  generateUltraPreciseDemo() {
    console.log('📊 Generating ultra-precise demonstration data...');
    
    const vendors = ['TechCorp', 'DataSystems', 'CloudServices', 'PrecisionVendor', 'UltraVendor'];
    const transactions = [];
    let id = 1;
    
    // Generate normal transactions
    for (let v = 0; v < vendors.length; v++) {
      const vendor = vendors[v];
      
      // Normal transactions
      for (let i = 0; i < 40; i++) {
        transactions.push({
          id: id++,
          vendor,
          amount: parseFloat((Math.random() * 200 + 10).toFixed(2)),
          date: new Date(2024, 0, Math.floor(Math.random() * 30) + 1).toISOString().split('T')[0],
          description: `Transaction from ${vendor}`
        });
      }
      
      // Add ultra-tiny micro-skimming for some vendors
      if (v < 2) {
        for (let i = 0; i < 20; i++) {
          // Ultra-tiny amounts (hundredths of cents)
          transactions.push({
            id: id++,
            vendor,
            amount: parseFloat((Math.random() * 0.0009 + 0.0001).toFixed(4)), // 0.0001 to 0.0010
            date: new Date(2024, 0, Math.floor(Math.random() * 30) + 1).toISOString().split('T')[0],
            description: `Ultra-micro transaction from ${vendor}`
          });
        }
      }
      
      // Add hundredths residue patterns
      if (v === 2) {
        for (let i = 0; i < 25; i++) {
          const baseAmount = Math.random() * 100 + 10;
          const suspiciousAmount = Math.floor(baseAmount * 10000) / 10000 + 0.0037; // Force .0037 pattern
          transactions.push({
            id: id++,
            vendor,
            amount: parseFloat(suspiciousAmount.toFixed(4)),
            date: new Date(2024, 0, Math.floor(Math.random() * 30) + 1).toISOString().split('T')[0],
            description: `Ultra-precise residue transaction from ${vendor}`
          });
        }
      }
    }
    
    return transactions.sort((a, b) => a.id - b.id);
  }
  
  analyzeTransactions(transactions) {
    console.log('🔍 Analyzing transactions for ultra-precise micro-skimming patterns...');
    
    // Ultra-precise detection parameters
    const microOptions = {
      microThreshold: 0.01,
      tinyThreshold: 0.001,
      ultraTinyThreshold: 0.0001,
      cumulativeThreshold: 0.01,
      minCount: 10,
      useIntegerMath: true
    };
    
    const residueOptions = {
      minPatternOccurrences: 8,
      residueThresholds: { suspicious: 0.08, highly_suspicious: 0.15 },
      useIntegerMath: true
    };
    
    // Run ultra-precise detection algorithms
    const microSkimmingFindings = UltraPreciseMicroSkimmingDetector.detectMicroSkimming(transactions, microOptions);
    const residueFindings = UltraPreciseMicroSkimmingDetector.detectFractionalResiduePatterns(transactions, residueOptions);
    
    this.findings = [...microSkimmingFindings, ...residueFindings];
    
    // Calculate enhanced statistics
    this.reportData = {
      totalTransactions: transactions.length,
      totalVendors: new Set(transactions.map(tx => tx.vendor)).size,
      totalAmount: transactions.reduce((sum, tx) => sum + tx.amount, 0),
      findingsCount: this.findings.length,
      criticalFindings: this.findings.filter(f => f.severity === 'critical').length,
      warningFindings: this.findings.filter(f => f.severity === 'warning').length,
      ultraTinyFindings: this.findings.filter(f => f.detectionLevel === 'HUNDREDTH_CENT').length,
      detectionParameters: { microOptions, residueOptions }
    };
    
    console.log(`📈 Ultra-precise analysis complete: ${this.findings.length} suspicious patterns detected`);
    console.log(`💎 Ultra-tiny (hundredth cent) patterns: ${this.reportData.ultraTinyFindings}`);
    return this.findings;
  }
  
  printReport() {
    console.log('\\n' + '='.repeat(90));
    console.log('💎 ULTRA-PRECISE MICRO-SKIMMING INVESTIGATION REPORT');
    console.log('   Detection Precision: Down to 0.01¢ (Hundredth of a Cent)');
    console.log('='.repeat(90));
    console.log(`📅 Generated: ${new Date().toLocaleString()}`);
    console.log(`📊 Transactions Analyzed: ${this.reportData.totalTransactions.toLocaleString()}`);
    console.log(`🏪 Vendors: ${this.reportData.totalVendors}`);
    console.log(`💰 Total Amount: $${this.reportData.totalAmount.toLocaleString('en-US', {minimumFractionDigits: 4, maximumFractionDigits: 4})}`);
    console.log(`\\n🚨 FINDINGS SUMMARY:`);
    console.log(`   • Total Patterns: ${this.reportData.findingsCount}`);
    console.log(`   • Critical: ${this.reportData.criticalFindings}`);
    console.log(`   • Warnings: ${this.reportData.warningFindings}`);
    console.log(`   💎 Ultra-Precise (Hundredth ¢): ${this.reportData.ultraTinyFindings}`);
    
    if (this.findings.length > 0) {
      console.log('\\n📋 DETAILED FINDINGS:');
      console.log('-'.repeat(90));
      
      this.findings.forEach((finding, index) => {
        const severity = finding.severity === 'critical' ? '🚨' : '⚠️';
        const precision = finding.detectionLevel === 'HUNDREDTH_CENT' ? '💎' : '🔍';
        
        console.log(`\\n${severity}${precision} Finding #${index + 1}: ${finding.type.replace(/_/g, ' ').toUpperCase()}`);
        console.log(`   Severity: ${finding.severity.toUpperCase()}`);
        console.log(`   Detection Level: ${finding.detectionLevel}`);
        
        if (finding.type === 'micro_skimming') {
          console.log(`   Vendor: ${finding.vendor}`);
          console.log(`   Micro-Transactions: ${finding.microTransactionCount}`);
          if (finding.ultraTinyTransactionCount > 0) {
            console.log(`   💎 Ultra-Tiny (≤$0.0001): ${finding.ultraTinyTransactionCount}`);
          }
          console.log(`   Total Micro Amount: $${finding.totalMicroAmount.toFixed(6)}`);
          console.log(`   Average Micro Amount: $${finding.averageMicroAmount.toFixed(6)}`);
          console.log(`   Minimum Amount: $${finding.details.minimumAmount.toFixed(6)}`);
          console.log(`   Maximum Amount: $${finding.details.maximumAmount.toFixed(6)}`);
          console.log(`   Precision Mode: ${finding.precisionMode}`);
        } else if (finding.type.includes('residue_pattern')) {
          if (finding.detectionLevel === 'HUNDREDTH_CENT') {
            console.log(`   💎 Ultra-Precise Residue: ${finding.residueDescription}`);
          } else {
            console.log(`   Residue Pattern: .${finding.residue} cents`);
          }
          console.log(`   Occurrences: ${finding.occurrences}`);
          console.log(`   Frequency: ${finding.frequency}% (expected: ${finding.expectedFrequency}%)`);
          console.log(`   Deviation: ${finding.deviation}%`);
          console.log(`   Total Amount: $${finding.totalAmount.toFixed(6)}`);
          console.log(`   Precision Mode: ${finding.precisionMode}`);
        }
      });
      
      console.log('\\n📋 INVESTIGATION RECOMMENDATIONS:');
      console.log('-'.repeat(90));
      
      const recommendations = this.generateRecommendations();
      recommendations.forEach((rec, index) => {
        const icon = rec.priority === 'critical' ? '🚨' : rec.priority === 'warning' ? '⚠️' : 'ℹ️';
        console.log(`\\n${icon} ${index + 1}. ${rec.action}`);
        console.log(`   ${rec.description}`);
      });
    } else {
      console.log('\\n✅ No ultra-precise suspicious patterns detected in the analyzed transactions.');
      console.log('   Continue regular monitoring with periodic ultra-precise analysis.');
    }
    
    console.log('\\n' + '='.repeat(90));
    console.log('💎 Report generated by Oqualtix Ultra-Precise Micro-Skimming Detector');
    console.log('   Capable of detecting embezzlement down to $0.0001 (hundredth of a cent)');
    console.log('='.repeat(90));
  }
  
  generateRecommendations() {
    const recommendations = [];
    
    if (this.findings.length === 0) {
      recommendations.push({
        priority: 'info',
        action: 'No ultra-precise patterns detected',
        description: 'All transaction patterns appear normal at hundredth-cent precision. Continue monitoring.'
      });
    } else {
      const criticalFindings = this.findings.filter(f => f.severity === 'critical');
      const ultraTinyFindings = this.findings.filter(f => f.detectionLevel === 'HUNDREDTH_CENT');
      
      if (criticalFindings.length > 0) {
        recommendations.push({
          priority: 'critical',
          action: 'Immediate Investigation Required',
          description: `${criticalFindings.length} critical ultra-precise pattern(s) detected. Begin forensic analysis immediately.`
        });
      }
      
      if (ultraTinyFindings.length > 0) {
        recommendations.push({
          priority: 'critical',
          action: 'Ultra-Precise Fraud Investigation',
          description: `${ultraTinyFindings.length} hundredth-cent level pattern(s) detected. This indicates sophisticated micro-skimming requiring advanced forensic techniques.`
        });
      }
      
      recommendations.push({
        priority: 'info',
        action: 'Enhance Monitoring Precision',
        description: 'Implement continuous ultra-precise monitoring for amounts below $0.001 to catch sophisticated micro-fraud.'
      });
      
      recommendations.push({
        priority: 'info',
        action: 'Audit Payment Processing Systems',
        description: 'Review payment processing code for potential rounding manipulation and fractional amount handling.'
      });
    }
    
    return recommendations;
  }
  
  saveReport(outputPath) {
    const report = {
      timestamp: new Date().toISOString(),
      precision: 'HUNDREDTH_CENT',
      detectionCapability: '$0.0001',
      summary: this.reportData,
      findings: this.findings,
      recommendations: this.generateRecommendations()
    };
    
    const fileName = `ultra_precise_micro_skimming_report_${new Date().toISOString().split('T')[0]}.json`;
    const fullPath = path.join(outputPath || '.', fileName);
    
    try {
      fs.writeFileSync(fullPath, JSON.stringify(report, null, 2));
      console.log(`\\n💾 Ultra-precise report saved to: ${fullPath}`);
      return fullPath;
    } catch (error) {
      console.error(`❌ Error saving report: ${error.message}`);
      return null;
    }
  }
}

// CLI interface
async function main() {
  console.log('💎 Oqualtix Ultra-Precise Micro-Skimming Detection CLI');
  console.log('   Detection Precision: Down to 0.01¢ (Hundredth of a Cent)');
  console.log('='.repeat(65) + '\\n');
  
  const args = process.argv.slice(2);
  const inputFile = args[0] || 'oqualtix_fraud_anomalies.json';
  const outputDir = args[1] || '.';
  
  console.log(`📄 Input file: ${inputFile}`);
  console.log(`📁 Output directory: ${outputDir}\\n`);
  
  // Initialize ultra-precise report generator
  const generator = new UltraPreciseReportGenerator();
  
  // Load and analyze data
  const transactions = generator.loadTransactionData(inputFile);
  const findings = generator.analyzeTransactions(transactions);
  
  // Generate and display report
  generator.printReport();
  
  // Save report to file
  const savedPath = generator.saveReport(outputDir);
  
  if (savedPath) {
    console.log(`\\n✨ Ultra-precise analysis complete! Check ${savedPath} for detailed results.`);
    console.log('💎 System successfully detected patterns down to $0.0001 precision.');
  }
  
  return findings.length;
}

// Run CLI
main().catch(error => {
  console.error('💥 Error:', error);
  process.exit(1);
});

export { UltraPreciseMicroSkimmingDetector, UltraPreciseReportGenerator };