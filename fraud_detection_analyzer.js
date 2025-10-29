#!/usr/bin/env node
/**
 * Enhanced Fraud Detection Analyzer
 * Computes per-vendor mean/sigma and identifies anomalous transactions using multiple detection methods.
 * Demonstrates the Oqualtix App's anomaly detection capabilities.
 */

import fs from 'fs';
import path from 'path';

/**
 * Utility functions for statistical calculations
 */
class StatUtils {
    static mean(arr) {
        return arr.reduce((sum, val) => sum + val, 0) / arr.length;
    }
    
    static stdev(arr) {
        if (arr.length <= 1) return 0;
        const avgVal = this.mean(arr);
        const squareDiffs = arr.map(val => Math.pow(val - avgVal, 2));
        return Math.sqrt(this.mean(squareDiffs));
    }
    
    static median(arr) {
        const sorted = [...arr].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2 === 0 
            ? (sorted[mid - 1] + sorted[mid]) / 2 
            : sorted[mid];
    }
    
    static quantile(arr, q) {
        const sorted = [...arr].sort((a, b) => a - b);
        const pos = (sorted.length - 1) * q;
        const base = Math.floor(pos);
        const rest = pos - base;
        
        if (sorted[base + 1] !== undefined) {
            return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
        } else {
            return sorted[base];
        }
    }
}

/**
 * Enhanced Fraud Detection Analyzer Class
 */
class FraudDetectionAnalyzer {
    constructor(sigmaThreshold = 3.0, minTransactions = 5) {
        this.sigmaThreshold = sigmaThreshold;
        this.minTransactions = minTransactions;
        this.vendorStats = {};
        this.anomalies = [];
        this.data = [];
    }
    
    /**
     * Load transaction data from JSON array or CSV file
     */
    loadData(csvFile = null, data = null) {
        if (data !== null) {
            this.data = [...data];
        } else if (csvFile) {
            // Simple CSV parsing (assumes comma-separated values)
            const csvContent = fs.readFileSync(csvFile, 'utf8');
            const lines = csvContent.split('\n').filter(line => line.trim());
            const headers = lines[0].split(',').map(h => h.trim());
            
            this.data = lines.slice(1).map(line => {
                const values = line.split(',').map(v => v.trim());
                const obj = {};
                headers.forEach((header, index) => {
                    obj[header] = values[index];
                });
                
                // Convert amount to number and date to Date object
                obj.amount = parseFloat(obj.amount);
                obj.date = new Date(obj.date);
                return obj;
            });
        } else {
            throw new Error("Must provide either csvFile or data array");
        }
        
        // Ensure required columns exist
        const requiredCols = ['date', 'amount', 'vendor', 'description', 'payment_method'];
        const sampleRow = this.data[0] || {};
        const missingCols = requiredCols.filter(col => !(col in sampleRow));
        if (missingCols.length > 0) {
            throw new Error(`Missing required columns: ${missingCols.join(', ')}`);
        }
        
        // Convert date strings to Date objects and sort
        this.data = this.data.map(row => ({
            ...row,
            date: row.date instanceof Date ? row.date : new Date(row.date)
        })).sort((a, b) => a.date - b.date);
        
        return this.data;
    }
    
    /**
     * Compute mean, std deviation, and other stats per vendor
     */
    computeVendorStatistics() {
        console.log("Computing per-vendor statistics...");
        
        const vendorStats = {};
        const vendorGroups = {};
        
        // Group transactions by vendor
        this.data.forEach(row => {
            if (!vendorGroups[row.vendor]) {
                vendorGroups[row.vendor] = [];
            }
            vendorGroups[row.vendor].push(row.amount);
        });
        
        // Compute statistics for each vendor
        Object.entries(vendorGroups).forEach(([vendor, amounts]) => {
            if (amounts.length >= this.minTransactions) {
                const stats = {
                    count: amounts.length,
                    mean: StatUtils.mean(amounts),
                    std: StatUtils.stdev(amounts),
                    median: StatUtils.median(amounts),
                    min: Math.min(...amounts),
                    max: Math.max(...amounts),
                    q25: StatUtils.quantile(amounts, 0.25),
                    q75: StatUtils.quantile(amounts, 0.75)
                };
                stats.iqr = stats.q75 - stats.q25;
                stats.threshold3Sigma = stats.mean + (this.sigmaThreshold * stats.std);
                vendorStats[vendor] = stats;
            }
        });
        
        this.vendorStats = vendorStats;
        return vendorStats;
    }
    
    /**
     * Detect transactions that exceed mean + 3σ threshold
     */
    detectStatisticalOutliers() {
        console.log("Detecting statistical outliers (mean + 3σ method)...");
        
        const outliers = [];
        
        this.data.forEach((row, index) => {
            const vendor = row.vendor;
            const amount = row.amount;
            
            if (vendor in this.vendorStats) {
                const stats = this.vendorStats[vendor];
                const threshold = stats.threshold3Sigma;
                
                if (amount > threshold) {
                    const sigmaMultiplier = stats.std > 0 ? (amount - stats.mean) / stats.std : 0;
                    const outlier = {
                        transactionId: row.transaction_id || `txn_${index}`,
                        date: row.date,
                        vendor: vendor,
                        amount: amount,
                        description: row.description,
                        anomalyType: 'Statistical Outlier',
                        riskScore: Math.min(100, Math.max(0, (sigmaMultiplier - 3) * 20 + 70)),
                        reason: `Amount $${amount.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})} exceeds vendor threshold $${threshold.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})} (${sigmaMultiplier.toFixed(1)}σ above mean)`,
                        vendorMean: stats.mean,
                        vendorStd: stats.std,
                        sigmaMultiplier: sigmaMultiplier
                    };
                    outliers.push(outlier);
                }
            }
        });
        
        return outliers;
    }
    
    /**
     * Detect suspicious round dollar amounts and threshold evasion
     */
    detectRoundDollarPatterns() {
        console.log("Detecting round dollar patterns and threshold evasion...");
        
        const suspiciousPatterns = [];
        
        // Common approval thresholds
        const thresholds = [1000, 2500, 5000, 10000, 25000, 50000];
        
        this.data.forEach((row, index) => {
            const amount = row.amount;
            
            // Check for round dollar amounts
            if (amount % 100 === 0 && amount >= 1000) {
                const riskScore = Math.min(85, 40 + (amount / 10000));  // Higher amounts = higher risk
                const pattern = {
                    transactionId: row.transaction_id || `txn_${index}`,
                    date: row.date,
                    vendor: row.vendor,
                    amount: amount,
                    description: row.description,
                    anomalyType: 'Round Dollar Pattern',
                    riskScore: riskScore,
                    reason: `Suspicious round dollar amount: $${amount.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`
                };
                suspiciousPatterns.push(pattern);
            }
            
            // Check for threshold evasion (amounts just under common thresholds)
            for (const threshold of thresholds) {
                if (threshold - 100 <= amount && amount < threshold) {
                    const pattern = {
                        transactionId: row.transaction_id || `txn_${index}`,
                        date: row.date,
                        vendor: row.vendor,
                        amount: amount,
                        description: row.description,
                        anomalyType: 'Threshold Evasion',
                        riskScore: 80,
                        reason: `Amount $${amount.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})} just under $${threshold.toLocaleString('en-US')} threshold (possible approval evasion)`
                    };
                    suspiciousPatterns.push(pattern);
                    break;
                }
            }
        });
        
        return suspiciousPatterns;
    }
    
    /**
     * Detect vendors with unusual payment frequency patterns
     */
    detectFrequencyAnomalies() {
        console.log("Detecting payment frequency anomalies...");
        
        const frequencyAnomalies = [];
        
        // Group by vendor and month
        const monthlyCountsMap = new Map();
        
        this.data.forEach(row => {
            const yearMonth = `${row.date.getFullYear()}-${(row.date.getMonth() + 1).toString().padStart(2, '0')}`;
            const key = `${row.vendor}|${yearMonth}`;
            monthlyCountsMap.set(key, (monthlyCountsMap.get(key) || 0) + 1);
        });
        
        // Convert to array format
        const monthlyCounts = [];
        monthlyCountsMap.forEach((count, key) => {
            const [vendor, yearMonth] = key.split('|');
            monthlyCounts.push({ vendor, yearMonth, transactionCount: count });
        });
        
        // Analyze frequency for each vendor
        const vendorFrequencies = {};
        monthlyCounts.forEach(row => {
            if (!vendorFrequencies[row.vendor]) {
                vendorFrequencies[row.vendor] = [];
            }
            vendorFrequencies[row.vendor].push(row.transactionCount);
        });
        
        Object.entries(vendorFrequencies).forEach(([vendor, counts]) => {
            if (counts.length >= 3) {  // Need at least 3 months of data
                const meanFreq = StatUtils.mean(counts);
                const stdFreq = StatUtils.stdev(counts);
                
                if (stdFreq > 0) {
                    monthlyCounts.filter(row => row.vendor === vendor).forEach(row => {
                        const count = row.transactionCount;
                        if (count > meanFreq + (2 * stdFreq) && count >= 10) {  // Unusual spike
                            const anomaly = {
                                transactionId: `freq_${vendor}_${row.yearMonth}`,
                                date: row.yearMonth,
                                vendor: vendor,
                                amount: 0,  // Frequency anomaly, not amount-based
                                description: `High frequency month: ${count} transactions`,
                                anomalyType: 'Frequency Spike',
                                riskScore: Math.min(90, 50 + (count - meanFreq) * 5),
                                reason: `Unusual payment frequency: ${count} transactions vs. typical ${meanFreq.toFixed(1)} per month`
                            };
                            frequencyAnomalies.push(anomaly);
                        }
                    });
                }
            }
        });
        
        return frequencyAnomalies;
    }
    
    /**
     * Detect vendors receiving unusually high percentage of total payments
     */
    detectVendorConcentration(concentrationThreshold = 0.3) {
        console.log("Detecting vendor concentration anomalies...");
        
        const concentrationAnomalies = [];
        
        const totalAmount = this.data.reduce((sum, row) => sum + row.amount, 0);
        const vendorTotals = {};
        
        // Calculate total amount per vendor
        this.data.forEach(row => {
            vendorTotals[row.vendor] = (vendorTotals[row.vendor] || 0) + row.amount;
        });
        
        // Sort vendors by total amount
        const sortedVendors = Object.entries(vendorTotals).sort((a, b) => b[1] - a[1]);
        
        sortedVendors.forEach(([vendor, total]) => {
            const concentration = total / totalAmount;
            
            if (concentration > concentrationThreshold) {
                const anomaly = {
                    transactionId: `conc_${vendor}`,
                    date: 'Overall Period',
                    vendor: vendor,
                    amount: total,
                    description: `High vendor concentration: ${(concentration * 100).toFixed(1)}% of total payments`,
                    anomalyType: 'Vendor Concentration',
                    riskScore: Math.min(95, 60 + (concentration * 100)),
                    reason: `Vendor receives ${(concentration * 100).toFixed(1)}% of all payments ($${total.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})} of $${totalAmount.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})})`
                };
                concentrationAnomalies.push(anomaly);
            }
        });
        
        return concentrationAnomalies;
    }
    
    /**
     * Detect embezzlement patterns based on high-profile cases
     */
    detectEmbezzlementPatterns() {
        console.log("Detecting embezzlement patterns based on real cases...");
        
        const embezzlementAnomalies = [];
        
        // Pattern 1: Round dollar amounts (Dennis Kozlowski - Tyco case)
        // Corporate executives using company funds for personal expenses
        this.data.forEach((row, index) => {
            const amount = row.amount;
            if ((amount % 1000 === 0 || amount % 500 === 0) && amount >= 1000) {
                embezzlementAnomalies.push({
                    transactionId: row.transaction_id || `txn_${index}`,
                    date: row.date,
                    vendor: row.vendor,
                    amount: amount,
                    description: row.description,
                    anomalyType: 'Round Dollar Embezzlement',
                    riskScore: 85,
                    embezzlementPattern: 'Kozlowski Pattern',
                    reason: `Round dollar amount pattern: $${amount.toLocaleString()} (typical of corporate card abuse)`
                });
            }
        });
        
        // Pattern 2: Just-under-threshold amounts (Wells Fargo patterns)
        // Staying under approval limits to avoid detection
        const thresholds = [1000, 2500, 5000, 10000, 25000, 50000];
        
        this.data.forEach((row, index) => {
            const amount = row.amount;
            thresholds.forEach(threshold => {
                if (amount >= (threshold - 100) && amount < threshold) {
                    embezzlementAnomalies.push({
                        transactionId: row.transaction_id || `txn_${index}`,
                        date: row.date,
                        vendor: row.vendor,
                        amount: amount,
                        description: row.description,
                        anomalyType: 'Threshold Evasion Embezzlement',
                        riskScore: 90,
                        embezzlementPattern: 'Wells Fargo Pattern',
                        reason: `Amount $${amount.toLocaleString()} suspiciously close to $${threshold.toLocaleString()} threshold`
                    });
                }
            });
        });
        
        // Pattern 3: Frequent small amounts (Rita Crundwell - Dixon embezzlement)
        // Many small transactions to avoid detection over long periods
        const vendorFrequency = {};
        this.data.forEach(row => {
            if (row.amount < 5000) {
                if (!vendorFrequency[row.vendor]) {
                    vendorFrequency[row.vendor] = [];
                }
                vendorFrequency[row.vendor].push(row);
            }
        });
        
        Object.entries(vendorFrequency).forEach(([vendor, transactions]) => {
            if (transactions.length >= 15) { // Many transactions
                const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);
                const avgAmount = totalAmount / transactions.length;
                
                if (totalAmount > 50000 && avgAmount < 3000) {
                    // Flag the most recent transactions as suspicious
                    transactions.slice(-3).forEach(transaction => {
                        embezzlementAnomalies.push({
                            transactionId: transaction.transaction_id,
                            date: transaction.date,
                            vendor: vendor,
                            amount: transaction.amount,
                            description: transaction.description,
                            anomalyType: 'Structuring Embezzlement',
                            riskScore: 95,
                            embezzlementPattern: 'Crundwell Pattern',
                            reason: `Potential structuring: ${transactions.length} small payments totaling $${totalAmount.toLocaleString()}`
                        });
                    });
                }
            }
        });
        
        // Pattern 4: Similar vendor names (Frank Abagnale techniques)
        // Multiple vendors with similar names that could be the same entity
        const vendorNames = [...new Set(this.data.map(row => row.vendor))];
        const suspiciousVendorPairs = [];
        
        for (let i = 0; i < vendorNames.length; i++) {
            for (let j = i + 1; j < vendorNames.length; j++) {
                const similarity = this.calculateStringSimilarity(vendorNames[i], vendorNames[j]);
                if (similarity > 0.75 && similarity < 1.0) {
                    suspiciousVendorPairs.push([vendorNames[i], vendorNames[j], similarity]);
                }
            }
        }
        
        suspiciousVendorPairs.forEach(([vendor1, vendor2, similarity]) => {
            const transactions1 = this.data.filter(row => row.vendor === vendor1);
            const transactions2 = this.data.filter(row => row.vendor === vendor2);
            
            [...transactions1, ...transactions2].forEach(transaction => {
                embezzlementAnomalies.push({
                    transactionId: transaction.transaction_id,
                    date: transaction.date,
                    vendor: transaction.vendor,
                    amount: transaction.amount,
                    description: transaction.description,
                    anomalyType: 'Duplicate Vendor Embezzlement',
                    riskScore: 80,
                    embezzlementPattern: 'Abagnale Pattern',
                    reason: `Suspicious vendor similarity: "${vendor1}" vs "${vendor2}" (${(similarity * 100).toFixed(1)}% similar)`
                });
            });
        });
        
        // Pattern 5: Off-hours transactions (Enron energy trading)
        // Large transactions during times with minimal oversight
        this.data.forEach((row, index) => {
            const date = new Date(row.date);
            const hour = date.getHours();
            const day = date.getDay();
            const amount = row.amount;
            
            const isWeekend = day === 0 || day === 6;
            const isAfterHours = hour < 6 || hour > 22;
            const isLargeAmount = amount > 10000;
            
            if ((isWeekend || isAfterHours) && isLargeAmount) {
                embezzlementAnomalies.push({
                    transactionId: row.transaction_id || `txn_${index}`,
                    date: row.date,
                    vendor: row.vendor,
                    amount: amount,
                    description: row.description,
                    anomalyType: 'Off-Hours Embezzlement',
                    riskScore: 85,
                    embezzlementPattern: 'Enron Pattern',
                    reason: `Large transaction during off-hours: $${amount.toLocaleString()} on ${date.toLocaleDateString()} at ${hour}:00`
                });
            }
        });
        
        return embezzlementAnomalies;
    }
    
    /**
     * Detect kickback schemes based on consulting/advisory patterns
     */
    detectKickbackSchemes() {
        console.log("Detecting kickback schemes based on Siemens and similar cases...");
        
        const kickbackAnomalies = [];
        
        // Look for consulting/advisory transactions
        const consultingTransactions = this.data.filter(row => {
            const desc = row.description.toLowerCase();
            const category = row.category ? row.category.toLowerCase() : '';
            
            return desc.includes('consulting') || desc.includes('advisory') || 
                   desc.includes('commission') || desc.includes('referral') ||
                   category.includes('consulting') || category.includes('advisory');
        });
        
        if (consultingTransactions.length > 0) {
            // Group by vendor
            const consultingVendors = {};
            consultingTransactions.forEach(transaction => {
                if (!consultingVendors[transaction.vendor]) {
                    consultingVendors[transaction.vendor] = [];
                }
                consultingVendors[transaction.vendor].push(transaction);
            });
            
            // Analyze each consulting vendor
            Object.entries(consultingVendors).forEach(([vendor, transactions]) => {
                const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);
                const avgAmount = totalAmount / transactions.length;
                
                // Pattern 1: High-value, low-volume consulting (potential kickbacks)
                if (totalAmount > 100000 && transactions.length < 10 && avgAmount > 15000) {
                    transactions.forEach(transaction => {
                        kickbackAnomalies.push({
                            transactionId: transaction.transaction_id,
                            date: transaction.date,
                            vendor: vendor,
                            amount: transaction.amount,
                            description: transaction.description,
                            anomalyType: 'High-Value Consulting Kickback',
                            riskScore: 90,
                            embezzlementPattern: 'Siemens Bribery Pattern',
                            reason: `Unusually high consulting fees: $${transaction.amount.toLocaleString()} (avg: $${avgAmount.toLocaleString()})`
                        });
                    });
                }
                
                // Pattern 2: Round percentage amounts (common in kickback schemes)
                const roundAmounts = transactions.filter(t => 
                    t.amount % 250 === 0 || t.amount % 500 === 0 || t.amount % 1000 === 0
                );
                
                if (roundAmounts.length / transactions.length > 0.7) {
                    roundAmounts.forEach(transaction => {
                        kickbackAnomalies.push({
                            transactionId: transaction.transaction_id,
                            date: transaction.date,
                            vendor: vendor,
                            amount: transaction.amount,
                            description: transaction.description,
                            anomalyType: 'Percentage-Based Kickback',
                            riskScore: 85,
                            embezzlementPattern: 'Commission Kickback Pattern',
                            reason: `Round percentage amount suggests kickback: $${transaction.amount.toLocaleString()}`
                        });
                    });
                }
                
                // Pattern 3: Consulting payments immediately after large contracts
                transactions.forEach(consultingTransaction => {
                    const consultingDate = new Date(consultingTransaction.date);
                    
                    // Look for large contracts within 30 days before this consulting payment
                    const recentLargeTransactions = this.data.filter(row => {
                        const transactionDate = new Date(row.date);
                        const daysDiff = (consultingDate - transactionDate) / (1000 * 60 * 60 * 24);
                        
                        return daysDiff >= 0 && daysDiff <= 30 && 
                               row.amount > 500000 && 
                               row !== consultingTransaction;
                    });
                    
                    if (recentLargeTransactions.length > 0) {
                        kickbackAnomalies.push({
                            transactionId: consultingTransaction.transaction_id,
                            date: consultingTransaction.date,
                            vendor: vendor,
                            amount: consultingTransaction.amount,
                            description: consultingTransaction.description,
                            anomalyType: 'Post-Contract Kickback',
                            riskScore: 95,
                            embezzlementPattern: 'Contract Kickback Pattern',
                            reason: `Consulting payment shortly after large contract award: $${consultingTransaction.amount.toLocaleString()}`
                        });
                    }
                });
            });
        }
        
        return kickbackAnomalies;
    }
    
    /**
     * Calculate string similarity for vendor name comparison
     */
    calculateStringSimilarity(str1, str2) {
        const longer = str1.length > str2.length ? str1.toLowerCase() : str2.toLowerCase();
        const shorter = str1.length > str2.length ? str2.toLowerCase() : str1.toLowerCase();
        
        if (longer.length === 0) return 1.0;
        
        const editDistance = this.calculateEditDistance(longer, shorter);
        return (longer.length - editDistance) / longer.length;
    }
    
    /**
     * Calculate Levenshtein distance
     */
    calculateEditDistance(str1, str2) {
        const matrix = [];
        
        for (let i = 0; i <= str2.length; i++) {
            matrix[i] = [i];
        }
        
        for (let j = 0; j <= str1.length; j++) {
            matrix[0][j] = j;
        }
        
        for (let i = 1; i <= str2.length; i++) {
            for (let j = 1; j <= str1.length; j++) {
                if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }
        
        return matrix[str2.length][str1.length];
    }
    
    /**
     * Run all anomaly detection methods and return combined results
     */
    runFullAnalysis() {
        console.log("\n🔍 Running Enhanced Fraud Detection Analysis...");
        console.log(`📊 Analyzing ${this.data.length} transactions across ${new Set(this.data.map(row => row.vendor)).size} vendors`);
        
        const minDate = new Date(Math.min(...this.data.map(row => row.date)));
        const maxDate = new Date(Math.max(...this.data.map(row => row.date)));
        const totalAmount = this.data.reduce((sum, row) => sum + row.amount, 0);
        
        console.log(`📅 Date range: ${minDate.toDateString()} to ${maxDate.toDateString()}`);
        console.log(`💰 Total amount: $${totalAmount.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`);
        console.log("-".repeat(60));
        
        // Compute vendor statistics first
        this.computeVendorStatistics();
        
        // Run all detection methods
        const allAnomalies = [];
        
        // 1. Statistical outliers (mean + 3σ)
        const outliers = this.detectStatisticalOutliers();
        allAnomalies.push(...outliers);
        
        // 2. Round dollar patterns and threshold evasion
        const roundPatterns = this.detectRoundDollarPatterns();
        allAnomalies.push(...roundPatterns);
        
        // 3. Frequency anomalies
        const freqAnomalies = this.detectFrequencyAnomalies();
        allAnomalies.push(...freqAnomalies);
        
        // 4. Vendor concentration
        const concAnomalies = this.detectVendorConcentration();
        allAnomalies.push(...concAnomalies);
        
        // 5. Embezzlement pattern detection
        const embezzlementAnomalies = this.detectEmbezzlementPatterns();
        allAnomalies.push(...embezzlementAnomalies);
        
        // 6. Kickback scheme detection
        const kickbackAnomalies = this.detectKickbackSchemes();
        allAnomalies.push(...kickbackAnomalies);
        
        // Sort by risk score (highest first)
        allAnomalies.sort((a, b) => b.riskScore - a.riskScore);
        
        this.anomalies = allAnomalies;
        return allAnomalies;
    }
    
    /**
     * Print a summary of the analysis results
     */
    printSummary() {
        if (this.anomalies.length === 0) {
            console.log("No anomalies detected.");
            return;
        }
        
        console.log(`\n🚨 FRAUD DETECTION SUMMARY`);
        console.log(`📋 Total anomalies detected: ${this.anomalies.length}`);
        
        // Group by anomaly type
        const typeCounts = {};
        this.anomalies.forEach(anomaly => {
            const atype = anomaly.anomalyType;
            typeCounts[atype] = (typeCounts[atype] || 0) + 1;
        });
        
        console.log("\n📊 Anomalies by type:");
        Object.entries(typeCounts).forEach(([atype, count]) => {
            console.log(`   • ${atype}: ${count}`);
        });
        
        // Show high-risk anomalies (risk score >= 80)
        const highRisk = this.anomalies.filter(a => a.riskScore >= 80);
        console.log(`\n🔥 High-risk anomalies (score ≥ 80): ${highRisk.length}`);
        
        console.log("\n" + "=".repeat(80));
        console.log("TOP 10 HIGHEST RISK ANOMALIES");
        console.log("=".repeat(80));
        
        for (let i = 0; i < Math.min(10, this.anomalies.length); i++) {
            const anomaly = this.anomalies[i];
            console.log(`\n[${i+1}] RISK SCORE: ${Math.round(anomaly.riskScore)}/100`);
            console.log(`    📅 Date: ${anomaly.date instanceof Date ? anomaly.date.toDateString() : anomaly.date}`);
            console.log(`    🏢 Vendor: ${anomaly.vendor}`);
            console.log(`    💰 Amount: $${anomaly.amount.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`);
            console.log(`    📝 Description: ${anomaly.description}`);
            console.log(`    🚩 Type: ${anomaly.anomalyType}`);
            console.log(`    ⚠️  Reason: ${anomaly.reason}`);
        }
    }
    
    /**
     * Export anomaly results to JSON file
     */
    exportResults(filename = "fraud_anomalies.json") {
        if (this.anomalies.length > 0) {
            // Convert dates to strings for JSON serialization
            const exportData = this.anomalies.map(anomaly => ({
                ...anomaly,
                date: anomaly.date instanceof Date ? anomaly.date.toISOString() : anomaly.date
            }));
            
            fs.writeFileSync(filename, JSON.stringify(exportData, null, 2));
            console.log(`\n💾 Results exported to ${filename}`);
        } else {
            console.log("No anomalies to export.");
        }
    }
}

/**
 * Generate realistic sample transaction data with embedded fraud patterns
 */
function generateSampleData() {
    console.log("📊 Generating sample transaction data with embedded fraud patterns...");
    
    const vendors = [
        "Office Supplies Inc", "Tech Solutions LLC", "Catering Services", 
        "Legal Associates", "Marketing Agency", "Facility Management",
        "IT Support Co", "Consulting Group", "Travel Agency", "Equipment Rental",
        "Suspicious Vendor A", "Shell Company B", "Round Dollar Corp"
    ];
    
    const paymentMethods = ["ACH", "Check", "Wire Transfer", "Credit Card", "Electronic"];
    
    const transactions = [];
    
    // Generate normal transactions for most vendors
    for (let i = 0; i < 10; i++) {  // First 10 are legitimate
        const vendor = vendors[i];
        let baseAmount, variation;
        
        // Each vendor has typical payment range
        if (vendor.includes("Office")) {
            baseAmount = 500;
            variation = 200;
        } else if (vendor.includes("Tech") || vendor.includes("IT")) {
            baseAmount = 2000;
            variation = 800;
        } else if (vendor.includes("Legal") || vendor.includes("Consulting")) {
            baseAmount = 3500;
            variation = 1500;
        } else if (vendor.includes("Marketing")) {
            baseAmount = 1200;
            variation = 600;
        } else {
            baseAmount = 800;
            variation = 400;
        }
        
        // Generate 15-25 normal transactions per vendor
        const numTransactions = Math.floor(Math.random() * 11) + 15;  // 15-25
        
        for (let j = 0; j < numTransactions; j++) {
            // Normal distribution around base amount (approximated)
            const amount = Math.max(50, baseAmount + (Math.random() - 0.5) * 2 * variation);
            
            // Random date in the last 6 months
            const daysAgo = Math.floor(Math.random() * 180);
            const date = new Date();
            date.setDate(date.getDate() - daysAgo);
            
            transactions.push({
                transaction_id: `TXN${String(transactions.length + 1).padStart(4, '0')}`,
                date: date.toISOString().split('T')[0],
                vendor: vendor,
                amount: Math.round(amount * 100) / 100,
                description: `Services from ${vendor}`,
                payment_method: paymentMethods[Math.floor(Math.random() * paymentMethods.length)]
            });
        }
    }
    
    // Add fraudulent patterns
    
    // 1. Statistical outliers - Suspicious Vendor A gets some huge payments
    const fraudVendor = "Suspicious Vendor A";
    // Normal payments first
    for (let i = 0; i < 8; i++) {
        const amount = 800 + (Math.random() - 0.5) * 400;  // ~600-1000
        const daysAgo = Math.floor(Math.random() * 120) + 30;
        const date = new Date();
        date.setDate(date.getDate() - daysAgo);
        
        transactions.push({
            transaction_id: `TXN${String(transactions.length + 1).padStart(4, '0')}`,
            date: date.toISOString().split('T')[0],
            vendor: fraudVendor,
            amount: Math.round(amount * 100) / 100,
            description: `Regular services from ${fraudVendor}`,
            payment_method: paymentMethods[Math.floor(Math.random() * paymentMethods.length)]
        });
    }
    
    // Then add massive outliers (embezzlement)
    const outlierAmounts = [15000, 22500, 18750];  // Way above normal ~$800
    outlierAmounts.forEach(amount => {
        const daysAgo = Math.floor(Math.random() * 60);
        const date = new Date();
        date.setDate(date.getDate() - daysAgo);
        
        transactions.push({
            transaction_id: `TXN${String(transactions.length + 1).padStart(4, '0')}`,
            date: date.toISOString().split('T')[0],
            vendor: fraudVendor,
            amount: amount,
            description: `Special project payment - ${fraudVendor}`,
            payment_method: "Wire Transfer"
        });
    });
    
    // 2. Round dollar fraud - Shell Company B
    const shellVendor = "Shell Company B";
    const roundAmounts = [5000, 10000, 15000, 7500, 12500];
    roundAmounts.forEach(amount => {
        const daysAgo = Math.floor(Math.random() * 80) + 10;
        const date = new Date();
        date.setDate(date.getDate() - daysAgo);
        
        transactions.push({
            transaction_id: `TXN${String(transactions.length + 1).padStart(4, '0')}`,
            date: date.toISOString().split('T')[0],
            vendor: shellVendor,
            amount: amount,
            description: "Consulting services - exact amount",
            payment_method: "Check"
        });
    });
    
    // 3. Threshold evasion - Round Dollar Corp
    const thresholdVendor = "Round Dollar Corp";
    // Payments just under common thresholds
    const evasionAmounts = [4999, 9999, 4950, 9900, 4999, 24999];
    evasionAmounts.forEach(amount => {
        const daysAgo = Math.floor(Math.random() * 115) + 5;
        const date = new Date();
        date.setDate(date.getDate() - daysAgo);
        
        transactions.push({
            transaction_id: `TXN${String(transactions.length + 1).padStart(4, '0')}`,
            date: date.toISOString().split('T')[0],
            vendor: thresholdVendor,
            amount: amount,
            description: "Equipment purchase - just under limit",
            payment_method: "Electronic"
        });
    });
    
    // 4. Frequency spike - Office Supplies Inc gets unusual activity
    // Add many small transactions in recent month (structuring)
    for (let i = 0; i < 15; i++) {  // 15 extra transactions = suspicious frequency
        const amount = Math.random() * 400 + 200;  // 200-600
        const daysAgo = Math.floor(Math.random() * 30);  // All in last month
        const date = new Date();
        date.setDate(date.getDate() - daysAgo);
        
        transactions.push({
            transaction_id: `TXN${String(transactions.length + 1).padStart(4, '0')}`,
            date: date.toISOString().split('T')[0],
            vendor: "Office Supplies Inc",
            amount: Math.round(amount * 100) / 100,
            description: "Small office supplies order",
            payment_method: "Credit Card",
            category: "office supplies"
        });
    }
    
    // 5. Embezzlement Pattern - Kozlowski-style round dollar amounts
    const embezzlementVendor = "Executive Services LLC";
    const kozlowskiAmounts = [5000, 10000, 15000, 8000, 12000];
    kozlowskiAmounts.forEach(amount => {
        const daysAgo = Math.floor(Math.random() * 90) + 10;
        const date = new Date();
        date.setDate(date.getDate() - daysAgo);
        
        transactions.push({
            transaction_id: `TXN${String(transactions.length + 1).padStart(4, '0')}`,
            date: date.toISOString().split('T')[0],
            vendor: embezzlementVendor,
            amount: amount,
            description: "Executive consulting services",
            payment_method: "Wire Transfer",
            category: "consulting"
        });
    });
    
    // 6. Kickback Pattern - Siemens-style consulting after contracts
    const kickbackVendor = "Strategic Advisory Group";
    
    // First, add a large contract
    const contractDate = new Date();
    contractDate.setDate(contractDate.getDate() - 45);
    transactions.push({
        transaction_id: `TXN${String(transactions.length + 1).padStart(4, '0')}`,
        date: contractDate.toISOString().split('T')[0],
        vendor: "Major Construction Corp",
        amount: 750000,
        description: "Infrastructure development contract",
        payment_method: "Wire Transfer",
        category: "construction"
    });
    
    // Then add suspicious consulting fees shortly after
    const consultingAmounts = [25000, 37500, 50000]; // Suspicious round amounts
    consultingAmounts.forEach((amount, index) => {
        const daysAfterContract = 7 + (index * 5); // 7, 12, 17 days after contract
        const consultingDate = new Date(contractDate);
        consultingDate.setDate(consultingDate.getDate() + daysAfterContract);
        
        transactions.push({
            transaction_id: `TXN${String(transactions.length + 1).padStart(4, '0')}`,
            date: consultingDate.toISOString().split('T')[0],
            vendor: kickbackVendor,
            amount: amount,
            description: "Strategic advisory consulting services",
            payment_method: "Check",
            category: "consulting"
        });
    });
    
    // 7. Similar vendor names (Abagnale pattern)
    const similarVendors = [
        "ABC Consulting Services",
        "ABC Consulting Service", // Very similar name
        "A.B.C. Consulting Services" // Another variation
    ];
    
    similarVendors.forEach((vendor, index) => {
        const amount = 8500 + (index * 1000); // 8500, 9500, 10500
        const daysAgo = Math.floor(Math.random() * 60) + 10;
        const date = new Date();
        date.setDate(date.getDate() - daysAgo);
        
        transactions.push({
            transaction_id: `TXN${String(transactions.length + 1).padStart(4, '0')}`,
            date: date.toISOString().split('T')[0],
            vendor: vendor,
            amount: amount,
            description: "Business consulting services",
            payment_method: "Electronic",
            category: "consulting"
        });
    });
    
    // 8. Off-hours transactions (Enron pattern)
    const offHoursAmounts = [45000, 67500, 33000];
    offHoursAmounts.forEach(amount => {
        const daysAgo = Math.floor(Math.random() * 30) + 5;
        const date = new Date();
        date.setDate(date.getDate() - daysAgo);
        
        // Set to weekend (Saturday) and late evening
        const dayOfWeek = date.getDay();
        const daysToSaturday = (6 - dayOfWeek + 7) % 7;
        date.setDate(date.getDate() + daysToSaturday); // Move to Saturday
        date.setHours(23, 0, 0, 0); // 11 PM
        
        transactions.push({
            transaction_id: `TXN${String(transactions.length + 1).padStart(4, '0')}`,
            date: date.toISOString().split('T')[0],
            vendor: "Weekend Processing Corp",
            amount: amount,
            description: "Emergency processing services",
            payment_method: "Wire Transfer",
            category: "emergency services"
        });
    });
    
    return transactions;
}

// Main execution
// Demo the fraud detection system
console.log("🔍 Oqualtix Enhanced Fraud Detection Analyzer");
console.log("=".repeat(50));

// Generate sample data with embedded fraud
const sampleData = generateSampleData();
    
    // Initialize analyzer
    const analyzer = new FraudDetectionAnalyzer(3.0, 5);
    
    // Load and analyze data
    analyzer.loadData(null, sampleData);
    const anomalies = analyzer.runFullAnalysis();
    
    // Print summary
    analyzer.printSummary();
    
    // Export results
    analyzer.exportResults("oqualtix_fraud_anomalies.json");
    
    console.log(`\n✅ Analysis complete! Found ${anomalies.length} potential fraud indicators.`);
    console.log("💡 This demonstrates the Enhanced Anomaly Detection system used in the Oqualtix app.");

export { FraudDetectionAnalyzer, StatUtils, generateSampleData };