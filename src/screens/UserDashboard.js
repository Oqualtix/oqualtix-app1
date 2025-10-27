import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet } from 'react-native';

// Components
import SmartDashboardWidgets from '../components/SmartDashboardWidgets';
import DashboardNavigation from '../components/DashboardNavigation';
import QuickAccessMenu from '../components/QuickAccessMenu';
import AlgorithmTrainer from '../components/AlgorithmTrainer';

// Contexts
import { BankConnectionContext } from '../contexts/BankConnectionContext';
import { ThemeContext } from '../contexts/ThemeContext';

// Utils
import BrandConfig from '../config/BrandConfig';

const UserDashboard = ({ navigation }) => {
  // State
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAlgorithmTrainer, setShowAlgorithmTrainer] = useState(false);
  const [showQuickAccess, setShowQuickAccess] = useState(false);
  const [user, setUser] = useState({ firstName: 'User', email: 'user@example.com' });
  const [dashboardData, setDashboardData] = useState({
    company: { companyName: 'Your Company', riskScore: 23 }
  });
  const [anomalies, setAnomalies] = useState([]);
  const [quickStats, setQuickStats] = useState({
    totalValue: 125000,
    riskReduction: 23,
    timesSaved: 48,
    transactionsProcessed: 1250,
    riskScore: 23,
    aiConfidence: 87
  });
  const [customAlgorithms, setCustomAlgorithms] = useState([]);

  // Contexts
  const { connectedBanks, lastSyncTime } = useContext(BankConnectionContext);
  const { isDarkMode } = useContext(ThemeContext);

  // Effects
  useEffect(() => {
    loadDashboardData();
  }, []);

  // Functions
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // Simulate API calls
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Sample anomalies data
      setAnomalies([
        {
          id: 1,
          type: 'Unusual Transaction Pattern',
          amount: 15000,
          vendor: 'ABC Corp',
          date: new Date().toISOString(),
          severity: 'HIGH',
          status: 'PENDING'
        },
        {
          id: 2,
          type: 'Duplicate Payment',
          amount: 5000,
          vendor: 'XYZ Services',
          date: new Date(Date.now() - 24*60*60*1000).toISOString(),
          severity: 'MEDIUM',
          status: 'RESOLVED'
        }
      ]);

      setLoading(false);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  }, []);

  const getRiskColor = (score) => {
    if (score < 30) return '#34C759';
    if (score < 60) return '#FF9500';
    return '#FF3B30';
  };

  const handleOpenAlgorithmTrainer = () => {
    setShowAlgorithmTrainer(true);
  };

  const handleOpenQuickAccess = () => {
    setShowQuickAccess(true);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={BrandConfig.colors.primary} />
        <Text style={styles.loadingText}>Loading Dashboard...</Text>
      </View>
    );
  }

  return (
    <>
      <ScrollView 
        style={styles.container} 
        contentContainerStyle={styles.scrollViewContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <LinearGradient
          colors={[BrandConfig.colors.primary, BrandConfig.colors.secondary]}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <View style={styles.userInfo}>
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

        {/* Dashboard Widgets */}
        <View style={styles.widgetContainer}>
          <SmartDashboardWidgets navigation={navigation} />
        </View>

        {/* Quick Access */}
        <View style={styles.quickAccessContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.quickAccessTitle}>Quick Access</Text>
            <TouchableOpacity onPress={handleOpenQuickAccess}>
              <Ionicons name="apps" size={24} color={BrandConfig.colors.primary} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.quickAccessActions}>
            <TouchableOpacity
              style={styles.quickAccessAction}
              onPress={() => navigation.navigate('FinancialTracking')}
            >
              <Ionicons name="analytics" size={24} color="#007AFF" />
              <Text style={styles.quickAccessActionText}>Financial Tracking</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.quickAccessAction}
              onPress={() => navigation.navigate('OxulAIScreen')}
            >
              <Ionicons name="chatbubbles" size={24} color="#FF6B35" />
              <Text style={styles.quickAccessActionText}>AI Assistant</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.quickAccessAction}
              onPress={handleOpenAlgorithmTrainer}
            >
              <Ionicons name="school" size={24} color="#34C759" />
              <Text style={styles.quickAccessActionText}>Train AI</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.quickAccessAction}
              onPress={() => navigation.navigate('BankIntegrationScreen')}
            >
              <Ionicons name="card" size={24} color="#FF9500" />
              <Text style={styles.quickAccessActionText}>Bank Integration</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Dashboard Navigation */}
        <DashboardNavigation navigation={navigation} />

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Quick Access Menu Modal */}
      <QuickAccessMenu
        visible={showQuickAccess}
        onClose={() => setShowQuickAccess(false)}
        navigation={navigation}
      />

      {/* Algorithm Trainer Modal */}
      {showAlgorithmTrainer && (
        <AlgorithmTrainer
          visible={showAlgorithmTrainer}
          onClose={() => setShowAlgorithmTrainer(false)}
        />
      )}
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
  scrollViewContent: {
    paddingBottom: 100,
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
  widgetContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  quickAccessContainer: {
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
  quickAccessTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: BrandConfig.colors.textPrimary,
  },
  quickAccessActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickAccessAction: {
    width: '48%',
    backgroundColor: BrandConfig.colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  quickAccessActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: BrandConfig.colors.textPrimary,
    marginTop: 8,
    textAlign: 'center',
  },
  bottomPadding: {
    height: 100,
  },
});

export default UserDashboard;