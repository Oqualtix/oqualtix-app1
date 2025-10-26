// Personality Integration for Oxul AI
// This integrates the personality system with the existing AI screen

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BrandConfig from '../config/BrandConfig';
import { PersonalityPresets } from '../config/PersonalityConfig';
import PersonalityCustomizer from './PersonalityCustomizer';

const OxulPersonalityManager = ({ currentPersonality, onPersonalityChange }) => {
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [selectedPersonality, setSelectedPersonality] = useState(currentPersonality || 'seniorPartner');

  const getCurrentPersonalityInfo = () => {
    return PersonalityPresets[selectedPersonality] || PersonalityPresets.seniorPartner;
  };

  const handlePersonalitySelected = (presetKey, preset) => {
    setSelectedPersonality(presetKey);
    setShowCustomizer(false);
    onPersonalityChange?.(presetKey, preset);
  };

  const personalityInfo = getCurrentPersonalityInfo();

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.personalityButton}
        onPress={() => setShowCustomizer(true)}
      >
        <View style={styles.personalityInfo}>
          <Ionicons name="person-circle" size={24} color={BrandConfig.colors.primary} />
          <View style={styles.personalityText}>
            <Text style={styles.personalityName}>{personalityInfo.name}</Text>
            <Text style={styles.personalityMode}>AI Personality Active</Text>
          </View>
        </View>
        <Ionicons name="settings" size={20} color={BrandConfig.colors.textMuted} />
      </TouchableOpacity>

      <Modal
        visible={showCustomizer}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowCustomizer(false)}>
              <Ionicons name="close" size={28} color={BrandConfig.colors.textPrimary} />
            </TouchableOpacity>
          </View>
          <PersonalityCustomizer onPersonalitySelected={handlePersonalitySelected} />
        </View>
      </Modal>
    </View>
  );
};

// Enhanced AI Response Generator using personality
export const generatePersonalizedResponse = (prompt, personality, context = {}) => {
  const personalityConfig = PersonalityPresets[personality] || PersonalityPresets.seniorPartner;
  
  // Simulate AI response based on personality traits
  const responses = {
    greeting: personalityConfig.responseStyle.greeting,
    analysis: `${personalityConfig.responseStyle.analysisIntro} ${generateAnalysisResponse(prompt, personalityConfig)}`,
    recommendation: `${personalityConfig.responseStyle.recommendations} ${generateRecommendations(prompt, personalityConfig)}`,
    uncertainty: personalityConfig.responseStyle.uncertainty,
    farewell: personalityConfig.responseStyle.farewell
  };

  // Determine response type based on prompt
  if (prompt.toLowerCase().includes('hello') || prompt.toLowerCase().includes('hi')) {
    return responses.greeting;
  } else if (prompt.toLowerCase().includes('analyze') || prompt.toLowerCase().includes('data')) {
    return responses.analysis;
  } else if (prompt.toLowerCase().includes('recommend') || prompt.toLowerCase().includes('suggest')) {
    return responses.recommendation;
  } else {
    return generateContextualResponse(prompt, personalityConfig);
  }
};

const generateAnalysisResponse = (prompt, config) => {
  const analysisTemplates = [
    "The financial patterns show several concerning indicators that warrant investigation.",
    "Based on the data patterns, I've identified potential risk factors requiring attention.",
    "The analysis reveals anomalies consistent with fraudulent activity patterns.",
    "The transaction patterns exhibit characteristics typical of embezzlement schemes."
  ];
  
  return analysisTemplates[Math.floor(Math.random() * analysisTemplates.length)];
};

const generateRecommendations = (prompt, config) => {
  const recommendationTemplates = [
    "Implement enhanced monitoring controls for high-risk transactions.",
    "Conduct detailed review of vendor payment authorizations.",
    "Establish segregation of duties for financial approvals.",
    "Deploy automated fraud detection algorithms for continuous monitoring."
  ];
  
  return recommendationTemplates[Math.floor(Math.random() * recommendationTemplates.length)];
};

const generateContextualResponse = (prompt, config) => {
  // Generate response based on personality traits
  const { formality, confidence, detailLevel } = config.traits;
  
  let response = "Based on your inquiry, ";
  
  if (formality === 'high') {
    response += "I must respectfully analyze ";
  } else if (formality === 'medium') {
    response += "I'll examine ";
  } else {
    response += "let me look at ";
  }
  
  if (confidence === 'high') {
    response += "the evidence definitively indicates ";
  } else if (confidence === 'medium') {
    response += "the available data suggests ";
  } else {
    response += "there may be indications that ";
  }
  
  response += "further investigation would be beneficial. ";
  
  if (detailLevel === 'comprehensive') {
    response += "I recommend a thorough examination of all related financial records, vendor relationships, and approval processes to ensure complete understanding of the situation.";
  } else if (detailLevel === 'methodical') {
    response += "The next steps should include: 1) Data collection, 2) Pattern analysis, 3) Risk assessment, and 4) Recommendation development.";
  } else {
    response += "Would you like me to provide more specific guidance on this matter?";
  }
  
  return response;
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  personalityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: BrandConfig.colors.backgroundSecondary,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: BrandConfig.colors.borderLight,
  },
  personalityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  personalityText: {
    marginLeft: 12,
  },
  personalityName: {
    fontSize: 14,
    fontWeight: '600',
    color: BrandConfig.colors.textPrimary,
  },
  personalityMode: {
    fontSize: 12,
    color: BrandConfig.colors.textMuted,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: BrandConfig.colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: BrandConfig.colors.borderLight,
  },
});

export default OxulPersonalityManager;