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
import { ThemeContext } from '../context/ThemeContext';

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
    backgroundColor: BrandConfig.colors.background,
    flex: 1,
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
    backgroundColor: BrandConfig.colors.background,
    flex: 1,
    justifyContent: 'center',
  },
  loadingText: {
    color: '#8E8E93',
    fontSize: 16,
    marginTop: 16,
  },
  profileButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 25,
    height: 50,
    justifyContent: 'center',
    width: 50,
  },
  quickAccessAction: {
    alignItems: 'center',
    backgroundColor: BrandConfig.colors.cardBackground,
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
    width: '48%',
  },
  quickAccessActionText: {
    color: BrandConfig.colors.textPrimary,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  quickAccessActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickAccessContainer: {
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
  quickAccessTitle: {
    color: BrandConfig.colors.textPrimary,
    fontSize: 20,
    fontWeight: 'bold',
  },
  scrollViewContent: {
    paddingBottom: 100,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
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
  welcomeText: {
    color: '#FFFFFF',
    fontSize: 16,
    opacity: 0.9,
  },
  widgetContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
});

export default UserDashboard;