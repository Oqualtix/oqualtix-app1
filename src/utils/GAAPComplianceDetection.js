/**
 * GAAP Compliance and Accounting Standards Detection
 * Monitors transactions for GAAP violations and accounting irregularities
 */

export class GAAPComplianceDetection {
  
  // GAAP compliance categories and thresholds
  static get GAAP_STANDARDS() {
    return {
      REVENUE_RECOGNITION: {
        name: 'Revenue Recognition (ASC 606)',
        patterns: ['premature_revenue', 'channel_stuffing', 'round_trip_sales'],
        thresholds: { suspicious_timing: 5, amount_variance: 0.15 }
      },
      EXPENSE_MATCHING: {
      name: 'Expense Matching Principle',
      patterns: ['expense_shifting', 'cost_capitalization', 'accrual_manipulation'],
      thresholds: { period_shift: 30, capitalization_ratio: 0.20 }
    },
    INVENTORY_VALUATION: {
      name: 'Inventory Valuation (ASC 330)',
      patterns: ['phantom_inventory', 'valuation_manipulation', 'obsolete_inventory'],
      thresholds: { valuation_variance: 0.10, turnover_ratio: 4.0 }
    },
    ASSET_IMPAIRMENT: {
      name: 'Asset Impairment (ASC 350)',
      patterns: ['delayed_impairment', 'goodwill_manipulation', 'asset_overvaluation'],
      thresholds: { impairment_delay: 90, fair_value_variance: 0.25 }
    },
    RELATED_PARTY: {
      name: 'Related Party Transactions (ASC 850)',
      patterns: ['undisclosed_related_party', 'non_arms_length', 'transfer_pricing'],
      thresholds: { materiality: 50000, disclosure_required: 25000 }
    },
    LEASE_ACCOUNTING: {
      name: 'Lease Accounting (ASC 842)',
      patterns: ['lease_classification', 'off_balance_sheet', 'sale_leaseback'],
      thresholds: { lease_term: 12, present_value_threshold: 0.90 }
    }
    };
  }

  // Reporting thresholds and materiality levels
  static get MATERIALITY_THRESHOLDS() {
    return {
      PUBLIC_COMPANY: {
      quantitative: 0.05, // 5% of net income
      qualitative_factors: ['management_compensation', 'debt_covenants', 'analyst_expectations']
    },
    PRIVATE_COMPANY: {
      quantitative: 0.10, // 10% of net income
      qualitative_factors: ['loan_agreements', 'tax_implications', 'stakeholder_decisions']
    },
    SMALL_BUSINESS: {
      quantitative: 0.15, // 15% of net income
      qualitative_factors: ['cash_flow', 'operational_decisions', 'credit_agreements']
    }
    };
  }

  /**
   * Analyze transaction for GAAP compliance violations
   */
  static analyzeGAAPCompliance(transaction, historicalTransactions = [], companyProfile = {}) {
    const violations = [];
    const amount = Math.abs(transaction.amount);
    
    // Determine company type and materiality threshold
    const companyType = companyProfile.type || 'PRIVATE_COMPANY';
    const materialityLevel = this.calculateMaterialityLevel(amount, companyProfile);

    // 1. Revenue Recognition Analysis
    const revenueAnalysis = this.analyzeRevenueRecognition(transaction, historicalTransactions);
    if (revenueAnalysis.violations.length > 0) {
      violations.push(...revenueAnalysis.violations);
    }

    // 2. Expense Matching Analysis
    const expenseAnalysis = this.analyzeExpenseMatching(transaction, historicalTransactions);
    if (expenseAnalysis.violations.length > 0) {
      violations.push(...expenseAnalysis.violations);
    }

    // 3. Related Party Transaction Analysis
    const relatedPartyAnalysis = this.analyzeRelatedPartyTransactions(transaction, historicalTransactions);
    if (relatedPartyAnalysis.violations.length > 0) {
      violations.push(...relatedPartyAnalysis.violations);
    }

    // 4. Period-End Manipulation Detection
    const periodEndAnalysis = this.analyzePeriodEndManipulation(transaction, historicalTransactions);
    if (periodEndAnalysis.violations.length > 0) {
      violations.push(...periodEndAnalysis.violations);
    }

    // 5. Asset and Liability Recognition
    const assetLiabilityAnalysis = this.analyzeAssetLiabilityRecognition(transaction);
    if (assetLiabilityAnalysis.violations.length > 0) {
      violations.push(...assetLiabilityAnalysis.violations);
    }

    // Calculate GAAP compliance score
    const gaapRiskScore = this.calculateGAAPRiskScore(violations, materialityLevel);

    return {
      violations,
      gaapRiskScore,
      materialityLevel,
      complianceLevel: this.getComplianceLevel(gaapRiskScore),
      requiresAuditReview: gaapRiskScore >= 70 || materialityLevel === 'HIGH',
      applicableStandards: this.getApplicableStandards(violations),
      analysisTimestamp: new Date().toISOString()
    };
  }

  /**
   * Analyze revenue recognition compliance (ASC 606)
   */
  static analyzeRevenueRecognition(transaction, historicalTransactions) {
    const violations = [];
    const amount = Math.abs(transaction.amount);

    // Check for premature revenue recognition
    if (transaction.type === 'credit' && amount > 10000) {
      const endOfPeriod = this.isEndOfReportingPeriod(transaction.date);
      if (endOfPeriod.isEndOfPeriod && endOfPeriod.daysFromEnd <= 3) {
        violations.push({
          type: 'Potential Premature Revenue Recognition',
          standard: 'ASC 606',
          severity: 'HIGH',
          score: 85,
          details: `Large revenue transaction (${amount.toLocaleString()}) recorded ${endOfPeriod.daysFromEnd} days before period end`,
          pattern: 'premature_revenue',
          recommendation: 'Review performance obligations and transfer of control'
        });
      }
    }

    // Channel stuffing detection
    const recentRevenue = historicalTransactions
      .filter(t => t.type === 'credit' && Math.abs(t.amount) > 5000)
      .slice(0, 10);
    
    if (recentRevenue.length >= 5) {
      const avgAmount = recentRevenue.reduce((sum, t) => sum + Math.abs(t.amount), 0) / recentRevenue.length;
      if (amount > avgAmount * 2) {
        violations.push({
          type: 'Potential Channel Stuffing',
          standard: 'ASC 606',
          severity: 'MEDIUM',
          score: 75,
          details: `Revenue spike: ${amount.toLocaleString()} vs average ${avgAmount.toLocaleString()}`,
          pattern: 'channel_stuffing',
          recommendation: 'Verify legitimate business purpose and customer demand'
        });
      }
    }

    return { violations };
  }

  /**
   * Analyze expense matching principle compliance
   */
  static analyzeExpenseMatching(transaction, historicalTransactions) {
    const violations = [];
    const amount = Math.abs(transaction.amount);

    // Expense shifting detection
    if (transaction.type === 'debit' && amount > 5000) {
      const periodInfo = this.isEndOfReportingPeriod(transaction.date);
      
      // Check for expenses being pushed to next period
      if (periodInfo.isNearPeriodEnd && periodInfo.daysFromEnd <= 7) {
        const similarExpenses = historicalTransactions.filter(t => 
          t.merchant === transaction.merchant && 
          Math.abs(t.amount) > amount * 0.5 &&
          this.getDaysDifference(new Date(t.date), new Date(transaction.date)) <= 30
        );

        if (similarExpenses.length === 0) {
          violations.push({
            type: 'Potential Expense Timing Manipulation',
            standard: 'Matching Principle',
            severity: 'MEDIUM',
            score: 70,
            details: `Unusual expense timing: ${transaction.description} near period end`,
            pattern: 'expense_shifting',
            recommendation: 'Ensure expenses are recorded in proper accounting period'
          });
        }
      }
    }

    // Cost capitalization analysis
    if (transaction.description.toLowerCase().includes('software') || 
        transaction.description.toLowerCase().includes('development') ||
        transaction.description.toLowerCase().includes('research')) {
      
      if (amount > 25000) {
        violations.push({
          type: 'Potential Improper Cost Capitalization',
          standard: 'ASC 350-40',
          severity: 'HIGH',
          score: 80,
          details: `Large R&D/software expense: ${transaction.description} (${amount.toLocaleString()})`,
          pattern: 'cost_capitalization',
          recommendation: 'Review capitalization criteria and useful life assessment'
        });
      }
    }

    return { violations };
  }

  /**
   * Analyze related party transactions (ASC 850)
   */
  static analyzeRelatedPartyTransactions(transaction, historicalTransactions) {
    const violations = [];
    const amount = Math.abs(transaction.amount);

    // Related party indicators
    const relatedPartyIndicators = [
      'management', 'executive', 'director', 'officer', 'family',
      'subsidiary', 'affiliate', 'holding', 'parent company',
      'related entity', 'associated company'
    ];

    const merchantLower = transaction.merchant.toLowerCase();
    const descriptionLower = transaction.description.toLowerCase();
    
    const hasRelatedPartyIndicator = relatedPartyIndicators.some(indicator =>
      merchantLower.includes(indicator) || descriptionLower.includes(indicator)
    );

    if (hasRelatedPartyIndicator && amount > 25000) {
      violations.push({
        type: 'Potential Undisclosed Related Party Transaction',
        standard: 'ASC 850',
        severity: 'HIGH',
        score: 88,
        details: `Significant transaction with potential related party: ${transaction.merchant}`,
        pattern: 'undisclosed_related_party',
        recommendation: 'Verify relationship and ensure proper disclosure'
      });
    }

    // Non-arms length transaction detection
    const similarTransactions = historicalTransactions.filter(t =>
      t.merchant === transaction.merchant &&
      Math.abs(t.amount) > 1000
    );

    if (similarTransactions.length >= 3) {
      const amounts = similarTransactions.map(t => Math.abs(t.amount));
      const avgAmount = amounts.reduce((a, b) => a + b, 0) / amounts.length;
      
      if (amount > avgAmount * 3) {
        violations.push({
          type: 'Potential Non-Arms Length Transaction',
          standard: 'ASC 850',
          severity: 'MEDIUM',
          score: 75,
          details: `Unusually large transaction with frequent counterparty`,
          pattern: 'non_arms_length',
          recommendation: 'Review transaction terms for fair market value'
        });
      }
    }

    return { violations };
  }

  /**
   * Analyze period-end manipulation patterns
   */
  static analyzePeriodEndManipulation(transaction, historicalTransactions) {
    const violations = [];
    const amount = Math.abs(transaction.amount);
    const periodInfo = this.isEndOfReportingPeriod(transaction.date);

    if (periodInfo.isEndOfPeriod && amount > 10000) {
      // Check for unusual period-end activity
      const periodEndTransactions = historicalTransactions.filter(t => {
        const tPeriodInfo = this.isEndOfReportingPeriod(t.date);
        return tPeriodInfo.isEndOfPeriod && Math.abs(t.amount) > 5000;
      });

      if (periodEndTransactions.length >= 5) {
        violations.push({
          type: 'Period-End Manipulation Pattern',
          standard: 'General GAAP Principle',
          severity: 'HIGH',
          score: 85,
          details: `Concentration of large transactions at period end`,
          pattern: 'period_end_stuffing',
          recommendation: 'Review business rationale for period-end concentration'
        });
      }
    }

    return { violations };
  }

  /**
   * Analyze asset and liability recognition
   */
  static analyzeAssetLiabilityRecognition(transaction) {
    const violations = [];
    const amount = Math.abs(transaction.amount);

    // Asset recognition analysis
    if (transaction.description.toLowerCase().includes('asset') ||
        transaction.description.toLowerCase().includes('equipment') ||
        transaction.description.toLowerCase().includes('property')) {
      
      if (amount > 50000) {
        violations.push({
          type: 'Significant Asset Transaction',
          standard: 'ASC 360',
          severity: 'MEDIUM',
          score: 65,
          details: `Large asset-related transaction requiring review`,
          pattern: 'asset_recognition',
          recommendation: 'Verify proper asset classification and useful life'
        });
      }
    }

    return { violations };
  }

  /**
   * Calculate materiality level based on transaction amount and company profile
   */
  static calculateMaterialityLevel(amount, companyProfile) {
    const annualRevenue = companyProfile.annualRevenue || 1000000;
    const netIncome = companyProfile.netIncome || annualRevenue * 0.10;
    
    const revenuePercentage = amount / annualRevenue;
    const incomePercentage = amount / Math.abs(netIncome);

    if (revenuePercentage > 0.05 || incomePercentage > 0.10) {
      return 'HIGH';
    } else if (revenuePercentage > 0.01 || incomePercentage > 0.05) {
      return 'MEDIUM';
    } else {
      return 'LOW';
    }
  }

  /**
   * Calculate GAAP risk score
   */
  static calculateGAAPRiskScore(violations, materialityLevel) {
    if (violations.length === 0) return 0;

    const baseScore = violations.reduce((sum, v) => sum + v.score, 0) / violations.length;
    const materialityMultiplier = materialityLevel === 'HIGH' ? 1.3 : 
                                 materialityLevel === 'MEDIUM' ? 1.1 : 1.0;
    
    return Math.min(100, Math.round(baseScore * materialityMultiplier));
  }

  /**
   * Get compliance level based on risk score
   */
  static getComplianceLevel(riskScore) {
    if (riskScore >= 85) return 'NON_COMPLIANT';
    if (riskScore >= 70) return 'HIGH_RISK';
    if (riskScore >= 50) return 'MEDIUM_RISK';
    if (riskScore >= 30) return 'LOW_RISK';
    return 'COMPLIANT';
  }

  /**
   * Get applicable GAAP standards for violations
   */
  static getApplicableStandards(violations) {
    const standards = new Set();
    violations.forEach(v => standards.add(v.standard));
    return Array.from(standards);
  }

  /**
   * Check if date is near end of reporting period
   */
  static isEndOfReportingPeriod(dateString) {
    const date = new Date(dateString);
    const month = date.getMonth();
    const day = date.getDate();
    
    // Check for quarter ends (Mar, Jun, Sep, Dec)
    const isQuarterEnd = (month === 2 || month === 5 || month === 8 || month === 11);
    
    // Check for year end (December)
    const isYearEnd = month === 11;
    
    // Get last day of month
    const lastDay = new Date(date.getFullYear(), month + 1, 0).getDate();
    const daysFromEnd = lastDay - day;
    
    return {
      isEndOfPeriod: daysFromEnd <= 5,
      isNearPeriodEnd: daysFromEnd <= 10,
      isQuarterEnd,
      isYearEnd,
      daysFromEnd
    };
  }

  /**
   * Calculate days difference between two dates
   */
  static getDaysDifference(date1, date2) {
    const timeDiff = Math.abs(date2.getTime() - date1.getTime());
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  }

  /**
   * Generate GAAP compliance summary
   */
  static generateGAAPSummary(transactions) {
    const gaapAnalyses = transactions
      .map(t => t.gaapAnalysis)
      .filter(Boolean);

    const totalViolations = gaapAnalyses.reduce((sum, a) => sum + a.violations.length, 0);
    const highRiskTransactions = gaapAnalyses.filter(a => a.gaapRiskScore >= 70).length;
    
    const violationsByStandard = {};
    gaapAnalyses.forEach(analysis => {
      analysis.violations.forEach(violation => {
        violationsByStandard[violation.standard] = (violationsByStandard[violation.standard] || 0) + 1;
      });
    });

    const complianceRate = gaapAnalyses.length > 0 ? 
      ((gaapAnalyses.filter(a => a.complianceLevel === 'COMPLIANT').length / gaapAnalyses.length) * 100).toFixed(1) : 100;

    return {
      totalTransactionsAnalyzed: gaapAnalyses.length,
      totalViolations,
      highRiskTransactions,
      complianceRate: parseFloat(complianceRate),
      violationsByStandard: Object.entries(violationsByStandard)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5),
      overallRisk: highRiskTransactions > gaapAnalyses.length * 0.2 ? 'HIGH' : 
                   highRiskTransactions > gaapAnalyses.length * 0.1 ? 'MEDIUM' : 'LOW',
      lastAnalysis: new Date().toISOString()
    };
  }
}

export default GAAPComplianceDetection;