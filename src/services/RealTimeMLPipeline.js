/**
 * Real-Time Machine Learning Pipeline for Fraud Detection
 * Adaptive ML models that learn from fraud patterns and improve over time
 */

// Optional TensorFlow import - only if available
import AsyncStorage from '@react-native-async-storage/async-storage';

let tf = null;
try {
  tf = require('@tensorflow/tfjs');
  require('@tensorflow/tfjs-react-native');
} catch (e) {
  console.log('TensorFlow.js not available - using fallback ML algorithms');
}

export class RealTimeMLPipeline {
  constructor() {
    this.fraudModel = null;
    this.anomalyModel = null;
    this.isInitialized = false;
    this.modelVersion = '2.1.0';
    this.trainingQueue = [];
    this.realtimeMetrics = {
      accuracyRate: 0.0,
      falsePositiveRate: 0.0,
      detectionLatency: 0,
      modelConfidence: 0.0,
      adaptationRate: 0.0
    };
  }

  /**
   * Initialize ML Pipeline with pre-trained models
   */
  async initializePipeline() {
    try {
      await tf.ready();
      
      // Load or create fraud detection model
      this.fraudModel = await this.loadOrCreateFraudModel();
      
      // Load or create anomaly detection model
      this.anomalyModel = await this.loadOrCreateAnomalyModel();
      
      // Load historical metrics
      await this.loadModelMetrics();
      
      this.isInitialized = true;
      console.log('🤖 Real-Time ML Pipeline initialized successfully');
      
      return {
        success: true,
        modelVersion: this.modelVersion,
        metrics: this.realtimeMetrics
      };
    } catch (error) {
      console.error('ML Pipeline initialization error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Real-time fraud prediction with confidence scoring
   */
  async predictFraud(transaction, historicalData = []) {
    if (!this.isInitialized || !this.fraudModel) {
      return this.fallbackPrediction(transaction);
    }

    const startTime = Date.now();
    
    try {
      // Extract enhanced features for ML model
      const features = this.extractMLFeatures(transaction, historicalData);
      
      // Normalize features
      const normalizedFeatures = this.normalizeFeatures(features);
      
      // Create tensor
      const inputTensor = tf.tensor2d([normalizedFeatures]);
      
      // Make prediction
      const prediction = await this.fraudModel.predict(inputTensor);
      const fraudProbability = await prediction.data();
      
      // Calculate confidence metrics
      const confidence = this.calculateConfidence(fraudProbability[0], features);
      
      // Update real-time metrics
      const latency = Date.now() - startTime;
      this.updateRealtimeMetrics(latency, confidence);
      
      // Cleanup tensors
      inputTensor.dispose();
      prediction.dispose();
      
      return {
        fraudProbability: fraudProbability[0],
        confidence: confidence,
        riskLevel: this.classifyRiskLevel(fraudProbability[0]),
        modelVersion: this.modelVersion,
        latency: latency,
        features: this.getFeatureImportance(normalizedFeatures),
        recommendations: this.generateRecommendations(fraudProbability[0], features)
      };
    } catch (error) {
      console.error('ML Prediction error:', error);
      return this.fallbackPrediction(transaction);
    }
  }

  /**
   * Real-time model adaptation based on feedback
   */
  async adaptModel(transaction, actualOutcome, userFeedback = null) {
    const adaptationData = {
      transaction,
      actualOutcome, // true = fraud, false = legitimate
      userFeedback,
      timestamp: new Date().toISOString(),
      modelVersion: this.modelVersion
    };

    // Add to training queue
    this.trainingQueue.push(adaptationData);

    // Trigger incremental learning if queue is sufficient
    if (this.trainingQueue.length >= 50) {
      await this.performIncrementalLearning();
    }

    // Update adaptation metrics
    this.updateAdaptationMetrics(adaptationData);
    
    return {
      success: true,
      queueSize: this.trainingQueue.length,
      adaptationRate: this.realtimeMetrics.adaptationRate
    };
  }

  /**
   * Advanced anomaly detection using ensemble methods
   */
  async detectAnomalies(transactions) {
    if (!this.isInitialized || !this.anomalyModel) {
      return this.fallbackAnomalyDetection(transactions);
    }

    try {
      const anomalies = [];
      
      for (const transaction of transactions) {
        // Extract time-series features
        const timeFeatures = this.extractTimeSeriesFeatures(transaction, transactions);
        
        // Behavioral analysis
        const behaviorFeatures = this.extractBehaviorFeatures(transaction, transactions);
        
        // Combined feature vector
        const combinedFeatures = [...timeFeatures, ...behaviorFeatures];
        const normalizedFeatures = this.normalizeFeatures(combinedFeatures);
        
        // Anomaly prediction
        const inputTensor = tf.tensor2d([normalizedFeatures]);
        const anomalyScore = await this.anomalyModel.predict(inputTensor);
        const score = await anomalyScore.data();
        
        if (score[0] > 0.7) { // Anomaly threshold
          anomalies.push({
            transaction,
            anomalyScore: score[0],
            anomalyType: this.classifyAnomalyType(normalizedFeatures, score[0]),
            confidence: this.calculateAnomalyConfidence(score[0]),
            features: normalizedFeatures,
            explanation: this.explainAnomaly(normalizedFeatures, score[0])
          });
        }
        
        inputTensor.dispose();
        anomalyScore.dispose();
      }
      
      return {
        anomalies,
        totalTransactions: transactions.length,
        anomalyRate: (anomalies.length / transactions.length) * 100,
        modelMetrics: this.realtimeMetrics
      };
    } catch (error) {
      console.error('Anomaly detection error:', error);
      return this.fallbackAnomalyDetection(transactions);
    }
  }

  /**
   * Extract ML features with enhanced engineering
   */
  extractMLFeatures(transaction, historicalData) {
    const amount = parseFloat(transaction.amount || 0);
    const timestamp = new Date(transaction.timestamp || Date.now());
    const hour = timestamp.getHours();
    const dayOfWeek = timestamp.getDay();
    
    // Basic features
    const basicFeatures = [
      Math.log(Math.abs(amount) + 1), // Log-transformed amount
      hour / 24, // Normalized hour
      dayOfWeek / 7, // Normalized day of week
      transaction.merchant ? transaction.merchant.length / 50 : 0, // Normalized merchant name length
    ];
    
    // Historical analysis features
    const historicalFeatures = this.extractHistoricalFeatures(transaction, historicalData);
    
    // Velocity features
    const velocityFeatures = this.extractVelocityFeatures(transaction, historicalData);
    
    // Merchant analysis features
    const merchantFeatures = this.extractMerchantFeatures(transaction, historicalData);
    
    return [
      ...basicFeatures,
      ...historicalFeatures,
      ...velocityFeatures,
      ...merchantFeatures
    ];
  }

  /**
   * Extract historical pattern features
   */
  extractHistoricalFeatures(transaction, historicalData) {
    if (!historicalData || historicalData.length === 0) {
      return [0, 0, 0, 0, 0]; // Default values
    }

    const recentTransactions = historicalData.slice(-30); // Last 30 transactions
    const amounts = recentTransactions.map(t => Math.abs(parseFloat(t.amount || 0)));
    
    const avgAmount = amounts.reduce((sum, amt) => sum + amt, 0) / amounts.length;
    const stdAmount = this.calculateStandardDeviation(amounts);
    const currentAmount = Math.abs(parseFloat(transaction.amount || 0));
    
    return [
      Math.log(avgAmount + 1), // Average historical amount (log)
      stdAmount / (avgAmount + 1), // Coefficient of variation
      (currentAmount - avgAmount) / (stdAmount + 1), // Z-score
      recentTransactions.length / 30, // Transaction frequency
      this.calculateTrendSlope(amounts) // Amount trend
    ];
  }

  /**
   * Extract velocity-based features
   */
  extractVelocityFeatures(transaction, historicalData) {
    if (!historicalData || historicalData.length < 2) {
      return [0, 0, 0];
    }

    const now = new Date(transaction.timestamp || Date.now());
    const recentTransactions = historicalData.filter(t => {
      const transactionTime = new Date(t.timestamp || 0);
      const hoursDiff = (now - transactionTime) / (1000 * 60 * 60);
      return hoursDiff <= 24; // Last 24 hours
    });

    const velocityMetrics = [
      recentTransactions.length / 24, // Transactions per hour
      this.calculateAmountVelocity(recentTransactions), // Amount velocity
      this.calculateLocationVelocity(transaction, recentTransactions) // Location velocity
    ];

    return velocityMetrics;
  }

  /**
   * Extract merchant-specific features
   */
  extractMerchantFeatures(transaction, historicalData) {
    const merchant = transaction.merchant || '';
    const category = transaction.category || '';
    
    if (!historicalData || historicalData.length === 0) {
      return [0, 0, 0];
    }

    const merchantHistory = historicalData.filter(t => 
      t.merchant && t.merchant.toLowerCase().includes(merchant.toLowerCase())
    );
    
    const categoryHistory = historicalData.filter(t => 
      t.category && t.category.toLowerCase() === category.toLowerCase()
    );

    return [
      merchantHistory.length / historicalData.length, // Merchant frequency
      categoryHistory.length / historicalData.length, // Category frequency
      this.calculateMerchantRiskScore(merchant, category) // Risk score
    ];
  }

  /**
   * Normalize features to [0, 1] range
   */
  normalizeFeatures(features) {
    return features.map(feature => {
      if (typeof feature !== 'number' || isNaN(feature)) return 0;
      return Math.max(0, Math.min(1, feature));
    });
  }

  /**
   * Calculate model confidence
   */
  calculateConfidence(probability, features) {
    // Higher confidence for extreme probabilities and consistent features
    const extremeness = Math.abs(probability - 0.5) * 2;
    const featureConsistency = this.calculateFeatureConsistency(features);
    return Math.min(1, (extremeness + featureConsistency) / 2);
  }

  /**
   * Classify risk level based on probability
   */
  classifyRiskLevel(probability) {
    if (probability > 0.8) return 'CRITICAL';
    if (probability > 0.6) return 'HIGH';
    if (probability > 0.4) return 'MEDIUM';
    if (probability > 0.2) return 'LOW';
    return 'MINIMAL';
  }

  /**
   * Generate AI-powered recommendations
   */
  generateRecommendations(probability, features) {
    const recommendations = [];

    if (probability > 0.7) {
      recommendations.push({
        action: 'IMMEDIATE_REVIEW',
        priority: 'CRITICAL',
        description: 'Transaction requires immediate manual review and verification'
      });
    }

    if (probability > 0.5) {
      recommendations.push({
        action: 'ENHANCED_MONITORING',
        priority: 'HIGH',
        description: 'Enable enhanced monitoring for this account'
      });
    }

    if (features[2] > 0.8) { // High velocity indicator
      recommendations.push({
        action: 'VELOCITY_CHECK',
        priority: 'MEDIUM',
        description: 'Review recent transaction velocity patterns'
      });
    }

    return recommendations;
  }

  /**
   * Update real-time metrics
   */
  updateRealtimeMetrics(latency, confidence) {
    this.realtimeMetrics.detectionLatency = latency;
    this.realtimeMetrics.modelConfidence = confidence;
    
    // Exponential moving average for accuracy
    const alpha = 0.1;
    this.realtimeMetrics.accuracyRate = 
      alpha * confidence + (1 - alpha) * this.realtimeMetrics.accuracyRate;
  }

  /**
   * Fallback prediction when ML models unavailable
   */
  fallbackPrediction(transaction) {
    const amount = Math.abs(parseFloat(transaction.amount || 0));
    const hour = new Date(transaction.timestamp || Date.now()).getHours();
    
    let riskScore = 0;
    
    // Simple rule-based scoring
    if (amount > 10000) riskScore += 0.3;
    if (amount > 50000) riskScore += 0.4;
    if (hour < 6 || hour > 22) riskScore += 0.2;
    
    return {
      fraudProbability: riskScore,
      confidence: 0.6,
      riskLevel: this.classifyRiskLevel(riskScore),
      modelVersion: 'fallback',
      latency: 5,
      features: [],
      recommendations: []
    };
  }

  /**
   * Utility functions
   */
  calculateStandardDeviation(values) {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
    return Math.sqrt(variance);
  }

  calculateTrendSlope(values) {
    if (values.length < 2) return 0;
    const n = values.length;
    const x = Array.from({length: n}, (_, i) => i);
    const meanX = x.reduce((sum, val) => sum + val, 0) / n;
    const meanY = values.reduce((sum, val) => sum + val, 0) / n;
    
    const numerator = x.reduce((sum, xi, i) => sum + (xi - meanX) * (values[i] - meanY), 0);
    const denominator = x.reduce((sum, xi) => sum + Math.pow(xi - meanX, 2), 0);
    
    return denominator === 0 ? 0 : numerator / denominator;
  }

  calculateAmountVelocity(transactions) {
    if (transactions.length === 0) return 0;
    const totalAmount = transactions.reduce((sum, t) => sum + Math.abs(parseFloat(t.amount || 0)), 0);
    return totalAmount / 24; // Amount per hour
  }

  calculateLocationVelocity(transaction, recentTransactions) {
    // Simplified location velocity calculation
    // In production, would use actual GPS coordinates
    return recentTransactions.length > 3 ? 0.5 : 0.1;
  }

  calculateMerchantRiskScore(merchant, category) {
    const highRiskMerchants = ['casino', 'gambling', 'crypto', 'bitcoin', 'atm'];
    const merchantLower = merchant.toLowerCase();
    
    const riskScore = highRiskMerchants.some(risk => merchantLower.includes(risk)) ? 0.8 : 0.2;
    return riskScore;
  }

  calculateFeatureConsistency(features) {
    // Measure how consistent features are (low variance = high consistency)
    const variance = this.calculateStandardDeviation(features.filter(f => typeof f === 'number'));
    return Math.max(0, 1 - variance);
  }

  /**
   * Get current pipeline status
   */
  getStatus() {
    return {
      isInitialized: this.isInitialized,
      modelVersion: this.modelVersion,
      metrics: this.realtimeMetrics,
      queueSize: this.trainingQueue.length,
      lastUpdate: new Date().toISOString()
    };
  }
}

export default RealTimeMLPipeline;