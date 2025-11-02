// 🤖 ADVANCED AI/ML FRAUD DETECTION ALGORITHMS
// Machine Learning, Predictive Analytics, Behavioral Analysis, Risk Scoring

import AsyncStorage from '@react-native-async-storage/async-storage';

// 🧠 MACHINE LEARNING FRAUD DETECTOR
export class MLFraudDetector {
  
  constructor() {
    this.models = {
      microSkimming: new MicroSkimmingModel(),
      behavioralAnalysis: new BehavioralAnalysisModel(),
      anomalyDetection: new AnomalyDetectionModel(),
      riskScoring: new RiskScoringModel()
    };
    this.historicalData = [];
    this.userBehaviorProfile = null;
  }

  // Initialize ML models with historical data
  async initialize() {
    try {
      // Load historical transaction data
      const storedHistory = await AsyncStorage.getItem('transaction_history');
      this.historicalData = storedHistory ? JSON.parse(storedHistory) : [];
      
      // Load user behavior profile
      const behaviorProfile = await AsyncStorage.getItem('user_behavior_profile');
      this.userBehaviorProfile = behaviorProfile ? JSON.parse(behaviorProfile) : null;
      
      // Train models if sufficient data
      if (this.historicalData.length > 100) {
        await this.trainModels();
      }
      
      console.log('ML Fraud Detector initialized with', this.historicalData.length, 'historical records');
    } catch (error) {
      console.error('ML initialization failed:', error);
    }
  }

  // Advanced fraud analysis with ML
  async analyzeTransactionsML(transactions) {
    try {
      const results = {
        overallRiskScore: 0,
        fraudProbability: 0,
        detectedPatterns: [],
        behavioralAnomalies: [],
        predictiveInsights: [],
        recommendations: [],
        confidence: 0
      };

      // 1. Micro-skimming detection (enhanced)
      const microSkimmingResults = this.models.microSkimming.analyze(transactions);
      results.detectedPatterns.push(...microSkimmingResults.patterns);

      // 2. Behavioral analysis
      const behavioralResults = await this.models.behavioralAnalysis.analyze(
        transactions, 
        this.userBehaviorProfile
      );
      results.behavioralAnomalies = behavioralResults.anomalies;

      // 3. Anomaly detection
      const anomalyResults = this.models.anomalyDetection.detectAnomalies(
        transactions,
        this.historicalData
      );
      results.detectedPatterns.push(...anomalyResults.anomalies);

      // 4. Risk scoring
      const riskResults = this.models.riskScoring.calculateRisk(
        transactions,
        microSkimmingResults,
        behavioralResults,
        anomalyResults
      );
      
      results.overallRiskScore = riskResults.score;
      results.fraudProbability = riskResults.probability;
      results.confidence = riskResults.confidence;
      results.recommendations = riskResults.recommendations;

      // 5. Predictive insights
      results.predictiveInsights = await this.generatePredictiveInsights(transactions);

      // Update models with new data
      await this.updateModels(transactions, results);
      
      return results;

    } catch (error) {
      console.error('ML analysis failed:', error);
      throw new Error('Machine learning analysis failed');
    }
  }

  // Train models with historical data
  async trainModels() {
    try {
      console.log('Training ML models...');
      
      // Train each model
      this.models.microSkimming.train(this.historicalData);
      await this.models.behavioralAnalysis.train(this.historicalData);
      this.models.anomalyDetection.train(this.historicalData);
      this.models.riskScoring.train(this.historicalData);
      
      console.log('ML models training completed');
    } catch (error) {
      console.error('Model training failed:', error);
    }
  }

  // Update models with new transaction data
  async updateModels(transactions, analysisResults) {
    try {
      // Add to historical data
      const newHistoricalEntry = {
        transactions,
        analysisResults,
        timestamp: Date.now(),
        userFeedback: null // Will be updated if user provides feedback
      };

      this.historicalData.push(newHistoricalEntry);
      
      // Keep only last 10,000 entries for performance
      if (this.historicalData.length > 10000) {
        this.historicalData = this.historicalData.slice(-10000);
      }

      // Save updated history
      await AsyncStorage.setItem('transaction_history', JSON.stringify(this.historicalData));
      
      // Update user behavior profile
      await this.updateUserBehaviorProfile(transactions);

    } catch (error) {
      console.error('Model update failed:', error);
    }
  }

  // Generate predictive insights
  async generatePredictiveInsights(transactions) {
    const insights = [];
    
    try {
      // Trend analysis
      const trends = this.analyzeTrends(transactions);
      if (trends.length > 0) {
        insights.push({
          type: 'TREND_ANALYSIS',
          message: `Detected ${trends.length} concerning trends in transaction patterns`,
          details: trends,
          severity: 'MEDIUM'
        });
      }

      // Frequency prediction
      const frequencyPrediction = this.predictTransactionFrequency(transactions);
      if (frequencyPrediction.anomaly) {
        insights.push({
          type: 'FREQUENCY_ANOMALY',
          message: `Transaction frequency ${frequencyPrediction.change}% different from normal pattern`,
          details: frequencyPrediction,
          severity: frequencyPrediction.change > 50 ? 'HIGH' : 'MEDIUM'
        });
      }

      // Risk escalation prediction
      const riskEscalation = this.predictRiskEscalation(transactions);
      if (riskEscalation.likely) {
        insights.push({
          type: 'RISK_ESCALATION',
          message: `${riskEscalation.probability}% chance of risk escalation in next 7 days`,
          details: riskEscalation,
          severity: 'HIGH'
        });
      }

      return insights;
    } catch (error) {
      console.error('Predictive insights generation failed:', error);
      return [];
    }
  }

  // Update user behavior profile
  async updateUserBehaviorProfile(transactions) {
    try {
      if (!this.userBehaviorProfile) {
        this.userBehaviorProfile = this.createInitialBehaviorProfile(transactions);
      } else {
        this.userBehaviorProfile = this.updateBehaviorProfile(this.userBehaviorProfile, transactions);
      }

      await AsyncStorage.setItem('user_behavior_profile', JSON.stringify(this.userBehaviorProfile));
    } catch (error) {
      console.error('Behavior profile update failed:', error);
    }
  }

  // Analyze trends in transaction data
  analyzeTrends(transactions) {
    const trends = [];
    
    // Amount trend analysis
    const amounts = transactions.map(t => parseFloat(t.amount) || 0);
    const avgAmount = amounts.reduce((a, b) => a + b, 0) / amounts.length;
    
    if (avgAmount < 1 && amounts.filter(a => a > 0 && a < 1).length > amounts.length * 0.3) {
      trends.push({
        type: 'MICRO_TRANSACTION_TREND',
        description: 'High concentration of micro-transactions detected',
        risk: 'HIGH'
      });
    }

    // Time-based patterns
    const timePatterns = this.analyzeTimePatterns(transactions);
    if (timePatterns.suspicious) {
      trends.push({
        type: 'TIME_PATTERN_ANOMALY',
        description: 'Unusual timing patterns in transactions',
        risk: 'MEDIUM'
      });
    }

    return trends;
  }

  // Predict transaction frequency anomalies
  predictTransactionFrequency(transactions) {
    const currentFreq = transactions.length;
    const historicalAvg = this.calculateHistoricalAverage('frequency');
    
    if (historicalAvg === 0) return { anomaly: false };
    
    const change = ((currentFreq - historicalAvg) / historicalAvg) * 100;
    
    return {
      anomaly: Math.abs(change) > 30,
      change: Math.round(change),
      current: currentFreq,
      historical: historicalAvg
    };
  }

  // Predict risk escalation
  predictRiskEscalation(transactions) {
    // Simplified risk escalation model
    const riskFactors = [];
    
    // Check for increasing transaction amounts
    const amounts = transactions.map(t => parseFloat(t.amount) || 0).sort((a, b) => a - b);
    if (amounts.length > 5) {
      const firstHalf = amounts.slice(0, Math.floor(amounts.length / 2));
      const secondHalf = amounts.slice(Math.floor(amounts.length / 2));
      const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
      
      if (secondAvg > firstAvg * 1.5) {
        riskFactors.push('ESCALATING_AMOUNTS');
      }
    }

    // Check for pattern complexity increase
    const patternComplexity = this.calculatePatternComplexity(transactions);
    if (patternComplexity > 0.7) {
      riskFactors.push('COMPLEX_PATTERNS');
    }

    const probability = Math.min(100, riskFactors.length * 30);
    
    return {
      likely: probability > 50,
      probability,
      riskFactors,
      timeframe: '7 days'
    };
  }

  // Calculate historical averages
  calculateHistoricalAverage(metric) {
    if (this.historicalData.length === 0) return 0;
    
    const values = this.historicalData.map(entry => {
      switch (metric) {
        case 'frequency':
          return entry.transactions.length;
        case 'amount':
          return entry.transactions.reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
        default:
          return 0;
      }
    });

    return values.reduce((a, b) => a + b, 0) / values.length;
  }

  // Create initial behavior profile
  createInitialBehaviorProfile(transactions) {
    return {
      createdAt: Date.now(),
      transactionPatterns: this.extractTransactionPatterns(transactions),
      averageAmount: this.calculateAverageAmount(transactions),
      frequencyPattern: transactions.length,
      timePreferences: this.analyzeTimePreferences(transactions),
      riskTolerance: 'UNKNOWN',
      updateCount: 1
    };
  }

  // Update existing behavior profile
  updateBehaviorProfile(profile, transactions) {
    const updatedProfile = { ...profile };
    
    // Update patterns with exponential smoothing
    const alpha = 0.3; // Learning rate
    const newPatterns = this.extractTransactionPatterns(transactions);
    
    updatedProfile.transactionPatterns = this.smoothPatterns(
      profile.transactionPatterns, 
      newPatterns, 
      alpha
    );
    
    updatedProfile.averageAmount = (profile.averageAmount * (1 - alpha)) + 
                                   (this.calculateAverageAmount(transactions) * alpha);
    
    updatedProfile.updateCount += 1;
    updatedProfile.lastUpdated = Date.now();
    
    return updatedProfile;
  }

  // Additional helper methods
  extractTransactionPatterns(transactions) {
    return {
      microTransactions: transactions.filter(t => parseFloat(t.amount) < 1).length,
      largeTransactions: transactions.filter(t => parseFloat(t.amount) > 1000).length,
      roundNumbers: transactions.filter(t => parseFloat(t.amount) % 1 === 0).length,
      decimalPrecision: this.calculateAverageDecimalPrecision(transactions)
    };
  }

  calculateAverageAmount(transactions) {
    const amounts = transactions.map(t => parseFloat(t.amount) || 0);
    return amounts.reduce((a, b) => a + b, 0) / amounts.length;
  }

  analyzeTimePreferences(transactions) {
    // Simplified time analysis - in real app would analyze actual timestamps
    return {
      preferredHours: [9, 10, 11, 14, 15, 16], // Business hours
      weekendActivity: 0.2, // Lower weekend activity
      pattern: 'BUSINESS_HOURS'
    };
  }

  smoothPatterns(oldPatterns, newPatterns, alpha) {
    const smoothed = {};
    
    for (const key in oldPatterns) {
      if (typeof oldPatterns[key] === 'number' && typeof newPatterns[key] === 'number') {
        smoothed[key] = (oldPatterns[key] * (1 - alpha)) + (newPatterns[key] * alpha);
      } else {
        smoothed[key] = newPatterns[key] || oldPatterns[key];
      }
    }
    
    return smoothed;
  }

  calculateAverageDecimalPrecision(transactions) {
    const precisions = transactions.map(t => {
      const amount = parseFloat(t.amount) || 0;
      const decimalPart = amount.toString().split('.')[1];
      return decimalPart ? decimalPart.length : 0;
    });
    
    return precisions.reduce((a, b) => a + b, 0) / precisions.length;
  }

  analyzeTimePatterns(transactions) {
    // Simplified - in real app would analyze actual timestamps
    return { suspicious: false };
  }

  calculatePatternComplexity(transactions) {
    // Simplified complexity calculation
    const uniqueAmounts = new Set(transactions.map(t => parseFloat(t.amount))).size;
    const totalTransactions = transactions.length;
    
    return uniqueAmounts / totalTransactions; // Higher = more complex
  }
}

// 🔬 MICRO-SKIMMING DETECTION MODEL
class MicroSkimmingModel {
  constructor() {
    this.patterns = {
      knownSkimmingAmounts: [],
      suspiciousRanges: [],
      frequencyThresholds: {}
    };
  }

  train(historicalData) {
    // Extract micro-skimming patterns from historical data
    const microTransactions = [];
    
    historicalData.forEach(entry => {
      const micro = entry.transactions.filter(t => {
        const amount = parseFloat(t.amount) || 0;
        return amount > 0 && amount < 1;
      });
      microTransactions.push(...micro);
    });

    // Build pattern database
    this.buildPatternDatabase(microTransactions);
  }

  analyze(transactions) {
    const results = {
      patterns: [],
      riskScore: 0,
      confidence: 0
    };

    transactions.forEach(transaction => {
      const amount = parseFloat(transaction.amount) || 0;
      
      if (this.isMicroSkimming(amount, transaction)) {
        results.patterns.push({
          type: 'MICRO_SKIMMING',
          transaction,
          confidence: this.calculateConfidence(amount),
          description: `Potential micro-skimming: $${amount}`
        });
        results.riskScore += 25;
      }
    });

    results.confidence = Math.min(100, results.patterns.length * 20);
    return results;
  }

  isMicroSkimming(amount, transaction) {
    // Enhanced micro-skimming detection
    if (amount <= 0 || amount >= 1) return false;
    
    // Check decimal precision (common in skimming)
    const decimalPart = amount.toString().split('.')[1];
    if (!decimalPart || decimalPart.length < 2) return false;
    
    // Check for known skimming patterns
    if (this.patterns.knownSkimmingAmounts.includes(amount)) return true;
    
    // Check for suspicious ranges
    return this.patterns.suspiciousRanges.some(range => 
      amount >= range.min && amount <= range.max
    );
  }

  buildPatternDatabase(microTransactions) {
    // Build database of known micro-skimming patterns
    const amountFrequency = {};
    
    microTransactions.forEach(t => {
      const amount = parseFloat(t.amount);
      amountFrequency[amount] = (amountFrequency[amount] || 0) + 1;
    });

    // Identify frequently occurring micro amounts (potential skimming)
    this.patterns.knownSkimmingAmounts = Object.keys(amountFrequency)
      .filter(amount => amountFrequency[amount] > 2)
      .map(amount => parseFloat(amount));

    // Define suspicious ranges
    this.patterns.suspiciousRanges = [
      { min: 0.01, max: 0.10 }, // Very small amounts
      { min: 0.10, max: 0.50 }, // Common skimming range
      { min: 0.90, max: 0.99 }  // Just under $1
    ];
  }

  calculateConfidence(amount) {
    // Calculate confidence based on amount characteristics
    let confidence = 50;
    
    // Higher confidence for very precise decimal amounts
    const decimalPart = amount.toString().split('.')[1];
    if (decimalPart && decimalPart.length >= 3) confidence += 20;
    
    // Higher confidence for known problematic ranges
    if (amount >= 0.01 && amount <= 0.10) confidence += 25;
    
    return Math.min(100, confidence);
  }
}

// 👤 BEHAVIORAL ANALYSIS MODEL
class BehavioralAnalysisModel {
  constructor() {
    this.behaviorBaseline = null;
  }

  async train(historicalData) {
    // Build behavioral baseline from historical data
    this.behaviorBaseline = this.createBehaviorBaseline(historicalData);
  }

  async analyze(transactions, userProfile) {
    const results = {
      anomalies: [],
      behaviorScore: 0,
      deviations: []
    };

    if (!userProfile) {
      return results; // Can't analyze without baseline
    }

    // Analyze various behavioral aspects
    const frequencyAnomaly = this.analyzeFrequencyDeviation(transactions, userProfile);
    const amountAnomaly = this.analyzeAmountDeviation(transactions, userProfile);
    const patternAnomaly = this.analyzePatternDeviation(transactions, userProfile);

    if (frequencyAnomaly.isAnomaly) {
      results.anomalies.push({
        type: 'FREQUENCY_DEVIATION',
        description: `Transaction frequency ${frequencyAnomaly.deviation}% different from normal`,
        severity: frequencyAnomaly.severity
      });
    }

    if (amountAnomaly.isAnomaly) {
      results.anomalies.push({
        type: 'AMOUNT_DEVIATION',
        description: `Average transaction amount significantly different from baseline`,
        severity: amountAnomaly.severity
      });
    }

    if (patternAnomaly.isAnomaly) {
      results.anomalies.push({
        type: 'PATTERN_DEVIATION',
        description: `Transaction patterns differ from established behavior`,
        severity: patternAnomaly.severity
      });
    }

    results.behaviorScore = this.calculateBehaviorScore(results.anomalies);
    return results;
  }

  createBehaviorBaseline(historicalData) {
    // Create comprehensive behavior baseline
    const baseline = {
      averageFrequency: 0,
      averageAmount: 0,
      typicalPatterns: {},
      timePreferences: {},
      riskProfile: 'NORMAL'
    };

    if (historicalData.length === 0) return baseline;

    // Calculate averages
    const frequencies = historicalData.map(entry => entry.transactions.length);
    baseline.averageFrequency = frequencies.reduce((a, b) => a + b, 0) / frequencies.length;

    const amounts = historicalData.flatMap(entry => 
      entry.transactions.map(t => parseFloat(t.amount) || 0)
    );
    baseline.averageAmount = amounts.reduce((a, b) => a + b, 0) / amounts.length;

    return baseline;
  }

  analyzeFrequencyDeviation(transactions, userProfile) {
    const currentFreq = transactions.length;
    const baselineFreq = userProfile.frequencyPattern || 0;
    
    if (baselineFreq === 0) return { isAnomaly: false };
    
    const deviation = ((currentFreq - baselineFreq) / baselineFreq) * 100;
    const isAnomaly = Math.abs(deviation) > 50; // 50% threshold
    
    return {
      isAnomaly,
      deviation: Math.round(deviation),
      severity: Math.abs(deviation) > 100 ? 'HIGH' : 'MEDIUM'
    };
  }

  analyzeAmountDeviation(transactions, userProfile) {
    if (!transactions.length) return { isAnomaly: false };
    
    const currentAvg = transactions.reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0) / transactions.length;
    const baselineAvg = userProfile.averageAmount || 0;
    
    if (baselineAvg === 0) return { isAnomaly: false };
    
    const deviation = Math.abs((currentAvg - baselineAvg) / baselineAvg) * 100;
    const isAnomaly = deviation > 75; // 75% threshold
    
    return {
      isAnomaly,
      deviation: Math.round(deviation),
      severity: deviation > 150 ? 'HIGH' : 'MEDIUM'
    };
  }

  analyzePatternDeviation(transactions, userProfile) {
    // Simplified pattern analysis
    const currentPatterns = this.extractPatterns(transactions);
    const baselinePatterns = userProfile.transactionPatterns || {};
    
    let deviationScore = 0;
    let comparisonCount = 0;
    
    for (const key in baselinePatterns) {
      if (currentPatterns[key] !== undefined) {
        const baseline = baselinePatterns[key];
        const current = currentPatterns[key];
        
        if (baseline !== 0) {
          const deviation = Math.abs((current - baseline) / baseline);
          deviationScore += deviation;
          comparisonCount++;
        }
      }
    }
    
    const avgDeviation = comparisonCount > 0 ? deviationScore / comparisonCount : 0;
    const isAnomaly = avgDeviation > 0.5; // 50% pattern deviation threshold
    
    return {
      isAnomaly,
      deviation: Math.round(avgDeviation * 100),
      severity: avgDeviation > 1.0 ? 'HIGH' : 'MEDIUM'
    };
  }

  extractPatterns(transactions) {
    return {
      microTransactions: transactions.filter(t => parseFloat(t.amount) < 1).length,
      largeTransactions: transactions.filter(t => parseFloat(t.amount) > 1000).length,
      roundNumbers: transactions.filter(t => parseFloat(t.amount) % 1 === 0).length
    };
  }

  calculateBehaviorScore(anomalies) {
    let score = 0;
    
    anomalies.forEach(anomaly => {
      switch (anomaly.severity) {
        case 'HIGH':
          score += 30;
          break;
        case 'MEDIUM':
          score += 15;
          break;
        case 'LOW':
          score += 5;
          break;
      }
    });
    
    return Math.min(100, score);
  }
}

// 📊 ANOMALY DETECTION MODEL
class AnomalyDetectionModel {
  constructor() {
    this.statisticalBaseline = null;
  }

  train(historicalData) {
    // Build statistical baseline for anomaly detection
    this.statisticalBaseline = this.createStatisticalBaseline(historicalData);
  }

  detectAnomalies(transactions, historicalData) {
    const results = {
      anomalies: [],
      anomalyScore: 0
    };

    if (!this.statisticalBaseline) {
      return results;
    }

    // Statistical anomaly detection
    const statisticalAnomalies = this.detectStatisticalAnomalies(transactions);
    const outliers = this.detectOutliers(transactions);
    const clusterAnomalies = this.detectClusterAnomalies(transactions);

    results.anomalies = [
      ...statisticalAnomalies,
      ...outliers,
      ...clusterAnomalies
    ];

    results.anomalyScore = Math.min(100, results.anomalies.length * 15);
    return results;
  }

  createStatisticalBaseline(historicalData) {
    const allAmounts = historicalData.flatMap(entry => 
      entry.transactions.map(t => parseFloat(t.amount) || 0)
    );

    if (allAmounts.length === 0) return null;

    const mean = allAmounts.reduce((a, b) => a + b, 0) / allAmounts.length;
    const variance = allAmounts.reduce((sum, amount) => sum + Math.pow(amount - mean, 2), 0) / allAmounts.length;
    const stdDev = Math.sqrt(variance);

    return {
      mean,
      stdDev,
      min: Math.min(...allAmounts),
      max: Math.max(...allAmounts),
      count: allAmounts.length
    };
  }

  detectStatisticalAnomalies(transactions) {
    const anomalies = [];
    
    if (!this.statisticalBaseline) return anomalies;
    
    const { mean, stdDev } = this.statisticalBaseline;
    const threshold = 2 * stdDev; // 2 standard deviations
    
    transactions.forEach(transaction => {
      const amount = parseFloat(transaction.amount) || 0;
      const deviation = Math.abs(amount - mean);
      
      if (deviation > threshold) {
        anomalies.push({
          type: 'STATISTICAL_OUTLIER',
          transaction,
          description: `Amount $${amount} is ${Math.round(deviation / stdDev * 100) / 100} standard deviations from mean`,
          severity: deviation > (3 * stdDev) ? 'HIGH' : 'MEDIUM'
        });
      }
    });
    
    return anomalies;
  }

  detectOutliers(transactions) {
    // Interquartile Range (IQR) method for outlier detection
    const amounts = transactions.map(t => parseFloat(t.amount) || 0).sort((a, b) => a - b);
    
    if (amounts.length < 4) return [];
    
    const q1Index = Math.floor(amounts.length * 0.25);
    const q3Index = Math.floor(amounts.length * 0.75);
    const q1 = amounts[q1Index];
    const q3 = amounts[q3Index];
    const iqr = q3 - q1;
    
    const lowerBound = q1 - (1.5 * iqr);
    const upperBound = q3 + (1.5 * iqr);
    
    const outliers = [];
    
    transactions.forEach(transaction => {
      const amount = parseFloat(transaction.amount) || 0;
      
      if (amount < lowerBound || amount > upperBound) {
        outliers.push({
          type: 'IQR_OUTLIER',
          transaction,
          description: `Amount $${amount} is outside normal range [${lowerBound.toFixed(2)}, ${upperBound.toFixed(2)}]`,
          severity: 'MEDIUM'
        });
      }
    });
    
    return outliers;
  }

  detectClusterAnomalies(transactions) {
    // Simple clustering-based anomaly detection
    const anomalies = [];
    const amounts = transactions.map(t => parseFloat(t.amount) || 0);
    
    // Find isolated transactions (simple distance-based clustering)
    amounts.forEach((amount, index) => {
      const distances = amounts.map(other => Math.abs(amount - other));
      distances.sort((a, b) => a - b);
      
      // If the 3 nearest neighbors are far away, it's an anomaly
      if (distances.length >= 4 && distances[3] > 10) {
        anomalies.push({
          type: 'CLUSTER_ANOMALY',
          transaction: transactions[index],
          description: `Transaction amount $${amount} is isolated from other transactions`,
          severity: 'LOW'
        });
      }
    });
    
    return anomalies;
  }
}

// 🎯 RISK SCORING MODEL
class RiskScoringModel {
  constructor() {
    this.weights = {
      microSkimming: 0.4,
      behavioral: 0.3,
      anomaly: 0.2,
      frequency: 0.1
    };
  }

  train(historicalData) {
    // Adjust weights based on historical accuracy
    // Simplified - in real ML model, would use proper training
    console.log('Risk scoring model trained with', historicalData.length, 'entries');
  }

  calculateRisk(transactions, microSkimmingResults, behavioralResults, anomalyResults) {
    const scores = {
      microSkimming: Math.min(100, microSkimmingResults.riskScore || 0),
      behavioral: Math.min(100, behavioralResults.behaviorScore || 0),
      anomaly: Math.min(100, anomalyResults.anomalyScore || 0),
      frequency: this.calculateFrequencyRisk(transactions)
    };

    const weightedScore = 
      (scores.microSkimming * this.weights.microSkimming) +
      (scores.behavioral * this.weights.behavioral) +
      (scores.anomaly * this.weights.anomaly) +
      (scores.frequency * this.weights.frequency);

    const probability = this.scoreToProbability(weightedScore);
    const confidence = this.calculateConfidence(scores);
    const recommendations = this.generateRecommendations(weightedScore, scores);

    return {
      score: Math.round(weightedScore),
      probability: Math.round(probability),
      confidence: Math.round(confidence),
      breakdown: scores,
      recommendations
    };
  }

  calculateFrequencyRisk(transactions) {
    // Risk based on transaction frequency
    const count = transactions.length;
    
    if (count < 5) return 10;  // Too few transactions
    if (count > 100) return 30; // Too many transactions
    if (count > 50) return 20;  // Many transactions
    
    return 5; // Normal frequency
  }

  scoreToProbability(score) {
    // Convert risk score to fraud probability
    return Math.min(100, score * 0.8); // Slightly lower than score
  }

  calculateConfidence(scores) {
    // Calculate confidence based on consistency of scores
    const nonZeroScores = Object.values(scores).filter(score => score > 0);
    
    if (nonZeroScores.length === 0) return 50; // Neutral confidence
    
    const mean = nonZeroScores.reduce((a, b) => a + b, 0) / nonZeroScores.length;
    const variance = nonZeroScores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / nonZeroScores.length;
    const stdDev = Math.sqrt(variance);
    
    // Higher confidence when scores are consistent
    const consistency = Math.max(0, 100 - (stdDev * 2));
    return Math.min(100, consistency);
  }

  generateRecommendations(overallScore, breakdown) {
    const recommendations = [];
    
    if (overallScore > 70) {
      recommendations.push({
        priority: 'HIGH',
        action: 'IMMEDIATE_INVESTIGATION',
        description: 'Conduct immediate detailed investigation of all flagged transactions'
      });
      recommendations.push({
        priority: 'HIGH',
        action: 'SECURITY_ALERT',
        description: 'Notify security team and implement enhanced monitoring'
      });
    } else if (overallScore > 40) {
      recommendations.push({
        priority: 'MEDIUM',
        action: 'ENHANCED_MONITORING',
        description: 'Increase monitoring frequency and implement additional checks'
      });
      recommendations.push({
        priority: 'MEDIUM',
        action: 'REVIEW_PATTERNS',
        description: 'Review transaction patterns for emerging threats'
      });
    } else {
      recommendations.push({
        priority: 'LOW',
        action: 'CONTINUE_MONITORING',
        description: 'Continue standard monitoring procedures'
      });
    }

    // Specific recommendations based on breakdown
    if (breakdown.microSkimming > 50) {
      recommendations.push({
        priority: 'HIGH',
        action: 'MICRO_SKIMMING_INVESTIGATION',
        description: 'Investigate potential micro-skimming attack'
      });
    }

    if (breakdown.behavioral > 50) {
      recommendations.push({
        priority: 'MEDIUM',
        action: 'BEHAVIOR_VERIFICATION',
        description: 'Verify unusual behavioral patterns with account holder'
      });
    }

    return recommendations;
  }
}

export default MLFraudDetector;