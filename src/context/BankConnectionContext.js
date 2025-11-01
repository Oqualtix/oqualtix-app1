import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FraudDetectionUtil from '../utils/FraudDetectionUtil';
import LocationFraudDetection from '../utils/LocationFraudDetection';
import { useNotifications } from './NotificationContext';
import { Alert } from 'react-native';

const BankConnectionContext = createContext();

export const useBankConnection = () => {
  const context = useContext(BankConnectionContext);
  if (!context) {
    throw new Error('useBankConnection must be used within a BankConnectionProvider');
  }
  return context;
};

export const BankConnectionProvider = ({ children }) => {
  const [connectedBanks, setConnectedBanks] = useState([]);
  const [realTimeTransactions, setRealTimeTransactions] = useState([]);
  const [fraudAnalysis, setFraudAnalysis] = useState([]);
  const [fraudSummary, setFraudSummary] = useState(null);
  const [userLocationHistory, setUserLocationHistory] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('idle'); // idle, connecting, connected, error
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const { scheduleNotification } = useNotifications();

  // Load saved bank connections on app start
  useEffect(() => {
    loadSavedConnections();
    startRealTimeMonitoring();
    initializeLocationServices();
  }, []);

  const loadSavedConnections = async () => {
    try {
      const savedConnections = await AsyncStorage.getItem('bankConnections');
      if (savedConnections) {
        const connections = JSON.parse(savedConnections);
        setConnectedBanks(connections);
        console.log('📱 Loaded bank connections:', connections.length);
      }
    } catch (error) {
      console.error('Error loading bank connections:', error);
    }
  };

  const saveBankConnections = async (connections) => {
    try {
      await AsyncStorage.setItem('bankConnections', JSON.stringify(connections));
      console.log('💾 Saved bank connections to storage');
    } catch (error) {
      console.error('Error saving bank connections:', error);
    }
  };

  const initializeLocationServices = async () => {
    try {
      console.log('📍 Initializing location services...');
      const locationResult = await LocationFraudDetection.initializeLocationServices();
      
      if (locationResult.success) {
        setCurrentLocation(locationResult.location);
        
        // Add to location history
        const locationEntry = LocationFraudDetection.addLocationToHistory(locationResult.location);
        setUserLocationHistory(prev => [locationEntry, ...prev.slice(0, 99)]);
        
        console.log('📍 Location services initialized successfully');
      } else {
        console.warn('📍 Location services initialization failed:', locationResult.error);
      }
    } catch (error) {
      console.error('📍 Location services error:', error);
    }
  };

  const connectBank = async (bankInfo, credentials) => {
    setConnectionStatus('connecting');
    
    try {
      // Simulate secure bank API connection
      // In production, this would use Plaid, Yodlee, or similar service
      console.log('🔗 Connecting to bank:', bankInfo.name);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate successful connection
      const newConnection = {
        id: Date.now().toString(),
        bankId: bankInfo.id,
        bankName: bankInfo.name,
        bankLogo: bankInfo.logo,
        accountType: 'Checking', // Would be detected from API
        accountNumber: `****${credentials.accountNumber}`,
        routingNumber: '****1234', // Mock
        balance: Math.floor(Math.random() * 100000) + 5000,
        currency: 'USD',
        lastSync: new Date().toISOString(),
        status: 'Connected',
        realTimeEnabled: true,
        fraudAlertsEnabled: true,
        connectionHealth: 'Excellent',
        dailyTransactionLimit: 100,
        monthlyTransactionLimit: 3000,
        permissions: ['read_transactions', 'read_balance', 'read_account_info'],
        encryptionKey: generateEncryptionKey(),
        createdAt: new Date().toISOString()
      };

      const updatedConnections = [...connectedBanks, newConnection];
      setConnectedBanks(updatedConnections);
      await saveBankConnections(updatedConnections);
      
      setConnectionStatus('connected');
      
      // Start monitoring this bank's transactions
      startBankMonitoring(newConnection);
      
      console.log('✅ Bank connected successfully:', newConnection.bankName);
      return { success: true, connection: newConnection };
      
    } catch (error) {
      setConnectionStatus('error');
      console.error('❌ Bank connection failed:', error);
      return { success: false, error: error.message };
    }
  };

  const disconnectBank = async (bankId) => {
    try {
      const updatedConnections = connectedBanks.filter(bank => bank.id !== bankId);
      setConnectedBanks(updatedConnections);
      await saveBankConnections(updatedConnections);
      
      // Remove transactions from this bank
      setRealTimeTransactions(prev => 
        prev.filter(transaction => transaction.bankId !== bankId)
      );
      
      console.log('🔌 Bank disconnected:', bankId);
      return { success: true };
    } catch (error) {
      console.error('Error disconnecting bank:', error);
      return { success: false, error: error.message };
    }
  };

  const updateBankSettings = async (bankId, settings) => {
    try {
      const updatedConnections = connectedBanks.map(bank => 
        bank.id === bankId ? { ...bank, ...settings, lastUpdated: new Date().toISOString() } : bank
      );
      
      setConnectedBanks(updatedConnections);
      await saveBankConnections(updatedConnections);
      
      console.log('⚙️ Bank settings updated:', bankId, settings);
      return { success: true };
    } catch (error) {
      console.error('Error updating bank settings:', error);
      return { success: false, error: error.message };
    }
  };

  const startBankMonitoring = (bankConnection) => {
    console.log('👁️ Starting real-time monitoring for:', bankConnection.bankName);
    
    // Simulate periodic transaction updates
    const monitoringInterval = setInterval(() => {
      if (bankConnection.realTimeEnabled) {
        generateMockTransaction(bankConnection);
      }
    }, 30000); // Every 30 seconds for demo (in production, would be real-time webhooks)
    
    // Store interval ID for cleanup
    bankConnection.monitoringInterval = monitoringInterval;
  };

  const startRealTimeMonitoring = () => {
    console.log('🔄 Starting real-time transaction monitoring...');
    
    // Simulate real-time transaction feed for all connected banks
    const globalMonitoring = setInterval(() => {
      connectedBanks.forEach(bank => {
        if (bank.realTimeEnabled && Math.random() > 0.7) { // 30% chance of new transaction
          generateMockTransaction(bank);
        }
      });
    }, 45000); // Every 45 seconds
    
    return () => clearInterval(globalMonitoring);
  };

  const generateMockTransaction = (bankConnection) => {
    const transactionTypes = [
      { type: 'debit', description: 'Online Purchase', merchant: 'Amazon', category: 'Shopping' },
      { type: 'debit', description: 'ATM Withdrawal', merchant: 'Chase ATM', category: 'Cash' },
      { type: 'debit', description: 'Gas Station', merchant: 'Shell', category: 'Gas' },
      { type: 'credit', description: 'Direct Deposit', merchant: 'Employer Inc', category: 'Payroll' },
      { type: 'debit', description: 'Office Supplies', merchant: 'Office Depot', category: 'Business' },
      { type: 'debit', description: 'Consulting Services', merchant: 'Tech Solutions LLC', category: 'Professional' },
      { type: 'debit', description: 'Legal Services', merchant: 'Legal Associates', category: 'Professional' },
      { type: 'debit', description: 'Catering', merchant: 'Catering Services', category: 'Business' },
      // Enhanced FX transactions
      { type: 'debit', description: 'International Wire Transfer', merchant: 'Foreign Exchange Bank', category: 'International', fraudPattern: 'fx_arbitrage' },
      { type: 'debit', description: 'Currency Exchange', merchant: 'FX Trading Corp', category: 'Foreign Exchange', fraudPattern: 'currency_layering' },
      { type: 'debit', description: 'Overseas Payment', merchant: 'International Services Ltd', category: 'International', fraudPattern: 'weekend_fx' },
      { type: 'debit', description: 'Foreign Currency Purchase', merchant: 'Global FX Exchange', category: 'Foreign Exchange', fraudPattern: 'rate_manipulation' },
      // Potential fraud patterns
      { type: 'debit', description: 'Vendor Payment', merchant: 'Shell Company B', category: 'Business', fraudPattern: 'round_dollars' },
      { type: 'debit', description: 'Consulting', merchant: 'Threshold Evader Corp', category: 'Professional', fraudPattern: 'threshold_evasion' },
      { type: 'debit', description: 'Services', merchant: 'Suspicious Vendor A', category: 'Business', fraudPattern: 'outlier' },
    ];
    
    const randomTransaction = transactionTypes[Math.floor(Math.random() * transactionTypes.length)];
    
    // Generate amount based on transaction type and potential fraud patterns
    let amount;
    if (randomTransaction.fraudPattern === 'fx_arbitrage') {
      // Generate FX arbitrage amounts (larger international transfers)
      const fxAmounts = [25000, 45000, 67000, 89000, 123000];
      amount = fxAmounts[Math.floor(Math.random() * fxAmounts.length)];
    } else if (randomTransaction.fraudPattern === 'currency_layering') {
      // Multiple smaller FX conversions
      const layeringAmounts = [8500, 12000, 15500, 18000, 22000];
      amount = layeringAmounts[Math.floor(Math.random() * layeringAmounts.length)];
    } else if (randomTransaction.fraudPattern === 'weekend_fx') {
      // Weekend FX exploitation
      const weekendAmounts = [35000, 52000, 78000, 94000];
      amount = weekendAmounts[Math.floor(Math.random() * weekendAmounts.length)];
    } else if (randomTransaction.fraudPattern === 'rate_manipulation') {
      // Off-market rate exploitation
      const rateAmounts = [15000, 28000, 41000, 63000];
      amount = rateAmounts[Math.floor(Math.random() * rateAmounts.length)];
    } else if (randomTransaction.fraudPattern === 'round_dollars') {
      // Generate suspicious round dollar amounts
      const roundAmounts = [5000, 10000, 15000, 7500, 12500];
      amount = roundAmounts[Math.floor(Math.random() * roundAmounts.length)];
    } else if (randomTransaction.fraudPattern === 'threshold_evasion') {
      // Generate amounts just below reporting thresholds
      const evasionAmounts = [4999, 9999, 4950, 24999, 9899];
      amount = evasionAmounts[Math.floor(Math.random() * evasionAmounts.length)];
    } else if (randomTransaction.fraudPattern === 'outlier') {
      // Generate statistical outliers
      const outlierAmounts = [15000, 22500, 18750, 35000];
      amount = outlierAmounts[Math.floor(Math.random() * outlierAmounts.length)];
    } else if (randomTransaction.type === 'credit') {
      amount = Math.floor(Math.random() * 5000) + 1000;
    } else {
      // Normal transaction amounts
      const normalAmounts = [50, 125, 275, 450, 89, 167, 234, 389, 512, 678, 734, 845];
      amount = normalAmounts[Math.floor(Math.random() * normalAmounts.length)];
    }
    
    // Adjust date for FX fraud patterns to trigger specific detections
    let transactionDate = new Date();
    if (randomTransaction.fraudPattern === 'weekend_fx') {
      // Set to weekend
      const dayOffset = transactionDate.getDay() === 0 ? 0 : 7 - transactionDate.getDay();
      transactionDate.setDate(transactionDate.getDate() + dayOffset);
    } else if (randomTransaction.fraudPattern === 'fx_arbitrage') {
      // Set to off-hours (early morning)
      transactionDate.setHours(4, 30, 0, 0);
    }
    
    const newTransaction = {
      id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      bankId: bankConnection.id,
      bankName: bankConnection.bankName,
      accountNumber: bankConnection.accountNumber,
      type: randomTransaction.type,
      amount: randomTransaction.type === 'credit' ? amount : -amount,
      description: randomTransaction.description,
      merchant: randomTransaction.merchant,
      category: randomTransaction.category,
      date: transactionDate.toISOString(),
      status: 'Posted',
      location: randomTransaction.category === 'International' || randomTransaction.category === 'Foreign Exchange' ? 
                'International' : 'Local Area',
      paymentMethod: randomTransaction.description.includes('ATM') ? 'ATM' : 
                     randomTransaction.category === 'International' ? 'Wire Transfer' :
                     randomTransaction.category === 'Foreign Exchange' ? 'FX Platform' : 'Card',
      verified: true
    };
    
    // Perform comprehensive real-time fraud analysis including GAAP and location
    const analysis = FraudDetectionUtil.performComprehensiveAnalysis(
      newTransaction, 
      realTimeTransactions, 
      connectedBanks,
      { 
        userId: 'current_user',
        country: 'USA',
        hasInternationalHistory: false,
        companyProfile: {
          type: 'PRIVATE_COMPANY',
          annualRevenue: 5000000,
          netIncome: 500000
        }
      },
      userLocationHistory
    );
    
    // Add comprehensive analysis results to transaction
    newTransaction.fraudAnalysis = analysis;
    newTransaction.gaapAnalysis = analysis.gaapAnalysis;
    newTransaction.locationAnalysis = analysis.locationAnalysis;
    newTransaction.riskLevel = analysis.comprehensiveRiskScore ? 
      FraudDetectionUtil.getRiskLevel(analysis.comprehensiveRiskScore) : analysis.riskLevel;
    newTransaction.riskScore = analysis.comprehensiveRiskScore || analysis.riskScore;
    newTransaction.anomalies = analysis.allAnomalies || analysis.anomalies;
    newTransaction.requiresReview = analysis.requiresReview;
    newTransaction.requiresEscalation = analysis.requiresEscalation;
    newTransaction.requiresCriticalEscalation = analysis.requiresCriticalEscalation;
    newTransaction.competitiveAdvantage = analysis.competitiveAdvantage;
    
    // Add to real-time transaction feed
    setRealTimeTransactions(prev => {
      const updated = [newTransaction, ...prev.slice(0, 99)];
      // Update fraud analysis state
      const allAnalysis = updated.map(t => t.fraudAnalysis).filter(Boolean);
      setFraudAnalysis(allAnalysis);
      setFraudSummary(FraudDetectionUtil.getFraudSummary(allAnalysis));
      return updated;
    });
    
    // Trigger enhanced fraud alert if analysis indicates high risk
    if (FraudDetectionUtil.shouldTriggerAlert(analysis) && bankConnection.fraudAlertsEnabled) {
      const enhancedFraudAlert = FraudDetectionUtil.generateEnhancedFraudAlert(analysis);
      if (enhancedFraudAlert && scheduleNotification) {
        scheduleNotification(enhancedFraudAlert);
      }
      triggerFraudAlert(newTransaction);
    }
    
    // Update last sync time
    setLastSyncTime(new Date().toISOString());
    
    const fxIndicator = analysis.fxAnalysis?.isFXTransaction ? ' [FX]' : '';
    const fxRiskInfo = analysis.fxRiskScore > 0 ? ` FX: ${analysis.fxRiskScore}` : '';
    const gaapRiskInfo = analysis.gaapRiskScore > 0 ? ` GAAP: ${analysis.gaapRiskScore}` : '';
    const locationRiskInfo = analysis.locationRiskScore > 0 ? ` LOC: ${analysis.locationRiskScore}` : '';
    
    console.log('💳 New transaction:', newTransaction.description, `$${Math.abs(newTransaction.amount)}${fxIndicator}`, 
                `Risk: ${analysis.riskLevel} (${analysis.comprehensiveRiskScore || analysis.riskScore}${fxRiskInfo}${gaapRiskInfo}${locationRiskInfo})`);
    
    if (analysis.allAnomalies?.length > 0) {
      const fxAnomalies = analysis.allAnomalies.filter(a => 
        a.type && (a.type.includes('FX') || a.type.includes('Foreign') || a.type.includes('Currency'))
      );
      const gaapViolations = analysis.allAnomalies.filter(a => 
        a.standard && a.standard.includes('ASC')
      );
      const locationAnomalies = analysis.allAnomalies.filter(a => 
        a.type && (a.type.includes('Travel') || a.type.includes('Location') || a.type.includes('Geographic'))
      );
      
      if (fxAnomalies.length > 0) {
        console.log('🌍 FX fraud indicators:', fxAnomalies.map(a => a.type).join(', '));
      }
      if (gaapViolations.length > 0) {
        console.log('� GAAP violations:', gaapViolations.map(a => a.type).join(', '));
      }
      if (locationAnomalies.length > 0) {
        console.log('📍 Location anomalies:', locationAnomalies.map(a => a.type).join(', '));
      }
      console.log('�🚨 All fraud indicators:', analysis.allAnomalies.map(a => a.type).join(', '));
    }
    
    if (analysis.requiresCriticalEscalation) {
      console.log('🚨🚨 CRITICAL ESCALATION REQUIRED 🚨🚨');
    }
  };

  const triggerFraudAlert = (transaction) => {
    console.log('🚨 FRAUD ALERT:', transaction.description, `$${transaction.amount}`);
    
    // In production, this would trigger push notifications
    Alert.alert(
      '🚨 Fraud Alert',
      `Suspicious transaction detected:\n\n${transaction.description}\nAmount: $${transaction.amount}\nRisk Score: ${transaction.fraudScore}/100`,
      [
        { text: 'Review Later', style: 'cancel' },
        { text: 'Investigate Now', onPress: () => console.log('Opening fraud investigation...') }
      ]
    );
  };

  const syncAllBanks = async () => {
    console.log('🔄 Syncing all bank connections...');
    setConnectionStatus('connecting');
    
    try {
      // Simulate sync process
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Update last sync time for all banks
      const updatedConnections = connectedBanks.map(bank => ({
        ...bank,
        lastSync: new Date().toISOString(),
        status: 'Connected'
      }));
      
      setConnectedBanks(updatedConnections);
      await saveBankConnections(updatedConnections);
      setLastSyncTime(new Date().toISOString());
      setConnectionStatus('connected');
      
      console.log('✅ All banks synced successfully');
      return { success: true };
    } catch (error) {
      setConnectionStatus('error');
      console.error('❌ Bank sync failed:', error);
      return { success: false, error: error.message };
    }
  };

  const getTransactionsByBank = (bankId) => {
    return realTimeTransactions.filter(transaction => transaction.bankId === bankId);
  };

  const getHighRiskTransactions = () => {
    return realTimeTransactions.filter(transaction => 
      transaction.requiresReview || 
      transaction.riskLevel === 'HIGH' || 
      transaction.riskLevel === 'CRITICAL'
    );
  };

  const getTotalBalance = () => {
    return connectedBanks.reduce((total, bank) => total + (bank.balance || 0), 0);
  };

  const generateEncryptionKey = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };

  const value = {
    // State
    connectedBanks,
    realTimeTransactions,
    fraudAnalysis,
    fraudSummary,
    userLocationHistory,
    currentLocation,
    connectionStatus,
    lastSyncTime,
    
    // Actions
    connectBank,
    disconnectBank,
    updateBankSettings,
    syncAllBanks,
    
    // Getters
    getTransactionsByBank,
    getHighRiskTransactions,
    getTotalBalance,
    
    // Stats
    totalConnectedBanks: connectedBanks.length,
    totalTransactions: realTimeTransactions.length,
    highRiskTransactions: getHighRiskTransactions().length,
    totalBalance: getTotalBalance(),
    
    // Fraud Detection Stats
    totalFraudAlerts: fraudAnalysis.filter(a => a.requiresReview).length,
    criticalRiskCount: fraudAnalysis.filter(a => a.riskLevel === 'CRITICAL').length,
    averageRiskScore: fraudAnalysis.length > 0 ? 
      Math.round(fraudAnalysis.reduce((sum, a) => sum + a.riskScore, 0) / fraudAnalysis.length) : 0,
    
    // GAAP Compliance Stats
    gaapViolationsCount: realTimeTransactions.filter(t => 
      t.gaapAnalysis && t.gaapAnalysis.violations.length > 0
    ).length,
    gaapHighRiskCount: realTimeTransactions.filter(t => 
      t.gaapAnalysis && t.gaapAnalysis.gaapRiskScore >= 70
    ).length,
    
    // Location Security Stats
    locationCoverage: realTimeTransactions.filter(t => 
      t.locationAnalysis && t.locationAnalysis.hasLocationData
    ).length,
    locationAnomaliesCount: realTimeTransactions.filter(t => 
      t.locationAnalysis && t.locationAnalysis.anomalies.length > 0
    ).length,
    hasLocationServices: currentLocation !== null
  };

  return (
    <BankConnectionContext.Provider value={value}>
      {children}
    </BankConnectionContext.Provider>
  );
};

export default BankConnectionContext;