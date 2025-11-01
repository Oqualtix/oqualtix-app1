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
  closeButton: {
    padding: 4,
  },
  loaderContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    flex: 1,
    justifyContent: 'center',
  },
  loaderContent: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    minWidth: 280,
    padding: 32,
  },
  loaderStep: {
    color: '#666',
    fontSize: 14,
    marginBottom: 20,
  },
  loaderTitle: {
    color: '#333',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 16,
  },
  progressBar: {
    backgroundColor: '#e9ecef',
    borderRadius: 4,
    height: 8,
    overflow: 'hidden',
  },
  progressContainer: {
    marginBottom: 20,
    width: '100%',
  },
  progressFill: {
    backgroundColor: '#FF6B6B',
    borderRadius: 4,
    height: '100%',
  },
  progressText: {
    color: '#333',
    fontSize: 14,
    fontWeight: '500',
    marginTop: 8,
    textAlign: 'center',
  },
  skeletonContainer: {
    padding: 16,
  },
  skeletonLine: {
    backgroundColor: '#e9ecef',
    borderRadius: 4,
    height: 16,
    marginBottom: 8,
  },
  spinner: {
    marginTop: 16,
  },
  statusContainer: {
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    flexDirection: 'row',
    margin: 16,
    padding: 16,
  },
  statusMessage: {
    color: '#666',
    fontSize: 14,
    marginTop: 4,
  },
  statusText: {
    flex: 1,
    marginLeft: 12,
  },
  statusTitle: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
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
  status_success: {
    backgroundColor: '#d4edda',
    borderColor: '#c3e6cb',
    borderWidth: 1,
  },
  uploadContainer: {
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    flexDirection: 'row',
    margin: 16,
    padding: 16,
  },
  uploadTitle: {
    color: '#333',
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 12,
  },
});

export default LoadingComponents;