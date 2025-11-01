import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { useBankConnection } from '../context/BankConnectionContext';
import EnhancedAnomalyDetectionUtils from '../utils/EnhancedAnomalyDetectionUtils';
import EmbezzlementDetectionUtils from '../utils/EmbezzlementDetectionUtils';

// Import brand configuration
import BrandConfig from '../config/BrandConfig';

// Import enhanced components
import DashboardNavigation from '../components/DashboardNavigation';
import {
  SecurityStatusWidget,
  AIAssistantWidget,
  BankingOverviewWidget,
  RealTimeMonitoringWidget,
  ComplianceScoreWidget,
  QuickStatsWidget,
  AIRecommendationsWidget,
  RecentAlertsWidget,
} from '../components/SmartDashboardWidgets';
import AlgorithmTrainer from '../components/AlgorithmTrainer';

const { width } = Dimensions.get('window');

const UserDashboard = ({ navigation }) => {
  const [dashboardData, setDashboardData] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [anomalies, setAnomalies] = useState([]);
  const [quickStats, setQuickStats] = useState({});
  const [showAlgorithmTrainer, setShowAlgorithmTrainer] = useState(false);
  const [customAlgorithms, setCustomAlgorithms] = useState([]);
  const [aiRecommendations, setAiRecommendations] = useState([]);
  const [recentAlerts, setRecentAlerts] = useState([]);
  const [showNavigation, setShowNavigation] = useState(false);
  const { user, logout } = useAuth();
  const { 
    connectedBanks, 
    realTimeTransactions, 
    totalBalance, 
    highRiskTransactions,
    connectionStatus,
    lastSyncTime 
  } = useBankConnection();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load comprehensive dashboard data
      const [
        companyData,
        userStats,
        recentAnomalies,
        systemHealth,
        recommendations,
        alerts
      ] = await Promise.all([
        loadCompanyAnalytics(),
        loadUserStatistics(),
        loadRecentAnomalies(),
        loadSystemHealth(),
        loadAIRecommendations(),
        loadRecentAlerts()
      ]);
      
      setDashboardData({
        company: companyData,
        user: userStats,
        system: systemHealth
      });
      
      setAnomalies(recentAnomalies);
      setQuickStats(calculateQuickStats(companyData, userStats));
      setAiRecommendations(recommendations);
      setRecentAlerts(alerts);
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      Alert.alert('Error', 'Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
  };

  const loadCompanyAnalytics = async () => {
    // Mock company analytics - in real app, this would fetch from backend
    return {
      companyName: user.company || 'Your Company',
      totalTransactions: 1247,
      monthlyVolume: 145832.45,
      alertsThisMonth: 8,
      riskScore: 23, // Out of 100
      employeeCount: 12,
      lastAuditDate: '2024-01-15',
      complianceStatus: 'COMPLIANT'
    };
  };

  // Load AI-powered recommendations
  const loadAIRecommendations = async () => {
    return [
      {
        id: 1,
        title: 'Enhanced Monitoring Recommended',
        description: 'AI detected unusual transaction patterns requiring attention',
        priority: 'HIGH',
        type: 'SECURITY_ALERT',
        action: 'Review recent large transactions and verify legitimacy'
      },
      {
        id: 2,
        title: 'Algorithm Performance Update',
        description: 'Your custom fraud detection model accuracy improved to 94.2%',
        priority: 'MEDIUM',
        type: 'SYSTEM_UPDATE',
        action: 'Consider expanding model to additional transaction types'
      },
      {
        id: 3,
        title: 'Compliance Review Due',
        description: 'Monthly GAAP compliance review is scheduled for next week',
        priority: 'MEDIUM',
        type: 'COMPLIANCE_REMINDER',
        action: 'Prepare documentation for compliance audit'
      }
    ];
  };

  // Load recent system alerts
  const loadRecentAlerts = async () => {
    return [
      {
        id: 1,
        title: 'High-value transaction detected',
        message: '$25,000 wire transfer flagged for review',
        severity: 'CRITICAL',
        time: '2 min ago',
        type: 'FRAUD_ALERT'
      },
      {
        id: 2,
        title: 'New bank account connected',
        message: 'Chase Bank successfully integrated',
        severity: 'INFO',
        time: '1 hour ago',
        type: 'SYSTEM_UPDATE'
      },
      {
        id: 3,
        title: 'Location anomaly detected',
        message: 'Transaction 300+ miles from usual location',
        severity: 'HIGH',
        time: '3 hours ago',
        type: 'LOCATION_ALERT'
      }
    ];
  };

  const loadUserStatistics = async () => {
    return {
      role: user.role || 'User',
      accessLevel: user.isAdmin ? 'Administrator' : 'Company User',
      loginCount: 47,
      lastLogin: new Date().toISOString(),
      alertsHandled: 15,
      transactionsReviewed: 234,
      accountStatus: 'ACTIVE',
      verificationStatus: 'VERIFIED'
    };
  };

  const loadRecentAnomalies = async () => {
    // Mock recent anomalies
    return [
      {
        id: 'ano_1',
        type: 'STATISTICAL_OUTLIER',
        severity: 'HIGH',
        amount: 15000,
        vendor: 'Suspicious Vendor LLC',
        date: new Date(),
        status: 'PENDING'
      },
      {
        id: 'ano_2',
        type: 'BEHAVIORAL_CHANGE',
        severity: 'MEDIUM',
        amount: 3500,
        vendor: 'Office Supplies Co',
        date: new Date(Date.now() - 86400000),
        status: 'REVIEWING'
      }
    ];
  };

  const loadSystemHealth = async () => {
    return {
      aiStatus: 'OPERATIONAL',
      detectionAccuracy: 94.7,
      systemUptime: 99.8,
      lastUpdate: '2024-01-20',
      featuresEnabled: ['Enhanced Detection', 'Real-time Alerts', 'Company Analytics']
    };
  };

  const calculateQuickStats = (companyData, userStats) => {
    // Calculate risk score based on anomalies and company data
    const riskScore = companyData.riskScore || Math.min(
      (anomalies.filter(a => a.severity === 'HIGH').length * 20) + 
      (anomalies.filter(a => a.severity === 'MEDIUM').length * 10), 
      100
    );

    // Generate sample risk trend data
    const riskTrend = [
      Math.max(riskScore - 30, 0),
      Math.max(riskScore - 20, 0),
      Math.max(riskScore - 10, 0),
      riskScore,
      Math.min(riskScore + 5, 100),
      Math.min(riskScore + 10, 100)
    ];

    return {
      totalValue: companyData.monthlyVolume,
      alertsToday: 3,
      riskReduction: 78, // Percentage
      timesSaved: 24, // Hours per month
      riskScore: riskScore,
      aiConfidence: 85 + Math.random() * 10, // 85-95% confidence
      riskTrend: riskTrend
    };
  };

  const getRiskColor = (score) => {
    if (score < 30) return '#4CAF50'; // Green
    if (score < 60) return '#FF9500'; // Orange
    return '#FF3B30'; // Red
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'OPERATIONAL':
      case 'COMPLIANT':
      case 'ACTIVE':
      case 'VERIFIED':
        return '#4CAF50';
      case 'WARNING':
      case 'REVIEWING':
        return '#FF9500';
      case 'CRITICAL':
      case 'PENDING':
        return '#FF3B30';
      default:
        return '#8E8E93';
    }
  };

  // Algorithm Management Functions
  const handleSaveCustomAlgorithm = (algorithm) => {
    setCustomAlgorithms(prev => [...prev, algorithm]);
    
    // Update dashboard data with new algorithm
    setDashboardData(prev => ({
      ...prev,
      customAlgorithms: [...(prev.customAlgorithms || []), algorithm]
    }));

    Alert.alert(
      'Algorithm Deployed!',
      `${algorithm.name} is now active and monitoring your financial data.`,
      [{ text: 'Awesome!' }]
    );
  };

  const handleOpenAlgorithmTrainer = () => {
    setShowAlgorithmTrainer(true);
  };

  // Main render function with organized dashboard
  const renderMainDashboard = () => {
    if (showNavigation) {
      return <DashboardNavigation navigation={navigation} />;
    }

    return (
      <ScrollView 
        style={styles.container} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Enhanced Header */}
        <LinearGradient
          colors={[BrandConfig.colors.primary, BrandConfig.colors.primaryDark]}
          style={styles.enhancedHeader}
        >
          <View style={styles.headerTop}>
            <View style={styles.userInfo}>
              <Text style={styles.welcomeText}>Welcome back,</Text>
              <Text style={styles.userName}>{user?.name || user?.firstName || user?.email || 'User'}</Text>
            </View>
            <TouchableOpacity 
              style={styles.navigationToggle}
              onPress={() => setShowNavigation(true)}
            >
              <Ionicons name="apps" size={24} color="white" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.headerStats}>
            <View style={styles.headerStat}>
              <Text style={styles.headerStatValue}>{connectedBanks?.length || 0}</Text>
              <Text style={styles.headerStatLabel}>Banks</Text>
            </View>
            <View style={styles.headerStat}>
              <Text style={styles.headerStatValue}>{recentAlerts.length}</Text>
              <Text style={styles.headerStatLabel}>Alerts</Text>
            </View>
            <View style={styles.headerStat}>
              <Text style={styles.headerStatValue}>
                {dashboardData.company?.riskScore || 23}
              </Text>
              <Text style={styles.headerStatLabel}>Risk Score</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Main Widgets Grid */}
        <View style={styles.widgetsContainer}>
          <View style={styles.widgetsRow}>
            <SecurityStatusWidget
              onPress={() => navigation.navigate('FinancialTracking')}
              data={{
                riskLevel: dashboardData.company?.riskScore > 60 ? 'HIGH' : 
                          dashboardData.company?.riskScore > 30 ? 'MEDIUM' : 'LOW',
                activeCases: recentAlerts.filter(a => a.severity === 'CRITICAL').length,
                lastScan: 'Just now'
              }}
            />
            <AIAssistantWidget
              onPress={() => navigation.navigate('OxulAIScreen')}
              data={{
                aiStatus: 'online',
                lastInteraction: 'Ready to assist with fraud detection'
              }}
            />
          </View>
          
          <View style={styles.widgetsRow}>
            <BankingOverviewWidget
              onPress={() => navigation.navigate('BankIntegrationScreen')}
              data={{
                connectedBanks: connectedBanks?.length || 0,
                totalBalance: totalBalance || 0
              }}
            />
            <RealTimeMonitoringWidget
              onPress={() => navigation.navigate('FinancialTracking')}
              data={{
                isActive: connectionStatus === 'connected',
                transactionsToday: realTimeTransactions?.length || 0
              }}
            />
          </View>
        </View>

        {/* Performance Metrics */}
        <QuickStatsWidget
          data={{
            totalTransactions: dashboardData.company?.totalTransactions || 0,
            anomaliesDetected: anomalies.length,
            accuracyRate: 94.2,
            responseTime: 12
          }}
        />

        {/* AI Recommendations */}
        <AIRecommendationsWidget
          onPress={() => navigation.navigate('FinancialTracking')}
          data={{ recommendations: aiRecommendations }}
        />

        {/* Recent Alerts */}
        <RecentAlertsWidget
          onPress={() => navigation.navigate('FinancialTracking')}
          data={{ recentAlerts }}
        />

        {/* Secondary Widgets Row */}
        <View style={styles.secondaryWidgets}>
          <ComplianceScoreWidget
            onPress={() => navigation.navigate('FinancialTracking')}
            data={{
              complianceScore: dashboardData.company?.complianceScore || 94,
              issuesFound: 2
            }}
          />
        </View>

        {/* Quick Access Actions */}
        <View style={styles.quickAccessContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickAccessGrid}>
            <TouchableOpacity 
              style={styles.quickAccessItem}
              onPress={handleOpenAlgorithmTrainer}
            >
              <Ionicons name="school" size={24} color={BrandConfig.colors.primary} />
              <Text style={styles.quickAccessText}>Train AI</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickAccessItem}
              onPress={() => navigation.navigate('FXFraudMonitoringScreen')}
            >
              <Ionicons name="globe" size={24} color="#FF9500" />
              <Text style={styles.quickAccessText}>FX Monitor</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickAccessItem}
              onPress={() => navigation.navigate('CorporateDashboard')}
            >
              <Ionicons name="business" size={24} color="#8E44AD" />
              <Text style={styles.quickAccessText}>Enterprise</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickAccessItem}
              onPress={() => navigation.navigate('FraudComparisonScreen')}
            >
              <Ionicons name="trophy" size={24} color="#34C759" />
              <Text style={styles.quickAccessText}>Compare</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={BrandConfig.colors.primary} />
        <Text style={styles.loadingText}>Loading your dashboard...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderMainDashboard()}
      
      {/* Algorithm Trainer Modal */}
      {showAlgorithmTrainer && (
        <AlgorithmTrainer
          visible={showAlgorithmTrainer}
          onClose={() => setShowAlgorithmTrainer(false)}
          onAlgorithmTrained={(algorithm) => {
            setCustomAlgorithms([...customAlgorithms, algorithm]);
            setShowAlgorithmTrainer(false);
          }}
        />
      )}
    </View>
  );
};

const firstStyles = StyleSheet.create({
  actionCard: {
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
    width: '48%',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionText: {
    color: '#333',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  anomalyAmount: {
    color: '#333',
    fontSize: 16,
    fontWeight: 'bold',
  },
  anomalyCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
  },
  anomalyDate: {
    color: '#666',
    fontSize: 12,
    marginTop: 2,
  },
  anomalyHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 8,
  },
  anomalyIcon: {
    alignItems: 'center',
    borderRadius: 16,
    height: 32,
    justifyContent: 'center',
    marginRight: 12,
    width: 32,
  },
  anomalyInfo: {
    flex: 1,
  },
  anomalyStatus: {
    alignSelf: 'flex-start',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  anomalyStatusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  anomalyType: {
    color: '#333',
    fontSize: 14,
    fontWeight: '600',
  },
  anomalyVendor: {
    color: '#666',
    fontSize: 12,
    marginBottom: 8,
  },
  bottomPadding: {
    height: 100,
  },
  companyName: {
    color: '#FFFFFF',
    fontSize: 14,
    marginTop: 2,
    opacity: 0.8,
  },
  container: {
    backgroundColor: '#F8F9FA',
    flex: 1,
  },
  header: {
    paddingBottom: 30,
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  headerContent: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  headerGradient: {
    borderRadius: 20,
    marginHorizontal: 20,
    marginTop: 10,
  },
  loadingContainer: {
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    flex: 1,
    justifyContent: 'center',
  },
  loadingText: {
    color: BrandConfig.colors.textSecondary,
    fontSize: 16,
    marginTop: 15,
  },
  profileButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 25,
    height: 50,
    justifyContent: 'center',
    width: 50,
  },
  quickStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  riskCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
  },
  riskDescription: {
    color: '#666',
    fontSize: 12,
    marginTop: 8,
  },
  riskHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  riskIndicator: {
    alignItems: 'center',
    borderRadius: 25,
    height: 50,
    justifyContent: 'center',
    width: 50,
  },
  riskLabel: {
    color: '#666',
    fontSize: 14,
  },
  riskProgress: {
    marginTop: 12,
  },
  riskProgressBar: {
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    height: 8,
    overflow: 'hidden',
  },
  riskProgressFill: {
    borderRadius: 4,
    height: '100%',
  },
  riskScore: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 4,
  },
  sectionContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    elevation: 3,
    marginBottom: 20,
    marginHorizontal: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    color: BrandConfig.colors.textPrimary,
    fontSize: 20,
    fontWeight: 'bold',
  },
  statCard: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    elevation: 3,
    minWidth: 100,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statLabel: {
    color: '#666',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  statValue: {
    color: '#333',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 8,
  },
  statusDot: {
    borderRadius: 4,
    height: 8,
    marginRight: 8,
    width: 8,
  },
  systemCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
  },
  systemLabel: {
    color: '#333',
    fontSize: 14,
  },
  systemRow: {
    alignItems: 'center',
    borderBottomColor: '#E0E0E0',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  systemStatus: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  systemValue: {
    color: '#666',
    fontSize: 12,
    fontWeight: '600',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 4,
  },
  viewAllButton: {
    backgroundColor: BrandConfig.colors.secondary,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  viewAllText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  welcomeText: {
    color: '#FFFFFF',
    fontSize: 16,
    opacity: 0.9,
  },
});

const styles = StyleSheet.create({
  actionCard: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    elevation: 4,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    width: (width - 52) / 2,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionSubtitle: {
    color: '#8E8E93',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  actionTitle: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 12,
    textAlign: 'center',
  },
  advantageStats: {
    borderTopColor: '#F0F0F0',
    borderTopWidth: 1,
    paddingTop: 12,
  },
  advantageStatsText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  algorithmTrainerCard: {
    backgroundColor: BrandConfig.colors.surface,
    borderColor: BrandConfig.colors.border,
    borderRadius: 12,
    borderWidth: 1,
    elevation: 3,
    margin: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  algorithmTrainerHeader: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  algorithmTrainerIcon: {
    alignItems: 'center',
    backgroundColor: BrandConfig.colors.backgroundSecondary,
    borderRadius: 24,
    height: 48,
    justifyContent: 'center',
    marginRight: 12,
    width: 48,
  },
  algorithmTrainerInfo: {
    flex: 1,
  },
  algorithmTrainerStats: {
    borderTopColor: BrandConfig.colors.border,
    borderTopWidth: 1,
    marginTop: 12,
    paddingTop: 12,
  },
  algorithmTrainerStatsText: {
    color: BrandConfig.colors.primary,
    fontSize: 13,
    fontWeight: '500',
  },
  algorithmTrainerSubtitle: {
    color: BrandConfig.colors.textSecondary,
    fontSize: 14,
    lineHeight: 18,
  },
  algorithmTrainerTitle: {
    color: BrandConfig.colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  anomalyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    elevation: 2,
    marginBottom: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  anomalyContent: {
    flex: 1,
  },
  anomalyDate: {
    color: '#C7C7CC',
    fontSize: 11,
  },
  anomalyDetails: {
    color: '#8E8E93',
    fontSize: 12,
    marginBottom: 2,
  },
  anomalyHeader: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  anomalyType: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  bankConnectionsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    elevation: 4,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  bankConnectionsHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  bankConnectionsStats: {
    flex: 1,
    flexDirection: 'row',
  },
  bankPreviewAccount: {
    color: '#8E8E93',
    fontSize: 12,
  },
  bankPreviewInfo: {
    flex: 1,
  },
  bankPreviewItem: {
    alignItems: 'center',
    borderBottomColor: '#F0F0F0',
    borderBottomWidth: 1,
    flexDirection: 'row',
    paddingVertical: 8,
  },
  bankPreviewLogo: {
    fontSize: 24,
    marginRight: 12,
  },
  bankPreviewName: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  bankPreviewStatus: {
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  bankPreviewStatusText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  bankStat: {
    alignItems: 'center',
    flex: 1,
  },
  bankStatLabel: {
    color: '#8E8E93',
    fontSize: 12,
    textAlign: 'center',
  },
  bankStatValue: {
    color: '#000000',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  bottomPadding: {
    height: 40,
  },
  bottomSpacing: {
    height: 30,
  },
  companyName: {
    color: '#FFFFFF',
    fontSize: 14,
    opacity: 0.9,
  },
  competitiveFeature: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingVertical: 6,
  },
  competitiveFeatures: {
    marginVertical: 12,
  },
  competitiveFeatureText: {
    flex: 1,
    fontSize: 14,
    marginLeft: 12,
  },
  connectBankButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  connectBankButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  connectedBanksPreview: {
    marginBottom: 12,
  },
  connectionStatus: {
    borderRadius: 6,
    marginLeft: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  connectionStatusText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  container: {
    backgroundColor: BrandConfig.colors.background,
    flex: 1,
  },
  enhancedHeader: {
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    padding: 20,
    paddingTop: 50,
  },
  fxFeature: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingVertical: 4,
  },
  fxFeaturesList: {
    marginVertical: 12,
  },
  fxFeatureText: {
    flex: 1,
    fontSize: 13,
    marginLeft: 10,
  },
  fxStats: {
    borderTopColor: '#F0F0F0',
    borderTopWidth: 1,
    paddingTop: 12,
  },
  fxStatsText: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  header: {
    paddingBottom: 30,
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  headerContent: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerStat: {
    alignItems: 'center',
  },
  headerStatLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    marginTop: 2,
  },
  headerStats: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 15,
  },
  headerStatValue: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerTop: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  lastSyncText: {
    color: '#8E8E93',
    fontSize: 11,
    marginTop: 8,
    textAlign: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    backgroundColor: BrandConfig.colors.background,
    flex: 1,
    justifyContent: 'center',
  },
  loadingText: {
    color: '#8E8E93',
    fontSize: 16,
    marginTop: 16,
  },
  moreBanksText: {
    color: '#8E8E93',
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 8,
    textAlign: 'center',
  },
  navigationToggle: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 12,
  },
  noBanksConnected: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  noBanksDescription: {
    color: '#8E8E93',
    fontSize: 14,
    lineHeight: 18,
    marginBottom: 16,
    textAlign: 'center',
  },
  noBanksTitle: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    marginTop: 12,
  },
  profileButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 25,
    height: 50,
    justifyContent: 'center',
    width: 50,
  },
  quickAccessContainer: {
    padding: 20,
  },
  quickAccessGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickAccessItem: {
    alignItems: 'center',
    backgroundColor: 'white',
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
  quickAccessText: {
    color: BrandConfig.colors.text,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  quickStatsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: -15,
    paddingHorizontal: 20,
  },
  reviewButton: {
    backgroundColor: '#FF3B30',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  reviewButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  riskCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    elevation: 4,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  riskDescription: {
    color: '#8E8E93',
    fontSize: 14,
  },
  riskHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  riskIndicator: {
    alignItems: 'center',
    borderRadius: 25,
    height: 50,
    justifyContent: 'center',
    width: 50,
  },
  riskLabel: {
    color: '#8E8E93',
    fontSize: 14,
    marginBottom: 4,
  },
  riskProgress: {
    marginTop: 8,
  },
  riskProgressBar: {
    backgroundColor: '#E5E5EA',
    borderRadius: 4,
    height: 8,
    marginBottom: 8,
  },
  riskProgressFill: {
    borderRadius: 4,
    height: '100%',
  },
  riskScore: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  riskTransactionsAlert: {
    alignItems: 'center',
    backgroundColor: '#FFF3F3',
    borderLeftColor: '#FF3B30',
    borderLeftWidth: 3,
    borderRadius: 8,
    flexDirection: 'row',
    marginBottom: 16,
    padding: 12,
  },
  riskTransactionsText: {
    color: '#FF3B30',
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  secondaryWidgets: {
    marginBottom: 20,
    paddingHorizontal: 15,
  },
  sectionContainer: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#000000',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  severityIndicator: {
    borderRadius: 2,
    height: 40,
    marginRight: 12,
    width: 4,
  },
  statCard: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    elevation: 4,
    flex: 1,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  statLabel: {
    color: '#8E8E93',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  statusBadge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusDot: {
    borderRadius: 4,
    height: 8,
    marginRight: 8,
    width: 8,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  statValue: {
    color: '#000000',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 8,
  },
  systemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    elevation: 4,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  systemLabel: {
    color: '#000000',
    fontSize: 14,
  },
  systemRow: {
    alignItems: 'center',
    borderBottomColor: '#F2F2F7',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  systemStatus: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  systemValue: {
    color: '#8E8E93',
    fontSize: 14,
    fontWeight: '600',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  viewAllButton: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  viewAllText: {
    color: '#007AFF',
    fontSize: 14,
    marginRight: 4,
  },
  viewComparisonButton: {
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  viewComparisonButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  welcomeText: {
    color: '#FFFFFF',
    fontSize: 16,
    opacity: 0.8,
  },
  widgetsContainer: {
    padding: 15,
  },
  widgetsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
});

export default UserDashboard;