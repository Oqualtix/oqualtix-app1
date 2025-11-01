import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import BrandConfig from '../config/BrandConfig';

const { width, height } = Dimensions.get('window');

const CorporateDashboard = ({ navigation }) => {
  const [selectedEntity, setSelectedEntity] = useState('all');
  const [corporateData, setCorporateData] = useState({});
  const [loading, setLoading] = useState(true);

  // Mock corporate entities data
  const corporateEntities = [
    {
      id: 'headquarters',
      name: 'Headquarters',
      location: 'New York, NY',
      employees: 2500,
      riskLevel: 'LOW',
      activeFraudCases: 2,
      monthlyTransactions: 145000,
      suspiciousActivity: 0.02
    },
    {
      id: 'west_coast',
      name: 'West Coast Division',
      location: 'Los Angeles, CA',
      employees: 1800,
      riskLevel: 'MEDIUM',
      activeFraudCases: 5,
      monthlyTransactions: 98000,
      suspiciousActivity: 0.08
    },
    {
      id: 'international',
      name: 'International Operations',
      location: 'London, UK',
      employees: 950,
      riskLevel: 'HIGH',
      activeFraudCases: 8,
      monthlyTransactions: 67000,
      suspiciousActivity: 0.15
    },
    {
      id: 'manufacturing',
      name: 'Manufacturing Division',
      location: 'Detroit, MI',
      employees: 3200,
      riskLevel: 'LOW',
      activeFraudCases: 1,
      monthlyTransactions: 234000,
      suspiciousActivity: 0.01
    }
  ];

  const consolidatedMetrics = {
    totalEmployees: corporateEntities.reduce((sum, entity) => sum + entity.employees, 0),
    totalTransactions: corporateEntities.reduce((sum, entity) => sum + entity.monthlyTransactions, 0),
    totalFraudCases: corporateEntities.reduce((sum, entity) => sum + entity.activeFraudCases, 0),
    averageRisk: (corporateEntities.reduce((sum, entity) => sum + entity.suspiciousActivity, 0) / corporateEntities.length * 100).toFixed(1),
    crossEntityPatterns: 12,
    complianceScore: 94.7
  };

  const renderEntityCard = (entity) => (
    <TouchableOpacity
      key={entity.id}
      style={[
        styles.entityCard,
        entity.riskLevel === 'HIGH' && styles.highRiskCard,
        entity.riskLevel === 'MEDIUM' && styles.mediumRiskCard
      ]}
      onPress={() => navigation.navigate('EntityDetails', { entityId: entity.id })}
    >
      <View style={styles.entityHeader}>
        <Text style={styles.entityName}>{entity.name}</Text>
        <View style={[
          styles.riskBadge,
          entity.riskLevel === 'HIGH' && styles.highRiskBadge,
          entity.riskLevel === 'MEDIUM' && styles.mediumRiskBadge,
          entity.riskLevel === 'LOW' && styles.lowRiskBadge
        ]}>
          <Text style={[
            styles.riskText,
            entity.riskLevel === 'LOW' && styles.lowRiskText
          ]}>
            {entity.riskLevel}
          </Text>
        </View>
      </View>

      <Text style={styles.entityLocation}>
        <Ionicons name="location" size={14} color={BrandConfig.colors.textSecondary} />
        {' '}{entity.location}
      </Text>

      <View style={styles.entityMetrics}>
        <View style={styles.metric}>
          <Text style={styles.metricValue}>{entity.employees.toLocaleString()}</Text>
          <Text style={styles.metricLabel}>Employees</Text>
        </View>
        <View style={styles.metric}>
          <Text style={styles.metricValue}>{entity.activeFraudCases}</Text>
          <Text style={styles.metricLabel}>Active Cases</Text>
        </View>
        <View style={styles.metric}>
          <Text style={styles.metricValue}>{(entity.suspiciousActivity * 100).toFixed(1)}%</Text>
          <Text style={styles.metricLabel}>Risk Level</Text>
        </View>
      </View>

      {entity.activeFraudCases > 3 && (
        <View style={styles.alertBanner}>
          <Ionicons name="warning" size={16} color="#FF3B30" />
          <Text style={styles.alertText}>Requires Immediate Attention</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderConsolidatedMetrics = () => (
    <View style={styles.consolidatedContainer}>
      <Text style={styles.sectionTitle}>Enterprise Overview</Text>
      
      <View style={styles.metricsGrid}>
        <View style={styles.gridItem}>
          <LinearGradient
            colors={[BrandConfig.colors.primary, BrandConfig.colors.primaryDark]}
            style={styles.metricGradient}
          >
            <Ionicons name="people" size={24} color="white" />
            <Text style={styles.gridValue}>{consolidatedMetrics.totalEmployees.toLocaleString()}</Text>
            <Text style={styles.gridLabel}>Total Employees</Text>
          </LinearGradient>
        </View>

        <View style={styles.gridItem}>
          <LinearGradient
            colors={['#34C759', '#30A14E']}
            style={styles.metricGradient}
          >
            <Ionicons name="card" size={24} color="white" />
            <Text style={styles.gridValue}>{(consolidatedMetrics.totalTransactions / 1000).toFixed(0)}K</Text>
            <Text style={styles.gridLabel}>Monthly Transactions</Text>
          </LinearGradient>
        </View>

        <View style={styles.gridItem}>
          <LinearGradient
            colors={consolidatedMetrics.totalFraudCases > 10 ? ['#FF3B30', '#FF1744'] : ['#FF9500', '#FF6D00']}
            style={styles.metricGradient}
          >
            <Ionicons name="shield-half" size={24} color="white" />
            <Text style={styles.gridValue}>{consolidatedMetrics.totalFraudCases}</Text>
            <Text style={styles.gridLabel}>Active Fraud Cases</Text>
          </LinearGradient>
        </View>

        <View style={styles.gridItem}>
          <LinearGradient
            colors={['#007AFF', '#0056CC']}
            style={styles.metricGradient}
          >
            <Ionicons name="analytics" size={24} color="white" />
            <Text style={styles.gridValue}>{consolidatedMetrics.complianceScore}%</Text>
            <Text style={styles.gridLabel}>Compliance Score</Text>
          </LinearGradient>
        </View>
      </View>

      <View style={styles.crossEntitySection}>
        <Text style={styles.crossEntityTitle}>Cross-Entity Fraud Patterns</Text>
        <View style={styles.patternAlert}>
          <Ionicons name="link" size={20} color={BrandConfig.colors.primary} />
          <View style={styles.patternContent}>
            <Text style={styles.patternText}>
              {consolidatedMetrics.crossEntityPatterns} suspicious patterns detected across multiple entities
            </Text>
            <Text style={styles.patternSubtext}>
              Possible coordinated fraud or policy violations requiring investigation
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient
        colors={[BrandConfig.colors.primary, BrandConfig.colors.primaryDark]}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Corporate Command Center</Text>
        <Text style={styles.headerSubtitle}>
          Multi-Entity Fraud Detection & Compliance Monitoring
        </Text>
        
        <View style={styles.quickStats}>
          <View style={styles.quickStat}>
            <Text style={styles.quickStatValue}>{consolidatedMetrics.totalFraudCases}</Text>
            <Text style={styles.quickStatLabel}>Active Cases</Text>
          </View>
          <View style={styles.quickStat}>
            <Text style={styles.quickStatValue}>{consolidatedMetrics.averageRisk}%</Text>
            <Text style={styles.quickStatLabel}>Avg Risk</Text>
          </View>
          <View style={styles.quickStat}>
            <Text style={styles.quickStatValue}>{corporateEntities.length}</Text>
            <Text style={styles.quickStatLabel}>Entities</Text>
          </View>
        </View>
      </LinearGradient>

      {renderConsolidatedMetrics()}

      <View style={styles.entitiesSection}>
        <Text style={styles.sectionTitle}>Business Entities</Text>
        <Text style={styles.sectionSubtitle}>
          Monitor fraud across all corporate divisions and subsidiaries
        </Text>
        
        {corporateEntities.map(renderEntityCard)}
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.actionButton} onPress={() => Alert.alert('Feature', 'Generate Corporate Compliance Report')}>
          <Ionicons name="document-text" size={20} color="white" />
          <Text style={styles.actionButtonText}>Generate Report</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton} onPress={() => Alert.alert('Feature', 'Configure Cross-Entity Alerts')}>
          <Ionicons name="notifications" size={20} color="white" />
          <Text style={styles.actionButtonText}>Configure Alerts</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  actionButton: {
    alignItems: 'center',
    backgroundColor: BrandConfig.colors.primary,
    borderRadius: 12,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    marginHorizontal: 5,
    padding: 15,
  },
  actionButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    paddingBottom: 40,
  },
  alertBanner: {
    alignItems: 'center',
    backgroundColor: '#FFF2F2',
    borderRadius: 8,
    flexDirection: 'row',
    marginTop: 15,
    padding: 10,
  },
  alertText: {
    color: '#FF3B30',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 5,
  },
  consolidatedContainer: {
    padding: 20,
  },
  container: {
    backgroundColor: '#F8F9FA',
    flex: 1,
  },
  crossEntitySection: {
    backgroundColor: 'white',
    borderRadius: 15,
    elevation: 3,
    marginTop: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  crossEntityTitle: {
    color: BrandConfig.colors.text,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  entitiesSection: {
    padding: 20,
  },
  entityCard: {
    backgroundColor: 'white',
    borderLeftColor: '#34C759',
    borderLeftWidth: 4,
    borderRadius: 15,
    elevation: 3,
    marginBottom: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  entityHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  entityLocation: {
    color: BrandConfig.colors.textSecondary,
    fontSize: 12,
    marginBottom: 15,
  },
  entityMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  entityName: {
    color: BrandConfig.colors.text,
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
  },
  gridItem: {
    marginBottom: 15,
    width: '48%',
  },
  gridLabel: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 12,
    marginTop: 5,
    textAlign: 'center',
  },
  gridValue: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
  },
  header: {
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    padding: 20,
    paddingTop: 50,
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 16,
    marginBottom: 20,
  },
  headerTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  highRiskBadge: {
    backgroundColor: '#FF3B30',
  },
  highRiskCard: {
    borderLeftColor: '#FF3B30',
  },
  lowRiskBadge: {
    backgroundColor: '#34C759',
  },
  lowRiskText: {
    color: 'white',
  },
  mediumRiskBadge: {
    backgroundColor: '#FF9500',
  },
  mediumRiskCard: {
    borderLeftColor: '#FF9500',
  },
  metric: {
    alignItems: 'center',
  },
  metricGradient: {
    alignItems: 'center',
    borderRadius: 15,
    padding: 20,
  },
  metricLabel: {
    color: BrandConfig.colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  metricValue: {
    color: BrandConfig.colors.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  patternAlert: {
    alignItems: 'flex-start',
    backgroundColor: BrandConfig.colors.background,
    borderLeftColor: BrandConfig.colors.primary,
    borderLeftWidth: 4,
    borderRadius: 10,
    flexDirection: 'row',
    padding: 15,
  },
  patternContent: {
    flex: 1,
    marginLeft: 10,
  },
  patternSubtext: {
    color: BrandConfig.colors.textSecondary,
    fontSize: 12,
  },
  patternText: {
    color: BrandConfig.colors.text,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5,
  },
  quickStat: {
    alignItems: 'center',
  },
  quickStatLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    marginTop: 2,
  },
  quickStatValue: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  quickStats: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 15,
  },
  riskBadge: {
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  riskText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  sectionSubtitle: {
    color: BrandConfig.colors.textSecondary,
    fontSize: 14,
    marginBottom: 15,
  },
  sectionTitle: {
    color: BrandConfig.colors.text,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
});

export default CorporateDashboard;