import moment from 'moment';

// Forensic analysis patterns and algorithms
export const ForensicAnalysisUtils = {
  
  // Fraud detection patterns
  FRAUD_PATTERNS: {
    // Benford's Law violation (first digit distribution)
    BENFORDS_LAW_VIOLATION: 'benfords_law_violation',
    
    // Round number bias
    ROUND_NUMBER_BIAS: 'round_number_bias',
    
    // Duplicate transactions
    DUPLICATE_TRANSACTIONS: 'duplicate_transactions',
    
    // Sequential invoice numbers with gaps
    INVOICE_NUMBER_GAPS: 'invoice_number_gaps',
    
    // Transactions just below approval limits
    THRESHOLD_AVOIDANCE: 'threshold_avoidance',
    
    // After-hours transactions
    OFF_HOURS_TRANSACTIONS: 'off_hours_transactions',
    
    // Vendor payment irregularities
    VENDOR_IRREGULARITIES: 'vendor_irregularities',
    
    // Journal entry patterns
    JOURNAL_ENTRY_PATTERNS: 'journal_entry_patterns'
  },

  // Analyze transactions for fraud patterns
  analyzeTransactions: (transactions) => {
    const analysis = {
      riskScore: 0,
      findings: [],
      recommendations: [],
      patterns: {},
      summary: {}
    };

    // Perform various fraud detection tests
    analysis.patterns.benfordsLaw = ForensicAnalysisUtils.testBenfordsLaw(transactions);
    analysis.patterns.roundNumbers = ForensicAnalysisUtils.testRoundNumbers(transactions);
    analysis.patterns.duplicates = ForensicAnalysisUtils.findDuplicates(transactions);
    analysis.patterns.thresholdAvoidance = ForensicAnalysisUtils.testThresholdAvoidance(transactions);
    analysis.patterns.offHours = ForensicAnalysisUtils.testOffHoursActivity(transactions);
    analysis.patterns.vendorAnalysis = ForensicAnalysisUtils.analyzeVendors(transactions);
    analysis.patterns.temporalPatterns = ForensicAnalysisUtils.analyzeTemporalPatterns(transactions);

    // Calculate overall risk score
    analysis.riskScore = ForensicAnalysisUtils.calculateRiskScore(analysis.patterns);

    // Generate findings and recommendations
    analysis.findings = ForensicAnalysisUtils.generateFindings(analysis.patterns);
    analysis.recommendations = ForensicAnalysisUtils.generateRecommendations(analysis.patterns);
    analysis.summary = ForensicAnalysisUtils.generateSummary(analysis);

    return analysis;
  },

  // Test Benford's Law compliance
  testBenfordsLaw: (transactions) => {
    const firstDigitCounts = {};
    const expectedDistribution = {
      1: 30.1, 2: 17.6, 3: 12.5, 4: 9.7, 5: 7.9,
      6: 6.7, 7: 5.8, 8: 5.1, 9: 4.6
    };

    // Count first digits
    transactions.forEach(transaction => {
      const amount = Math.abs(transaction.amount);
      if (amount > 0) {
        const firstDigit = parseInt(amount.toString().charAt(0));
        firstDigitCounts[firstDigit] = (firstDigitCounts[firstDigit] || 0) + 1;
      }
    });

    // Calculate actual distribution
    const total = Object.values(firstDigitCounts).reduce((sum, count) => sum + count, 0);
    const actualDistribution = {};
    const deviations = {};

    for (let digit = 1; digit <= 9; digit++) {
      const count = firstDigitCounts[digit] || 0;
      actualDistribution[digit] = total > 0 ? (count / total) * 100 : 0;
      deviations[digit] = Math.abs(actualDistribution[digit] - expectedDistribution[digit]);
    }

    // Calculate chi-square statistic
    let chiSquare = 0;
    for (let digit = 1; digit <= 9; digit++) {
      const expected = (expectedDistribution[digit] / 100) * total;
      const actual = firstDigitCounts[digit] || 0;
      if (expected > 0) {
        chiSquare += Math.pow(actual - expected, 2) / expected;
      }
    }

    const pValue = ForensicAnalysisUtils.chiSquarePValue(chiSquare, 8);
    const isAnomalous = pValue < 0.05; // 95% confidence level

    return {
      isAnomalous,
      chiSquare,
      pValue,
      actualDistribution,
      expectedDistribution,
      deviations,
      riskLevel: isAnomalous ? (pValue < 0.01 ? 'HIGH' : 'MEDIUM') : 'LOW'
    };
  },

  // Test for round number bias
  testRoundNumbers: (transactions) => {
    let roundCount = 0;
    const roundTransactions = [];

    transactions.forEach(transaction => {
      const amount = Math.abs(transaction.amount);
      if (amount % 100 === 0 || amount % 50 === 0 || amount % 25 === 0) {
        roundCount++;
        roundTransactions.push(transaction);
      }
    });

    const roundPercentage = (roundCount / transactions.length) * 100;
    const isAnomalous = roundPercentage > 15; // More than 15% round numbers is suspicious

    return {
      isAnomalous,
      roundCount,
      totalTransactions: transactions.length,
      roundPercentage,
      roundTransactions,
      riskLevel: roundPercentage > 25 ? 'HIGH' : (roundPercentage > 15 ? 'MEDIUM' : 'LOW')
    };
  },

  // Find duplicate transactions
  findDuplicates: (transactions) => {
    const duplicateGroups = {};
    const duplicates = [];

    transactions.forEach(transaction => {
      const key = `${transaction.amount}_${transaction.vendor}_${moment(transaction.date).format('YYYY-MM-DD')}`;
      
      if (!duplicateGroups[key]) {
        duplicateGroups[key] = [];
      }
      duplicateGroups[key].push(transaction);
    });

    Object.values(duplicateGroups).forEach(group => {
      if (group.length > 1) {
        duplicates.push({
          transactions: group,
          count: group.length,
          amount: group[0].amount,
          vendor: group[0].vendor,
          date: group[0].date
        });
      }
    });

    return {
      isAnomalous: duplicates.length > 0,
      duplicateCount: duplicates.length,
      duplicateGroups: duplicates,
      riskLevel: duplicates.length > 5 ? 'HIGH' : (duplicates.length > 0 ? 'MEDIUM' : 'LOW')
    };
  },

  // Test for threshold avoidance (amounts just below approval limits)
  testThresholdAvoidance: (transactions) => {
    const commonThresholds = [1000, 5000, 10000, 25000, 50000];
    const suspiciousTransactions = [];

    transactions.forEach(transaction => {
      const amount = Math.abs(transaction.amount);
      commonThresholds.forEach(threshold => {
        if (amount >= threshold * 0.95 && amount < threshold) {
          suspiciousTransactions.push({
            ...transaction,
            threshold,
            proximityToThreshold: ((threshold - amount) / threshold * 100).toFixed(2)
          });
        }
      });
    });

    const suspiciousPercentage = (suspiciousTransactions.length / transactions.length) * 100;

    return {
      isAnomalous: suspiciousPercentage > 5,
      suspiciousCount: suspiciousTransactions.length,
      suspiciousPercentage,
      suspiciousTransactions,
      riskLevel: suspiciousPercentage > 10 ? 'HIGH' : (suspiciousPercentage > 5 ? 'MEDIUM' : 'LOW')
    };
  },

  // Test for off-hours transaction activity
  testOffHoursActivity: (transactions) => {
    const offHoursTransactions = [];

    transactions.forEach(transaction => {
      const date = moment(transaction.date);
      const hour = date.hour();
      const dayOfWeek = date.day();

      // Consider off-hours: before 7 AM, after 6 PM, or weekends
      if (hour < 7 || hour > 18 || dayOfWeek === 0 || dayOfWeek === 6) {
        offHoursTransactions.push({
          ...transaction,
          hour,
          dayOfWeek,
          isWeekend: dayOfWeek === 0 || dayOfWeek === 6
        });
      }
    });

    const offHoursPercentage = (offHoursTransactions.length / transactions.length) * 100;

    return {
      isAnomalous: offHoursPercentage > 10,
      offHoursCount: offHoursTransactions.length,
      offHoursPercentage,
      offHoursTransactions,
      riskLevel: offHoursPercentage > 20 ? 'HIGH' : (offHoursPercentage > 10 ? 'MEDIUM' : 'LOW')
    };
  },

  // Analyze vendor payment patterns
  analyzeVendors: (transactions) => {
    const vendorStats = {};
    const suspiciousVendors = [];

    transactions.forEach(transaction => {
      const vendor = transaction.vendor;
      if (!vendorStats[vendor]) {
        vendorStats[vendor] = {
          name: vendor,
          transactionCount: 0,
          totalAmount: 0,
          amounts: [],
          dates: []
        };
      }

      vendorStats[vendor].transactionCount++;
      vendorStats[vendor].totalAmount += Math.abs(transaction.amount);
      vendorStats[vendor].amounts.push(Math.abs(transaction.amount));
      vendorStats[vendor].dates.push(transaction.date);
    });

    // Analyze each vendor for suspicious patterns
    Object.values(vendorStats).forEach(vendor => {
      const avgAmount = vendor.totalAmount / vendor.transactionCount;
      const amountVariance = ForensicAnalysisUtils.calculateVariance(vendor.amounts);
      
      // Check for suspicious patterns
      const hasLowVariance = amountVariance < avgAmount * 0.1; // Very consistent amounts
      const hasHighFrequency = vendor.transactionCount > transactions.length * 0.1; // More than 10% of all transactions
      const hasRoundAmounts = vendor.amounts.filter(amt => amt % 100 === 0).length / vendor.amounts.length > 0.5;

      if (hasLowVariance || hasHighFrequency || hasRoundAmounts) {
        suspiciousVendors.push({
          ...vendor,
          avgAmount,
          amountVariance,
          flags: {
            lowVariance: hasLowVariance,
            highFrequency: hasHighFrequency,
            roundAmounts: hasRoundAmounts
          }
        });
      }
    });

    return {
      isAnomalous: suspiciousVendors.length > 0,
      vendorCount: Object.keys(vendorStats).length,
      suspiciousVendorCount: suspiciousVendors.length,
      suspiciousVendors,
      vendorStats,
      riskLevel: suspiciousVendors.length > 3 ? 'HIGH' : (suspiciousVendors.length > 0 ? 'MEDIUM' : 'LOW')
    };
  },

  // Analyze temporal patterns
  analyzeTemporalPatterns: (transactions) => {
    const monthlyVolume = {};
    const dailyPatterns = {};
    
    transactions.forEach(transaction => {
      const date = moment(transaction.date);
      const month = date.format('YYYY-MM');
      const dayOfMonth = date.date();

      if (!monthlyVolume[month]) {
        monthlyVolume[month] = { count: 0, amount: 0 };
      }
      monthlyVolume[month].count++;
      monthlyVolume[month].amount += Math.abs(transaction.amount);

      if (!dailyPatterns[dayOfMonth]) {
        dailyPatterns[dayOfMonth] = { count: 0, amount: 0 };
      }
      dailyPatterns[dayOfMonth].count++;
      dailyPatterns[dayOfMonth].amount += Math.abs(transaction.amount);
    });

    // Check for unusual spikes in activity
    const monthlyAmounts = Object.values(monthlyVolume).map(m => m.amount);
    const avgMonthlyAmount = monthlyAmounts.reduce((sum, amt) => sum + amt, 0) / monthlyAmounts.length;
    const monthlyVariance = ForensicAnalysisUtils.calculateVariance(monthlyAmounts);

    // Check for end-of-month clustering
    const endOfMonthCount = (dailyPatterns[30]?.count || 0) + (dailyPatterns[31]?.count || 0);
    const endOfMonthPercentage = (endOfMonthCount / transactions.length) * 100;

    return {
      monthlyVolume,
      dailyPatterns,
      avgMonthlyAmount,
      monthlyVariance,
      endOfMonthPercentage,
      isAnomalous: endOfMonthPercentage > 20 || monthlyVariance > avgMonthlyAmount,
      riskLevel: endOfMonthPercentage > 30 ? 'HIGH' : (endOfMonthPercentage > 20 ? 'MEDIUM' : 'LOW')
    };
  },

  // Calculate overall risk score
  calculateRiskScore: (patterns) => {
    let score = 0;
    const weights = {
      benfordsLaw: 25,
      roundNumbers: 15,
      duplicates: 20,
      thresholdAvoidance: 20,
      offHours: 10,
      vendorAnalysis: 15,
      temporalPatterns: 10
    };

    Object.keys(patterns).forEach(pattern => {
      if (patterns[pattern].riskLevel === 'HIGH') {
        score += weights[pattern] || 10;
      } else if (patterns[pattern].riskLevel === 'MEDIUM') {
        score += (weights[pattern] || 10) * 0.5;
      }
    });

    return Math.min(score, 100); // Cap at 100
  },

  // Generate findings based on analysis
  generateFindings: (patterns) => {
    const findings = [];

    if (patterns.benfordsLaw.isAnomalous) {
      findings.push({
        type: 'BENFORDS_LAW_VIOLATION',
        severity: patterns.benfordsLaw.riskLevel,
        description: `Transaction amounts violate Benford's Law (p-value: ${patterns.benfordsLaw.pValue.toFixed(4)})`,
        recommendation: 'Investigate the source of these transactions for potential manipulation'
      });
    }

    if (patterns.roundNumbers.isAnomalous) {
      findings.push({
        type: 'ROUND_NUMBER_BIAS',
        severity: patterns.roundNumbers.riskLevel,
        description: `${patterns.roundNumbers.roundPercentage.toFixed(1)}% of transactions are round numbers`,
        recommendation: 'Review round number transactions for legitimacy'
      });
    }

    if (patterns.duplicates.isAnomalous) {
      findings.push({
        type: 'DUPLICATE_TRANSACTIONS',
        severity: patterns.duplicates.riskLevel,
        description: `Found ${patterns.duplicates.duplicateCount} groups of duplicate transactions`,
        recommendation: 'Investigate duplicate transactions for processing errors or fraud'
      });
    }

    if (patterns.thresholdAvoidance.isAnomalous) {
      findings.push({
        type: 'THRESHOLD_AVOIDANCE',
        severity: patterns.thresholdAvoidance.riskLevel,
        description: `${patterns.thresholdAvoidance.suspiciousPercentage.toFixed(1)}% of transactions are just below approval thresholds`,
        recommendation: 'Review approval processes and investigate threshold avoidance'
      });
    }

    if (patterns.offHours.isAnomalous) {
      findings.push({
        type: 'OFF_HOURS_ACTIVITY',
        severity: patterns.offHours.riskLevel,
        description: `${patterns.offHours.offHoursPercentage.toFixed(1)}% of transactions occurred outside business hours`,
        recommendation: 'Investigate off-hours transaction authorization and controls'
      });
    }

    if (patterns.vendorAnalysis.isAnomalous) {
      findings.push({
        type: 'VENDOR_IRREGULARITIES',
        severity: patterns.vendorAnalysis.riskLevel,
        description: `Found ${patterns.vendorAnalysis.suspiciousVendorCount} vendors with irregular payment patterns`,
        recommendation: 'Verify vendor legitimacy and review payment authorization'
      });
    }

    return findings;
  },

  // Generate recommendations
  generateRecommendations: (patterns) => {
    const recommendations = [];

    recommendations.push(
      'Implement additional controls for high-risk transaction patterns',
      'Enhance approval workflows for transactions near policy thresholds',
      'Review vendor master file for duplicate or fictitious vendors',
      'Implement automated monitoring for off-hours transaction activity',
      'Establish regular Benford\'s Law testing for transaction populations',
      'Create alerts for unusual payment concentrations or patterns'
    );

    return recommendations;
  },

  // Generate analysis summary
  generateSummary: (analysis) => {
    const riskLevel = analysis.riskScore > 70 ? 'HIGH' : 
                     analysis.riskScore > 40 ? 'MEDIUM' : 'LOW';

    return {
      riskScore: analysis.riskScore,
      riskLevel,
      totalFindings: analysis.findings.length,
      highSeverityFindings: analysis.findings.filter(f => f.severity === 'HIGH').length,
      mediumSeverityFindings: analysis.findings.filter(f => f.severity === 'MEDIUM').length,
      status: riskLevel === 'HIGH' ? 'REQUIRES_IMMEDIATE_ATTENTION' :
              riskLevel === 'MEDIUM' ? 'NEEDS_REVIEW' : 'APPEARS_NORMAL'
    };
  },

  // Utility functions
  calculateVariance: (numbers) => {
    const mean = numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
    const squaredDiffs = numbers.map(num => Math.pow(num - mean, 2));
    return squaredDiffs.reduce((sum, diff) => sum + diff, 0) / numbers.length;
  },

  // Simplified chi-square p-value calculation
  chiSquarePValue: (chiSquare, degreesOfFreedom) => {
    // Simplified approximation - in production, use a proper statistical library
    if (chiSquare > 20) return 0.01;
    if (chiSquare > 15) return 0.05;
    if (chiSquare > 10) return 0.1;
    return 0.5;
  }
};

export default ForensicAnalysisUtils;