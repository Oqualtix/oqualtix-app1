import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import BrandConfig from '../config/BrandConfig';

const AlgorithmTrainer = ({ visible, onClose, onSaveCustomAlgorithm }) => {
  const [trainingData, setTrainingData] = useState([]);
  const [algorithmName, setAlgorithmName] = useState('');
  const [algorithmDescription, setAlgorithmDescription] = useState('');
  const [trainingStep, setTrainingStep] = useState('setup'); // setup, upload, configure, train, deploy
  const [isTraining, setIsTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);

  const algorithmTemplates = [
    {
      id: 'expense_patterns',
      name: 'Expense Pattern Recognition',
      description: 'Train AI to recognize unusual expense patterns specific to your organization',
      icon: 'trending-up-outline',
      dataTypes: ['Expense Reports', 'Purchase Orders', 'Vendor Payments'],
      complexity: 'Medium',
      estimatedTrainingTime: '2-4 hours'
    },
    {
      id: 'vendor_behavior',
      name: 'Vendor Behavior Analysis',
      description: 'Detect suspicious vendor relationships and payment anomalies',
      icon: 'business-outline',
      dataTypes: ['Vendor Contracts', 'Payment History', 'Invoice Data'],
      complexity: 'High',
      estimatedTrainingTime: '4-8 hours'
    },
    {
      id: 'employee_spending',
      name: 'Employee Spending Profiles',
      description: 'Create spending baselines and detect unusual employee behavior',
      icon: 'person-outline',
      dataTypes: ['Employee Expenses', 'Credit Card Statements', 'Reimbursements'],
      complexity: 'Medium',
      estimatedTrainingTime: '1-3 hours'
    },
    {
      id: 'transaction_timing',
      name: 'Transaction Timing Analysis',
      description: 'Identify suspicious transaction timing patterns and frequencies',
      icon: 'time-outline',
      dataTypes: ['Transaction Logs', 'Timestamps', 'Frequency Data'],
      complexity: 'Low',
      estimatedTrainingTime: '1-2 hours'
    },
    {
      id: 'custom_model',
      name: 'Custom Detection Model',
      description: 'Build your own specialized fraud detection algorithm from scratch',
      icon: 'construct-outline',
      dataTypes: ['Any Financial Data', 'Custom Formats', 'Specialized Sources'],
      complexity: 'Expert',
      estimatedTrainingTime: '8-24 hours'
    }
  ];

  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setAlgorithmName(template.name);
    setAlgorithmDescription(template.description);
    setTrainingStep('upload');
  };

  const handleFileUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
        multiple: true,
      });

      if (!result.canceled && result.assets) {
        const newFiles = result.assets.map(asset => ({
          id: Date.now() + Math.random(),
          name: asset.name,
          uri: asset.uri,
          size: asset.size,
          type: asset.mimeType,
          uploaded: false,
          processed: false
        }));
        
        setTrainingData(prev => [...prev, ...newFiles]);
        
        Alert.alert(
          'Files Selected',
          `${newFiles.length} file(s) selected for training. These will be used to train your custom algorithm.`,
          [{ text: 'Continue' }]
        );
      }
    } catch (error) {
      console.error('Error picking files:', error);
      Alert.alert('Error', 'Failed to select files. Please try again.');
    }
  };

  const handleStartTraining = async () => {
    if (trainingData.length === 0) {
      Alert.alert('No Data', 'Please upload training data first.');
      return;
    }

    if (!algorithmName.trim()) {
      Alert.alert('Missing Name', 'Please provide a name for your algorithm.');
      return;
    }

    setIsTraining(true);
    setTrainingProgress(0);
    setTrainingStep('train');

    // Simulate training process
    const trainingSteps = [
      'Preprocessing data...',
      'Feature extraction...',
      'Pattern analysis...',
      'Model training...',
      'Validation testing...',
      'Performance optimization...',
      'Final model generation...'
    ];

    for (let i = 0; i < trainingSteps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setTrainingProgress(((i + 1) / trainingSteps.length) * 100);
    }

    setIsTraining(false);
    setTrainingStep('deploy');
    
    Alert.alert(
      'Training Complete!',
      `Your custom algorithm "${algorithmName}" has been successfully trained and is ready for deployment.`,
      [{ text: 'Deploy Now', onPress: handleDeploy }]
    );
  };

  const handleDeploy = async () => {
    const customAlgorithm = {
      id: Date.now(),
      name: algorithmName,
      description: algorithmDescription,
      template: selectedTemplate,
      trainingData: trainingData.length,
      createdAt: new Date(),
      status: 'active',
      accuracy: 94.7 + Math.random() * 4, // Simulated accuracy
      detections: 0
    };

    onSaveCustomAlgorithm(customAlgorithm);
    onClose();
    
    Alert.alert(
      'Algorithm Deployed!',
      `${algorithmName} is now active and monitoring your financial data. You can view its performance in the dashboard.`,
      [{ text: 'Great!' }]
    );
  };

  const renderSetupStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Choose Algorithm Type</Text>
      <Text style={styles.stepDescription}>
        Select a template that best matches your fraud detection needs:
      </Text>

      <ScrollView style={styles.templatesContainer} showsVerticalScrollIndicator={false}>
        {algorithmTemplates.map((template) => (
          <TouchableOpacity
            key={template.id}
            style={[
              styles.templateCard,
              selectedTemplate?.id === template.id && styles.selectedTemplate
            ]}
            onPress={() => handleTemplateSelect(template)}
          >
            <View style={styles.templateHeader}>
              <View style={styles.templateIcon}>
                <Ionicons name={template.icon} size={24} color={BrandConfig.colors.primary} />
              </View>
              <View style={styles.templateInfo}>
                <Text style={styles.templateName}>{template.name}</Text>
                <Text style={styles.templateDescription}>{template.description}</Text>
              </View>
            </View>

            <View style={styles.templateDetails}>
              <View style={styles.templateRow}>
                <Text style={styles.templateLabel}>Data Types:</Text>
                <Text style={styles.templateValue}>{template.dataTypes.join(', ')}</Text>
              </View>
              <View style={styles.templateRow}>
                <Text style={styles.templateLabel}>Complexity:</Text>
                <Text style={[styles.templateValue, { color: template.complexity === 'Expert' ? '#FF6B6B' : BrandConfig.colors.success }]}>
                  {template.complexity}
                </Text>
              </View>
              <View style={styles.templateRow}>
                <Text style={styles.templateLabel}>Training Time:</Text>
                <Text style={styles.templateValue}>{template.estimatedTrainingTime}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderUploadStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Upload Training Data</Text>
      <Text style={styles.stepDescription}>
        Upload CSV or Excel files containing historical financial data for training:
      </Text>

      <TouchableOpacity style={styles.uploadButton} onPress={handleFileUpload}>
        <Ionicons name="cloud-upload-outline" size={32} color={BrandConfig.colors.primary} />
        <Text style={styles.uploadButtonText}>Select Files</Text>
        <Text style={styles.uploadButtonSubtext}>CSV, Excel files supported</Text>
      </TouchableOpacity>

      {trainingData.length > 0 && (
        <View style={styles.filesContainer}>
          <Text style={styles.filesHeader}>Selected Files ({trainingData.length})</Text>
          {trainingData.map((file) => (
            <View key={file.id} style={styles.fileItem}>
              <Ionicons name="document-outline" size={20} color={BrandConfig.colors.textSecondary} />
              <View style={styles.fileInfo}>
                <Text style={styles.fileName}>{file.name}</Text>
                <Text style={styles.fileSize}>{(file.size / 1024).toFixed(1)} KB</Text>
              </View>
              <TouchableOpacity onPress={() => setTrainingData(prev => prev.filter(f => f.id !== file.id))}>
                <Ionicons name="close-circle-outline" size={20} color="#FF6B6B" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      <View style={styles.algorithmConfig}>
        <TextInput
          style={styles.input}
          value={algorithmName}
          onChangeText={setAlgorithmName}
          placeholder="Algorithm Name"
          placeholderTextColor={BrandConfig.colors.textMuted}
        />
        <TextInput
          style={[styles.input, styles.textArea]}
          value={algorithmDescription}
          onChangeText={setAlgorithmDescription}
          placeholder="Description (optional)"
          placeholderTextColor={BrandConfig.colors.textMuted}
          multiline
          numberOfLines={3}
        />
      </View>

      {trainingData.length > 0 && (
        <TouchableOpacity style={styles.startTrainingButton} onPress={handleStartTraining}>
          <Text style={styles.startTrainingButtonText}>Start Training</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderTrainingStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Training in Progress</Text>
      <Text style={styles.stepDescription}>
        Your custom algorithm is being trained on the provided data...
      </Text>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${trainingProgress}%` }]} />
        </View>
        <Text style={styles.progressText}>{Math.round(trainingProgress)}% Complete</Text>
      </View>

      <View style={styles.trainingInfo}>
        <Ionicons name="settings-outline" size={24} color={BrandConfig.colors.primary} />
        <Text style={styles.trainingInfoText}>
          Training neural networks with your financial data patterns...
        </Text>
      </View>
    </View>
  );

  const renderDeployStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Ready to Deploy</Text>
      <Text style={styles.stepDescription}>
        Your custom algorithm has been successfully trained and validated!
      </Text>

      <View style={styles.resultsContainer}>
        <View style={styles.resultItem}>
          <Text style={styles.resultLabel}>Training Accuracy:</Text>
          <Text style={styles.resultValue}>96.3%</Text>
        </View>
        <View style={styles.resultItem}>
          <Text style={styles.resultLabel}>Validation Score:</Text>
          <Text style={styles.resultValue}>94.7%</Text>
        </View>
        <View style={styles.resultItem}>
          <Text style={styles.resultLabel}>Data Points Processed:</Text>
          <Text style={styles.resultValue}>{trainingData.length * 1000}+</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.deployButton} onPress={handleDeploy}>
        <Text style={styles.deployButtonText}>Deploy Algorithm</Text>
      </TouchableOpacity>
    </View>
  );

  const getCurrentStepContent = () => {
    switch (trainingStep) {
      case 'setup': return renderSetupStep();
      case 'upload': return renderUploadStep();
      case 'train': return renderTrainingStep();
      case 'deploy': return renderDeployStep();
      default: return renderSetupStep();
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={BrandConfig.colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>Custom Algorithm Training</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.progressSteps}>
          {['setup', 'upload', 'train', 'deploy'].map((step, index) => (
            <View key={step} style={styles.progressStep}>
              <View style={[
                styles.progressStepCircle,
                (trainingStep === step || ['upload', 'train', 'deploy'].includes(trainingStep) && index <= ['setup', 'upload', 'train', 'deploy'].indexOf(trainingStep)) && styles.activeStep
              ]}>
                <Text style={[
                  styles.progressStepText,
                  (trainingStep === step || ['upload', 'train', 'deploy'].includes(trainingStep) && index <= ['setup', 'upload', 'train', 'deploy'].indexOf(trainingStep)) && styles.activeStepText
                ]}>
                  {index + 1}
                </Text>
              </View>
              {index < 3 && <View style={styles.progressStepLine} />}
            </View>
          ))}
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {getCurrentStepContent()}
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  activeStep: {
    backgroundColor: BrandConfig.colors.primary,
  },
  activeStepText: {
    color: BrandConfig.colors.textWhite,
  },
  algorithmConfig: {
    gap: 16,
    marginBottom: 24,
  },
  closeButton: {
    padding: 8,
  },
  container: {
    backgroundColor: BrandConfig.colors.background,
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  deployButton: {
    alignItems: 'center',
    backgroundColor: BrandConfig.colors.success,
    borderRadius: 8,
    padding: 16,
  },
  deployButtonText: {
    color: BrandConfig.colors.textWhite,
    fontSize: 16,
    fontWeight: '600',
  },
  fileInfo: {
    flex: 1,
  },
  fileItem: {
    alignItems: 'center',
    backgroundColor: BrandConfig.colors.surface,
    borderRadius: 8,
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
    padding: 12,
  },
  fileName: {
    color: BrandConfig.colors.textPrimary,
    fontSize: 14,
    fontWeight: '500',
  },
  fileSize: {
    color: BrandConfig.colors.textSecondary,
    fontSize: 12,
  },
  filesContainer: {
    marginBottom: 24,
  },
  filesHeader: {
    color: BrandConfig.colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  header: {
    alignItems: 'center',
    backgroundColor: BrandConfig.colors.surface,
    borderBottomColor: BrandConfig.colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  input: {
    backgroundColor: BrandConfig.colors.surface,
    borderColor: BrandConfig.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    color: BrandConfig.colors.textPrimary,
    fontSize: 16,
    padding: 12,
  },
  placeholder: {
    width: 40,
  },
  progressBar: {
    backgroundColor: BrandConfig.colors.border,
    borderRadius: 4,
    height: 8,
    marginBottom: 12,
    overflow: 'hidden',
  },
  progressContainer: {
    marginBottom: 32,
  },
  progressFill: {
    backgroundColor: BrandConfig.colors.primary,
    height: '100%',
  },
  progressStep: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  progressStepCircle: {
    alignItems: 'center',
    backgroundColor: BrandConfig.colors.border,
    borderRadius: 16,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  progressStepLine: {
    backgroundColor: BrandConfig.colors.border,
    height: 2,
    marginHorizontal: 8,
    width: 40,
  },
  progressStepText: {
    color: BrandConfig.colors.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
  progressSteps: {
    alignItems: 'center',
    backgroundColor: BrandConfig.colors.backgroundSecondary,
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  progressText: {
    color: BrandConfig.colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  resultItem: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  resultLabel: {
    color: BrandConfig.colors.textSecondary,
    fontSize: 16,
  },
  resultValue: {
    color: BrandConfig.colors.primary,
    fontSize: 18,
    fontWeight: '600',
  },
  resultsContainer: {
    backgroundColor: BrandConfig.colors.surface,
    borderRadius: 12,
    gap: 16,
    marginBottom: 24,
    padding: 20,
  },
  selectedTemplate: {
    backgroundColor: BrandConfig.colors.backgroundTertiary,
    borderColor: BrandConfig.colors.primary,
  },
  startTrainingButton: {
    alignItems: 'center',
    backgroundColor: BrandConfig.colors.primary,
    borderRadius: 8,
    padding: 16,
  },
  startTrainingButtonText: {
    color: BrandConfig.colors.textWhite,
    fontSize: 16,
    fontWeight: '600',
  },
  stepContainer: {
    paddingVertical: 20,
  },
  stepDescription: {
    color: BrandConfig.colors.textSecondary,
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 24,
  },
  stepTitle: {
    color: BrandConfig.colors.textPrimary,
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  templateCard: {
    backgroundColor: BrandConfig.colors.surface,
    borderColor: BrandConfig.colors.border,
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 16,
    padding: 16,
  },
  templateDescription: {
    color: BrandConfig.colors.textSecondary,
    fontSize: 14,
    lineHeight: 18,
  },
  templateDetails: {
    gap: 8,
  },
  templateHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    marginBottom: 12,
  },
  templateIcon: {
    alignItems: 'center',
    backgroundColor: BrandConfig.colors.backgroundSecondary,
    borderRadius: 24,
    height: 48,
    justifyContent: 'center',
    marginRight: 12,
    width: 48,
  },
  templateInfo: {
    flex: 1,
  },
  templateLabel: {
    color: BrandConfig.colors.textPrimary,
    fontSize: 14,
    fontWeight: '500',
    width: 120,
  },
  templateName: {
    color: BrandConfig.colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  templateRow: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  templateValue: {
    color: BrandConfig.colors.textSecondary,
    flex: 1,
    fontSize: 14,
  },
  templatesContainer: {
    maxHeight: 400,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  title: {
    color: BrandConfig.colors.textPrimary,
    fontSize: 18,
    fontWeight: '600',
  },
  trainingInfo: {
    alignItems: 'center',
    backgroundColor: BrandConfig.colors.backgroundSecondary,
    borderRadius: 8,
    flexDirection: 'row',
    gap: 12,
    padding: 16,
  },
  trainingInfoText: {
    color: BrandConfig.colors.textSecondary,
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  uploadButton: {
    alignItems: 'center',
    backgroundColor: BrandConfig.colors.surface,
    borderColor: BrandConfig.colors.primary,
    borderRadius: 12,
    borderStyle: 'dashed',
    borderWidth: 2,
    marginBottom: 24,
    padding: 40,
  },
  uploadButtonSubtext: {
    color: BrandConfig.colors.textSecondary,
    fontSize: 14,
    marginTop: 4,
  },
  uploadButtonText: {
    color: BrandConfig.colors.primary,
    fontSize: 18,
    fontWeight: '600',
    marginTop: 8,
  },
});

export default AlgorithmTrainer;