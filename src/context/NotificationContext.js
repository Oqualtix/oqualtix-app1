import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Platform, Alert } from 'react-native';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const NotificationProvider = ({ children }) => {
  const [notificationSettings, setNotificationSettings] = useState({
    enabled: true,
    fraudAlerts: true,
    riskScoreChanges: true,
    systemUpdates: true,
    weeklyReports: false,
    highRiskTransactions: true,
    newAnomalies: true,
    aiAnalysisComplete: true,
    sound: true,
    vibration: true,
    badge: true,
    quietHours: {
      enabled: false,
      startTime: '22:00',
      endTime: '08:00'
    }
  });

  const [expoPushToken, setExpoPushToken] = useState(null);
  const [isPermissionGranted, setIsPermissionGranted] = useState(false);

  useEffect(() => {
    loadNotificationSettings();
    requestPermissions();
  }, []);

  const loadNotificationSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('@notification_settings');
      if (savedSettings) {
        setNotificationSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
    }
  };

  const saveNotificationSettings = async (newSettings) => {
    try {
      await AsyncStorage.setItem('@notification_settings', JSON.stringify(newSettings));
      setNotificationSettings(newSettings);
    } catch (error) {
      console.error('Error saving notification settings:', error);
    }
  };

  const requestPermissions = async () => {
    try {
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('fraud-alerts', {
          name: 'Fraud Alerts',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#0000FF',
        });

        await Notifications.setNotificationChannelAsync('system-updates', {
          name: 'System Updates',
          importance: Notifications.AndroidImportance.DEFAULT,
        });

        await Notifications.setNotificationChannelAsync('reports', {
          name: 'Reports & Analytics',
          importance: Notifications.AndroidImportance.LOW,
        });
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        Alert.alert(
          'Notification Permission',
          'Push notifications are disabled. You can enable them in your device settings to receive real-time fraud alerts.',
          [{ text: 'OK' }]
        );
        setIsPermissionGranted(false);
        return;
      }

      setIsPermissionGranted(true);

      // Get push token for remote notifications
      const token = (await Notifications.getExpoPushTokenAsync()).data;
      setExpoPushToken(token);
      console.log('Expo Push Token:', token);

    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      setIsPermissionGranted(false);
    }
  };

  const scheduleLocalNotification = async (title, body, data = {}, channelId = 'default') => {
    if (!notificationSettings.enabled || !isPermissionGranted) {
      return;
    }

    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: notificationSettings.sound,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: null, // Show immediately
      });

      return notificationId;
    } catch (error) {
      console.error('Error scheduling notification:', error);
    }
  };

  const sendFraudAlert = async (transaction, riskScore) => {
    if (!notificationSettings.fraudAlerts) return;

    await scheduleLocalNotification(
      '🚨 High Risk Transaction Detected',
      `Transaction of $${transaction.amount} flagged with ${riskScore}% risk score`,
      { type: 'fraud_alert', transactionId: transaction.id },
      'fraud-alerts'
    );
  };

  const sendRiskScoreUpdate = async (oldScore, newScore, trend) => {
    if (!notificationSettings.riskScoreChanges) return;

    const emoji = trend === 'up' ? '📈' : '📉';
    await scheduleLocalNotification(
      `${emoji} Risk Score Update`,
      `Your risk score changed from ${oldScore}% to ${newScore}%`,
      { type: 'risk_update', oldScore, newScore },
      'system-updates'
    );
  };

  const sendAnomalyDetected = async (anomaly) => {
    if (!notificationSettings.newAnomalies) return;

    await scheduleLocalNotification(
      '🔍 New Anomaly Detected',
      `${anomaly.type}: ${anomaly.description}`,
      { type: 'anomaly', anomalyId: anomaly.id },
      'fraud-alerts'
    );
  };

  const sendAIAnalysisComplete = async (analysisType, resultsCount) => {
    if (!notificationSettings.aiAnalysisComplete) return;

    await scheduleLocalNotification(
      '🤖 AI Analysis Complete',
      `${analysisType} analysis finished. ${resultsCount} insights generated.`,
      { type: 'ai_complete', analysisType },
      'system-updates'
    );
  };

  const sendWeeklyReport = async (reportData) => {
    if (!notificationSettings.weeklyReports) return;

    await scheduleLocalNotification(
      '📊 Weekly Report Available',
      `${reportData.transactionsAnalyzed} transactions analyzed, ${reportData.anomaliesFound} anomalies found`,
      { type: 'weekly_report', ...reportData },
      'reports'
    );
  };

  const updateSetting = async (key, value) => {
    const newSettings = { ...notificationSettings, [key]: value };
    await saveNotificationSettings(newSettings);
  };

  const updateQuietHours = async (quietHoursSettings) => {
    const newSettings = {
      ...notificationSettings,
      quietHours: { ...notificationSettings.quietHours, ...quietHoursSettings }
    };
    await saveNotificationSettings(newSettings);
  };

  const testNotification = async () => {
    await scheduleLocalNotification(
      '✅ Test Notification',
      'Notifications are working correctly! You\'ll receive real-time fraud alerts.',
      { type: 'test' }
    );
  };

  const clearAllNotifications = async () => {
    await Notifications.cancelAllScheduledNotificationsAsync();
    await Notifications.dismissAllNotificationsAsync();
  };

  const value = {
    // Settings
    notificationSettings,
    updateSetting,
    updateQuietHours,
    
    // Status
    isPermissionGranted,
    expoPushToken,
    
    // Actions
    requestPermissions,
    testNotification,
    clearAllNotifications,
    
    // Specific notification types
    sendFraudAlert,
    sendRiskScoreUpdate,
    sendAnomalyDetected,
    sendAIAnalysisComplete,
    sendWeeklyReport,
    
    // General notification
    scheduleLocalNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};