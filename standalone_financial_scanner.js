#!/usr/bin/env node

/**
 * Standalone Financial Records Demo
 * Demonstrates comprehensive fraud detection for bank statements and financial documents
 * Includes micro-skimming detection down to hundredth of a cent
 */

import moment from 'moment';

// Standalone anomaly detection utilities (subset)
class StandaloneFinancialAnalyzer {
  
  // Enhanced financial records analyzer with bank statement support
  static async analyzeFinancialRecords(financialData, options = {}) {
    const {
      includeStatements = true,
      includeLedgers = true,
      includeReconciliation = true,
      fraudThresholds = {},
      analysisDepth = 'comprehensive'
    } = options;

    console.log('📊 Starting comprehensive financial records analysis...');
    
    const analysis = {
      recordsAnalyzed: 0,
      fraudIndicators: [],
      anomalies: [],
      riskScore: 0,
      recommendations: [],
      detectionSummary: {}
    };

    try {
      // Parse and categorize financial records
      const parsedRecords = StandaloneFinancialAnalyzer.parseFinancialRecords(financialData);
      analysis.recordsAnalyzed = parsedRecords.totalRecords;

      // Analyze bank statements for fraud patterns
      if (includeStatements && parsedRecords.bankStatements.length > 0) {
        const statementAnalysis = await StandaloneFinancialAnalyzer.analyzeBankStatements(
          parsedRecords.bankStatements, 
          fraudThresholds
        );
        analysis.fraudIndicators.push(...statementAnalysis.fraudIndicators);
        analysis.anomalies.push(...statementAnalysis.anomalies);
      }

      // Calculate overall risk score
      analysis.riskScore = StandaloneFinancialAnalyzer.calculateFinancialRiskScore(analysis);
      analysis.recommendations = StandaloneFinancialAnalyzer.generateFinancialRecommendations(analysis);

      console.log(`📈 Financial analysis complete: ${analysis.fraudIndicators.length} fraud indicators detected`);
      return analysis;

    } catch (error) {
      console.error('❌ Financial records analysis error:', error);
      return { ...analysis, error: error.message };
    }
  }

  // Parse various financial record formats
  static parseFinancialRecords(financialData) {
    const parsedRecords = {
      bankStatements: [],
      ledgerEntries: [],
      checkRegister: [],
      creditCardStatements: [],
      invoices: [],
      receipts: [],
      totalRecords: 0
    };

    try {
      // Handle different input formats
      if (Array.isArray(financialData)) {
        // Array of records
        financialData.forEach(record => {
          const categorized = StandaloneFinancialAnalyzer.categorizeFinancialRecord(record);
          parsedRecords[categorized.type].push(categorized.data);
          parsedRecords.totalRecords++;
        });
      } else if (typeof financialData === 'object') {
        // Structured object with different record types
        Object.entries(financialData).forEach(([key, records]) => {
          if (Array.isArray(records)) {
            records.forEach(record => {
              const categorized = StandaloneFinancialAnalyzer.categorizeFinancialRecord(record, key);
              parsedRecords[categorized.type].push(categorized.data);
              parsedRecords.totalRecords++;
            });
          }
        });
      }

      return parsedRecords;
    } catch (error) {
      console.error('Error parsing financial records:', error);
      throw new Error(`Financial record parsing failed: ${error.message}`);
    }
  }

  // Categorize financial records by type
  static categorizeFinancialRecord(record, hint = null) {
    // Determine record type based on structure and content
    const recordKeys = Object.keys(record);
    
    // Bank statement indicators
    if (recordKeys.includes('balance') || recordKeys.includes('runningBalance') || 
        recordKeys.includes('accountNumber') || hint === 'bankStatements') {
      return {
        type: 'bankStatements',
        data: StandaloneFinancialAnalyzer.normalizeBankStatementEntry(record)
      };
    }
    
    // Default to bank statement if uncertain
    return {
      type: 'bankStatements',
      data: StandaloneFinancialAnalyzer.normalizeBankStatementEntry(record)
    };
  }

  // Normalize bank statement entries to standard format
  static normalizeBankStatementEntry(entry) {
    return {
      id: entry.id || entry.transactionId || entry.refNumber || Math.random().toString(36),
      date: entry.date || entry.transactionDate || entry.dateTime,
      description: entry.description || entry.memo || entry.reference || 'Unknown transaction',
      amount: parseFloat(entry.amount || entry.transactionAmount || 0),
      balance: parseFloat(entry.balance || entry.runningBalance || entry.accountBalance || 0),
      type: entry.type || entry.transactionType || 'UNKNOWN',
      account: entry.account || entry.accountNumber || 'UNKNOWN',
      vendor: entry.vendor || entry.payee || entry.merchant || entry.counterparty,
      category: entry.category || entry.classification || 'UNCLASSIFIED',
      checkNumber: entry.checkNumber || entry.checkNum || null,
      originalRecord: entry
    };
  }

  // Comprehensive bank statement fraud analysis
  static async analyzeBankStatements(statements, fraudThresholds = {}) {
    const analysis = {
      fraudIndicators: [],
      anomalies: [],
      patterns: {},
      riskLevel: 'LOW'
    };

    const thresholds = {
      largeTransactionMultiplier: 5.0,
      roundAmountThreshold: 0.7,
      duplicateTransactionWindow: 24,
      velocityThreshold: 10,
      afterHoursThreshold: 0.2,
      weekendThreshold: 0.15,
      ultraTinyThreshold: 0.01, // $0.01 threshold for micro-skimming
      ...fraudThresholds
    };

    try {
      // Sort statements by date
      const sortedStatements = statements.sort((a, b) => new Date(a.date) - new Date(b.date));

      // 1. Detect large/unusual transactions
      const largeTransactionIndicators = StandaloneFinancialAnalyzer.detectLargeTransactions(
        sortedStatements, 
        thresholds.largeTransactionMultiplier
      );
      analysis.fraudIndicators.push(...largeTransactionIndicators);

      // 2. Analyze transaction timing patterns
      const timingIndicators = StandaloneFinancialAnalyzer.analyzeTransactionTiming(
        sortedStatements, 
        thresholds
      );
      analysis.fraudIndicators.push(...timingIndicators);

      // 3. Detect duplicate or near-duplicate transactions
      const duplicateIndicators = StandaloneFinancialAnalyzer.detectDuplicateTransactions(
        sortedStatements,
        thresholds.duplicateTransactionWindow
      );
      analysis.fraudIndicators.push(...duplicateIndicators);

      // 4. Analyze round amount patterns
      const roundAmountIndicators = StandaloneFinancialAnalyzer.analyzeRoundAmountPatterns(
        sortedStatements,
        thresholds.roundAmountThreshold
      );
      analysis.fraudIndicators.push(...roundAmountIndicators);

      // 5. Detect velocity anomalies
      const velocityIndicators = StandaloneFinancialAnalyzer.detectVelocityAnomalies(
        sortedStatements,
        thresholds.velocityThreshold
      );
      analysis.fraudIndicators.push(...velocityIndicators);

      // 6. Analyze balance discrepancies
      const balanceIndicators = StandaloneFinancialAnalyzer.analyzeBalanceDiscrepancies(
        sortedStatements
      );
      analysis.fraudIndicators.push(...balanceIndicators);

      // 7. Micro-skimming analysis (ultra-precise)
      const microSkimmingIndicators = StandaloneFinancialAnalyzer.detectMicroSkimming(
        sortedStatements, 
        thresholds.ultraTinyThreshold
      );
      analysis.fraudIndicators.push(...microSkimmingIndicators);

      // Calculate overall risk level
      const criticalCount = analysis.fraudIndicators.filter(i => i.severity === 'CRITICAL').length;
      const highCount = analysis.fraudIndicators.filter(i => i.severity === 'HIGH').length;
      
      if (criticalCount > 0) analysis.riskLevel = 'CRITICAL';
      else if (highCount > 2) analysis.riskLevel = 'HIGH';
      else if (analysis.fraudIndicators.length > 0) analysis.riskLevel = 'MEDIUM';

      return analysis;

    } catch (error) {
      console.error('Bank statement analysis error:', error);
      return { ...analysis, error: error.message };
    }
  }

  // Detect micro-skimming patterns with hundredth-cent precision
  static detectMicroSkimming(statements, ultraTinyThreshold = 0.01) {
    const indicators = [];
    
    // Filter for ultra-tiny transactions
    const tinyTransactions = statements.filter(s => {
      const absAmount = Math.abs(s.amount);
      return absAmount > 0 && absAmount <= ultraTinyThreshold;
    });

    if (tinyTransactions.length === 0) return indicators;

    console.log(`🔍 Analyzing ${tinyTransactions.length} micro-transactions for skimming patterns...`);

    // Group by vendor/description for pattern analysis
    const vendorGroups = {};
    tinyTransactions.forEach(tx => {
      const vendor = tx.vendor || tx.description || 'UNKNOWN';
      if (!vendorGroups[vendor]) {
        vendorGroups[vendor] = [];
      }
      vendorGroups[vendor].push(tx);
    });

    // Analyze each vendor group for systematic micro-skimming
    Object.entries(vendorGroups).forEach(([vendor, transactions]) => {
      if (transactions.length >= 3) { // Need pattern of at least 3
        const totalSkimmed = transactions.reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
        
        // Check for systematic amounts (repeating values)
        const amounts = transactions.map(tx => Math.abs(tx.amount));
        const uniqueAmounts = [...new Set(amounts)];
        const isSystematic = uniqueAmounts.length <= 3; // Limited variety suggests systematic

        // Check for temporal clustering
        const dates = transactions.map(tx => new Date(tx.date)).sort();
        const daySpan = (dates[dates.length - 1] - dates[0]) / (1000 * 60 * 60 * 24);
        const frequency = transactions.length / Math.max(daySpan, 1);

        if (isSystematic || frequency > 0.1) { // More than 1 every 10 days
          indicators.push({
            type: 'MICRO_SKIMMING_PATTERN',
            severity: totalSkimmed > 10 ? 'CRITICAL' : totalSkimmed > 1 ? 'HIGH' : 'MEDIUM',
            vendor: vendor,
            transactions: transactions,
            details: {
              transactionCount: transactions.length,
              totalSkimmed: totalSkimmed.toFixed(4),
              averageAmount: (totalSkimmed / transactions.length).toFixed(4),
              uniqueAmounts: uniqueAmounts.map(a => a.toFixed(4)),
              daySpan: daySpan.toFixed(1),
              frequency: frequency.toFixed(3),
              isSystematic: isSystematic,
              firstTransaction: dates[0].toISOString(),
              lastTransaction: dates[dates.length - 1].toISOString()
            },
            confidence: Math.min(95, 50 + (isSystematic ? 30 : 0) + (frequency > 0.2 ? 20 : 0)),
            description: `Micro-skimming detected: ${vendor} - ${transactions.length} transactions totaling $${totalSkimmed.toFixed(4)}`
          });
        }
      }
    });

    // Detect fractional residue patterns (systematic hundredths manipulation)
    const residueIndicators = StandaloneFinancialAnalyzer.detectFractionalResiduePatterns(statements);
    indicators.push(...residueIndicators);

    return indicators;
  }

  // Detect fractional residue patterns with ultra-precision
  static detectFractionalResiduePatterns(statements) {
    const indicators = [];
    
    // Analyze cents distribution
    const centsDistribution = {};
    const deciCentsDistribution = {}; // Track tenth-cent patterns
    
    statements.forEach(statement => {
      const absAmount = Math.abs(statement.amount);
      
      // Extract cents (last two digits)
      const cents = Math.round((absAmount % 1) * 100);
      centsDistribution[cents] = (centsDistribution[cents] || 0) + 1;
      
      // Extract deci-cents (thousandths place)
      const deciCents = Math.round((absAmount * 1000) % 10);
      deciCentsDistribution[deciCents] = (deciCentsDistribution[deciCents] || 0) + 1;
    });

    // Analyze cents distribution for anomalies
    const totalCentsTransactions = Object.values(centsDistribution).reduce((sum, count) => sum + count, 0);
    const suspiciousCentsPatterns = [];
    
    Object.entries(centsDistribution).forEach(([cents, count]) => {
      const percentage = (count / totalCentsTransactions) * 100;
      
      // Flag if any cent value appears more than 15% of the time (statistically unlikely)
      if (percentage > 15 && count >= 5) {
        suspiciousCentsPatterns.push({
          cents: cents,
          count: count,
          percentage: percentage.toFixed(1)
        });
      }
    });

    if (suspiciousCentsPatterns.length > 0) {
      indicators.push({
        type: 'FRACTIONAL_RESIDUE_MANIPULATION',
        severity: suspiciousCentsPatterns.length > 2 ? 'HIGH' : 'MEDIUM',
        details: {
          suspiciousPatterns: suspiciousCentsPatterns,
          totalTransactions: totalCentsTransactions,
          distributionAnalysis: centsDistribution
        },
        confidence: Math.min(90, 60 + (suspiciousCentsPatterns.length * 10)),
        description: `Suspicious cents distribution: ${suspiciousCentsPatterns.length} cent values appear with unusual frequency`
      });
    }

    // Analyze deci-cents (tenth-cent) distribution
    const totalDeciCentsTransactions = Object.values(deciCentsDistribution).reduce((sum, count) => sum + count, 0);
    const suspiciousDeciCentsPatterns = [];
    
    Object.entries(deciCentsDistribution).forEach(([deciCents, count]) => {
      const percentage = (count / totalDeciCentsTransactions) * 100;
      
      // Flag if any tenth-cent value appears more than 20% of the time
      if (percentage > 20 && count >= 3) {
        suspiciousDeciCentsPatterns.push({
          deciCents: deciCents,
          count: count,
          percentage: percentage.toFixed(1)
        });
      }
    });

    if (suspiciousDeciCentsPatterns.length > 0) {
      indicators.push({
        type: 'TENTH_CENT_RESIDUE_MANIPULATION',
        severity: 'HIGH',
        details: {
          suspiciousPatterns: suspiciousDeciCentsPatterns,
          totalTransactions: totalDeciCentsTransactions,
          distributionAnalysis: deciCentsDistribution
        },
        confidence: 85,
        description: `Suspicious tenth-cent distribution: ${suspiciousDeciCentsPatterns.length} tenth-cent values appear with unusual frequency (potential hundredth-cent fraud)`
      });
    }

    return indicators;
  }

  // Other detection methods (simplified versions)
  static detectLargeTransactions(statements, multiplier = 5.0) {
    const indicators = [];
    
    if (statements.length < 10) return indicators;
    
    const amounts = statements.map(s => Math.abs(s.amount)).filter(a => a > 0);
    const mean = amounts.reduce((sum, amt) => sum + amt, 0) / amounts.length;
    const stdDev = Math.sqrt(amounts.reduce((sum, amt) => sum + Math.pow(amt - mean, 2), 0) / amounts.length);
    
    const threshold = mean + (multiplier * stdDev);
    
    statements.forEach(statement => {
      const amount = Math.abs(statement.amount);
      if (amount > threshold && amount > 1000) {
        indicators.push({
          type: 'LARGE_TRANSACTION_ANOMALY',
          severity: amount > (mean + 10 * stdDev) ? 'CRITICAL' : 'HIGH',
          transaction: statement,
          details: {
            amount: amount,
            threshold: threshold,
            deviationFromMean: ((amount - mean) / mean * 100).toFixed(1) + '%',
            zScore: ((amount - mean) / stdDev).toFixed(2)
          },
          confidence: Math.min(95, 60 + ((amount - threshold) / threshold) * 40),
          description: `Unusually large transaction: $${amount.toLocaleString()} (${((amount - mean) / mean * 100).toFixed(1)}% above average)`
        });
      }
    });
    
    return indicators;
  }

  static analyzeTransactionTiming(statements, thresholds) {
    const indicators = [];
    
    let afterHoursCount = 0;
    let weekendCount = 0;
    
    statements.forEach(statement => {
      const transactionDate = moment(statement.date);
      const hour = transactionDate.hour();
      const dayOfWeek = transactionDate.day();
      
      if (hour < 6 || hour > 22) {
        afterHoursCount++;
      }
      
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        weekendCount++;
      }
    });
    
    const afterHoursRatio = afterHoursCount / statements.length;
    const weekendRatio = weekendCount / statements.length;
    
    if (afterHoursRatio > thresholds.afterHoursThreshold) {
      indicators.push({
        type: 'AFTER_HOURS_ACTIVITY_ANOMALY',
        severity: afterHoursRatio > 0.4 ? 'CRITICAL' : 'HIGH',
        details: {
          afterHoursCount: afterHoursCount,
          totalTransactions: statements.length,
          afterHoursRatio: (afterHoursRatio * 100).toFixed(1) + '%',
          threshold: (thresholds.afterHoursThreshold * 100).toFixed(1) + '%'
        },
        confidence: Math.min(90, 50 + (afterHoursRatio * 100)),
        description: `Excessive after-hours transactions: ${afterHoursCount} out of ${statements.length} (${(afterHoursRatio * 100).toFixed(1)}%)`
      });
    }
    
    if (weekendRatio > thresholds.weekendThreshold) {
      indicators.push({
        type: 'WEEKEND_ACTIVITY_ANOMALY',
        severity: weekendRatio > 0.3 ? 'HIGH' : 'MEDIUM',
        details: {
          weekendCount: weekendCount,
          totalTransactions: statements.length,
          weekendRatio: (weekendRatio * 100).toFixed(1) + '%',
          threshold: (thresholds.weekendThreshold * 100).toFixed(1) + '%'
        },
        confidence: Math.min(85, 50 + (weekendRatio * 100)),
        description: `Excessive weekend transactions: ${weekendCount} out of ${statements.length} (${(weekendRatio * 100).toFixed(1)}%)`
      });
    }
    
    return indicators;
  }

  static detectDuplicateTransactions(statements, windowHours = 24) {
    const indicators = [];
    const duplicateGroups = {};
    
    statements.forEach(statement => {
      const key = `${Math.abs(statement.amount).toFixed(2)}_${(statement.vendor || '').toLowerCase()}`;
      
      if (!duplicateGroups[key]) {
        duplicateGroups[key] = [];
      }
      duplicateGroups[key].push(statement);
    });
    
    Object.entries(duplicateGroups).forEach(([key, group]) => {
      if (group.length > 1) {
        const sortedGroup = group.sort((a, b) => new Date(a.date) - new Date(b.date));
        
        for (let i = 1; i < sortedGroup.length; i++) {
          const timeDiff = moment(sortedGroup[i].date).diff(moment(sortedGroup[i-1].date), 'hours');
          
          if (timeDiff <= windowHours) {
            indicators.push({
              type: 'DUPLICATE_TRANSACTION_ANOMALY',
              severity: timeDiff <= 1 ? 'CRITICAL' : 'HIGH',
              transactions: [sortedGroup[i-1], sortedGroup[i]],
              details: {
                amount: Math.abs(sortedGroup[i].amount),
                vendor: sortedGroup[i].vendor,
                timeDifferenceHours: timeDiff,
                duplicateCount: group.length
              },
              confidence: timeDiff <= 1 ? 95 : Math.max(60, 90 - timeDiff * 2),
              description: `Duplicate transaction detected: $${Math.abs(sortedGroup[i].amount).toFixed(2)} ${timeDiff <= 1 ? 'within 1 hour' : `within ${timeDiff} hours`}`
            });
          }
        }
      }
    });
    
    return indicators;
  }

  static analyzeRoundAmountPatterns(statements, threshold = 0.7) {
    const indicators = [];
    
    let roundAmountCount = 0;
    const roundAmounts = [];
    
    statements.forEach(statement => {
      const amount = Math.abs(statement.amount);
      
      if (amount % 100 === 0 || amount % 50 === 0 || amount % 25 === 0) {
        roundAmountCount++;
        roundAmounts.push(statement);
      }
    });
    
    const roundAmountRatio = roundAmountCount / statements.length;
    
    if (roundAmountRatio > threshold && roundAmountCount >= 5) {
      indicators.push({
        type: 'ROUND_AMOUNT_PATTERN_ANOMALY',
        severity: roundAmountRatio > 0.9 ? 'CRITICAL' : 'HIGH',
        details: {
          roundAmountCount: roundAmountCount,
          totalTransactions: statements.length,
          roundAmountRatio: (roundAmountRatio * 100).toFixed(1) + '%',
          threshold: (threshold * 100).toFixed(1) + '%',
          sampleAmounts: roundAmounts.slice(0, 5).map(s => s.amount)
        },
        confidence: Math.min(95, 50 + (roundAmountRatio * 50)),
        description: `Suspicious round amount pattern: ${roundAmountCount} out of ${statements.length} transactions (${(roundAmountRatio * 100).toFixed(1)}%) are round amounts`
      });
    }
    
    return indicators;
  }

  static detectVelocityAnomalies(statements, thresholdPerHour = 10) {
    const indicators = [];
    
    const hourlyGroups = {};
    
    statements.forEach(statement => {
      const hourKey = moment(statement.date).format('YYYY-MM-DD-HH');
      if (!hourlyGroups[hourKey]) {
        hourlyGroups[hourKey] = [];
      }
      hourlyGroups[hourKey].push(statement);
    });
    
    Object.entries(hourlyGroups).forEach(([hourKey, transactions]) => {
      if (transactions.length > thresholdPerHour) {
        indicators.push({
          type: 'VELOCITY_ANOMALY',
          severity: transactions.length > thresholdPerHour * 2 ? 'CRITICAL' : 'HIGH',
          transactions: transactions,
          details: {
            hour: hourKey,
            transactionCount: transactions.length,
            threshold: thresholdPerHour,
            totalAmount: transactions.reduce((sum, t) => sum + Math.abs(t.amount), 0)
          },
          confidence: Math.min(95, 60 + ((transactions.length - thresholdPerHour) / thresholdPerHour) * 30),
          description: `High transaction velocity: ${transactions.length} transactions in hour ${hourKey} (threshold: ${thresholdPerHour})`
        });
      }
    });
    
    return indicators;
  }

  static analyzeBalanceDiscrepancies(statements) {
    const indicators = [];
    
    let previousBalance = null;
    
    statements.forEach((statement, index) => {
      if (previousBalance !== null && statement.balance !== undefined) {
        const expectedBalance = previousBalance + statement.amount;
        const actualBalance = statement.balance;
        const discrepancy = Math.abs(expectedBalance - actualBalance);
        
        if (discrepancy > 0.01) {
          indicators.push({
            type: 'BALANCE_DISCREPANCY',
            severity: discrepancy > 100 ? 'CRITICAL' : discrepancy > 10 ? 'HIGH' : 'MEDIUM',
            transaction: statement,
            details: {
              expectedBalance: expectedBalance.toFixed(2),
              actualBalance: actualBalance.toFixed(2),
              discrepancy: discrepancy.toFixed(2),
              transactionAmount: statement.amount
            },
            confidence: Math.min(90, 50 + (discrepancy > 1 ? 40 : 20)),
            description: `Balance discrepancy: Expected $${expectedBalance.toFixed(2)}, actual $${actualBalance.toFixed(2)} (difference: $${discrepancy.toFixed(2)})`
          });
        }
      }
      
      if (statement.balance !== undefined) {
        previousBalance = statement.balance;
      }
    });
    
    return indicators;
  }

  // Calculate financial risk score
  static calculateFinancialRiskScore(analysis) {
    let score = 0;
    
    analysis.fraudIndicators.forEach(indicator => {
      switch (indicator.severity) {
        case 'CRITICAL':
          score += 25;
          break;
        case 'HIGH':
          score += 15;
          break;
        case 'MEDIUM':
          score += 8;
          break;
        default:
          score += 3;
      }
    });
    
    return Math.min(100, score);
  }

  // Generate financial investigation recommendations
  static generateFinancialRecommendations(analysis) {
    const recommendations = [];
    
    if (analysis.riskScore >= 75) {
      recommendations.push({
        priority: 'critical',
        action: 'Immediate Financial Audit Required',
        description: `Risk score of ${analysis.riskScore}/100 indicates potential fraud. Conduct comprehensive audit immediately.`
      });
    }
    
    if (analysis.fraudIndicators.some(i => i.type.includes('DUPLICATE'))) {
      recommendations.push({
        priority: 'high',
        action: 'Investigate Duplicate Transactions',
        description: 'Multiple duplicate transactions detected. Review for potential fraud or system errors.'
      });
    }
    
    if (analysis.fraudIndicators.some(i => i.type.includes('MICRO_SKIMMING'))) {
      recommendations.push({
        priority: 'critical',
        action: 'Investigate Micro-Skimming',
        description: 'Sophisticated micro-skimming patterns detected. Require specialized forensic analysis.'
      });
    }
    
    recommendations.push({
      priority: 'info',
      action: 'Enhance Financial Controls',
      description: 'Implement additional fraud detection controls and monitoring systems.'
    });
    
    return recommendations;
  }
}

// Demo data generator with embedded fraud patterns
class DemoDataGenerator {
  static generateFinancialRecordsWithFraud() {
    const demoData = {
      bankStatements: []
    };

    const startDate = moment().subtract(180, 'days');
    
    console.log('🏦 Generating demo bank statements with embedded fraud patterns...');
    
    // Normal business transactions
    for (let i = 0; i < 120; i++) {
      const date = startDate.clone().add(Math.floor(Math.random() * 180), 'days');
      
      demoData.bankStatements.push({
        id: `BANK_${String(i).padStart(4, '0')}`,
        date: date.format('YYYY-MM-DD HH:mm:ss'),
        description: DemoDataGenerator.getRandomBusinessDescription(),
        amount: DemoDataGenerator.getRandomBusinessAmount(),
        balance: 50000 + Math.random() * 100000,
        type: 'BUSINESS_PAYMENT',
        account: 'CHK-001-4829',
        vendor: DemoDataGenerator.getRandomVendor(),
        category: 'BUSINESS_EXPENSE'
      });
    }

    // Inject sophisticated fraud patterns
    console.log('💰 Injecting sophisticated fraud patterns...');
    
    // 1. Ultra-precise micro-skimming (hundredth of cent level)
    for (let i = 0; i < 35; i++) {
      const date = startDate.clone().add(Math.floor(Math.random() * 180), 'days');
      const microAmount = -(0.001 + Math.random() * 0.099); // -$0.001 to -$0.10
      
      demoData.bankStatements.push({
        id: `FRAUD_ULTRA_MICRO_${i}`,
        date: date.format('YYYY-MM-DD HH:mm:ss'),
        description: 'Processing Fee',
        amount: microAmount,
        balance: 50000 + Math.random() * 100000,
        type: 'FEE',
        account: 'CHK-001-4829',
        vendor: 'UltraMicroProcessor',
        category: 'FEES'
      });
    }

    // 2. Systematic tenth-cent theft (hundredth-cent precision)
    for (let i = 0; i < 20; i++) {
      const date = startDate.clone().add(Math.floor(Math.random() * 150), 'days');
      const systematicAmounts = [-0.031, -0.047, -0.063, -0.079, -0.091]; // Systematic pattern
      
      demoData.bankStatements.push({
        id: `FRAUD_TENTH_CENT_${i}`,
        date: date.format('YYYY-MM-DD HH:mm:ss'),
        description: 'Service Charge',
        amount: systematicAmounts[i % systematicAmounts.length],
        balance: 50000 + Math.random() * 100000,
        type: 'SERVICE_CHARGE',
        account: 'CHK-001-4829',
        vendor: 'TenthCentThiefCorp',
        category: 'FEES'
      });
    }

    // 3. Fractional residue manipulation
    for (let i = 0; i < 25; i++) {
      const date = startDate.clone().add(Math.floor(Math.random() * 180), 'days');
      const baseAmount = 100 + Math.random() * 500;
      // Manipulate to specific cent patterns
      const manipulatedAmount = Math.floor(baseAmount) + 0.73; // Force .73 cents pattern
      
      demoData.bankStatements.push({
        id: `FRAUD_RESIDUE_${i}`,
        date: date.format('YYYY-MM-DD HH:mm:ss'),
        description: 'Consulting Fee',
        amount: -manipulatedAmount,
        balance: 50000 + Math.random() * 100000,
        type: 'CONSULTING',
        account: 'CHK-001-4829',
        vendor: 'ResidueManipulatorLLC',
        category: 'PROFESSIONAL_SERVICES'
      });
    }

    // 4. After-hours suspicious activity
    for (let i = 0; i < 18; i++) {
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

    // 5. Duplicate transaction fraud
    const duplicateBase = {
      description: 'Office Supplies',
      amount: -847.50,
      vendor: 'OfficeMax Business',
      category: 'OFFICE_SUPPLIES'
    };
    
    for (let i = 0; i < 5; i++) {
      const date = startDate.clone().add(45, 'days').add(i * 15, 'minutes');
      demoData.bankStatements.push({
        id: `FRAUD_DUP_${i}`,
        date: date.format('YYYY-MM-DD HH:mm:ss'),
        ...duplicateBase,
        balance: 50000 + Math.random() * 100000,
        type: 'PURCHASE',
        account: 'CHK-001-4829'
      });
    }

    // 6. Velocity fraud (high transaction bursts)
    const burstDate = startDate.clone().add(90, 'days').hour(14);
    for (let i = 0; i < 18; i++) {
      demoData.bankStatements.push({
        id: `FRAUD_VELOCITY_${i}`,
        date: burstDate.clone().add(i * 2, 'minutes').format('YYYY-MM-DD HH:mm:ss'),
        description: `Rapid Transaction ${i + 1}`,
        amount: -(200 + Math.random() * 500),
        balance: 50000 + Math.random() * 100000,
        type: 'RAPID_TRANSACTION',
        account: 'CHK-001-4829',
        vendor: 'VelocityFraudCorp',
        category: 'SUSPICIOUS_ACTIVITY'
      });
    }

    console.log(`✅ Generated ${demoData.bankStatements.length} bank statements with embedded fraud`);
    
    return demoData;
  }

  static getRandomBusinessDescription() {
    const descriptions = [
      'Office Rent Payment', 'Utility Bill - Electric', 'Internet Service',
      'Insurance Premium', 'Legal Services', 'Accounting Fees',
      'Marketing Campaign', 'Equipment Lease', 'Travel Expenses',
      'Employee Reimbursement', 'Software License', 'Banking Fees'
    ];
    return descriptions[Math.floor(Math.random() * descriptions.length)];
  }

  static getRandomBusinessAmount() {
    const amounts = [
      -150.00, -250.00, -500.00, -750.00, -1200.00, -1850.00,
      -2400.00, -3200.00, 5000.00, 7500.00, 12000.00
    ];
    return amounts[Math.floor(Math.random() * amounts.length)];
  }

  static getRandomVendor() {
    const vendors = [
      'Metro Office Center', 'PowerGrid Utilities', 'FiberNet Communications',
      'SecureShield Insurance', 'LegalEagle LLP', 'NumberCrunch Accounting',
      'BrandBoost Marketing', 'TechLease Solutions', 'TravelSmart Corp',
      'ExpenseTrack Inc', 'CloudSoft Technologies', 'MegaBank Services'
    ];
    return vendors[Math.floor(Math.random() * vendors.length)];
  }
}

// Report generator
class FinancialReportGenerator {
  static generateInvestigationReport(scanResults) {
    console.log('\n📋 DETAILED INVESTIGATION REPORT');
    console.log('='.repeat(40));

    // Group fraud indicators by type
    const indicatorsByType = {};
    scanResults.fraudIndicators.forEach(indicator => {
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
        console.log(`\n${index + 1}. ${FinancialReportGenerator.getSeverityEmoji(indicator.severity)} ${indicator.severity} RISK`);
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
    if (scanResults.recommendations && scanResults.recommendations.length > 0) {
      console.log('\n💡 INVESTIGATION RECOMMENDATIONS');
      console.log('-'.repeat(35));
      
      scanResults.recommendations.forEach((rec, index) => {
        console.log(`\n${index + 1}. ${FinancialReportGenerator.getPriorityEmoji(rec.priority)} ${rec.action}`);
        console.log(`   Priority: ${rec.priority.toUpperCase()}`);
        console.log(`   ${rec.description}`);
      });
    }

    // Display statistical summary
    console.log('\n📈 STATISTICAL ANALYSIS');
    console.log('-'.repeat(25));
    
    const criticalCount = scanResults.fraudIndicators.filter(i => i.severity === 'CRITICAL').length;
    const highCount = scanResults.fraudIndicators.filter(i => i.severity === 'HIGH').length;
    const mediumCount = scanResults.fraudIndicators.filter(i => i.severity === 'MEDIUM').length;
    
    console.log(`Critical Issues: ${criticalCount}`);
    console.log(`High Risk Issues: ${highCount}`);
    console.log(`Medium Risk Issues: ${mediumCount}`);
    
    const avgConfidence = scanResults.fraudIndicators.length > 0 ?
      (scanResults.fraudIndicators.reduce((sum, i) => sum + i.confidence, 0) / scanResults.fraudIndicators.length).toFixed(1) :
      0;
    
    console.log(`Average Confidence: ${avgConfidence}%`);
  }

  static getSeverityEmoji(severity) {
    const emojiMap = {
      'CRITICAL': '🔴',
      'HIGH': '🟠',
      'MEDIUM': '🟡',
      'LOW': '🟢'
    };
    return emojiMap[severity] || '⚪';
  }

  static getPriorityEmoji(priority) {
    const emojiMap = {
      'critical': '🚨',
      'high': '⚠️',
      'medium': '⚡',
      'low': 'ℹ️',
      'info': 'ℹ️'
    };
    return emojiMap[priority] || 'ℹ️';
  }

  static getRiskLevelEmoji(score) {
    if (score >= 80) return '🔴';
    if (score >= 60) return '🟠';
    if (score >= 30) return '🟡';
    return '🟢';
  }

  static getRiskLevel(score) {
    if (score >= 80) return 'CRITICAL';
    if (score >= 60) return 'HIGH';
    if (score >= 30) return 'MEDIUM';
    return 'LOW';
  }
}

// Main CLI execution
async function main() {
  try {
    console.log('🚀 FINANCIAL RECORDS & BANK STATEMENT SCANNER');
    console.log('===============================================\n');
    
    // Generate demo data with embedded fraud patterns
    const demoData = DemoDataGenerator.generateFinancialRecordsWithFraud();
    
    // Perform comprehensive scan
    console.log('\n🔍 Starting comprehensive fraud analysis...');
    const scanResults = await StandaloneFinancialAnalyzer.analyzeFinancialRecords(demoData, {
      fraudThresholds: {
        largeTransactionMultiplier: 3.0,
        roundAmountThreshold: 0.4,
        duplicateTransactionWindow: 8,
        velocityThreshold: 6,
        afterHoursThreshold: 0.12,
        weekendThreshold: 0.10,
        ultraTinyThreshold: 0.1 // Catch transactions under $0.10
      }
    });

    console.log(`\n📊 SCAN RESULTS SUMMARY`);
    console.log('-'.repeat(25));
    console.log(`Records Analyzed: ${scanResults.recordsAnalyzed}`);
    console.log(`Fraud Indicators: ${scanResults.fraudIndicators.length}`);
    console.log(`Risk Score: ${scanResults.riskScore}/100`);
    console.log(`Risk Level: ${FinancialReportGenerator.getRiskLevelEmoji(scanResults.riskScore)} ${FinancialReportGenerator.getRiskLevel(scanResults.riskScore)}`);

    // Generate detailed investigation report
    FinancialReportGenerator.generateInvestigationReport(scanResults);
    
    console.log('\n🎯 NEXT STEPS:');
    console.log('1. Review all CRITICAL and HIGH severity findings immediately');
    console.log('2. Investigate flagged micro-skimming patterns (hundredth-cent precision)');
    console.log('3. Examine duplicate and velocity anomalies for systematic fraud');
    console.log('4. Analyze fractional residue manipulation patterns');
    console.log('5. Consider forensic accounting review for significant findings');
    
    console.log('\n✅ Financial Records Analysis Complete');
    console.log('📊 Enhanced with ultra-precise micro-skimming detection');
    console.log('🔍 Capable of detecting embezzlement down to hundredth of a cent');
    
  } catch (error) {
    console.error('❌ Analysis failed:', error);
    process.exit(1);
  }
}

// Run the CLI
main();