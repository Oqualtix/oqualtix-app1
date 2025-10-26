import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const lightTheme = {
  id: 'light',
  name: 'Light Mode',
  colors: {
    // Background colors
    background: '#FFFFFF',
    backgroundSecondary: '#F0F8FF',
    backgroundTertiary: '#E6F3FF',
    surface: '#FFFFFF',
    
    // Primary colors (Oqualtix blue)
    primary: '#0000FF',
    primaryLight: '#4169E1',
    primaryDark: '#00008B',
    
    // Text colors
    textPrimary: '#000080',
    textSecondary: '#4169E1',
    textMuted: '#6B7280',
    textWhite: '#FFFFFF',
    
    // Status colors
    success: '#0066FF',
    warning: '#4169E1',
    error: '#FF0066',
    info: '#87CEEB',
    
    // Border colors
    border: '#B0C4DE',
    borderLight: '#E0E6ED',
    borderDark: '#4682B4',
    
    // Card and component colors
    cardBackground: '#FFFFFF',
    cardShadow: 'rgba(0, 0, 0, 0.1)',
    overlay: 'rgba(0, 0, 255, 0.1)',
    
    // Navigation colors
    tabActive: '#0000FF',
    tabInactive: '#B0C4DE',
    headerBackground: '#0000FF',
    headerText: '#FFFFFF',
    
    // Status bar
    statusBarStyle: 'light',
  }
};

export const darkTheme = {
  id: 'dark',
  name: 'Dark Mode',
  colors: {
    // Background colors
    background: '#1A1A1A',
    backgroundSecondary: '#2D2D2D',
    backgroundTertiary: '#404040',
    surface: '#262626',
    
    // Primary colors (brighter blue for dark mode)
    primary: '#4169E1',
    primaryLight: '#6495ED',
    primaryDark: '#0000CD',
    
    // Text colors
    textPrimary: '#FFFFFF',
    textSecondary: '#E0E0E0',
    textMuted: '#A0A0A0',
    textWhite: '#FFFFFF',
    
    // Status colors
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#F44336',
    info: '#2196F3',
    
    // Border colors
    border: '#404040',
    borderLight: '#505050',
    borderDark: '#2D2D2D',
    
    // Card and component colors
    cardBackground: '#262626',
    cardShadow: 'rgba(255, 255, 255, 0.1)',
    overlay: 'rgba(65, 105, 225, 0.2)',
    
    // Navigation colors
    tabActive: '#4169E1',
    tabInactive: '#808080',
    headerBackground: '#2D2D2D',
    headerText: '#FFFFFF',
    
    // Status bar
    statusBarStyle: 'light',
  }
};

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState(lightTheme);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('@theme_preference');
      if (savedTheme) {
        const isDark = savedTheme === 'dark';
        setIsDarkMode(isDark);
        setCurrentTheme(isDark ? darkTheme : lightTheme);
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    }
  };

  const toggleTheme = async () => {
    try {
      const newIsDarkMode = !isDarkMode;
      const newTheme = newIsDarkMode ? darkTheme : lightTheme;
      
      setIsDarkMode(newIsDarkMode);
      setCurrentTheme(newTheme);
      
      await AsyncStorage.setItem('@theme_preference', newIsDarkMode ? 'dark' : 'light');
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const value = {
    theme: currentTheme,
    isDarkMode,
    toggleTheme,
    lightTheme,
    darkTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
      <StatusBar style={currentTheme.colors.statusBarStyle} />
    </ThemeContext.Provider>
  );
};