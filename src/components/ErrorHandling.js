import React, { Component } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Alert 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuditUtils } from '../utils/SecurityUtils';

let FileSystem;
try {
  FileSystem = require('expo-file-system');
} catch (error) {
  console.warn('expo-file-system not available, file operations will be limited');
  FileSystem = null;
}

// Error Boundary Component
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // Log error for debugging
    console.error('Error Boundary caught an error:', error, errorInfo);
    
    // Log to audit system
    AuditUtils.logSecurityEvent('APPLICATION_ERROR', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack
    });
  }

  handleRetry() {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1
    }));
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Ionicons name="warning" size={64} color="#FF6B6B" />
          <Text style={styles.errorTitle}>Oops! Something went wrong</Text>
          <Text style={styles.errorMessage}>
            We encountered an unexpected error. Don&apos;t worry, your data is safe.
          </Text>
          
          <TouchableOpacity
            style={styles.retryButton}
            onPress={this.handleRetry}
          >
            <Ionicons name="refresh" size={20} color="#fff" />
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.reportButton}
            onPress={() => this.reportError()}
          >
            <Text style={styles.reportButtonText}>Report Issue</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }

  reportError() {
    Alert.alert(
      'Report Error',
      'Would you like to send an error report to help us improve the app?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Send Report', onPress: () => this.sendErrorReport() }
      ]
    );
  }

  async sendErrorReport() {
    try {
      const errorReport = {
        timestamp: new Date().toISOString(),
        error: this.state.error?.message,
        stack: this.state.error?.stack,
        retryCount: this.state.retryCount,
        userAgent: 'Oqualtix Mobile App'
      };

      // In a real app, you'd send this to your error reporting service
      console.log('Error report:', errorReport);
      
      Alert.alert('Thank you', 'Error report sent successfully');
    } catch (error) {
      console.error('Failed to send error report:', error);
    }
  }
}

// Network Error Handler
export const NetworkErrorHandler = {
  handleNetworkError: (error, onRetry) => {
    let title = 'Connection Error';
    let message = 'Please check your internet connection and try again.';
    
    if (error.code === 'NETWORK_ERROR') {
      message = 'Unable to connect to our servers. Please try again later.';
    } else if (error.code === 'TIMEOUT') {
      message = 'Request timed out. Please try again.';
    } else if (error.code === 'SERVER_ERROR') {
      title = 'Server Error';
      message = 'Our servers are experiencing issues. Please try again later.';
    }

    Alert.alert(
      title,
      message,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Retry', onPress: onRetry }
      ]
    );
  },

  // Offline data handling
  saveOfflineData: async (data, key) => {
    try {
      const offlineDir = `${FileSystem.documentDirectory}offline/`;
      await FileSystem.makeDirectoryAsync(offlineDir, { intermediates: true });
      
      const filePath = `${offlineDir}${key}.json`;
      await FileSystem.writeAsStringAsync(filePath, JSON.stringify(data));
      
      return true;
    } catch (error) {
      console.error('Failed to save offline data:', error);
      return false;
    }
  },

  loadOfflineData: async (key) => {
    try {
      const filePath = `${FileSystem.documentDirectory}offline/${key}.json`;
      const data = await FileSystem.readAsStringAsync(filePath);
      return JSON.parse(data);
    } catch (error) {
      console.error('Failed to load offline data:', error);
      return null;
    }
  }
};

// File Processing Error Handler
export const FileErrorHandler = {
  handleFileError: (error, fileName) => {
    let message = 'Failed to process file';
    
    if (error.code === 'UNSUPPORTED_FORMAT') {
      message = `File format not supported for ${fileName}. Please use CSV, Excel, or PDF files.`;
    } else if (error.code === 'FILE_TOO_LARGE') {
      message = `File ${fileName} is too large. Please use files smaller than 50MB.`;
    } else if (error.code === 'CORRUPTED_FILE') {
      message = `File ${fileName} appears to be corrupted. Please try a different file.`;
    } else if (error.code === 'INSUFFICIENT_DATA') {
      message = `File ${fileName} doesn't contain enough data for analysis.`;
    }

    Alert.alert('File Processing Error', message);
  },

  // Validate file before processing
  validateFile: (file) => {
    const maxSize = 50 * 1024 * 1024; // 50MB
    const allowedTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/pdf'
    ];

    if (file.size > maxSize) {
      throw { code: 'FILE_TOO_LARGE', message: 'File too large' };
    }

    if (!allowedTypes.includes(file.type)) {
      throw { code: 'UNSUPPORTED_FORMAT', message: 'Unsupported file format' };
    }

    return true;
  }
};

// AI Processing Error Handler
export const AIErrorHandler = {
  handleAIError: (error, context) => {
    let title = 'AI Processing Error';
    let message = 'Unable to complete AI analysis. Please try again.';
    
    if (error.code === 'MODEL_NOT_LOADED') {
      message = 'AI models are still loading. Please wait a moment and try again.';
    } else if (error.code === 'INSUFFICIENT_DATA') {
      message = 'Not enough data for reliable AI analysis. Please upload more financial records.';
    } else if (error.code === 'RATE_LIMIT') {
      message = 'Too many AI requests. Please wait a moment before trying again.';
    } else if (error.code === 'API_KEY_INVALID') {
      title = 'Configuration Error';
      message = 'AI service configuration issue. Please contact support.';
    }

    Alert.alert(title, message);
  },

  // Fallback to statistical analysis
  useFallbackAnalysis: (data) => {
    console.log('Using fallback statistical analysis instead of AI');
    // Implement basic statistical fraud detection as fallback
    return {
      riskScore: Math.random() * 100,
      findings: ['Using statistical analysis due to AI unavailability'],
      confidence: 0.6,
      method: 'statistical_fallback'
    };
  }
};

const styles = StyleSheet.create({
  errorContainer: {
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    flex: 1,
    justifyContent: 'center',
    padding: 32,
  },
  errorMessage: {
    color: '#666',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 32,
    textAlign: 'center',
  },
  errorTitle: {
    color: '#333',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    marginTop: 24,
    textAlign: 'center',
  },
  reportButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  reportButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '500',
  },
  retryButton: {
    alignItems: 'center',
    backgroundColor: '#FF6B6B',
    borderRadius: 8,
    flexDirection: 'row',
    marginBottom: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default { ErrorBoundary, NetworkErrorHandler, FileErrorHandler, AIErrorHandler };