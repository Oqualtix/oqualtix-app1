import * as Notifications from 'expo-notifications';
import * as FileSystem from 'expo-file-system';
import moment from 'moment';

// Enhanced app functionality utilities
export const AppFunctionalityUtils = {
  
  // Notification system
  NotificationService: {
    // Configure notifications
    configure: async () => {
      await Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: false,
          shouldSetBadge: false,
        }),
      });

      // Request permissions
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Notification permissions not granted');
        return false;
      }
      return true;
    },

    // Send local notification
    sendNotification: async (title, body, data = {}) => {
      try {
        await Notifications.scheduleNotificationAsync({
          content: {
            title,
            body,
            data,
            priority: Notifications.AndroidNotificationPriority.HIGH,
          },
          trigger: null, // Send immediately
        });
      } catch (error) {
        console.error('Failed to send notification:', error);
      }
    },

    // Schedule fraud alert
    scheduleSecurityAlert: async (finding) => {
      const title = '🚨 Security Alert';
      const body = `${finding.severity} risk detected: ${finding.type}`;
      
      await AppFunctionalityUtils.NotificationService.sendNotification(title, body, {
        type: 'security_alert',
        finding: finding
      });
    },

    // Schedule analysis completion
    scheduleAnalysisComplete: async (analysisResults) => {
      const title = '✅ Analysis Complete';
      const body = `Found ${analysisResults.findings.length} potential issues (Risk: ${analysisResults.summary.riskLevel})`;
      
      await AppFunctionalityUtils.NotificationService.sendNotification(title, body, {
        type: 'analysis_complete',
        riskScore: analysisResults.riskScore
      });
    }
  },

  // Audit trail system
  AuditTrail: {
    events: [],

    // Log user action
    logAction: (action, details = {}) => {
      const event = {
        id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
        action,
        details,
        userId: details.userId || 'unknown',
        sessionId: details.sessionId || 'unknown',
        ipAddress: 'localhost', // In production, get real IP
        userAgent: navigator?.userAgent || 'unknown'
      };

      AppFunctionalityUtils.AuditTrail.events.push(event);
      
      // Keep only last 1000 events
      if (AppFunctionalityUtils.AuditTrail.events.length > 1000) {
        AppFunctionalityUtils.AuditTrail.events = AppFunctionalityUtils.AuditTrail.events.slice(-1000);
      }

      console.log('Audit Event:', event);
      return event;
    },

    // Get audit events
    getEvents: (filters = {}) => {
      let events = [...AppFunctionalityUtils.AuditTrail.events];

      if (filters.userId) {
        events = events.filter(e => e.userId === filters.userId);
      }

      if (filters.action) {
        events = events.filter(e => e.action === filters.action);
      }

      if (filters.startDate) {
        events = events.filter(e => new Date(e.timestamp) >= filters.startDate);
      }

      if (filters.endDate) {
        events = events.filter(e => new Date(e.timestamp) <= filters.endDate);
      }

      return events.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    },

    // Export audit log
    exportAuditLog: (format = 'csv') => {
      const events = AppFunctionalityUtils.AuditTrail.getEvents();
      
      if (format === 'csv') {
        const headers = ['Timestamp', 'User ID', 'Action', 'Details', 'IP Address'];
        const rows = [headers];
        
        events.forEach(event => {
          rows.push([
            event.timestamp,
            event.userId,
            event.action,
            JSON.stringify(event.details),
            event.ipAddress
          ]);
        });

        return rows.map(row => 
          row.map(cell => `"${cell.toString().replace(/"/g, '""')}"`)
             .join(',')
        ).join('\n');
      }

      return JSON.stringify(events, null, 2);
    }
  },

  // Data export system
  DataExport: {
    // Export transactions
    exportTransactions: async (transactions, format = 'csv') => {
      try {
        let content;
        let filename;
        let mimeType;

        switch (format) {
          case 'csv':
            content = AppFunctionalityUtils.DataExport.transactionsToCSV(transactions);
            filename = `transactions_export_${moment().format('YYYY-MM-DD_HH-mm-ss')}.csv`;
            mimeType = 'text/csv';
            break;
          
          case 'json':
            content = JSON.stringify(transactions, null, 2);
            filename = `transactions_export_${moment().format('YYYY-MM-DD_HH-mm-ss')}.json`;
            mimeType = 'application/json';
            break;
          
          case 'excel':
            // In production, generate actual Excel file
            content = AppFunctionalityUtils.DataExport.transactionsToCSV(transactions);
            filename = `transactions_export_${moment().format('YYYY-MM-DD_HH-mm-ss')}.csv`;
            mimeType = 'text/csv';
            break;

          default:
            throw new Error('Unsupported export format');
        }

        return {
          success: true,
          content,
          filename,
          mimeType
        };
      } catch (error) {
        return {
          success: false,
          error: error.message
        };
      }
    },

    // Export analysis results
    exportAnalysis: async (analysis, format = 'json') => {
      try {
        let content;
        let filename;
        let mimeType;

        switch (format) {
          case 'json':
            content = JSON.stringify(analysis, null, 2);
            filename = `forensic_analysis_${moment().format('YYYY-MM-DD_HH-mm-ss')}.json`;
            mimeType = 'application/json';
            break;
          
          case 'csv':
            content = AppFunctionalityUtils.DataExport.analysisToCSV(analysis);
            filename = `forensic_analysis_${moment().format('YYYY-MM-DD_HH-mm-ss')}.csv`;
            mimeType = 'text/csv';
            break;
          
          case 'report':
            content = AppFunctionalityUtils.DataExport.generateReport(analysis);
            filename = `forensic_report_${moment().format('YYYY-MM-DD_HH-mm-ss')}.txt`;
            mimeType = 'text/plain';
            break;

          default:
            throw new Error('Unsupported export format');
        }

        return {
          success: true,
          content,
          filename,
          mimeType
        };
      } catch (error) {
        return {
          success: false,
          error: error.message
        };
      }
    },

    // Convert transactions to CSV
    transactionsToCSV: (transactions) => {
      const headers = [
        'Date', 'Description', 'Vendor', 'Category', 'Amount', 
        'Account', 'Reference', 'Type'
      ];
      const rows = [headers];

      transactions.forEach(transaction => {
        rows.push([
          moment(transaction.date).format('YYYY-MM-DD'),
          transaction.description,
          transaction.vendor,
          transaction.category,
          transaction.amount,
          transaction.account,
          transaction.reference,
          transaction.type
        ]);
      });

      return rows.map(row => 
        row.map(cell => `"${cell.toString().replace(/"/g, '""')}"`)
           .join(',')
      ).join('\n');
    },

    // Convert analysis to CSV
    analysisToCSV: (analysis) => {
      const headers = ['Finding Type', 'Severity', 'Description', 'Recommendation'];
      const rows = [headers];

      // Add summary row
      rows.push([
        'SUMMARY',
        analysis.summary.riskLevel,
        `Risk Score: ${analysis.riskScore}`,
        `${analysis.findings.length} findings identified`
      ]);

      // Add findings
      analysis.findings.forEach(finding => {
        rows.push([
          finding.type,
          finding.severity,
          finding.description,
          finding.recommendation
        ]);
      });

      return rows.map(row => 
        row.map(cell => `"${cell.toString().replace(/"/g, '""')}"`)
           .join(',')
      ).join('\n');
    },

    // Generate comprehensive report
    generateReport: (analysis) => {
      const report = [];
      
      report.push('OQUALTIX FORENSIC ANALYSIS REPORT');
      report.push('=====================================');
      report.push('');
      report.push(`Generated: ${moment().format('YYYY-MM-DD HH:mm:ss')}`);
      report.push(`Risk Score: ${analysis.riskScore}/100`);
      report.push(`Risk Level: ${analysis.summary.riskLevel}`);
      report.push(`Status: ${analysis.summary.status}`);
      report.push('');
      
      report.push('EXECUTIVE SUMMARY');
      report.push('-----------------');
      report.push(`Total Findings: ${analysis.findings.length}`);
      report.push(`High Severity: ${analysis.summary.highSeverityFindings}`);
      report.push(`Medium Severity: ${analysis.summary.mediumSeverityFindings}`);
      report.push('');

      if (analysis.findings.length > 0) {
        report.push('DETAILED FINDINGS');
        report.push('------------------');
        analysis.findings.forEach((finding, index) => {
          report.push(`${index + 1}. ${finding.type} [${finding.severity}]`);
          report.push(`   Description: ${finding.description}`);
          report.push(`   Recommendation: ${finding.recommendation}`);
          report.push('');
        });
      }

      if (analysis.recommendations && analysis.recommendations.length > 0) {
        report.push('RECOMMENDATIONS');
        report.push('---------------');
        analysis.recommendations.forEach((rec, index) => {
          report.push(`${index + 1}. ${rec}`);
        });
        report.push('');
      }

      report.push('TECHNICAL DETAILS');
      report.push('-----------------');
      if (analysis.patterns) {
        Object.keys(analysis.patterns).forEach(pattern => {
          const data = analysis.patterns[pattern];
          report.push(`${pattern.toUpperCase()}: ${data.riskLevel} risk`);
          if (data.isAnomalous) {
            report.push(`   Anomaly detected`);
          }
        });
      }

      report.push('');
      report.push('Report generated by Oqualtix Forensic Analysis System');
      
      return report.join('\n');
    }
  },

  // Offline capability system
  OfflineManager: {
    isOnline: true,
    syncQueue: [],

    // Initialize offline capabilities
    initialize: () => {
      // Monitor network status
      AppFunctionalityUtils.OfflineManager.monitorConnection();
      
      // Load offline data
      AppFunctionalityUtils.OfflineManager.loadOfflineData();
    },

    // Monitor connection status
    monitorConnection: () => {
      // In a real app, use NetInfo or similar
      const updateStatus = () => {
        AppFunctionalityUtils.OfflineManager.isOnline = navigator.onLine;
        if (AppFunctionalityUtils.OfflineManager.isOnline) {
          AppFunctionalityUtils.OfflineManager.syncOfflineData();
        }
      };

      window.addEventListener('online', updateStatus);
      window.addEventListener('offline', updateStatus);
      updateStatus();
    },

    // Store data for offline use
    storeOfflineData: async (key, data) => {
      try {
        const serializedData = JSON.stringify(data);
        // In production, use AsyncStorage or SQLite
        localStorage.setItem(`offline_${key}`, serializedData);
        return true;
      } catch (error) {
        console.error('Failed to store offline data:', error);
        return false;
      }
    },

    // Load offline data
    loadOfflineData: async () => {
      try {
        const keys = Object.keys(localStorage).filter(key => key.startsWith('offline_'));
        const offlineData = {};
        
        keys.forEach(key => {
          const data = localStorage.getItem(key);
          if (data) {
            offlineData[key.replace('offline_', '')] = JSON.parse(data);
          }
        });
        
        return offlineData;
      } catch (error) {
        console.error('Failed to load offline data:', error);
        return {};
      }
    },

    // Queue action for later sync
    queueAction: (action) => {
      AppFunctionalityUtils.OfflineManager.syncQueue.push({
        id: `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        action,
        timestamp: new Date().toISOString()
      });
    },

    // Sync offline data when online
    syncOfflineData: async () => {
      if (!AppFunctionalityUtils.OfflineManager.isOnline || 
          AppFunctionalityUtils.OfflineManager.syncQueue.length === 0) {
        return;
      }

      console.log(`Syncing ${AppFunctionalityUtils.OfflineManager.syncQueue.length} queued actions`);
      
      // In production, sync with backend API
      const syncedActions = [...AppFunctionalityUtils.OfflineManager.syncQueue];
      AppFunctionalityUtils.OfflineManager.syncQueue = [];
      
      // Simulate sync
      for (const queuedAction of syncedActions) {
        console.log('Syncing action:', queuedAction.action);
        // Process queued action
      }

      await AppFunctionalityUtils.NotificationService.sendNotification(
        'Sync Complete',
        `${syncedActions.length} actions synchronized`
      );
    }
  },

  // Performance monitoring
  PerformanceMonitor: {
    metrics: {},

    // Start performance tracking
    startTimer: (operation) => {
      AppFunctionalityUtils.PerformanceMonitor.metrics[operation] = {
        startTime: performance.now(),
        operation
      };
    },

    // End performance tracking
    endTimer: (operation) => {
      const metric = AppFunctionalityUtils.PerformanceMonitor.metrics[operation];
      if (metric) {
        metric.endTime = performance.now();
        metric.duration = metric.endTime - metric.startTime;
        
        console.log(`Performance: ${operation} took ${metric.duration.toFixed(2)}ms`);
        
        // Log slow operations
        if (metric.duration > 5000) { // 5 seconds
          console.warn(`Slow operation detected: ${operation}`);
        }
      }
    },

    // Get performance summary
    getSummary: () => {
      const summary = {};
      Object.keys(AppFunctionalityUtils.PerformanceMonitor.metrics).forEach(operation => {
        const metric = AppFunctionalityUtils.PerformanceMonitor.metrics[operation];
        if (metric.duration) {
          summary[operation] = {
            duration: metric.duration,
            status: metric.duration > 5000 ? 'SLOW' : 'NORMAL'
          };
        }
      });
      return summary;
    }
  },

  // Smart caching system
  CacheManager: {
    cache: new Map(),
    maxSize: 100,
    ttl: 30 * 60 * 1000, // 30 minutes

    // Store in cache
    set: (key, value, customTTL) => {
      const expiresAt = Date.now() + (customTTL || AppFunctionalityUtils.CacheManager.ttl);
      
      AppFunctionalityUtils.CacheManager.cache.set(key, {
        value,
        expiresAt,
        accessed: Date.now()
      });

      // Cleanup if cache is too large
      if (AppFunctionalityUtils.CacheManager.cache.size > AppFunctionalityUtils.CacheManager.maxSize) {
        AppFunctionalityUtils.CacheManager.cleanup();
      }
    },

    // Get from cache
    get: (key) => {
      const item = AppFunctionalityUtils.CacheManager.cache.get(key);
      
      if (!item) return null;
      
      if (Date.now() > item.expiresAt) {
        AppFunctionalityUtils.CacheManager.cache.delete(key);
        return null;
      }
      
      item.accessed = Date.now();
      return item.value;
    },

    // Cleanup old entries
    cleanup: () => {
      const now = Date.now();
      const entries = Array.from(AppFunctionalityUtils.CacheManager.cache.entries());
      
      // Remove expired entries
      entries.forEach(([key, item]) => {
        if (now > item.expiresAt) {
          AppFunctionalityUtils.CacheManager.cache.delete(key);
        }
      });

      // If still too large, remove least recently accessed
      if (AppFunctionalityUtils.CacheManager.cache.size > AppFunctionalityUtils.CacheManager.maxSize) {
        const sorted = entries
          .filter(([key, item]) => now <= item.expiresAt)
          .sort((a, b) => a[1].accessed - b[1].accessed);
        
        const toRemove = sorted.slice(0, AppFunctionalityUtils.CacheManager.cache.size - AppFunctionalityUtils.CacheManager.maxSize);
        toRemove.forEach(([key]) => AppFunctionalityUtils.CacheManager.cache.delete(key));
      }
    },

    // Clear cache
    clear: () => {
      AppFunctionalityUtils.CacheManager.cache.clear();
    }
  }
};

export default AppFunctionalityUtils;