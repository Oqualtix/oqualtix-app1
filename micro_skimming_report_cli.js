#!/usr/bin/env node
/**
 * Micro-Skimming CLI Report Generator
 * Analyzes transactions and provides detailed micro-skimming investigation reports
 */

import fs from 'fs';
import path from 'path';

// Import our detection utilities (using a simple approach for the standalone analyzer)
const { FraudDetectionAnalyzer, generateSampleData } = require('./fraud_detection_analyzer');

class MicroSkimmingReportGenerator {
    constructor(options = {}) {
        this.options = {
            microThreshold: options.microThreshold || 0.01,
            tinyThreshold: options.tinyThreshold || 0.001,
            cumulativeThreshold: options.cumulativeThreshold || 100,
            minCount: options.minCount || 50,
            topN: options.topN || 10,
            ...options
        };
    }

    /**
     * Analyze micro-skimming patterns in transaction data
     */
    analyzeMicroSkimming(transactions) {
        const analysis = {
            summary: {
                totalTransactions: transactions.length,
                microTransactions: 0,
                tinyTransactions: 0,
                totalMicroAmount: 0,
                suspiciousVendors: 0
            },
            vendors: {},
            topBeneficiaries: [],
            residueAnalysis: {
                globalResidues: {},
                suspiciousResidueVendors: []
            },
            recommendations: []
        };

        // Group transactions by vendor and analyze micro patterns
        transactions.forEach(transaction => {
            const vendor = transaction.vendor || 'UNKNOWN';
            const amount = Math.abs(Number(transaction.amount) || 0);
            
            if (!analysis.vendors[vendor]) {
                analysis.vendors[vendor] = {
                    totalTransactions: 0,
                    microTransactions: 0,
                    tinyTransactions: 0,
                    totalAmount: 0,
                    microAmount: 0,
                    averageAmount: 0,
                    microAverageAmount: 0,
                    transactions: [],
                    residuePattern: {},
                    suspiciousFlags: []
                };
            }

            const vendorData = analysis.vendors[vendor];
            vendorData.totalTransactions++;
            vendorData.totalAmount += amount;
            vendorData.transactions.push(transaction);

            // Analyze micro amounts
            if (amount > 0 && amount <= this.options.microThreshold) {
                vendorData.microTransactions++;
                vendorData.microAmount += amount;
                analysis.summary.microTransactions++;
                analysis.summary.totalMicroAmount += amount;

                if (amount <= this.options.tinyThreshold) {
                    vendorData.tinyTransactions++;
                    analysis.summary.tinyTransactions++;
                }
            }

            // Analyze residue patterns
            const tenths = Math.floor(amount * 1000) % 10;
            vendorData.residuePattern[tenths] = (vendorData.residuePattern[tenths] || 0) + 1;
            analysis.residueAnalysis.globalResidues[tenths] = (analysis.residueAnalysis.globalResidues[tenths] || 0) + 1;
        });

        // Calculate averages and identify suspicious patterns
        Object.entries(analysis.vendors).forEach(([vendor, data]) => {
            data.averageAmount = data.totalAmount / data.totalTransactions;
            if (data.microTransactions > 0) {
                data.microAverageAmount = data.microAmount / data.microTransactions;
            }

            // Flag suspicious vendors
            const microRatio = data.microTransactions / data.totalTransactions;
            const tinyRatio = data.tinyTransactions / data.totalTransactions;

            if (data.microAmount >= this.options.cumulativeThreshold) {
                data.suspiciousFlags.push('HIGH_CUMULATIVE_MICRO');
            }

            if (data.microTransactions >= this.options.minCount) {
                data.suspiciousFlags.push('HIGH_FREQUENCY_MICRO');
            }

            if (microRatio > 0.5) {
                data.suspiciousFlags.push('MAJORITY_MICRO_TRANSACTIONS');
            }

            if (tinyRatio > 0.3) {
                data.suspiciousFlags.push('HIGH_TINY_TRANSACTION_RATIO');
            }

            // Analyze residue patterns
            const totalResidueTransactions = Object.values(data.residuePattern).reduce((sum, count) => sum + count, 0);
            const dominantResidue = Object.entries(data.residuePattern)
                .map(([residue, count]) => ({ residue: Number(residue), count, proportion: count / totalResidueTransactions }))
                .sort((a, b) => b.count - a.count)[0];

            if (dominantResidue && dominantResidue.residue !== 0 && dominantResidue.proportion > 0.6 && totalResidueTransactions >= 30) {
                data.suspiciousFlags.push('SYSTEMATIC_RESIDUE_PATTERN');
                data.dominantResidue = dominantResidue;
                analysis.residueAnalysis.suspiciousResidueVendors.push({
                    vendor,
                    ...dominantResidue,
                    totalTransactions: totalResidueTransactions
                });
            }

            if (data.suspiciousFlags.length > 0) {
                analysis.summary.suspiciousVendors++;
                analysis.topBeneficiaries.push({
                    vendor,
                    ...data,
                    riskScore: this.calculateRiskScore(data)
                });
            }
        });

        // Sort top beneficiaries by risk score
        analysis.topBeneficiaries.sort((a, b) => b.riskScore - a.riskScore);
        analysis.topBeneficiaries = analysis.topBeneficiaries.slice(0, this.options.topN);

        // Generate recommendations
        analysis.recommendations = this.generateRecommendations(analysis);

        return analysis;
    }

    /**
     * Calculate risk score for a vendor
     */
    calculateRiskScore(vendorData) {
        let score = 0;

        // Base score from cumulative micro amount
        score += Math.min(50, (vendorData.microAmount / this.options.cumulativeThreshold) * 20);

        // Score from frequency
        score += Math.min(30, (vendorData.microTransactions / this.options.minCount) * 15);

        // Score from flags
        const flagScores = {
            'HIGH_CUMULATIVE_MICRO': 25,
            'HIGH_FREQUENCY_MICRO': 20,
            'MAJORITY_MICRO_TRANSACTIONS': 15,
            'HIGH_TINY_TRANSACTION_RATIO': 20,
            'SYSTEMATIC_RESIDUE_PATTERN': 30
        };

        vendorData.suspiciousFlags.forEach(flag => {
            score += flagScores[flag] || 0;
        });

        return Math.min(100, Math.round(score));
    }

    /**
     * Generate investigation recommendations
     */
    generateRecommendations(analysis) {
        const recommendations = [];

        if (analysis.summary.suspiciousVendors > 0) {
            recommendations.push({
                priority: 'HIGH',
                category: 'VENDOR_INVESTIGATION',
                title: 'Investigate Top Micro-Beneficiaries',
                description: `${analysis.summary.suspiciousVendors} vendors show suspicious micro-transaction patterns`,
                actions: [
                    'Review vendor registration and bank account details',
                    'Verify business legitimacy and address',
                    'Check for employee connections or conflicts of interest',
                    'Audit approval processes for micro-amount transactions'
                ]
            });
        }

        if (analysis.summary.totalMicroAmount > this.options.cumulativeThreshold * 5) {
            recommendations.push({
                priority: 'CRITICAL',
                category: 'FINANCIAL_INVESTIGATION',
                title: 'Large Cumulative Micro-Amount Detected',
                description: `Total micro-transaction amount: $${analysis.summary.totalMicroAmount.toFixed(4)}`,
                actions: [
                    'Conduct detailed financial audit of micro-transactions',
                    'Review payment processing fees and rounding policies',
                    'Implement stricter controls on sub-cent transactions',
                    'Consider forensic accounting investigation'
                ]
            });
        }

        if (analysis.residueAnalysis.suspiciousResidueVendors.length > 0) {
            recommendations.push({
                priority: 'HIGH',
                category: 'RESIDUE_ANALYSIS',
                title: 'Systematic Fractional Residue Patterns',
                description: `${analysis.residueAnalysis.suspiciousResidueVendors.length} vendors show systematic residue manipulation`,
                actions: [
                    'Review calculation and rounding algorithms',
                    'Audit payment processing systems for tampering',
                    'Check for unauthorized system modifications',
                    'Implement residue monitoring and alerts'
                ]
            });
        }

        if (analysis.summary.microTransactions > analysis.summary.totalTransactions * 0.1) {
            recommendations.push({
                priority: 'MEDIUM',
                category: 'PROCESS_REVIEW',
                title: 'High Volume of Micro-Transactions',
                description: `${((analysis.summary.microTransactions / analysis.summary.totalTransactions) * 100).toFixed(1)}% of transactions are micro-amounts`,
                actions: [
                    'Review business justification for high micro-transaction volume',
                    'Implement minimum transaction thresholds where appropriate',
                    'Enhance monitoring and reporting for micro-transactions',
                    'Consider batch processing for legitimate micro-payments'
                ]
            });
        }

        return recommendations;
    }

    /**
     * Generate formatted report
     */
    generateReport(analysis) {
        const timestamp = new Date().toISOString();
        
        let report = `
# 🔍 MICRO-SKIMMING ANALYSIS REPORT
Generated: ${timestamp}

## 📊 EXECUTIVE SUMMARY
- **Total Transactions Analyzed:** ${analysis.summary.totalTransactions.toLocaleString()}
- **Micro-Transactions Found:** ${analysis.summary.microTransactions.toLocaleString()} (${((analysis.summary.microTransactions / analysis.summary.totalTransactions) * 100).toFixed(2)}%)
- **Tiny Transactions (≤$0.001):** ${analysis.summary.tinyTransactions.toLocaleString()}
- **Total Micro-Amount:** $${analysis.summary.totalMicroAmount.toFixed(4)}
- **Suspicious Vendors:** ${analysis.summary.suspiciousVendors}

## 🚨 TOP MICRO-BENEFICIARIES

`;

        analysis.topBeneficiaries.forEach((beneficiary, index) => {
            report += `### ${index + 1}. ${beneficiary.vendor}
- **Risk Score:** ${beneficiary.riskScore}/100
- **Micro-Transactions:** ${beneficiary.microTransactions.toLocaleString()} (${((beneficiary.microTransactions / beneficiary.totalTransactions) * 100).toFixed(1)}% of total)
- **Cumulative Micro-Amount:** $${beneficiary.microAmount.toFixed(4)}
- **Average Micro-Amount:** $${beneficiary.microAverageAmount.toFixed(6)}
- **Suspicious Flags:** ${beneficiary.suspiciousFlags.join(', ')}
${beneficiary.dominantResidue ? `- **Dominant Residue:** ${beneficiary.dominantResidue.residue}/10 (${(beneficiary.dominantResidue.proportion * 100).toFixed(1)}% of transactions)` : ''}

`;
        });

        if (analysis.residueAnalysis.suspiciousResidueVendors.length > 0) {
            report += `## 🔢 FRACTIONAL RESIDUE ANALYSIS

`;
            analysis.residueAnalysis.suspiciousResidueVendors.forEach(vendor => {
                report += `- **${vendor.vendor}:** Residue ${vendor.residue}/10 in ${(vendor.proportion * 100).toFixed(1)}% of ${vendor.totalTransactions} transactions
`;
            });
        }

        report += `
## 📋 INVESTIGATION RECOMMENDATIONS

`;

        analysis.recommendations.forEach((rec, index) => {
            report += `### ${index + 1}. ${rec.title} (${rec.priority} PRIORITY)
**Category:** ${rec.category}
**Description:** ${rec.description}

**Recommended Actions:**
`;
            rec.actions.forEach(action => {
                report += `- ${action}
`;
            });
            report += `
`;
        });

        report += `
## 🔧 TECHNICAL DETAILS
- **Micro-Threshold:** $${this.options.microThreshold}
- **Tiny Threshold:** $${this.options.tinyThreshold}
- **Cumulative Threshold:** $${this.options.cumulativeThreshold}
- **Minimum Count:** ${this.options.minCount}

---
*This report was generated by the Oqualtix Enhanced Fraud Detection System*
`;

        return report;
    }

    /**
     * Export analysis results to JSON
     */
    exportJSON(analysis, filename = 'micro_skimming_analysis.json') {
        fs.writeFileSync(filename, JSON.stringify(analysis, null, 2));
        console.log(`📄 Analysis exported to ${filename}`);
    }

    /**
     * Export report to markdown file
     */
    exportReport(report, filename = 'micro_skimming_report.md') {
        fs.writeFileSync(filename, report);
        console.log(`📄 Report exported to ${filename}`);
    }
}

// CLI interface
async function main() {
    console.log('🔍 Micro-Skimming Detection Report Generator');
    console.log('===========================================');

    // Generate sample data for demonstration
    console.log('📊 Generating sample transaction data...');
    const sampleData = generateSampleData();

    // Add some micro-skimming patterns to the sample data
    console.log('🎯 Adding micro-skimming test patterns...');
    
    // Add micro-skimming transactions
    for (let i = 0; i < 150; i++) {
        sampleData.push({
            transaction_id: `MICRO_${String(i + 1).padStart(4, '0')}`,
            date: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            vendor: 'Micro Processing Services',
            amount: Math.random() * 0.009 + 0.001, // 0.001 to 0.01
            description: 'Processing fee',
            payment_method: 'Electronic',
            category: 'fees'
        });
    }

    // Add systematic residue pattern
    for (let i = 0; i < 80; i++) {
        const baseAmount = Math.floor(Math.random() * 500) + 50;
        sampleData.push({
            transaction_id: `RESIDUE_${String(i + 1).padStart(4, '0')}`,
            date: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            vendor: 'Systematic Residue Corp',
            amount: baseAmount + 0.003, // Always .003 residue
            description: 'Service charge',
            payment_method: 'ACH',
            category: 'services'
        });
    }

    console.log(`📈 Analyzing ${sampleData.length} transactions...`);

    // Initialize report generator
    const generator = new MicroSkimmingReportGenerator({
        microThreshold: 0.01,
        tinyThreshold: 0.001,
        cumulativeThreshold: 50, // Lower threshold for demo
        minCount: 20,
        topN: 5
    });

    // Analyze micro-skimming patterns
    const analysis = generator.analyzeMicroSkimming(sampleData);

    // Generate report
    const report = generator.generateReport(analysis);

    // Display summary
    console.log('\n🎯 ANALYSIS SUMMARY:');
    console.log(`📊 Total Transactions: ${analysis.summary.totalTransactions.toLocaleString()}`);
    console.log(`🔍 Micro-Transactions: ${analysis.summary.microTransactions.toLocaleString()}`);
    console.log(`💰 Total Micro-Amount: $${analysis.summary.totalMicroAmount.toFixed(4)}`);
    console.log(`⚠️  Suspicious Vendors: ${analysis.summary.suspiciousVendors}`);

    if (analysis.topBeneficiaries.length > 0) {
        console.log('\n🚨 TOP SUSPICIOUS VENDORS:');
        analysis.topBeneficiaries.slice(0, 3).forEach((vendor, index) => {
            console.log(`${index + 1}. ${vendor.vendor} (Risk: ${vendor.riskScore}/100, Amount: $${vendor.microAmount.toFixed(4)})`);
        });
    }

    if (analysis.recommendations.length > 0) {
        console.log('\n📋 KEY RECOMMENDATIONS:');
        analysis.recommendations.slice(0, 2).forEach((rec, index) => {
            console.log(`${index + 1}. ${rec.title} (${rec.priority})`);
        });
    }

    // Export files
    generator.exportJSON(analysis, 'micro_skimming_analysis.json');
    generator.exportReport(report, 'micro_skimming_report.md');

    console.log('\n✅ Analysis complete!');
    console.log('📄 Check micro_skimming_report.md for detailed findings');
    console.log('📊 Check micro_skimming_analysis.json for raw data');
}

// Run CLI if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(error => {
        console.error('💥 Error:', error);
        process.exit(1);
    });
}

export { MicroSkimmingReportGenerator };