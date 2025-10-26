import AsyncStorage from '@react-native-async-storage/async-storage';
import BrandConfig from '../config/BrandConfig';

class PersonalityManager {
  static STORAGE_KEY = '@oxul_personality';
  
  // Default personality configurations
  static personalities = {
    professional: {
      id: 'professional',
      name: 'Professional Forensic Expert',
      greeting: '🤖 Good day. I am Oxul, your certified forensic accounting AI. I provide comprehensive financial analysis using advanced algorithms and regulatory compliance standards. How may I assist with your investigation today?',
      responseStyle: {
        tone: 'formal',
        techLevel: 'high',
        detailLevel: 'comprehensive',
        language: 'technical'
      },
      conversationPatterns: {
        greeting: 'formal_greeting',
        acknowledgment: 'professional_ack',
        questions: 'detailed_inquiry',
        explanations: 'technical_explanation'
      }
    },
    
    friendly: {
      id: 'friendly',
      name: 'Friendly Financial Assistant',
      greeting: '👋 Hi there! I\'m Oxul, your AI forensic accountant. I love helping solve financial puzzles and catching fraud patterns! Think of me as your detective partner - what financial mystery can we solve together today?',
      responseStyle: {
        tone: 'warm',
        techLevel: 'medium',
        detailLevel: 'balanced',
        language: 'conversational'
      },
      conversationPatterns: {
        greeting: 'friendly_greeting',
        acknowledgment: 'enthusiastic_ack',
        questions: 'conversational_inquiry',
        explanations: 'accessible_explanation'
      }
    },
    
    analytical: {
      id: 'analytical',
      name: 'Data-Driven Analyst',
      greeting: '📊 Hello. I\'m Oxul, your AI forensic analyst specializing in quantitative financial investigations. I process data patterns, statistical anomalies, and risk metrics. Ready to dive into the numbers?',
      responseStyle: {
        tone: 'precise',
        techLevel: 'very_high',
        detailLevel: 'data_focused',
        language: 'statistical'
      },
      conversationPatterns: {
        greeting: 'analytical_greeting',
        acknowledgment: 'data_ack',
        questions: 'metric_inquiry',
        explanations: 'statistical_explanation'
      }
    },
    
    investigative: {
      id: 'investigative',
      name: 'Detective Mode',
      greeting: '🔍 Greetings. I\'m Oxul, your AI financial detective. I specialize in following money trails, uncovering hidden patterns, and solving complex fraud cases. What case are we investigating today?',
      responseStyle: {
        tone: 'inquisitive',
        techLevel: 'high',
        detailLevel: 'investigative',
        language: 'investigative'
      },
      conversationPatterns: {
        greeting: 'detective_greeting',
        acknowledgment: 'investigative_ack',
        questions: 'probing_inquiry',
        explanations: 'methodical_explanation'
      }
    },
    
    adaptive: {
      id: 'adaptive',
      name: 'Adaptive Learning AI',
      greeting: '🧠 Hello! I\'m Oxul, your adaptive AI forensic accountant. I learn from our interactions to better serve your investigation style. The more we work together, the more I understand your preferences!',
      responseStyle: {
        tone: 'adaptive',
        techLevel: 'adaptive',
        detailLevel: 'adaptive',
        language: 'adaptive'
      },
      conversationPatterns: {
        greeting: 'adaptive_greeting',
        acknowledgment: 'learning_ack',
        questions: 'personalized_inquiry',
        explanations: 'customized_explanation'
      }
    }
  };

  // Get current personality
  static async getCurrentPersonality() {
    try {
      const stored = await AsyncStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
      return this.personalities.professional; // Default
    } catch (error) {
      console.error('Error getting personality:', error);
      return this.personalities.professional;
    }
  }

  // Set personality
  static async setPersonality(personalityId) {
    try {
      const personality = this.personalities[personalityId];
      if (personality) {
        await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(personality));
        return personality;
      }
      throw new Error('Invalid personality ID');
    } catch (error) {
      console.error('Error setting personality:', error);
      throw error;
    }
  }

  // Update custom personality
  static async updateCustomPersonality(customConfig) {
    try {
      const personality = {
        id: 'custom',
        name: 'Custom Personality',
        ...customConfig
      };
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(personality));
      return personality;
    } catch (error) {
      console.error('Error updating custom personality:', error);
      throw error;
    }
  }

  // Generate response based on personality
  static generateResponse(baseResponse, personality, context = {}) {
    if (!personality) return baseResponse;

    const { responseStyle, conversationPatterns } = personality;
    
    // Apply personality transformations
    let enhancedResponse = baseResponse;

    // Tone adjustments
    switch (responseStyle.tone) {
      case 'formal':
        enhancedResponse = this.applyFormalTone(enhancedResponse);
        break;
      case 'warm':
        enhancedResponse = this.applyWarmTone(enhancedResponse);
        break;
      case 'precise':
        enhancedResponse = this.applyPreciseTone(enhancedResponse);
        break;
      case 'inquisitive':
        enhancedResponse = this.applyInquisitiveTone(enhancedResponse);
        break;
    }

    // Technical level adjustments
    switch (responseStyle.techLevel) {
      case 'high':
        enhancedResponse = this.addTechnicalTerms(enhancedResponse);
        break;
      case 'medium':
        enhancedResponse = this.balanceTechnicalTerms(enhancedResponse);
        break;
      case 'low':
        enhancedResponse = this.simplifyTechnicalTerms(enhancedResponse);
        break;
    }

    return enhancedResponse;
  }

  // Tone application methods
  static applyFormalTone(response) {
    const formalPhrases = {
      'I think': 'I believe',
      'looks like': 'appears to indicate',
      'pretty good': 'satisfactory',
      'bad': 'suboptimal',
      'weird': 'anomalous'
    };

    let formalResponse = response;
    Object.entries(formalPhrases).forEach(([casual, formal]) => {
      formalResponse = formalResponse.replace(new RegExp(casual, 'gi'), formal);
    });

    return formalResponse;
  }

  static applyWarmTone(response) {
    const warmPhrases = [
      'Great question!',
      'I\'m happy to help with that!',
      'That\'s an interesting observation!',
      'Let me walk you through this',
      'I hope this helps!'
    ];

    // Add encouraging phrases
    if (Math.random() > 0.7) {
      const randomPhrase = warmPhrases[Math.floor(Math.random() * warmPhrases.length)];
      response = `${randomPhrase} ${response}`;
    }

    return response;
  }

  static applyPreciseTone(response) {
    // Add statistical confidence indicators
    const preciseIndicators = [
      'Based on analysis:',
      'Data indicates:',
      'Statistical evidence shows:',
      'Quantitative assessment reveals:'
    ];

    if (response.includes('analysis') || response.includes('data')) {
      const indicator = preciseIndicators[Math.floor(Math.random() * preciseIndicators.length)];
      response = response.replace(/^/, `${indicator} `);
    }

    return response;
  }

  static applyInquisitiveTone(response) {
    // Add investigative follow-up questions
    const followUpQuestions = [
      'What additional details can you provide?',
      'Are there any related patterns we should investigate?',
      'Should we examine this from another angle?',
      'What other evidence might be relevant?'
    ];

    if (Math.random() > 0.6) {
      const question = followUpQuestions[Math.floor(Math.random() * followUpQuestions.length)];
      response += ` ${question}`;
    }

    return response;
  }

  // Technical level methods
  static addTechnicalTerms(response) {
    const technicalMappings = {
      'unusual': 'anomalous',
      'strange': 'statistically significant deviation',
      'pattern': 'algorithmic pattern recognition',
      'analysis': 'quantitative forensic analysis',
      'check': 'audit validation'
    };

    let technicalResponse = response;
    Object.entries(technicalMappings).forEach(([simple, technical]) => {
      technicalResponse = technicalResponse.replace(new RegExp(simple, 'gi'), technical);
    });

    return technicalResponse;
  }

  static balanceTechnicalTerms(response) {
    // Keep some technical terms but add explanations
    return response.replace(/\b(algorithm|forensic|anomaly)\b/gi, (match) => {
      const explanations = {
        algorithm: 'algorithm (mathematical process)',
        forensic: 'forensic (investigative)',
        anomaly: 'anomaly (unusual pattern)'
      };
      return explanations[match.toLowerCase()] || match;
    });
  }

  static simplifyTechnicalTerms(response) {
    const simpleMappings = {
      'algorithmic': 'automated',
      'forensic analysis': 'investigation',
      'anomalous': 'unusual',
      'quantitative': 'number-based',
      'statistical': 'data'
    };

    let simpleResponse = response;
    Object.entries(simpleMappings).forEach(([technical, simple]) => {
      simpleResponse = simpleResponse.replace(new RegExp(technical, 'gi'), simple);
    });

    return simpleResponse;
  }

  // Get personality-specific conversation starters
  static getConversationStarters(personality) {
    const starters = {
      professional: [
        'Initiate comprehensive fraud risk assessment',
        'Begin regulatory compliance audit',
        'Analyze suspicious transaction patterns',
        'Generate forensic accounting report'
      ],
      friendly: [
        'Help me find unusual spending patterns',
        'What should I look for in these transactions?',
        'Can you explain this financial data simply?',
        'Walk me through fraud detection basics'
      ],
      analytical: [
        'Show statistical analysis of transactions',
        'Calculate risk scores and probabilities',
        'Generate data visualization charts',
        'Perform quantitative anomaly detection'
      ],
      investigative: [
        'Follow this money trail',
        'Investigate these suspicious accounts',
        'What evidence should we gather next?',
        'Analyze this case step by step'
      ],
      adaptive: [
        'Learn my investigation preferences',
        'Adapt to my communication style',
        'Remember my common questions',
        'Customize responses to my needs'
      ]
    };

    return starters[personality.id] || starters.professional;
  }
}

export default PersonalityManager;