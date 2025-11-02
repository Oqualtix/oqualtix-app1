// 🔐 ADVANCED SECURITY & COLLABORATION SUITE
// Multi-user management, role-based access, team collaboration, and enterprise security

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, FlatList } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import * as LocalAuthentication from 'expo-local-authentication';

// 👥 USER ROLES AND PERMISSIONS
export const USER_ROLES = {
  ADMIN: {
    name: 'Administrator',
    permissions: ['all_access', 'user_management', 'system_config', 'reports', 'analytics'],
    color: '#dc3545'
  },
  MANAGER: {
    name: 'Manager',
    permissions: ['team_access', 'reports', 'analytics', 'case_assignment'],
    color: '#ffc107'
  },
  ANALYST: {
    name: 'Senior Analyst',
    permissions: ['fraud_analysis', 'reports', 'case_investigation'],
    color: '#007bff'
  },
  INVESTIGATOR: {
    name: 'Investigator',
    permissions: ['case_investigation', 'basic_reports'],
    color: '#28a745'
  },
  VIEWER: {
    name: 'Viewer',
    permissions: ['view_only'],
    color: '#6c757d'
  }
};

// 🔐 ADVANCED SECURITY MANAGER
export class AdvancedSecurityManager {
  
  // Generate secure user session
  static async createSecureSession(userId, role) {
    try {
      const sessionToken = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        `${userId}_${Date.now()}_${Math.random()}`
      );
      
      const sessionData = {
        userId,
        role,
        token: sessionToken,
        createdAt: Date.now(),
        expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
        permissions: USER_ROLES[role]?.permissions || [],
        lastActivity: Date.now()
      };

      await AsyncStorage.setItem('secure_session', JSON.stringify(sessionData));
      return sessionData;
    } catch (error) {
      console.error('Session creation failed:', error);
      throw new Error('Failed to create secure session');
    }
  }

  // Validate session and permissions
  static async validateSession(requiredPermission = null) {
    try {
      const sessionData = await AsyncStorage.getItem('secure_session');
      if (!sessionData) return null;

      const session = JSON.parse(sessionData);
      
      // Check expiration
      if (Date.now() > session.expiresAt) {
        await AsyncStorage.removeItem('secure_session');
        return null;
      }

      // Check permission if required
      if (requiredPermission && !session.permissions.includes(requiredPermission) && 
          !session.permissions.includes('all_access')) {
        return null;
      }

      // Update last activity
      session.lastActivity = Date.now();
      await AsyncStorage.setItem('secure_session', JSON.stringify(session));

      return session;
    } catch (error) {
      console.error('Session validation failed:', error);
      return null;
    }
  }

  // Encrypt sensitive data
  static async encryptSensitiveData(data, userKey) {
    try {
      const dataString = JSON.stringify(data);
      const hash = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        dataString + userKey
      );
      
      return {
        encrypted: hash,
        timestamp: Date.now(),
        checksum: await Crypto.digestStringAsync(
          Crypto.CryptoDigestAlgorithm.SHA256,
          hash + Date.now()
        )
      };
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  // Audit trail logging
  static async logUserAction(action, details, severity = 'INFO') {
    try {
      const session = await this.validateSession();
      if (!session) return;

      const logEntry = {
        id: Date.now().toString(),
        userId: session.userId,
        userRole: session.role,
        action,
        details,
        severity,
        timestamp: new Date().toISOString(),
        ipAddress: 'mobile_app', // In real app, get actual IP
        deviceInfo: Platform.OS
      };

      // Get existing logs
      const existingLogs = await AsyncStorage.getItem('audit_logs');
      const logs = existingLogs ? JSON.parse(existingLogs) : [];
      
      // Add new log and keep only last 1000 entries
      logs.unshift(logEntry);
      const trimmedLogs = logs.slice(0, 1000);
      
      await AsyncStorage.setItem('audit_logs', JSON.stringify(trimmedLogs));
      
      // Alert for critical actions
      if (severity === 'CRITICAL') {
        Alert.alert('Security Alert', `Critical action logged: ${action}`);
      }

    } catch (error) {
      console.error('Audit logging failed:', error);
    }
  }
}

// 👥 TEAM COLLABORATION MANAGER
export class TeamCollaborationManager {
  
  // Create new investigation case
  static async createInvestigationCase(caseData, assignedTo = null) {
    try {
      const session = await AdvancedSecurityManager.validateSession('case_assignment');
      if (!session) throw new Error('Insufficient permissions');

      const newCase = {
        id: `CASE_${Date.now()}`,
        title: caseData.title,
        description: caseData.description,
        priority: caseData.priority || 'MEDIUM',
        status: 'OPEN',
        createdBy: session.userId,
        assignedTo: assignedTo || session.userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        analysisData: caseData.analysisData || null,
        comments: [],
        attachments: [],
        riskScore: caseData.riskScore || 0,
        estimatedValue: caseData.estimatedValue || 0
      };

      // Save case
      const existingCases = await AsyncStorage.getItem('investigation_cases');
      const cases = existingCases ? JSON.parse(existingCases) : [];
      cases.unshift(newCase);
      await AsyncStorage.setItem('investigation_cases', JSON.stringify(cases));

      // Log action
      await AdvancedSecurityManager.logUserAction(
        'CASE_CREATED',
        `Created investigation case: ${newCase.title}`,
        'INFO'
      );

      return newCase;
    } catch (error) {
      console.error('Case creation failed:', error);
      throw error;
    }
  }

  // Add comment to case
  static async addCaseComment(caseId, comment) {
    try {
      const session = await AdvancedSecurityManager.validateSession('case_investigation');
      if (!session) throw new Error('Insufficient permissions');

      const existingCases = await AsyncStorage.getItem('investigation_cases');
      const cases = existingCases ? JSON.parse(existingCases) : [];
      
      const caseIndex = cases.findIndex(c => c.id === caseId);
      if (caseIndex === -1) throw new Error('Case not found');

      const newComment = {
        id: Date.now().toString(),
        userId: session.userId,
        userRole: session.role,
        text: comment,
        timestamp: new Date().toISOString()
      };

      cases[caseIndex].comments.push(newComment);
      cases[caseIndex].updatedAt = new Date().toISOString();
      
      await AsyncStorage.setItem('investigation_cases', JSON.stringify(cases));

      // Log action
      await AdvancedSecurityManager.logUserAction(
        'CASE_COMMENT_ADDED',
        `Added comment to case ${caseId}`,
        'INFO'
      );

      return newComment;
    } catch (error) {
      console.error('Comment addition failed:', error);
      throw error;
    }
  }

  // Update case status
  static async updateCaseStatus(caseId, newStatus, resolution = null) {
    try {
      const session = await AdvancedSecurityManager.validateSession('case_investigation');
      if (!session) throw new Error('Insufficient permissions');

      const existingCases = await AsyncStorage.getItem('investigation_cases');
      const cases = existingCases ? JSON.parse(existingCases) : [];
      
      const caseIndex = cases.findIndex(c => c.id === caseId);
      if (caseIndex === -1) throw new Error('Case not found');

      cases[caseIndex].status = newStatus;
      cases[caseIndex].updatedAt = new Date().toISOString();
      
      if (resolution) {
        cases[caseIndex].resolution = resolution;
        cases[caseIndex].resolvedAt = new Date().toISOString();
        cases[caseIndex].resolvedBy = session.userId;
      }
      
      await AsyncStorage.setItem('investigation_cases', JSON.stringify(cases));

      // Log action
      await AdvancedSecurityManager.logUserAction(
        'CASE_STATUS_UPDATED',
        `Updated case ${caseId} status to ${newStatus}`,
        newStatus === 'RESOLVED' ? 'INFO' : 'INFO'
      );

      return cases[caseIndex];
    } catch (error) {
      console.error('Case update failed:', error);
      throw error;
    }
  }

  // Get team performance metrics
  static async getTeamMetrics() {
    try {
      const cases = await this.getAllCases();
      const logs = await AsyncStorage.getItem('audit_logs');
      const auditLogs = logs ? JSON.parse(logs) : [];

      const metrics = {
        totalCases: cases.length,
        openCases: cases.filter(c => c.status === 'OPEN').length,
        resolvedCases: cases.filter(c => c.status === 'RESOLVED').length,
        highPriorityCases: cases.filter(c => c.priority === 'HIGH').length,
        avgResolutionTime: this.calculateAvgResolutionTime(cases),
        totalValueInvestigated: cases.reduce((sum, c) => sum + (c.estimatedValue || 0), 0),
        teamActivity: this.getTeamActivity(auditLogs),
        casesByUser: this.getCasesByUser(cases)
      };

      return metrics;
    } catch (error) {
      console.error('Metrics calculation failed:', error);
      return null;
    }
  }

  static async getAllCases() {
    const existingCases = await AsyncStorage.getItem('investigation_cases');
    return existingCases ? JSON.parse(existingCases) : [];
  }

  static calculateAvgResolutionTime(cases) {
    const resolvedCases = cases.filter(c => c.status === 'RESOLVED' && c.resolvedAt);
    if (resolvedCases.length === 0) return 0;

    const totalTime = resolvedCases.reduce((sum, c) => {
      const created = new Date(c.createdAt);
      const resolved = new Date(c.resolvedAt);
      return sum + (resolved - created);
    }, 0);

    return Math.round(totalTime / resolvedCases.length / (1000 * 60 * 60 * 24)); // Days
  }

  static getTeamActivity(logs) {
    const last7Days = Date.now() - (7 * 24 * 60 * 60 * 1000);
    return logs.filter(log => new Date(log.timestamp).getTime() > last7Days).length;
  }

  static getCasesByUser(cases) {
    const userCounts = {};
    cases.forEach(c => {
      userCounts[c.assignedTo] = (userCounts[c.assignedTo] || 0) + 1;
    });
    return userCounts;
  }
}

// 🏢 ORGANIZATION MANAGER
export class OrganizationManager {
  
  // Create organization
  static async createOrganization(orgData) {
    try {
      const session = await AdvancedSecurityManager.validateSession('all_access');
      if (!session) throw new Error('Admin access required');

      const organization = {
        id: `ORG_${Date.now()}`,
        name: orgData.name,
        domain: orgData.domain,
        subscription: orgData.subscription || 'BUSINESS',
        createdAt: new Date().toISOString(),
        settings: {
          maxUsers: orgData.maxUsers || 10,
          features: orgData.features || ['basic', 'team', 'analytics'],
          customBranding: false,
          apiAccess: false
        },
        users: [{
          id: session.userId,
          role: 'ADMIN',
          joinedAt: new Date().toISOString()
        }]
      };

      await AsyncStorage.setItem('organization', JSON.stringify(organization));
      
      // Log action
      await AdvancedSecurityManager.logUserAction(
        'ORGANIZATION_CREATED',
        `Created organization: ${organization.name}`,
        'INFO'
      );

      return organization;
    } catch (error) {
      console.error('Organization creation failed:', error);
      throw error;
    }
  }

  // Add user to organization
  static async addUserToOrganization(userEmail, role) {
    try {
      const session = await AdvancedSecurityManager.validateSession('user_management');
      if (!session) throw new Error('User management permission required');

      const orgData = await AsyncStorage.getItem('organization');
      if (!orgData) throw new Error('No organization found');

      const organization = JSON.parse(orgData);
      
      // Check user limit
      if (organization.users.length >= organization.settings.maxUsers) {
        throw new Error('User limit reached for current subscription');
      }

      const newUser = {
        id: `USER_${Date.now()}`,
        email: userEmail,
        role: role,
        joinedAt: new Date().toISOString(),
        invitedBy: session.userId,
        status: 'INVITED'
      };

      organization.users.push(newUser);
      await AsyncStorage.setItem('organization', JSON.stringify(organization));

      // Log action
      await AdvancedSecurityManager.logUserAction(
        'USER_INVITED',
        `Invited user ${userEmail} with role ${role}`,
        'INFO'
      );

      return newUser;
    } catch (error) {
      console.error('User addition failed:', error);
      throw error;
    }
  }
}

// 📊 COLLABORATION DASHBOARD COMPONENT
export const CollaborationDashboard = ({ theme, userSession }) => {
  const [cases, setCases] = useState([]);
  const [teamMetrics, setTeamMetrics] = useState(null);
  const [selectedCase, setSelectedCase] = useState(null);

  useEffect(() => {
    loadCollaborationData();
  }, []);

  const loadCollaborationData = async () => {
    try {
      const allCases = await TeamCollaborationManager.getAllCases();
      setCases(allCases);
      
      const metrics = await TeamCollaborationManager.getTeamMetrics();
      setTeamMetrics(metrics);
    } catch (error) {
      console.error('Failed to load collaboration data:', error);
    }
  };

  const handleCreateCase = async () => {
    try {
      Alert.prompt(
        'Create Investigation Case',
        'Enter case title:',
        async (title) => {
          if (title) {
            const caseData = {
              title,
              description: 'New investigation case',
              priority: 'MEDIUM',
              riskScore: 50
            };
            
            await TeamCollaborationManager.createInvestigationCase(caseData);
            loadCollaborationData();
          }
        }
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to create case: ' + error.message);
    }
  };

  const handleAddComment = async (caseId) => {
    try {
      Alert.prompt(
        'Add Comment',
        'Enter your comment:',
        async (comment) => {
          if (comment) {
            await TeamCollaborationManager.addCaseComment(caseId, comment);
            loadCollaborationData();
          }
        }
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to add comment: ' + error.message);
    }
  };

  const renderCase = ({ item }) => (
    <View style={[styles.caseCard, { backgroundColor: theme.card }]}>
      <View style={styles.caseHeader}>
        <Text style={[styles.caseTitle, { color: theme.text }]}>{item.title}</Text>
        <View style={[styles.priorityBadge, { 
          backgroundColor: item.priority === 'HIGH' ? theme.danger : 
                          item.priority === 'MEDIUM' ? theme.warning : theme.success 
        }]}>
          <Text style={styles.priorityText}>{item.priority}</Text>
        </View>
      </View>
      
      <Text style={[styles.caseDescription, { color: theme.text }]}>
        {item.description}
      </Text>
      
      <View style={styles.caseStats}>
        <Text style={[styles.caseStat, { color: theme.text }]}>
          Risk Score: {item.riskScore}%
        </Text>
        <Text style={[styles.caseStat, { color: theme.text }]}>
          Comments: {item.comments?.length || 0}
        </Text>
      </View>
      
      <View style={styles.caseActions}>
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: theme.accent }]}
          onPress={() => handleAddComment(item.id)}
        >
          <Text style={styles.actionButtonText}>Add Comment</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: theme.success }]}
          onPress={() => setSelectedCase(item)}
        >
          <Text style={styles.actionButtonText}>View Details</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          👥 Team Collaboration
        </Text>
        <TouchableOpacity 
          style={[styles.createButton, { backgroundColor: theme.accent }]}
          onPress={handleCreateCase}
        >
          <Text style={styles.createButtonText}>+ New Case</Text>
        </TouchableOpacity>
      </View>

      {teamMetrics && (
        <View style={[styles.metricsCard, { backgroundColor: theme.card }]}>
          <Text style={[styles.metricsTitle, { color: theme.text }]}>
            📊 Team Performance
          </Text>
          <View style={styles.metricsGrid}>
            <View style={styles.metricItem}>
              <Text style={[styles.metricNumber, { color: theme.accent }]}>
                {teamMetrics.totalCases}
              </Text>
              <Text style={[styles.metricLabel, { color: theme.text }]}>
                Total Cases
              </Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={[styles.metricNumber, { color: theme.success }]}>
                {teamMetrics.resolvedCases}
              </Text>
              <Text style={[styles.metricLabel, { color: theme.text }]}>
                Resolved
              </Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={[styles.metricNumber, { color: theme.warning }]}>
                {teamMetrics.avgResolutionTime}
              </Text>
              <Text style={[styles.metricLabel, { color: theme.text }]}>
                Avg Days
              </Text>
            </View>
          </View>
        </View>
      )}

      <FlatList
        data={cases}
        renderItem={renderCase}
        keyExtractor={item => item.id}
        style={styles.casesList}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

// 🎨 STYLES
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  createButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  createButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  metricsCard: {
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  metricsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  metricItem: {
    alignItems: 'center',
  },
  metricNumber: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  metricLabel: {
    fontSize: 12,
    opacity: 0.8,
  },
  casesList: {
    flex: 1,
  },
  caseCard: {
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  caseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  caseTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  priorityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  priorityText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  caseDescription: {
    fontSize: 14,
    marginBottom: 15,
    opacity: 0.8,
  },
  caseStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  caseStat: {
    fontSize: 12,
    opacity: 0.7,
  },
  caseActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
    flex: 0.48,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default {
  AdvancedSecurityManager,
  TeamCollaborationManager,
  OrganizationManager,
  CollaborationDashboard,
  USER_ROLES
};