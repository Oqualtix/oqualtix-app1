import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BrandConfig from '../config/BrandConfig';
import { PersonalityPresets } from '../config/PersonalityConfig';

const PersonalityCustomizer = ({ onPersonalitySelected }) => {
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [customizing, setCustomizing] = useState(false);

  const presets = Object.entries(PersonalityPresets);

  const handlePresetSelection = (presetKey, preset) => {
    setSelectedPreset(presetKey);
    Alert.alert(
      '🤖 Personality Selected',
      `Oxul will now behave as a ${preset.name}. This will change how Oxul responds, analyzes data, and interacts with you.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Apply Changes', 
          onPress: () => onPersonalitySelected(presetKey, preset)
        }
      ]
    );
  };

  const getExpertiseColor = (level) => {
    if (level >= 0.9) return BrandConfig.colors.success;
    if (level >= 0.8) return BrandConfig.colors.primary;
    return BrandConfig.colors.accent;
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🤖 Customize Oxul's Personality</Text>
        <Text style={styles.subtitle}>
          Choose how Oxul communicates and what expertise to emphasize
        </Text>
      </View>

      <View style={styles.presetsSection}>
        <Text style={styles.sectionTitle}>Quick Personality Presets</Text>
        
        {presets.map(([key, preset]) => (
          <TouchableOpacity
            key={key}
            style={[
              styles.presetCard,
              selectedPreset === key && styles.selectedPreset
            ]}
            onPress={() => handlePresetSelection(key, preset)}
          >
            <View style={styles.presetHeader}>
              <Text style={styles.presetName}>{preset.name}</Text>
              <Ionicons 
                name={selectedPreset === key ? "checkmark-circle" : "circle-outline"} 
                size={24} 
                color={selectedPreset === key ? BrandConfig.colors.primary : BrandConfig.colors.textMuted}
              />
            </View>
            
            <Text style={styles.presetDescription}>
              {preset.responseStyle.greeting}
            </Text>

            <View style={styles.traitsContainer}>
              <Text style={styles.traitsTitle}>Communication Style:</Text>
              <View style={styles.traitsRow}>
                <View style={styles.trait}>
                  <Text style={styles.traitLabel}>Formality</Text>
                  <Text style={styles.traitValue}>{preset.traits.formality}</Text>
                </View>
                <View style={styles.trait}>
                  <Text style={styles.traitLabel}>Detail Level</Text>
                  <Text style={styles.traitValue}>{preset.traits.detailLevel}</Text>
                </View>
              </View>
            </View>

            <View style={styles.expertiseContainer}>
              <Text style={styles.expertiseTitle}>Expertise Strengths:</Text>
              <View style={styles.expertiseGrid}>
                {Object.entries(preset.expertise).map(([area, level]) => (
                  <View key={area} style={styles.expertiseItem}>
                    <Text style={styles.expertiseArea}>{area}</Text>
                    <View style={[
                      styles.expertiseBar,
                      { backgroundColor: getExpertiseColor(level) }
                    ]}>
                      <Text style={styles.expertisePercent}>
                        {Math.round(level * 100)}%
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity 
        style={styles.customButton}
        onPress={() => setCustomizing(true)}
      >
        <Ionicons name="settings" size={24} color={BrandConfig.colors.textWhite} />
        <Text style={styles.customButtonText}>
          Advanced: Build Custom Personality
        </Text>
      </TouchableOpacity>

      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>💡 How This Works</Text>
        <Text style={styles.infoText}>
          Each personality preset changes how Oxul:
          {'\n'}• Greets you and responds to questions
          {'\n'}• Analyzes financial data and fraud patterns  
          {'\n'}• Provides recommendations and insights
          {'\n'}• Expresses confidence and uncertainty
          {'\n'}• Focuses on different areas of expertise
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BrandConfig.colors.background,
  },
  header: {
    padding: 20,
    backgroundColor: BrandConfig.colors.primary,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: BrandConfig.colors.textWhite,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: BrandConfig.colors.textWhite,
    opacity: 0.9,
  },
  presetsSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: BrandConfig.colors.textPrimary,
    marginBottom: 16,
  },
  presetCard: {
    backgroundColor: BrandConfig.colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: BrandConfig.colors.borderLight,
  },
  selectedPreset: {
    borderColor: BrandConfig.colors.primary,
    backgroundColor: BrandConfig.colors.backgroundSecondary,
  },
  presetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  presetName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: BrandConfig.colors.textPrimary,
  },
  presetDescription: {
    fontSize: 14,
    color: BrandConfig.colors.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  traitsContainer: {
    marginBottom: 16,
  },
  traitsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: BrandConfig.colors.textPrimary,
    marginBottom: 8,
  },
  traitsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  trait: {
    flex: 1,
    marginRight: 16,
  },
  traitLabel: {
    fontSize: 12,
    color: BrandConfig.colors.textMuted,
    marginBottom: 4,
  },
  traitValue: {
    fontSize: 14,
    fontWeight: '500',
    color: BrandConfig.colors.textSecondary,
    textTransform: 'capitalize',
  },
  expertiseContainer: {
    marginTop: 8,
  },
  expertiseTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: BrandConfig.colors.textPrimary,
    marginBottom: 8,
  },
  expertiseGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  expertiseItem: {
    width: '48%',
    marginBottom: 8,
    marginRight: '2%',
  },
  expertiseArea: {
    fontSize: 12,
    color: BrandConfig.colors.textMuted,
    marginBottom: 4,
    textTransform: 'capitalize',
  },
  expertiseBar: {
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  expertisePercent: {
    fontSize: 11,
    fontWeight: 'bold',
    color: BrandConfig.colors.textWhite,
  },
  customButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BrandConfig.colors.primary,
    margin: 20,
    padding: 16,
    borderRadius: 12,
  },
  customButtonText: {
    color: BrandConfig.colors.textWhite,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  infoSection: {
    margin: 20,
    padding: 16,
    backgroundColor: BrandConfig.colors.backgroundSecondary,
    borderRadius: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: BrandConfig.colors.textPrimary,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: BrandConfig.colors.textSecondary,
    lineHeight: 20,
  },
});

export default PersonalityCustomizer;