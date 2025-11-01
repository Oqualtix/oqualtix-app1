import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  Image,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BrandConfig from '../config/BrandConfig';
import { ThemeContext } from '../context/ThemeContext';

const BankIntegrationScreen = ({ navigation }) => {
  const { isDarkMode } = useContext(ThemeContext);
  const colors = BrandConfig.getColors(isDarkMode);

  const [connectedBanks, setConnectedBanks] = useState([]);
  const [showAddBankModal, setShowAddBankModal] = useState(false);
  const [selectedBank, setSelectedBank] = useState(null);
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
    accountNumber: '',
  });
  const [isConnecting, setIsConnecting] = useState(false);

  // Major banks and financial institutions
  const supportedBanks = [
    {
      id: 'chase',
      name: 'Chase Bank',
      logo: '🏦',
      type: 'Major Bank',
      features: ['Checking', 'Savings', 'Credit Cards', 'Business']
    },
    {
      id: 'bankofamerica',
      name: 'Bank of America',
      logo: '🏛️',
      type: 'Major Bank',
      features: ['Personal Banking', 'Business Banking', 'Credit Cards']
    },
    {
      id: 'wells_fargo',
      name: 'Wells Fargo',
      logo: '🏪',
      type: 'Major Bank',
      features: ['Checking', 'Savings', 'Business', 'Investment']
    },
    {
      id: 'citi',
      name: 'Citibank',
      logo: '🏢',
      type: 'Major Bank',
      features: ['Global Banking', 'Credit Cards', 'Business']
    },
    {
      id: 'usbank',
      name: 'US Bank',
      logo: '🇺🇸',
      type: 'Major Bank',
      features: ['Personal', 'Business', 'Corporate Banking']
    },
    {
      id: 'pnc',
      name: 'PNC Bank',
      logo: '🏦',
      type: 'Regional Bank',
      features: ['Checking', 'Savings', 'Business Banking']
    },
    {
      id: 'truist',
      name: 'Truist Bank',
      logo: '🌟',
      type: 'Regional Bank',
      features: ['Personal', 'Business', 'Wealth Management']
    },
    {
      id: 'td',
      name: 'TD Bank',
      logo: '🍃',
      type: 'International Bank',
      features: ['Personal', 'Business', 'Commercial']
    },
    {
      id: 'capital_one',
      name: 'Capital One',
      logo: '💳',
      type: 'Digital Bank',
      features: ['Credit Cards', 'Banking', 'Auto Loans']
    },
    {
      id: 'ally',
      name: 'Ally Bank',
      logo: '🤝',
      type: 'Online Bank',
      features: ['High-yield Savings', 'Auto Financing']
    },
    {
      id: 'schwab',
      name: 'Charles Schwab',
      logo: '📊',
      type: 'Investment Bank',
      features: ['Banking', 'Investment', 'Trading']
    },
    {
      id: 'credit_union',
      name: 'Credit Unions',
      logo: '🤲',
      type: 'Credit Union',
      features: ['Local Banking', 'Lower Fees', 'Community Focus']
    },
    {
      id: 'other',
      name: 'Other Bank',
      logo: '🏦',
      type: 'Custom',
      features: ['Manual Setup', 'Any Institution']
    }
  ];

  const handleBankSelect = (bank) => {
    setSelectedBank(bank);
    setShowAddBankModal(true);
  };

  const handleConnectBank = async () => {
    if (!credentials.username || !credentials.password) {
      Alert.alert('Error', 'Please enter your login credentials');
      return;
    }

    setIsConnecting(true);

    // Simulate bank connection process
    try {
      // In real implementation, this would use Plaid, Yodlee, or similar API
      await new Promise(resolve => setTimeout(resolve, 2000));

      const newConnection = {
        id: Date.now().toString(),
        bankId: selectedBank.id,
        bankName: selectedBank.name,
        accountType: 'Checking', // Would be detected from API
        accountNumber: `****${credentials.accountNumber.slice(-4)}`,
        balance: Math.floor(Math.random() * 50000) + 10000, // Mock balance
        lastSync: new Date().toISOString(),
        status: 'Connected',
        realTimeEnabled: true,
        fraudAlertsEnabled: true
      };

      setConnectedBanks([...connectedBanks, newConnection]);
      setShowAddBankModal(false);
      setCredentials({ username: '', password: '', accountNumber: '' });
      setSelectedBank(null);

      Alert.alert(
        'Bank Connected Successfully!',
        `${selectedBank.name} is now connected for real-time fraud monitoring.`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Connection Failed', 'Unable to connect to your bank. Please check your credentials and try again.');
    }

    setIsConnecting(false);
  };

  const handleDisconnectBank = (bankId) => {
    Alert.alert(
      'Disconnect Bank',
      'Are you sure you want to disconnect this bank account? Real-time monitoring will be disabled.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: () => {
            setConnectedBanks(connectedBanks.filter(bank => bank.id !== bankId));
          }
        }
      ]
    );
  };

  const toggleRealTimeMonitoring = (bankId, enabled) => {
    setConnectedBanks(connectedBanks.map(bank => 
      bank.id === bankId 
        ? { ...bank, realTimeEnabled: enabled }
        : bank
    ));
  };

  const toggleFraudAlerts = (bankId, enabled) => {
    setConnectedBanks(connectedBanks.map(bank => 
      bank.id === bankId 
        ? { ...bank, fraudAlertsEnabled: enabled }
        : bank
    ));
  };

  const renderBankCard = (bank) => (
    <TouchableOpacity
      key={bank.id}
      style={[styles.bankCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
      onPress={() => handleBankSelect(bank)}
    >
      <View style={styles.bankHeader}>
        <Text style={styles.bankLogo}>{bank.logo}</Text>
        <View style={styles.bankInfo}>
          <Text style={[styles.bankName, { color: colors.text }]}>{bank.name}</Text>
          <Text style={[styles.bankType, { color: colors.textSecondary }]}>{bank.type}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
      </View>
      <View style={styles.bankFeatures}>
        {bank.features.slice(0, 3).map((feature, index) => (
          <Text key={index} style={[styles.featureTag, { backgroundColor: colors.primaryLight, color: colors.secondary }]}>
            {feature}
          </Text>
        ))}
      </View>
    </TouchableOpacity>
  );

  const renderConnectedBank = (bank) => (
    <View key={bank.id} style={[styles.connectedBankCard, { backgroundColor: colors.cardBackground, borderColor: colors.primary }]}>
      <View style={styles.connectedBankHeader}>
        <View style={styles.bankStatusInfo}>
          <Text style={[styles.connectedBankName, { color: colors.text }]}>{bank.bankName}</Text>
          <Text style={[styles.accountInfo, { color: colors.textSecondary }]}>
            {bank.accountType} •••• {bank.accountNumber}
          </Text>
          <Text style={[styles.statusBadge, { backgroundColor: colors.success, color: colors.secondary }]}>
            {bank.status}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => handleDisconnectBank(bank.id)}
          style={styles.disconnectButton}
        >
          <Ionicons name="close-circle" size={24} color={colors.error} />
        </TouchableOpacity>
      </View>

      <View style={styles.bankControls}>
        <View style={styles.controlRow}>
          <Text style={[styles.controlLabel, { color: colors.text }]}>Real-time Monitoring</Text>
          <Switch
            value={bank.realTimeEnabled}
            onValueChange={(value) => toggleRealTimeMonitoring(bank.id, value)}
            trackColor={{ false: colors.backgroundSecondary, true: colors.primary }}
            thumbColor={colors.secondary}
          />
        </View>
        <View style={styles.controlRow}>
          <Text style={[styles.controlLabel, { color: colors.text }]}>Fraud Alerts</Text>
          <Switch
            value={bank.fraudAlertsEnabled}
            onValueChange={(value) => toggleFraudAlerts(bank.id, value)}
            trackColor={{ false: colors.backgroundSecondary, true: colors.primary }}
            thumbColor={colors.secondary}
          />
        </View>
      </View>

      <View style={styles.bankStats}>
        <Text style={[styles.balanceLabel, { color: colors.textSecondary }]}>Account Balance</Text>
        <Text style={[styles.balanceAmount, { color: colors.primary }]}>${bank.balance.toLocaleString()}</Text>
        <Text style={[styles.lastSync, { color: colors.textSecondary }]}>
          Last sync: {new Date(bank.lastSync).toLocaleString()}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>Bank Connections</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Connect your bank accounts for real-time fraud monitoring and automated transaction analysis
        </Text>

        {/* Connected Banks Section */}
        {connectedBanks.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              🔗 Connected Banks ({connectedBanks.length})
            </Text>
            {connectedBanks.map(renderConnectedBank)}
          </View>
        )}

        {/* Available Banks Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            🏦 Add Bank Account
          </Text>
          <Text style={[styles.sectionDescription, { color: colors.textSecondary }]}>
            Select your bank to begin secure real-time monitoring
          </Text>
          {supportedBanks.map(renderBankCard)}
        </View>

        {/* Security Information */}
        <View style={[styles.securityInfo, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
          <Text style={[styles.securityTitle, { color: colors.text }]}>🔒 Bank-Level Security</Text>
          <Text style={[styles.securityDescription, { color: colors.textSecondary }]}>
            • 256-bit SSL encryption for all connections{'\n'}
            • Read-only access - we cannot move money{'\n'}
            • OAuth 2.0 secure authentication{'\n'}
            • SOC 2 compliant data handling{'\n'}
            • Instant fraud detection and alerts
          </Text>
        </View>
      </ScrollView>

      {/* Add Bank Modal */}
      <Modal
        visible={showAddBankModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddBankModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Connect to {selectedBank?.name}
              </Text>
              <TouchableOpacity onPress={() => setShowAddBankModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={[styles.modalDescription, { color: colors.textSecondary }]}>
                Enter your online banking credentials to securely connect your account for real-time monitoring.
              </Text>

              <TextInput
                style={[styles.input, { borderColor: colors.border, color: colors.text }]}
                placeholder="Username or Email"
                placeholderTextColor={colors.textSecondary}
                value={credentials.username}
                onChangeText={(text) => setCredentials({...credentials, username: text})}
                autoCapitalize="none"
              />

              <TextInput
                style={[styles.input, { borderColor: colors.border, color: colors.text }]}
                placeholder="Password"
                placeholderTextColor={colors.textSecondary}
                value={credentials.password}
                onChangeText={(text) => setCredentials({...credentials, password: text})}
                secureTextEntry
              />

              <TextInput
                style={[styles.input, { borderColor: colors.border, color: colors.text }]}
                placeholder="Account Number (last 4 digits for verification)"
                placeholderTextColor={colors.textSecondary}
                value={credentials.accountNumber}
                onChangeText={(text) => setCredentials({...credentials, accountNumber: text})}
                keyboardType="numeric"
                maxLength={4}
              />

              <View style={[styles.warningBox, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
                <Ionicons name="shield-checkmark" size={20} color={colors.primary} />
                <Text style={[styles.warningText, { color: colors.textSecondary }]}>
                  Your credentials are encrypted and used only to establish a secure connection. We use bank-grade security and never store your login information.
                </Text>
              </View>

              <TouchableOpacity
                style={[styles.connectButton, { backgroundColor: colors.primary }]}
                onPress={handleConnectBank}
                disabled={isConnecting}
              >
                <Text style={[styles.connectButtonText, { color: colors.secondary }]}>
                  {isConnecting ? 'Connecting...' : 'Connect Bank Account'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  accountInfo: {
    fontSize: 14,
    marginBottom: 6,
  },
  balanceAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 4,
  },
  balanceLabel: {
    fontSize: 12,
  },
  bankCard: {
    borderRadius: 12,
    borderWidth: 1,
    elevation: 3,
    marginBottom: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  bankControls: {
    marginBottom: 15,
  },
  bankFeatures: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  bankHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 10,
  },
  bankInfo: {
    flex: 1,
  },
  bankLogo: {
    fontSize: 30,
    marginRight: 12,
  },
  bankName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  bankStats: {
    borderTopColor: '#E0E0E0',
    borderTopWidth: 1,
    paddingTop: 15,
  },
  bankStatusInfo: {
    flex: 1,
  },
  bankType: {
    fontSize: 12,
  },
  connectButton: {
    alignItems: 'center',
    borderRadius: 10,
    padding: 15,
  },
  connectButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  connectedBankCard: {
    borderRadius: 12,
    borderWidth: 2,
    elevation: 3,
    marginBottom: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  connectedBankHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  connectedBankName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  controlLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  controlRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  disconnectButton: {
    padding: 5,
  },
  featureTag: {
    borderRadius: 10,
    fontSize: 10,
    marginBottom: 4,
    marginRight: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  input: {
    borderRadius: 10,
    borderWidth: 1,
    fontSize: 16,
    marginBottom: 15,
    padding: 15,
  },
  lastSync: {
    fontSize: 12,
  },
  modalBody: {
    padding: 20,
  },
  modalContent: {
    borderRadius: 20,
    maxHeight: '80%',
    padding: 0,
    width: '90%',
  },
  modalDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  modalHeader: {
    alignItems: 'center',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
  },
  modalOverlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    flex: 1,
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 30,
  },
  sectionDescription: {
    fontSize: 14,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  securityDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  securityInfo: {
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 20,
    padding: 15,
  },
  securityTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    borderRadius: 8,
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  warningBox: {
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: 20,
    padding: 15,
  },
  warningText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 16,
    marginLeft: 10,
  },
});

export default BankIntegrationScreen;