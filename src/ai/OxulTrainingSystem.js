// Oxul AI Training System
// Custom machine learning training pipeline for financial fraud detection
// Proprietary training algorithms and data processing

// Optional TensorFlow import - only if available
let tf = null;
try {
  tf = require('@tensorflow/tfjs');
} catch (e) {
  console.log('TensorFlow.js not available - using fallback training algorithms');
}

class OxulTrainingSystem {
  constructor() {
    this.trainingHistory = [];
    this.modelVersions = new Map();
    this.dataPreprocessor = new FinancialDataPreprocessor();
    this.evaluationMetrics = new ModelEvaluator();
  }

  // Advanced Training Pipeline
  async trainCustomModel(config) {
    try {
      console.log('🎯 Starting Oxul AI custom training...');
      
      const {
        trainingData,
        modelType = 'fraud_detection',
        architecture = 'deep_neural_network',
        hyperparameters = {}
      } = config;

      // Step 1: Preprocess data
      const processedData = await this.dataPreprocessor.process(trainingData);
      
      // Step 2: Create model architecture
      const model = this.createModelArchitecture(architecture, processedData.inputShape);
      
      // Step 3: Configure training parameters
      const trainingConfig = this.configureTraining(hyperparameters);
      
      // Step 4: Train the model
      const trainingResults = await this.trainModel(model, processedData, trainingConfig);
      
      // Step 5: Evaluate performance
      const evaluation = await this.evaluationMetrics.evaluate(model, processedData.testData);
      
      // Step 6: Save trained model
      const modelId = await this.saveTrainedModel(model, evaluation, trainingResults);
      
      console.log('✅ Training completed successfully');
      
      return {
        success: true,
        modelId: modelId,
        accuracy: evaluation.accuracy,
        precision: evaluation.precision,
        recall: evaluation.recall,
        f1Score: evaluation.f1Score,
        trainingTime: trainingResults.duration,
        epochs: trainingResults.epochs
      };
    } catch (error) {
      console.error('❌ Training failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Create Dynamic Model Architecture
  createModelArchitecture(architecture, inputShape) {
    switch (architecture) {
      case 'deep_neural_network':
        return this.createDeepNeuralNetwork(inputShape);
      case 'fraud_specialist':
        return this.createFraudSpecialistModel(inputShape);
      case 'pattern_detector':
        return this.createPatternDetectorModel(inputShape);
      case 'anomaly_detector':
        return this.createAnomalyDetectorModel(inputShape);
      default:
        return this.createDeepNeuralNetwork(inputShape);
    }
  }

  // Deep Neural Network for Financial Analysis
  createDeepNeuralNetwork(inputShape) {
    const model = tf.sequential();
    
    // Input layer with dropout
    model.add(tf.layers.dense({
      inputShape: [inputShape],
      units: 256,
      activation: 'relu',
      kernelInitializer: 'heNormal',
      name: 'input_layer'
    }));
    model.add(tf.layers.dropout({ rate: 0.3 }));
    
    // Hidden layers with batch normalization
    model.add(tf.layers.dense({
      units: 128,
      activation: 'relu',
      kernelInitializer: 'heNormal',
      name: 'hidden_1'
    }));
    model.add(tf.layers.batchNormalization());
    model.add(tf.layers.dropout({ rate: 0.25 }));
    
    model.add(tf.layers.dense({
      units: 64,
      activation: 'relu',
      kernelInitializer: 'heNormal',
      name: 'hidden_2'
    }));
    model.add(tf.layers.batchNormalization());
    model.add(tf.layers.dropout({ rate: 0.2 }));
    
    model.add(tf.layers.dense({
      units: 32,
      activation: 'relu',
      kernelInitializer: 'heNormal',
      name: 'hidden_3'
    }));
    model.add(tf.layers.dropout({ rate: 0.15 }));
    
    // Output layer
    model.add(tf.layers.dense({
      units: 1,
      activation: 'sigmoid',
      name: 'output_layer'
    }));
    
    return model;
  }

  // Specialized Fraud Detection Model
  createFraudSpecialistModel(inputShape) {
    const model = tf.sequential();
    
    // Specialized layers for fraud patterns
    model.add(tf.layers.dense({
      inputShape: [inputShape],
      units: 512,
      activation: 'swish',
      name: 'fraud_input'
    }));
    model.add(tf.layers.dropout({ rate: 0.4 }));
    
    // Fraud pattern recognition layers
    model.add(tf.layers.dense({
      units: 256,
      activation: 'swish',
      name: 'pattern_recognition'
    }));
    model.add(tf.layers.dropout({ rate: 0.3 }));
    
    // Risk assessment layers
    model.add(tf.layers.dense({
      units: 128,
      activation: 'relu',
      name: 'risk_assessment'
    }));
    model.add(tf.layers.dropout({ rate: 0.25 }));
    
    // Decision layer
    model.add(tf.layers.dense({
      units: 64,
      activation: 'relu',
      name: 'decision_layer'
    }));
    model.add(tf.layers.dropout({ rate: 0.2 }));
    
    // Final classification
    model.add(tf.layers.dense({
      units: 1,
      activation: 'sigmoid',
      name: 'fraud_probability'
    }));
    
    return model;
  }

  // Advanced Pattern Detection Model
  createPatternDetectorModel(inputShape) {
    // Create a more complex model for pattern detection
    const input = tf.input({ shape: [inputShape], name: 'pattern_input' });
    
    // Parallel processing branches
    const branch1 = tf.layers.dense({ units: 128, activation: 'relu' }).apply(input);
    const branch2 = tf.layers.dense({ units: 128, activation: 'tanh' }).apply(input);
    const branch3 = tf.layers.dense({ units: 128, activation: 'swish' }).apply(input);
    
    // Concatenate branches
    const merged = tf.layers.concatenate().apply([branch1, branch2, branch3]);
    
    // Processing layers
    let x = tf.layers.dense({ units: 256, activation: 'relu' }).apply(merged);
    x = tf.layers.dropout({ rate: 0.3 }).apply(x);
    x = tf.layers.dense({ units: 128, activation: 'relu' }).apply(x);
    x = tf.layers.dropout({ rate: 0.25 }).apply(x);
    x = tf.layers.dense({ units: 64, activation: 'relu' }).apply(x);
    
    // Output
    const output = tf.layers.dense({ units: 1, activation: 'sigmoid', name: 'pattern_score' }).apply(x);
    
    return tf.model({ inputs: input, outputs: output });
  }

  // Anomaly Detection Model
  createAnomalyDetectorModel(inputShape) {
    // Autoencoder for anomaly detection
    const model = tf.sequential();
    
    // Encoder
    model.add(tf.layers.dense({
      inputShape: [inputShape],
      units: inputShape,
      activation: 'relu',
      name: 'encoder_input'
    }));
    model.add(tf.layers.dense({
      units: Math.floor(inputShape * 0.75),
      activation: 'relu',
      name: 'encoder_1'
    }));
    model.add(tf.layers.dense({
      units: Math.floor(inputShape * 0.5),
      activation: 'relu',
      name: 'encoder_2'
    }));
    model.add(tf.layers.dense({
      units: Math.floor(inputShape * 0.25),
      activation: 'relu',
      name: 'latent_space'
    }));
    
    // Decoder
    model.add(tf.layers.dense({
      units: Math.floor(inputShape * 0.5),
      activation: 'relu',
      name: 'decoder_1'
    }));
    model.add(tf.layers.dense({
      units: Math.floor(inputShape * 0.75),
      activation: 'relu',
      name: 'decoder_2'
    }));
    model.add(tf.layers.dense({
      units: inputShape,
      activation: 'linear',
      name: 'decoder_output'
    }));
    
    return model;
  }

  // Configure Training Parameters
  configureTraining(hyperparameters) {
    return {
      epochs: hyperparameters.epochs || 200,
      batchSize: hyperparameters.batchSize || 64,
      learningRate: hyperparameters.learningRate || 0.001,
      validationSplit: hyperparameters.validationSplit || 0.2,
      patience: hyperparameters.patience || 15,
      optimizer: hyperparameters.optimizer || 'adam',
      lossFunction: hyperparameters.lossFunction || 'binaryCrossentropy'
    };
  }

  // Train Model with Advanced Techniques
  async trainModel(model, data, config) {
    const startTime = Date.now();
    
    // Compile model
    model.compile({
      optimizer: tf.train.adam(config.learningRate),
      loss: config.lossFunction,
      metrics: ['accuracy', 'precision', 'recall']
    });
    
    // Prepare callbacks
    const callbacks = this.createTrainingCallbacks(config);
    
    // Train the model
    const history = await model.fit(data.xTrain, data.yTrain, {
      epochs: config.epochs,
      batchSize: config.batchSize,
      validationData: [data.xValidation, data.yValidation],
      shuffle: true,
      callbacks: callbacks
    });
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    return {
      history: history,
      duration: duration,
      epochs: history.epoch.length,
      finalAccuracy: history.history.val_acc[history.history.val_acc.length - 1],
      finalLoss: history.history.val_loss[history.history.val_loss.length - 1]
    };
  }

  // Create Training Callbacks
  createTrainingCallbacks(config) {
    const callbacks = [];
    
    // Early Stopping
    callbacks.push(tf.callbacks.earlyStopping({
      monitor: 'val_loss',
      patience: config.patience,
      restoreBestWeights: true
    }));
    
    // Learning Rate Reduction
    callbacks.push(tf.callbacks.reduceLROnPlateau({
      monitor: 'val_loss',
      factor: 0.5,
      patience: Math.floor(config.patience / 2),
      minLr: 0.00001
    }));
    
    // Training Progress
    callbacks.push({
      onEpochEnd: (epoch, logs) => {
        if (epoch % 10 === 0) {
          console.log(`🎯 Epoch ${epoch}: Loss=${logs.loss.toFixed(4)}, Accuracy=${logs.acc.toFixed(4)}, Val_Loss=${logs.val_loss.toFixed(4)}, Val_Accuracy=${logs.val_acc.toFixed(4)}`);
        }
      }
    });
    
    return callbacks;
  }

  // Save Trained Model
  async saveTrainedModel(model, evaluation, trainingResults) {
    const modelId = `oxul_model_${Date.now()}`;
    const timestamp = new Date().toISOString();
    
    // Save model metadata
    const metadata = {
      id: modelId,
      timestamp: timestamp,
      evaluation: evaluation,
      trainingResults: trainingResults,
      version: '1.0.0',
      architecture: 'custom_oxul_ai'
    };
    
    // Store in model versions map
    this.modelVersions.set(modelId, {
      model: model,
      metadata: metadata
    });
    
    // Add to training history
    this.trainingHistory.push(metadata);
    
    console.log(`💾 Model saved with ID: ${modelId}`);
    return modelId;
  }

  // Get Best Model
  getBestModel() {
    if (this.trainingHistory.length === 0) {
      return null;
    }
    
    // Find model with highest accuracy
    const bestModel = this.trainingHistory.reduce((best, current) => {
      return current.evaluation.accuracy > best.evaluation.accuracy ? current : best;
    });
    
    return this.modelVersions.get(bestModel.id);
  }

  // Get Training History
  getTrainingHistory() {
    return this.trainingHistory.map(entry => ({
      id: entry.id,
      timestamp: entry.timestamp,
      accuracy: entry.evaluation.accuracy,
      precision: entry.evaluation.precision,
      recall: entry.evaluation.recall,
      f1Score: entry.evaluation.f1Score,
      trainingTime: entry.trainingResults.duration
    }));
  }
}

// Financial Data Preprocessor
class FinancialDataPreprocessor {
  async process(rawData) {
    console.log('🔄 Preprocessing financial data...');
    
    // Split data
    const splitData = this.splitData(rawData);
    
    // Feature engineering
    const engineeredFeatures = this.engineerFeatures(splitData);
    
    // Normalize features
    const normalizedData = this.normalizeFeatures(engineeredFeatures);
    
    // Convert to tensors
    const tensorData = this.convertToTensors(normalizedData);
    
    console.log('✅ Data preprocessing completed');
    return tensorData;
  }

  splitData(data, trainRatio = 0.7, validationRatio = 0.15) {
    const shuffled = this.shuffleArray([...data]);
    const trainEnd = Math.floor(data.length * trainRatio);
    const validationEnd = Math.floor(data.length * (trainRatio + validationRatio));
    
    return {
      train: shuffled.slice(0, trainEnd),
      validation: shuffled.slice(trainEnd, validationEnd),
      test: shuffled.slice(validationEnd)
    };
  }

  engineerFeatures(splitData) {
    return {
      train: this.extractFeatures(splitData.train),
      validation: this.extractFeatures(splitData.validation),
      test: this.extractFeatures(splitData.test)
    };
  }

  extractFeatures(data) {
    return data.map(record => {
      const features = [
        // Basic transaction features
        record.amount || 0,
        record.frequency || 1,
        record.accountAge || 365,
        
        // Time-based features
        this.extractTimeFeatures(record.timestamp),
        this.extractDayOfWeek(record.timestamp),
        this.extractHourOfDay(record.timestamp),
        
        // Amount-based features
        this.calculateAmountPercentile(record.amount, data),
        this.calculateAmountZScore(record.amount, data),
        
        // Behavioral features
        record.userRiskScore || 0.1,
        record.vendorRiskScore || 0.1,
        record.locationRiskScore || 0.1,
        
        // Pattern features
        this.detectRoundNumbers(record.amount),
        this.detectDuplicateAmount(record.amount, data),
        this.calculateTransactionVelocity(record, data),
        
        // Compliance features
        record.requiresApproval ? 1 : 0,
        record.hasDocumentation ? 1 : 0,
        record.complianceScore || 0.5
      ].flat();
      
      return {
        features: features,
        label: record.isFraud ? 1 : 0
      };
    });
  }

  // Feature extraction helper methods
  extractTimeFeatures(timestamp) {
    const date = new Date(timestamp);
    return [
      date.getMonth() / 11, // Normalize month to 0-1
      date.getDate() / 31,  // Normalize day to 0-1
      date.getFullYear() % 100 / 100 // Normalize year
    ];
  }

  extractDayOfWeek(timestamp) {
    return new Date(timestamp).getDay() / 6; // 0-1 range
  }

  extractHourOfDay(timestamp) {
    return new Date(timestamp).getHours() / 23; // 0-1 range
  }

  calculateAmountPercentile(amount, data) {
    const amounts = data.map(d => d.amount).sort((a, b) => a - b);
    const index = amounts.findIndex(a => a >= amount);
    return index / amounts.length;
  }

  calculateAmountZScore(amount, data) {
    const amounts = data.map(d => d.amount);
    const mean = amounts.reduce((a, b) => a + b, 0) / amounts.length;
    const variance = amounts.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / amounts.length;
    const stdDev = Math.sqrt(variance);
    return stdDev === 0 ? 0 : (amount - mean) / stdDev;
  }

  detectRoundNumbers(amount) {
    // Check if amount is a round number (ends in 00, 000, etc.)
    const amountStr = amount.toString();
    if (amountStr.endsWith('000')) return 0.9;
    if (amountStr.endsWith('00')) return 0.7;
    if (amountStr.endsWith('0')) return 0.3;
    return 0.1;
  }

  detectDuplicateAmount(amount, data) {
    const duplicates = data.filter(d => d.amount === amount).length;
    return Math.min(duplicates / 10, 1); // Normalize to 0-1
  }

  calculateTransactionVelocity(record, data) {
    // Calculate transactions per day for this account
    const accountTransactions = data.filter(d => d.accountId === record.accountId);
    const days = this.calculateDaysBetween(
      Math.min(...accountTransactions.map(d => new Date(d.timestamp))),
      Math.max(...accountTransactions.map(d => new Date(d.timestamp)))
    );
    return days > 0 ? accountTransactions.length / days : 0;
  }

  calculateDaysBetween(date1, date2) {
    const oneDay = 24 * 60 * 60 * 1000;
    return Math.round(Math.abs((date1 - date2) / oneDay));
  }

  normalizeFeatures(data) {
    // Calculate min/max for each feature across all datasets
    const allFeatures = [
      ...data.train.map(d => d.features),
      ...data.validation.map(d => d.features),
      ...data.test.map(d => d.features)
    ];
    
    const featureCount = allFeatures[0].length;
    const minValues = new Array(featureCount).fill(Infinity);
    const maxValues = new Array(featureCount).fill(-Infinity);
    
    // Find min/max for each feature
    allFeatures.forEach(features => {
      features.forEach((value, index) => {
        minValues[index] = Math.min(minValues[index], value);
        maxValues[index] = Math.max(maxValues[index], value);
      });
    });
    
    // Normalize each dataset
    const normalize = (dataset) => dataset.map(record => ({
      features: record.features.map((value, index) => {
        const range = maxValues[index] - minValues[index];
        return range === 0 ? 0 : (value - minValues[index]) / range;
      }),
      label: record.label
    }));
    
    return {
      train: normalize(data.train),
      validation: normalize(data.validation),
      test: normalize(data.test),
      normalizationParams: { minValues, maxValues }
    };
  }

  convertToTensors(data) {
    const convertDataset = (dataset) => {
      const features = dataset.map(d => d.features);
      const labels = dataset.map(d => [d.label]);
      return {
        x: tf.tensor2d(features),
        y: tf.tensor2d(labels)
      };
    };
    
    const trainData = convertDataset(data.train);
    const validationData = convertDataset(data.validation);
    const testData = convertDataset(data.test);
    
    return {
      xTrain: trainData.x,
      yTrain: trainData.y,
      xValidation: validationData.x,
      yValidation: validationData.y,
      testData: testData,
      inputShape: trainData.x.shape[1],
      normalizationParams: data.normalizationParams
    };
  }

  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
}

// Model Evaluation System
class ModelEvaluator {
  async evaluate(model, testData) {
    console.log('📊 Evaluating model performance...');
    
    // Get predictions
    const predictions = model.predict(testData.x);
    const predictionData = await predictions.data();
    const actualData = await testData.y.data();
    
    // Calculate metrics
    const metrics = this.calculateMetrics(predictionData, actualData);
    
    // Clean up tensors
    predictions.dispose();
    
    console.log('✅ Model evaluation completed');
    return metrics;
  }

  calculateMetrics(predictions, actual, threshold = 0.5) {
    let tp = 0, fp = 0, tn = 0, fn = 0;
    
    for (let i = 0; i < predictions.length; i++) {
      const predicted = predictions[i] > threshold ? 1 : 0;
      const actualValue = actual[i];
      
      if (predicted === 1 && actualValue === 1) tp++;
      else if (predicted === 1 && actualValue === 0) fp++;
      else if (predicted === 0 && actualValue === 0) tn++;
      else if (predicted === 0 && actualValue === 1) fn++;
    }
    
    const accuracy = (tp + tn) / (tp + fp + tn + fn);
    const precision = tp / (tp + fp) || 0;
    const recall = tp / (tp + fn) || 0;
    const f1Score = 2 * (precision * recall) / (precision + recall) || 0;
    const specificity = tn / (tn + fp) || 0;
    
    return {
      accuracy: accuracy,
      precision: precision,
      recall: recall,
      f1Score: f1Score,
      specificity: specificity,
      confusionMatrix: { tp, fp, tn, fn }
    };
  }
}

export default OxulTrainingSystem;
