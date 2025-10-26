import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const LoadingComponents = {
  
  // AI Analysis Loading with progress
  AIAnalysisLoader: ({ progress = 0, currentStep = "Initializing..." }) => (
    <View style={styles.loaderContainer}>
      <View style={styles.loaderContent}>
        <Ionicons name="brain" size={48} color="#FF6B6B" />
        <Text style={styles.loaderTitle}>AI Analysis in Progress</Text>
        <Text style={styles.loaderStep}>{currentStep}</Text>
        
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressText}>{Math.round(progress)}%</Text>
        </View>
        
        <ActivityIndicator size="large" color="#FF6B6B" style={styles.spinner} />
      </View>
    </View>
  ),

  // File Upload Progress
  FileUploadLoader: ({ fileName, progress = 0 }) => (
    <View style={styles.uploadContainer}>
      <Ionicons name="cloud-upload" size={32} color="#2196F3" />
      <Text style={styles.uploadTitle}>Uploading {fileName}</Text>
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: '#2196F3' }]} />
        </View>
        <Text style={styles.progressText}>{Math.round(progress)}%</Text>
      </View>
    </View>
  ),

  // Success/Error Messages
  StatusMessage: ({ type, title, message, onClose }) => (
    <View style={[styles.statusContainer, styles[`status_${type}`]]}>
      <Ionicons 
        name={type === 'success' ? 'checkmark-circle' : type === 'error' ? 'alert-circle' : 'information-circle'} 
        size={24} 
        color={type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#007bff'} 
      />
      <View style={styles.statusText}>
        <Text style={styles.statusTitle}>{title}</Text>
        <Text style={styles.statusMessage}>{message}</Text>
      </View>
      {onClose && (
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close" size={20} color="#666" />
        </TouchableOpacity>
      )}
    </View>
  ),

  // Skeleton Loading for Lists
  SkeletonLoader: ({ lines = 3 }) => (
    <View style={styles.skeletonContainer}>
      {Array.from({ length: lines }).map((_, index) => (
        <View key={index} style={styles.skeletonLine} />
      ))}
    </View>
  )
};

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  loaderContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    minWidth: 280,
  },
  loaderTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  loaderStep: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  progressContainer: {
    width: '100%',
    marginBottom: 20,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e9ecef',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF6B6B',
    borderRadius: 4,
  },
  progressText: {
    textAlign: 'center',
    marginTop: 8,
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  spinner: {
    marginTop: 16,
  },
  uploadContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    margin: 16,
  },
  uploadTitle: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    margin: 16,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
  },
  status_success: {
    backgroundColor: '#d4edda',
    borderColor: '#c3e6cb',
    borderWidth: 1,
  },
  status_error: {
    backgroundColor: '#f8d7da',
    borderColor: '#f5c6cb',
    borderWidth: 1,
  },
  status_info: {
    backgroundColor: '#d1ecf1',
    borderColor: '#bee5eb',
    borderWidth: 1,
  },
  statusText: {
    flex: 1,
    marginLeft: 12,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  statusMessage: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  closeButton: {
    padding: 4,
  },
  skeletonContainer: {
    padding: 16,
  },
  skeletonLine: {
    height: 16,
    backgroundColor: '#e9ecef',
    borderRadius: 4,
    marginBottom: 8,
  },
});

export default LoadingComponents;