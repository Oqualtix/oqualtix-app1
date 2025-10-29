import moment from 'moment';
import EmbezzlementDetectionUtils from './EmbezzlementDetectionUtils.js';
import SecurityUtils from './SecurityUtils.js';
import RealAIService from '../services/RealAIService.js';

// Import authentication middleware
import AuthenticationMiddleware from '../middleware/AuthenticationMiddleware.js';

// Import advanced AI engines
import AdvancedFraudAI from '../ai/AdvancedFraudAI.js';
import OxulAI from '../ai/OxulAI.js';

// Enhanced Anomaly Detection with advanced machine learning algorithms and real AI integration
export const EnhancedAnomalyDetectionUtils = {
  
  // Initialize authentication middleware and AI engines
  authMiddleware: new AuthenticationMiddleware(),
  fraudAI: new AdvancedFraudAI(),
  oxulAI: new OxulAI(),
  
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
      
      // Run multiple detection algorithms (enhanced with AI and embezzlement detection)
      const detectionResults = await Promise.all([
        EnhancedAnomalyDetectionUtils.statisticalAnomalyDetection(transactions, behavioralProfile),
        EnhancedAnomalyDetectionUtils.behavioralAnomalyDetection(transactions, behavioralProfile),
        EnhancedAnomalyDetectionUtils.temporalAnomalyDetection(transactions, behavioralProfile),
        EnhancedAnomalyDetectionUtils.networkAnomalyDetection(transactions, behavioralProfile),
        EnhancedAnomalyDetectionUtils.clusteringAnomalyDetection(transactions, behavioralProfile),
        EnhancedAnomalyDetectionUtils.crossCompanyAnalysis(transactions, companyProfiles),
        EnhancedAnomalyDetectionUtils.embezzlementPatternDetection(transactions, behavioralProfile),
        EnhancedAnomalyDetectionUtils.ponziSchemeDetection(transactions, behavioralProfile),
        EnhancedAnomalyDetectionUtils.shellCompanyDetection(transactions, behavioralProfile),
        EnhancedAnomalyDetectionUtils.kickbackSchemeDetection(transactions, behavioralProfile),
        // Micro-skimming & salami-slicing detections
        EnhancedAnomalyDetectionUtils.detectMicroSkimming(transactions, behavioralProfile),
        EnhancedAnomalyDetectionUtils.detectFractionalResiduePatterns(transactions, behavioralProfile)
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

  // ===== EMBEZZLEMENT DETECTION METHODS =====
  // Based on patterns from high-profile embezzlement cases

  // Comprehensive embezzlement pattern detection inspired by real cases
  embezzlementPatternDetection: async (transactions, profile) => {
    const anomalies = [];
    const embezzlementPatterns = [];

    // Pattern 1: Round Dollar Amounts (Dennis Kozlowski - Tyco case)
    // Fraudsters often use round amounts to avoid scrutiny
    const roundDollarTransactions = transactions.filter(t => {
      const amount = Math.abs(t.amount);
      return (amount % 1000 === 0 || amount % 500 === 0) && amount >= 1000;
    });

    roundDollarTransactions.forEach(transaction => {
      embezzlementPatterns.push({
        type: 'ROUND_DOLLAR_EMBEZZLEMENT',
        transaction,
        severity: 'HIGH',
        pattern: 'KOZLOWSKI_PATTERN',
        details: {
          amount: Math.abs(transaction.amount),
          roundness: 'EXACT_THOUSAND',
          suspiciousIndicator: 'Corporate credit card for personal use pattern'
        },
        confidence: 75,
        description: `Round dollar amount suspicious for embezzlement: $${Math.abs(transaction.amount).toLocaleString()}`
      });
    });

    // Pattern 2: Just-Under-Threshold Amounts (Wells Fargo fake accounts scandal)
    // Amounts just under approval thresholds to avoid detection
    const thresholds = [1000, 2500, 5000, 10000, 25000, 50000, 100000];
    
    transactions.forEach(transaction => {
      const amount = Math.abs(transaction.amount);
      thresholds.forEach(threshold => {
        if (amount >= (threshold - 100) && amount < threshold) {
          embezzlementPatterns.push({
            type: 'THRESHOLD_EVASION_EMBEZZLEMENT',
            transaction,
            severity: 'HIGH',
            pattern: 'WELLS_FARGO_PATTERN',
            details: {
              amount: amount,
              threshold: threshold,
              difference: threshold - amount,
              evasionIndicator: 'Deliberately staying under approval limits'
            },
            confidence: 85,
            description: `Amount $${amount.toLocaleString()} suspiciously close to $${threshold.toLocaleString()} threshold`
          });
        }
      });
    });

    // Pattern 3: Frequent Small Amounts (Rita Crundwell - Dixon embezzlement)
    // Many small transactions to avoid detection, totaling large amounts
    const smallAmountGroups = transactions
      .filter(t => Math.abs(t.amount) < 5000)
      .reduce((groups, transaction) => {
        const vendor = transaction.vendor;
        if (!groups[vendor]) groups[vendor] = [];
        groups[vendor].push(transaction);
        return groups;
      }, {});

    Object.entries(smallAmountGroups).forEach(([vendor, vendorTransactions]) => {
      if (vendorTransactions.length >= 10) {
        const totalAmount = vendorTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
        const avgAmount = totalAmount / vendorTransactions.length;
        
        if (totalAmount > 50000 && avgAmount < 3000) {
          vendorTransactions.slice(-5).forEach(transaction => {
            embezzlementPatterns.push({
              type: 'STRUCTURING_EMBEZZLEMENT',
              transaction,
              severity: 'HIGH',
              pattern: 'CRUNDWELL_PATTERN',
              details: {
                vendor: vendor,
                totalTransactions: vendorTransactions.length,
                totalAmount: totalAmount,
                averageAmount: avgAmount,
                structuringIndicator: 'Many small payments to avoid detection'
              },
              confidence: 90,
              description: `Potential structuring: ${vendorTransactions.length} small payments totaling $${totalAmount.toLocaleString()}`
            });
          });
        }
      }
    });

    // Pattern 4: Duplicate/Similar Vendor Names (Frank Abagnale patterns)
    // Slightly different vendor names that could be the same entity
    const vendorNames = [...new Set(transactions.map(t => t.vendor))];
    const similarVendors = [];
    
    for (let i = 0; i < vendorNames.length; i++) {
      for (let j = i + 1; j < vendorNames.length; j++) {
        const similarity = EnhancedAnomalyDetectionUtils.calculateStringSimilarity(vendorNames[i], vendorNames[j]);
        if (similarity > 0.8 && similarity < 1.0) {
          similarVendors.push([vendorNames[i], vendorNames[j], similarity]);
        }
      }
    }

    similarVendors.forEach(([vendor1, vendor2, similarity]) => {
      const vendor1Transactions = transactions.filter(t => t.vendor === vendor1);
      const vendor2Transactions = transactions.filter(t => t.vendor === vendor2);
      
      [...vendor1Transactions, ...vendor2Transactions].forEach(transaction => {
        embezzlementPatterns.push({
          type: 'DUPLICATE_VENDOR_EMBEZZLEMENT',
          transaction,
          severity: 'MEDIUM',
          pattern: 'ABAGNALE_PATTERN',
          details: {
            primaryVendor: vendor1,
            similarVendor: vendor2,
            similarity: similarity.toFixed(2),
            duplicateIndicator: 'Potentially same entity with slight name variations'
          },
          confidence: 70,
          description: `Suspicious vendor similarity: "${vendor1}" vs "${vendor2}"`
        });
      });
    });

    // Pattern 5: Weekend/Holiday Transactions (Enron energy trading patterns)
    // Transactions during off-hours when oversight is minimal
    const suspiciousTiming = transactions.filter(transaction => {
      const date = moment(transaction.date);
      const isWeekend = date.day() === 0 || date.day() === 6;
      const isHoliday = EnhancedAnomalyDetectionUtils.isHoliday(date);
      const isAfterHours = date.hour() < 6 || date.hour() > 22;
      
      return (isWeekend || isHoliday || isAfterHours) && Math.abs(transaction.amount) > 5000;
    });

    suspiciousTiming.forEach(transaction => {
      const date = moment(transaction.date);
      embezzlementPatterns.push({
        type: 'OFF_HOURS_EMBEZZLEMENT',
        transaction,
        severity: 'HIGH',
        pattern: 'ENRON_PATTERN',
        details: {
          transactionTime: date.format('YYYY-MM-DD HH:mm:ss dddd'),
          timingRisk: 'Weekend/Holiday/After-hours large transaction',
          amount: Math.abs(transaction.amount),
          oversightRisk: 'Minimal supervision during transaction time'
        },
        confidence: 80,
        description: `Large transaction during off-hours: $${Math.abs(transaction.amount).toLocaleString()}`
      });
    });

    // Pattern 6: Employee Expense Reimbursements (Scott London - KPMG case)
    // Unusual patterns in expense reimbursements
    const expenseCategories = ['travel', 'meals', 'entertainment', 'office supplies', 'reimbursement'];
    const expenseTransactions = transactions.filter(t => 
      expenseCategories.some(cat => 
        t.category?.toLowerCase().includes(cat) || 
        t.description?.toLowerCase().includes(cat)
      )
    );

    const employeeExpenses = expenseTransactions.reduce((groups, transaction) => {
      const employee = transaction.employee || transaction.user || 'Unknown';
      if (!groups[employee]) groups[employee] = [];
      groups[employee].push(transaction);
      return groups;
    }, {});

    Object.entries(employeeExpenses).forEach(([employee, expenses]) => {
      const totalExpenses = expenses.reduce((sum, t) => sum + Math.abs(t.amount), 0);
      const avgExpense = totalExpenses / expenses.length;
      
      // Flag unusually high expense patterns
      if (expenses.length > 20 && avgExpense > 500) {
        expenses.slice(-3).forEach(transaction => {
          embezzlementPatterns.push({
            type: 'EXCESSIVE_EXPENSE_EMBEZZLEMENT',
            transaction,
            severity: 'MEDIUM',
            pattern: 'LONDON_PATTERN',
            details: {
              employee: employee,
              totalExpenses: totalExpenses,
              expenseCount: expenses.length,
              averageExpense: avgExpense,
              expenseRisk: 'Unusually high frequency and amounts'
            },
            confidence: 65,
            description: `Excessive expense pattern: ${expenses.length} expenses totaling $${totalExpenses.toLocaleString()}`
          });
        });
      }
    });

    return embezzlementPatterns;
  },

  // Ponzi scheme detection (Bernie Madoff patterns)
  ponziSchemeDetection: async (transactions, profile) => {
    const anomalies = [];
    
    // Look for patterns typical of Ponzi schemes
    const investorPayments = transactions.filter(t => 
      t.description?.toLowerCase().includes('return') ||
      t.description?.toLowerCase().includes('dividend') ||
      t.description?.toLowerCase().includes('profit') ||
      t.description?.toLowerCase().includes('yield')
    );

    if (investorPayments.length > 0) {
      // Check for unusually consistent returns (Madoff's key indicator)
      const returnAmounts = investorPayments.map(t => Math.abs(t.amount));
      const returnStdDev = EnhancedAnomalyDetectionUtils.calculateStandardDeviation(returnAmounts);
      const returnMean = returnAmounts.reduce((sum, amt) => sum + amt, 0) / returnAmounts.length;
      const coefficientOfVariation = returnStdDev / returnMean;

      // Madoff's returns were suspiciously consistent (low variation)
      if (coefficientOfVariation < 0.1 && investorPayments.length >= 5) {
        investorPayments.forEach(transaction => {
          anomalies.push({
            type: 'PONZI_SCHEME_PATTERN',
            transaction,
            severity: 'CRITICAL',
            pattern: 'MADOFF_PATTERN',
            details: {
              consistencyIndicator: 'Unusually consistent returns',
              coefficientOfVariation: coefficientOfVariation.toFixed(3),
              returnCount: investorPayments.length,
              averageReturn: returnMean,
              madoffIndicator: 'Returns too consistent to be legitimate'
            },
            confidence: 95,
            description: `Suspiciously consistent returns pattern (Ponzi scheme indicator)`
          });
        });
      }

      // Check for new investor money funding old investor returns
      const newInvestorPayments = transactions.filter(t => 
        t.description?.toLowerCase().includes('investment') ||
        t.description?.toLowerCase().includes('deposit') ||
        t.description?.toLowerCase().includes('principal')
      );

      if (newInvestorPayments.length > 0 && investorPayments.length > 0) {
        // Calculate if outgoing returns exceed incoming investments
        const totalReturns = investorPayments.reduce((sum, t) => sum + Math.abs(t.amount), 0);
        const totalNewInvestments = newInvestorPayments.reduce((sum, t) => sum + Math.abs(t.amount), 0);
        
        if (totalReturns > totalNewInvestments * 1.2) {
          investorPayments.forEach(transaction => {
            anomalies.push({
              type: 'UNSUSTAINABLE_RETURNS',
              transaction,
              severity: 'CRITICAL',
              pattern: 'PONZI_CASH_FLOW',
              details: {
                totalReturns: totalReturns,
                totalNewInvestments: totalNewInvestments,
                returnRatio: (totalReturns / totalNewInvestments).toFixed(2),
                sustainability: 'Returns exceed new investments'
              },
              confidence: 90,
              description: `Unsustainable return pattern: $${totalReturns.toLocaleString()} out vs $${totalNewInvestments.toLocaleString()} in`
            });
          });
        }
      }
    }

    return anomalies;
  },

  // Shell company detection (Enron Special Purpose Entities)
  shellCompanyDetection: async (transactions, profile) => {
    const anomalies = [];
    
    // Analyze vendor characteristics for shell company indicators
    const vendorAnalysis = transactions.reduce((analysis, transaction) => {
      const vendor = transaction.vendor;
      if (!analysis[vendor]) {
        analysis[vendor] = {
          transactions: [],
          totalAmount: 0,
          firstSeen: transaction.date,
          lastSeen: transaction.date,
          categories: new Set(),
          descriptions: new Set()
        };
      }
      
      analysis[vendor].transactions.push(transaction);
      analysis[vendor].totalAmount += Math.abs(transaction.amount);
      analysis[vendor].categories.add(transaction.category);
      analysis[vendor].descriptions.add(transaction.description);
      
      if (moment(transaction.date).isBefore(analysis[vendor].firstSeen)) {
        analysis[vendor].firstSeen = transaction.date;
      }
      if (moment(transaction.date).isAfter(analysis[vendor].lastSeen)) {
        analysis[vendor].lastSeen = transaction.date;
      }
      
      return analysis;
    }, {});

    Object.entries(vendorAnalysis).forEach(([vendor, data]) => {
      const shellCompanyFlags = [];
      
      // Flag 1: Large amounts with minimal transaction history (Enron SPEs)
      if (data.totalAmount > 100000 && data.transactions.length < 5) {
        shellCompanyFlags.push('HIGH_VALUE_LOW_FREQUENCY');
      }
      
      // Flag 2: Single category transactions (lack of business diversity)
      if (data.categories.size === 1 && data.totalAmount > 50000) {
        shellCompanyFlags.push('SINGLE_CATEGORY_HIGH_VALUE');
      }
      
      // Flag 3: Very similar transaction descriptions (automated/scripted)
      if (data.descriptions.size <= 2 && data.transactions.length >= 5) {
        shellCompanyFlags.push('REPETITIVE_DESCRIPTIONS');
      }
      
      // Flag 4: Recently created vendor with large transactions
      const daysSinceFirstSeen = moment().diff(moment(data.firstSeen), 'days');
      if (daysSinceFirstSeen < 30 && data.totalAmount > 25000) {
        shellCompanyFlags.push('NEW_VENDOR_LARGE_AMOUNTS');
      }
      
      // Flag 5: Round number transactions only
      const roundTransactionCount = data.transactions.filter(t => 
        Math.abs(t.amount) % 1000 === 0 || Math.abs(t.amount) % 500 === 0
      ).length;
      
      if (roundTransactionCount === data.transactions.length && data.transactions.length >= 3) {
        shellCompanyFlags.push('ALL_ROUND_TRANSACTIONS');
      }

      if (shellCompanyFlags.length >= 2) {
        data.transactions.forEach(transaction => {
          anomalies.push({
            type: 'SHELL_COMPANY_PATTERN',
            transaction,
            severity: 'HIGH',
            pattern: 'ENRON_SPE_PATTERN',
            details: {
              vendor: vendor,
              shellFlags: shellCompanyFlags,
              totalAmount: data.totalAmount,
              transactionCount: data.transactions.length,
              categoryDiversity: data.categories.size,
              daysSinceFirstSeen: daysSinceFirstSeen
            },
            confidence: shellCompanyFlags.length * 20,
            description: `Potential shell company: ${vendor} (${shellCompanyFlags.join(', ')})`
          });
        });
      }
    });

    return anomalies;
  },

  // Kickback scheme detection (Siemens bribery scandal patterns)
  kickbackSchemeDetection: async (transactions, profile) => {
    const anomalies = [];
    
    // Look for patterns typical of kickback schemes
    const consultingTransactions = transactions.filter(t => 
      t.category?.toLowerCase().includes('consulting') ||
      t.category?.toLowerCase().includes('advisory') ||
      t.category?.toLowerCase().includes('commission') ||
      t.description?.toLowerCase().includes('consulting') ||
      t.description?.toLowerCase().includes('advisory') ||
      t.description?.toLowerCase().includes('commission')
    );

    if (consultingTransactions.length > 0) {
      // Analyze consulting payment patterns
      const consultingVendors = consultingTransactions.reduce((vendors, transaction) => {
        const vendor = transaction.vendor;
        if (!vendors[vendor]) {
          vendors[vendor] = {
            payments: [],
            totalAmount: 0,
            percentageAmounts: []
          };
        }
        
        vendors[vendor].payments.push(transaction);
        vendors[vendor].totalAmount += Math.abs(transaction.amount);
        
        // Check for percentage-based amounts (common in kickbacks)
        const amount = Math.abs(transaction.amount);
        if (amount % 250 === 0 || amount % 500 === 0) {
          vendors[vendor].percentageAmounts.push(amount);
        }
        
        return vendors;
      }, {});

      Object.entries(consultingVendors).forEach(([vendor, data]) => {
        const kickbackFlags = [];
        
        // Flag 1: High percentage of round/percentage-based amounts
        if (data.percentageAmounts.length / data.payments.length > 0.7) {
          kickbackFlags.push('PERCENTAGE_BASED_PAYMENTS');
        }
        
        // Flag 2: Unusually high consulting fees relative to project value
        if (data.totalAmount > 100000 && data.payments.length < 10) {
          kickbackFlags.push('HIGH_VALUE_LOW_VOLUME');
        }
        
        // Flag 3: Payments immediately following large contracts
        const largeContracts = transactions.filter(t => 
          Math.abs(t.amount) > 500000 && 
          !consultingTransactions.includes(t)
        );
        
        data.payments.forEach(consultingPayment => {
          const paymentDate = moment(consultingPayment.date);
          const recentContracts = largeContracts.filter(contract => {
            const contractDate = moment(contract.date);
            const daysDiff = paymentDate.diff(contractDate, 'days');
            return daysDiff >= 0 && daysDiff <= 30;
          });
          
          if (recentContracts.length > 0) {
            kickbackFlags.push('PAYMENT_AFTER_CONTRACT');
          }
        });

        if (kickbackFlags.length >= 1) {
          data.payments.forEach(transaction => {
            anomalies.push({
              type: 'KICKBACK_SCHEME_PATTERN',
              transaction,
              severity: 'HIGH',
              pattern: 'SIEMENS_BRIBERY_PATTERN',
              details: {
                vendor: vendor,
                kickbackFlags: kickbackFlags,
                totalConsultingAmount: data.totalAmount,
                paymentCount: data.payments.length,
                percentagePayments: data.percentageAmounts.length,
                consultingRisk: 'Suspicious consulting payment pattern'
              },
              confidence: kickbackFlags.length * 30,
              description: `Potential kickback scheme: $${Math.abs(transaction.amount).toLocaleString()} to ${vendor}`
            });
          });
        }
      });
    }

    return anomalies;
  },

  // Micro-skimming / Salami-slicing detection (ultra-tiny fractional theft)
  // Detects systematic tiny transfers (down to a hundredth of a cent) and residue patterns
  detectMicroSkimming: async (transactions, profile, options = {}) => {
    const anomalies = [];
    const microThreshold = typeof options.microThreshold === 'number' ? options.microThreshold : 0.01; // $0.01 default
    const tinyThreshold = typeof options.tinyThreshold === 'number' ? options.tinyThreshold : 0.001; // $0.001 = tenth of a cent
    const ultraTinyThreshold = typeof options.ultraTinyThreshold === 'number' ? options.ultraTinyThreshold : 0.0001; // $0.0001 = hundredth of a cent
    const cumulativeThreshold = typeof options.cumulativeThreshold === 'number' ? options.cumulativeThreshold : 100; // $100 accumulated
    const minCount = typeof options.minCount === 'number' ? options.minCount : 50;
    const useIntegerMath = options.useIntegerMath || false; // Enhanced precision option

    // Group by beneficiary/vendor
    const vendorMicro = transactions.reduce((acc, t) => {
      const vendor = t.vendor || 'UNKNOWN';
      let amt;
      
      if (useIntegerMath) {
        // Convert to deci-milli-cents (10,000ths) for ultra-precise integer math
        amt = Math.abs(Math.round((Number(t.amount) || 0) * 10000)) / 10000;
      } else {
        amt = Math.abs(Number(t.amount) || 0);
      }
      
      if (!acc[vendor]) acc[vendor] = { count: 0, tinyCount: 0, ultraTinyCount: 0, sum: 0, transactions: [] };
      if (amt > 0 && amt <= microThreshold) {
        acc[vendor].count += 1;
        acc[vendor].sum += amt;
        acc[vendor].transactions.push(t);
        if (amt <= tinyThreshold) acc[vendor].tinyCount += 1;
        if (amt <= ultraTinyThreshold) acc[vendor].ultraTinyCount += 1;
      }
      return acc;
    }, {});

    Object.entries(vendorMicro).forEach(([vendor, data]) => {
      // Flag vendors that receive many micro-amounts with significant cumulative value
      const proportionTiny = data.count > 0 ? data.tinyCount / data.count : 0;
      const proportionUltraTiny = data.count > 0 ? data.ultraTinyCount / data.count : 0;
      
      // Enhanced detection for ultra-tiny amounts (hundredths of a cent)
      const isUltraTinyPattern = data.ultraTinyCount >= 10 && proportionUltraTiny > 0.3;
      const isTinyPattern = data.count >= minCount && proportionTiny > 0.5;
      const isCumulativePattern = data.sum >= cumulativeThreshold;
      
      if (isCumulativePattern || isTinyPattern || isUltraTinyPattern) {
        data.transactions.slice(-5).forEach(t => {
          let severityLevel = 'HIGH';
          let description = `Vendor ${vendor} receiving many small transactions totaling $${data.sum.toFixed(6)} (micro-skimming indicator)`;
          
          // Ultra-tiny amounts are especially suspicious
          if (isUltraTinyPattern) {
            severityLevel = 'CRITICAL';
            description = `Vendor ${vendor} receiving ultra-tiny amounts (≤$0.0001) in ${data.ultraTinyCount} transactions - sophisticated micro-skimming`;
          } else if (data.sum > (cumulativeThreshold * 10)) {
            severityLevel = 'CRITICAL';
          }
          
          anomalies.push({
            type: 'MICRO_SKIMMING',
            transaction: t,
            severity: severityLevel,
            details: {
              vendor,
              microTransactionCount: data.count,
              tinyTransactionCount: data.tinyCount,
              ultraTinyTransactionCount: data.ultraTinyCount,
              cumulativeMicroAmount: data.sum,
              microThreshold,
              tinyThreshold,
              ultraTinyThreshold,
              precisionMode: useIntegerMath ? 'DECI_MILLI_CENTS' : 'FLOATING_POINT',
              detectionLevel: isUltraTinyPattern ? 'HUNDREDTH_CENT' : isTinyPattern ? 'TENTH_CENT' : 'MICRO_TRANSACTION'
            },
            confidence: Math.min(98, 50 + (data.sum / (cumulativeThreshold || 1)) * 10 + (isUltraTinyPattern ? 20 : 0)),
            description
          });
        });
      }
    });

    // Global micro recipient analysis: find any vendor that appears unusually often as micro beneficiary
    const globalCandidates = Object.entries(vendorMicro).map(([v, d]) => ({ vendor: v, ...d })).filter(x => x.count > 0).sort((a, b) => b.sum - a.sum);
    if (globalCandidates.length > 0) {
      const top = globalCandidates[0];
      const hasUltraTinyPattern = top.ultraTinyCount >= 5;
      
      if (top.sum > cumulativeThreshold * 5 && top.count > 20) {
        anomalies.push({
          type: 'MICRO_SKIMMING_TOP_BENEFICIARY',
          transaction: top.transactions[0],
          severity: hasUltraTinyPattern ? 'CRITICAL' : 'HIGH',
          details: { 
            ...top, 
            precisionMode: useIntegerMath ? 'DECI_MILLI_CENTS' : 'FLOATING_POINT',
            detectionLevel: hasUltraTinyPattern ? 'HUNDREDTH_CENT' : 'MICRO_TRANSACTION'
          },
          confidence: hasUltraTinyPattern ? 99 : 98,
          description: `Top micro beneficiary ${top.vendor} received $${top.sum.toFixed(6)} across ${top.count} micro transactions${hasUltraTinyPattern ? ' (including ultra-tiny amounts)' : ''}`
        });
      }
    }

    return anomalies;
  },

  detectFractionalResiduePatterns: async (transactions, profile, options = {}) => {
    const anomalies = [];
    const minCount = typeof options.minCount === 'number' ? options.minCount : 30;
    const proportionThreshold = typeof options.proportionThreshold === 'number' ? options.proportionThreshold : 0.6;
    const useIntegerMath = options.useIntegerMath || false; // Enhanced precision option

    // Track both tenths and hundredths of cent residue frequency for ultra-precise detection
    const vendorResidues = {};
    const globalResidues = {};
    const vendorHundredthsResidues = {};
    const globalHundredthsResidues = {};

    transactions.forEach(t => {
      const vendor = t.vendor || 'UNKNOWN';
      let amt;
      let tenths;
      let hundredths;
      
      if (useIntegerMath) {
        // Use deci-milli-cents (10,000ths) for ultra-precise residue calculation
        const deciMilliCents = Math.round((Math.abs(Number(t.amount) || 0)) * 10000);
        amt = deciMilliCents / 10000;
        tenths = Math.floor(deciMilliCents / 10) % 10; // Tenths of cents
        hundredths = deciMilliCents % 100; // Hundredths of cents (0-99)
      } else {
        amt = Math.abs(Number(t.amount) || 0);
        tenths = Math.floor(amt * 1000) % 10; // 0..9 (0 means clean cent)
        hundredths = Math.floor(amt * 10000) % 100; // 0..99 (hundredths of cents)
      }
      
      // Track tenths patterns
      if (!vendorResidues[vendor]) vendorResidues[vendor] = { total: 0, residues: {}, transactions: [] };
      vendorResidues[vendor].total += 1;
      vendorResidues[vendor].residues[tenths] = (vendorResidues[vendor].residues[tenths] || 0) + 1;
      vendorResidues[vendor].transactions.push({ t, tenths, hundredths });
      globalResidues[tenths] = (globalResidues[tenths] || 0) + 1;
      
      // Track hundredths patterns
      if (!vendorHundredthsResidues[vendor]) vendorHundredthsResidues[vendor] = { total: 0, residues: {}, transactions: [] };
      vendorHundredthsResidues[vendor].total += 1;
      vendorHundredthsResidues[vendor].residues[hundredths] = (vendorHundredthsResidues[vendor].residues[hundredths] || 0) + 1;
      vendorHundredthsResidues[vendor].transactions.push({ t, hundredths });
      globalHundredthsResidues[hundredths] = (globalHundredthsResidues[hundredths] || 0) + 1;
    });

    // Analyze vendor hundredths residues for ultra-precise patterns
    Object.entries(vendorHundredthsResidues).forEach(([vendor, data]) => {
      const total = data.total;
      if (total < minCount) return; // need enough samples
      const sorted = Object.entries(data.residues).map(([k, v]) => ({ residue: Number(k), count: v })).sort((a, b) => b.count - a.count);
      const top = sorted[0];
      
      // Check for dominant hundredths pattern
      if (top && top.residue !== 0 && (top.count / total) >= (proportionThreshold * 0.8)) { // Slightly lower threshold for hundredths
        const sampleTx = data.transactions.slice(0, 3).map(x => x.t);
        anomalies.push({
          type: 'ULTRA_PRECISE_FRACTIONAL_RESIDUE_PATTERN',
          transaction: sampleTx[0],
          severity: 'CRITICAL',
          details: {
            vendor,
            dominantHundredthsResidue: top.residue,
            dominantResidueCount: top.count,
            totalTransactions: total,
            proportion: (top.count / total),
            precisionMode: useIntegerMath ? 'DECI_MILLI_CENTS' : 'FLOATING_POINT',
            detectionLevel: 'HUNDREDTH_CENT',
            residueDescription: `${(top.residue / 100).toFixed(4)} cent residue`
          },
          confidence: Math.min(99, 70 + (top.count / total) * 30),
          description: `Vendor ${vendor} has ultra-precise hundredths residue pattern ${(top.residue / 100).toFixed(4)}¢ in ${((top.count/total)*100).toFixed(1)}% of ${total} transactions (sophisticated micro-skimming)`
        });
      }
    });

    // Analyze vendor residues for systematic tenths patterns
    Object.entries(vendorResidues).forEach(([vendor, data]) => {
      const total = data.total;
      if (total < minCount) return; // need enough samples
      const sorted = Object.entries(data.residues).map(([k, v]) => ({ residue: Number(k), count: v })).sort((a, b) => b.count - a.count);
      const top = sorted[0];
      if (top && top.residue !== 0 && (top.count / total) >= proportionThreshold) {
        // Systematic tenths residue for this vendor
        const sampleTx = data.transactions.slice(0, 3).map(x => x.t);
        anomalies.push({
          type: 'FRACTIONAL_RESIDUE_PATTERN',
          transaction: sampleTx[0],
          severity: 'HIGH',
          details: {
            vendor,
            dominantResidue: top.residue,
            dominantResidueCount: top.count,
            totalTransactions: total,
            proportion: (top.count / total),
            precisionMode: useIntegerMath ? 'DECI_MILLI_CENTS' : 'FLOATING_POINT',
            detectionLevel: 'TENTH_CENT'
          },
          confidence: Math.min(95, 60 + (top.count / total) * 40),
          description: `Vendor ${vendor} has a dominant fractional-cent residue ${top.residue}/10 in ${((top.count/total)*100).toFixed(1)}% of ${total} transactions (possible salami slicing)`
        });
      }
    });

    // Global hundredths residue anomalies: ultra-precise global pattern detection
    const globalHundredthsTotal = Object.values(globalHundredthsResidues).reduce((s, v) => s + v, 0);
    const globalHundredthsSorted = Object.entries(globalHundredthsResidues).map(([k, v]) => ({ residue: Number(k), count: v })).sort((a, b) => b.count - a.count);
    const globalHundredthsTop = globalHundredthsSorted[0];
    
    if (globalHundredthsTop && globalHundredthsTop.residue !== 0 && (globalHundredthsTop.count / globalHundredthsTotal) > 0.25 && globalHundredthsTotal > 100) {
      anomalies.push({
        type: 'GLOBAL_ULTRA_PRECISE_RESIDUE_DOMINANCE',
        transaction: transactions.find(t => {
          const amt = Math.abs(Number(t.amount) || 0);
          const residue = useIntegerMath ? 
            Math.round(amt * 10000) % 100 : 
            Math.floor(amt * 10000) % 100;
          return residue === globalHundredthsTop.residue;
        }),
        severity: 'CRITICAL',
        details: {
          dominantHundredthsResidue: globalHundredthsTop.residue,
          proportion: (globalHundredthsTop.count / globalHundredthsTotal),
          globalTotal: globalHundredthsTotal,
          precisionMode: useIntegerMath ? 'DECI_MILLI_CENTS' : 'FLOATING_POINT',
          detectionLevel: 'HUNDREDTH_CENT',
          residueDescription: `${(globalHundredthsTop.residue / 100).toFixed(4)} cent residue`
        },
        confidence: 99,
        description: `Global ultra-precise hundredths residue pattern ${(globalHundredthsTop.residue / 100).toFixed(4)}¢ in ${(globalHundredthsTop.count/globalHundredthsTotal*100).toFixed(1)}% of ${globalHundredthsTotal} transactions (sophisticated systematic embezzlement)`
      });
    }

    // Global tenths residue anomalies: if a non-zero residue dominates overall
    const globalTotal = Object.values(globalResidues).reduce((s, v) => s + v, 0);
    const globalSorted = Object.entries(globalResidues).map(([k, v]) => ({ residue: Number(k), count: v })).sort((a, b) => b.count - a.count);
    const globalTop = globalSorted[0];
    if (globalTop && globalTop.residue !== 0 && (globalTop.count / globalTotal) > 0.5 && globalTotal > 200) {
      anomalies.push({
        type: 'GLOBAL_FRACTIONAL_RESIDUE_DOMINANCE',
        transaction: transactions.find(t => {
          const amt = Math.abs(Number(t.amount) || 0);
          const residue = useIntegerMath ? 
            Math.round(amt * 1000) % 10 : 
            Math.floor(amt * 1000) % 10;
          return residue === globalTop.residue;
        }),
        severity: 'CRITICAL',
        details: {
          dominantResidue: globalTop.residue,
          proportion: (globalTop.count / globalTotal),
          globalTotal,
          precisionMode: useIntegerMath ? 'DECI_MILLI_CENTS' : 'FLOATING_POINT',
          detectionLevel: 'TENTH_CENT'
        },
        confidence: 99,
        description: `Global dominant fractional-cent residue ${globalTop.residue}/10 in ${(globalTop.count/globalTotal*100).toFixed(1)}% of ${globalTotal} transactions`
      });
    }

    return anomalies;
  },

  // String similarity calculation for vendor name analysis
  calculateStringSimilarity: (str1, str2) => {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = EnhancedAnomalyDetectionUtils.calculateEditDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  },

  // Levenshtein distance calculation
  calculateEditDistance: (str1, str2) => {
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
  },

  // Utility functions for statistical calculations
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
  },

  // ===== FINANCIAL RECORDS & BANK STATEMENT ANALYSIS =====
  // Comprehensive financial document parsing and fraud detection

  // Enhanced financial records analyzer with bank statement support
  analyzeFinancialRecords: async (financialData, options = {}) => {
    // Require authentication for analysis
    if (!EnhancedAnomalyDetectionUtils.authMiddleware.getCurrentUser()) {
      throw new Error('Authentication required. Please provide a valid license key to access fraud detection services.');
    }

    // Check permissions
    if (!EnhancedAnomalyDetectionUtils.authMiddleware.hasPermission('run_fraud_analysis')) {
      throw new Error('Permission denied. User does not have fraud analysis permissions.');
    }

    const {
      includeStatements = true,
      includeLedgers = true,
      includeReconciliation = true,
      fraudThresholds = {},
      analysisDepth = 'comprehensive'
    } = options;

    const currentUser = EnhancedAnomalyDetectionUtils.authMiddleware.getCurrentUser();
    console.log(`📊 Starting comprehensive financial records analysis for ${currentUser.companyName}...`);
    console.log(`👤 Analysis performed by: ${currentUser.userEmail} (${currentUser.role})`);
    console.log(`💳 Account scope: ${currentUser.assignedAccount}`);
    
    const analysis = {
      recordsAnalyzed: 0,
      fraudIndicators: [],
      anomalies: [],
      riskScore: 0,
      recommendations: [],
      detectionSummary: {},
      // Add audit information
      auditInfo: {
        analyzedBy: currentUser.userEmail,
        companyName: currentUser.companyName,
        assignedAccount: currentUser.assignedAccount,
        analysisTimestamp: new Date().toISOString(),
        licenseKey: currentUser.licenseKey.substring(0, 12) + '...',
        userRole: currentUser.role
      }
    };

    try {
      // Parse and categorize financial records
      const parsedRecords = await EnhancedAnomalyDetectionUtils.parseFinancialRecords(financialData);
      analysis.recordsAnalyzed = parsedRecords.totalRecords;

      // Analyze bank statements for fraud patterns
      if (includeStatements && parsedRecords.bankStatements.length > 0) {
        const statementAnalysis = await EnhancedAnomalyDetectionUtils.analyzeBankStatements(
          parsedRecords.bankStatements, 
          fraudThresholds
        );
        analysis.fraudIndicators.push(...statementAnalysis.fraudIndicators);
        analysis.anomalies.push(...statementAnalysis.anomalies);
      }

      // Analyze general ledger entries
      if (includeLedgers && parsedRecords.ledgerEntries.length > 0) {
        const ledgerAnalysis = await EnhancedAnomalyDetectionUtils.analyzeLedgerEntries(
          parsedRecords.ledgerEntries,
          fraudThresholds
        );
        analysis.fraudIndicators.push(...ledgerAnalysis.fraudIndicators);
        analysis.anomalies.push(...ledgerAnalysis.anomalies);
      }

      // Perform cross-reference analysis
      if (includeReconciliation) {
        const reconciliationAnalysis = await EnhancedAnomalyDetectionUtils.performReconciliationAnalysis(
          parsedRecords,
          fraudThresholds
        );
        analysis.fraudIndicators.push(...reconciliationAnalysis.fraudIndicators);
        analysis.anomalies.push(...reconciliationAnalysis.anomalies);
      }

      // Advanced AI Analysis Integration
      console.log('🤖 Initiating advanced AI fraud analysis...');
      
      // Run Advanced Fraud AI analysis
      const aiAnalysis = await EnhancedAnomalyDetectionUtils.fraudAI.analyzeFraudWithAI(
        parsedRecords.transactions || [],
        {
          enableLearning: true,
          confidenceThreshold: 0.8,
          realTimeMode: false
        }
      );
      
      // Integrate AI results
      analysis.aiAnalysis = aiAnalysis;
      analysis.fraudIndicators.push(...aiAnalysis.aiPredictions
        .filter(pred => pred.riskLevel === 'CRITICAL' || pred.riskLevel === 'HIGH')
        .map(pred => ({
          type: `AI_DETECTED_${pred.riskLevel}`,
          confidence: pred.confidence,
          amount: pred.features[0] * 1000, // Denormalize amount
          description: pred.reasoning.join(', '),
          source: 'Advanced_Fraud_AI',
          aiPrediction: pred
        }))
      );

      // Run Oxul AI problem-solving analysis
      const problemDescription = `Analyze ${analysis.recordsAnalyzed} financial records for potential fraud, embezzlement, and anomalies. Focus on micro-skimming detection and pattern recognition.`;
      const oxulAnalysis = await EnhancedAnomalyDetectionUtils.oxulAI.solveProblem(
        problemDescription,
        {
          dataType: 'financial_records',
          recordCount: analysis.recordsAnalyzed,
          existingIndicators: analysis.fraudIndicators.length,
          userRole: currentUser.role,
          companyName: currentUser.companyName
        }
      );

      // Integrate Oxul AI insights
      analysis.oxulAnalysis = oxulAnalysis;
      if (oxulAnalysis.solutions && oxulAnalysis.solutions.length > 0) {
        analysis.recommendations.push(...oxulAnalysis.solutions.map(solution => 
          `Oxul AI Recommendation: ${solution.description} (Confidence: ${(solution.confidence * 100).toFixed(1)}%)`
        ));
      }

      // Calculate overall risk score
      analysis.riskScore = EnhancedAnomalyDetectionUtils.calculateFinancialRiskScore(analysis);
      analysis.recommendations = EnhancedAnomalyDetectionUtils.generateFinancialRecommendations(analysis);

      console.log(`📈 Financial analysis complete: ${analysis.fraudIndicators.length} fraud indicators detected`);
      return analysis;

    } catch (error) {
      console.error('❌ Financial records analysis error:', error);
      return { ...analysis, error: error.message };
    }
  },

  // Parse various financial record formats
  parseFinancialRecords: async (financialData) => {
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
          const categorized = EnhancedAnomalyDetectionUtils.categorizeFinancialRecord(record);
          parsedRecords[categorized.type].push(categorized.data);
          parsedRecords.totalRecords++;
        });
      } else if (typeof financialData === 'object') {
        // Structured object with different record types
        Object.entries(financialData).forEach(([key, records]) => {
          if (Array.isArray(records)) {
            records.forEach(record => {
              const categorized = EnhancedAnomalyDetectionUtils.categorizeFinancialRecord(record, key);
              parsedRecords[categorized.type].push(categorized.data);
              parsedRecords.totalRecords++;
            });
          }
        });
      } else if (typeof financialData === 'string') {
        // Parse CSV or text format
        const parsedFromText = await EnhancedAnomalyDetectionUtils.parseTextualFinancialData(financialData);
        Object.assign(parsedRecords, parsedFromText);
      }

      return parsedRecords;
    } catch (error) {
      console.error('Error parsing financial records:', error);
      throw new Error(`Financial record parsing failed: ${error.message}`);
    }
  },

  // Categorize financial records by type
  categorizeFinancialRecord: (record, hint = null) => {
    // Determine record type based on structure and content
    const recordKeys = Object.keys(record);
    
    // Bank statement indicators
    if (recordKeys.includes('balance') || recordKeys.includes('runningBalance') || 
        recordKeys.includes('accountNumber') || hint === 'bankStatements') {
      return {
        type: 'bankStatements',
        data: EnhancedAnomalyDetectionUtils.normalizeBankStatementEntry(record)
      };
    }
    
    // Ledger entry indicators
    if (recordKeys.includes('debit') || recordKeys.includes('credit') || 
        recordKeys.includes('account') || hint === 'ledgerEntries') {
      return {
        type: 'ledgerEntries',
        data: EnhancedAnomalyDetectionUtils.normalizeLedgerEntry(record)
      };
    }
    
    // Credit card statement indicators
    if (recordKeys.includes('cardNumber') || recordKeys.includes('merchant') || 
        hint === 'creditCardStatements') {
      return {
        type: 'creditCardStatements',
        data: EnhancedAnomalyDetectionUtils.normalizeCreditCardEntry(record)
      };
    }
    
    // Invoice indicators
    if (recordKeys.includes('invoiceNumber') || recordKeys.includes('billTo') || 
        hint === 'invoices') {
      return {
        type: 'invoices',
        data: EnhancedAnomalyDetectionUtils.normalizeInvoiceEntry(record)
      };
    }
    
    // Default to bank statement if uncertain
    return {
      type: 'bankStatements',
      data: EnhancedAnomalyDetectionUtils.normalizeBankStatementEntry(record)
    };
  },

  // Normalize bank statement entries to standard format
  normalizeBankStatementEntry: (entry) => {
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
  },

  // Normalize ledger entries
  normalizeLedgerEntry: (entry) => {
    return {
      id: entry.id || entry.entryId || Math.random().toString(36),
      date: entry.date || entry.entryDate,
      account: entry.account || entry.accountName || entry.accountCode,
      description: entry.description || entry.memo || entry.reference,
      debit: parseFloat(entry.debit || 0),
      credit: parseFloat(entry.credit || 0),
      amount: parseFloat(entry.amount || Math.abs(entry.debit || 0) || Math.abs(entry.credit || 0)),
      reference: entry.reference || entry.refNumber || entry.documentNumber,
      journalId: entry.journalId || entry.batchId,
      originalRecord: entry
    };
  },

  // Normalize credit card entries
  normalizeCreditCardEntry: (entry) => {
    return {
      id: entry.id || entry.transactionId || Math.random().toString(36),
      date: entry.date || entry.transactionDate,
      merchant: entry.merchant || entry.vendor || entry.description,
      amount: parseFloat(entry.amount || 0),
      category: entry.category || entry.merchantCategory,
      cardNumber: entry.cardNumber || entry.lastFour,
      authorizationCode: entry.authorizationCode || entry.authCode,
      originalRecord: entry
    };
  },

  // Normalize invoice entries
  normalizeInvoiceEntry: (entry) => {
    return {
      id: entry.id || entry.invoiceId || entry.invoiceNumber,
      date: entry.date || entry.invoiceDate || entry.issueDate,
      vendor: entry.vendor || entry.supplier || entry.billFrom,
      amount: parseFloat(entry.amount || entry.totalAmount || entry.invoiceTotal || 0),
      description: entry.description || entry.serviceDescription,
      dueDate: entry.dueDate || entry.paymentDue,
      status: entry.status || entry.paymentStatus || 'UNKNOWN',
      originalRecord: entry
    };
  },

  // Comprehensive bank statement fraud analysis
  analyzeBankStatements: async (statements, fraudThresholds = {}) => {
    const analysis = {
      fraudIndicators: [],
      anomalies: [],
      patterns: {},
      riskLevel: 'LOW'
    };

    const thresholds = {
      largeTransactionMultiplier: 5.0,
      roundAmountThreshold: 0.7, // 70% round amounts is suspicious
      duplicateTransactionWindow: 24, // hours
      velocityThreshold: 10, // transactions per hour
      afterHoursThreshold: 0.2, // 20% after hours is suspicious
      weekendThreshold: 0.15, // 15% weekend transactions is suspicious
      ...fraudThresholds
    };

    try {
      // Sort statements by date
      const sortedStatements = statements.sort((a, b) => new Date(a.date) - new Date(b.date));

      // 1. Detect large/unusual transactions
      const largeTransactionIndicators = EnhancedAnomalyDetectionUtils.detectLargeTransactions(
        sortedStatements, 
        thresholds.largeTransactionMultiplier
      );
      analysis.fraudIndicators.push(...largeTransactionIndicators);

      // 2. Analyze transaction timing patterns
      const timingIndicators = EnhancedAnomalyDetectionUtils.analyzeTransactionTiming(
        sortedStatements, 
        thresholds
      );
      analysis.fraudIndicators.push(...timingIndicators);

      // 3. Detect duplicate or near-duplicate transactions
      const duplicateIndicators = EnhancedAnomalyDetectionUtils.detectDuplicateTransactions(
        sortedStatements,
        thresholds.duplicateTransactionWindow
      );
      analysis.fraudIndicators.push(...duplicateIndicators);

      // 4. Analyze round amount patterns
      const roundAmountIndicators = EnhancedAnomalyDetectionUtils.analyzeRoundAmountPatterns(
        sortedStatements,
        thresholds.roundAmountThreshold
      );
      analysis.fraudIndicators.push(...roundAmountIndicators);

      // 5. Detect velocity anomalies
      const velocityIndicators = EnhancedAnomalyDetectionUtils.detectVelocityAnomalies(
        sortedStatements,
        thresholds.velocityThreshold
      );
      analysis.fraudIndicators.push(...velocityIndicators);

      // 6. Analyze balance discrepancies
      const balanceIndicators = EnhancedAnomalyDetectionUtils.analyzeBalanceDiscrepancies(
        sortedStatements
      );
      analysis.fraudIndicators.push(...balanceIndicators);

      // 7. Detect check fraud patterns
      const checkFraudIndicators = EnhancedAnomalyDetectionUtils.detectCheckFraudPatterns(
        sortedStatements
      );
      analysis.fraudIndicators.push(...checkFraudIndicators);

      // 8. Micro-skimming analysis on bank statements
      const microSkimmingIndicators = await EnhancedAnomalyDetectionUtils.detectMicroSkimming(
        sortedStatements, 
        {}, 
        { 
          ultraTinyThreshold: 0.0001, 
          useIntegerMath: true,
          cumulativeThreshold: 1.0 
        }
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
  },

  // Detect large or statistically unusual transactions
  detectLargeTransactions: (statements, multiplier = 5.0) => {
    const indicators = [];
    
    if (statements.length < 10) return indicators; // Need sufficient data
    
    const amounts = statements.map(s => Math.abs(s.amount)).filter(a => a > 0);
    const mean = amounts.reduce((sum, amt) => sum + amt, 0) / amounts.length;
    const stdDev = Math.sqrt(amounts.reduce((sum, amt) => sum + Math.pow(amt - mean, 2), 0) / amounts.length);
    
    const threshold = mean + (multiplier * stdDev);
    
    statements.forEach(statement => {
      const amount = Math.abs(statement.amount);
      if (amount > threshold && amount > 1000) { // Minimum $1000 for large transaction
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
  },

  // Analyze transaction timing for fraud patterns
  analyzeTransactionTiming: (statements, thresholds) => {
    const indicators = [];
    
    let afterHoursCount = 0;
    let weekendCount = 0;
    const hourlyDistribution = {};
    
    statements.forEach(statement => {
      const transactionDate = moment(statement.date);
      const hour = transactionDate.hour();
      const dayOfWeek = transactionDate.day();
      
      // Count after-hours transactions (before 6 AM or after 10 PM)
      if (hour < 6 || hour > 22) {
        afterHoursCount++;
      }
      
      // Count weekend transactions
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        weekendCount++;
      }
      
      // Track hourly distribution
      hourlyDistribution[hour] = (hourlyDistribution[hour] || 0) + 1;
    });
    
    const afterHoursRatio = afterHoursCount / statements.length;
    const weekendRatio = weekendCount / statements.length;
    
    // Flag excessive after-hours activity
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
    
    // Flag excessive weekend activity
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
  },

  // Detect duplicate or near-duplicate transactions
  detectDuplicateTransactions: (statements, windowHours = 24) => {
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
        // Check if duplicates occur within suspicious timeframe
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
  },

  // Analyze patterns in round amount transactions
  analyzeRoundAmountPatterns: (statements, threshold = 0.7) => {
    const indicators = [];
    
    let roundAmountCount = 0;
    const roundAmounts = [];
    
    statements.forEach(statement => {
      const amount = Math.abs(statement.amount);
      
      // Check for round amounts (divisible by 10, 25, 50, 100, etc.)
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
  },

  // Detect transaction velocity anomalies
  detectVelocityAnomalies: (statements, thresholdPerHour = 10) => {
    const indicators = [];
    
    // Group transactions by hour
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
  },

  // Analyze balance discrepancies
  analyzeBalanceDiscrepancies: (statements) => {
    const indicators = [];
    
    let previousBalance = null;
    
    statements.forEach((statement, index) => {
      if (previousBalance !== null && statement.balance !== undefined) {
        const expectedBalance = previousBalance + statement.amount;
        const actualBalance = statement.balance;
        const discrepancy = Math.abs(expectedBalance - actualBalance);
        
        // Allow for small rounding differences
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
  },

  // Detect check fraud patterns
  detectCheckFraudPatterns: (statements) => {
    const indicators = [];
    
    const checkTransactions = statements.filter(s => s.checkNumber);
    
    if (checkTransactions.length > 0) {
      // Analyze check number sequences
      const checkNumbers = checkTransactions
        .map(s => parseInt(s.checkNumber))
        .filter(n => !isNaN(n))
        .sort((a, b) => a - b);
      
      // Look for large gaps in check numbers
      for (let i = 1; i < checkNumbers.length; i++) {
        const gap = checkNumbers[i] - checkNumbers[i-1];
        if (gap > 50) { // Suspicious gap
          indicators.push({
            type: 'CHECK_NUMBER_GAP_ANOMALY',
            severity: gap > 200 ? 'HIGH' : 'MEDIUM',
            details: {
              previousCheck: checkNumbers[i-1],
              currentCheck: checkNumbers[i],
              gap: gap
            },
            confidence: gap > 100 ? 80 : 60,
            description: `Large gap in check numbers: ${checkNumbers[i-1]} to ${checkNumbers[i]} (gap: ${gap})`
          });
        }
      }
      
      // Look for duplicate check numbers
      const checkNumberCounts = {};
      checkTransactions.forEach(transaction => {
        const checkNum = transaction.checkNumber;
        checkNumberCounts[checkNum] = (checkNumberCounts[checkNum] || 0) + 1;
      });
      
      Object.entries(checkNumberCounts).forEach(([checkNum, count]) => {
        if (count > 1) {
          indicators.push({
            type: 'DUPLICATE_CHECK_NUMBER',
            severity: 'CRITICAL',
            details: {
              checkNumber: checkNum,
              occurrences: count,
              transactions: checkTransactions.filter(t => t.checkNumber === checkNum)
            },
            confidence: 95,
            description: `Duplicate check number detected: Check #${checkNum} appears ${count} times`
          });
        }
      });
    }
    
    return indicators;
  },

  // Analyze general ledger entries for fraud
  analyzeLedgerEntries: async (ledgerEntries, fraudThresholds = {}) => {
    const analysis = {
      fraudIndicators: [],
      anomalies: [],
      patterns: {},
      riskLevel: 'LOW'
    };

    try {
      // 1. Detect journal entry manipulation
      const journalIndicators = EnhancedAnomalyDetectionUtils.detectJournalManipulation(ledgerEntries);
      analysis.fraudIndicators.push(...journalIndicators);

      // 2. Analyze account balance anomalies
      const balanceIndicators = EnhancedAnomalyDetectionUtils.analyzeLedgerBalanceAnomalies(ledgerEntries);
      analysis.fraudIndicators.push(...balanceIndicators);

      // 3. Detect unusual posting patterns
      const postingIndicators = EnhancedAnomalyDetectionUtils.detectUnusualPostingPatterns(ledgerEntries);
      analysis.fraudIndicators.push(...postingIndicators);

      // 4. Round amount analysis on ledger
      const roundIndicators = EnhancedAnomalyDetectionUtils.analyzeRoundAmountPatterns(ledgerEntries);
      analysis.fraudIndicators.push(...roundIndicators);

      return analysis;

    } catch (error) {
      console.error('Ledger analysis error:', error);
      return { ...analysis, error: error.message };
    }
  },

  // Detect journal entry manipulation patterns
  detectJournalManipulation: (ledgerEntries) => {
    const indicators = [];
    
    // Group by journal ID
    const journalGroups = {};
    ledgerEntries.forEach(entry => {
      const journalId = entry.journalId || 'UNKNOWN';
      if (!journalGroups[journalId]) {
        journalGroups[journalId] = [];
      }
      journalGroups[journalId].push(entry);
    });

    Object.entries(journalGroups).forEach(([journalId, entries]) => {
      // Check for unbalanced journal entries
      const totalDebits = entries.reduce((sum, entry) => sum + (entry.debit || 0), 0);
      const totalCredits = entries.reduce((sum, entry) => sum + (entry.credit || 0), 0);
      const imbalance = Math.abs(totalDebits - totalCredits);

      if (imbalance > 0.01) { // Allow for small rounding
        indicators.push({
          type: 'UNBALANCED_JOURNAL_ENTRY',
          severity: imbalance > 1000 ? 'CRITICAL' : imbalance > 100 ? 'HIGH' : 'MEDIUM',
          details: {
            journalId: journalId,
            totalDebits: totalDebits.toFixed(2),
            totalCredits: totalCredits.toFixed(2),
            imbalance: imbalance.toFixed(2),
            entryCount: entries.length
          },
          confidence: 90,
          description: `Unbalanced journal entry ${journalId}: Debits $${totalDebits.toFixed(2)} vs Credits $${totalCredits.toFixed(2)} (imbalance: $${imbalance.toFixed(2)})`
        });
      }
    });

    return indicators;
  },

  // Perform cross-reference reconciliation analysis
  performReconciliationAnalysis: async (parsedRecords, fraudThresholds = {}) => {
    const analysis = {
      fraudIndicators: [],
      anomalies: [],
      reconciliationGaps: []
    };

    try {
      // Cross-reference bank statements with ledger entries
      if (parsedRecords.bankStatements.length > 0 && parsedRecords.ledgerEntries.length > 0) {
        const crossRefIndicators = EnhancedAnomalyDetectionUtils.crossReferenceBankAndLedger(
          parsedRecords.bankStatements,
          parsedRecords.ledgerEntries
        );
        analysis.fraudIndicators.push(...crossRefIndicators);
      }

      // Look for missing sequences
      const sequenceIndicators = EnhancedAnomalyDetectionUtils.detectMissingSequences(parsedRecords);
      analysis.fraudIndicators.push(...sequenceIndicators);

      return analysis;

    } catch (error) {
      console.error('Reconciliation analysis error:', error);
      return { ...analysis, error: error.message };
    }
  },

  // Cross-reference bank statements with ledger entries
  crossReferenceBankAndLedger: (bankStatements, ledgerEntries) => {
    const indicators = [];
    
    // Create a tolerance window for matching (e.g., +/- 2 days)
    const toleranceDays = 2;
    
    const unmatchedBankTransactions = [];
    const unmatchedLedgerEntries = [];
    
    bankStatements.forEach(bankTx => {
      const bankAmount = Math.abs(bankTx.amount);
      const bankDate = moment(bankTx.date);
      
      // Try to find matching ledger entry
      const potentialMatches = ledgerEntries.filter(ledgerEntry => {
        const ledgerAmount = Math.abs(ledgerEntry.amount);
        const ledgerDate = moment(ledgerEntry.date);
        const daysDiff = Math.abs(bankDate.diff(ledgerDate, 'days'));
        
        return Math.abs(bankAmount - ledgerAmount) < 0.01 && daysDiff <= toleranceDays;
      });
      
      if (potentialMatches.length === 0 && bankAmount > 100) { // Only flag significant amounts
        unmatchedBankTransactions.push(bankTx);
      }
    });
    
    // Flag unmatched transactions as potential fraud
    unmatchedBankTransactions.forEach(tx => {
      indicators.push({
        type: 'UNMATCHED_BANK_TRANSACTION',
        severity: Math.abs(tx.amount) > 10000 ? 'CRITICAL' : Math.abs(tx.amount) > 1000 ? 'HIGH' : 'MEDIUM',
        transaction: tx,
        details: {
          amount: tx.amount,
          description: tx.description,
          account: tx.account
        },
        confidence: 70,
        description: `Bank transaction not found in ledger: $${Math.abs(tx.amount).toFixed(2)} - ${tx.description}`
      });
    });
    
    return indicators;
  },

  // Calculate financial risk score
  calculateFinancialRiskScore: (analysis) => {
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
  },

  // Generate financial investigation recommendations
  generateFinancialRecommendations: (analysis) => {
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
    
    if (analysis.fraudIndicators.some(i => i.type.includes('BALANCE'))) {
      recommendations.push({
        priority: 'high',
        action: 'Reconcile Account Balances',
        description: 'Balance discrepancies detected. Perform detailed reconciliation analysis.'
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
  },

  // Parse textual financial data (CSV, etc.)
  parseTextualFinancialData: async (textData) => {
    // Implementation for parsing CSV and other text formats
    // This would include CSV parsing logic for bank statements
    const parsedRecords = {
      bankStatements: [],
      ledgerEntries: [],
      checkRegister: [],
      creditCardStatements: [],
      invoices: [],
      receipts: [],
      totalRecords: 0
    };
    
    // Basic CSV parsing logic would go here
    // For now, return empty structure
    return parsedRecords;
  },

  // ===== REAL-TIME FRAUD MONITORING INTEGRATION =====
  // Enhanced integration with real-time notification system

  // Real-time fraud monitoring with instant notifications
  startRealTimeFraudMonitoring: async (options = {}) => {
    const {
      notificationChannels = ['console', 'email', 'sms'],
      monitoringInterval = 5000,
      alertThresholds = {},
      dataSource = null
    } = options;

    console.log('🚀 Starting real-time fraud monitoring with instant notifications...');

    // Dynamic import to avoid circular dependencies
    try {
      const { default: FraudAlertNotificationService } = await import('../services/FraudAlertNotificationService.js');
      
      const alertService = new FraudAlertNotificationService({
        enableEmailAlerts: notificationChannels.includes('email'),
        enableSMSAlerts: notificationChannels.includes('sms'),
        enableDesktopNotifications: notificationChannels.includes('desktop'),
        enableWebhookAlerts: notificationChannels.includes('webhook'),
        monitoringInterval,
        ...alertThresholds
      });

      // Start monitoring
      alertService.startRealTimeMonitoring(dataSource);

      console.log('✅ Real-time fraud monitoring started with notifications enabled');
      console.log(`📊 Monitoring interval: ${monitoringInterval}ms`);
      console.log(`📱 Active channels: ${notificationChannels.join(', ')}`);

      return alertService;

    } catch (error) {
      console.error('❌ Failed to start real-time monitoring:', error);
      throw error;
    }
  },

  // Enhanced fraud detection with immediate notification capability
  detectFraudWithNotifications: async (transactions, options = {}) => {
    const {
      enableNotifications = true,
      notificationService = null,
      alertThresholds = {
        criticalThreshold: 85,
        highThreshold: 65,
        mediumThreshold: 35
      }
    } = options;

    console.log(`🔍 Analyzing ${transactions.length} transactions for fraud with notification support...`);

    try {
      // Perform comprehensive fraud detection
      const fraudAnalysis = await EnhancedAnomalyDetectionUtils.analyzeBankStatements(
        transactions,
        alertThresholds
      );

      // Process notifications if enabled
      if (enableNotifications && notificationService && fraudAnalysis.fraudIndicators.length > 0) {
        await EnhancedAnomalyDetectionUtils.processRealtimeNotifications(
          fraudAnalysis.fraudIndicators,
          transactions,
          notificationService
        );
      }

      return fraudAnalysis;

    } catch (error) {
      console.error('❌ Fraud detection with notifications error:', error);
      throw error;
    }
  },

  // Process real-time notifications for detected fraud
  processRealtimeNotifications: async (fraudIndicators, transactions, notificationService) => {
    console.log(`🚨 Processing ${fraudIndicators.length} fraud indicators for real-time notifications...`);

    for (const indicator of fraudIndicators) {
      try {
        // Calculate notification priority
        const notificationPriority = EnhancedAnomalyDetectionUtils.calculateNotificationPriority(indicator);
        
        // Create structured notification data
        const notificationData = {
          type: 'FRAUD_DETECTION_ALERT',
          subType: indicator.type,
          severity: indicator.severity,
          priority: notificationPriority,
          timestamp: new Date().toISOString(),
          confidence: indicator.confidence,
          description: indicator.description,
          
          // Detailed fraud information
          fraudDetails: {
            indicator: indicator,
            affectedTransactions: indicator.transactions || [indicator.transaction].filter(t => t),
            detectionMethod: 'ENHANCED_ANOMALY_DETECTION',
            riskScore: EnhancedAnomalyDetectionUtils.calculateDetailedRiskScore(indicator),
            
            // Financial impact assessment
            financialImpact: EnhancedAnomalyDetectionUtils.assessFinancialImpact(indicator),
            
            // Recommended immediate actions
            immediateActions: EnhancedAnomalyDetectionUtils.generateImmediateActions(indicator)
          },
          
          // Context information
          contextData: {
            totalTransactionsAnalyzed: transactions.length,
            detectionTimestamp: new Date().toISOString(),
            analysisMethod: 'REAL_TIME_MONITORING'
          }
        };

        // Send notification through service
        if (typeof notificationService.createFraudAlert === 'function') {
          await notificationService.createFraudAlert(notificationData);
        } else {
          console.warn('⚠️  Notification service does not support createFraudAlert method');
        }

        console.log(`📨 Notification sent for ${indicator.type} (${indicator.severity})`);

      } catch (error) {
        console.error(`❌ Failed to send notification for indicator ${indicator.type}:`, error);
      }
    }
  },

  // Calculate notification priority based on fraud indicator
  calculateNotificationPriority: (indicator) => {
    let priority = 'MEDIUM';

    // Base priority on severity
    switch (indicator.severity) {
      case 'CRITICAL':
        priority = 'CRITICAL';
        break;
      case 'HIGH':
        priority = 'HIGH';
        break;
      case 'MEDIUM':
        priority = 'MEDIUM';
        break;
      case 'LOW':
        priority = 'LOW';
        break;
    }

    // Elevate priority for specific fraud types
    if (indicator.type.includes('MICRO_SKIMMING')) {
      priority = priority === 'LOW' ? 'MEDIUM' : priority;
    }

    if (indicator.type.includes('DUPLICATE') && indicator.confidence > 90) {
      priority = 'HIGH';
    }

    if (indicator.type.includes('BALANCE_DISCREPANCY') && indicator.details?.discrepancy > 1000) {
      priority = 'CRITICAL';
    }

    return priority;
  },

  // Calculate detailed risk score for notifications
  calculateDetailedRiskScore: (indicator) => {
    let riskScore = indicator.confidence || 50;

    // Adjust based on fraud type severity
    const fraudTypeMultipliers = {
      'MICRO_SKIMMING': 1.3,
      'DUPLICATE_TRANSACTION': 1.2,
      'BALANCE_DISCREPANCY': 1.4,
      'AFTER_HOURS_ACTIVITY': 1.1,
      'VELOCITY_ANOMALY': 1.25,
      'LARGE_TRANSACTION': 1.15,
      'ROUND_AMOUNT_PATTERN': 1.1
    };

    Object.entries(fraudTypeMultipliers).forEach(([fraudType, multiplier]) => {
      if (indicator.type.includes(fraudType)) {
        riskScore *= multiplier;
      }
    });

    // Adjust based on financial amount
    if (indicator.transaction) {
      const amount = Math.abs(indicator.transaction.amount);
      if (amount > 10000) riskScore += 10;
      else if (amount > 1000) riskScore += 5;
      else if (amount < 0.1) riskScore += 15; // Micro amounts are highly suspicious
    }

    return Math.min(100, Math.round(riskScore));
  },

  // Assess financial impact of fraud indicator
  assessFinancialImpact: (indicator) => {
    const impact = {
      directLoss: 0,
      potentialLoss: 0,
      impactLevel: 'LOW',
      currency: 'USD'
    };

    if (indicator.transaction) {
      impact.directLoss = Math.abs(indicator.transaction.amount);
    }

    if (indicator.transactions && indicator.transactions.length > 0) {
      impact.directLoss = indicator.transactions.reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
    }

    // Estimate potential loss based on fraud type
    if (indicator.type.includes('MICRO_SKIMMING')) {
      // Micro-skimming can accumulate significant amounts over time
      impact.potentialLoss = impact.directLoss * 100; // Estimate 100x if not caught
    } else if (indicator.type.includes('DUPLICATE')) {
      impact.potentialLoss = impact.directLoss * 2; // Duplicate fraud continuation
    } else {
      impact.potentialLoss = impact.directLoss * 1.5; // General fraud escalation
    }

    // Determine impact level
    if (impact.directLoss > 10000 || impact.potentialLoss > 50000) {
      impact.impactLevel = 'CRITICAL';
    } else if (impact.directLoss > 1000 || impact.potentialLoss > 10000) {
      impact.impactLevel = 'HIGH';
    } else if (impact.directLoss > 100 || impact.potentialLoss > 1000) {
      impact.impactLevel = 'MEDIUM';
    }

    return impact;
  },

  // Generate immediate actions for fraud response
  generateImmediateActions: (indicator) => {
    const actions = [];

    // General actions for all fraud types
    actions.push('Document this alert with timestamp and details');
    actions.push('Preserve all related transaction records');

    // Specific actions based on fraud type
    if (indicator.type.includes('MICRO_SKIMMING')) {
      actions.push('IMMEDIATE: Block all transactions from the identified vendor');
      actions.push('URGENT: Review all transactions from this vendor in past 90 days');
      actions.push('CRITICAL: Contact vendor to investigate billing discrepancies');
      actions.push('FORENSIC: Analyze transaction patterns for systematic theft');
    }

    if (indicator.type.includes('DUPLICATE')) {
      actions.push('IMMEDIATE: Verify if duplicate payment was authorized');
      actions.push('URGENT: Contact recipient to confirm transaction legitimacy');
      actions.push('PREVENT: Implement duplicate payment controls');
    }

    if (indicator.type.includes('BALANCE_DISCREPANCY')) {
      actions.push('CRITICAL: Perform immediate account reconciliation');
      actions.push('URGENT: Verify all recent transactions and balances');
      actions.push('INVESTIGATE: Check for unauthorized access or manipulation');
    }

    if (indicator.type.includes('AFTER_HOURS')) {
      actions.push('IMMEDIATE: Verify employee authorization for after-hours access');
      actions.push('SECURITY: Review access logs and security footage');
      actions.push('POLICY: Enforce after-hours transaction approval requirements');
    }

    if (indicator.type.includes('VELOCITY')) {
      actions.push('IMMEDIATE: Review rapid transaction sequence for authorization');
      actions.push('TECHNICAL: Check for system compromise or automated attacks');
      actions.push('CONTROL: Implement transaction velocity limits');
    }

    if (indicator.type.includes('LARGE_TRANSACTION')) {
      actions.push('IMMEDIATE: Verify large transaction authorization chain');
      actions.push('COMPLIANCE: Ensure proper approval documentation exists');
      actions.push('AUDIT: Review approval workflow compliance');
    }

    // Add escalation actions for high-risk indicators
    if (indicator.severity === 'CRITICAL') {
      actions.unshift('ESCALATE: Notify senior management immediately');
      actions.unshift('FREEZE: Consider temporarily freezing related accounts');
    }

    return actions;
  },

  // Create fraud monitoring configuration for real-time system
  createMonitoringConfiguration: (customConfig = {}) => {
    const defaultConfig = {
      // Real-time monitoring settings
      enableRealTimeMonitoring: true,
      monitoringInterval: 5000, // 5 seconds
      batchSize: 50,
      
      // Notification settings
      enableInstantNotifications: true,
      notificationChannels: ['console', 'email', 'desktop'],
      
      // Alert thresholds
      criticalThreshold: 85,
      highThreshold: 65,
      mediumThreshold: 35,
      
      // Fraud detection thresholds
      fraudThresholds: {
        microSkimmingThreshold: 0.1, // $0.10
        duplicateWindowHours: 24,
        velocityThreshold: 10,
        afterHoursThreshold: 0.15,
        balanceDiscrepancyThreshold: 10.0
      },
      
      // Escalation settings
      enableEscalation: true,
      escalationTimeoutMinutes: 5,
      escalationContacts: ['fraud-team@company.com'],
      
      // Audit and logging
      enableAuditLogging: true,
      auditLogPath: './fraud_monitoring_audit.log',
      retentionDays: 90
    };

    return { ...defaultConfig, ...customConfig };
  }
};

export default EnhancedAnomalyDetectionUtils;