/**
 * Enhanced Dashboard Navigation System
 * Organizes all Oqualtix features into intuitive categories
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import BrandConfig from '../config/BrandConfig';

const { width } = Dimensions.get('window');

const DashboardNavigation = ({ navigation, currentScreen = 'Overview' }) => {
  const [activeCategory, setActiveCategory] = useState('overview');

  const navigationCategories = {
    overview: {
      title: 'Overview',
      icon: 'speedometer',
      color: BrandConfig.colors.primary,
      screens: [
        { name: 'Dashboard', route: 'UserDashboard', icon: 'home', description: 'Main dashboard with key metrics' },
        { name: 'Quick Stats', route: 'QuickStats', icon: 'analytics', description: 'Real-time fraud statistics' },
        { name: 'Notifications', route: 'Notifications', icon: 'notifications', description: 'Recent alerts and updates' }
      ]
    },
    ai: {
      title: 'AI & Detection',
      icon: 'brain',
      color: '#FF6B35',
      screens: [
        { name: 'Oxul AI Chat', route: 'OxulAIScreen', icon: 'chatbubbles', description: 'Interact with AI forensics assistant' },
        { name: 'Algorithm Trainer', route: 'AlgorithmTrainer', icon: 'school', description: 'Train custom detection models' },
        { name: 'Real-Time ML', route: 'MLPipeline', icon: 'hardware-chip', description: 'Advanced machine learning pipeline' },
        { name: 'Predictive Intel', route: 'PredictiveIntel', icon: 'trending-up', description: 'Forecast fraud risks' }
      ]
    },
    banking: {
      title: 'Banking & Accounts',
      icon: 'card',
      color: '#34C759',
      screens: [
        { name: 'Bank Integration', route: 'BankIntegrationScreen', icon: 'business', description: 'Connect and manage bank accounts' },
        { name: 'Transaction Monitor', route: 'TransactionMonitor', icon: 'list', description: 'Real-time transaction analysis' },
        { name: 'Balance Overview', route: 'BalanceOverview', icon: 'wallet', description: 'Account balances and summaries' },
        { name: 'Payment History', route: 'PaymentHistory', icon: 'time', description: 'Historical transaction data' }
      ]
    },
    fraud: {
      title: 'Fraud Detection',
      icon: 'shield-checkmark',
      color: '#FF3B30',
      screens: [
        { name: 'Fraud Dashboard', route: 'FraudDashboard', icon: 'warning', description: 'Active fraud cases and alerts' },
        { name: 'Anomaly Detection', route: 'AnomalyDetection', icon: 'alert-circle', description: 'Advanced anomaly analysis' },
        { name: 'Risk Assessment', route: 'RiskAssessment', icon: 'thermometer', description: 'Comprehensive risk evaluation' },
        { name: 'Investigation Tools', route: 'InvestigationTools', icon: 'search', description: 'Forensic investigation utilities' }
      ]
    },
    compliance: {
      title: 'Compliance & Risk',
      icon: 'document-text',
      color: '#007AFF',
      screens: [
        { name: 'GAAP Compliance', route: 'GAAPCompliance', icon: 'library', description: 'Accounting standards monitoring' },
        { name: 'Regulatory Reports', route: 'RegulatoryReports', icon: 'folder', description: 'Compliance reporting tools' },
        { name: 'Audit Trails', route: 'AuditTrails', icon: 'trail-sign', description: 'Complete audit documentation' },
        { name: 'Policy Management', route: 'PolicyManagement', icon: 'settings', description: 'Corporate policy enforcement' }
      ]
    },
    enterprise: {
      title: 'Enterprise',
      icon: 'business',
      color: '#8E44AD',
      screens: [
        { name: 'Corporate Dashboard', route: 'CorporateDashboard', icon: 'globe', description: 'Multi-entity oversight' },
        { name: 'Team Management', route: 'TeamManagement', icon: 'people', description: 'User roles and permissions' },
        { name: 'System Admin', route: 'SystemAdmin', icon: 'construct', description: 'System configuration' },
        { name: 'Analytics Center', route: 'AnalyticsCenter', icon: 'bar-chart', description: 'Advanced business analytics' }
      ]
    },
    advanced: {
      title: 'Advanced Features',
      icon: 'rocket',
      color: '#FF9500',
      screens: [
        { name: 'FX Fraud Detection', route: 'FXFraudMonitoringScreen', icon: 'globe', description: 'Foreign exchange monitoring' },
        { name: 'Location Analytics', route: 'LocationAnalytics', icon: 'location', description: 'Geographic fraud detection' },
        { name: 'Network Analysis', route: 'NetworkAnalysis', icon: 'git-network', description: 'Connected fraud patterns' },
        { name: 'Competitive Analysis', route: 'FraudComparisonScreen', icon: 'trophy', description: 'Compare with industry standards' }
      ]
    }
  };

  const renderCategoryTab = (categoryKey, category) => {
    const isActive = activeCategory === categoryKey;
    
    return (
      <TouchableOpacity
        key={categoryKey}
        style={[
          styles.categoryTab,
          isActive && { backgroundColor: category.color }
        ]}
        onPress={() => setActiveCategory(categoryKey)}
      >
        <Ionicons
          name={category.icon}
          size={20}
          color={isActive ? 'white' : category.color}
        />
        <Text style={[
          styles.categoryTabText,
          { color: isActive ? 'white' : category.color }
        ]}>
          {category.title}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderScreenCard = (screen, categoryColor) => (
    <TouchableOpacity
      key={screen.route}
      style={[styles.screenCard, { borderLeftColor: categoryColor }]}
      onPress={() => navigation.navigate(screen.route)}
    >
      <View style={styles.screenCardHeader}>
        <View style={[styles.screenIcon, { backgroundColor: `${categoryColor}20` }]}>
          <Ionicons name={screen.icon} size={24} color={categoryColor} />
        </View>
        <View style={styles.screenInfo}>
          <Text style={styles.screenName}>{screen.name}</Text>
          <Text style={styles.screenDescription}>{screen.description}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={BrandConfig.colors.textSecondary} />
      </View>
    </TouchableOpacity>
  );

  const renderQuickActions = () => (
    <View style={styles.quickActionsContainer}>
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.quickActionsGrid}>
        <TouchableOpacity 
          style={[styles.quickAction, { backgroundColor: '#FF3B3020' }]}
          onPress={() => navigation.navigate('OxulAIScreen')}
        >
          <Ionicons name="chatbubbles" size={24} color="#FF3B30" />
          <Text style={[styles.quickActionText, { color: '#FF3B30' }]}>Ask Oxul AI</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.quickAction, { backgroundColor: '#34C75920' }]}
          onPress={() => navigation.navigate('BankIntegrationScreen')}
        >
          <Ionicons name="add-circle" size={24} color="#34C759" />
          <Text style={[styles.quickActionText, { color: '#34C759' }]}>Add Bank</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.quickAction, { backgroundColor: '#007AFF20' }]}
          onPress={() => navigation.navigate('FraudDashboard')}
        >
          <Ionicons name="shield-checkmark" size={24} color="#007AFF" />
          <Text style={[styles.quickActionText, { color: '#007AFF' }]}>Check Security</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.quickAction, { backgroundColor: '#FF950020' }]}
          onPress={() => navigation.navigate('AnalyticsCenter')}
        >
          <Ionicons name="analytics" size={24} color="#FF9500" />
          <Text style={[styles.quickActionText, { color: '#FF9500' }]}>View Analytics</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const activeCategory_data = navigationCategories[activeCategory];

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[BrandConfig.colors.primary, BrandConfig.colors.primaryDark]}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Oqualtix Command Center</Text>
        <Text style={styles.headerSubtitle}>Advanced Fraud Detection & Forensic Analytics</Text>
      </LinearGradient>

      {renderQuickActions()}

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoryTabs}
        contentContainerStyle={styles.categoryTabsContent}
      >
        {Object.entries(navigationCategories).map(([key, category]) => 
          renderCategoryTab(key, category)
        )}
      </ScrollView>

      <ScrollView style={styles.screensContainer} showsVerticalScrollIndicator={false}>
        <Text style={[styles.categoryTitle, { color: activeCategory_data.color }]}>
          {activeCategory_data.title}
        </Text>
        
        {activeCategory_data.screens.map(screen => 
          renderScreenCard(screen, activeCategory_data.color)
        )}
        
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  bottomSpacing: {
    height: 20,
  },
  categoryTab: {
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 20,
    elevation: 2,
    flexDirection: 'row',
    marginRight: 10,
    paddingHorizontal: 15,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  categoryTabText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 5,
  },
  categoryTabs: {
    maxHeight: 60,
    paddingHorizontal: 20,
  },
  categoryTabsContent: {
    paddingRight: 20,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  container: {
    backgroundColor: '#F8F9FA',
    flex: 1,
  },
  header: {
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    padding: 20,
    paddingTop: 10,
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
  },
  headerTitle: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  quickAction: {
    alignItems: 'center',
    borderRadius: 12,
    flex: 1,
    marginHorizontal: 3,
    padding: 15,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 5,
    textAlign: 'center',
  },
  quickActionsContainer: {
    padding: 20,
    paddingBottom: 10,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  screenCard: {
    backgroundColor: 'white',
    borderLeftWidth: 4,
    borderRadius: 12,
    elevation: 2,
    marginBottom: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  screenCardHeader: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  screenDescription: {
    color: BrandConfig.colors.textSecondary,
    fontSize: 12,
  },
  screenIcon: {
    alignItems: 'center',
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    marginRight: 12,
    width: 40,
  },
  screenInfo: {
    flex: 1,
  },
  screenName: {
    color: BrandConfig.colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  screensContainer: {
    flex: 1,
    padding: 20,
    paddingTop: 10,
  },
  sectionTitle: {
    color: BrandConfig.colors.text,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
});

export default DashboardNavigation;