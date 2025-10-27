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
export const SecurityStatusWidget = ({ onPress, data = {} }) => {
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
export const AIAssistantWidget = ({ onPress, data = {} }) => {
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
export const BankingOverviewWidget = ({ onPress, data = {} }) => {
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
export const RealTimeMonitoringWidget = ({ onPress, data = {} }) => {
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
export const ComplianceScoreWidget = ({ onPress, data = {} }) => {
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
export const QuickStatsWidget = ({ data = {} }) => {
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
export const AIRecommendationsWidget = ({ onPress, data = {} }) => {
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
export const RecentAlertsWidget = ({ onPress, data = {} }) => {
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
  widget: {
    width: (width - 45) / 2,
    height: 140,
    marginBottom: 15,
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  widgetGradient: {
    flex: 1,
    padding: 15,
    justifyContent: 'space-between',
  },
  widgetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  widgetTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
    marginLeft: 8,
    flex: 1,
  },
  widgetMainValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginVertical: 5,
  },
  widgetSubtext: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  widgetFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  widgetFooterText: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.9)',
    flex: 1,
  },
  quickStatsContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickStatsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: BrandConfig.colors.text,
    marginBottom: 15,
  },
  quickStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
    marginBottom: 10,
    borderTopWidth: 3,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: BrandConfig.colors.text,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: BrandConfig.colors.textSecondary,
    marginTop: 4,
  },
  recommendationsWidget: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recommendationsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  recommendationsIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF950020',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  recommendationsTitle: {
    flex: 1,
  },
  recommendationsMainTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: BrandConfig.colors.text,
  },
  recommendationsSubtitle: {
    fontSize: 12,
    color: BrandConfig.colors.textSecondary,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  priorityIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 10,
  },
  recommendationText: {
    fontSize: 14,
    color: BrandConfig.colors.text,
    flex: 1,
  },
  moreRecommendations: {
    fontSize: 12,
    color: BrandConfig.colors.primary,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 10,
  },
  alertsWidget: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  alertsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  alertsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: BrandConfig.colors.text,
    flex: 1,
    marginLeft: 10,
  },
  alertsCount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF3B30',
    backgroundColor: '#FF3B3020',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  alertDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  alertContent: {
    flex: 1,
  },
  alertText: {
    fontSize: 14,
    color: BrandConfig.colors.text,
    marginBottom: 2,
  },
  alertTime: {
    fontSize: 12,
    color: BrandConfig.colors.textSecondary,
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