import moment from 'moment';
import AppFunctionalityUtils from './AppFunctionalityUtils.js';

// Embezzlement detection and alert system
export const EmbezzlementDetectionUtils = {
  
  // Detection thresholds and parameters
  DETECTION_CONFIG: {
    // Amount-based thresholds
    UNUSUAL_AMOUNT_MULTIPLIER: 3, // 3x average transaction amount
    LARGE_TRANSACTION_THRESHOLD: 5000, // Absolute threshold for large transactions
    
    // Frequency-based thresholds
    UNUSUAL_FREQUENCY_DAYS: 7, // Within 7 days
    MAX_SIMILAR_TRANSACTIONS: 3, // Max similar transactions in period
    
    // Vendor-based thresholds
    NEW_VENDOR_THRESHOLD: 1000, // Alert for new vendors over this amount
    VENDOR_FREQUENCY_THRESHOLD: 5, // Max transactions per vendor per month
    
    // Time-based thresholds
    OFF_HOURS_THRESHOLD: 0.1, // 10% of transactions in off-hours is suspicious
    WEEKEND_THRESHOLD: 0.15, // 15% weekend transactions is suspicious
    
    // Pattern detection
    ROUND_NUMBER_THRESHOLD: 0.3, // 30% round numbers is suspicious
    DUPLICATE_SIMILARITY_THRESHOLD: 0.95, // 95% similarity for duplicates
  },

  // Analyze transactions for embezzlement patterns
  analyzeForEmbezzlement: (transactions, userProfile = {}) => {
    const alerts = [];
    const userPatterns = EmbezzlementDetectionUtils.buildUserProfile(transactions, userProfile);
    
    // Analyze each transaction for suspicious patterns
    transactions.forEach(transaction => {
      const suspiciousPatterns = EmbezzlementDetectionUtils.detectSuspiciousPatterns(
        transaction, 
        transactions, 
        userPatterns
      );
      
      if (suspiciousPatterns.length > 0) {
        alerts.push({
          id: `alert_${transaction.id}_${Date.now()}`,
          transactionId: transaction.id,
          transaction: transaction,
          alertType: 'POTENTIAL_EMBEZZLEMENT',
          suspiciousPatterns,
          riskLevel: EmbezzlementDetectionUtils.calculateRiskLevel(suspiciousPatterns),
          alertMessage: EmbezzlementDetectionUtils.generateAlertMessage(transaction, suspiciousPatterns),
          detectedAt: new Date().toISOString(),
          status: 'PENDING', // PENDING, CONFIRMED, DISMISSED
          userResponse: null
        });
      }
    });
    
    return {
      alerts,
      userPatterns,
      summary: {
        totalAlerts: alerts.length,
        highRiskAlerts: alerts.filter(a => a.riskLevel === 'HIGH').length,
        mediumRiskAlerts: alerts.filter(a => a.riskLevel === 'MEDIUM').length,
        lowRiskAlerts: alerts.filter(a => a.riskLevel === 'LOW').length
      }
    };
  },

  // Build user spending profile for pattern detection
  buildUserProfile: (transactions, existingProfile = {}) => {
    const profile = {
      // Amount patterns
      averageTransactionAmount: 0,
      medianTransactionAmount: 0,
      standardDeviation: 0,
      
      // Vendor patterns
      frequentVendors: new Set(),
      vendorFrequency: {},
      
      // Time patterns
      preferredHours: {},
      preferredDays: {},
      
      // Category patterns
      categoryDistribution: {},
      
      // Update existing profile
      ...existingProfile
    };

    if (transactions.length === 0) return profile;

    // Calculate amount statistics
    const amounts = transactions.map(t => Math.abs(t.amount));
    profile.averageTransactionAmount = amounts.reduce((sum, amt) => sum + amt, 0) / amounts.length;
    
    const sortedAmounts = amounts.sort((a, b) => a - b);
    profile.medianTransactionAmount = sortedAmounts[Math.floor(sortedAmounts.length / 2)];
    
    const variance = amounts.reduce((sum, amt) => sum + Math.pow(amt - profile.averageTransactionAmount, 2), 0) / amounts.length;
    profile.standardDeviation = Math.sqrt(variance);

    // Analyze vendor patterns
    transactions.forEach(transaction => {
      const vendor = transaction.vendor;
      profile.vendorFrequency[vendor] = (profile.vendorFrequency[vendor] || 0) + 1;
      
      if (profile.vendorFrequency[vendor] >= 3) {
        profile.frequentVendors.add(vendor);
      }
    });

    // Analyze time patterns
    transactions.forEach(transaction => {
      const date = moment(transaction.date);
      const hour = date.hour();
      const day = date.day();
      
      profile.preferredHours[hour] = (profile.preferredHours[hour] || 0) + 1;
      profile.preferredDays[day] = (profile.preferredDays[day] || 0) + 1;
    });

    // Analyze category patterns
    transactions.forEach(transaction => {
      const category = transaction.category;
      profile.categoryDistribution[category] = (profile.categoryDistribution[category] || 0) + 1;
    });

    return profile;
  },

  // Detect suspicious patterns in a single transaction
  detectSuspiciousPatterns: (transaction, allTransactions, userProfile) => {
    const patterns = [];
    const config = EmbezzlementDetectionUtils.DETECTION_CONFIG;
    
    // 1. Unusual amount detection
    const amount = Math.abs(transaction.amount);
    if (amount > userProfile.averageTransactionAmount * config.UNUSUAL_AMOUNT_MULTIPLIER) {
      patterns.push({
        type: 'UNUSUAL_AMOUNT',
        severity: amount > config.LARGE_TRANSACTION_THRESHOLD ? 'HIGH' : 'MEDIUM',
        description: `Transaction amount (${amount.toLocaleString('en-US', {style: 'currency', currency: 'USD'})}) is ${(amount / userProfile.averageTransactionAmount).toFixed(1)}x your average`,
        details: {
          transactionAmount: amount,
          averageAmount: userProfile.averageTransactionAmount,
          multiplier: amount / userProfile.averageTransactionAmount
        }
      });
    }

    // 2. New vendor detection
    const vendor = transaction.vendor;
    if (!userProfile.frequentVendors.has(vendor) && amount > config.NEW_VENDOR_THRESHOLD) {
      patterns.push({
        type: 'NEW_VENDOR_LARGE_AMOUNT',
        severity: 'MEDIUM',
        description: `Large payment to new vendor: ${vendor}`,
        details: {
          vendor,
          amount,
          isFirstTransaction: !userProfile.vendorFrequency[vendor]
        }
      });
    }

    // 3. Vendor frequency anomaly
    const vendorCount = userProfile.vendorFrequency[vendor] || 0;
    const monthlyVendorLimit = config.VENDOR_FREQUENCY_THRESHOLD;
    if (vendorCount > monthlyVendorLimit) {
      patterns.push({
        type: 'EXCESSIVE_VENDOR_FREQUENCY',
        severity: 'MEDIUM',
        description: `Unusually frequent transactions with ${vendor} (${vendorCount} this period)`,
        details: {
          vendor,
          transactionCount: vendorCount,
          threshold: monthlyVendorLimit
        }
      });
    }

    // 4. Off-hours transaction detection
    const transactionHour = moment(transaction.date).hour();
    const transactionDay = moment(transaction.date).day();
    
    // Check if transaction is outside normal business hours
    if (transactionHour < 7 || transactionHour > 18 || transactionDay === 0 || transactionDay === 6) {
      const totalTransactions = Object.values(userProfile.preferredHours).reduce((sum, count) => sum + count, 0);
      const offHoursCount = (userProfile.preferredHours[transactionHour] || 0);
      const offHoursPercentage = offHoursCount / totalTransactions;
      
      if (offHoursPercentage < config.OFF_HOURS_THRESHOLD) {
        patterns.push({
          type: 'OFF_HOURS_TRANSACTION',
          severity: 'LOW',
          description: `Transaction at unusual time: ${moment(transaction.date).format('dddd, h:mm A')}`,
          details: {
            transactionTime: moment(transaction.date).format('YYYY-MM-DD HH:mm'),
            isWeekend: transactionDay === 0 || transactionDay === 6,
            hour: transactionHour
          }
        });
      }
    }

    // 5. Round number detection
    if (amount % 100 === 0 && amount >= 500) {
      patterns.push({
        type: 'ROUND_NUMBER_TRANSACTION',
        severity: 'LOW',
        description: `Round number transaction: ${amount.toLocaleString('en-US', {style: 'currency', currency: 'USD'})}`,
        details: {
          amount,
          isRound: true
        }
      });
    }

    // 6. Rapid succession transactions
    const recentTransactions = allTransactions.filter(t => {
      const timeDiff = Math.abs(moment(transaction.date).diff(moment(t.date), 'minutes'));
      return t.id !== transaction.id && timeDiff <= 60; // Within 1 hour
    });

    if (recentTransactions.length >= 2) {
      patterns.push({
        type: 'RAPID_SUCCESSION_TRANSACTIONS',
        severity: 'MEDIUM',
        description: `Multiple transactions within 1 hour (${recentTransactions.length + 1} total)`,
        details: {
          relatedTransactions: recentTransactions.length,
          timeWindow: '1 hour'
        }
      });
    }

    // 7. Category anomaly detection
    const category = transaction.category;
    const totalCategoryTransactions = userProfile.categoryDistribution[category] || 0;
    const totalTransactions = Object.values(userProfile.categoryDistribution).reduce((sum, count) => sum + count, 0);
    const categoryPercentage = totalCategoryTransactions / totalTransactions;

    if (categoryPercentage < 0.05 && amount > userProfile.averageTransactionAmount * 2) {
      patterns.push({
        type: 'UNUSUAL_CATEGORY_AMOUNT',
        severity: 'MEDIUM',
        description: `Large transaction in uncommon category: ${category}`,
        details: {
          category,
          categoryPercentage: categoryPercentage * 100,
          amount
        }
      });
    }

    return patterns;
  },

  // Calculate overall risk level for an alert
  calculateRiskLevel: (suspiciousPatterns) => {
    let riskScore = 0;
    
    suspiciousPatterns.forEach(pattern => {
      switch (pattern.severity) {
        case 'HIGH':
          riskScore += 3;
          break;
        case 'MEDIUM':
          riskScore += 2;
          break;
        case 'LOW':
          riskScore += 1;
          break;
      }
    });

    if (riskScore >= 5) return 'HIGH';
    if (riskScore >= 3) return 'MEDIUM';
    return 'LOW';
  },

  // Generate alert message for users
  generateAlertMessage: (transaction, suspiciousPatterns) => {
    const amount = Math.abs(transaction.amount);
    const vendor = transaction.vendor;
    const date = moment(transaction.date).format('MMM DD, YYYY [at] h:mm A');
    
    let message = `🚨 **SUSPICIOUS TRANSACTION DETECTED**\n\n`;
    message += `**Transaction Details:**\n`;
    message += `• Amount: ${amount.toLocaleString('en-US', {style: 'currency', currency: 'USD'})}\n`;
    message += `• Vendor: ${vendor}\n`;
    message += `• Date: ${date}\n`;
    message += `• Category: ${transaction.category}\n\n`;
    
    message += `**Suspicious Patterns Detected:**\n`;
    suspiciousPatterns.forEach((pattern, index) => {
      message += `${index + 1}. ${pattern.description}\n`;
    });
    
    message += `\n**Please verify if this transaction was authorized by you.**`;
    
    return message;
  },

  // Process user response to alert
  processUserResponse: (alert, response, userId) => {
    const updatedAlert = {
      ...alert,
      status: response === 'NOT_MY_PURCHASE' ? 'FLAGGED' : 'CONFIRMED',
      userResponse: response,
      responseTimestamp: new Date().toISOString(),
      userId
    };

    // Log the response for audit purposes
    if (response === 'NOT_MY_PURCHASE') {
      // Send high-priority notification
      AppFunctionalityUtils.NotificationService.scheduleSecurityAlert({
        type: 'POTENTIAL_FRAUD_CONFIRMED',
        severity: 'HIGH',
        description: `User flagged transaction as unauthorized: ${alert.transaction.vendor} - ${Math.abs(alert.transaction.amount).toLocaleString('en-US', {style: 'currency', currency: 'USD'})}`
      });
    }

    return updatedAlert;
  },

  // Generate investigation recommendations for flagged transactions
  generateInvestigationSteps: (alert) => {
    const steps = [
      {
        priority: 'IMMEDIATE',
        action: 'Contact your bank or financial institution immediately',
        description: 'Report the unauthorized transaction and request a fraud investigation'
      },
      {
        priority: 'IMMEDIATE', 
        action: 'Change all relevant passwords and PINs',
        description: 'Update credentials for accounts that may have been compromised'
      },
      {
        priority: 'HIGH',
        action: 'Review recent account statements thoroughly',
        description: 'Look for other unauthorized transactions you may have missed'
      },
      {
        priority: 'HIGH',
        action: 'Check credit reports for suspicious activity',
        description: 'Monitor for any new accounts or credit inquiries you didn\'t authorize'
      },
      {
        priority: 'MEDIUM',
        action: 'Document all evidence of the unauthorized transaction',
        description: 'Save screenshots, transaction details, and any communication with financial institutions'
      },
      {
        priority: 'MEDIUM',
        action: 'Consider placing fraud alerts on your accounts',
        description: 'Add extra security measures to prevent further unauthorized access'
      }
    ];

    // Add specific recommendations based on transaction details
    const amount = Math.abs(alert.transaction.amount);
    if (amount > 1000) {
      steps.unshift({
        priority: 'IMMEDIATE',
        action: 'File a police report for financial fraud',
        description: 'Large unauthorized transactions may require law enforcement involvement'
      });
    }

    return steps;
  },

  // Check if user should receive alerts (rate limiting)
  shouldSendAlert: (userId, alertType) => {
    // Implement rate limiting to prevent alert fatigue
    const rateLimitCheck = AppFunctionalityUtils.RateLimitUtils?.checkRateLimit(`${userId}_${alertType}`, 5);
    return rateLimitCheck?.allowed !== false;
  }
};

export default EmbezzlementDetectionUtils;