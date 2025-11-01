/**
 * Quick Access Menu - Mobile-optimized feature access
 * Provides streamlined access to all Oqualtix features
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Dimensions,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import BrandConfig from '../config/BrandConfig';

const { width, height } = Dimensions.get('window');

const QuickAccessMenu = ({ visible, onClose, navigation }) => {
  const [selectedCategory, setSelectedCategory] = useState('essentials');
  const slideAnim = useState(new Animated.Value(height))[0];

  React.useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    } else {
      Animated.spring(slideAnim, {
        toValue: height,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    }
  }, [visible]);

  const menuCategories = {
    essentials: {
      title: 'Essentials',
      icon: 'star',
      color: BrandConfig.colors.primary,
      items: [
        { name: 'AI Assistant', route: 'OxulAIScreen', icon: 'chatbubbles', description: 'Chat with Oxul AI' },
        { name: 'Security Status', route: 'FraudDashboard', icon: 'shield-checkmark', description: 'Check security health' },
        { name: 'Bank Accounts', route: 'BankIntegrationScreen', icon: 'card', description: 'Manage connected banks' },
        { name: 'Real-Time Monitor', route: 'TransactionMonitor', icon: 'pulse', description: 'Live transaction feed' },
      ]
    },
    detection: {
      title: 'Fraud Detection',
      icon: 'search',
      color: '#FF3B30',
      items: [
        { name: 'Anomaly Detection', route: 'AnomalyDetection', icon: 'warning', description: 'Advanced anomaly analysis' },
        { name: 'Risk Assessment', route: 'RiskAssessment', icon: 'thermometer', description: 'Comprehensive risk evaluation' },
        { name: 'FX Monitoring', route: 'FXFraudMonitoringScreen', icon: 'globe', description: 'Foreign exchange fraud' },
        { name: 'Location Analytics', route: 'LocationAnalytics', icon: 'location', description: 'Geographic fraud detection' },
      ]
    },
    ai: {
      title: 'AI & ML',
      icon: 'hardware-chip',
      color: '#FF6B35',
      items: [
        { name: 'Algorithm Trainer', route: 'AlgorithmTrainer', icon: 'school', description: 'Train custom models' },
        { name: 'ML Pipeline', route: 'MLPipeline', icon: 'git-network', description: 'Real-time ML processing' },
        { name: 'Predictive Intel', route: 'PredictiveIntel', icon: 'trending-up', description: 'Future risk forecasting' },
        { name: 'AI Recommendations', route: 'AIRecommendations', icon: 'bulb', description: 'Smart insights' },
      ]
    },
    compliance: {
      title: 'Compliance',
      icon: 'document-text',
      color: '#007AFF',
      items: [
        { name: 'GAAP Compliance', route: 'GAAPCompliance', icon: 'library', description: 'Accounting standards' },
        { name: 'Audit Trails', route: 'AuditTrails', icon: 'trail-sign', description: 'Complete audit logs' },
        { name: 'Reports', route: 'RegulatoryReports', icon: 'folder', description: 'Compliance reporting' },
        { name: 'Policy Management', route: 'PolicyManagement', icon: 'settings', description: 'Corporate policies' },
      ]
    },
    enterprise: {
      title: 'Enterprise',
      icon: 'business',
      color: '#8E44AD',
      items: [
        { name: 'Corporate Dashboard', route: 'CorporateDashboard', icon: 'stats-chart', description: 'Multi-entity oversight' },
        { name: 'Team Management', route: 'TeamManagement', icon: 'people', description: 'User roles & permissions' },
        { name: 'Analytics Center', route: 'AnalyticsCenter', icon: 'bar-chart', description: 'Business intelligence' },
        { name: 'System Admin', route: 'SystemAdmin', icon: 'construct', description: 'System configuration' },
      ]
    },
    advanced: {
      title: 'Advanced',
      icon: 'rocket',
      color: '#FF9500',
      items: [
        { name: 'Network Analysis', route: 'NetworkAnalysis', icon: 'git-network', description: 'Connected fraud patterns' },
        { name: 'Competitive Analysis', route: 'FraudComparisonScreen', icon: 'trophy', description: 'Industry comparison' },
        { name: 'Investigation Tools', route: 'InvestigationTools', icon: 'search', description: 'Forensic utilities' },
        { name: 'Custom Dashboards', route: 'CustomDashboards', icon: 'apps', description: 'Personalized views' },
      ]
    }
  };

  const handleItemPress = (route) => {
    onClose();
    setTimeout(() => {
      navigation.navigate(route);
    }, 300);
  };

  const renderCategoryTab = (categoryKey, category) => {
    const isActive = selectedCategory === categoryKey;
    
    return (
      <TouchableOpacity
        key={categoryKey}
        style={[
          styles.categoryTab,
          isActive && { backgroundColor: category.color }
        ]}
        onPress={() => setSelectedCategory(categoryKey)}
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

  const renderMenuItem = (item) => (
    <TouchableOpacity
      key={item.route}
      style={styles.menuItem}
      onPress={() => handleItemPress(item.route)}
    >
      <View style={[
        styles.menuItemIcon,
        { backgroundColor: `${menuCategories[selectedCategory].color}20` }
      ]}>
        <Ionicons
          name={item.icon}
          size={24}
          color={menuCategories[selectedCategory].color}
        />
      </View>
      
      <View style={styles.menuItemContent}>
        <Text style={styles.menuItemName}>{item.name}</Text>
        <Text style={styles.menuItemDescription}>{item.description}</Text>
      </View>
      
      <Ionicons name="chevron-forward" size={20} color={BrandConfig.colors.textSecondary} />
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.overlayTouch} onPress={onClose} />
        
        <Animated.View 
          style={[
            styles.menuContainer,
            { transform: [{ translateY: slideAnim }] }
          ]}
        >
          {/* Header */}
          <View style={styles.menuHeader}>
            <LinearGradient
              colors={[BrandConfig.colors.primary, BrandConfig.colors.primaryDark]}
              style={styles.menuHeaderGradient}
            >
              <Text style={styles.menuTitle}>Quick Access</Text>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Ionicons name="close" size={24} color="white" />
              </TouchableOpacity>
            </LinearGradient>
          </View>

          {/* Category Tabs */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.categoryTabs}
            contentContainerStyle={styles.categoryTabsContent}
          >
            {Object.entries(menuCategories).map(([key, category]) => 
              renderCategoryTab(key, category)
            )}
          </ScrollView>

          {/* Menu Items */}
          <ScrollView style={styles.menuItems} showsVerticalScrollIndicator={false}>
            <Text style={[
              styles.categoryTitle,
              { color: menuCategories[selectedCategory].color }
            ]}>
              {menuCategories[selectedCategory].title}
            </Text>
            
            {menuCategories[selectedCategory].items.map(renderMenuItem)}
            
            <View style={styles.menuBottom} />
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  categoryTab: {
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
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
    marginLeft: 8,
  },
  categoryTabs: {
    maxHeight: 70,
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  categoryTabsContent: {
    paddingRight: 20,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    marginTop: 5,
  },
  closeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 8,
  },
  menuBottom: {
    height: 30,
  },
  menuContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    maxHeight: height * 0.8,
  },
  menuHeader: {
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    overflow: 'hidden',
  },
  menuHeaderGradient: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 25,
  },
  menuItem: {
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    flexDirection: 'row',
    marginBottom: 10,
    paddingHorizontal: 15,
    paddingVertical: 15,
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemDescription: {
    color: BrandConfig.colors.textSecondary,
    fontSize: 12,
  },
  menuItemIcon: {
    alignItems: 'center',
    borderRadius: 22.5,
    height: 45,
    justifyContent: 'center',
    marginRight: 15,
    width: 45,
  },
  menuItemName: {
    color: BrandConfig.colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  menuItems: {
    flex: 1,
    paddingHorizontal: 20,
  },
  menuTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlayTouch: {
    flex: 1,
  },
});

export default QuickAccessMenu;