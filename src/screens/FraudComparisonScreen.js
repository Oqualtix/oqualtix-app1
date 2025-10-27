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
import BrandConfig from '../config/BrandConfig';

const { width } = Dimensions.get('window');

const FraudComparisonScreen = ({ navigation }) => {
  const { isDarkMode } = useContext(ThemeContext);
  const { 
    realTimeTransactions, 
    fraudAnalysis, 
    fraudSummary,
    connectedBanks 
  } = useBankConnection();
  
  const [selectedComparison, setSelectedComparison] = useState('overview');
  const colors = BrandConfig.getColors(isDarkMode);

  // Calculate competitive advantages from recent transactions
  const getCompetitiveStats = () => {
    const recentTransactions = realTimeTransactions.slice(0, 50);
    const enhancedAnalyses = recentTransactions
      .map(t => t.fraudAnalysis)
      .filter(a => a && a.competitiveAdvantage);

    const totalAdvantages = enhancedAnalyses.reduce(
      (sum, a) => sum + (a.competitiveAdvantage?.totalAdvantages || 0), 0
    );

    const uniqueFeatures = new Set();
    enhancedAnalyses.forEach(a => {
      a.competitiveAdvantage?.advantages?.forEach(adv => {
        uniqueFeatures.add(adv.feature);
      });
    });

    return {
      totalAdvantages,
      uniqueFeatures: Array.from(uniqueFeatures),
      enhancedDetections: enhancedAnalyses.length,
      averageSuperiority: enhancedAnalyses.length > 0 ? 
        Math.round(enhancedAnalyses.reduce((sum, a) => sum + (a.competitiveAdvantage?.overallSuperiorityScore || 0), 0) / enhancedAnalyses.length) : 0
    };
  };

  const competitiveStats = getCompetitiveStats();

  const comparisonData = {
    overview: {
      title: 'Oqualtix vs Traditional Banking',
      items: [
        {
          feature: 'Cross-Bank Analysis',
          oqualtix: '✅ Full visibility across all connected banks',
          traditional: '❌ Limited to single bank view',
          advantage: '+40% fraud detection rate'
        },
        {
          feature: 'AI & Machine Learning',
          oqualtix: '✅ Advanced ML algorithms + behavioral AI',
          traditional: '❌ Basic rule-based systems',
          advantage: 'Detects unknown patterns'
        },
        {
          feature: 'Real-Time Analysis',
          oqualtix: '✅ Instant transaction analysis',
          traditional: '⚠️ Batch processing (hours/days delay)',
          advantage: 'Prevents losses before they occur'
        },
        {
          feature: 'Semantic Analysis',
          oqualtix: '✅ AI analyzes transaction descriptions',
          traditional: '❌ Amount-only monitoring',
          advantage: 'Catches shell companies'
        },
        {
          feature: 'Network Analysis',
          oqualtix: '✅ Maps vendor relationships',
          traditional: '❌ Individual transaction focus',
          advantage: 'Uncovers complex schemes'
        },
        {
          feature: 'Behavioral Biometrics',
          oqualtix: '✅ Personal spending pattern learning',
          traditional: '❌ Generic risk profiles',
          advantage: 'Personalized fraud detection'
        }
      ]
    },
    detection: {
      title: 'Detection Capabilities',
      items: [
        {
          type: 'Threshold Evasion',
          oqualtix: '98% detection rate',
          traditional: '15% detection rate',
          description: 'Payments just under $5K, $10K limits'
        },
        {
          type: 'Round Dollar Fraud',
          oqualtix: '95% detection rate',
          traditional: '25% detection rate',
          description: 'Suspicious $5K, $10K, $15K payments'
        },
        {
          type: 'Cross-Bank Structuring',
          oqualtix: '90% detection rate',
          traditional: '0% detection rate',
          description: 'Split payments across multiple banks'
        },
        {
          type: 'Shell Company Payments',
          oqualtix: '85% detection rate',
          traditional: '10% detection rate',
          description: 'AI analyzes company names and patterns'
        },
        {
          type: 'Statistical Outliers',
          oqualtix: '92% detection rate',
          traditional: '60% detection rate',
          description: 'Advanced statistical modeling'
        },
        {
          type: 'Timing Manipulation',
          oqualtix: '88% detection rate',
          traditional: '5% detection rate',
          description: 'End-of-period and holiday timing'
        }
      ]
    },
    features: {
      title: 'Advanced Features Exclusive to Oqualtix',
      items: competitiveStats.uniqueFeatures.map(feature => ({
        feature,
        status: 'Active',
        impact: this.getFeatureImpact(feature)
      }))
    }
  };

  const getFeatureImpact = (feature) => {
    const impacts = {
      'Cross-Bank Pattern Recognition': 'Catches 40% more sophisticated fraud',
      'Advanced Machine Learning': 'Detects previously unknown patterns',
      'AI-Powered Semantic Analysis': 'Identifies suspicious descriptions',
      'Vendor Network Analysis': 'Uncovers money laundering schemes',
      'Behavioral Biometrics': 'Personalizes fraud detection'
    };
    return impacts[feature] || 'Enhanced fraud detection capability';
  };

  const renderOverviewComparison = () => (
    <View style={styles.comparisonContainer}>
      {comparisonData.overview.items.map((item, index) => (
        <View key={index} style={[styles.comparisonItem, { backgroundColor: colors.surface }]}>
          <Text style={[styles.featureTitle, { color: colors.text }]}>{item.feature}</Text>
          
          <View style={styles.comparisonRow}>
            <View style={styles.comparisonColumn}>
              <Text style={[styles.columnHeader, { color: BrandConfig.colors.primary }]}>Oqualtix</Text>
              <Text style={[styles.comparisonText, { color: colors.text }]}>{item.oqualtix}</Text>
            </View>
            
            <View style={styles.comparisonColumn}>
              <Text style={[styles.columnHeader, { color: '#8E8E93' }]}>Traditional Banks</Text>
              <Text style={[styles.comparisonText, { color: colors.text }]}>{item.traditional}</Text>
            </View>
          </View>
          
          <View style={styles.advantageContainer}>
            <Ionicons name="trending-up" size={16} color={BrandConfig.colors.success} />
            <Text style={[styles.advantageText, { color: BrandConfig.colors.success }]}>
              {item.advantage}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );

  const renderDetectionComparison = () => (
    <View style={styles.detectionContainer}>
      {comparisonData.detection.items.map((item, index) => (
        <View key={index} style={[styles.detectionItem, { backgroundColor: colors.surface }]}>
          <Text style={[styles.detectionType, { color: colors.text }]}>{item.type}</Text>
          <Text style={[styles.detectionDescription, { color: colors.secondaryText }]}>
            {item.description}
          </Text>
          
          <View style={styles.detectionStats}>
            <View style={styles.detectionStat}>
              <Text style={[styles.detectionLabel, { color: BrandConfig.colors.primary }]}>Oqualtix</Text>
              <Text style={[styles.detectionRate, { color: BrandConfig.colors.primary }]}>
                {item.oqualtix}
              </Text>
            </View>
            
            <View style={styles.detectionStat}>
              <Text style={[styles.detectionLabel, { color: '#8E8E93' }]}>Traditional</Text>
              <Text style={[styles.detectionRate, { color: '#8E8E93' }]}>
                {item.traditional}
              </Text>
            </View>
          </View>
        </View>
      ))}
    </View>
  );

  const renderFeaturesComparison = () => (
    <View style={styles.featuresContainer}>
      <View style={[styles.statsCard, { backgroundColor: colors.surface }]}>
        <Text style={[styles.statsTitle, { color: colors.text }]}>Your Account Performance</Text>
        
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: BrandConfig.colors.primary }]}>
              {competitiveStats.enhancedDetections}
            </Text>
            <Text style={[styles.statLabel, { color: colors.secondaryText }]}>
              Enhanced Analyses
            </Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: BrandConfig.colors.primary }]}>
              {competitiveStats.uniqueFeatures.length}
            </Text>
            <Text style={[styles.statLabel, { color: colors.secondaryText }]}>
              Advanced Features Used
            </Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: BrandConfig.colors.primary }]}>
              {competitiveStats.averageSuperiority}%
            </Text>
            <Text style={[styles.statLabel, { color: colors.secondaryText }]}>
              Superiority Score
            </Text>
          </View>
        </View>
      </View>

      {competitiveStats.uniqueFeatures.map((feature, index) => (
        <View key={index} style={[styles.featureCard, { backgroundColor: colors.surface }]}>
          <View style={styles.featureHeader}>
            <Ionicons name="checkmark-circle" size={24} color={BrandConfig.colors.success} />
            <Text style={[styles.featureTitle, { color: colors.text }]}>{feature}</Text>
          </View>
          <Text style={[styles.featureImpact, { color: BrandConfig.colors.primary }]}>
            {getFeatureImpact(feature)}
          </Text>
        </View>
      ))}
    </View>
  );

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'analytics' },
    { id: 'detection', label: 'Detection Rates', icon: 'shield-checkmark' },
    { id: 'features', label: 'Your Features', icon: 'star' }
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Fraud Detection Comparison
        </Text>
        <TouchableOpacity onPress={() => Alert.alert(
          'Competitive Advantage',
          `Oqualtix has detected ${competitiveStats.totalAdvantages} advanced fraud indicators that traditional banking systems would miss.`
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
              selectedComparison === tab.id && { backgroundColor: BrandConfig.colors.primary }
            ]}
            onPress={() => setSelectedComparison(tab.id)}
          >
            <Ionicons 
              name={tab.icon} 
              size={20} 
              color={selectedComparison === tab.id ? '#FFFFFF' : colors.secondaryText} 
            />
            <Text style={[
              styles.tabText,
              { color: selectedComparison === tab.id ? '#FFFFFF' : colors.secondaryText }
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {selectedComparison === 'overview' && renderOverviewComparison()}
        {selectedComparison === 'detection' && renderDetectionComparison()}
        {selectedComparison === 'features' && renderFeaturesComparison()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 48,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  comparisonContainer: {
    paddingVertical: 16,
  },
  comparisonItem: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  comparisonRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  comparisonColumn: {
    flex: 1,
    paddingHorizontal: 8,
  },
  columnHeader: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  comparisonText: {
    fontSize: 13,
    lineHeight: 18,
  },
  advantageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  advantageText: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
  },
  detectionContainer: {
    paddingVertical: 16,
  },
  detectionItem: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  detectionType: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  detectionDescription: {
    fontSize: 13,
    marginBottom: 12,
    lineHeight: 18,
  },
  detectionStats: {
    flexDirection: 'row',
  },
  detectionStat: {
    flex: 1,
    alignItems: 'center',
  },
  detectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  detectionRate: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  featuresContainer: {
    paddingVertical: 16,
  },
  statsCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  featureCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureImpact: {
    fontSize: 13,
    fontWeight: '500',
    marginLeft: 32,
  },
});

export default FraudComparisonScreen;