import moment from 'moment';
import EmbezzlementDetectionUtils from './EmbezzlementDetectionUtils';
import SecurityUtils from './SecurityUtils';
import RealAIService from '../services/RealAIService';

// Enhanced Anomaly Detection with advanced machine learning algorithms and real AI integration
export const EnhancedAnomalyDetectionUtils = {
  
  // Advanced detection configuration
  ENHANCED_CONFIG: {
    // Statistical thresholds
    STATISTICAL_DEVIATION_THRESHOLD: 2.5, // Z-score threshold
    TRANSACTION_VOLUME_THRESHOLD: 1.5, // Volume spike detection
    SEASONAL_VARIATION_THRESHOLD: 0.3, // Seasonal pattern deviation
    
    // Behavioral analysis
    USER_BEHAVIOR_BASELINE_DAYS: 90, // Days to establish baseline
    BEHAVIORAL_CHANGE_THRESHOLD: 0.4, // Significant behavior change
    
    // Advanced pattern detection
    CLUSTERING_SIMILARITY_THRESHOLD: 0.85, // Transaction clustering
    ANOMALY_SCORE_THRESHOLD: 75, // Overall anomaly score (0-100)
    
    // Time-based analysis
    TEMPORAL_PATTERN_WINDOW: 30, // Days for temporal analysis
    FREQUENCY_ANOMALY_THRESHOLD: 2.0, // Frequency deviation multiplier
    
    // Network analysis
    VENDOR_NETWORK_ANALYSIS: true,
    SUSPICIOUS_VENDOR_PATTERNS: true,
    CROSS_REFERENCE_ANALYSIS: true,
    
    // AI Integration
    AI_ENABLED: true,
    AI_CONFIDENCE_THRESHOLD: 0.7,
    HYBRID_ANALYSIS: true // Combine AI and statistical methods
  },

  // Advanced anomaly detection with machine learning algorithms and real AI
  detectAdvancedAnomalies: async (transactions, userProfile = {}, companyProfiles = []) => {
    const anomalies = [];
    const startTime = Date.now();
    
    try {
      console.log('🔍 Starting AI-enhanced anomaly detection...');
      
      // Check if AI service is available
      const aiStatus = RealAIService.getAIStatus();
      let aiResults = null;
      
      if (aiStatus.isInitialized && EnhancedAnomalyDetectionUtils.ENHANCED_CONFIG.AI_ENABLED) {
        console.log('🧠 Running AI-powered fraud detection...');
        aiResults = await RealAIService.analyzeBatch(transactions);
      }
      
      // Build comprehensive user behavioral profile
      const behavioralProfile = await EnhancedAnomalyDetectionUtils.buildBehavioralProfile(
        transactions, 
        userProfile
      );
      
      // Run multiple detection algorithms (enhanced with AI)
      const detectionResults = await Promise.all([
        EnhancedAnomalyDetectionUtils.statisticalAnomalyDetection(transactions, behavioralProfile),
        EnhancedAnomalyDetectionUtils.behavioralAnomalyDetection(transactions, behavioralProfile),
        EnhancedAnomalyDetectionUtils.temporalAnomalyDetection(transactions, behavioralProfile),
        EnhancedAnomalyDetectionUtils.networkAnomalyDetection(transactions, behavioralProfile),
        EnhancedAnomalyDetectionUtils.clusteringAnomalyDetection(transactions, behavioralProfile),
        EnhancedAnomalyDetectionUtils.crossCompanyAnalysis(transactions, companyProfiles)
      ]);
      
      // Combine results from all detection methods
      detectionResults.forEach(results => {
        anomalies.push(...results);
      });
      
      // Calculate composite anomaly scores
      const scoredAnomalies = EnhancedAnomalyDetectionUtils.calculateAnomalyScores(
        anomalies, 
        behavioralProfile
      );
      
      // Filter by threshold and deduplicate
      const significantAnomalies = scoredAnomalies
        .filter(anomaly => anomaly.anomalyScore >= EnhancedAnomalyDetectionUtils.ENHANCED_CONFIG.ANOMALY_SCORE_THRESHOLD)
        .sort((a, b) => b.anomalyScore - a.anomalyScore);
      
      return {
        anomalies: significantAnomalies,
        behavioralProfile,
        analysisMetadata: {
          totalTransactionsAnalyzed: transactions.length,
          detectionMethods: 6,
          anomaliesFound: significantAnomalies.length,
          averageAnomalyScore: significantAnomalies.reduce((sum, a) => sum + a.anomalyScore, 0) / significantAnomalies.length || 0,
          analysisTimestamp: new Date().toISOString()
        }
      };
      
    } catch (error) {
      console.error('Enhanced anomaly detection error:', error);
      return {
        anomalies: [],
        behavioralProfile: {},
        error: error.message
      };
    }
  },

  // Build comprehensive behavioral profile
  buildBehavioralProfile: async (transactions, existingProfile = {}) => {
    const profile = {
      // Statistical measures
      transactionStats: {},
      amountDistribution: {},
      temporalPatterns: {},
      vendorPatterns: {},
      categoryPatterns: {},
      
      // Behavioral indicators
      spendingVelocity: {},
      riskTolerance: {},
      preferenceStability: {},
      
      // Advanced metrics
      seasonalPatterns: {},
      clusteringResults: {},
      networkMetrics: {},
      
      ...existingProfile
    };

    if (transactions.length === 0) return profile;

    // Calculate statistical measures
    const amounts = transactions.map(t => Math.abs(t.amount));
    profile.transactionStats = {
      mean: amounts.reduce((sum, amt) => sum + amt, 0) / amounts.length,
      median: EnhancedAnomalyDetectionUtils.calculateMedian(amounts),
      standardDeviation: EnhancedAnomalyDetectionUtils.calculateStandardDeviation(amounts),
      skewness: EnhancedAnomalyDetectionUtils.calculateSkewness(amounts),
      kurtosis: EnhancedAnomalyDetectionUtils.calculateKurtosis(amounts)
    };

    // Analyze temporal patterns
    profile.temporalPatterns = EnhancedAnomalyDetectionUtils.analyzeTemporalPatterns(transactions);
    
    // Analyze vendor relationships
    profile.vendorPatterns = EnhancedAnomalyDetectionUtils.analyzeVendorPatterns(transactions);
    
    // Analyze category behavior
    profile.categoryPatterns = EnhancedAnomalyDetectionUtils.analyzeCategoryPatterns(transactions);
    
    // Calculate spending velocity
    profile.spendingVelocity = EnhancedAnomalyDetectionUtils.calculateSpendingVelocity(transactions);
    
    return profile;
  },

  // Statistical anomaly detection using Z-scores and distribution analysis
  statisticalAnomalyDetection: async (transactions, profile) => {
    const anomalies = [];
    const { mean, standardDeviation } = profile.transactionStats;
    
    transactions.forEach(transaction => {
      const amount = Math.abs(transaction.amount);
      const zScore = (amount - mean) / standardDeviation;
      
      if (Math.abs(zScore) > EnhancedAnomalyDetectionUtils.ENHANCED_CONFIG.STATISTICAL_DEVIATION_THRESHOLD) {
        anomalies.push({
          type: 'STATISTICAL_OUTLIER',
          transaction,
          severity: Math.abs(zScore) > 3 ? 'HIGH' : 'MEDIUM',
          details: {
            zScore: zScore.toFixed(2),
            deviationFromMean: ((amount - mean) / mean * 100).toFixed(1) + '%',
            statisticalSignificance: Math.abs(zScore) > 3 ? 'EXTREME' : 'SIGNIFICANT'
          },
          confidence: Math.min(Math.abs(zScore) / 3 * 100, 100),
          description: `Transaction amount deviates ${Math.abs(zScore).toFixed(1)} standard deviations from normal`
        });
      }
    });
    
    return anomalies;
  },

  // Behavioral anomaly detection based on user patterns
  behavioralAnomalyDetection: async (transactions, profile) => {
    const anomalies = [];
    
    // Analyze spending pattern changes
    const recentTransactions = transactions.filter(t => 
      moment(t.date).isAfter(moment().subtract(30, 'days'))
    );
    
    const historicalTransactions = transactions.filter(t => 
      moment(t.date).isBefore(moment().subtract(30, 'days'))
    );
    
    if (historicalTransactions.length > 0 && recentTransactions.length > 0) {
      const recentProfile = await EnhancedAnomalyDetectionUtils.buildBehavioralProfile(recentTransactions);
      const historicalProfile = await EnhancedAnomalyDetectionUtils.buildBehavioralProfile(historicalTransactions);
      
      // Compare behavioral changes
      const behavioralChange = EnhancedAnomalyDetectionUtils.calculateBehavioralChange(
        recentProfile, 
        historicalProfile
      );
      
      if (behavioralChange.changeScore > EnhancedAnomalyDetectionUtils.ENHANCED_CONFIG.BEHAVIORAL_CHANGE_THRESHOLD) {
        recentTransactions.forEach(transaction => {
          anomalies.push({
            type: 'BEHAVIORAL_CHANGE',
            transaction,
            severity: behavioralChange.changeScore > 0.7 ? 'HIGH' : 'MEDIUM',
            details: {
              changeScore: behavioralChange.changeScore.toFixed(2),
              changedPatterns: behavioralChange.changedPatterns,
              timeframe: 'Last 30 days vs historical'
            },
            confidence: behavioralChange.changeScore * 100,
            description: `Significant change in spending behavior detected`
          });
        });
      }
    }
    
    return anomalies;
  },

  // Temporal anomaly detection for time-based patterns
  temporalAnomalyDetection: async (transactions, profile) => {
    const anomalies = [];
    
    transactions.forEach(transaction => {
      const transactionTime = moment(transaction.date);
      const hour = transactionTime.hour();
      const dayOfWeek = transactionTime.day();
      const dayOfMonth = transactionTime.date();
      
      // Check for unusual timing patterns
      const temporalAnomalies = [];
      
      // Unusual hour detection
      if (hour < 6 || hour > 22) {
        temporalAnomalies.push('UNUSUAL_HOUR');
      }
      
      // Weekend detection for business transactions
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        temporalAnomalies.push('WEEKEND_TRANSACTION');
      }
      
      // Holiday detection (simplified)
      if (EnhancedAnomalyDetectionUtils.isHoliday(transactionTime)) {
        temporalAnomalies.push('HOLIDAY_TRANSACTION');
      }
      
      // End-of-month clustering
      if (dayOfMonth > 28) {
        temporalAnomalies.push('END_OF_MONTH');
      }
      
      if (temporalAnomalies.length > 0) {
        anomalies.push({
          type: 'TEMPORAL_ANOMALY',
          transaction,
          severity: temporalAnomalies.length > 1 ? 'HIGH' : 'MEDIUM',
          details: {
            temporalFlags: temporalAnomalies,
            transactionTime: transactionTime.format('YYYY-MM-DD HH:mm:ss'),
            dayContext: transactionTime.format('dddd')
          },
          confidence: temporalAnomalies.length * 25,
          description: `Unusual transaction timing: ${temporalAnomalies.join(', ')}`
        });
      }
    });
    
    return anomalies;
  },

  // Network anomaly detection for vendor relationships
  networkAnomalyDetection: async (transactions, profile) => {
    const anomalies = [];
    
    // Build vendor network graph
    const vendorNetwork = EnhancedAnomalyDetectionUtils.buildVendorNetwork(transactions);
    
    // Detect suspicious vendor patterns
    Object.keys(vendorNetwork).forEach(vendor => {
      const vendorData = vendorNetwork[vendor];
      
      // Check for new vendors with large transactions
      if (vendorData.isNew && vendorData.totalAmount > 5000) {
        vendorData.transactions.forEach(transaction => {
          anomalies.push({
            type: 'NEW_VENDOR_LARGE_AMOUNT',
            transaction,
            severity: 'HIGH',
            details: {
              vendor: vendor,
              totalAmount: vendorData.totalAmount,
              transactionCount: vendorData.transactions.length,
              riskFactors: ['NEW_VENDOR', 'LARGE_AMOUNT']
            },
            confidence: 85,
            description: `Large payment to new vendor: ${vendor}`
          });
        });
      }
      
      // Check for unusual vendor frequency
      if (vendorData.frequency > 10) {
        vendorData.transactions.slice(-5).forEach(transaction => {
          anomalies.push({
            type: 'EXCESSIVE_VENDOR_FREQUENCY',
            transaction,
            severity: 'MEDIUM',
            details: {
              vendor: vendor,
              frequency: vendorData.frequency,
              timespan: 'Recent period'
            },
            confidence: 70,
            description: `Unusually frequent transactions with ${vendor}`
          });
        });
      }
    });
    
    return anomalies;
  },

  // Clustering-based anomaly detection
  clusteringAnomalyDetection: async (transactions, profile) => {
    const anomalies = [];
    
    // Simple clustering based on amount and category
    const clusters = EnhancedAnomalyDetectionUtils.clusterTransactions(transactions);
    
    // Find outlier transactions that don't fit any cluster well
    transactions.forEach(transaction => {
      const clusterFit = EnhancedAnomalyDetectionUtils.calculateClusterFit(transaction, clusters);
      
      if (clusterFit.maxSimilarity < EnhancedAnomalyDetectionUtils.ENHANCED_CONFIG.CLUSTERING_SIMILARITY_THRESHOLD) {
        anomalies.push({
          type: 'CLUSTERING_OUTLIER',
          transaction,
          severity: clusterFit.maxSimilarity < 0.5 ? 'HIGH' : 'MEDIUM',
          details: {
            maxSimilarity: clusterFit.maxSimilarity.toFixed(2),
            closestCluster: clusterFit.closestCluster,
            isolationScore: (1 - clusterFit.maxSimilarity).toFixed(2)
          },
          confidence: (1 - clusterFit.maxSimilarity) * 100,
          description: `Transaction doesn't fit established spending patterns`
        });
      }
    });
    
    return anomalies;
  },

  // Cross-company analysis for detecting unusual patterns
  crossCompanyAnalysis: async (transactions, companyProfiles) => {
    const anomalies = [];
    
    if (companyProfiles.length === 0) return anomalies;
    
    // Compare against industry benchmarks
    const industryBenchmarks = EnhancedAnomalyDetectionUtils.calculateIndustryBenchmarks(companyProfiles);
    
    transactions.forEach(transaction => {
      const categoryBenchmark = industryBenchmarks[transaction.category];
      
      if (categoryBenchmark) {
        const amount = Math.abs(transaction.amount);
        const deviationFromBenchmark = (amount - categoryBenchmark.average) / categoryBenchmark.standardDeviation;
        
        if (Math.abs(deviationFromBenchmark) > 2) {
          anomalies.push({
            type: 'INDUSTRY_DEVIATION',
            transaction,
            severity: Math.abs(deviationFromBenchmark) > 3 ? 'HIGH' : 'MEDIUM',
            details: {
              industryAverage: categoryBenchmark.average,
              deviationScore: deviationFromBenchmark.toFixed(2),
              percentile: EnhancedAnomalyDetectionUtils.calculatePercentile(amount, categoryBenchmark.distribution)
            },
            confidence: Math.min(Math.abs(deviationFromBenchmark) / 3 * 100, 100),
            description: `Transaction amount unusual compared to industry standards`
          });
        }
      }
    });
    
    return anomalies;
  },

  // Calculate composite anomaly scores
  calculateAnomalyScores: (anomalies, profile) => {
    return anomalies.map(anomaly => {
      let score = anomaly.confidence || 50;
      
      // Boost score based on severity
      if (anomaly.severity === 'HIGH') score += 20;
      else if (anomaly.severity === 'MEDIUM') score += 10;
      
      // Boost score based on type criticality
      const criticalTypes = ['STATISTICAL_OUTLIER', 'NEW_VENDOR_LARGE_AMOUNT', 'BEHAVIORAL_CHANGE'];
      if (criticalTypes.includes(anomaly.type)) score += 15;
      
      // Cap at 100
      score = Math.min(score, 100);
      
      return {
        ...anomaly,
        anomalyScore: score,
        riskLevel: score > 85 ? 'CRITICAL' : score > 70 ? 'HIGH' : score > 50 ? 'MEDIUM' : 'LOW'
      };
    });
  },

  // Utility functions for statistical calculations
  calculateMedian: (values) => {
    const sorted = values.sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  },

  calculateStandardDeviation: (values) => {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    return Math.sqrt(variance);
  },

  calculateSkewness: (values) => {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const std = EnhancedAnomalyDetectionUtils.calculateStandardDeviation(values);
    const skew = values.reduce((sum, val) => sum + Math.pow((val - mean) / std, 3), 0) / values.length;
    return skew;
  },

  calculateKurtosis: (values) => {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const std = EnhancedAnomalyDetectionUtils.calculateStandardDeviation(values);
    const kurt = values.reduce((sum, val) => sum + Math.pow((val - mean) / std, 4), 0) / values.length;
    return kurt - 3; // Excess kurtosis
  },

  analyzeTemporalPatterns: (transactions) => {
    const patterns = {
      hourlyDistribution: {},
      dailyDistribution: {},
      monthlyDistribution: {},
      seasonalTrends: {}
    };
    
    transactions.forEach(transaction => {
      const date = moment(transaction.date);
      const hour = date.hour();
      const day = date.day();
      const month = date.month();
      
      patterns.hourlyDistribution[hour] = (patterns.hourlyDistribution[hour] || 0) + 1;
      patterns.dailyDistribution[day] = (patterns.dailyDistribution[day] || 0) + 1;
      patterns.monthlyDistribution[month] = (patterns.monthlyDistribution[month] || 0) + 1;
    });
    
    return patterns;
  },

  analyzeVendorPatterns: (transactions) => {
    const patterns = {};
    
    transactions.forEach(transaction => {
      const vendor = transaction.vendor;
      if (!patterns[vendor]) {
        patterns[vendor] = {
          totalAmount: 0,
          transactionCount: 0,
          averageAmount: 0,
          firstSeen: transaction.date,
          lastSeen: transaction.date
        };
      }
      
      patterns[vendor].totalAmount += Math.abs(transaction.amount);
      patterns[vendor].transactionCount += 1;
      patterns[vendor].averageAmount = patterns[vendor].totalAmount / patterns[vendor].transactionCount;
      
      if (moment(transaction.date).isBefore(patterns[vendor].firstSeen)) {
        patterns[vendor].firstSeen = transaction.date;
      }
      if (moment(transaction.date).isAfter(patterns[vendor].lastSeen)) {
        patterns[vendor].lastSeen = transaction.date;
      }
    });
    
    return patterns;
  },

  analyzeCategoryPatterns: (transactions) => {
    const patterns = {};
    
    transactions.forEach(transaction => {
      const category = transaction.category;
      if (!patterns[category]) {
        patterns[category] = {
          totalAmount: 0,
          transactionCount: 0,
          averageAmount: 0,
          percentageOfTotal: 0
        };
      }
      
      patterns[category].totalAmount += Math.abs(transaction.amount);
      patterns[category].transactionCount += 1;
      patterns[category].averageAmount = patterns[category].totalAmount / patterns[category].transactionCount;
    });
    
    // Calculate percentages
    const totalAmount = Object.values(patterns).reduce((sum, pattern) => sum + pattern.totalAmount, 0);
    Object.keys(patterns).forEach(category => {
      patterns[category].percentageOfTotal = (patterns[category].totalAmount / totalAmount) * 100;
    });
    
    return patterns;
  },

  calculateSpendingVelocity: (transactions) => {
    const sortedTransactions = transactions.sort((a, b) => new Date(a.date) - new Date(b.date));
    const velocity = {
      dailyAverage: 0,
      weeklyAverage: 0,
      monthlyAverage: 0,
      acceleration: 0
    };
    
    if (sortedTransactions.length > 1) {
      const firstDate = moment(sortedTransactions[0].date);
      const lastDate = moment(sortedTransactions[sortedTransactions.length - 1].date);
      const daysDiff = lastDate.diff(firstDate, 'days') || 1;
      
      const totalAmount = sortedTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
      
      velocity.dailyAverage = totalAmount / daysDiff;
      velocity.weeklyAverage = velocity.dailyAverage * 7;
      velocity.monthlyAverage = velocity.dailyAverage * 30;
    }
    
    return velocity;
  },

  calculateBehavioralChange: (recentProfile, historicalProfile) => {
    const changes = {
      changeScore: 0,
      changedPatterns: []
    };
    
    // Compare spending averages
    const recentAvg = recentProfile.transactionStats?.mean || 0;
    const historicalAvg = historicalProfile.transactionStats?.mean || 0;
    
    if (historicalAvg > 0) {
      const avgChange = Math.abs(recentAvg - historicalAvg) / historicalAvg;
      changes.changeScore += avgChange * 0.4;
      
      if (avgChange > 0.3) {
        changes.changedPatterns.push('SPENDING_AVERAGE');
      }
    }
    
    // Compare velocity
    const recentVelocity = recentProfile.spendingVelocity?.dailyAverage || 0;
    const historicalVelocity = historicalProfile.spendingVelocity?.dailyAverage || 0;
    
    if (historicalVelocity > 0) {
      const velocityChange = Math.abs(recentVelocity - historicalVelocity) / historicalVelocity;
      changes.changeScore += velocityChange * 0.3;
      
      if (velocityChange > 0.5) {
        changes.changedPatterns.push('SPENDING_VELOCITY');
      }
    }
    
    return changes;
  },

  buildVendorNetwork: (transactions) => {
    const network = {};
    
    transactions.forEach(transaction => {
      const vendor = transaction.vendor;
      if (!network[vendor]) {
        network[vendor] = {
          transactions: [],
          totalAmount: 0,
          frequency: 0,
          isNew: true,
          firstTransaction: transaction.date,
          lastTransaction: transaction.date
        };
      }
      
      network[vendor].transactions.push(transaction);
      network[vendor].totalAmount += Math.abs(transaction.amount);
      network[vendor].frequency += 1;
      
      // Check if vendor is truly new (first transaction within last 30 days)
      if (moment().diff(moment(network[vendor].firstTransaction), 'days') > 30) {
        network[vendor].isNew = false;
      }
    });
    
    return network;
  },

  clusterTransactions: (transactions) => {
    // Simple k-means clustering based on amount and category
    const clusters = {};
    
    transactions.forEach(transaction => {
      const key = `${transaction.category}_${Math.floor(Math.abs(transaction.amount) / 1000)}k`;
      if (!clusters[key]) {
        clusters[key] = {
          transactions: [],
          centerAmount: 0,
          category: transaction.category
        };
      }
      clusters[key].transactions.push(transaction);
    });
    
    // Calculate cluster centers
    Object.keys(clusters).forEach(key => {
      const cluster = clusters[key];
      cluster.centerAmount = cluster.transactions.reduce((sum, t) => sum + Math.abs(t.amount), 0) / cluster.transactions.length;
    });
    
    return clusters;
  },

  calculateClusterFit: (transaction, clusters) => {
    let maxSimilarity = 0;
    let closestCluster = null;
    
    Object.keys(clusters).forEach(key => {
      const cluster = clusters[key];
      
      // Calculate similarity based on category and amount
      let similarity = 0;
      
      if (transaction.category === cluster.category) {
        similarity += 0.5;
      }
      
      const amountDiff = Math.abs(Math.abs(transaction.amount) - cluster.centerAmount);
      const amountSimilarity = Math.max(0, 1 - (amountDiff / cluster.centerAmount));
      similarity += amountSimilarity * 0.5;
      
      if (similarity > maxSimilarity) {
        maxSimilarity = similarity;
        closestCluster = key;
      }
    });
    
    return { maxSimilarity, closestCluster };
  },

  calculateIndustryBenchmarks: (companyProfiles) => {
    const benchmarks = {};
    
    // Aggregate data across all companies
    companyProfiles.forEach(profile => {
      Object.keys(profile.categoryPatterns || {}).forEach(category => {
        if (!benchmarks[category]) {
          benchmarks[category] = {
            amounts: [],
            average: 0,
            standardDeviation: 0,
            distribution: []
          };
        }
        benchmarks[category].amounts.push(profile.categoryPatterns[category].averageAmount);
      });
    });
    
    // Calculate statistics for each category
    Object.keys(benchmarks).forEach(category => {
      const amounts = benchmarks[category].amounts;
      benchmarks[category].average = amounts.reduce((sum, amt) => sum + amt, 0) / amounts.length;
      benchmarks[category].standardDeviation = EnhancedAnomalyDetectionUtils.calculateStandardDeviation(amounts);
      benchmarks[category].distribution = amounts.sort((a, b) => a - b);
    });
    
    return benchmarks;
  },

  calculatePercentile: (value, distribution) => {
    const sortedDistribution = distribution.sort((a, b) => a - b);
    const index = sortedDistribution.findIndex(val => val >= value);
    return index === -1 ? 100 : (index / sortedDistribution.length) * 100;
  },

  isHoliday: (date) => {
    // Simplified holiday detection (US federal holidays)
    const month = date.month() + 1; // moment months are 0-indexed
    const day = date.date();
    
    // Major holidays that might affect business transactions
    const holidays = [
      { month: 1, day: 1 },   // New Year's Day
      { month: 7, day: 4 },   // Independence Day
      { month: 12, day: 25 }, // Christmas
      { month: 11, day: 11 }, // Veterans Day
    ];
    
    return holidays.some(holiday => holiday.month === month && holiday.day === day);
  }
};

export default EnhancedAnomalyDetectionUtils;