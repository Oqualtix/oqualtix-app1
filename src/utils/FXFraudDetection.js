/**
 * Advanced Foreign Exchange Fraud Detection
 * Detects sophisticated FX rate manipulation and exchange-related fraud
 */

export class FXFraudDetection {
  
  // Common FX rate manipulation patterns
  static FX_FRAUD_PATTERNS = {
    RATE_ARBITRAGE: 'favorable_rate_timing',
    RATE_MANIPULATION: 'artificial_rate_adjustment',
    CURRENCY_LAYERING: 'multiple_currency_conversion',
    FX_STRUCTURING: 'split_fx_transactions',
    ROUND_TRIP_FX: 'buy_sell_same_currency',
    OFF_MARKET_RATES: 'rates_outside_market_range',
    HIGH_FREQUENCY_FX: 'rapid_fx_transactions',
    WEEKEND_FX: 'weekend_rate_exploitation'
  };

  /**
   * Real-time FX rate monitoring and fraud detection
   */
  static analyzeFXTransaction(transaction, fxRateData, historicalFXTransactions = []) {
    const anomalies = [];
    const amount = Math.abs(transaction.amount);
    
    // Check if this is an FX transaction
    if (!this.isFXTransaction(transaction)) {
      return { anomalies: [], fxRiskScore: 0, isFXTransaction: false };
    }

    const fxDetails = this.extractFXDetails(transaction);
    
    // 1. Rate Arbitrage Detection
    const arbitrageAnalysis = this.detectRateArbitrage(transaction, fxRateData, historicalFXTransactions);
    if (arbitrageAnalysis.suspicious) {
      anomalies.push({
        type: 'FX Rate Arbitrage',
        severity: 'HIGH',
        score: 85,
        details: `Suspicious timing: ${arbitrageAnalysis.details}`,
        pattern: this.FX_FRAUD_PATTERNS.RATE_ARBITRAGE,
        fxData: arbitrageAnalysis.data
      });
    }

    // 2. Off-Market Rate Detection
    const marketRateAnalysis = this.detectOffMarketRates(transaction, fxRateData);
    if (marketRateAnalysis.suspicious) {
      anomalies.push({
        type: 'Off-Market FX Rate',
        severity: 'CRITICAL',
        score: 95,
        details: `Rate ${marketRateAnalysis.variance}% outside market range`,
        pattern: this.FX_FRAUD_PATTERNS.OFF_MARKET_RATES,
        marketRate: marketRateAnalysis.marketRate,
        transactionRate: marketRateAnalysis.transactionRate
      });
    }

    // 3. Currency Layering Detection
    const layeringAnalysis = this.detectCurrencyLayering(transaction, historicalFXTransactions);
    if (layeringAnalysis.suspicious) {
      anomalies.push({
        type: 'Currency Layering',
        severity: 'HIGH',
        score: 88,
        details: `${layeringAnalysis.conversionCount} currency conversions in ${layeringAnalysis.timeWindow} hours`,
        pattern: this.FX_FRAUD_PATTERNS.CURRENCY_LAYERING,
        conversionChain: layeringAnalysis.chain
      });
    }

    // 4. FX Structuring Detection
    const structuringAnalysis = this.detectFXStructuring(transaction, historicalFXTransactions);
    if (structuringAnalysis.suspicious) {
      anomalies.push({
        type: 'FX Transaction Structuring',
        severity: 'HIGH',
        score: 82,
        details: `${structuringAnalysis.count} similar FX transactions totaling ${structuringAnalysis.total}`,
        pattern: this.FX_FRAUD_PATTERNS.FX_STRUCTURING,
        relatedTransactions: structuringAnalysis.transactions
      });
    }

    // 5. Round-Trip FX Detection
    const roundTripAnalysis = this.detectRoundTripFX(transaction, historicalFXTransactions);
    if (roundTripAnalysis.suspicious) {
      anomalies.push({
        type: 'Round-Trip FX Manipulation',
        severity: 'CRITICAL',
        score: 92,
        details: `Buy/sell same currency pair within ${roundTripAnalysis.timeGap} hours`,
        pattern: this.FX_FRAUD_PATTERNS.ROUND_TRIP_FX,
        profit: roundTripAnalysis.estimatedProfit
      });
    }

    // 6. Weekend/Holiday FX Exploitation
    const weekendAnalysis = this.detectWeekendFXExploitation(transaction);
    if (weekendAnalysis.suspicious) {
      anomalies.push({
        type: 'Weekend FX Rate Exploitation',
        severity: 'MEDIUM',
        score: 70,
        details: `FX transaction during low-liquidity period`,
        pattern: this.FX_FRAUD_PATTERNS.WEEKEND_FX,
        timing: weekendAnalysis.timing
      });
    }

    // 7. High-Frequency FX Pattern
    const frequencyAnalysis = this.detectHighFrequencyFX(transaction, historicalFXTransactions);
    if (frequencyAnalysis.suspicious) {
      anomalies.push({
        type: 'High-Frequency FX Trading',
        severity: 'MEDIUM',
        score: 75,
        details: `${frequencyAnalysis.frequency} FX transactions in ${frequencyAnalysis.period}`,
        pattern: this.FX_FRAUD_PATTERNS.HIGH_FREQUENCY_FX,
        frequency: frequencyAnalysis.frequency
      });
    }

    // Calculate overall FX risk score
    const maxScore = anomalies.length > 0 ? Math.max(...anomalies.map(a => a.score)) : 0;
    const avgScore = anomalies.length > 0 ? anomalies.reduce((sum, a) => sum + a.score, 0) / anomalies.length : 0;
    const fxRiskScore = Math.round(maxScore * 0.7 + avgScore * 0.3);

    return {
      anomalies,
      fxRiskScore,
      isFXTransaction: true,
      fxDetails,
      requiresFXReview: fxRiskScore >= 70,
      analysisTimestamp: new Date().toISOString()
    };
  }

  /**
   * Detect if transaction involves foreign exchange
   */
  static isFXTransaction(transaction) {
    const fxIndicators = [
      'foreign exchange', 'fx', 'currency exchange', 'international',
      'wire transfer', 'swift', 'forex', 'currency conversion',
      'cross-border', 'overseas', 'international transfer'
    ];
    
    const description = transaction.description.toLowerCase();
    const merchant = transaction.merchant.toLowerCase();
    
    return fxIndicators.some(indicator => 
      description.includes(indicator) || merchant.includes(indicator)
    ) || transaction.category === 'International' || 
       transaction.category === 'Foreign Exchange';
  }

  /**
   * Extract FX details from transaction
   */
  static extractFXDetails(transaction) {
    // Simulate FX details extraction
    const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY'];
    const fromCurrency = currencies[Math.floor(Math.random() * currencies.length)];
    const toCurrency = currencies[Math.floor(Math.random() * currencies.length)];
    
    return {
      fromCurrency,
      toCurrency,
      amount: Math.abs(transaction.amount),
      estimatedRate: (Math.random() * 2 + 0.5).toFixed(4),
      timestamp: transaction.date,
      transactionId: transaction.id
    };
  }

  /**
   * Detect rate arbitrage - timing transactions for favorable rates
   */
  static detectRateArbitrage(transaction, fxRateData, historicalTransactions) {
    const recentFXTransactions = historicalTransactions
      .filter(t => this.isFXTransaction(t))
      .slice(0, 10);

    if (recentFXTransactions.length < 3) {
      return { suspicious: false };
    }

    // Check if transaction timing correlates with favorable rates
    const transactionHour = new Date(transaction.date).getHours();
    const isOffHours = transactionHour < 6 || transactionHour > 18;
    
    // Simulate rate variance analysis
    const rateVariance = Math.random() * 0.15; // 0-15% variance
    const favorableWindow = rateVariance > 0.08; // >8% favorable rate
    
    if (isOffHours && favorableWindow) {
      return {
        suspicious: true,
        details: `Transaction at ${transactionHour}:00 during ${rateVariance.toFixed(2)}% favorable rate window`,
        data: {
          timing: transactionHour,
          rateAdvantage: rateVariance,
          marketCondition: 'low_liquidity'
        }
      };
    }

    return { suspicious: false };
  }

  /**
   * Detect rates that are significantly off from market rates
   */
  static detectOffMarketRates(transaction, fxRateData) {
    // Simulate market rate comparison
    const marketRate = 1.0850; // Example EUR/USD rate
    const transactionRate = 1.1200; // Example transaction rate
    const variance = Math.abs((transactionRate - marketRate) / marketRate) * 100;
    
    if (variance > 5) { // >5% variance from market rate
      return {
        suspicious: true,
        variance: variance.toFixed(2),
        marketRate,
        transactionRate,
        suspicionLevel: variance > 10 ? 'CRITICAL' : 'HIGH'
      };
    }

    return { suspicious: false };
  }

  /**
   * Detect currency layering - multiple conversions to obscure money trail
   */
  static detectCurrencyLayering(transaction, historicalTransactions) {
    const last24Hours = historicalTransactions.filter(t => {
      const hoursDiff = (new Date(transaction.date) - new Date(t.date)) / (1000 * 60 * 60);
      return hoursDiff <= 24 && this.isFXTransaction(t);
    });

    if (last24Hours.length >= 4) {
      const currencies = new Set();
      last24Hours.forEach(t => {
        const details = this.extractFXDetails(t);
        currencies.add(details.fromCurrency);
        currencies.add(details.toCurrency);
      });

      if (currencies.size >= 5) { // 5+ currencies in 24 hours
        return {
          suspicious: true,
          conversionCount: last24Hours.length,
          timeWindow: 24,
          chain: Array.from(currencies)
        };
      }
    }

    return { suspicious: false };
  }

  /**
   * Detect FX structuring - breaking large FX transactions into smaller ones
   */
  static detectFXStructuring(transaction, historicalTransactions) {
    const amount = Math.abs(transaction.amount);
    const last7Days = historicalTransactions.filter(t => {
      const daysDiff = (new Date(transaction.date) - new Date(t.date)) / (1000 * 60 * 60 * 24);
      return daysDiff <= 7 && this.isFXTransaction(t) && Math.abs(t.amount) > 5000;
    });

    // Look for similar amounts within reporting thresholds
    const similarTransactions = last7Days.filter(t => {
      const diff = Math.abs(Math.abs(t.amount) - amount);
      return diff < amount * 0.1; // Within 10% of current transaction
    });

    if (similarTransactions.length >= 3) {
      const total = similarTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0) + amount;
      return {
        suspicious: true,
        count: similarTransactions.length + 1,
        total: total.toFixed(2),
        transactions: similarTransactions.map(t => ({ id: t.id, amount: t.amount }))
      };
    }

    return { suspicious: false };
  }

  /**
   * Detect round-trip FX transactions (buy then sell same currency)
   */
  static detectRoundTripFX(transaction, historicalTransactions) {
    const fxDetails = this.extractFXDetails(transaction);
    const last72Hours = historicalTransactions.filter(t => {
      const hoursDiff = (new Date(transaction.date) - new Date(t.date)) / (1000 * 60 * 60);
      return hoursDiff <= 72 && this.isFXTransaction(t);
    });

    // Look for opposite currency transactions
    const oppositeTransactions = last72Hours.filter(t => {
      const tDetails = this.extractFXDetails(t);
      return (tDetails.fromCurrency === fxDetails.toCurrency && 
              tDetails.toCurrency === fxDetails.fromCurrency) ||
             (tDetails.fromCurrency === fxDetails.fromCurrency && 
              tDetails.toCurrency === fxDetails.toCurrency && 
              Math.sign(t.amount) !== Math.sign(transaction.amount));
    });

    if (oppositeTransactions.length > 0) {
      const timeGap = Math.min(...oppositeTransactions.map(t => {
        return Math.abs(new Date(transaction.date) - new Date(t.date)) / (1000 * 60 * 60);
      }));

      if (timeGap <= 48) { // Within 48 hours
        const estimatedProfit = Math.random() * 1000 + 100; // Simulate profit calculation
        return {
          suspicious: true,
          timeGap: timeGap.toFixed(1),
          estimatedProfit: estimatedProfit.toFixed(2)
        };
      }
    }

    return { suspicious: false };
  }

  /**
   * Detect weekend/holiday FX exploitation
   */
  static detectWeekendFXExploitation(transaction) {
    const date = new Date(transaction.date);
    const day = date.getDay();
    const hour = date.getHours();
    
    // Weekend detection
    const isWeekend = day === 0 || day === 6;
    
    // Friday evening or Sunday evening (low liquidity periods)
    const isLowLiquidity = (day === 5 && hour >= 17) || (day === 0 && hour <= 17);
    
    if (isWeekend || isLowLiquidity) {
      return {
        suspicious: true,
        timing: isWeekend ? 'weekend' : 'low_liquidity_period'
      };
    }

    return { suspicious: false };
  }

  /**
   * Detect high-frequency FX trading patterns
   */
  static detectHighFrequencyFX(transaction, historicalTransactions) {
    const last1Hour = historicalTransactions.filter(t => {
      const minutesDiff = (new Date(transaction.date) - new Date(t.date)) / (1000 * 60);
      return minutesDiff <= 60 && this.isFXTransaction(t);
    });

    if (last1Hour.length >= 5) { // 5+ FX transactions in 1 hour
      return {
        suspicious: true,
        frequency: last1Hour.length + 1,
        period: '1 hour'
      };
    }

    const last1Day = historicalTransactions.filter(t => {
      const hoursDiff = (new Date(transaction.date) - new Date(t.date)) / (1000 * 60 * 60);
      return hoursDiff <= 24 && this.isFXTransaction(t);
    });

    if (last1Day.length >= 20) { // 20+ FX transactions in 1 day
      return {
        suspicious: true,
        frequency: last1Day.length + 1,
        period: '24 hours'
      };
    }

    return { suspicious: false };
  }

  /**
   * Generate comprehensive FX fraud summary
   */
  static generateFXFraudSummary(fxTransactions) {
    const totalFXTransactions = fxTransactions.length;
    const suspiciousFXTransactions = fxTransactions.filter(t => 
      t.fraudAnalysis && t.fraudAnalysis.fxRiskScore >= 70
    ).length;

    const fxPatterns = {};
    fxTransactions.forEach(t => {
      if (t.fraudAnalysis && t.fraudAnalysis.anomalies) {
        t.fraudAnalysis.anomalies.forEach(anomaly => {
          if (anomaly.pattern && Object.values(this.FX_FRAUD_PATTERNS).includes(anomaly.pattern)) {
            fxPatterns[anomaly.pattern] = (fxPatterns[anomaly.pattern] || 0) + 1;
          }
        });
      }
    });

    const currencies = new Set();
    fxTransactions.forEach(t => {
      if (t.fraudAnalysis && t.fraudAnalysis.fxDetails) {
        currencies.add(t.fraudAnalysis.fxDetails.fromCurrency);
        currencies.add(t.fraudAnalysis.fxDetails.toCurrency);
      }
    });

    return {
      totalFXTransactions,
      suspiciousFXTransactions,
      fxFraudRate: totalFXTransactions > 0 ? 
        ((suspiciousFXTransactions / totalFXTransactions) * 100).toFixed(1) : 0,
      detectedPatterns: Object.entries(fxPatterns)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5),
      currenciesInvolved: Array.from(currencies),
      riskLevel: suspiciousFXTransactions > totalFXTransactions * 0.3 ? 'HIGH' : 
                 suspiciousFXTransactions > totalFXTransactions * 0.1 ? 'MEDIUM' : 'LOW',
      lastAnalysis: new Date().toISOString()
    };
  }

  /**
   * Get real-time FX market data (mock implementation)
   */
  static getFXMarketData() {
    // Mock FX rates - in production would connect to real FX API
    return {
      'USD/EUR': { rate: 0.8500, timestamp: new Date().toISOString() },
      'USD/GBP': { rate: 0.7800, timestamp: new Date().toISOString() },
      'USD/JPY': { rate: 110.50, timestamp: new Date().toISOString() },
      'USD/CAD': { rate: 1.2500, timestamp: new Date().toISOString() },
      'USD/AUD': { rate: 1.3500, timestamp: new Date().toISOString() },
      'USD/CHF': { rate: 0.9200, timestamp: new Date().toISOString() },
      'EUR/GBP': { rate: 0.9200, timestamp: new Date().toISOString() },
      'EUR/JPY': { rate: 130.00, timestamp: new Date().toISOString() }
    };
  }
}

export default FXFraudDetection;