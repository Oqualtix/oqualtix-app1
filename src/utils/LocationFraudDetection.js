/**
 * Location-Based Fraud Detection
 * Analyzes transaction locations against user patterns to detect fraud
 */

import * as Location from 'expo-location';

export class LocationFraudDetection {
  
  // Location fraud patterns and thresholds
  static get LOCATION_PATTERNS() {
    return {
      IMPOSSIBLE_TRAVEL: 'impossible_travel_time',
      UNUSUAL_LOCATION: 'unusual_geographic_location',
      HIGH_RISK_AREA: 'high_risk_geographic_area',
      MULTIPLE_LOCATIONS: 'multiple_simultaneous_locations',
      FOREIGN_TRANSACTION: 'foreign_country_transaction',
      VELOCITY_ANOMALY: 'location_velocity_anomaly',
      GEOFENCE_VIOLATION: 'geofence_boundary_violation'
    };
  }

  // High-risk locations and countries
  static get HIGH_RISK_LOCATIONS() {
    return {
      COUNTRIES: [
        'Unknown', 'Offshore', 'Anonymous', 'VPN Location'
      ],
      CITIES: [
        'Unknown City', 'Unregistered Location', 'Virtual Location'
      ]
    };
  }

  // Maximum realistic travel speeds (km/h)
  static get TRAVEL_SPEEDS() {
    return {
      WALKING: 5,
      DRIVING: 120,
      COMMERCIAL_FLIGHT: 900,
      PRIVATE_JET: 1000
    };
  }

  /**
   * Initialize location services and get user's current location
   */
  static async initializeLocationServices() {
    try {
      // Request location permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Location permission not granted');
        return { success: false, error: 'Permission denied' };
      }

      // Get current location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeout: 10000
      });

      return {
        success: true,
        location: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          accuracy: location.coords.accuracy,
          timestamp: new Date(location.timestamp).toISOString()
        }
      };
    } catch (error) {
      console.error('Location initialization error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Analyze transaction location for fraud indicators
   */
  static analyzeTransactionLocation(transaction, userLocationHistory = [], userProfile = {}) {
    const anomalies = [];
    const transactionLocation = this.extractLocationFromTransaction(transaction);
    
    if (!transactionLocation) {
      // No location data available - this itself might be suspicious for certain transaction types
      if (Math.abs(transaction.amount) > 1000) {
        anomalies.push({
          type: 'Missing Location Data',
          severity: 'MEDIUM',
          score: 60,
          details: `Large transaction (${Math.abs(transaction.amount).toLocaleString()}) without location verification`,
          pattern: 'missing_location_data',
          recommendation: 'Verify transaction authenticity through alternative means'
        });
      }
      return { anomalies, locationRiskScore: 30, hasLocationData: false };
    }

    // 1. Impossible Travel Detection
    const travelAnalysis = this.detectImpossibleTravel(transaction, transactionLocation, userLocationHistory);
    if (travelAnalysis.suspicious) {
      anomalies.push({
        type: 'Impossible Travel Pattern',
        severity: 'CRITICAL',
        score: 95,
        details: travelAnalysis.details,
        pattern: this.LOCATION_PATTERNS.IMPOSSIBLE_TRAVEL,
        travelData: travelAnalysis.data
      });
    }

    // 2. Unusual Location Analysis
    const locationAnalysis = this.analyzeUnusualLocation(transactionLocation, userLocationHistory, userProfile);
    if (locationAnalysis.suspicious) {
      anomalies.push({
        type: 'Unusual Geographic Location',
        severity: locationAnalysis.severity,
        score: locationAnalysis.score,
        details: locationAnalysis.details,
        pattern: this.LOCATION_PATTERNS.UNUSUAL_LOCATION,
        locationData: locationAnalysis.data
      });
    }

    // 3. High-Risk Area Detection
    const riskAreaAnalysis = this.detectHighRiskArea(transactionLocation);
    if (riskAreaAnalysis.suspicious) {
      anomalies.push({
        type: 'High-Risk Geographic Area',
        severity: 'HIGH',
        score: 85,
        details: riskAreaAnalysis.details,
        pattern: this.LOCATION_PATTERNS.HIGH_RISK_AREA,
        riskFactors: riskAreaAnalysis.riskFactors
      });
    }

    // 4. Multiple Simultaneous Locations
    const simultaneousAnalysis = this.detectSimultaneousLocations(transaction, userLocationHistory);
    if (simultaneousAnalysis.suspicious) {
      anomalies.push({
        type: 'Multiple Simultaneous Locations',
        severity: 'HIGH',
        score: 88,
        details: simultaneousAnalysis.details,
        pattern: this.LOCATION_PATTERNS.MULTIPLE_LOCATIONS
      });
    }

    // 5. Foreign Transaction Analysis
    const foreignAnalysis = this.analyzeForeignTransaction(transactionLocation, userProfile);
    if (foreignAnalysis.suspicious) {
      anomalies.push({
        type: 'Unusual Foreign Transaction',
        severity: foreignAnalysis.severity,
        score: foreignAnalysis.score,
        details: foreignAnalysis.details,
        pattern: this.LOCATION_PATTERNS.FOREIGN_TRANSACTION
      });
    }

    // 6. Location Velocity Analysis
    const velocityAnalysis = this.analyzeLocationVelocity(transaction, userLocationHistory);
    if (velocityAnalysis.suspicious) {
      anomalies.push({
        type: 'Location Velocity Anomaly',
        severity: 'MEDIUM',
        score: 70,
        details: velocityAnalysis.details,
        pattern: this.LOCATION_PATTERNS.VELOCITY_ANOMALY,
        velocity: velocityAnalysis.velocity
      });
    }

    // Calculate location risk score
    const locationRiskScore = this.calculateLocationRiskScore(anomalies, transactionLocation, userProfile);

    return {
      anomalies,
      locationRiskScore,
      hasLocationData: true,
      transactionLocation,
      analysisTimestamp: new Date().toISOString()
    };
  }

  /**
   * Extract location information from transaction
   */
  static extractLocationFromTransaction(transaction) {
    // In real implementation, this would extract actual location data
    // For demo purposes, we'll simulate location data based on transaction details
    
    const locationKeywords = {
      'international': { country: 'Foreign', city: 'International Location', latitude: 0, longitude: 0 },
      'foreign': { country: 'Foreign', city: 'Foreign Location', latitude: 0, longitude: 0 },
      'atm': { country: 'USA', city: 'Local City', latitude: 40.7128, longitude: -74.0060 },
      'online': { country: 'USA', city: 'Online', latitude: 39.8283, longitude: -98.5795 },
      'amazon': { country: 'USA', city: 'Online', latitude: 47.6062, longitude: -122.3321 },
      'shell': { country: 'USA', city: 'Local City', latitude: 40.7589, longitude: -73.9851 }
    };

    const description = transaction.description.toLowerCase();
    const merchant = transaction.merchant.toLowerCase();
    
    for (const [keyword, location] of Object.entries(locationKeywords)) {
      if (description.includes(keyword) || merchant.includes(keyword)) {
        return {
          ...location,
          accuracy: 100,
          timestamp: transaction.date,
          source: 'transaction_analysis'
        };
      }
    }

    // Default location for unspecified transactions
    return {
      country: 'USA',
      city: 'Local Area',
      latitude: 40.7128 + (Math.random() - 0.5) * 0.1, // NYC area with variance
      longitude: -74.0060 + (Math.random() - 0.5) * 0.1,
      accuracy: 50,
      timestamp: transaction.date,
      source: 'estimated'
    };
  }

  /**
   * Detect impossible travel between locations
   */
  static detectImpossibleTravel(transaction, currentLocation, locationHistory) {
    if (locationHistory.length === 0) {
      return { suspicious: false };
    }

    const lastLocation = locationHistory[0];
    const timeDiff = (new Date(transaction.date) - new Date(lastLocation.timestamp)) / (1000 * 60 * 60); // hours
    
    if (timeDiff <= 0.1) { // Less than 6 minutes
      return { suspicious: false };
    }

    const distance = this.calculateDistance(
      lastLocation.latitude, lastLocation.longitude,
      currentLocation.latitude, currentLocation.longitude
    );

    const requiredSpeed = distance / timeDiff; // km/h
    
    // Check if travel speed is humanly possible
    if (requiredSpeed > this.TRAVEL_SPEEDS.COMMERCIAL_FLIGHT) {
      return {
        suspicious: true,
        details: `Impossible travel: ${distance.toFixed(0)}km in ${timeDiff.toFixed(1)}h (${requiredSpeed.toFixed(0)}km/h)`,
        data: {
          distance,
          timeHours: timeDiff,
          requiredSpeed,
          maxRealisticSpeed: this.TRAVEL_SPEEDS.COMMERCIAL_FLIGHT,
          fromLocation: lastLocation,
          toLocation: currentLocation
        }
      };
    }

    return { suspicious: false };
  }

  /**
   * Analyze if location is unusual for user
   */
  static analyzeUnusualLocation(transactionLocation, locationHistory, userProfile) {
    // Calculate user's typical location radius
    const typicalLocations = locationHistory.slice(0, 50); // Last 50 locations
    
    if (typicalLocations.length === 0) {
      return { suspicious: false };
    }

    // Calculate center point of user's typical locations
    const centerLat = typicalLocations.reduce((sum, loc) => sum + loc.latitude, 0) / typicalLocations.length;
    const centerLon = typicalLocations.reduce((sum, loc) => sum + loc.longitude, 0) / typicalLocations.length;

    // Calculate typical radius
    const distances = typicalLocations.map(loc => 
      this.calculateDistance(centerLat, centerLon, loc.latitude, loc.longitude)
    );
    const avgDistance = distances.reduce((a, b) => a + b, 0) / distances.length;
    const maxDistance = Math.max(...distances);

    // Check if current transaction is outside typical area
    const currentDistance = this.calculateDistance(
      centerLat, centerLon, 
      transactionLocation.latitude, transactionLocation.longitude
    );

    // Only flag if transaction is more than 250 miles (402.34 km) from center
    // OR if it's an abnormal purchase pattern (high amount + unusual merchant)
    const milesFromCenter = currentDistance * 0.621371; // Convert km to miles
    const isDistanceUnusual = currentDistance > 402.34; // 250 miles = 402.34 km
    const isAbnormalPurchase = this.isAbnormalPurchasePattern(transactionLocation.transaction || {});
    
    if (isDistanceUnusual || isAbnormalPurchase) {
      const severity = currentDistance > 804.67 ? 'HIGH' : 'MEDIUM'; // 500 miles = HIGH
      const score = isDistanceUnusual ? 
        (currentDistance > 804.67 ? 85 : 70) : 
        (isAbnormalPurchase ? 75 : 65);

      return {
        suspicious: true,
        severity,
        score,
        details: isDistanceUnusual ? 
          `Transaction ${milesFromCenter.toFixed(1)} miles from typical area (>250 mile threshold)` :
          `Abnormal purchase pattern detected at location`,
        data: {
          distanceFromCenter: currentDistance,
          milesFromCenter: milesFromCenter,
          typicalRadius: avgDistance,
          maxPreviousDistance: maxDistance,
          isDistanceFlag: isDistanceUnusual,
          isPatternFlag: isAbnormalPurchase
        }
      };
    }

    return { suspicious: false };
  }

  // Helper method to detect abnormal purchase patterns
  static isAbnormalPurchasePattern(transaction) {
    const amount = parseFloat(transaction.amount || 0);
    const merchant = (transaction.merchant || '').toLowerCase();
    
    // Flag high-value transactions (>$5000) at unusual merchants
    const isHighValue = amount > 5000;
    const unusualMerchants = ['cash advance', 'money transfer', 'crypto', 'bitcoin', 'gambling', 'casino'];
    const isUnusualMerchant = unusualMerchants.some(term => merchant.includes(term));
    
    // Flag late night transactions (11PM - 5AM) over $1000
    const transactionHour = new Date(transaction.timestamp || Date.now()).getHours();
    const isLateNight = (transactionHour >= 23 || transactionHour <= 5) && amount > 1000;
    
    return (isHighValue && isUnusualMerchant) || isLateNight;
  }

  /**
   * Detect high-risk geographic areas
   */
  static detectHighRiskArea(location) {
    const riskFactors = [];

    // Check for high-risk countries
    if (this.HIGH_RISK_LOCATIONS.COUNTRIES.includes(location.country)) {
      riskFactors.push('High-risk country');
    }

    // Check for high-risk cities
    if (this.HIGH_RISK_LOCATIONS.CITIES.includes(location.city)) {
      riskFactors.push('High-risk city');
    }

    // Check for suspicious location names
    const suspiciousKeywords = ['unknown', 'anonymous', 'vpn', 'proxy', 'offshore'];
    const locationString = `${location.country} ${location.city}`.toLowerCase();
    
    suspiciousKeywords.forEach(keyword => {
      if (locationString.includes(keyword)) {
        riskFactors.push(`Suspicious location identifier: ${keyword}`);
      }
    });

    if (riskFactors.length > 0) {
      return {
        suspicious: true,
        details: `Transaction from high-risk area: ${location.city}, ${location.country}`,
        riskFactors
      };
    }

    return { suspicious: false };
  }

  /**
   * Detect multiple simultaneous locations
   */
  static detectSimultaneousLocations(transaction, locationHistory) {
    // Check for transactions within a short time window from different locations
    const timeWindow = 30; // 30 minutes
    const transactionTime = new Date(transaction.date);
    
    const recentLocations = locationHistory.filter(loc => {
      const locTime = new Date(loc.timestamp);
      const timeDiff = Math.abs(transactionTime - locTime) / (1000 * 60); // minutes
      return timeDiff <= timeWindow;
    });

    if (recentLocations.length === 0) {
      return { suspicious: false };
    }

    // Check if there are significantly different locations in the time window
    const currentLat = transaction.latitude || 0;
    const currentLon = transaction.longitude || 0;

    for (const loc of recentLocations) {
      const distance = this.calculateDistance(currentLat, currentLon, loc.latitude, loc.longitude);
      if (distance > 10) { // More than 10km apart
        return {
          suspicious: true,
          details: `Multiple locations within ${timeWindow} minutes: ${distance.toFixed(0)}km apart`
        };
      }
    }

    return { suspicious: false };
  }

  /**
   * Analyze foreign transactions
   */
  static analyzeForeignTransaction(location, userProfile) {
    const userCountry = userProfile.country || 'USA';
    
    if (location.country !== userCountry && location.country !== 'USA') {
      // Check if user has history of international transactions
      const hasInternationalHistory = userProfile.hasInternationalHistory || false;
      
      if (!hasInternationalHistory) {
        return {
          suspicious: true,
          severity: 'HIGH',
          score: 85,
          details: `First-time international transaction in ${location.country}`
        };
      } else {
        return {
          suspicious: true,
          severity: 'MEDIUM',
          score: 60,
          details: `International transaction in ${location.country}`
        };
      }
    }

    return { suspicious: false };
  }

  /**
   * Analyze location velocity patterns
   */
  static analyzeLocationVelocity(transaction, locationHistory) {
    if (locationHistory.length < 3) {
      return { suspicious: false };
    }

    // Analyze recent movement patterns
    const recentLocations = locationHistory.slice(0, 5);
    const velocities = [];

    for (let i = 0; i < recentLocations.length - 1; i++) {
      const loc1 = recentLocations[i];
      const loc2 = recentLocations[i + 1];
      
      const distance = this.calculateDistance(loc1.latitude, loc1.longitude, loc2.latitude, loc2.longitude);
      const timeDiff = (new Date(loc1.timestamp) - new Date(loc2.timestamp)) / (1000 * 60 * 60); // hours
      
      if (timeDiff > 0) {
        velocities.push(distance / timeDiff);
      }
    }

    if (velocities.length === 0) {
      return { suspicious: false };
    }

    const avgVelocity = velocities.reduce((a, b) => a + b, 0) / velocities.length;
    const maxVelocity = Math.max(...velocities);

    // Check for unusually high velocity patterns
    if (maxVelocity > this.TRAVEL_SPEEDS.DRIVING * 2 && avgVelocity > this.TRAVEL_SPEEDS.DRIVING) {
      return {
        suspicious: true,
        details: `High location velocity pattern detected (avg: ${avgVelocity.toFixed(0)}km/h, max: ${maxVelocity.toFixed(0)}km/h)`,
        velocity: { average: avgVelocity, maximum: maxVelocity }
      };
    }

    return { suspicious: false };
  }

  /**
   * Calculate location risk score
   */
  static calculateLocationRiskScore(anomalies, location, userProfile) {
    if (anomalies.length === 0) return 0;

    const baseScore = anomalies.reduce((sum, a) => sum + a.score, 0) / anomalies.length;
    
    // Apply location-specific multipliers
    let multiplier = 1.0;
    
    if (location.country !== (userProfile.country || 'USA')) {
      multiplier += 0.2; // International transaction
    }
    
    if (location.source === 'estimated') {
      multiplier += 0.1; // Uncertain location data
    }

    return Math.min(100, Math.round(baseScore * multiplier));
  }

  /**
   * Calculate distance between two coordinates using Haversine formula
   */
  static calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return distance;
  }

  /**
   * Add user location to history
   */
  static addLocationToHistory(location, maxHistorySize = 100) {
    // This would integrate with AsyncStorage to persist location history
    return {
      latitude: location.latitude,
      longitude: location.longitude,
      country: location.country || 'USA',
      city: location.city || 'Unknown',
      accuracy: location.accuracy || 50,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Generate location fraud summary
   */
  static generateLocationSummary(transactions) {
    const locationAnalyses = transactions
      .map(t => t.locationAnalysis)
      .filter(Boolean);

    const totalAnalyzed = locationAnalyses.length;
    const withLocationData = locationAnalyses.filter(a => a.hasLocationData).length;
    const suspiciousLocations = locationAnalyses.filter(a => a.locationRiskScore >= 60).length;
    
    const patternCounts = {};
    locationAnalyses.forEach(analysis => {
      analysis.anomalies.forEach(anomaly => {
        patternCounts[anomaly.pattern] = (patternCounts[anomaly.pattern] || 0) + 1;
      });
    });

    const averageRiskScore = locationAnalyses.length > 0 ?
      Math.round(locationAnalyses.reduce((sum, a) => sum + a.locationRiskScore, 0) / locationAnalyses.length) : 0;

    return {
      totalTransactionsAnalyzed: totalAnalyzed,
      transactionsWithLocationData: withLocationData,
      locationDataCoverage: totalAnalyzed > 0 ? ((withLocationData / totalAnalyzed) * 100).toFixed(1) : 0,
      suspiciousLocations,
      averageLocationRiskScore: averageRiskScore,
      detectedPatterns: Object.entries(patternCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5),
      riskLevel: suspiciousLocations > totalAnalyzed * 0.3 ? 'HIGH' : 
                 suspiciousLocations > totalAnalyzed * 0.1 ? 'MEDIUM' : 'LOW',
      lastAnalysis: new Date().toISOString()
    };
  }
}

export default LocationFraudDetection;