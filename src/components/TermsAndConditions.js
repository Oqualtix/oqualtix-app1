import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { height } = Dimensions.get('window');

const TermsAndConditionsModal = ({ visible, onAccept, onDecline }) => {
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);

  const handleScroll = (event) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const isScrolledToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;
    setHasScrolledToBottom(isScrolledToBottom);
  };

  const termsContent = `
OQUALTIX FORENSICS MOBILE APPLICATION
TERMS AND CONDITIONS OF USE

EFFECTIVE DATE: January 1, 2024
LAST UPDATED: January 1, 2024

IMPORTANT NOTICE: PLEASE READ THESE TERMS AND CONDITIONS CAREFULLY BEFORE USING THE OQUALTIX APP AND AI PROGRAM.

BY DOWNLOADING, INSTALLING, ACCESSING, OR USING THE OQUALTIX FORENSICS MOBILE APPLICATION ("APP") AND ARTIFICIAL INTELLIGENCE PROGRAM ("AI PROGRAM"), YOU AGREE TO BE BOUND BY THESE TERMS AND CONDITIONS ("TERMS"). IF YOU DO NOT AGREE TO THESE TERMS, DO NOT USE THE APP OR AI PROGRAM.

1. ACCEPTANCE OF TERMS
By accessing or using the Oqualtix App and AI Program, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions, as well as our Privacy Policy. These Terms constitute a legally binding agreement between you and Oqualtix Forensics ("Company," "we," "us," or "our").

2. DESCRIPTION OF SERVICE
The Oqualtix App is a financial forensics and fraud detection application that uses artificial intelligence to analyze financial transactions, detect anomalies, and provide forensic accounting insights. The AI Program ("Oxul") assists users in identifying potential embezzlement, fraud, and suspicious financial activities.

3. USER ELIGIBILITY AND REGISTRATION
3.1 You must be at least 18 years of age to use this App.
3.2 You must provide accurate, current, and complete information during registration.
3.3 You are responsible for maintaining the confidentiality of your account credentials.
3.4 You agree to notify us immediately of any unauthorized use of your account.

4. LIMITED LIABILITY AND DISCLAIMER OF WARRANTIES
4.1 THE APP AND AI PROGRAM ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED.
4.2 WE DISCLAIM ALL WARRANTIES, INCLUDING BUT NOT LIMITED TO MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
4.3 WE DO NOT GUARANTEE THE ACCURACY, COMPLETENESS, OR RELIABILITY OF THE AI PROGRAM'S ANALYSIS OR RECOMMENDATIONS.
4.4 YOU ACKNOWLEDGE THAT THE AI PROGRAM IS A TOOL TO ASSIST IN FINANCIAL ANALYSIS AND SHOULD NOT BE THE SOLE BASIS FOR MAKING FINANCIAL OR LEGAL DECISIONS.

5. LIMITATION OF LIABILITY
5.1 TO THE MAXIMUM EXTENT PERMITTED BY LAW, OQUALTIX FORENSICS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES.
5.2 OUR TOTAL LIABILITY TO YOU FOR ANY CLAIMS ARISING FROM OR RELATED TO THE APP OR AI PROGRAM SHALL NOT EXCEED THE AMOUNT PAID BY YOU FOR THE SERVICE IN THE 12 MONTHS PRECEDING THE CLAIM.
5.3 WE SHALL NOT BE LIABLE FOR ANY LOSSES OR DAMAGES RESULTING FROM:
   a) Reliance on AI Program recommendations without independent verification
   b) Financial decisions made based solely on App analysis
   c) Technical failures, system downtime, or data loss
   d) Third-party actions or unauthorized access to your data

6. INDEMNIFICATION
You agree to indemnify, defend, and hold harmless Oqualtix Forensics, its officers, directors, employees, agents, and affiliates from and against any and all claims, liabilities, damages, losses, costs, and expenses (including reasonable attorney's fees) arising from or related to:
a) Your use or misuse of the App or AI Program
b) Your violation of these Terms
c) Your violation of any rights of another party
d) Any financial decisions made based on App analysis

7. DATA USE AND PRIVACY
7.1 Your use of financial data is governed by our Privacy Policy.
7.2 You consent to the collection, processing, and analysis of your financial data for the purpose of providing AI-powered forensic analysis.
7.3 We implement industry-standard security measures but cannot guarantee absolute security.
7.4 You are responsible for ensuring you have proper authorization to upload and analyze financial data.

8. LOCATION SERVICES AND GEOGRAPHIC DATA
8.1 LOCATION DATA COLLECTION: By using this App, you consent to the collection, processing, and storage of your precise geographic location data through GPS, network-based location services, and other location technologies.
8.2 FRAUD DETECTION PURPOSES: Your location data is used to:
   a) Detect impossible travel patterns that may indicate fraudulent card usage
   b) Identify transactions occurring outside your normal geographic area (beyond 250-mile radius)
   c) Flag purchases made in high-risk geographic locations known for financial fraud
   d) Verify the authenticity of transactions by cross-referencing location with purchase patterns
   e) Detect simultaneous transactions at different geographic locations
8.3 LOCATION HISTORY: We maintain a secure history of your location data to establish patterns of normal activity and identify geographic anomalies that may indicate account compromise.
8.4 REAL-TIME MONITORING: Location services operate in real-time to provide immediate fraud alerts when suspicious geographic activity is detected.
8.5 LOCATION ACCURACY: We may access your precise location (within a few meters) when you are actively using the App and in the background for continuous fraud monitoring.
8.6 DATA RETENTION: Location data is retained for the duration necessary to provide fraud detection services and may be anonymized for improving our fraud detection algorithms.
8.7 LOCATION PERMISSIONS: You may disable location services in your device settings, but this will significantly reduce the App's ability to detect location-based fraud and may result in missed fraudulent activity.
8.8 THIRD-PARTY SHARING: Location data may be shared with trusted fraud detection partners and financial institutions solely for the purpose of preventing fraudulent transactions.
8.9 INTERNATIONAL TRANSACTIONS: Location data helps identify potentially fraudulent international transactions and assists in compliance with cross-border financial regulations.

9. AI PROGRAM LIMITATIONS
9.1 The AI Program is designed to assist in detecting potential anomalies and patterns in financial data.
9.2 The AI Program's analysis is based on statistical models and algorithms and may produce false positives or miss actual fraud.
9.3 You acknowledge that human judgment and expertise are essential for interpreting AI Program results.
9.4 The AI Program is not a substitute for professional forensic accounting, legal advice, or financial consultation.

10. USER RESPONSIBILITIES
10.1 You are solely responsible for verifying the accuracy of any transactions flagged by the AI Program.
10.2 You must conduct proper due diligence before taking any action based on AI Program recommendations.
10.3 You agree not to use the App for any illegal, fraudulent, or malicious purposes.
10.4 You are responsible for compliance with all applicable laws and regulations in your jurisdiction.
10.5 You acknowledge that disabling location services may reduce fraud detection effectiveness and accept this risk.

11. INTELLECTUAL PROPERTY
10.1 The App, AI Program, and all related content are the exclusive property of Oqualtix Forensics.
10.2 You are granted a limited, non-exclusive, non-transferable license to use the App for its intended purpose.
10.3 You may not reverse engineer, decompile, or attempt to extract the source code of the AI Program.

11. TERMINATION
11.1 We may terminate or suspend your access to the App at any time, with or without cause.
11.2 Upon termination, your right to use the App ceases immediately.
11.3 Sections relating to liability, indemnification, and intellectual property shall survive termination.

12. FORCE MAJEURE
Oqualtix Forensics shall not be liable for any failure or delay in performance due to circumstances beyond our reasonable control, including but not limited to acts of God, natural disasters, war, terrorism, labor disputes, or government actions.

13. GOVERNING LAW AND DISPUTE RESOLUTION
13.1 These Terms shall be governed by and construed in accordance with the laws of [YOUR JURISDICTION].
13.2 Any disputes arising from these Terms shall be resolved through binding arbitration.
13.3 You waive any right to participate in class-action lawsuits or class-wide arbitration.

14. SEVERABILITY
If any provision of these Terms is found to be unenforceable or invalid, the remaining provisions shall remain in full force and effect.

15. ENTIRE AGREEMENT
These Terms, together with our Privacy Policy, constitute the entire agreement between you and Oqualtix Forensics regarding the use of the App and AI Program.

16. MODIFICATIONS
We reserve the right to modify these Terms at any time. Continued use of the App after modifications constitutes acceptance of the new Terms.

17. CONTACT INFORMATION
For questions about these Terms, please contact us at:
Email: legal@oqualtix.com
Address: Oqualtix Forensics Legal Department

19. ACKNOWLEDGMENT
BY CLICKING "I ACCEPT" OR USING THE APP, YOU ACKNOWLEDGE THAT:
a) You have read and understood these Terms and Conditions
b) You agree to be bound by these Terms
c) You understand the limitations and risks associated with AI-powered financial analysis
d) You will not hold Oqualtix Forensics liable for any financial losses or decisions made based on AI Program recommendations
e) You have the authority to agree to these Terms on behalf of your organization (if applicable)
f) You consent to the collection and use of your precise location data for fraud detection purposes
g) You understand that location services are essential for effective geographic fraud detection
h) You acknowledge that disabling location services may reduce the App's fraud detection capabilities

FINAL NOTICE: THE AI PROGRAM IS A TOOL TO ASSIST IN FINANCIAL ANALYSIS. IT IS NOT INFALLIBLE AND SHOULD NOT BE THE SOLE BASIS FOR FINANCIAL OR LEGAL DECISIONS. ALWAYS VERIFY AI PROGRAM RESULTS WITH QUALIFIED PROFESSIONALS.

© 2024 Oqualtix Forensics. All rights reserved.
  `;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Terms and Conditions</Text>
          <Text style={styles.headerSubtitle}>Oqualtix Forensics App & AI Program</Text>
        </View>

        <ScrollView
          style={styles.scrollView}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={true}
        >
          <View style={styles.contentContainer}>
            <Text style={styles.termsText}>{termsContent}</Text>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <View style={styles.scrollIndicator}>
            {!hasScrolledToBottom && (
              <View style={styles.scrollPrompt}>
                <Ionicons name="arrow-down" size={16} color="#FF9500" />
                <Text style={styles.scrollPromptText}>Please scroll to read all terms</Text>
              </View>
            )}
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.declineButton}
              onPress={onDecline}
            >
              <Text style={styles.declineButtonText}>Decline</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.acceptButton,
                !hasScrolledToBottom && styles.acceptButtonDisabled
              ]}
              onPress={hasScrolledToBottom ? onAccept : null}
              disabled={!hasScrolledToBottom}
            >
              <Text style={[
                styles.acceptButtonText,
                !hasScrolledToBottom && styles.acceptButtonTextDisabled
              ]}>
                {hasScrolledToBottom ? 'Accept Terms' : 'Read All Terms First'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const TermsCheckbox = ({ checked, onToggle, showTerms }) => {
  return (
    <View style={styles.checkboxContainer}>
      <TouchableOpacity
        style={styles.checkboxRow}
        onPress={onToggle}
        activeOpacity={0.7}
      >
        <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
          {checked && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
        </View>
        <View style={styles.checkboxTextContainer}>
          <Text style={styles.checkboxText}>
            Please agree to the{' '}
            <Text style={styles.termsLink} onPress={showTerms}>
              terms and conditions
            </Text>
            {' '}before continuing.
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    backgroundColor: '#007AFF',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  contentContainer: {
    padding: 20,
  },
  termsText: {
    fontSize: 12,
    lineHeight: 18,
    color: '#333333',
    fontFamily: 'monospace',
  },
  footer: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  scrollIndicator: {
    marginBottom: 16,
    minHeight: 24,
  },
  scrollPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollPromptText: {
    fontSize: 14,
    color: '#FF9500',
    marginLeft: 8,
    fontWeight: '500',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  declineButton: {
    flex: 1,
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  declineButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8E8E93',
  },
  acceptButton: {
    flex: 2,
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  acceptButtonDisabled: {
    backgroundColor: '#C7C7CC',
  },
  acceptButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  acceptButtonTextDisabled: {
    color: '#8E8E93',
  },
  checkboxContainer: {
    marginVertical: 16,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#C7C7CC',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  checkboxTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  checkboxText: {
    fontSize: 14,
    color: '#333333',
    lineHeight: 20,
  },
  termsLink: {
    color: '#007AFF',
    textDecorationLine: 'underline',
    fontWeight: '500',
  },
});

export { TermsAndConditionsModal, TermsCheckbox };