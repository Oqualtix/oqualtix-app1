import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '../context/ThemeContext';
import { useBankConnection } from '../context/BankConnectionContext';
import FXFraudDetection from '../utils/FXFraudDetection';
import BrandConfig from '../config/BrandConfig';

const { width } = Dimensions.get('window');

const FXFraudMonitoringScreen = ({ navigation }) => {
  const { isDarkMode } = useContext(ThemeContext);
  const { realTimeTransactions, fraudSummary } = useBankConnection();
  const [selectedTab, setSelectedTab] = useState('overview');
  const [fxSummary, setFxSummary] = useState(null);
  const colors = BrandConfig.getColors(isDarkMode);

  useEffect(() => {
    // Filter FX transactions and analyze them
    const fxTransactions = realTimeTransactions.filter(t => 
      FXFraudDetection.isFXTransaction(t)
    );
    
    if (fxTransactions.length > 0) {
      const summary = FXFraudDetection.generateFXFraudSummary(fxTransactions);
      setFxSummary(summary);
    }
  }, [realTimeTransactions]);

  const fxPatternDescriptions = {
    'favorable_rate_timing': 'Timing transactions during favorable exchange rates',
    'artificial_rate_adjustment': 'Using artificially adjusted exchange rates',
    'multiple_currency_conversion': 'Layering through multiple currency conversions',
    'split_fx_transactions': 'Splitting large FX transactions to avoid detection',
    'buy_sell_same_currency': 'Round-trip currency trading for profit',
    'rates_outside_market_range': 'Using rates significantly different from market',
    'rapid_fx_transactions': 'High-frequency FX trading patterns',
    'weekend_rate_exploitation': 'Exploiting weekend rate differences'
  };

  const renderOverview = () => (
    <View style={styles.overviewContainer}>
      {/* FX Transaction Summary */}
      <View style={[styles.summaryCard, { backgroundColor: colors.surface }]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>FX Transaction Analysis</Text>
        
        <View style={styles.summaryGrid}>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: BrandConfig.colors.primary }]}>
              {fxSummary?.totalFXTransactions || 0}
            </Text>
            <Text style={[styles.summaryLabel, { color: colors.secondaryText }]}>
              Total FX Transactions
            </Text>
          </View>
          
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: '#FF3B30' }]}>
              {fxSummary?.suspiciousFXTransactions || 0}
            </Text>
            <Text style={[styles.summaryLabel, { color: colors.secondaryText }]}>
              Suspicious FX
            </Text>
          </View>
          
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: BrandConfig.colors.accent }]}>
              {fxSummary?.fxFraudRate || 0}%
            </Text>
            <Text style={[styles.summaryLabel, { color: colors.secondaryText }]}>
              FX Fraud Rate
            </Text>
          </View>
        </View>

        <View style={[styles.riskIndicator, { 
          backgroundColor: fxSummary?.riskLevel === 'HIGH' ? '#FF3B30' : 
                          fxSummary?.riskLevel === 'MEDIUM' ? '#FF9500' : '#34C759'
        }]}>
          <Text style={styles.riskIndicatorText}>
            Risk Level: {fxSummary?.riskLevel || 'LOW'}
          </Text>
        </View>
      </View>

      {/* Currency Analysis */}
      <View style={[styles.summaryCard, { backgroundColor: colors.surface }]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>Currency Involvement</Text>
        
        <View style={styles.currencyGrid}>
          {(fxSummary?.currenciesInvolved || ['USD', 'EUR', 'GBP']).slice(0, 6).map((currency, index) => (
            <View key={index} style={[styles.currencyItem, { backgroundColor: colors.background }]}>
              <Text style={[styles.currencyCode, { color: BrandConfig.colors.primary }]}>
                {currency}
              </Text>
            </View>
          ))}
        </View>
        
        <Text style={[styles.currencyNote, { color: colors.secondaryText }]}>
          {fxSummary?.currenciesInvolved?.length || 0} currencies detected in FX transactions
        </Text>
      </View>

      {/* Advanced FX Features */}
      <View style={[styles.summaryCard, { backgroundColor: colors.surface }]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>Advanced FX Detection Features</Text>
        
        <View style={styles.featuresList}>
          <View style={styles.featureItem}>
            <Ionicons name="analytics" size={20} color={BrandConfig.colors.primary} />
            <Text style={[styles.featureText, { color: colors.text }]}>
              Real-time FX rate monitoring
            </Text>
            <Ionicons name="checkmark-circle" size={16} color={BrandConfig.colors.success} />
          </View>
          
          <View style={styles.featureItem}>
            <Ionicons name="trending-up" size={20} color={BrandConfig.colors.primary} />
            <Text style={[styles.featureText, { color: colors.text }]}>
              Rate arbitrage detection
            </Text>
            <Ionicons name="checkmark-circle" size={16} color={BrandConfig.colors.success} />
          </View>
          
          <View style={styles.featureItem}>
            <Ionicons name="swap-horizontal" size={20} color={BrandConfig.colors.primary} />
            <Text style={[styles.featureText, { color: colors.text }]}>
              Currency layering analysis
            </Text>
            <Ionicons name="checkmark-circle" size={16} color={BrandConfig.colors.success} />
          </View>
          
          <View style={styles.featureItem}>
            <Ionicons name="time" size={20} color={BrandConfig.colors.primary} />
            <Text style={[styles.featureText, { color: colors.text }]}>
              Weekend/off-hours FX monitoring
            </Text>
            <Ionicons name="checkmark-circle" size={16} color={BrandConfig.colors.success} />
          </View>
          
          <View style={styles.featureItem}>
            <Ionicons name="repeat" size={20} color={BrandConfig.colors.primary} />
            <Text style={[styles.featureText, { color: colors.text }]}>
              Round-trip FX detection
            </Text>
            <Ionicons name="checkmark-circle" size={16} color={BrandConfig.colors.success} />
          </View>
        </View>
      </View>
    </View>
  );

  const renderPatterns = () => (
    <View style={styles.patternsContainer}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Detected FX Fraud Patterns</Text>
      
      {fxSummary?.detectedPatterns?.length > 0 ? (
        fxSummary.detectedPatterns.map(([pattern, count], index) => (
          <View key={index} style={[styles.patternCard, { backgroundColor: colors.surface }]}>
            <View style={styles.patternHeader}>
              <Ionicons name="warning" size={24} color="#FF9500" />
              <View style={styles.patternInfo}>
                <Text style={[styles.patternName, { color: colors.text }]}>
                  {pattern.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </Text>
                <Text style={[styles.patternDescription, { color: colors.secondaryText }]}>
                  {fxPatternDescriptions[pattern] || 'Advanced FX fraud pattern detected'}
                </Text>
              </View>
              <View style={[styles.patternCount, { backgroundColor: BrandConfig.colors.primary }]}>
                <Text style={styles.patternCountText}>{count}</Text>
              </View>
            </View>
          </View>
        ))
      ) : (
        <View style={[styles.noPatterns, { backgroundColor: colors.surface }]}>
          <Ionicons name="shield-checkmark" size={48} color={BrandConfig.colors.success} />
          <Text style={[styles.noPatternsTitle, { color: colors.text }]}>
            No FX Fraud Patterns Detected
          </Text>
          <Text style={[styles.noPatternsDesc, { color: colors.secondaryText }]}>
            Your FX transactions appear normal and legitimate
          </Text>
        </View>
      )}
    </View>
  );

  const renderRealTime = () => {
    const fxTransactions = realTimeTransactions
      .filter(t => FXFraudDetection.isFXTransaction(t))
      .slice(0, 10);

    return (
      <View style={styles.realTimeContainer}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Live FX Transaction Monitoring</Text>
        
        {fxTransactions.length > 0 ? (
          fxTransactions.map((transaction, index) => (
            <View key={transaction.id} style={[styles.transactionCard, { backgroundColor: colors.surface }]}>
              <View style={styles.transactionHeader}>
                <View style={styles.transactionInfo}>
                  <Text style={[styles.transactionMerchant, { color: colors.text }]}>
                    {transaction.merchant}
                  </Text>
                  <Text style={[styles.transactionDescription, { color: colors.secondaryText }]}>
                    {transaction.description}
                  </Text>
                </View>
                <View style={styles.transactionAmount}>
                  <Text style={[styles.amountText, { color: colors.text }]}>
                    ${Math.abs(transaction.amount).toLocaleString()}
                  </Text>
                  <Text style={[styles.categoryText, { color: BrandConfig.colors.primary }]}>
                    {transaction.category}
                  </Text>
                </View>
              </View>
              
              {transaction.fraudAnalysis && transaction.fraudAnalysis.fxRiskScore > 0 && (
                <View style={styles.fxAnalysis}>
                  <View style={[styles.riskBadge, { 
                    backgroundColor: transaction.fraudAnalysis.fxRiskScore >= 80 ? '#FF3B30' : 
                                   transaction.fraudAnalysis.fxRiskScore >= 60 ? '#FF9500' : '#34C759'
                  }]}>
                    <Text style={styles.riskBadgeText}>
                      FX Risk: {transaction.fraudAnalysis.fxRiskScore}
                    </Text>
                  </View>
                  
                  {transaction.fraudAnalysis.fxDetails && (
                    <Text style={[styles.fxDetails, { color: colors.secondaryText }]}>
                      {transaction.fraudAnalysis.fxDetails.fromCurrency} → {transaction.fraudAnalysis.fxDetails.toCurrency}
                      {' '}@ {transaction.fraudAnalysis.fxDetails.estimatedRate}
                    </Text>
                  )}
                </View>
              )}
            </View>
          ))
        ) : (
          <View style={[styles.noTransactions, { backgroundColor: colors.surface }]}>
            <Ionicons name="globe" size={48} color={colors.secondaryText} />
            <Text style={[styles.noTransactionsTitle, { color: colors.text }]}>
              No FX Transactions Yet
            </Text>
            <Text style={[styles.noTransactionsDesc, { color: colors.secondaryText }]}>
              FX transactions will appear here with real-time fraud analysis
            </Text>
          </View>
        )}
      </View>
    );
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'analytics' },
    { id: 'patterns', label: 'Patterns', icon: 'warning' },
    { id: 'realtime', label: 'Live Monitor', icon: 'pulse' }
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          FX Fraud Monitoring
        </Text>
        <TouchableOpacity onPress={() => Alert.alert(
          'FX Fraud Detection',
          'Advanced foreign exchange fraud monitoring with real-time rate analysis, currency layering detection, and arbitrage pattern recognition.'
        )}>
          <Ionicons name="information-circle" size={24} color={BrandConfig.colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        {tabs.map(tab => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.tab,
              selectedTab === tab.id && { backgroundColor: BrandConfig.colors.primary }
            ]}
            onPress={() => setSelectedTab(tab.id)}
          >
            <Ionicons 
              name={tab.icon} 
              size={20} 
              color={selectedTab === tab.id ? '#FFFFFF' : colors.secondaryText} 
            />
            <Text style={[
              styles.tabText,
              { color: selectedTab === tab.id ? '#FFFFFF' : colors.secondaryText }
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {selectedTab === 'overview' && renderOverview()}
        {selectedTab === 'patterns' && renderPatterns()}
        {selectedTab === 'realtime' && renderRealTime()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  amountText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600',
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  currencyCode: {
    fontSize: 12,
    fontWeight: '600',
  },
  currencyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  currencyItem: {
    borderRadius: 16,
    marginBottom: 8,
    marginRight: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  currencyNote: {
    fontSize: 12,
    textAlign: 'center',
  },
  featureItem: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingVertical: 8,
  },
  featureText: {
    flex: 1,
    fontSize: 14,
    marginLeft: 12,
  },
  featuresList: {
    gap: 12,
  },
  fxAnalysis: {
    alignItems: 'center',
    borderTopColor: '#F0F0F0',
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
  },
  fxDetails: {
    fontFamily: 'monospace',
    fontSize: 11,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  noPatterns: {
    alignItems: 'center',
    borderRadius: 12,
    elevation: 3,
    padding: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  noPatternsDesc: {
    fontSize: 14,
    textAlign: 'center',
  },
  noPatternsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    marginTop: 12,
  },
  noTransactions: {
    alignItems: 'center',
    borderRadius: 12,
    elevation: 3,
    padding: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  noTransactionsDesc: {
    fontSize: 14,
    textAlign: 'center',
  },
  noTransactionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    marginTop: 12,
  },
  overviewContainer: {
    paddingVertical: 16,
  },
  patternCard: {
    borderRadius: 12,
    elevation: 3,
    marginBottom: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  patternCount: {
    alignItems: 'center',
    borderRadius: 16,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  patternCountText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  patternDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  patternHeader: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  patternInfo: {
    flex: 1,
    marginLeft: 12,
  },
  patternName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  patternsContainer: {
    paddingVertical: 16,
  },
  realTimeContainer: {
    paddingVertical: 16,
  },
  riskBadge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  riskBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  riskIndicator: {
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  riskIndicatorText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  summaryCard: {
    borderRadius: 12,
    elevation: 3,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  summaryGrid: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  tab: {
    alignItems: 'center',
    borderRadius: 8,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    marginHorizontal: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  transactionCard: {
    borderRadius: 12,
    elevation: 3,
    marginBottom: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  transactionDescription: {
    fontSize: 12,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionMerchant: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
});

export default FXFraudMonitoringScreen;