import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const QuickActionWidgets = {
  
  // Quick AI Chat Starters
  QuickChatPrompts: ({ onPromptSelect }) => (
    <View style={styles.promptContainer}>
      <Text style={styles.promptTitle}>Quick AI Prompts</Text>
      <View style={styles.promptGrid}>
        {[
          { text: "Analyze uploaded files for fraud", icon: "document-text", color: "#FF6B6B" },
          { text: "Check for duplicate transactions", icon: "copy", color: "#4ECDC4" },
          { text: "Identify ghost vendors", icon: "person-remove", color: "#45B7D1" },
          { text: "Generate forensic report", icon: "document", color: "#96CEB4" },
          { text: "Explain AI findings", icon: "bulb", color: "#FFA726" },
          { text: "Risk assessment summary", icon: "shield-checkmark", color: "#9C27B0" }
        ].map((prompt, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.promptCard, { borderLeftColor: prompt.color }]}
            onPress={() => onPromptSelect(prompt.text)}
          >
            <Ionicons name={prompt.icon} size={20} color={prompt.color} />
            <Text style={styles.promptText}>{prompt.text}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  ),

  // File Processing Quick Actions
  FileQuickActions: ({ onAction }) => (
    <View style={styles.actionContainer}>
      <Text style={styles.actionTitle}>File Processing</Text>
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#2196F3' }]}
          onPress={() => onAction('upload')}
        >
          <Ionicons name="cloud-upload" size={24} color="#fff" />
          <Text style={styles.actionButtonText}>Upload Files</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#4CAF50' }]}
          onPress={() => onAction('template')}
        >
          <Ionicons name="download" size={24} color="#fff" />
          <Text style={styles.actionButtonText}>Get Template</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#FF9800' }]}
          onPress={() => onAction('validate')}
        >
          <Ionicons name="checkmark-circle" size={24} color="#fff" />
          <Text style={styles.actionButtonText}>Validate Data</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#9C27B0' }]}
          onPress={() => onAction('export')}
        >
          <Ionicons name="share" size={24} color="#fff" />
          <Text style={styles.actionButtonText}>Export Report</Text>
        </TouchableOpacity>
      </View>
    </View>
  ),

  // Investigation Tools Widget
  InvestigationTools: ({ onToolSelect }) => (
    <View style={styles.toolContainer}>
      <Text style={styles.toolTitle}>Investigation Tools</Text>
      <View style={styles.toolGrid}>
        {[
          { name: "Transaction Timeline", icon: "time", description: "View chronological sequence" },
          { name: "Vendor Analysis", icon: "business", description: "Examine vendor patterns" },
          { name: "Amount Clustering", icon: "analytics", description: "Group similar amounts" },
          { name: "Frequency Analysis", icon: "pulse", description: "Pattern frequency" },
          { name: "Cross-Reference", icon: "git-compare", description: "Compare datasets" },
          { name: "Risk Heatmap", icon: "flame", description: "Visual risk distribution" }
        ].map((tool, index) => (
          <TouchableOpacity
            key={index}
            style={styles.toolCard}
            onPress={() => onToolSelect(tool.name)}
          >
            <Ionicons name={tool.icon} size={32} color="#FF6B6B" />
            <Text style={styles.toolName}>{tool.name}</Text>
            <Text style={styles.toolDescription}>{tool.description}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  ),

  // Status Dashboard Widget
  StatusDashboard: ({ stats }) => (
    <View style={styles.statusContainer}>
      <Text style={styles.statusTitle}>Current Status</Text>
      <View style={styles.statusGrid}>
        <View style={styles.statusCard}>
          <Ionicons name="document-text" size={24} color="#2196F3" />
          <Text style={styles.statusNumber}>{stats?.filesProcessed || 0}</Text>
          <Text style={styles.statusLabel}>Files Processed</Text>
        </View>
        
        <View style={styles.statusCard}>
          <Ionicons name="warning" size={24} color="#FF6B6B" />
          <Text style={styles.statusNumber}>{stats?.alertsActive || 0}</Text>
          <Text style={styles.statusLabel}>Active Alerts</Text>
        </View>
        
        <View style={styles.statusCard}>
          <Ionicons name="shield-checkmark" size={24} color="#4CAF50" />
          <Text style={styles.statusNumber}>{stats?.riskScore || 0}%</Text>
          <Text style={styles.statusLabel}>Risk Score</Text>
        </View>
        
        <View style={styles.statusCard}>
          <Ionicons name="trending-up" size={24} color="#9C27B0" />
          <Text style={styles.statusNumber}>{stats?.confidence || 0}%</Text>
          <Text style={styles.statusLabel}>AI Confidence</Text>
        </View>
      </View>
    </View>
  )
};

const styles = StyleSheet.create({
  actionButton: {
    alignItems: 'center',
    borderRadius: 8,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    marginHorizontal: 4,
    padding: 12,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 8,
  },
  actionContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 3,
    margin: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  actionTitle: {
    color: '#333',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  promptCard: {
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderLeftWidth: 4,
    borderRadius: 8,
    flexDirection: 'row',
    marginBottom: 8,
    padding: 12,
  },
  promptContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 3,
    margin: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  promptGrid: {
    gap: 8,
  },
  promptText: {
    color: '#333',
    flex: 1,
    fontSize: 14,
    marginLeft: 12,
  },
  promptTitle: {
    color: '#333',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  statusCard: {
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
    width: '48%',
  },
  statusContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 3,
    margin: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statusLabel: {
    color: '#666',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  statusNumber: {
    color: '#333',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
  },
  statusTitle: {
    color: '#333',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  toolCard: {
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
    width: '48%',
  },
  toolContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 3,
    margin: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  toolDescription: {
    color: '#666',
    fontSize: 11,
    marginTop: 4,
    textAlign: 'center',
  },
  toolGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  toolName: {
    color: '#333',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  toolTitle: {
    color: '#333',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
});

export default QuickActionWidgets;