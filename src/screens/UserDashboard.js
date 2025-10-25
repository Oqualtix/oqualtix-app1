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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import EnhancedAnomalyDetectionUtils from '../utils/EnhancedAnomalyDetectionUtils';
import EmbezzlementDetectionUtils from '../utils/EmbezzlementDetectionUtils';

const { width } = Dimensions.get('window');

const UserDashboard = ({ navigation }) => {
  const [dashboardData, setDashboardData] = useState({});
  const [loading, setLoading] = useState(true);
  const [anomalies, setAnomalies] = useState([]);
  const [quickStats, setQuickStats] = useState({});
  const { user, logout } = useAuth();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load user's company data and transaction analytics
      const companyData = await loadCompanyAnalytics();
      const userStats = await loadUserStatistics();
      const recentAnomalies = await loadRecentAnomalies();
      const systemHealth = await loadSystemHealth();
      
      setDashboardData({
        company: companyData,
        user: userStats,
        system: systemHealth
      });
      
      setAnomalies(recentAnomalies);
      setQuickStats(calculateQuickStats(companyData, userStats));
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      Alert.alert('Error', 'Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
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
    return {
      totalValue: companyData.monthlyVolume,
      alertsToday: 3,
      riskReduction: 78, // Percentage
      timesSaved: 24 // Hours per month
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <LinearGradient colors={['#007AFF', '#5856D6']} style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.userName}>{user.firstName || user.email}</Text>
            <Text style={styles.companyName}>{dashboardData.company?.companyName}</Text>
          </View>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => navigation.navigate('Settings')}
          >
            <Ionicons name="person-circle" size={40} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Quick Stats */}
      <View style={styles.quickStatsContainer}>
        <View style={styles.statCard}>
          <Ionicons name="trending-up" size={24} color="#4CAF50" />
          <Text style={styles.statValue}>${quickStats.totalValue?.toLocaleString()}</Text>
          <Text style={styles.statLabel}>Monthly Volume</Text>
        </View>
        
        <View style={styles.statCard}>
          <Ionicons name="shield-checkmark" size={24} color="#007AFF" />
          <Text style={styles.statValue}>{quickStats.riskReduction}%</Text>
          <Text style={styles.statLabel}>Risk Reduction</Text>
        </View>
        
        <View style={styles.statCard}>
          <Ionicons name="time" size={24} color="#FF9500" />
          <Text style={styles.statValue}>{quickStats.timesSaved}h</Text>
          <Text style={styles.statLabel}>Time Saved</Text>
        </View>
      </View>

      {/* Risk Overview */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Risk Overview</Text>
        <View style={styles.riskCard}>
          <View style={styles.riskHeader}>
            <View>
              <Text style={styles.riskLabel}>Company Risk Score</Text>
              <Text style={[styles.riskScore, { color: getRiskColor(dashboardData.company?.riskScore) }]}>
                {dashboardData.company?.riskScore}/100
              </Text>
            </View>
            <View style={[
              styles.riskIndicator,
              { backgroundColor: getRiskColor(dashboardData.company?.riskScore) }
            ]}>
              <Ionicons name="shield" size={24} color="#FFFFFF" />
            </View>
          </View>
          
          <View style={styles.riskProgress}>
            <View style={styles.riskProgressBar}>
              <View
                style={[
                  styles.riskProgressFill,
                  {
                    width: `${dashboardData.company?.riskScore}%`,
                    backgroundColor: getRiskColor(dashboardData.company?.riskScore)
                  }
                ]}
              />
            </View>
            <Text style={styles.riskDescription}>
              {dashboardData.company?.riskScore < 30 ? 'Low Risk - System operating normally' :
               dashboardData.company?.riskScore < 60 ? 'Medium Risk - Monitor closely' :
               'High Risk - Immediate attention required'}
            </Text>
          </View>
        </View>
      </View>

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

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
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
});

export default UserDashboard;