import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as DocumentPicker from 'expo-document-picker';
import { ValidationUtils, AuditUtils } from '../utils/SecurityUtils';
import FileProcessingUtils from '../utils/FileProcessingUtils';
import EmbezzlementDetectionUtils from '../utils/EmbezzlementDetectionUtils';
import EmbezzlementAlertModal from '../components/EmbezzlementAlertModal';
import { useAuth } from '../context/AuthContext';

// Import new components
import { DataVisualizationComponents } from '../components/DataVisualizationComponents';
import TemplateGenerator from '../utils/TemplateGenerator';

const FinancialTrackingScreen = () => {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [embezzlementAlerts, setEmbezzlementAlerts] = useState([]);
  const [currentAlert, setCurrentAlert] = useState(null);
  const [alertModalVisible, setAlertModalVisible] = useState(false);
  const [userProfile, setUserProfile] = useState({});
  const navigation = useNavigation();
  const { user } = useAuth();

  useEffect(() => {
    // Add settings button to header
    navigation.setOptions({
      headerRight: () => (
        <View style={styles.headerButtons}>
          <TouchableOpacity
            onPress={() => setUploadModalVisible(true)}
            style={styles.headerButton}
          >
            <Ionicons name="cloud-upload-outline" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('Settings')}
            style={styles.headerButton}
          >
            <Ionicons name="settings-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      ),
    });

    // Load initial data
    loadTransactions();
  }, [navigation]);

  useEffect(() => {
    filterTransactions();
  }, [transactions, selectedFilter, searchQuery]);

  const loadTransactions = () => {
    // Mock financial data with some suspicious transactions to trigger alerts
    const mockTransactions = [
      // Normal transactions (establish baseline pattern)
      {
        id: '1',
        date: new Date('2024-01-15'),
        description: 'Office Supplies - Staples',
        amount: -234.56,
        category: 'Operating Expenses',
        account: 'Business Checking',
        type: 'expense',
        vendor: 'Staples Inc.',
        reference: 'INV-2024-001',
      },
      {
        id: '2',
        date: new Date('2024-01-14'),
        description: 'Client Payment - ABC Corp',
        amount: 15000.00,
        category: 'Revenue',
        account: 'Business Checking',
        type: 'income',
        vendor: 'ABC Corporation',
        reference: 'PAY-2024-015',
      },
      {
        id: '3',
        date: new Date('2024-01-13'),
        description: 'Software License - Adobe',
        amount: -599.99,
        category: 'Software & IT',
        account: 'Business Credit Card',
        type: 'expense',
        vendor: 'Adobe Systems',
        reference: 'SUB-2024-Q1',
      },
      {
        id: '4',
        date: new Date('2024-01-12'),
        description: 'Consulting Services',
        amount: 7500.00,
        category: 'Revenue',
        account: 'Business Checking',
        type: 'income',
        vendor: 'XYZ Consulting',
        reference: 'INV-CS-847',
      },
      {
        id: '5',
        date: new Date('2024-01-11'),
        description: 'Travel Expenses - Hotel',
        amount: -487.23,
        category: 'Travel & Entertainment',
        account: 'Business Credit Card',
        type: 'expense',
        vendor: 'Marriott Hotels',
        reference: 'RES-2024-089',
      },
      {
        id: '6',
        date: new Date('2024-01-10'),
        description: 'Equipment Purchase - Laptop',
        amount: -2499.99,
        category: 'Equipment',
        account: 'Business Checking',
        type: 'expense',
        vendor: 'Dell Technologies',
        reference: 'PO-2024-003',
      },
      {
        id: '7',
        date: new Date('2024-01-09'),
        description: 'Monthly Rent',
        amount: -4500.00,
        category: 'Rent & Utilities',
        account: 'Business Checking',
        type: 'expense',
        vendor: 'Property Management LLC',
        reference: 'RENT-JAN-2024',
      },
      
      // SUSPICIOUS TRANSACTIONS that will trigger alerts
      {
        id: '8',
        date: new Date('2024-01-08T02:30:00'), // 2:30 AM - off hours
        description: 'Cash Withdrawal - ATM',
        amount: -9500.00, // Large unusual amount - 4x average
        category: 'Operating Expenses',
        account: 'Business Checking',
        type: 'expense',
        vendor: 'Quick Cash ATM',
        reference: 'ATM-2024-001',
      },
      {
        id: '9',
        date: new Date('2024-01-07T23:45:00'), // 11:45 PM - off hours
        description: 'Consulting Fee - Unknown Vendor',
        amount: -15000.00, // Large payment to new vendor
        category: 'Professional Services',
        account: 'Business Checking',
        type: 'expense',
        vendor: 'Phantom Consulting LLC', // New vendor, large amount
        reference: 'CONS-2024-999',
      },
      {
        id: '10',
        date: new Date('2024-01-06T00:15:00'), // Saturday 12:15 AM - weekend + off hours
        description: 'Equipment Purchase - Electronics',
        amount: -8000.00, // Round number, weekend transaction
        category: 'Equipment',
        account: 'Business Credit Card',
        type: 'expense',
        vendor: 'Electronics Store',
        reference: 'SAT-PURCHASE-001',
      },
      {
        id: '11',
        date: new Date('2024-01-05T10:30:00'), // Normal hours
        description: 'Professional Services Fee',
        amount: -1200.00,
        category: 'Professional Services',
        account: 'Business Checking',
        type: 'expense',
        vendor: 'Legal Associates',
        reference: 'LEG-2024-001',
      },
      {
        id: '12',
        date: new Date('2024-01-05T10:35:00'), // 5 minutes later - rapid succession
        description: 'Duplicate Consulting Payment',
        amount: -1200.00, // Exact duplicate - rapid succession
        category: 'Professional Services',
        account: 'Business Checking',
        type: 'expense',
        vendor: 'Legal Associates',
        reference: 'LEG-2024-002',
      },
      {
        id: '13',
        date: new Date('2024-01-04T03:15:00'), // 3:15 AM - very off hours
        description: 'Late Night Purchase - Office Supplies',
        amount: -2500.00, // Off-hours transaction
        category: 'Operating Expenses',
        account: 'Business Credit Card',
        type: 'expense',
        vendor: 'Midnight Office Supply',
        reference: 'LATE-2024-001',
      },
      {
        id: '14',
        date: new Date('2024-01-03'),
        description: 'Insurance Premium',
        amount: -825.00,
        category: 'Insurance',
        account: 'Business Checking',
        type: 'expense',
        vendor: 'Business Insurance Co.',
        reference: 'POL-2024-Q1',
      },
    ];

    // Sort by date (newest first)
    const sortedTransactions = mockTransactions.sort((a, b) => b.date - a.date);
    setTransactions(sortedTransactions);
    
    // Run embezzlement detection analysis
    analyzeForEmbezzlement(sortedTransactions);
  };

  const analyzeForEmbezzlement = async (transactionList) => {
    try {
      // Analyze transactions for suspicious patterns
      const analysisResult = EmbezzlementDetectionUtils.analyzeForEmbezzlement(
        transactionList, 
        userProfile
      );
      
      // Update user profile with new patterns
      setUserProfile(analysisResult.userPatterns);
      
      // Check for new alerts
      const newAlerts = analysisResult.alerts.filter(alert => 
        !embezzlementAlerts.some(existing => existing.id === alert.id)
      );
      
      if (newAlerts.length > 0) {
        setEmbezzlementAlerts(prev => [...prev, ...newAlerts]);
        
        // Show the first new high-priority alert immediately
        const highPriorityAlert = newAlerts.find(alert => alert.riskLevel === 'HIGH');
        const alertToShow = highPriorityAlert || newAlerts[0];
        
        if (alertToShow && EmbezzlementDetectionUtils.shouldSendAlert(user?.id, 'POTENTIAL_EMBEZZLEMENT')) {
          setTimeout(() => {
            setCurrentAlert(alertToShow);
            setAlertModalVisible(true);
          }, 1000); // Small delay to allow UI to settle
        }
      }
      
    } catch (error) {
      console.error('Error analyzing for embezzlement:', error);
    }
  };

  const filterTransactions = () => {
    let filtered = transactions;

    // Apply category filter
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(transaction => 
        transaction.type === selectedFilter
      );
    }

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(transaction =>
        transaction.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transaction.vendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transaction.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredTransactions(filtered);
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadTransactions();
    setTimeout(() => setRefreshing(false), 1000);
  };

  // Handle embezzlement alert responses
  const handleNotMyPurchase = async (alert) => {
    try {
      setAlertModalVisible(false);
      
      // Process the user's response
      const updatedAlert = EmbezzlementDetectionUtils.processUserResponse(
        alert, 
        'NOT_MY_PURCHASE', 
        user?.id
      );
      
      // Update the alert in our state
      setEmbezzlementAlerts(prev => 
        prev.map(a => a.id === alert.id ? updatedAlert : a)
      );
      
      // Navigate to investigation screen
      navigation.navigate('Investigation', { alert: updatedAlert });
      
    } catch (error) {
      console.error('Error processing alert response:', error);
      Alert.alert('Error', 'Failed to process your response. Please try again.');
    }
  };

  const handleMyPurchase = async (alert) => {
    try {
      setAlertModalVisible(false);
      
      // Process the user's response
      const updatedAlert = EmbezzlementDetectionUtils.processUserResponse(
        alert, 
        'MY_PURCHASE', 
        user?.id
      );
      
      // Update the alert in our state
      setEmbezzlementAlerts(prev => 
        prev.map(a => a.id === alert.id ? updatedAlert : a)
      );
      
      // Navigate to confirmation screen
      navigation.navigate('PurchaseConfirmation', { alert: updatedAlert });
      
    } catch (error) {
      console.error('Error processing alert response:', error);
      Alert.alert('Error', 'Failed to process your response. Please try again.');
    }
  };

  const handleDismissAlert = () => {
    setAlertModalVisible(false);
    setCurrentAlert(null);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(Math.abs(amount));
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getTransactionIcon = (category) => {
    const iconMap = {
      'Revenue': 'trending-up',
      'Operating Expenses': 'business',
      'Software & IT': 'desktop',
      'Travel & Entertainment': 'airplane',
      'Equipment': 'hardware-chip',
      'Rent & Utilities': 'home',
      'Professional Services': 'briefcase',
      'Insurance': 'shield-checkmark',
    };
    return iconMap[category] || 'receipt';
  };

  const calculateSummary = () => {
    const income = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expenses = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    return { income, expenses, netFlow: income - expenses };
  };

  const summary = calculateSummary();

  // Handle file upload
  const handleFileUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/csv'],
        copyToCacheDirectory: true,
        multiple: true,
      });

      if (!result.canceled) {
        setIsUploading(true);
        const files = result.assets;
        let successCount = 0;
        let totalTransactions = 0;
        
        for (const file of files) {
          // Validate file
          const validation = ValidationUtils.validateFile(file);
          if (!validation.isValid) {
            Alert.alert('File Error', `${file.name}: ${validation.error}`);
            continue;
          }

          // Process file
          const processResult = await FileProcessingUtils.processFinancialFile(file);
          
          if (processResult.success && processResult.data.transactions) {
            // Add imported transactions to existing data
            const importedTransactions = processResult.data.transactions.map(transaction => ({
              ...transaction,
              importedFrom: file.name,
              importedAt: new Date().toISOString(),
            }));
            
            setTransactions(prev => [...importedTransactions, ...prev]);
            setUploadedFiles(prev => [...prev, {
              name: file.name,
              size: file.size,
              transactionCount: importedTransactions.length,
              uploadedAt: new Date().toISOString(),
            }]);
            
            successCount++;
            totalTransactions += importedTransactions.length;
            
            // Log successful upload
            AuditUtils.logSecurityEvent('FINANCIAL_DATA_UPLOAD', {
              userId: user.id,
              fileName: file.name,
              fileSize: file.size,
              transactionCount: importedTransactions.length
            });
          } else {
            Alert.alert('Processing Error', `Failed to process ${file.name}: ${processResult.error}`);
          }
        }
        
        setIsUploading(false);
        
        if (successCount > 0) {
          Alert.alert(
            'Upload Complete',
            `Successfully imported ${totalTransactions} transactions from ${successCount} file(s).`
          );
          setUploadModalVisible(false);
        }
      }
    } catch (error) {
      setIsUploading(false);
      Alert.alert('Upload Error', 'Failed to upload files. Please try again.');
    }
  };

  // Remove uploaded file from list
  const removeUploadedFile = (fileName) => {
    Alert.alert(
      'Remove File',
      `Remove ${fileName} and its imported transactions?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            // Remove transactions imported from this file
            setTransactions(prev => 
              prev.filter(transaction => transaction.importedFrom !== fileName)
            );
            
            // Remove file from uploaded files list
            setUploadedFiles(prev => 
              prev.filter(file => file.name !== fileName)
            );
            
            Alert.alert('Success', 'File and its transactions have been removed.');
          },
        },
      ]
    );
  };

  // Chart data calculation functions
  const calculateTransactionDistribution = () => {
    const ranges = { '<$1K': 0, '$1-5K': 0, '$5-10K': 0, '$10K+': 0 };
    
    filteredTransactions.forEach(transaction => {
      const amount = Math.abs(transaction.amount);
      if (amount < 1000) ranges['<$1K']++;
      else if (amount < 5000) ranges['$1-5K']++;
      else if (amount < 10000) ranges['$5-10K']++;
      else ranges['$10K+']++;
    });

    return Object.values(ranges);
  };

  const calculateFraudTypeBreakdown = () => {
    const alertTypes = {};
    embezzlementAlerts.forEach(alert => {
      const type = alert.type.replace('_', ' ');
      alertTypes[type] = (alertTypes[type] || 0) + 1;
    });

    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFA726', '#9C27B0'];
    return Object.keys(alertTypes).map((type, index) => ({
      name: type,
      population: alertTypes[type],
      color: colors[index % colors.length],
      legendFontColor: '#333',
      legendFontSize: 15
    }));
  };

  const renderTransaction = (transaction) => (
    <TouchableOpacity
      key={transaction.id}
      style={[
        styles.transactionCard,
        transaction.imported && styles.importedTransactionCard
      ]}
      onPress={() => Alert.alert(
        'Transaction Details',
        `Reference: ${transaction.reference}\nAccount: ${transaction.account}\nVendor: ${transaction.vendor}${
          transaction.imported ? `\n\nImported from: ${transaction.importedFrom}\nImported on: ${new Date(transaction.importedAt).toLocaleDateString()}` : ''
        }`
      )}
    >
      <View style={styles.transactionHeader}>
        <View style={styles.iconContainer}>
          <Ionicons
            name={getTransactionIcon(transaction.category)}
            size={24}
            color={transaction.type === 'income' ? '#4CAF50' : '#F44336'}
          />
          {transaction.imported && (
            <View style={styles.importedBadge}>
              <Ionicons name="cloud-download" size={12} color="#2196F3" />
            </View>
          )}
        </View>
        <View style={styles.transactionInfo}>
          <Text style={styles.transactionDescription}>
            {transaction.description}
          </Text>
          <Text style={styles.transactionCategory}>
            {transaction.category} • {formatDate(transaction.date)}
            {transaction.imported && (
              <Text style={styles.importedLabel}> • Imported</Text>
            )}
          </Text>
        </View>
        <View style={styles.amountContainer}>
          <Text
            style={[
              styles.transactionAmount,
              { color: transaction.type === 'income' ? '#4CAF50' : '#F44336' }
            ]}
          >
            {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Alert Summary Banner */}
      {embezzlementAlerts.length > 0 && (
        <TouchableOpacity 
          style={styles.alertBanner}
          onPress={() => {
            const pendingAlert = embezzlementAlerts.find(alert => alert.status === 'PENDING');
            if (pendingAlert) {
              setCurrentAlert(pendingAlert);
              setAlertModalVisible(true);
            }
          }}
        >
          <View style={styles.alertBannerContent}>
            <Ionicons name="warning" size={24} color="#FF3B30" />
            <View style={styles.alertBannerText}>
              <Text style={styles.alertBannerTitle}>
                {embezzlementAlerts.filter(a => a.status === 'PENDING').length} Suspicious Transaction(s) Detected
              </Text>
              <Text style={styles.alertBannerSubtitle}>
                Tap to review and confirm these transactions
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#FF3B30" />
          </View>
        </TouchableOpacity>
      )}

      {/* Summary Cards */}
      <View style={styles.summaryContainer}>
        <View style={[styles.summaryCard, styles.incomeCard]}>
          <Ionicons name="trending-up" size={24} color="#4CAF50" />
          <Text style={styles.summaryLabel}>Income</Text>
          <Text style={styles.summaryAmount}>
            {formatCurrency(summary.income)}
          </Text>
        </View>
        
        <View style={[styles.summaryCard, styles.expenseCard]}>
          <Ionicons name="trending-down" size={24} color="#F44336" />
          <Text style={styles.summaryLabel}>Expenses</Text>
          <Text style={styles.summaryAmount}>
            {formatCurrency(summary.expenses)}
          </Text>
        </View>
        
        <View style={[styles.summaryCard, styles.netCard]}>
          <Ionicons name="analytics" size={24} color="#2196F3" />
          <Text style={styles.summaryLabel}>Net Flow</Text>
          <Text
            style={[
              styles.summaryAmount,
              { color: summary.netFlow >= 0 ? '#4CAF50' : '#F44336' }
            ]}
          >
            {summary.netFlow >= 0 ? '+' : ''}{formatCurrency(summary.netFlow)}
          </Text>
        </View>
      </View>

      {/* Filter and Search */}
      <View style={styles.filterContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search transactions..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setFilterModalVisible(true)}
        >
          <Ionicons name="filter" size={20} color="#2196F3" />
        </TouchableOpacity>
      </View>

      {/* Analytics Dashboard */}
      <ScrollView
        style={styles.analyticsContainer}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
      >
        {/* Transaction Distribution Chart */}
        <DataVisualizationComponents.TransactionDistributionChart 
          data={{
            labels: ['<$1K', '$1-5K', '$5-10K', '$10K+'],
            values: calculateTransactionDistribution()
          }}
        />

        {/* Fraud Type Breakdown */}
        <DataVisualizationComponents.FraudTypeChart 
          data={calculateFraudTypeBreakdown()}
        />
      </ScrollView>

      {/* Transactions List */}
      <ScrollView
        style={styles.transactionsList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Text style={styles.sectionTitle}>
          Recent Transactions ({filteredTransactions.length})
          {filteredTransactions.some(t => t.imported) && (
            <Text style={styles.importedCount}>
              {' • '}{filteredTransactions.filter(t => t.imported).length} imported
            </Text>
          )}
        </Text>
        {filteredTransactions.map(renderTransaction)}
      </ScrollView>

      {/* Filter Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={filterModalVisible}
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Filter Transactions</Text>
            
            {['all', 'income', 'expense'].map((filter) => (
              <TouchableOpacity
                key={filter}
                style={[
                  styles.filterOption,
                  selectedFilter === filter && styles.selectedFilter
                ]}
                onPress={() => {
                  setSelectedFilter(filter);
                  setFilterModalVisible(false);
                }}
              >
                <Text style={[
                  styles.filterOptionText,
                  selectedFilter === filter && styles.selectedFilterText
                ]}>
                  {filter === 'all' ? 'All Transactions' : 
                   filter === 'income' ? 'Income Only' : 'Expenses Only'}
                </Text>
              </TouchableOpacity>
            ))}
            
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setFilterModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Upload Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={uploadModalVisible}
        onRequestClose={() => setUploadModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, styles.uploadModalContent]}>
            <View style={styles.uploadHeader}>
              <Ionicons name="cloud-upload" size={32} color="#2196F3" />
              <Text style={styles.modalTitle}>Upload Financial Records</Text>
            </View>
            
            <Text style={styles.uploadDescription}>
              Upload spreadsheets and financial documents to automatically import transactions into your tracking system.
            </Text>
            
            <View style={styles.supportedFormats}>
              <Text style={styles.formatsTitle}>Supported Formats:</Text>
              <View style={styles.formatItem}>
                <Ionicons name="document" size={16} color="#4CAF50" />
                <Text style={styles.formatText}>Excel files (.xlsx, .xls)</Text>
              </View>
              <View style={styles.formatItem}>
                <Ionicons name="document" size={16} color="#4CAF50" />
                <Text style={styles.formatText}>CSV files (.csv)</Text>
              </View>
              <View style={styles.formatItem}>
                <Ionicons name="information-circle" size={16} color="#666" />
                <Text style={styles.formatText}>Maximum file size: 10MB</Text>
              </View>
            </View>

            {/* Uploaded Files List */}
            {uploadedFiles.length > 0 && (
              <View style={styles.uploadedFilesList}>
                <Text style={styles.uploadedFilesTitle}>Recently Uploaded:</Text>
                {uploadedFiles.slice(0, 3).map((file, index) => (
                  <View key={index} style={styles.uploadedFileItem}>
                    <View style={styles.fileInfo}>
                      <Ionicons name="document-text" size={16} color="#2196F3" />
                      <View style={styles.fileDetails}>
                        <Text style={styles.fileName}>{file.name}</Text>
                        <Text style={styles.fileStats}>
                          {file.transactionCount} transactions • {(file.size / 1024).toFixed(1)} KB
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      onPress={() => removeUploadedFile(file.name)}
                      style={styles.removeFileButton}
                    >
                      <Ionicons name="close-circle" size={20} color="#F44336" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
            
            {/* Template Generator Section */}
            <View style={styles.templateSection}>
              <Text style={styles.templateTitle}>Need a template?</Text>
              <Text style={styles.templateDescription}>
                Download structured templates to organize your financial data for optimal AI analysis.
              </Text>
              
              <View style={styles.templateButtons}>
                <TouchableOpacity
                  style={styles.templateButton}
                  onPress={() => TemplateGenerator.generateFinancialTemplate()}
                >
                  <Ionicons name="document-text" size={18} color="#4CAF50" />
                  <Text style={styles.templateButtonText}>Financial Data</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.templateButton}
                  onPress={() => TemplateGenerator.generateExpenseTemplate()}
                >
                  <Ionicons name="receipt" size={18} color="#2196F3" />
                  <Text style={styles.templateButtonText}>Expense Report</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.templateButton}
                  onPress={() => TemplateGenerator.generateVendorTemplate()}
                >
                  <Ionicons name="business" size={18} color="#FF9800" />
                  <Text style={styles.templateButtonText}>Vendor List</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.uploadButtons}>
              <TouchableOpacity
                style={[styles.uploadButton, isUploading && styles.uploadButtonDisabled]}
                onPress={handleFileUpload}
                disabled={isUploading}
              >
                {isUploading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Ionicons name="cloud-upload" size={20} color="#fff" />
                )}
                <Text style={styles.uploadButtonText}>
                  {isUploading ? 'Processing...' : 'Select Files'}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setUploadModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Embezzlement Alert Modal */}
      <EmbezzlementAlertModal
        visible={alertModalVisible}
        alert={currentAlert}
        onNotMyPurchase={handleNotMyPurchase}
        onMyPurchase={handleMyPurchase}
        onDismiss={handleDismissAlert}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  alertBanner: {
    backgroundColor: '#FFE6E6',
    borderLeftColor: '#FF3B30',
    borderLeftWidth: 4,
    borderRadius: 8,
    elevation: 2,
    marginBottom: 5,
    marginHorizontal: 15,
    marginTop: 10,
    padding: 12,
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  alertBannerContent: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  alertBannerSubtitle: {
    color: '#8B0000',
    fontSize: 12,
  },
  alertBannerText: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  alertBannerTitle: {
    color: '#FF3B30',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  analyticsContainer: {
    marginHorizontal: 15,
    marginVertical: 10,
    maxHeight: 500,
  },
  cancelButton: {
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 15,
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  closeButton: {
    backgroundColor: '#666',
    borderRadius: 10,
    marginTop: 10,
    padding: 15,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  container: {
    backgroundColor: '#f5f5f5',
    flex: 1,
  },
  fileDetails: {
    flex: 1,
    marginLeft: 10,
  },
  fileInfo: {
    alignItems: 'center',
    flexDirection: 'row',
    flex: 1,
  },
  fileName: {
    color: '#333',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  fileStats: {
    color: '#666',
    fontSize: 12,
  },
  filterButton: {
    backgroundColor: '#fff',
    borderColor: '#ddd',
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
  },
  filterContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingBottom: 10,
    paddingHorizontal: 15,
  },
  filterOption: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    marginBottom: 10,
    padding: 15,
  },
  filterOptionText: {
    color: '#333',
    fontSize: 16,
    textAlign: 'center',
  },
  formatItem: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 8,
  },
  formatText: {
    color: '#666',
    fontSize: 14,
    marginLeft: 10,
  },
  formatsTitle: {
    color: '#333',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  headerButton: {
    marginLeft: 15,
    marginRight: 5,
  },
  headerButtons: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  iconContainer: {
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    marginRight: 15,
    position: 'relative',
    width: 40,
  },
  importedBadge: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderColor: '#2196F3',
    borderRadius: 8,
    borderWidth: 1,
    height: 16,
    justifyContent: 'center',
    position: 'absolute',
    right: -2,
    top: -2,
    width: 16,
  },
  importedCount: {
    color: '#2196F3',
    fontSize: 14,
    fontWeight: 'normal',
  },
  importedLabel: {
    color: '#2196F3',
    fontWeight: '500',
  },
  importedTransactionCard: {
    borderLeftColor: '#2196F3',
    borderLeftWidth: 4,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    maxWidth: 300,
    padding: 30,
    width: '80%',
  },
  modalOverlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    flex: 1,
    justifyContent: 'center',
  },
  modalTitle: {
    color: '#333',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  removeFileButton: {
    padding: 4,
  },
  searchInput: {
    backgroundColor: '#fff',
    borderColor: '#ddd',
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    marginRight: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  sectionTitle: {
    color: '#333',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  selectedFilter: {
    backgroundColor: '#2196F3',
  },
  selectedFilterText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  summaryAmount: {
    color: '#333',
    fontSize: 16,
    fontWeight: 'bold',
  },
  summaryCard: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 3,
    flex: 1,
    marginHorizontal: 5,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
  },
  summaryLabel: {
    color: '#666',
    fontSize: 12,
    marginBottom: 5,
    marginTop: 5,
  },
  supportedFormats: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    marginBottom: 20,
    padding: 15,
  },
  templateButton: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderColor: '#e9ecef',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    width: '48%',
  },
  templateButtonText: {
    color: '#333',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 6,
  },
  templateButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  templateDescription: {
    color: '#666',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  templateSection: {
    backgroundColor: '#f8f9fa',
    borderColor: '#e9ecef',
    borderRadius: 12,
    borderWidth: 1,
    marginVertical: 16,
    padding: 16,
  },
  templateTitle: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  transactionAmount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  transactionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 3,
    marginBottom: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  transactionCategory: {
    color: '#666',
    fontSize: 14,
  },
  transactionDescription: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  transactionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  transactionInfo: {
    flex: 1,
  },
  transactionsList: {
    flex: 1,
    paddingHorizontal: 15,
  },
  uploadButton: {
    alignItems: 'center',
    backgroundColor: '#2196F3',
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
    padding: 15,
  },
  uploadButtonDisabled: {
    opacity: 0.7,
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  uploadButtons: {
    marginTop: 'auto',
  },
  uploadDescription: {
    color: '#666',
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 20,
    textAlign: 'center',
  },
  uploadHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  uploadModalContent: {
    maxHeight: '90%',
    minHeight: 400,
  },
  uploadedFileItem: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderColor: '#e0e0e0',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    padding: 12,
  },
  uploadedFilesList: {
    marginBottom: 20,
  },
  uploadedFilesTitle: {
    color: '#333',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
});

export default FinancialTrackingScreen;