// Oxul Local Data Processing Pipeline
// Secure, offline-capable data processing for sensitive financial information
// No external dependencies or cloud services

import CryptoJS from 'crypto-js';

let tf;
try {
  tf = require('@tensorflow/tfjs');
} catch (error) {
  console.warn('TensorFlow.js not available, ML features will be limited');
  tf = null;
}

class OxulDataProcessor {
  constructor() {
    this.encryptionKey = this.generateEncryptionKey();
    this.processingQueue = [];
    this.dataCache = new Map();
    this.securityProtocols = new DataSecurityManager();
    this.validator = new FinancialDataValidator();
    this.preprocessor = new AdvancedPreprocessor();
  }

  // Main Data Processing Pipeline
  async processFinancialData(rawData, options = {}) {
    try {
      console.log('🔒 Starting secure local data processing...');
      
      // Step 1: Security validation and encryption
      const secureData = await this.securityProtocols.validateAndSecure(rawData);
      
      // Step 2: Data validation and quality checks
      const validatedData = await this.validator.validate(secureData);
      
      // Step 3: Data preprocessing and feature engineering
      const processedData = await this.preprocessor.process(validatedData, options);
      
      // Step 4: Cache processed data securely
      const cacheKey = this.generateCacheKey(rawData);
      this.dataCache.set(cacheKey, this.encryptData(processedData));
      
      console.log('✅ Data processing completed securely');
      
      return {
        success: true,
        data: processedData,
        metadata: {
          recordCount: processedData.length,
          processingTime: Date.now(),
          securityLevel: 'high',
          cacheKey: cacheKey
        }
      };
    } catch (error) {
      console.error('❌ Data processing failed:', error);
      return {
        success: false,
        error: error.message,
        securityLevel: 'maintained'
      };
    }
  }

  // Advanced Feature Engineering
  async engineerFeatures(data) {
    console.log('🔧 Engineering advanced financial features...');
    
    const engineeredData = data.map(record => {
      const features = {
        ...record,
        
        // Temporal Features
        temporal: this.extractTemporalFeatures(record),
        
        // Amount-based Features
        amount_features: this.extractAmountFeatures(record),
        
        // Behavioral Features
        behavioral: this.extractBehavioralFeatures(record),
        
        // Pattern Features
        patterns: this.extractPatternFeatures(record),
        
        // Risk Indicators
        risk_indicators: this.calculateRiskIndicators(record),
        
        // Relationship Features
        relationships: this.analyzeRelationships(record, data),
        
        // Statistical Features
        statistics: this.calculateStatisticalFeatures(record, data)
      };
      
      return features;
    });
    
    console.log('✅ Feature engineering completed');
    return engineeredData;
  }

  // Extract Temporal Features
  extractTemporalFeatures(record) {
    const timestamp = new Date(record.timestamp || record.date);
    
    return {
      hour_of_day: timestamp.getHours(),
      day_of_week: timestamp.getDay(),
      day_of_month: timestamp.getDate(),
      month: timestamp.getMonth(),
      quarter: Math.floor(timestamp.getMonth() / 3) + 1,
      is_weekend: timestamp.getDay() === 0 || timestamp.getDay() === 6,
      is_holiday: this.isHoliday(timestamp),
      is_month_end: this.isMonthEnd(timestamp),
      is_quarter_end: this.isQuarterEnd(timestamp),
      business_hours: this.isBusinessHours(timestamp),
      time_since_epoch: timestamp.getTime(),
      days_since_last_transaction: this.daysSinceLastTransaction(record, timestamp)
    };
  }

  // Extract Amount-based Features
  extractAmountFeatures(record) {
    const amount = parseFloat(record.amount || 0);
    
    return {
      amount_log: amount > 0 ? Math.log(amount + 1) : 0,
      amount_sqrt: Math.sqrt(Math.abs(amount)),
      is_round_number: this.isRoundNumber(amount),
      amount_digits: amount.toString().replace(/[^0-9]/g, '').length,
      first_digit: this.getFirstDigit(amount),
      last_two_digits: amount % 100,
      amount_category: this.categorizeAmount(amount),
      deviation_from_typical: this.calculateAmountDeviation(record, amount),
      z_score: this.calculateAmountZScore(record, amount)
    };
  }

  // Extract Behavioral Features
  extractBehavioralFeatures(record) {
    return {
      transaction_frequency: this.calculateTransactionFrequency(record),
      velocity_indicator: this.calculateVelocityIndicator(record),
      approval_pattern: this.analyzeApprovalPattern(record),
      documentation_completeness: this.assessDocumentationCompleteness(record),
      vendor_relationship_age: this.calculateVendorRelationshipAge(record),
      account_activity_level: this.assessAccountActivityLevel(record),
      user_behavior_score: this.calculateUserBehaviorScore(record)
    };
  }

  // Extract Pattern Features
  extractPatternFeatures(record) {
    return {
      sequence_number: this.extractSequenceNumber(record),
      duplicate_probability: this.calculateDuplicateProbability(record),
      unusual_timing_score: this.calculateUnusualTimingScore(record),
      amount_pattern_score: this.calculateAmountPatternScore(record),
      description_similarity: this.calculateDescriptionSimilarity(record),
      vendor_pattern_anomaly: this.detectVendorPatternAnomaly(record)
    };
  }

  // Calculate Risk Indicators
  calculateRiskIndicators(record) {
    return {
      fraud_probability: this.calculateFraudProbability(record),
      compliance_risk: this.assessComplianceRisk(record),
      operational_risk: this.assessOperationalRisk(record),
      reputational_risk: this.assessReputationalRisk(record),
      financial_risk: this.assessFinancialRisk(record),
      regulatory_risk: this.assessRegulatoryRisk(record),
      overall_risk_score: this.calculateOverallRiskScore(record)
    };
  }

  // Analyze Relationships
  analyzeRelationships(record, dataset) {
    return {
      vendor_transaction_count: this.countVendorTransactions(record, dataset),
      account_relationship_strength: this.calculateAccountRelationshipStrength(record, dataset),
      user_transaction_pattern: this.analyzeUserTransactionPattern(record, dataset),
      amount_correlation: this.calculateAmountCorrelation(record, dataset),
      timing_correlation: this.calculateTimingCorrelation(record, dataset),
      network_centrality: this.calculateNetworkCentrality(record, dataset)
    };
  }

  // Calculate Statistical Features
  calculateStatisticalFeatures(record, dataset) {
    const amounts = dataset.map(r => parseFloat(r.amount || 0));
    const mean = amounts.reduce((a, b) => a + b, 0) / amounts.length;
    const variance = amounts.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / amounts.length;
    const stdDev = Math.sqrt(variance);
    
    return {
      amount_percentile: this.calculatePercentile(record.amount, amounts),
      amount_z_score: stdDev > 0 ? (record.amount - mean) / stdDev : 0,
      outlier_score: this.calculateOutlierScore(record, dataset),
      benford_deviation: this.calculateBenfordDeviation(record.amount),
      clustering_coefficient: this.calculateClusteringCoefficient(record, dataset)
    };
  }

  // Helper Methods
  isHoliday(date) {
    // Simplified holiday detection - would be expanded for production
    const holidays = ['2025-01-01', '2025-07-04', '2025-12-25']; // Add more holidays
    const dateStr = date.toISOString().split('T')[0];
    return holidays.includes(dateStr);
  }

  isMonthEnd(date) {
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);
    return nextDay.getMonth() !== date.getMonth();
  }

  isQuarterEnd(date) {
    const month = date.getMonth();
    const day = date.getDate();
    return (month === 2 || month === 5 || month === 8 || month === 11) && this.isMonthEnd(date);
  }

  isBusinessHours(date) {
    const hour = date.getHours();
    const day = date.getDay();
    return day >= 1 && day <= 5 && hour >= 9 && hour <= 17;
  }

  isRoundNumber(amount) {
    const amountStr = Math.abs(amount).toString();
    if (amountStr.endsWith('000')) return 0.9;
    if (amountStr.endsWith('00')) return 0.7;
    if (amountStr.endsWith('0')) return 0.3;
    return 0.1;
  }

  getFirstDigit(amount) {
    const amountStr = Math.abs(amount).toString().replace(/[^0-9]/g, '');
    return amountStr.length > 0 ? parseInt(amountStr[0]) : 0;
  }

  calculateBenfordDeviation(amount) {
    const firstDigit = this.getFirstDigit(amount);
    const benfordProbability = Math.log10(1 + 1/firstDigit);
    const expectedFrequency = benfordProbability;
    // This is simplified - in practice, you'd compare against actual distribution
    return Math.abs(0.1 - expectedFrequency); // Assuming uniform distribution as baseline
  }

  // Generate Encryption Key
  generateEncryptionKey() {
    return CryptoJS.lib.WordArray.random(256/8).toString();
  }

  // Encrypt Data
  encryptData(data) {
    const dataString = JSON.stringify(data);
    return CryptoJS.AES.encrypt(dataString, this.encryptionKey).toString();
  }

  // Decrypt Data
  decryptData(encryptedData) {
    const bytes = CryptoJS.AES.decrypt(encryptedData, this.encryptionKey);
    const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
    return JSON.parse(decryptedString);
  }

  // Generate Cache Key
  generateCacheKey(data) {
    const dataHash = CryptoJS.SHA256(JSON.stringify(data)).toString();
    return `oxul_cache_${dataHash}_${Date.now()}`;
  }

  // Batch Processing
  async processBatch(dataArray, batchSize = 100) {
    const results = [];
    
    for (let i = 0; i < dataArray.length; i += batchSize) {
      const batch = dataArray.slice(i, i + batchSize);
      const batchResult = await this.processFinancialData(batch);
      results.push(batchResult);
      
      // Progress indicator
      console.log(`📊 Processed batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(dataArray.length/batchSize)}`);
    }
    
    return results;
  }

  // Clear Cache
  clearCache() {
    this.dataCache.clear();
    console.log('🗑️ Data cache cleared securely');
  }

  // Get Processing Statistics
  getProcessingStats() {
    return {
      cacheSize: this.dataCache.size,
      queueLength: this.processingQueue.length,
      encryptionEnabled: true,
      securityLevel: 'high',
      lastProcessed: this.lastProcessedTimestamp
    };
  }
}

// Data Security Manager
class DataSecurityManager {
  constructor() {
    this.securityLevel = 'high';
    this.accessLog = [];
  }

  async validateAndSecure(data) {
    // Log access
    this.accessLog.push({
      timestamp: new Date().toISOString(),
      action: 'data_access',
      recordCount: Array.isArray(data) ? data.length : 1
    });

    // Validate data structure
    this.validateDataStructure(data);
    
    // Sanitize sensitive information
    const sanitizedData = this.sanitizeData(data);
    
    // Apply security measures
    return this.applySecurityMeasures(sanitizedData);
  }

  validateDataStructure(data) {
    if (!data) {
      throw new Error('No data provided for processing');
    }
    
    if (Array.isArray(data)) {
      data.forEach((record, index) => {
        this.validateRecord(record, index);
      });
    } else {
      this.validateRecord(data, 0);
    }
  }

  validateRecord(record, index) {
    if (!record || typeof record !== 'object') {
      throw new Error(`Invalid record at index ${index}: must be an object`);
    }
    
    // Required fields validation
    const requiredFields = ['amount', 'timestamp'];
    requiredFields.forEach(field => {
      if (!(field in record)) {
        console.warn(`Warning: Missing required field '${field}' in record ${index}`);
      }
    });
  }

  sanitizeData(data) {
    if (Array.isArray(data)) {
      return data.map(record => this.sanitizeRecord(record));
    } else {
      return this.sanitizeRecord(data);
    }
  }

  sanitizeRecord(record) {
    const sanitized = { ...record };
    
    // Remove or mask sensitive fields
    if (sanitized.ssn) {
      sanitized.ssn = this.maskSSN(sanitized.ssn);
    }
    
    if (sanitized.accountNumber) {
      sanitized.accountNumber = this.maskAccountNumber(sanitized.accountNumber);
    }
    
    if (sanitized.creditCardNumber) {
      sanitized.creditCardNumber = this.maskCreditCard(sanitized.creditCardNumber);
    }
    
    return sanitized;
  }

  maskSSN(ssn) {
    return ssn.replace(/\d{3}-\d{2}-(\d{4})/, 'XXX-XX-$1');
  }

  maskAccountNumber(accountNumber) {
    const str = accountNumber.toString();
    return str.length > 4 ? 'X'.repeat(str.length - 4) + str.slice(-4) : str;
  }

  maskCreditCard(cardNumber) {
    const str = cardNumber.toString().replace(/\D/g, '');
    return str.length > 4 ? 'X'.repeat(str.length - 4) + str.slice(-4) : str;
  }

  applySecurityMeasures(data) {
    // Apply additional security measures as needed
    return {
      data: data,
      securityLevel: this.securityLevel,
      processedAt: new Date().toISOString(),
      checksum: this.calculateChecksum(data)
    };
  }

  calculateChecksum(data) {
    return CryptoJS.SHA256(JSON.stringify(data)).toString();
  }

  getSecurityLog() {
    return this.accessLog;
  }
}

// Financial Data Validator
class FinancialDataValidator {
  async validate(secureData) {
    const { data } = secureData;
    
    console.log('✅ Validating financial data integrity...');
    
    const validationResults = {
      passed: true,
      errors: [],
      warnings: [],
      statistics: {}
    };

    // Perform validation checks
    this.validateAmounts(data, validationResults);
    this.validateDates(data, validationResults);
    this.validateBusinessRules(data, validationResults);
    this.detectAnomalies(data, validationResults);
    
    if (validationResults.errors.length > 0) {
      throw new Error(`Data validation failed: ${validationResults.errors.join(', ')}`);
    }
    
    console.log('✅ Data validation completed');
    
    return {
      ...secureData,
      data: data,
      validation: validationResults
    };
  }

  validateAmounts(data, results) {
    const dataArray = Array.isArray(data) ? data : [data];
    
    dataArray.forEach((record, index) => {
      const amount = parseFloat(record.amount);
      
      if (isNaN(amount)) {
        results.errors.push(`Invalid amount at record ${index}: ${record.amount}`);
      } else if (amount < 0 && !this.isNegativeAmountAllowed(record)) {
        results.warnings.push(`Negative amount at record ${index}: ${amount}`);
      } else if (Math.abs(amount) > 10000000) { // 10 million threshold
        results.warnings.push(`Unusually large amount at record ${index}: ${amount}`);
      }
    });
  }

  validateDates(data, results) {
    const dataArray = Array.isArray(data) ? data : [data];
    
    dataArray.forEach((record, index) => {
      if (record.timestamp || record.date) {
        const date = new Date(record.timestamp || record.date);
        
        if (isNaN(date.getTime())) {
          results.errors.push(`Invalid date at record ${index}: ${record.timestamp || record.date}`);
        } else if (date > new Date()) {
          results.warnings.push(`Future date at record ${index}: ${date.toISOString()}`);
        } else if (date < new Date('2000-01-01')) {
          results.warnings.push(`Very old date at record ${index}: ${date.toISOString()}`);
        }
      }
    });
  }

  validateBusinessRules(data, results) {
    const dataArray = Array.isArray(data) ? data : [data];
    
    // Example business rules
    dataArray.forEach((record, index) => {
      // Rule: Large amounts should have approval
      if (Math.abs(record.amount) > 10000 && !record.approvedBy) {
        results.warnings.push(`Large amount without approval at record ${index}`);
      }
      
      // Rule: Weekend transactions should be flagged
      const date = new Date(record.timestamp || record.date);
      if (date.getDay() === 0 || date.getDay() === 6) {
        results.warnings.push(`Weekend transaction at record ${index}`);
      }
    });
  }

  detectAnomalies(data, results) {
    const dataArray = Array.isArray(data) ? data : [data];
    
    if (dataArray.length > 1) {
      const amounts = dataArray.map(r => parseFloat(r.amount));
      const mean = amounts.reduce((a, b) => a + b, 0) / amounts.length;
      const variance = amounts.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / amounts.length;
      const stdDev = Math.sqrt(variance);
      
      dataArray.forEach((record, index) => {
        const amount = parseFloat(record.amount);
        const zScore = stdDev > 0 ? Math.abs((amount - mean) / stdDev) : 0;
        
        if (zScore > 3) { // 3 standard deviations
          results.warnings.push(`Statistical outlier at record ${index}: z-score ${zScore.toFixed(2)}`);
        }
      });
    }
  }

  isNegativeAmountAllowed(record) {
    // Define rules for when negative amounts are allowed
    const allowedTypes = ['refund', 'credit', 'reversal', 'adjustment'];
    return allowedTypes.includes(record.transactionType?.toLowerCase());
  }
}

// Advanced Preprocessor
class AdvancedPreprocessor {
  async process(validatedData, options) {
    const { data } = validatedData;
    
    console.log('🔧 Advanced preprocessing pipeline starting...');
    
    // Apply preprocessing steps
    let processedData = await this.normalizeData(data);
    processedData = await this.handleMissingValues(processedData);
    processedData = await this.detectAndHandleOutliers(processedData);
    processedData = await this.engineerFeatures(processedData);
    
    console.log('✅ Advanced preprocessing completed');
    
    return processedData;
  }

  async normalizeData(data) {
    // Normalize amounts, dates, and other numerical fields
    return data.map(record => ({
      ...record,
      normalizedAmount: this.normalizeAmount(record.amount),
      normalizedDate: this.normalizeDate(record.timestamp || record.date)
    }));
  }

  normalizeAmount(amount) {
    // Log normalization to handle wide range of amounts
    return Math.log(Math.abs(amount) + 1) * Math.sign(amount);
  }

  normalizeDate(dateStr) {
    const date = new Date(dateStr);
    const epoch = new Date('2020-01-01');
    return (date.getTime() - epoch.getTime()) / (24 * 60 * 60 * 1000); // Days since epoch
  }

  async handleMissingValues(data) {
    return data.map(record => {
      const completed = { ...record };
      
      // Handle missing amounts
      if (!completed.amount || isNaN(parseFloat(completed.amount))) {
        completed.amount = 0;
        completed.missingAmount = true;
      }
      
      // Handle missing dates
      if (!completed.timestamp && !completed.date) {
        completed.timestamp = new Date().toISOString();
        completed.missingDate = true;
      }
      
      // Handle missing descriptions
      if (!completed.description) {
        completed.description = 'No description provided';
        completed.missingDescription = true;
      }
      
      return completed;
    });
  }

  async detectAndHandleOutliers(data) {
    // Use IQR method for outlier detection
    const amounts = data.map(r => Math.abs(parseFloat(r.amount))).sort((a, b) => a - b);
    const q1 = amounts[Math.floor(amounts.length * 0.25)];
    const q3 = amounts[Math.floor(amounts.length * 0.75)];
    const iqr = q3 - q1;
    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;
    
    return data.map(record => {
      const amount = Math.abs(parseFloat(record.amount));
      const isOutlier = amount < lowerBound || amount > upperBound;
      
      return {
        ...record,
        isOutlier: isOutlier,
        outlierScore: isOutlier ? (amount > upperBound ? (amount - upperBound) / upperBound : (lowerBound - amount) / lowerBound) : 0
      };
    });
  }

  async engineerFeatures(data) {
    // Create additional features for ML processing
    return data.map((record, index) => ({
      ...record,
      
      // Sequence features
      sequenceIndex: index,
      isFirstTransaction: index === 0,
      isLastTransaction: index === data.length - 1,
      
      // Amount features
      amountCategory: this.categorizeAmount(record.amount),
      amountPercentile: this.calculatePercentile(record.amount, data.map(r => r.amount)),
      
      // Time features
      timeFeatures: this.extractTimeFeatures(record.timestamp || record.date),
      
      // Text features
      textFeatures: this.extractTextFeatures(record.description || ''),
      
      // Risk features
      riskScore: this.calculateBasicRiskScore(record)
    }));
  }

  categorizeAmount(amount) {
    const absAmount = Math.abs(amount);
    if (absAmount < 100) return 'small';
    if (absAmount < 1000) return 'medium';
    if (absAmount < 10000) return 'large';
    return 'very_large';
  }

  calculatePercentile(value, array) {
    const sorted = array.slice().sort((a, b) => a - b);
    const index = sorted.findIndex(v => v >= value);
    return index / sorted.length;
  }

  extractTimeFeatures(dateStr) {
    const date = new Date(dateStr);
    return {
      hour: date.getHours(),
      dayOfWeek: date.getDay(),
      dayOfMonth: date.getDate(),
      month: date.getMonth(),
      isWeekend: date.getDay() === 0 || date.getDay() === 6,
      isBusinessHours: date.getHours() >= 9 && date.getHours() <= 17
    };
  }

  extractTextFeatures(text) {
    const words = text.toLowerCase().split(/\s+/);
    return {
      wordCount: words.length,
      characterCount: text.length,
      hasNumbers: /\d/.test(text),
      hasSpecialChars: /[!@#$%^&*(),.?":{}|<>]/.test(text),
      suspiciousWords: this.countSuspiciousWords(words)
    };
  }

  countSuspiciousWords(words) {
    const suspiciousTerms = ['cash', 'reimburse', 'personal', 'loan', 'advance'];
    return words.filter(word => suspiciousTerms.includes(word)).length;
  }

  calculateBasicRiskScore(record) {
    let score = 0;
    
    // Amount-based risk
    const amount = Math.abs(parseFloat(record.amount));
    if (amount > 10000) score += 0.3;
    else if (amount > 1000) score += 0.1;
    
    // Time-based risk
    const date = new Date(record.timestamp || record.date);
    if (date.getDay() === 0 || date.getDay() === 6) score += 0.2; // Weekend
    if (date.getHours() < 9 || date.getHours() > 17) score += 0.1; // After hours
    
    // Missing data risk
    if (record.missingAmount || record.missingDate) score += 0.2;
    if (record.missingDescription) score += 0.1;
    
    // Outlier risk
    if (record.isOutlier) score += 0.3;
    
    return Math.min(score, 1.0); // Cap at 1.0
  }
}

export default OxulDataProcessor;
