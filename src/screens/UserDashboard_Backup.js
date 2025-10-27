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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  // Original Dashboard Styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  loadingText: {
    fontSize: 16,
    color: BrandConfig.colors.textSecondary,
    marginTop: 15,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerGradient: {
    borderRadius: 20,
    marginHorizontal: 20,
    marginTop: 10,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  userInfo: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 4,
  },
  companyName: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.8,
    marginTop: 2,
  },
  profileButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginTop: 10,
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    minWidth: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  sectionContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: BrandConfig.colors.textPrimary,
  },
  viewAllButton: {
    backgroundColor: BrandConfig.colors.secondary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  riskCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
  },
  riskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  riskLabel: {
    fontSize: 14,
    color: '#666',
  },
  riskScore: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 4,
  },
  riskIndicator: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  riskProgress: {
    marginTop: 12,
  },
  riskProgressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  riskProgressFill: {
    height: '100%',
    borderRadius: 4,
  },
  riskDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
  },
  anomalyCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  anomalyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  anomalyIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  anomalyInfo: {
    flex: 1,
  },
  anomalyType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  anomalyDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  anomalyAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  anomalyVendor: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  anomalyStatus: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  anomalyStatusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  systemCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
  },
  systemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  systemLabel: {
    fontSize: 14,
    color: '#333',
  },
  systemStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  systemValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '48%',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    marginTop: 8,
    textAlign: 'center',
  },
  bottomPadding: {
    height: 100,
  },
});

export default UserDashboard;

      {/* Recent Anomalies */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Anomalies</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('FinancialTracking')}
            style={styles.viewAllButton}
          >
            <Text style={styles.viewAllText}>View All</Text>
            <Ionicons name="chevron-forward" size={16} color="#007AFF" />
          </TouchableOpacity>
        </View>
        
        {anomalies.map((anomaly, index) => (
          <View key={anomaly.id} style={styles.anomalyCard}>
            <View style={styles.anomalyHeader}>
              <View style={[
                styles.severityIndicator,
                { backgroundColor: anomaly.severity === 'HIGH' ? '#FF3B30' : '#FF9500' }
              ]} />
              <View style={styles.anomalyContent}>
                <Text style={styles.anomalyType}>{anomaly.type.replace('_', ' ')}</Text>
                <Text style={styles.anomalyDetails}>
                  {anomaly.vendor} • ${anomaly.amount.toLocaleString()}
                </Text>
                <Text style={styles.anomalyDate}>
                  {new Date(anomaly.date).toLocaleDateString()}
                </Text>
              </View>
              <View style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(anomaly.status) }
              ]}>
                <Text style={styles.statusText}>{anomaly.status}</Text>
              </View>
            </View>
          </View>
        ))}
      </View>

      {/* System Status */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>System Status</Text>
        <View style={styles.systemCard}>
          <View style={styles.systemRow}>
            <Text style={styles.systemLabel}>AI Detection System</Text>
            <View style={styles.systemStatus}>
              <View style={[styles.statusDot, { backgroundColor: getStatusColor(dashboardData.system?.aiStatus) }]} />
              <Text style={styles.systemValue}>{dashboardData.system?.aiStatus}</Text>
            </View>
          </View>
          
          <View style={styles.systemRow}>
            <Text style={styles.systemLabel}>Detection Accuracy</Text>
            <Text style={styles.systemValue}>{dashboardData.system?.detectionAccuracy}%</Text>
          </View>
          
          <View style={styles.systemRow}>
            <Text style={styles.systemLabel}>System Uptime</Text>
            <Text style={styles.systemValue}>{dashboardData.system?.systemUptime}%</Text>
          </View>
          
          <View style={styles.systemRow}>
            <Text style={styles.systemLabel}>Last Update</Text>
            <Text style={styles.systemValue}>{dashboardData.system?.lastUpdate}</Text>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('FinancialTracking')}
          >
            <Ionicons name="analytics" size={32} color="#007AFF" />
            <Text style={styles.actionTitle}>View Transactions</Text>
            <Text style={styles.actionSubtitle}>Review financial data</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('OxulAI')}
          >
            <Ionicons name="brain" size={32} color="#5856D6" />
            <Text style={styles.actionTitle}>AI Assistant</Text>
            <Text style={styles.actionSubtitle}>Get AI insights</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('Settings')}
          >
            <Ionicons name="settings" size={32} color="#FF9500" />
            <Text style={styles.actionTitle}>Settings</Text>
            <Text style={styles.actionSubtitle}>Manage preferences</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => Alert.alert('Support', 'Contact support@oqualtix.com for assistance.')}
          >
            <Ionicons name="help-circle" size={32} color="#4CAF50" />
            <Text style={styles.actionTitle}>Support</Text>
            <Text style={styles.actionSubtitle}>Get help</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Enhanced Status Dashboard Widget */}
      <QuickActionWidgets.StatusDashboard 
        stats={{
          filesProcessed: dashboardData.user?.filesProcessed || 0,
          alertsActive: anomalies.length || 0,
          riskScore: quickStats.riskScore || 0,
          confidence: quickStats.aiConfidence || 85
        }}
      />

      {/* Algorithm Training Quick Action */}
      <TouchableOpacity style={styles.algorithmTrainerCard} onPress={handleOpenAlgorithmTrainer}>
        <View style={styles.algorithmTrainerHeader}>
          <View style={styles.algorithmTrainerIcon}>
            <Ionicons name="settings-outline" size={24} color={BrandConfig.colors.primary} />
          </View>
          <View style={styles.algorithmTrainerInfo}>
            <Text style={styles.algorithmTrainerTitle}>Train Custom Algorithms</Text>
            <Text style={styles.algorithmTrainerSubtitle}>
              Create specialized fraud detection models with your data
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={BrandConfig.colors.textSecondary} />
        </View>
        
        {customAlgorithms.length > 0 && (
          <View style={styles.algorithmTrainerStats}>
            <Text style={styles.algorithmTrainerStatsText}>
              {customAlgorithms.length} Custom Algorithm{customAlgorithms.length !== 1 ? 's' : ''} Active
            </Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Bank Connections Section */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>🏦 Bank Connections</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('BankIntegration')}
            style={styles.viewAllButton}
          >
            <Text style={styles.viewAllText}>Manage</Text>
            <Ionicons name="chevron-forward" size={16} color="#007AFF" />
          </TouchableOpacity>
        </View>

        {/* Bank Connection Summary */}
        <View style={styles.bankConnectionsCard}>
          <View style={styles.bankConnectionsHeader}>
            <View style={styles.bankConnectionsStats}>
              <View style={styles.bankStat}>
                <Text style={styles.bankStatValue}>{connectedBanks.length}</Text>
                <Text style={styles.bankStatLabel}>Connected Banks</Text>
              </View>
              <View style={styles.bankStat}>
                <Text style={[styles.bankStatValue, { color: '#4CAF50' }]}>
                  ${totalBalance.toLocaleString()}
                </Text>
                <Text style={styles.bankStatLabel}>Total Balance</Text>
              </View>
              <View style={styles.bankStat}>
                <Text style={[styles.bankStatValue, { color: realTimeTransactions.length > 0 ? '#007AFF' : '#8E8E93' }]}>
                  {realTimeTransactions.length}
                </Text>
                <Text style={styles.bankStatLabel}>Live Transactions</Text>
              </View>
            </View>
            
            <View style={[styles.connectionStatus, { 
              backgroundColor: connectionStatus === 'connected' ? '#4CAF50' : 
                             connectionStatus === 'connecting' ? '#FF9500' : '#8E8E93' 
            }]}>
              <Text style={styles.connectionStatusText}>
                {connectionStatus === 'connected' ? 'Live' : 
                 connectionStatus === 'connecting' ? 'Syncing' : 'Offline'}
              </Text>
            </View>
          </View>

          {/* Recent High-Risk Transactions */}
          {highRiskTransactions > 0 && (
            <View style={styles.riskTransactionsAlert}>
              <Ionicons name="warning" size={20} color="#FF3B30" />
              <Text style={styles.riskTransactionsText}>
                {highRiskTransactions} high-risk transaction{highRiskTransactions !== 1 ? 's' : ''} detected
              </Text>
              <TouchableOpacity style={styles.reviewButton}>
                <Text style={styles.reviewButtonText}>Review</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Connected Banks Preview */}
          {connectedBanks.length > 0 ? (
            <View style={styles.connectedBanksPreview}>
              {connectedBanks.slice(0, 3).map((bank, index) => (
                <View key={bank.id} style={styles.bankPreviewItem}>
                  <Text style={styles.bankPreviewLogo}>{bank.bankLogo}</Text>
                  <View style={styles.bankPreviewInfo}>
                    <Text style={styles.bankPreviewName}>{bank.bankName}</Text>
                    <Text style={styles.bankPreviewAccount}>{bank.accountNumber}</Text>
                  </View>
                  <View style={[styles.bankPreviewStatus, { 
                    backgroundColor: bank.realTimeEnabled ? '#4CAF50' : '#8E8E93' 
                  }]}>
                    <Text style={styles.bankPreviewStatusText}>
                      {bank.realTimeEnabled ? 'Live' : 'Paused'}
                    </Text>
                  </View>
                </View>
              ))}
              {connectedBanks.length > 3 && (
                <Text style={styles.moreBanksText}>
                  +{connectedBanks.length - 3} more bank{connectedBanks.length - 3 !== 1 ? 's' : ''}
                </Text>
              )}
            </View>
          ) : (
            <View style={styles.noBanksConnected}>
              <Ionicons name="bank-outline" size={48} color="#8E8E93" />
              <Text style={styles.noBanksTitle}>No Banks Connected</Text>
              <Text style={styles.noBanksDescription}>
                Connect your bank accounts for real-time fraud monitoring
              </Text>
              <TouchableOpacity
                style={styles.connectBankButton}
                onPress={() => navigation.navigate('BankIntegration')}
              >
                <Text style={styles.connectBankButtonText}>Connect Bank Account</Text>
              </TouchableOpacity>
            </View>
          )}

          {lastSyncTime && (
            <Text style={styles.lastSyncText}>
              Last sync: {new Date(lastSyncTime).toLocaleString()}
            </Text>
          )}
        </View>
      </View>

      {/* Competitive Advantage Section */}
      <View style={[styles.bankConnectionsCard, { backgroundColor: colors.surface }]}>
        <View style={styles.bankConnectionsHeader}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>🚀 Why Choose Oqualtix?</Text>
            <Text style={[styles.cardSubtitle, { color: colors.secondaryText }]}>
              Advanced fraud detection beyond traditional banking
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.viewComparisonButton, { backgroundColor: BrandConfig.colors.accent }]}
            onPress={() => navigation.navigate('FraudComparison')}
          >
            <Text style={styles.viewComparisonButtonText}>View Comparison</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.competitiveFeatures}>
          <View style={styles.competitiveFeature}>
            <Ionicons name="analytics" size={20} color={BrandConfig.colors.primary} />
            <Text style={[styles.competitiveFeatureText, { color: colors.text }]}>
              Cross-bank pattern analysis
            </Text>
          </View>
          <View style={styles.competitiveFeature}>
            <Ionicons name="brain" size={20} color={BrandConfig.colors.primary} />
            <Text style={[styles.competitiveFeatureText, { color: colors.text }]}>
              AI-powered semantic analysis
            </Text>
          </View>
          <View style={styles.competitiveFeature}>
            <Ionicons name="shield-checkmark" size={20} color={BrandConfig.colors.primary} />
            <Text style={[styles.competitiveFeatureText, { color: colors.text }]}>
              Real-time behavioral biometrics
            </Text>
          </View>
        </View>
        
        <View style={styles.advantageStats}>
          <Text style={[styles.advantageStatsText, { color: BrandConfig.colors.success }]}>
            ✅ 40% better fraud detection than traditional banking
          </Text>
        </View>
      </View>

      {/* FX Fraud Monitoring Section */}
      <View style={[styles.bankConnectionsCard, { backgroundColor: colors.surface }]}>
        <View style={styles.bankConnectionsHeader}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>🌍 FX Fraud Monitoring</Text>
            <Text style={[styles.cardSubtitle, { color: colors.secondaryText }]}>
              Advanced foreign exchange fraud detection
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.viewComparisonButton, { backgroundColor: '#FF9500' }]}
            onPress={() => navigation.navigate('FXFraudMonitoring')}
          >
            <Text style={styles.viewComparisonButtonText}>Monitor FX</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.fxFeaturesList}>
          <View style={styles.fxFeature}>
            <Ionicons name="trending-up" size={18} color="#FF9500" />
            <Text style={[styles.fxFeatureText, { color: colors.text }]}>
              Real-time FX rate monitoring
            </Text>
          </View>
          <View style={styles.fxFeature}>
            <Ionicons name="swap-horizontal" size={18} color="#FF9500" />
            <Text style={[styles.fxFeatureText, { color: colors.text }]}>
              Currency layering detection
            </Text>
          </View>
          <View style={styles.fxFeature}>
            <Ionicons name="time" size={18} color="#FF9500" />
            <Text style={[styles.fxFeatureText, { color: colors.text }]}>
              Weekend/off-hours FX alerts
            </Text>
          </View>
        </View>
        
        <View style={styles.fxStats}>
          <Text style={[styles.fxStatsText, { color: '#FF9500' }]}>
            🌍 Monitoring {realTimeTransactions.filter(t => t.category === 'International' || t.category === 'Foreign Exchange').length} FX transactions
          </Text>
        </View>
      </View>

      {/* Risk Trend Visualization */}
      {quickStats.riskTrend && (
        <DataVisualizationComponents.RiskTrendChart 
          data={{
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            values: quickStats.riskTrend || [20, 45, 28, 80, 99, 43]
          }}
          title="Risk Score Trend (Last 6 Months)"
        />
      )}

      {/* AI Confidence Meter */}
      <DataVisualizationComponents.AIConfidenceMeter 
        confidence={quickStats.aiConfidence || 85}
      />

      <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Algorithm Trainer Modal */}
      <AlgorithmTrainer
        visible={showAlgorithmTrainer}
        onClose={() => setShowAlgorithmTrainer(false)}
        onSaveCustomAlgorithm={handleSaveCustomAlgorithm}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BrandConfig.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: BrandConfig.colors.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#8E8E93',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.8,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  companyName: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  profileButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickStatsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: -15,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 4,
    textAlign: 'center',
  },
  sectionContainer: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 14,
    color: '#007AFF',
    marginRight: 4,
  },
  riskCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  riskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  riskLabel: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 4,
  },
  riskScore: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  riskIndicator: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  riskProgress: {
    marginTop: 8,
  },
  riskProgressBar: {
    height: 8,
    backgroundColor: '#E5E5EA',
    borderRadius: 4,
    marginBottom: 8,
  },
  riskProgressFill: {
    height: '100%',
    borderRadius: 4,
  },
  riskDescription: {
    fontSize: 14,
    color: '#8E8E93',
  },
  anomalyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  anomalyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  severityIndicator: {
    width: 4,
    height: 40,
    borderRadius: 2,
    marginRight: 12,
  },
  anomalyContent: {
    flex: 1,
  },
  anomalyType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  anomalyDetails: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 2,
  },
  anomalyDate: {
    fontSize: 11,
    color: '#C7C7CC',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  systemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  systemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  systemLabel: {
    fontSize: 14,
    color: '#000000',
  },
  systemStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  systemValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    width: (width - 52) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    marginTop: 12,
    textAlign: 'center',
  },
  actionSubtitle: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 4,
    textAlign: 'center',
  },
  bottomPadding: {
    height: 40,
  },
  algorithmTrainerCard: {
    backgroundColor: BrandConfig.colors.surface,
    borderRadius: 12,
    margin: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: BrandConfig.colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  algorithmTrainerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  algorithmTrainerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: BrandConfig.colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  algorithmTrainerInfo: {
    flex: 1,
  },
  algorithmTrainerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: BrandConfig.colors.textPrimary,
    marginBottom: 4,
  },
  algorithmTrainerSubtitle: {
    fontSize: 14,
    color: BrandConfig.colors.textSecondary,
    lineHeight: 18,
  },
  algorithmTrainerStats: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: BrandConfig.colors.border,
  },
  algorithmTrainerStatsText: {
    fontSize: 13,
    color: BrandConfig.colors.primary,
    fontWeight: '500',
  },
  // Bank Connections Styles
  bankConnectionsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  bankConnectionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  bankConnectionsStats: {
    flexDirection: 'row',
    flex: 1,
  },
  bankStat: {
    flex: 1,
    alignItems: 'center',
  },
  bankStatValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 2,
  },
  bankStatLabel: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
  },
  connectionStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 12,
  },
  connectionStatusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  riskTransactionsAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3F3',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#FF3B30',
  },
  riskTransactionsText: {
    flex: 1,
    fontSize: 14,
    color: '#FF3B30',
    fontWeight: '500',
    marginLeft: 8,
  },
  reviewButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  reviewButtonText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  connectedBanksPreview: {
    marginBottom: 12,
  },
  bankPreviewItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  bankPreviewLogo: {
    fontSize: 24,
    marginRight: 12,
  },
  bankPreviewInfo: {
    flex: 1,
  },
  bankPreviewName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 2,
  },
  bankPreviewAccount: {
    fontSize: 12,
    color: '#8E8E93',
  },
  bankPreviewStatus: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  bankPreviewStatusText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  moreBanksText: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  noBanksConnected: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  noBanksTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginTop: 12,
    marginBottom: 4,
  },
  noBanksDescription: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 18,
  },
  connectBankButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  connectBankButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  lastSyncText: {
    fontSize: 11,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 8,
  },
  // Competitive Advantage Styles
  viewComparisonButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  viewComparisonButtonText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  competitiveFeatures: {
    marginVertical: 12,
  },
  competitiveFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  competitiveFeatureText: {
    fontSize: 14,
    marginLeft: 12,
    flex: 1,
  },
  advantageStats: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  advantageStatsText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  // FX Monitoring Styles
  fxFeaturesList: {
    marginVertical: 12,
  },
  fxFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  fxFeatureText: {
    fontSize: 13,
    marginLeft: 10,
    flex: 1,
  },
  fxStats: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  fxStatsText: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  // Enhanced Dashboard Styles
  enhancedHeader: {
    padding: 20,
    paddingTop: 50,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  userInfo: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 5,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  navigationToggle: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 12,
    borderRadius: 12,
  },
  headerStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 15,
  },
  headerStat: {
    alignItems: 'center',
  },
  headerStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  headerStatLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  widgetsContainer: {
    padding: 15,
  },
  widgetsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  secondaryWidgets: {
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  quickAccessContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: BrandConfig.colors.text,
    marginBottom: 15,
  },
  quickAccessGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickAccessItem: {
    flex: 1,
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 12,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickAccessText: {
    fontSize: 12,
    fontWeight: '600',
    color: BrandConfig.colors.text,
    marginTop: 8,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  loadingText: {
    fontSize: 16,
    color: BrandConfig.colors.textSecondary,
    marginTop: 15,
  },
  bottomSpacing: {
    height: 30,
  },
});

export default UserDashboard;