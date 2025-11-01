/**
 * Smart Dashboard Widgets
 * Modular components for displaying key metrics and quick access to features
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import BrandConfig from '../config/BrandConfig';

const { width } = Dimensions.get('window');

// Security Status Widget
const SecurityStatusWidget = ({ onPress, data = {} }) => {
  const getStatusColor = (riskLevel) => {
    switch (riskLevel) {
      case 'LOW': return '#34C759';
      case 'MEDIUM': return '#FF9500';
      case 'HIGH': return '#FF3B30';
      default: return '#007AFF';
    }
  };

  const riskLevel = data.riskLevel || 'LOW';
  const statusColor = getStatusColor(riskLevel);

  return (
    <TouchableOpacity style={styles.widget} onPress={onPress}>
      <LinearGradient
        colors={[statusColor, `${statusColor}AA`]}
        style={styles.widgetGradient}
      >
        <View style={styles.widgetHeader}>
          <Ionicons name="shield-checkmark" size={24} color="white" />
          <Text style={styles.widgetTitle}>Security Status</Text>
        </View>
        
        <Text style={styles.widgetMainValue}>{riskLevel}</Text>
        <Text style={styles.widgetSubtext}>
          {data.activeCases || 0} active cases • {data.lastScan || 'Now'}
        </Text>
        
        <View style={styles.widgetFooter}>
          <Text style={styles.widgetFooterText}>Tap for details</Text>
          <Ionicons name="chevron-forward" size={16} color="white" />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

// AI Assistant Widget
const AIAssistantWidget = ({ onPress, data = {} }) => {
  return (
    <TouchableOpacity style={styles.widget} onPress={onPress}>
      <LinearGradient
        colors={['#FF6B35', '#FF6B35AA']}
        style={styles.widgetGradient}
      >
        <View style={styles.widgetHeader}>
          <Ionicons name="chatbubbles" size={24} color="white" />
          <Text style={styles.widgetTitle}>Oxul AI Assistant</Text>
        </View>
        
        <Text style={styles.widgetMainValue}>
          {data.aiStatus === 'online' ? 'Ready' : 'Initializing...'}
        </Text>
        <Text style={styles.widgetSubtext}>
          {data.lastInteraction || 'Ask me anything about fraud detection'}
        </Text>
        
        <View style={styles.widgetFooter}>
          <Text style={styles.widgetFooterText}>Start conversation</Text>
          <Ionicons name="chevron-forward" size={16} color="white" />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

// Banking Overview Widget
const BankingOverviewWidget = ({ onPress, data = {} }) => {
  return (
    <TouchableOpacity style={styles.widget} onPress={onPress}>
      <LinearGradient
        colors={['#34C759', '#34C759AA']}
        style={styles.widgetGradient}
      >
        <View style={styles.widgetHeader}>
          <Ionicons name="card" size={24} color="white" />
          <Text style={styles.widgetTitle}>Connected Banks</Text>
        </View>
        
        <Text style={styles.widgetMainValue}>
          {data.connectedBanks || 0}
        </Text>
        <Text style={styles.widgetSubtext}>
          ${(data.totalBalance || 0).toLocaleString()} total balance
        </Text>
        
        <View style={styles.widgetFooter}>
          <Text style={styles.widgetFooterText}>Manage accounts</Text>
          <Ionicons name="chevron-forward" size={16} color="white" />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

// Real-Time Monitoring Widget
const RealTimeMonitoringWidget = ({ onPress, data = {} }) => {
  const [isMonitoring, setIsMonitoring] = useState(data.isActive || false);

  return (
    <TouchableOpacity style={styles.widget} onPress={onPress}>
      <LinearGradient
        colors={isMonitoring ? ['#007AFF', '#007AFFAA'] : ['#8E8E93', '#8E8E93AA']}
        style={styles.widgetGradient}
      >
        <View style={styles.widgetHeader}>
          <Ionicons 
            name={isMonitoring ? "pulse" : "pause"} 
            size={24} 
            color="white" 
          />
          <Text style={styles.widgetTitle}>Real-Time Monitor</Text>
        </View>
        
        <Text style={styles.widgetMainValue}>
          {isMonitoring ? 'ACTIVE' : 'PAUSED'}
        </Text>
        <Text style={styles.widgetSubtext}>
          {data.transactionsToday || 0} transactions today
        </Text>
        
        <View style={styles.widgetFooter}>
          <Text style={styles.widgetFooterText}>
            {isMonitoring ? 'View live feed' : 'Enable monitoring'}
          </Text>
          <Ionicons name="chevron-forward" size={16} color="white" />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

// Compliance Score Widget
const ComplianceScoreWidget = ({ onPress, data = {} }) => {
  const score = data.complianceScore || 0;
  const getScoreColor = () => {
    if (score >= 90) return '#34C759';
    if (score >= 70) return '#FF9500';
    return '#FF3B30';
  };

  return (
    <TouchableOpacity style={styles.widget} onPress={onPress}>
      <LinearGradient
        colors={[getScoreColor(), `${getScoreColor()}AA`]}
        style={styles.widgetGradient}
      >
        <View style={styles.widgetHeader}>
          <Ionicons name="document-text" size={24} color="white" />
          <Text style={styles.widgetTitle}>Compliance Score</Text>
        </View>
        
        <Text style={styles.widgetMainValue}>{score}%</Text>
        <Text style={styles.widgetSubtext}>
          {data.issuesFound || 0} issues found
        </Text>
        
        <View style={styles.widgetFooter}>
          <Text style={styles.widgetFooterText}>View report</Text>
          <Ionicons name="chevron-forward" size={16} color="white" />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

// Quick Stats Widget
const QuickStatsWidget = ({ data = {} }) => {
  const stats = [
    {
      label: 'Transactions',
      value: data.totalTransactions || 0,
      icon: 'swap-horizontal',
      color: '#007AFF'
    },
    {
      label: 'Anomalies',
      value: data.anomaliesDetected || 0,
      icon: 'warning',
      color: '#FF9500'
    },
    {
      label: 'Accuracy',
      value: `${data.accuracyRate || 0}%`,
      icon: 'checkmark-circle',
      color: '#34C759'
    },
    {
      label: 'Response Time',
      value: `${data.responseTime || 0}ms`,
      icon: 'speedometer',
      color: '#FF6B35'
    }
  ];

  return (
    <View style={styles.quickStatsContainer}>
      <Text style={styles.quickStatsTitle}>Performance Metrics</Text>
      <View style={styles.quickStatsGrid}>
        {stats.map((stat, index) => (
          <View key={index} style={[styles.statCard, { borderTopColor: stat.color }]}>
            <Ionicons name={stat.icon} size={20} color={stat.color} />
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

// AI Recommendations Widget
const AIRecommendationsWidget = ({ onPress, data = {} }) => {
  const recommendations = data.recommendations || [];
  const highPriorityCount = recommendations.filter(r => r.priority === 'HIGH').length;

  return (
    <TouchableOpacity style={styles.recommendationsWidget} onPress={onPress}>
      <View style={styles.recommendationsHeader}>
        <View style={styles.recommendationsIcon}>
          <Ionicons name="bulb" size={24} color="#FF9500" />
        </View>
        <View style={styles.recommendationsTitle}>
          <Text style={styles.recommendationsMainTitle}>AI Recommendations</Text>
          <Text style={styles.recommendationsSubtitle}>
            {recommendations.length} insights • {highPriorityCount} high priority
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={BrandConfig.colors.textSecondary} />
      </View>

      {recommendations.slice(0, 2).map((rec, index) => (
        <View key={index} style={styles.recommendationItem}>
          <View style={[
            styles.priorityIndicator,
            { backgroundColor: rec.priority === 'HIGH' ? '#FF3B30' : '#FF9500' }
          ]} />
          <Text style={styles.recommendationText} numberOfLines={2}>
            {rec.title || rec.description}
          </Text>
        </View>
      ))}

      {recommendations.length > 2 && (
        <Text style={styles.moreRecommendations}>
          +{recommendations.length - 2} more recommendations
        </Text>
      )}
    </TouchableOpacity>
  );
};

// Recent Alerts Widget
const RecentAlertsWidget = ({ onPress, data = {} }) => {
  const alerts = data.recentAlerts || [];

  return (
    <TouchableOpacity style={styles.alertsWidget} onPress={onPress}>
      <View style={styles.alertsHeader}>
        <Ionicons name="notifications" size={24} color="#FF3B30" />
        <Text style={styles.alertsTitle}>Recent Alerts</Text>
        <Text style={styles.alertsCount}>{alerts.length}</Text>
      </View>

      {alerts.slice(0, 3).map((alert, index) => (
        <View key={index} style={styles.alertItem}>
          <View style={[
            styles.alertDot,
            { backgroundColor: alert.severity === 'CRITICAL' ? '#FF3B30' : '#FF9500' }
          ]} />
          <View style={styles.alertContent}>
            <Text style={styles.alertText} numberOfLines={1}>
              {alert.title || alert.message}
            </Text>
            <Text style={styles.alertTime}>{alert.time || 'Just now'}</Text>
          </View>
        </View>
      ))}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  alertContent: {
    flex: 1,
  },
  alertDot: {
    borderRadius: 4,
    height: 8,
    marginRight: 12,
    width: 8,
  },
  alertItem: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 12,
  },
  alertText: {
    color: BrandConfig.colors.text,
    fontSize: 14,
    marginBottom: 2,
  },
  alertTime: {
    color: BrandConfig.colors.textSecondary,
    fontSize: 12,
  },
  alertsCount: {
    backgroundColor: '#FF3B3020',
    borderRadius: 10,
    color: '#FF3B30',
    fontSize: 14,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  alertsHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 15,
  },
  alertsTitle: {
    color: BrandConfig.colors.text,
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  alertsWidget: {
    backgroundColor: 'white',
    borderRadius: 15,
    elevation: 3,
    marginBottom: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  moreRecommendations: {
    color: BrandConfig.colors.primary,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 10,
    textAlign: 'center',
  },
  priorityIndicator: {
    borderRadius: 4,
    height: 8,
    marginRight: 10,
    width: 8,
  },
  quickStatsContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    elevation: 3,
    marginBottom: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  quickStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickStatsTitle: {
    color: BrandConfig.colors.text,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  recommendationItem: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 10,
  },
  recommendationText: {
    color: BrandConfig.colors.text,
    flex: 1,
    fontSize: 14,
  },
  recommendationsHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 15,
  },
  recommendationsIcon: {
    alignItems: 'center',
    backgroundColor: '#FF950020',
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    marginRight: 12,
    width: 40,
  },
  recommendationsMainTitle: {
    color: BrandConfig.colors.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  recommendationsSubtitle: {
    color: BrandConfig.colors.textSecondary,
    fontSize: 12,
  },
  recommendationsTitle: {
    flex: 1,
  },
  recommendationsWidget: {
    backgroundColor: 'white',
    borderRadius: 15,
    elevation: 3,
    marginBottom: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statCard: {
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
    borderTopWidth: 3,
    marginBottom: 10,
    padding: 15,
    width: '48%',
  },
  statLabel: {
    color: BrandConfig.colors.textSecondary,
    fontSize: 12,
    marginTop: 4,
  },
  statValue: {
    color: BrandConfig.colors.text,
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 8,
  },
  widget: {
    borderRadius: 15,
    elevation: 3,
    height: 140,
    marginBottom: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    width: (width - 45) / 2,
  },
  widgetFooter: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  widgetFooterText: {
    color: 'rgba(255, 255, 255, 0.9)',
    flex: 1,
    fontSize: 10,
  },
  widgetGradient: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 15,
  },
  widgetHeader: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  widgetMainValue: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 5,
  },
  widgetSubtext: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 10,
  },
  widgetTitle: {
    color: 'white',
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export {
  SecurityStatusWidget,
  AIAssistantWidget,
  BankingOverviewWidget,
  RealTimeMonitoringWidget,
  ComplianceScoreWidget,
  QuickStatsWidget,
  AIRecommendationsWidget,
  RecentAlertsWidget,
};