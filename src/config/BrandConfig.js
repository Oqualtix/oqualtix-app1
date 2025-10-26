// Brand Configuration for Oqualtix
// Updated with custom blue and white color scheme

export const BrandConfig = {
  // Company Information
  company: {
    name: 'Oqualtix',
    fullName: 'Oqualtix Forensics',
    tagline: 'AI-Powered Financial Forensics Platform',
    email: 'Oqualtix@outlook.com',
    website: 'https://github.com/Oqualtix/oqualtix-app1',
    support: 'Contact Oqualtix@outlook.com for assistance.'
  },

  // AI Assistant Configuration
  ai: {
    name: 'Oxul',
    fullName: 'Oxul AI',
    role: 'Advanced AI Forensic Accountant',
    greeting: '🤖 Hello! I\'m Oxul, your advanced AI forensic accountant powered by real machine learning models. I can analyze financial records with neural networks, detect fraud patterns using NLP, and provide intelligent investigation guidance. How can I assist you today?'
  },

  // Color Scheme - Blue and White Theme
  colors: {
    // Primary Colors
    primary: '#0000FF',        // Pure Blue (your specified color)
    primaryLight: '#4169E1',   // Royal Blue (lighter variant)
    primaryDark: '#00008B',    // Dark Blue (darker variant)
    
    // Secondary Colors  
    secondary: '#FFFFFF',      // Pure White (your specified color)
    secondaryLight: '#F8F9FA', // Very light gray-white
    secondaryDark: '#E9ECEF',  // Light gray
    
    // Accent Colors (blue variants)
    accent: '#1E90FF',         // Dodger Blue
    accentLight: '#87CEEB',    // Sky Blue
    accentDark: '#0066CC',     // Strong Blue
    
    // Status Colors (blue theme)
    success: '#0066FF',        // Blue success
    warning: '#4169E1',        // Royal blue warning  
    error: '#FF0066',          // Pink-red error (contrast with blue)
    info: '#87CEEB',           // Light blue info
    
    // Background Colors
    background: '#FFFFFF',     // White background
    backgroundSecondary: '#F0F8FF', // Alice Blue
    backgroundTertiary: '#E6F3FF',  // Very light blue
    
    // Text Colors
    textPrimary: '#000080',    // Navy blue text
    textSecondary: '#4169E1',  // Royal blue text
    textMuted: '#6B7280',      // Gray text
    textWhite: '#FFFFFF',      // White text
    
    // Border Colors
    border: '#B0C4DE',         // Light steel blue
    borderLight: '#E0E6ED',    // Very light border
    borderDark: '#4682B4',     // Steel blue
    
    // Card and Surface Colors
    surface: '#FFFFFF',        // White surfaces
    surfaceSecondary: '#F0F8FF', // Light blue surfaces
    overlay: 'rgba(0, 0, 255, 0.1)', // Blue overlay
    
    // Button Colors
    buttonPrimary: '#0000FF',  // Blue buttons
    buttonSecondary: '#FFFFFF', // White buttons
    buttonText: '#FFFFFF',     // White text on blue
    buttonTextSecondary: '#0000FF', // Blue text on white
    
    // Navigation Colors
    tabActive: '#0000FF',      // Blue active tab
    tabInactive: '#B0C4DE',    // Light blue inactive
    headerBackground: '#0000FF', // Blue header
    headerText: '#FFFFFF'      // White header text
  },

  // Typography
  typography: {
    fontFamily: 'System',
    sizes: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 20,
      xxl: 24,
      xxxl: 32
    },
    weights: {
      light: '300',
      regular: '400',
      medium: '500',
      semibold: '600',
      bold: '700'
    }
  },

  // Spacing
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48
  },

  // Border Radius
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999
  }
};

export default BrandConfig;