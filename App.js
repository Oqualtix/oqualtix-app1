import React, { useState, useEffect, useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { Provider as PaperProvider } from 'react-native-paper';
import { TouchableOpacity } from 'react-native';

// Import brand configuration
import BrandConfig from './src/config/BrandConfig';

// Import screens
import EnhancedLoginScreen from './src/screens/EnhancedLoginScreen';
import EnhancedOxulAIScreen from './src/screens/EnhancedOxulAIScreen';
import FinancialTrackingScreen from './src/screens/FinancialTrackingScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import InvestigationScreen from './src/screens/InvestigationScreen';
import PurchaseConfirmationScreen from './src/screens/PurchaseConfirmationScreen';
import UserDashboard from './src/screens/UserDashboard';
import AdminPanel from './src/screens/AdminPanel';
import BankIntegrationScreen from './src/screens/BankIntegrationScreen';
import FraudComparisonScreen from './src/screens/FraudComparisonScreen';
import FXFraudMonitoringScreen from './src/screens/FXFraudMonitoringScreen';

// Import contexts
import { EnhancedAuthProvider, useAuth } from './src/context/EnhancedAuthContext';
import { ThemeProvider, ThemeContext } from './src/context/ThemeContext';
import { NotificationProvider } from './src/context/NotificationContext';
import { BankConnectionProvider } from './src/context/BankConnectionContext';

// Import Error Boundary for crash prevention
import { ErrorBoundary } from './src/components/ErrorHandling';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Tab Navigator for main app screens
function MainTabNavigator() {
  const { user, isAdmin } = useAuth();
  const { isDarkMode } = useContext(ThemeContext);
  const colors = BrandConfig.getColors(isDarkMode);

  return (
    <Tab.Navigator
      screenOptions={({ route, navigation }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Dashboard') {
            iconName = focused ? 'grid' : 'grid-outline';
          } else if (route.name === 'Oxul AI') {
            iconName = focused ? 'brain' : 'brain-outline';
          } else if (route.name === 'Financial Tracking') {
            iconName = focused ? 'analytics' : 'analytics-outline';
          } else if (route.name === 'Admin Panel') {
            iconName = focused ? 'shield-checkmark' : 'shield-checkmark-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.cardBackground,
          borderTopColor: colors.border,
        },
        headerStyle: {
          backgroundColor: colors.primary,
        },
        headerTintColor: colors.secondary,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerRight: () => (
          <TouchableOpacity
            onPress={() => navigation.navigate('Settings')}
            style={{ marginRight: 15 }}
          >
            <Ionicons
              name="settings-outline"
              size={24}
              color={colors.secondary}
            />
          </TouchableOpacity>
        ),
      })}
    >
      <Tab.Screen name="Dashboard" component={UserDashboard} />
      <Tab.Screen name="Oxul AI" component={EnhancedOxulAIScreen} />
      <Tab.Screen name="Financial Tracking" component={FinancialTrackingScreen} />
      {isAdmin() && (
        <Tab.Screen 
          name="Admin Panel" 
          component={AdminPanel}
          options={{
            tabBarBadge: '●',
            tabBarBadgeStyle: { backgroundColor: '#FF9500', fontSize: 8 }
          }}
        />
      )}
    </Tab.Navigator>
  );
}

// Main App Navigator
function AppNavigator() {
  const { user, loading } = useAuth();
  const { isDarkMode } = useContext(ThemeContext);
  const colors = BrandConfig.getColors(isDarkMode);

  if (loading) {
    return null; // Or a loading screen component
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <>
          <Stack.Screen name="MainTabs" component={MainTabNavigator} />
          <Stack.Screen 
            name="Settings" 
            component={SettingsScreen}
            options={{
              headerShown: true,
              title: 'Settings',
              headerStyle: {
                backgroundColor: colors.primary,
              },
              headerTintColor: colors.secondary,
              headerTitleStyle: {
                fontWeight: 'bold',
              },
            }}
          />
          <Stack.Screen 
            name="Investigation" 
            component={InvestigationScreen}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen 
            name="PurchaseConfirmation" 
            component={PurchaseConfirmationScreen}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen 
            name="BankIntegration" 
            component={BankIntegrationScreen}
            options={{
              headerShown: true,
              title: 'Bank Connections',
              headerStyle: {
                backgroundColor: colors.primary,
              },
              headerTintColor: colors.secondary,
              headerTitleStyle: {
                fontWeight: 'bold',
              },
            }}
          />
          <Stack.Screen 
            name="FraudComparison" 
            component={FraudComparisonScreen}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen 
            name="FXFraudMonitoring" 
            component={FXFraudMonitoringScreen}
            options={{
              headerShown: false,
            }}
          />
        </>
      ) : (
        <Stack.Screen name="Login" component={EnhancedLoginScreen} />
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <PaperProvider>
        <ThemeProvider>
          <NotificationProvider>
            <BankConnectionProvider>
              <EnhancedAuthProvider>
                <NavigationContainer>
                  <AppNavigator />
                  <StatusBar style="auto" />
                </NavigationContainer>
              </EnhancedAuthProvider>
            </BankConnectionProvider>
          </NotificationProvider>
        </ThemeProvider>
      </PaperProvider>
    </ErrorBoundary>
  );
}