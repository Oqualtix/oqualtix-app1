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
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  alertBanner: {
    backgroundColor: '#FFE6E6',
    borderLeftWidth: 4,
    borderLeftColor: '#FF3B30',
    marginHorizontal: 15,
    marginTop: 10,
    marginBottom: 5,
    borderRadius: 8,
    padding: 12,
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  alertBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  alertBannerText: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  alertBannerTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF3B30',
    marginBottom: 2,
  },
  alertBannerSubtitle: {
    fontSize: 12,
    color: '#8B0000',
  },
  summaryContainer: {
    flexDirection: 'row',
    padding: 15,
    justifyContent: 'space-between',
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginHorizontal: 5,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
    marginBottom: 5,
  },
  summaryAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingBottom: 10,
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  filterButton: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  transactionsList: {
    flex: 1,
    paddingHorizontal: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  importedCount: {
    fontSize: 14,
    fontWeight: 'normal',
    color: '#2196F3',
  },
  transactionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  transactionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    position: 'relative',
  },
  importedBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2196F3',
  },
  importedTransactionCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  importedLabel: {
    color: '#2196F3',
    fontWeight: '500',
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  transactionCategory: {
    fontSize: 14,
    color: '#666',
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 30,
    width: '80%',
    maxWidth: 300,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  filterOption: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: '#f5f5f5',
  },
  selectedFilter: {
    backgroundColor: '#2196F3',
  },
  filterOptionText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#333',
  },
  selectedFilterText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  closeButton: {
    backgroundColor: '#666',
    borderRadius: 10,
    padding: 15,
    marginTop: 10,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    marginLeft: 15,
    marginRight: 5,
  },
  uploadModalContent: {
    maxHeight: '90%',
    minHeight: 400,
  },
  uploadHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  uploadDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  supportedFormats: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  formatsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  formatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  formatText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#666',
  },
  uploadedFilesList: {
    marginBottom: 20,
  },
  uploadedFilesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  uploadedFileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  fileDetails: {
    marginLeft: 10,
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  fileStats: {
    fontSize: 12,
    color: '#666',
  },
  removeFileButton: {
    padding: 4,
  },
  uploadButtons: {
    marginTop: 'auto',
  },
  uploadButton: {
    backgroundColor: '#2196F3',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
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
  cancelButton: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default FinancialTrackingScreen;