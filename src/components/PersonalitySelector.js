import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BrandConfig from '../config/BrandConfig';

const PersonalitySelector = ({ visible, onClose, onSelectPersonality, currentPersonality }) => {
  const [selectedPersonality, setSelectedPersonality] = useState(currentPersonality || 'professional');

  const personalities = [
    {
      id: 'professional',
      name: 'Professional Forensic Expert',
      icon: 'business-outline',
      description: 'Formal, detailed, and methodical approach with technical language',
      greeting: '🤖 Good day. I am Oxul, your certified forensic accounting AI. I provide comprehensive financial analysis using advanced algorithms and regulatory compliance standards. How may I assist with your investigation today?',
      style: {
        tone: 'Formal and authoritative',
        language: 'Technical terminology',
        responses: 'Detailed with citations',
      }
    },
    {
      id: 'friendly',
      name: 'Friendly Financial Assistant',
      icon: 'happy-outline',
      description: 'Approachable and conversational while maintaining expertise',
      greeting: '👋 Hi there! I\'m Oxul, your AI forensic accountant. I love helping solve financial puzzles and catching fraud patterns! Think of me as your detective partner - what financial mystery can we solve together today?',
      style: {
        tone: 'Warm and approachable',
        language: 'Clear, everyday terms',
        responses: 'Helpful with examples',
      }
    },
    {
      id: 'analytical',
      name: 'Data-Driven Analyst',
      icon: 'analytics-outline',
      description: 'Numbers-focused with statistical insights and quantitative analysis',
      greeting: '📊 Hello. I&apos;m Oxul, your AI forensic analyst specializing in quantitative financial investigations. I process data patterns, statistical anomalies, and risk metrics. Ready to dive into the numbers?',
      style: {
        tone: 'Precise and data-focused',
        language: 'Statistical terminology',
        responses: 'Charts, graphs, and metrics',
      }
    },
    {
      id: 'investigative',
      name: 'Detective Mode',
      icon: 'search-outline',
      description: 'Sharp, inquisitive, and detail-oriented like a financial detective',
      greeting: '🔍 Greetings. I\'m Oxul, your AI financial detective. I specialize in following money trails, uncovering hidden patterns, and solving complex fraud cases. What case are we investigating today?',
      style: {
        tone: 'Curious and methodical',
        language: 'Investigation terminology',
        responses: 'Step-by-step analysis',
      }
    },
    {
      id: 'adaptive',
      name: 'Adaptive Learning AI',
      icon: 'refresh-outline',
      description: 'Learns from your preferences and adapts communication style',
      greeting: '🧠 Hello! I\'m Oxul, your adaptive AI forensic accountant. I learn from our interactions to better serve your investigation style. The more we work together, the more I understand your preferences!',
      style: {
        tone: 'Evolving and personalized',
        language: 'Matches your style',
        responses: 'Customized to your needs',
      }
    },
    {
      id: 'custom',
      name: 'Custom Personality',
      icon: 'construct-outline',
      description: 'Create your own unique AI personality and communication style',
      greeting: 'Define your own greeting and personality traits...',
      style: {
        tone: 'User-defined',
        language: 'User-defined',
        responses: 'User-defined',
      }
    }
  ];

  const handleSelectPersonality = (personality) => {
    setSelectedPersonality(personality.id);
  };

  const handleConfirm = () => {
    const personality = personalities.find(p => p.id === selectedPersonality);
    onSelectPersonality(personality);
    onClose();
    Alert.alert(
      'Personality Updated!',
      `Oxul is now using the "${personality.name}" personality. Try starting a new conversation to see the changes!`,
      [{ text: 'Got it!' }]
    );
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={BrandConfig.colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>Customize Oxul&apos;s Personality</Text>
          <TouchableOpacity onPress={handleConfirm} style={styles.confirmButton}>
            <Text style={styles.confirmText}>Apply</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.subtitle}>
            Choose how Oxul communicates with you. Each personality affects response style, 
            language complexity, and interaction approach.
          </Text>

          {personalities.map((personality) => (
            <TouchableOpacity
              key={personality.id}
              style={[
                styles.personalityCard,
                selectedPersonality === personality.id && styles.selectedCard
              ]}
              onPress={() => handleSelectPersonality(personality)}
            >
              <View style={styles.cardHeader}>
                <View style={styles.iconContainer}>
                  <Ionicons 
                    name={personality.icon} 
                    size={24} 
                    color={selectedPersonality === personality.id ? BrandConfig.colors.primary : BrandConfig.colors.textSecondary} 
                  />
                </View>
                <View style={styles.cardTitle}>
                  <Text style={[
                    styles.personalityName,
                    selectedPersonality === personality.id && styles.selectedText
                  ]}>
                    {personality.name}
                  </Text>
                  <Text style={styles.personalityDescription}>
                    {personality.description}
                  </Text>
                </View>
                {selectedPersonality === personality.id && (
                  <Ionicons name="checkmark-circle" size={24} color={BrandConfig.colors.primary} />
                )}
              </View>

              <View style={styles.greetingContainer}>
                <Text style={styles.greetingLabel}>Sample Greeting:</Text>
                <Text style={styles.greetingText}>{personality.greeting}</Text>
              </View>

              <View style={styles.styleContainer}>
                <Text style={styles.styleLabel}>Communication Style:</Text>
                <View style={styles.styleRow}>
                  <Text style={styles.styleItem}>• Tone: {personality.style.tone}</Text>
                  <Text style={styles.styleItem}>• Language: {personality.style.language}</Text>
                  <Text style={styles.styleItem}>• Responses: {personality.style.responses}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}

          <View style={styles.tipContainer}>
            <Ionicons name="bulb-outline" size={20} color={BrandConfig.colors.accent} />
            <Text style={styles.tipText}>
              💡 Tip: You can change Oxul&apos;s personality anytime from the Settings menu. 
              Each personality maintains the same AI capabilities but adjusts communication style.
            </Text>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  cardHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 12,
  },
  cardTitle: {
    flex: 1,
  },
  closeButton: {
    padding: 8,
  },
  confirmButton: {
    backgroundColor: BrandConfig.colors.primary,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  confirmText: {
    color: BrandConfig.colors.textWhite,
    fontWeight: '600',
  },
  container: {
    backgroundColor: BrandConfig.colors.background,
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  greetingContainer: {
    marginBottom: 12,
  },
  greetingLabel: {
    color: BrandConfig.colors.textPrimary,
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
  },
  greetingText: {
    backgroundColor: BrandConfig.colors.backgroundSecondary,
    borderRadius: 8,
    color: BrandConfig.colors.textSecondary,
    fontSize: 14,
    fontStyle: 'italic',
    lineHeight: 20,
    padding: 12,
  },
  header: {
    alignItems: 'center',
    backgroundColor: BrandConfig.colors.surface,
    borderBottomColor: BrandConfig.colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  iconContainer: {
    alignItems: 'center',
    backgroundColor: BrandConfig.colors.backgroundSecondary,
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    marginRight: 12,
    width: 40,
  },
  personalityCard: {
    backgroundColor: BrandConfig.colors.surface,
    borderColor: BrandConfig.colors.border,
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 16,
    padding: 16,
  },
  personalityDescription: {
    color: BrandConfig.colors.textSecondary,
    fontSize: 14,
    lineHeight: 18,
  },
  personalityName: {
    color: BrandConfig.colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  selectedCard: {
    backgroundColor: BrandConfig.colors.backgroundTertiary,
    borderColor: BrandConfig.colors.primary,
  },
  selectedText: {
    color: BrandConfig.colors.primary,
  },
  styleContainer: {
    marginTop: 8,
  },
  styleItem: {
    color: BrandConfig.colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  styleLabel: {
    color: BrandConfig.colors.textPrimary,
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
  },
  styleRow: {
    gap: 4,
  },
  subtitle: {
    color: BrandConfig.colors.textSecondary,
    fontSize: 16,
    lineHeight: 22,
    marginVertical: 20,
  },
  tipContainer: {
    alignItems: 'flex-start',
    backgroundColor: BrandConfig.colors.backgroundSecondary,
    borderRadius: 12,
    flexDirection: 'row',
    gap: 12,
    marginVertical: 20,
    padding: 16,
  },
  tipText: {
    color: BrandConfig.colors.textSecondary,
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  title: {
    color: BrandConfig.colors.textPrimary,
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default PersonalitySelector;