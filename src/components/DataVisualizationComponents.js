import React from 'react';
import { View, Text, Dimensions, StyleSheet } from 'react-native';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';

const { width: screenWidth } = Dimensions.get('window');

export const DataVisualizationComponents = {
  
  // Risk score trend chart
  RiskTrendChart: ({ data, title = "Risk Score Trend" }) => (
    <View style={styles.chartContainer}>
      <Text style={styles.chartTitle}>{title}</Text>
      <LineChart
        data={{
          labels: data.labels || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          datasets: [{
            data: data.values || [20, 45, 28, 80, 99, 43]
          }]
        }}
        width={screenWidth - 40}
        height={220}
        yAxisLabel=""
        yAxisSuffix="%"
        yAxisInterval={1}
        chartConfig={{
          backgroundColor: '#FF6B6B',
          backgroundGradientFrom: '#FF6B6B',
          backgroundGradientTo: '#FF8E8E',
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          style: { borderRadius: 16 },
          propsForDots: {
            r: "6",
            strokeWidth: "2",
            stroke: "#ffa726"
          }
        }}
        bezier
        style={styles.chart}
      />
    </View>
  ),

  // Transaction amount distribution
  TransactionDistributionChart: ({ data }) => (
    <View style={styles.chartContainer}>
      <Text style={styles.chartTitle}>Transaction Distribution</Text>
      <BarChart
        data={{
          labels: data.labels || ['<$1K', '$1-5K', '$5-10K', '$10K+'],
          datasets: [{
            data: data.values || [20, 45, 28, 16]
          }]
        }}
        width={screenWidth - 40}
        height={220}
        yAxisLabel=""
        chartConfig={{
          backgroundColor: '#2196F3',
          backgroundGradientFrom: '#2196F3',
          backgroundGradientTo: '#21CBF3',
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          style: { borderRadius: 16 }
        }}
        style={styles.chart}
      />
    </View>
  ),

  // Fraud type breakdown pie chart
  FraudTypeChart: ({ data }) => (
    <View style={styles.chartContainer}>
      <Text style={styles.chartTitle}>Fraud Type Breakdown</Text>
      <PieChart
        data={data || [
          { name: 'Embezzlement', population: 40, color: '#FF6B6B', legendFontColor: '#333', legendFontSize: 15 },
          { name: 'Duplicate Payments', population: 25, color: '#4ECDC4', legendFontColor: '#333', legendFontSize: 15 },
          { name: 'Ghost Vendors', population: 20, color: '#45B7D1', legendFontColor: '#333', legendFontSize: 15 },
          { name: 'Expense Fraud', population: 15, color: '#96CEB4', legendFontColor: '#333', legendFontSize: 15 }
        ]}
        width={screenWidth - 40}
        height={220}
        chartConfig={{
          color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`
        }}
        accessor="population"
        backgroundColor="transparent"
        paddingLeft="15"
        absolute
        style={styles.chart}
      />
    </View>
  ),

  // AI confidence meter
  AIConfidenceMeter: ({ confidence = 85 }) => (
    <View style={styles.confidenceContainer}>
      <Text style={styles.confidenceTitle}>AI Confidence Level</Text>
      <View style={styles.confidenceMeter}>
        <View style={[styles.confidenceFill, { width: `${confidence}%` }]} />
        <Text style={styles.confidenceText}>{confidence}%</Text>
      </View>
    </View>
  )
};

const styles = StyleSheet.create({
  chart: {
    borderRadius: 16,
    marginVertical: 8,
  },
  chartContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 3,
    marginVertical: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  chartTitle: {
    color: '#333',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  confidenceContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginVertical: 8,
    padding: 16,
  },
  confidenceFill: {
    backgroundColor: '#28a745',
    borderRadius: 15,
    height: '100%',
    left: 0,
    position: 'absolute',
  },
  confidenceMeter: {
    backgroundColor: '#e9ecef',
    borderRadius: 15,
    height: 30,
    justifyContent: 'center',
    position: 'relative',
  },
  confidenceText: {
    color: '#333',
    fontWeight: 'bold',
    textAlign: 'center',
    zIndex: 1,
  },
  confidenceTitle: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
});

export default DataVisualizationComponents;