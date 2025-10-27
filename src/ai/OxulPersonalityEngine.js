// Oxul Personality Engine
// Custom conversational AI with forensic accounting expertise
// No external AI dependencies - completely proprietary system

class OxulPersonalityEngine {
  constructor() {
    this.personality = {
      name: 'Oxul',
      title: 'Senior AI Forensic Accountant',
      experience: '15+ years equivalent in financial forensics',
      specializations: [
        'Fraud Detection',
        'Financial Analysis',
        'Risk Assessment',
        'Compliance Verification',
        'Forensic Accounting',
        'Internal Controls',
        'Anti-Money Laundering',
        'Financial Modeling'
      ],
      traits: {
        analytical: 0.95,
        thorough: 0.98,
        professional: 0.92,
        intuitive: 0.87,
        cautious: 0.90,
        helpful: 0.94
      }
    };

    this.knowledgeBase = this.initializeKnowledgeBase();
    this.conversationMemory = [];
    this.contextTracker = new ConversationContextTracker();
    this.responseGenerator = new IntelligentResponseGenerator();
  }

  // Initialize Comprehensive Knowledge Base
  initializeKnowledgeBase() {
    return {
      fraudTypes: {
        'asset_misappropriation': {
          definition: 'Theft or misuse of company assets by employees',
          indicators: ['unexplained inventory shortages', 'altered vendor information', 'duplicate payments'],
          prevention: ['segregation of duties', 'regular reconciliations', 'surprise audits'],
          detection: ['analytics on vendor payments', 'inventory tracking', 'expense analysis']
        },
        'corruption': {
          definition: 'Use of position for personal gain through kickbacks or conflicts of interest',
          indicators: ['unusual vendor relationships', 'sole source contracts', 'lifestyle inconsistent with salary'],
          prevention: ['vendor rotation policies', 'conflict of interest declarations', 'approval hierarchies'],
          detection: ['vendor analytics', 'lifestyle audits', 'contract review procedures']
        },
        'financial_statement_fraud': {
          definition: 'Intentional misstatement of financial information',
          indicators: ['unusual revenue recognition', 'aggressive accounting policies', 'related party transactions'],
          prevention: ['independent audit committees', 'whistleblower programs', 'management oversight'],
          detection: ['analytical procedures', 'substantive testing', 'data analytics']
        }
      },

      analyticalTechniques: {
        'benfords_law': {
          description: 'Statistical analysis of first digit frequency in naturally occurring datasets',
          application: 'Detect artificially created or manipulated data sets',
          reliability: 'High for large datasets with natural distribution',
          implementation: 'Apply to vendor payments, expense reports, journal entries'
        },
        'ratio_analysis': {
          description: 'Comparison of financial relationships over time and against benchmarks',
          application: 'Identify unusual trends or relationships in financial data',
          reliability: 'Medium to high depending on data quality and context',
          implementation: 'Calculate and trend key financial ratios monthly/quarterly'
        },
        'regression_analysis': {
          description: 'Statistical method to identify relationships between variables',
          application: 'Predict expected values and identify significant variances',
          reliability: 'High when proper models are used with quality data',
          implementation: 'Build models for expense predictions, revenue forecasting'
        }
      },

      complianceFrameworks: {
        'sox_404': {
          name: 'Sarbanes-Oxley Section 404',
          purpose: 'Internal control assessment and reporting',
          requirements: ['Management assessment', 'External auditor testing', 'Deficiency reporting'],
          testing: 'Annual effectiveness testing with quarterly monitoring'
        },
        'coso_framework': {
          name: 'Committee of Sponsoring Organizations Framework',
          purpose: 'Internal control design and evaluation',
          components: ['Control Environment', 'Risk Assessment', 'Control Activities', 'Information & Communication', 'Monitoring'],
          application: 'Design and evaluate internal control systems'
        },
        'pcaob_standards': {
          name: 'Public Company Accounting Oversight Board Standards',
          purpose: 'Audit quality and standards for public companies',
          focus: ['Risk assessment', 'Internal control testing', 'Audit documentation'],
          compliance: 'Required for all public company audits'
        }
      },

      investigationProtocols: {
        'preliminary_assessment': {
          steps: ['Gather initial information', 'Assess allegation credibility', 'Determine investigation scope'],
          documentation: 'Create investigation file with timeline and key facts',
          decision_points: ['Proceed with full investigation', 'Refer to external experts', 'Close preliminary review']
        },
        'evidence_collection': {
          steps: ['Preserve electronic data', 'Interview witnesses', 'Gather supporting documentation'],
          standards: 'Maintain chain of custody and document all procedures',
          tools: ['Data forensics software', 'Interview protocols', 'Document imaging systems']
        },
        'analysis_and_reporting': {
          steps: ['Analyze collected evidence', 'Determine findings', 'Prepare comprehensive report'],
          standards: 'Objective analysis with clear conclusions and recommendations',
          deliverables: ['Executive summary', 'Detailed findings', 'Remediation recommendations']
        }
      },

      riskIndicators: {
        'red_flags': {
          behavioral: ['lifestyle changes', 'reluctance to share duties', 'unusual working hours'],
          transactional: ['round dollar amounts', 'just under approval limits', 'unusual timing'],
          vendor: ['post office box addresses', 'similar names to employees', 'recent formation'],
          financial: ['declining margins', 'unusual journal entries', 'missing documentation']
        },
        'yellow_flags': {
          behavioral: ['recent financial stress', 'gambling or substance issues', 'close vendor relationships'],
          transactional: ['increasing transaction volumes', 'new vendors without proper vetting', 'manual overrides'],
          organizational: ['weak internal controls', 'rapid growth', 'high employee turnover'],
          industry: ['regulatory changes', 'economic pressures', 'technological disruption']
        }
      }
    };
  }

  // Generate Intelligent Response
  async generateResponse(userInput, context = {}) {
    try {
      // Update conversation memory
      this.conversationMemory.push({
        type: 'user',
        message: userInput,
        timestamp: new Date().toISOString(),
        context: context
      });

      // Analyze user input
      const analysis = this.analyzeUserInput(userInput);
      
      // Update conversation context
      this.contextTracker.update(analysis);
      
      // Generate appropriate response
      const response = await this.generateContextualResponse(analysis, context);
      
      // Store AI response in memory
      this.conversationMemory.push({
        type: 'oxul',
        message: response.text,
        analysis: analysis,
        timestamp: new Date().toISOString()
      });

      return response;
    } catch (error) {
      console.error('Error generating response:', error);
      return this.generateErrorResponse();
    }
  }

  // Analyze User Input
  analyzeUserInput(input) {
    const analysis = {
      intent: this.classifyIntent(input),
      entities: this.extractEntities(input),
      sentiment: this.analyzeSentiment(input),
      complexity: this.assessComplexity(input),
      urgency: this.assessUrgency(input),
      domain: this.identifyDomain(input)
    };

    return analysis;
  }

  // Classify User Intent
  classifyIntent(input) {
    const intentPatterns = {
      'fraud_investigation': {
        keywords: ['fraud', 'suspicious', 'investigate', 'anomaly', 'irregularity', 'scheme'],
        phrases: ['something suspicious', 'investigate this', 'fraud case', 'suspicious activity']
      },
      'analytical_request': {
        keywords: ['analyze', 'review', 'examine', 'calculate', 'assess', 'evaluate'],
        phrases: ['can you analyze', 'please review', 'help me understand', 'what do you think']
      },
      'compliance_inquiry': {
        keywords: ['compliance', 'regulation', 'sox', 'gaap', 'pcaob', 'audit'],
        phrases: ['compliance requirements', 'regulatory standards', 'audit procedures']
      },
      'risk_assessment': {
        keywords: ['risk', 'probability', 'likelihood', 'exposure', 'vulnerability'],
        phrases: ['risk level', 'how risky', 'risk assessment', 'potential impact']
      },
      'procedure_guidance': {
        keywords: ['how to', 'procedure', 'process', 'steps', 'methodology'],
        phrases: ['how do I', 'what steps', 'best practice', 'recommended approach']
      },
      'knowledge_query': {
        keywords: ['what is', 'define', 'explain', 'tell me about', 'information'],
        phrases: ['what does', 'can you explain', 'I need to know', 'help me understand']
      }
    };

    const inputLower = input.toLowerCase();
    const intentScores = {};

    Object.keys(intentPatterns).forEach(intent => {
      let score = 0;
      const pattern = intentPatterns[intent];
      
      // Check keywords
      pattern.keywords.forEach(keyword => {
        if (inputLower.includes(keyword)) score += 2;
      });
      
      // Check phrases
      pattern.phrases.forEach(phrase => {
        if (inputLower.includes(phrase)) score += 3;
      });
      
      intentScores[intent] = score;
    });

    // Find highest scoring intent
    const topIntent = Object.keys(intentScores).reduce((a, b) => 
      intentScores[a] > intentScores[b] ? a : b
    );

    return {
      primary: topIntent,
      confidence: Math.min(intentScores[topIntent] / 5, 1),
      allScores: intentScores
    };
  }

  // Extract Relevant Entities
  extractEntities(input) {
    const entities = [];
    
    // Financial amounts
    const amountRegex = /\$[\d,]+\.?\d*/g;
    const amounts = input.match(amountRegex);
    if (amounts) {
      amounts.forEach(amount => {
        entities.push({
          type: 'financial_amount',
          value: amount,
          confidence: 0.95
        });
      });
    }

    // Dates
    const dateRegex = /\b\d{1,2}\/\d{1,2}\/\d{4}\b|\b\d{4}-\d{2}-\d{2}\b/g;
    const dates = input.match(dateRegex);
    if (dates) {
      dates.forEach(date => {
        entities.push({
          type: 'date',
          value: date,
          confidence: 0.90
        });
      });
    }

    // Company/Entity names (simple pattern)
    const entityRegex = /\b[A-Z][a-z]+ (?:Corp|Inc|LLC|Ltd|Company)\b/g;
    const companies = input.match(entityRegex);
    if (companies) {
      companies.forEach(company => {
        entities.push({
          type: 'company',
          value: company,
          confidence: 0.80
        });
      });
    }

    // Account numbers
    const accountRegex = /\b\d{8,12}\b/g;
    const accounts = input.match(accountRegex);
    if (accounts) {
      accounts.forEach(account => {
        entities.push({
          type: 'account_number',
          value: account,
          confidence: 0.75
        });
      });
    }

    return entities;
  }

  // Analyze Sentiment
  analyzeSentiment(input) {
    const positiveWords = ['good', 'great', 'excellent', 'helpful', 'thank', 'appreciate'];
    const negativeWords = ['bad', 'terrible', 'fraud', 'suspicious', 'concerned', 'worried', 'problem'];
    const urgentWords = ['urgent', 'immediate', 'asap', 'quickly', 'emergency'];

    const words = input.toLowerCase().split(/\s+/);
    let positiveScore = 0;
    let negativeScore = 0;
    let urgentScore = 0;

    words.forEach(word => {
      if (positiveWords.includes(word)) positiveScore++;
      if (negativeWords.includes(word)) negativeScore++;
      if (urgentWords.includes(word)) urgentScore++;
    });

    let sentiment = 'neutral';
    if (positiveScore > negativeScore) sentiment = 'positive';
    else if (negativeScore > positiveScore) sentiment = 'negative';

    return {
      sentiment: sentiment,
      urgency: urgentScore > 0 ? 'high' : 'normal',
      scores: { positive: positiveScore, negative: negativeScore, urgent: urgentScore }
    };
  }

  // Assess Complexity
  assessComplexity(input) {
    const complexIndicators = ['analyze', 'investigate', 'comprehensive', 'detailed', 'multiple', 'various'];
    const words = input.toLowerCase().split(/\s+/);
    
    let complexityScore = 0;
    complexIndicators.forEach(indicator => {
      if (words.includes(indicator)) complexityScore++;
    });

    // Also consider length and question complexity
    if (words.length > 20) complexityScore++;
    if (input.includes('?') && input.split('?').length > 2) complexityScore++;

    if (complexityScore >= 3) return 'high';
    if (complexityScore >= 1) return 'medium';
    return 'low';
  }

  // Assess Urgency
  assessUrgency(input) {
    const urgentKeywords = ['urgent', 'immediate', 'asap', 'emergency', 'critical', 'important'];
    const inputLower = input.toLowerCase();
    
    const urgencyScore = urgentKeywords.reduce((score, keyword) => {
      return inputLower.includes(keyword) ? score + 1 : score;
    }, 0);

    if (urgencyScore >= 2) return 'high';
    if (urgencyScore >= 1) return 'medium';
    return 'normal';
  }

  // Identify Domain
  identifyDomain(input) {
    const domains = {
      'fraud_detection': ['fraud', 'embezzlement', 'misappropriation', 'theft', 'scheme'],
      'financial_analysis': ['financial', 'ratio', 'analysis', 'revenue', 'expense', 'profit'],
      'compliance': ['compliance', 'regulation', 'sox', 'gaap', 'audit', 'internal control'],
      'risk_management': ['risk', 'assessment', 'probability', 'exposure', 'mitigation'],
      'forensic_accounting': ['forensic', 'investigation', 'evidence', 'documentation', 'procedures']
    };

    const inputLower = input.toLowerCase();
    const domainScores = {};

    Object.keys(domains).forEach(domain => {
      domainScores[domain] = domains[domain].reduce((score, keyword) => {
        return inputLower.includes(keyword) ? score + 1 : score;
      }, 0);
    });

    const topDomain = Object.keys(domainScores).reduce((a, b) => 
      domainScores[a] > domainScores[b] ? a : b
    );

    return domainScores[topDomain] > 0 ? topDomain : 'general';
  }

  // Generate Contextual Response
  async generateContextualResponse(analysis, context) {
    const responseElements = {
      greeting: this.generateGreeting(analysis),
      mainResponse: this.generateMainResponse(analysis, context),
      recommendations: this.generateRecommendations(analysis, context),
      followUp: this.generateFollowUp(analysis)
    };

    const response = {
      text: this.combineResponseElements(responseElements),
      suggestions: responseElements.recommendations,
      analysis: analysis,
      confidence: this.calculateResponseConfidence(analysis),
      metadata: {
        responseType: analysis.intent.primary,
        domain: analysis.domain,
        complexity: analysis.complexity
      }
    };

    return response;
  }

  // Generate Greeting Based on Context
  generateGreeting(analysis) {
    const timeOfDay = new Date().getHours();
    let timeGreeting = 'Hello';
    if (timeOfDay < 12) timeGreeting = 'Good morning';
    else if (timeOfDay < 17) timeGreeting = 'Good afternoon';
    else timeGreeting = 'Good evening';

    if (analysis.sentiment.urgency === 'high') {
      return `${timeGreeting}! I understand this is urgent. `;
    }

    if (this.conversationMemory.length > 2) {
      return `Continuing our analysis, `;
    }

    return `${timeGreeting}! I'm ${this.personality.name}, your AI forensic accountant. `;
  }

  // Generate Main Response
  generateMainResponse(analysis, context) {
    switch (analysis.intent.primary) {
      case 'fraud_investigation':
        return this.generateFraudInvestigationResponse(analysis, context);
      case 'analytical_request':
        return this.generateAnalyticalResponse(analysis, context);
      case 'compliance_inquiry':
        return this.generateComplianceResponse(analysis, context);
      case 'risk_assessment':
        return this.generateRiskAssessmentResponse(analysis, context);
      case 'procedure_guidance':
        return this.generateProcedureGuidanceResponse(analysis, context);
      case 'knowledge_query':
        return this.generateKnowledgeResponse(analysis, context);
      default:
        return this.generateGeneralResponse(analysis, context);
    }
  }

  // Specialized Response Generators
  generateFraudInvestigationResponse(analysis, context) {
    let response = `I'll help you investigate this potential fraud case using advanced forensic accounting techniques. `;
    
    if (analysis.entities.some(e => e.type === 'financial_amount')) {
      response += `I notice specific monetary amounts mentioned - this will help focus our analysis. `;
    }

    response += `Based on my experience with similar cases, I recommend starting with: `;
    response += `(1) Preserving all electronic evidence, (2) Conducting preliminary data analysis using Benford's Law, `;
    response += `and (3) Mapping transaction patterns to identify anomalies. `;

    if (analysis.urgency === 'high') {
      response += `Given the urgent nature, I suggest immediately securing relevant systems and data sources.`;
    }

    return response;
  }

  generateAnalyticalResponse(analysis, context) {
    return `I'll perform a comprehensive analytical review using proven forensic accounting methodologies. ` +
           `My analysis will include ratio analysis, trend identification, and statistical testing to uncover any ` +
           `irregularities or patterns that require attention. I can apply techniques such as regression analysis, ` +
           `Benford's Law testing, and comparative analysis against industry benchmarks.`;
  }

  generateComplianceResponse(analysis, context) {
    return `I'll review your compliance requirements using current regulatory frameworks including SOX, GAAP, ` +
           `and industry-specific standards. My assessment will cover internal control effectiveness, documentation ` +
           `adequacy, and testing procedures to ensure full regulatory compliance. I can provide specific guidance ` +
           `on PCAOB standards and COSO framework implementation.`;
  }

  generateRiskAssessmentResponse(analysis, context) {
    return `I'll conduct a thorough risk assessment using quantitative and qualitative analysis methods. ` +
           `This will include identifying risk factors, assessing probability and impact, and developing ` +
           `risk mitigation strategies. My assessment considers both inherent and residual risks across ` +
           `operational, financial, and compliance domains.`;
  }

  generateProcedureGuidanceResponse(analysis, context) {
    return `I'll provide step-by-step guidance based on established forensic accounting best practices. ` +
           `My recommendations will include proper documentation procedures, evidence collection standards, ` +
           `and analytical techniques that ensure thorough and defensible investigation results. ` +
           `All procedures will comply with professional standards and legal requirements.`;
  }

  generateKnowledgeResponse(analysis, context) {
    return `I'll explain this concept using my extensive knowledge of forensic accounting principles. ` +
           `My explanation will include practical applications, real-world examples, and connections to ` +
           `current best practices in the field. I can also provide relevant case studies and ` +
           `implementation guidance to help you apply this knowledge effectively.`;
  }

  generateGeneralResponse(analysis, context) {
    return `I'm here to assist with all aspects of forensic accounting and fraud investigation. ` +
           `With my specialized knowledge in financial analysis, compliance, and investigative procedures, ` +
           `I can help you navigate complex financial challenges and ensure thorough, professional analysis.`;
  }

  // Generate Recommendations
  generateRecommendations(analysis, context) {
    const recommendations = [];

    switch (analysis.intent.primary) {
      case 'fraud_investigation':
        recommendations.push('🔍 Run fraud detection algorithms');
        recommendations.push('📊 Perform Benford\'s Law analysis');
        recommendations.push('📋 Generate investigation timeline');
        recommendations.push('🔒 Secure evidence and documentation');
        break;
      case 'analytical_request':
        recommendations.push('📈 Perform ratio analysis');
        recommendations.push('📊 Run statistical tests');
        recommendations.push('🔍 Identify trends and patterns');
        recommendations.push('📋 Generate analytical report');
        break;
      case 'compliance_inquiry':
        recommendations.push('✅ Review SOX compliance');
        recommendations.push('📋 Assess internal controls');
        recommendations.push('🔍 Perform compliance testing');
        recommendations.push('📊 Generate compliance report');
        break;
      case 'risk_assessment':
        recommendations.push('⚠️ Calculate risk scores');
        recommendations.push('📊 Perform impact analysis');
        recommendations.push('🛡️ Develop mitigation strategies');
        recommendations.push('📋 Create risk register');
        break;
      default:
        recommendations.push('🔍 Analyze transaction patterns');
        recommendations.push('📊 Review financial ratios');
        recommendations.push('⚠️ Assess risk factors');
        recommendations.push('📋 Generate comprehensive report');
    }

    return recommendations;
  }

  // Generate Follow-up Questions
  generateFollowUp(analysis) {
    switch (analysis.intent.primary) {
      case 'fraud_investigation':
        return `Would you like me to begin with a specific analytical technique, or do you have particular ` +
               `transaction types or time periods you'd like me to focus on first?`;
      case 'analytical_request':
        return `What specific metrics or time periods would you like me to prioritize in my analysis?`;
      case 'compliance_inquiry':
        return `Are there specific compliance areas or controls you'd like me to focus on?`;
      case 'risk_assessment':
        return `Would you like me to focus on operational, financial, or compliance risks, or conduct a ` +
               `comprehensive assessment across all areas?`;
      default:
        return `What specific area would you like me to focus on first - fraud detection, compliance review, ` +
               `financial analysis, or risk assessment?`;
    }
  }

  // Combine Response Elements
  combineResponseElements(elements) {
    return `${elements.greeting}${elements.mainResponse} ${elements.followUp}`;
  }

  // Calculate Response Confidence
  calculateResponseConfidence(analysis) {
    let confidence = 0.7; // Base confidence
    
    // Adjust based on intent confidence
    confidence += analysis.intent.confidence * 0.2;
    
    // Adjust based on domain specificity
    if (analysis.domain !== 'general') confidence += 0.1;
    
    // Adjust based on entity extraction
    if (analysis.entities.length > 0) confidence += 0.05;
    
    return Math.min(confidence, 0.95);
  }

  // Generate Error Response
  generateErrorResponse() {
    return {
      text: `I apologize, but I encountered an issue processing your request. As your AI forensic accountant, ` +
            `I'm designed to help with fraud detection, financial analysis, compliance, and risk assessment. ` +
            `Could you please rephrase your question or provide more specific details about what you'd like me to analyze?`,
      suggestions: [
        '🔍 Ask about suspicious transactions',
        '📊 Request financial analysis',
        '✅ Inquire about compliance',
        '⚠️ Discuss risk assessment'
      ],
      confidence: 0.5,
      metadata: {
        responseType: 'error_recovery',
        domain: 'general',
        complexity: 'low'
      }
    };
  }

  // Get Conversation History
  getConversationHistory() {
    return this.conversationMemory.map(entry => ({
      type: entry.type,
      message: entry.message,
      timestamp: entry.timestamp
    }));
  }

  // Reset Conversation
  resetConversation() {
    this.conversationMemory = [];
    this.contextTracker.reset();
  }

  // Get Personality Information
  getPersonalityInfo() {
    return {
      ...this.personality,
      capabilities: [
        'Advanced fraud detection and investigation',
        'Comprehensive financial analysis and modeling',
        'Regulatory compliance assessment and testing',
        'Risk assessment and mitigation planning',
        'Forensic accounting procedures and documentation',
        'Internal control evaluation and design',
        'Data analytics and statistical analysis',
        'Professional consultation and guidance'
      ],
      experience_summary: `I bring the equivalent of 15+ years of forensic accounting experience, ` +
                          `specializing in fraud detection, financial analysis, and compliance. I use ` +
                          `advanced analytical techniques and maintain the highest professional standards ` +
                          `in all investigations and assessments.`
    };
  }
}

// Conversation Context Tracker
class ConversationContextTracker {
  constructor() {
    this.currentContext = {
      topic: null,
      entities: [],
      intent_history: [],
      complexity_level: 'medium'
    };
  }

  update(analysis) {
    // Update current topic
    this.currentContext.topic = analysis.domain;
    
    // Add entities to context
    analysis.entities.forEach(entity => {
      if (!this.currentContext.entities.find(e => e.value === entity.value)) {
        this.currentContext.entities.push(entity);
      }
    });
    
    // Track intent history
    this.currentContext.intent_history.push({
      intent: analysis.intent.primary,
      timestamp: new Date().toISOString(),
      confidence: analysis.intent.confidence
    });
    
    // Update complexity level
    this.currentContext.complexity_level = analysis.complexity;
    
    // Keep only recent history (last 10 intents)
    if (this.currentContext.intent_history.length > 10) {
      this.currentContext.intent_history = this.currentContext.intent_history.slice(-10);
    }
  }

  getContext() {
    return { ...this.currentContext };
  }

  reset() {
    this.currentContext = {
      topic: null,
      entities: [],
      intent_history: [],
      complexity_level: 'medium'
    };
  }
}

// Intelligent Response Generator
class IntelligentResponseGenerator {
  constructor() {
    this.responseTemplates = {
      professional: {
        greeting: 'Good [TIME]. I\'m [NAME], your AI forensic accountant.',
        confidence_high: 'Based on my analysis, I can confidently state that',
        confidence_medium: 'My preliminary assessment suggests that',
        confidence_low: 'While I need more information to be certain,',
        closing: 'I\'m here to provide continued support throughout your investigation.'
      }
    };
  }

  generateStructuredResponse(components) {
    // This could be expanded to use more sophisticated templates
    return components.join(' ');
  }
}

export default OxulPersonalityEngine;