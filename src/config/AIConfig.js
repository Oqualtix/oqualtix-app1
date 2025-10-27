// AI Configuration for Oqualtix Forensics
// This file contains configuration settings for the proprietary Oxul AI Engine

export const AIConfig = {
  // Oxul AI Engine Configuration
  oxul: {
    version: '1.0.0',
    vendor: 'Oqualtix',
    type: 'proprietary',
    privacy: '100% Local Processing',
    dependencies: 'None - Fully Independent',
    personality: 'Senior Forensic Accountant',
    expertise: ['Fraud Detection', 'Financial Analysis', 'Compliance', 'Risk Assessment']
  },

  // TensorFlow.js Configuration
  tensorflow: {
    backend: 'webgl', // Options: 'webgl', 'cpu', 'webgpu'
    enableProfiling: false,
    debugMode: false
  },

  // Fraud Detection Model Configuration
  fraudDetection: {
    modelPath: '/models/fraud-detection',
    inputFeatures: 8,
    batchSize: 32,
    epochs: 50,
    validationSplit: 0.2,
    confidenceThreshold: 0.5,
    accuracyTarget: 0.90
  },

  // Oxul Natural Language Processing Configuration
  nlp: {
    engine: 'oxul_proprietary',
    language: 'english',
    enableSentimentAnalysis: true,
    enableEntityRecognition: true,
    enableIntentClassification: true,
    conversationalAI: true,
    personalityMode: 'forensic_accountant',
    fraudKeywords: [
      'urgent', 'immediate', 'cash', 'wire', 'transfer', 'personal',
      'emergency', 'confidential', 'advance', 'bonus', 'refund',
      'embezzlement', 'ghost', 'duplicate', 'suspicious', 'anomaly'
    ]
  },

  // Performance Configuration
  performance: {
    maxConcurrentRequests: 5,
    requestTimeout: 30000, // 30 seconds
    retryAttempts: 3,
    enableCaching: true,
    cacheTTL: 300000 // 5 minutes
  },

  // Development/Production Settings
  environment: {
    isDevelopment: __DEV__ || process.env.NODE_ENV === 'development',
    enableLogging: true,
    enableMetrics: true,
    fallbackMode: true // Use statistical analysis if AI fails
  },

  // Thresholds and Scoring
  thresholds: {
    fraudProbability: {
      low: 0.2,
      medium: 0.4,
      high: 0.6,
      critical: 0.8
    },
    confidenceLevel: {
      minimum: 0.6,
      good: 0.8,
      excellent: 0.9
    }
  },

  // Feature Flags
  features: {
    realTimeFraudDetection: true,
    conversationalAI: true,
    batchProcessing: true,
    nlpAnalysis: true,
    neuralNetworks: true,
    crossCompanyBenchmarking: true
  }
};

// Model Training Configuration
export const TrainingConfig = {
  // Synthetic Data Generation
  syntheticData: {
    fraudRate: 0.1, // 10% fraud rate in training data
    sampleSize: 1000,
    featureRanges: {
      amount: { min: 100, max: 50000 },
      time: { min: 0, max: 24 },
      frequency: { min: 0, max: 1 },
      anomalyScore: { min: 0, max: 1 },
      riskIndicators: { min: 0, max: 1 },
      vendorTrust: { min: 0, max: 1 },
      patternMatch: { min: 0, max: 1 },
      deviation: { min: 0, max: 1 }
    }
  },

  // Model Architecture
  architecture: {
    layers: [
      { type: 'dense', units: 64, activation: 'relu', dropout: 0.3 },
      { type: 'dense', units: 32, activation: 'relu', dropout: 0.2 },
      { type: 'dense', units: 16, activation: 'relu' },
      { type: 'dense', units: 1, activation: 'sigmoid' }
    ],
    optimizer: {
      type: 'adam',
      learningRate: 0.001
    },
    loss: 'binaryCrossentropy',
    metrics: ['accuracy']
  }
};

// System Prompts for different AI contexts
export const SystemPrompts = {
  forensicAccountant: `You are Oxul AI, an advanced financial forensics assistant specializing in fraud detection and embezzlement investigation. You have access to sophisticated machine learning models and real-time transaction analysis capabilities.

Key Capabilities:
- Neural network fraud detection (90%+ accuracy)
- Natural language processing for document analysis
- Risk assessment modeling
- Pattern recognition across transaction histories
- Cross-company benchmarking analysis

Guidelines:
1. Provide expert-level financial forensics advice
2. Reference specific ML algorithms and statistical methods when relevant
3. Suggest actionable investigation steps
4. Maintain professional, confident tone
5. Always prioritize accuracy and legal compliance
6. Offer to perform deeper analysis with available AI tools`,

  fraudAnalysis: `You are analyzing financial transactions for fraud indicators. Focus on:
- Identifying suspicious patterns
- Explaining risk factors
- Providing investigation recommendations
- Suggesting additional analysis methods
- Maintaining objectivity and accuracy`,

  helpAssistant: `You are helping users understand AI capabilities and features. Be:
- Clear and educational
- Patient with technical explanations
- Comprehensive in coverage
- Practical in recommendations
- Professional in tone`
};

// Error Messages and Responses
export const ErrorResponses = {
  aiUnavailable: "AI services are currently unavailable. Using statistical analysis as backup.",
  modelLoading: "AI models are still loading. Please wait a moment and try again.",
  rateLimited: "Too many requests. Please wait before making another AI query.",
  invalidInput: "Invalid input provided. Please check your data and try again.",
  processingError: "An error occurred during AI processing. Using fallback analysis.",
  networkError: "Network connection issue. Some AI features may be limited."
};

export default AIConfig;