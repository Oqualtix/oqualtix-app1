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
        <Text style={styles.title}>🤖 Customize Oxul&apos;s Personality</Text>
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
    backgroundColor: BrandConfig.colors.background,
    flex: 1,
  },
  customButton: {
    alignItems: 'center',
    backgroundColor: BrandConfig.colors.primary,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    margin: 20,
    padding: 16,
  },
  customButtonText: {
    color: BrandConfig.colors.textWhite,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  expertiseArea: {
    color: BrandConfig.colors.textMuted,
    fontSize: 12,
    marginBottom: 4,
    textTransform: 'capitalize',
  },
  expertiseBar: {
    alignItems: 'center',
    borderRadius: 12,
    height: 24,
    justifyContent: 'center',
  },
  expertiseContainer: {
    marginTop: 8,
  },
  expertiseGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  expertiseItem: {
    marginBottom: 8,
    marginRight: '2%',
    width: '48%',
  },
  expertisePercent: {
    color: BrandConfig.colors.textWhite,
    fontSize: 11,
    fontWeight: 'bold',
  },
  expertiseTitle: {
    color: BrandConfig.colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  header: {
    backgroundColor: BrandConfig.colors.primary,
    padding: 20,
  },
  infoSection: {
    backgroundColor: BrandConfig.colors.backgroundSecondary,
    borderRadius: 12,
    margin: 20,
    padding: 16,
  },
  infoText: {
    color: BrandConfig.colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  infoTitle: {
    color: BrandConfig.colors.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  presetCard: {
    backgroundColor: BrandConfig.colors.surface,
    borderColor: BrandConfig.colors.borderLight,
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 16,
    padding: 16,
  },
  presetDescription: {
    color: BrandConfig.colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  presetHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  presetName: {
    color: BrandConfig.colors.textPrimary,
    fontSize: 18,
    fontWeight: 'bold',
  },
  presetsSection: {
    padding: 20,
  },
  sectionTitle: {
    color: BrandConfig.colors.textPrimary,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  selectedPreset: {
    backgroundColor: BrandConfig.colors.backgroundSecondary,
    borderColor: BrandConfig.colors.primary,
  },
  subtitle: {
    color: BrandConfig.colors.textWhite,
    fontSize: 16,
    opacity: 0.9,
  },
  title: {
    color: BrandConfig.colors.textWhite,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  trait: {
    flex: 1,
    marginRight: 16,
  },
  traitLabel: {
    color: BrandConfig.colors.textMuted,
    fontSize: 12,
    marginBottom: 4,
  },
  traitValue: {
    color: BrandConfig.colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  traitsContainer: {
    marginBottom: 16,
  },
  traitsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  traitsTitle: {
    color: BrandConfig.colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
});

export default PersonalityCustomizer;