import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { BrandConfig } from '../config/BrandConfig';
import { ThemeContext } from '../context/ThemeContext';
import { NotificationContext } from '../context/NotificationContext';

const SettingsScreen = ({ navigation }) => {
  const { user, logout, updateProfile, createUser, getAllUsers, deleteUser } = useAuth();
  const { isDarkMode, toggleTheme, theme } = useContext(ThemeContext);
  const { 
    notificationSettings, 
    updateNotificationSetting,
    testNotification,
    requestPermissions 
  } = useContext(NotificationContext);
  
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [userManagementModalVisible, setUserManagementModalVisible] = useState(false);
  const [createUserModalVisible, setCreateUserModalVisible] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showQuietHoursModal, setShowQuietHoursModal] = useState(false);
  
  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  // Create user form state
  const [newUserForm, setNewUserForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'user',
  });

  const [users, setUsers] = useState([]);
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  const colors = BrandConfig.getColors(isDarkMode);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: logout 
        },
      ]
    );
  };

  const handleUpdateProfile = async () => {
    const result = await updateProfile(profileForm);
    if (result.success) {
      Alert.alert('Success', 'Profile updated successfully');
      setProfileModalVisible(false);
    } else {
      Alert.alert('Error', result.error);
    }
  };

  const handleCreateUser = async () => {
    if (!newUserForm.name || !newUserForm.email || !newUserForm.password) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const result = await createUser(newUserForm);
    if (result.success) {
      Alert.alert('Success', 'User created successfully');
      setCreateUserModalVisible(false);
      setNewUserForm({ name: '', email: '', password: '', phone: '', role: 'user' });
      loadUsers();
    } else {
      Alert.alert('Error', result.error);
    }
  };

  const handleDeleteUser = (userEmail) => {
    Alert.alert(
      'Delete User',
      `Are you sure you want to delete this user?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const result = await deleteUser(userEmail);
            if (result.success) {
              Alert.alert('Success', 'User deleted successfully');
              loadUsers();
            } else {
              Alert.alert('Error', result.error);
            }
          },
        },
      ]
    );
  };

  const loadUsers = () => {
    const allUsers = getAllUsers();
    setUsers(allUsers);
  };

  const openUserManagement = () => {
    loadUsers();
    setUserManagementModalVisible(true);
  };

  const handleBiometricToggle = () => {
    Alert.alert(
      'Biometric Authentication',
      `${!biometricEnabled ? 'Enable' : 'Disable'} biometric authentication for app access?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Confirm', 
          onPress: () => setBiometricEnabled(!biometricEnabled) 
        }
      ]
    );
  };

  const handleNotificationPermissions = async () => {
    await requestPermissions();
  };

  const handleTestNotification = async () => {
    await testNotification();
  };

  const renderSettingItem = (icon, title, subtitle, onPress, rightComponent = null) => (
    <TouchableOpacity style={[styles.settingItem, { backgroundColor: colors.cardBackground }]} onPress={onPress}>
      <View style={styles.settingLeft}>
        <Ionicons name={icon} size={24} color={colors.primary} style={styles.settingIcon} />
        <View>
          <Text style={[styles.settingTitle, { color: colors.text }]}>{title}</Text>
          {subtitle && <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>{subtitle}</Text>}
        </View>
      </View>
      {rightComponent || <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />}
    </TouchableOpacity>
  );

  const renderUser = (userData) => (
    <View key={userData.id} style={[styles.userItem, { borderBottomColor: colors.border }]}>
      <View style={styles.userInfo}>
        <View style={[styles.userAvatar, { backgroundColor: colors.primary }]}>
          <Ionicons
            name={userData.role === 'admin' ? 'shield' : 'person'}
            size={20}
            color={colors.secondary}
          />
        </View>
        <View style={styles.userDetails}>
          <Text style={[styles.userName, { color: colors.text }]}>{userData.name}</Text>
          <Text style={[styles.userEmail, { color: colors.textSecondary }]}>{userData.email}</Text>
          <Text style={[styles.userRole, { color: colors.primary }]}>
            {userData.role === 'admin' ? 'Administrator' : 'User'}
          </Text>
        </View>
      </View>
      {userData.email !== user.email && (
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteUser(userData.email)}
        >
          <Ionicons name="trash" size={18} color={colors.error} />
        </TouchableOpacity>
      )}
    </View>
  );

  const NotificationSettingsModal = () => (
    <Modal
      visible={showNotificationModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowNotificationModal(false)}
    >
      <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
        <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Notification Settings
            </Text>
            <TouchableOpacity onPress={() => setShowNotificationModal(false)}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalBody}>
            {/* Fraud Alerts */}
            <View style={styles.settingGroup}>
              <Text style={[styles.groupTitle, { color: colors.text }]}>
                🚨 Fraud Alerts
              </Text>
              
              <View style={styles.settingItem}>
                <Text style={[styles.settingLabel, { color: colors.text }]}>
                  High Risk Transactions
                </Text>
                <Switch
                  value={notificationSettings.fraudAlerts.highRisk}
                  onValueChange={(value) => 
                    updateNotificationSetting('fraudAlerts', 'highRisk', value)
                  }
                  trackColor={{ false: colors.backgroundSecondary, true: colors.primary }}
                  thumbColor={colors.secondary}
                />
              </View>
              
              <View style={styles.settingItem}>
                <Text style={[styles.settingLabel, { color: colors.text }]}>
                  Suspicious Patterns
                </Text>
                <Switch
                  value={notificationSettings.fraudAlerts.suspiciousPatterns}
                  onValueChange={(value) => 
                    updateNotificationSetting('fraudAlerts', 'suspiciousPatterns', value)
                  }
                  trackColor={{ false: colors.backgroundSecondary, true: colors.primary }}
                  thumbColor={colors.secondary}
                />
              </View>
            </View>

            {/* Risk Score Updates */}
            <View style={styles.settingGroup}>
              <Text style={[styles.groupTitle, { color: colors.text }]}>
                📊 Risk Score Updates
              </Text>
              
              <View style={styles.settingItem}>
                <Text style={[styles.settingLabel, { color: colors.text }]}>
                  Significant Changes
                </Text>
                <Switch
                  value={notificationSettings.riskUpdates.significantChanges}
                  onValueChange={(value) => 
                    updateNotificationSetting('riskUpdates', 'significantChanges', value)
                  }
                  trackColor={{ false: colors.backgroundSecondary, true: colors.primary }}
                  thumbColor={colors.secondary}
                />
              </View>
              
              <View style={styles.settingItem}>
                <Text style={[styles.settingLabel, { color: colors.text }]}>
                  Daily Summaries
                </Text>
                <Switch
                  value={notificationSettings.riskUpdates.dailySummaries}
                  onValueChange={(value) => 
                    updateNotificationSetting('riskUpdates', 'dailySummaries', value)
                  }
                  trackColor={{ false: colors.backgroundSecondary, true: colors.primary }}
                  thumbColor={colors.secondary}
                />
              </View>
            </View>

            {/* AI Analysis */}
            <View style={styles.settingGroup}>
              <Text style={[styles.groupTitle, { color: colors.text }]}>
                🤖 AI Analysis
              </Text>
              
              <View style={styles.settingItem}>
                <Text style={[styles.settingLabel, { color: colors.text }]}>
                  Analysis Complete
                </Text>
                <Switch
                  value={notificationSettings.aiAnalysis.analysisComplete}
                  onValueChange={(value) => 
                    updateNotificationSetting('aiAnalysis', 'analysisComplete', value)
                  }
                  trackColor={{ false: colors.backgroundSecondary, true: colors.primary }}
                  thumbColor={colors.secondary}
                />
              </View>
              
              <View style={styles.settingItem}>
                <Text style={[styles.settingLabel, { color: colors.text }]}>
                  Insights Available
                </Text>
                <Switch
                  value={notificationSettings.aiAnalysis.insightsAvailable}
                  onValueChange={(value) => 
                    updateNotificationSetting('aiAnalysis', 'insightsAvailable', value)
                  }
                  trackColor={{ false: colors.backgroundSecondary, true: colors.primary }}
                  thumbColor={colors.secondary}
                />
              </View>
            </View>

            {/* System Updates */}
            <View style={styles.settingGroup}>
              <Text style={[styles.groupTitle, { color: colors.text }]}>
                ⚙️ System Updates
              </Text>
              
              <View style={styles.settingItem}>
                <Text style={[styles.settingLabel, { color: colors.text }]}>
                  App Updates
                </Text>
                <Switch
                  value={notificationSettings.systemUpdates.appUpdates}
                  onValueChange={(value) => 
                    updateNotificationSetting('systemUpdates', 'appUpdates', value)
                  }
                  trackColor={{ false: colors.backgroundSecondary, true: colors.primary }}
                  thumbColor={colors.secondary}
                />
              </View>
              
              <View style={styles.settingItem}>
                <Text style={[styles.settingLabel, { color: colors.text }]}>
                  Maintenance Alerts
                </Text>
                <Switch
                  value={notificationSettings.systemUpdates.maintenanceAlerts}
                  onValueChange={(value) => 
                    updateNotificationSetting('systemUpdates', 'maintenanceAlerts', value)
                  }
                  trackColor={{ false: colors.backgroundSecondary, true: colors.primary }}
                  thumbColor={colors.secondary}
                />
              </View>
            </View>

            {/* Test Notification */}
            <TouchableOpacity 
              style={[styles.testButton, { backgroundColor: colors.primary }]}
              onPress={handleTestNotification}
            >
              <Text style={[styles.testButtonText, { color: colors.secondary }]}>
                Send Test Notification
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  const QuietHoursModal = () => (
    <Modal
      visible={showQuietHoursModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowQuietHoursModal(false)}
    >
      <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
        <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Quiet Hours
            </Text>
            <TouchableOpacity onPress={() => setShowQuietHoursModal(false)}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.modalBody}>
            <View style={styles.settingItem}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>
                Enable Quiet Hours
              </Text>
              <Switch
                value={notificationSettings.quietHours.enabled}
                onValueChange={(value) => 
                  updateNotificationSetting('quietHours', 'enabled', value)
                }
                trackColor={{ false: colors.backgroundSecondary, true: colors.primary }}
                thumbColor={colors.secondary}
              />
            </View>

            {notificationSettings.quietHours.enabled && (
              <>
                <Text style={[styles.sliderLabel, { color: colors.text }]}>
                  Start Time: {Math.floor(notificationSettings.quietHours.startHour)}:00
                </Text>
                <Slider
                  style={styles.slider}
                  minimumValue={0}
                  maximumValue={23}
                  value={notificationSettings.quietHours.startHour}
                  onValueChange={(value) => 
                    updateNotificationSetting('quietHours', 'startHour', Math.floor(value))
                  }
                  minimumTrackTintColor={colors.primary}
                  maximumTrackTintColor={colors.backgroundSecondary}
                  thumbStyle={{ backgroundColor: colors.primary }}
                />

                <Text style={[styles.sliderLabel, { color: colors.text }]}>
                  End Time: {Math.floor(notificationSettings.quietHours.endHour)}:00
                </Text>
                <Slider
                  style={styles.slider}
                  minimumValue={0}
                  maximumValue={23}
                  value={notificationSettings.quietHours.endHour}
                  onValueChange={(value) => 
                    updateNotificationSetting('quietHours', 'endHour', Math.floor(value))
                  }
                  minimumTrackTintColor={colors.primary}
                  maximumTrackTintColor={colors.backgroundSecondary}
                  thumbStyle={{ backgroundColor: colors.primary }}
                />
              </>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Profile Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Profile</Text>
        
        <View style={[styles.profileCard, { backgroundColor: colors.cardBackground }]}>
          <View style={[styles.profileAvatar, { backgroundColor: colors.primary }]}>
            <Ionicons name="person" size={40} color={colors.secondary} />
          </View>
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: colors.text }]}>{user?.name}</Text>
            <Text style={[styles.profileEmail, { color: colors.textSecondary }]}>{user?.email}</Text>
            <Text style={[styles.profileRole, { color: colors.primary }]}>
              {user?.role === 'admin' ? 'Administrator' : 'User'}
            </Text>
          </View>
        </View>

        {renderSettingItem(
          'person-circle',
          'Personal Information',
          'Update your profile details',
          () => setProfileModalVisible(true)
        )}
      </View>

      {/* User Management Section (Admin Only) */}
      {user?.role === 'admin' && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>User Management</Text>
          
          {renderSettingItem(
            'people',
            'Manage Users',
            'View and manage user accounts',
            openUserManagement
          )}
          
          {renderSettingItem(
            'person-add',
            'Create User Account',
            'Add new admin or customer accounts',
            () => setCreateUserModalVisible(true)
          )}
        </View>
      )}

      {/* Appearance Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>🎨 Appearance</Text>
        
        {renderSettingItem(
          'contrast',
          'Dark Mode',
          'Switch between light and dark themes',
          null,
          <Switch
            value={isDarkMode}
            onValueChange={toggleTheme}
            trackColor={{ false: colors.backgroundSecondary, true: colors.primary }}
            thumbColor={colors.secondary}
          />
        )}
      </View>

      {/* Notifications Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>🔔 Notifications</Text>
        
        {renderSettingItem(
          'notifications',
          'Notification Preferences',
          'Configure fraud alerts, risk updates, and AI notifications',
          () => setShowNotificationModal(true)
        )}

        {renderSettingItem(
          'moon',
          'Quiet Hours',
          'Set times when notifications should be silenced',
          () => setShowQuietHoursModal(true)
        )}

        {renderSettingItem(
          'checkmark-circle',
          'Notification Permissions',
          'Enable push notifications for real-time monitoring',
          handleNotificationPermissions
        )}
      </View>

      {/* App Settings */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>App Settings</Text>
        
        {renderSettingItem(
          'finger-print',
          'Biometric Authentication',
          'Use fingerprint or face recognition',
          null,
          <Switch
            value={biometricEnabled}
            onValueChange={handleBiometricToggle}
            trackColor={{ false: colors.backgroundSecondary, true: colors.primary }}
            thumbColor={colors.secondary}
          />
        )}

        {renderSettingItem(
          'shield-checkmark',
          'Privacy & Security',
          'Manage your privacy settings',
          () => Alert.alert('Coming Soon', 'Privacy settings will be available in a future update')
        )}
      </View>

      {/* Support Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Support</Text>
        
        {renderSettingItem(
          'help-circle',
          'Help & Support',
          'Get help and contact support',
          () => Alert.alert('Support', 'For support, please contact: ' + BrandConfig.company.email)
        )}
        
        {renderSettingItem(
          'information-circle',
          'About Oqualtix',
          'Version 1.0.0',
          () => Alert.alert('About', BrandConfig.company.fullName + ' App v1.0.0\n' + BrandConfig.company.tagline)
        )}
      </View>

      {/* Logout Section */}
      <View style={styles.section}>
        {renderSettingItem(
          'log-out',
          'Logout',
          'Sign out of your account',
          handleLogout
        )}
      </View>

      {/* Profile Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={profileModalVisible}
        onRequestClose={() => setProfileModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Update Profile</Text>
            
            <TextInput
              style={[styles.input, { borderColor: colors.border, color: colors.text }]}
              placeholder="Full Name"
              placeholderTextColor={colors.textSecondary}
              value={profileForm.name}
              onChangeText={(text) => setProfileForm({...profileForm, name: text})}
            />
            
            <TextInput
              style={[styles.input, { borderColor: colors.border, color: colors.text }]}
              placeholder="Email"
              placeholderTextColor={colors.textSecondary}
              value={profileForm.email}
              onChangeText={(text) => setProfileForm({...profileForm, email: text})}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            
            <TextInput
              style={[styles.input, { borderColor: colors.border, color: colors.text }]}
              placeholder="Phone Number"
              placeholderTextColor={colors.textSecondary}
              value={profileForm.phone}
              onChangeText={(text) => setProfileForm({...profileForm, phone: text})}
              keyboardType="phone-pad"
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton, { backgroundColor: colors.backgroundSecondary }]}
                onPress={() => setProfileModalVisible(false)}
              >
                <Text style={[styles.cancelButtonText, { color: colors.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton, { backgroundColor: colors.primary }]}
                onPress={handleUpdateProfile}
              >
                <Text style={[styles.saveButtonText, { color: colors.secondary }]}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Create User Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={createUserModalVisible}
        onRequestClose={() => setCreateUserModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Create New User</Text>
            
            <TextInput
              style={[styles.input, { borderColor: colors.border, color: colors.text }]}
              placeholder="Full Name *"
              placeholderTextColor={colors.textSecondary}
              value={newUserForm.name}
              onChangeText={(text) => setNewUserForm({...newUserForm, name: text})}
            />
            
            <TextInput
              style={[styles.input, { borderColor: colors.border, color: colors.text }]}
              placeholder="Email *"
              placeholderTextColor={colors.textSecondary}
              value={newUserForm.email}
              onChangeText={(text) => setNewUserForm({...newUserForm, email: text})}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            
            <TextInput
              style={[styles.input, { borderColor: colors.border, color: colors.text }]}
              placeholder="Password *"
              placeholderTextColor={colors.textSecondary}
              value={newUserForm.password}
              onChangeText={(text) => setNewUserForm({...newUserForm, password: text})}
              secureTextEntry
            />
            
            <TextInput
              style={[styles.input, { borderColor: colors.border, color: colors.text }]}
              placeholder="Phone Number"
              placeholderTextColor={colors.textSecondary}
              value={newUserForm.phone}
              onChangeText={(text) => setNewUserForm({...newUserForm, phone: text})}
              keyboardType="phone-pad"
            />

            <View style={styles.roleContainer}>
              <Text style={[styles.roleLabel, { color: colors.text }]}>Role:</Text>
              <View style={styles.roleButtons}>
                <TouchableOpacity
                  style={[
                    styles.roleButton,
                    { borderColor: colors.border },
                    newUserForm.role === 'user' && { backgroundColor: colors.primary, borderColor: colors.primary }
                  ]}
                  onPress={() => setNewUserForm({...newUserForm, role: 'user'})}
                >
                  <Text style={[
                    styles.roleButtonText,
                    { color: colors.textSecondary },
                    newUserForm.role === 'user' && { color: colors.secondary, fontWeight: 'bold' }
                  ]}>User</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.roleButton,
                    { borderColor: colors.border },
                    newUserForm.role === 'admin' && { backgroundColor: colors.primary, borderColor: colors.primary }
                  ]}
                  onPress={() => setNewUserForm({...newUserForm, role: 'admin'})}
                >
                  <Text style={[
                    styles.roleButtonText,
                    { color: colors.textSecondary },
                    newUserForm.role === 'admin' && { color: colors.secondary, fontWeight: 'bold' }
                  ]}>Admin</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton, { backgroundColor: colors.backgroundSecondary }]}
                onPress={() => setCreateUserModalVisible(false)}
              >
                <Text style={[styles.cancelButtonText, { color: colors.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton, { backgroundColor: colors.primary }]}
                onPress={handleCreateUser}
              >
                <Text style={[styles.saveButtonText, { color: colors.secondary }]}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* User Management Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={userManagementModalVisible}
        onRequestClose={() => setUserManagementModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, styles.largeModal, { backgroundColor: colors.background }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>User Management</Text>
            
            <ScrollView style={styles.usersList}>
              {users.map(renderUser)}
            </ScrollView>
            
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton, { backgroundColor: colors.backgroundSecondary }]}
              onPress={() => setUserManagementModalVisible(false)}
            >
              <Text style={[styles.cancelButtonText, { color: colors.textSecondary }]}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Notification Settings Modal */}
      {NotificationSettingsModal()}

      {/* Quiet Hours Modal */}
      {QuietHoursModal()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 20,
    marginBottom: 15,
    marginTop: 20,
  },
  profileCard: {
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    marginBottom: 2,
  },
  profileRole: {
    fontSize: 12,
    fontWeight: '600',
  },
  settingItem: {
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    marginRight: 15,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    borderRadius: 20,
    padding: 30,
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  largeModal: {
    maxHeight: '90%',
    height: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 15,
    marginBottom: 15,
    borderBottomWidth: 1,
  },
  modalBody: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  roleContainer: {
    marginBottom: 20,
  },
  roleLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  roleButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  roleButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  roleButtonText: {
    fontSize: 14,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  cancelButton: {
  },
  saveButton: {
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  usersList: {
    flex: 1,
    marginBottom: 20,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    marginBottom: 2,
  },
  userRole: {
    fontSize: 12,
    fontWeight: '500',
  },
  deleteButton: {
    padding: 8,
  },
  settingGroup: {
    marginBottom: 25,
  },
  groupTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  testButton: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  testButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  sliderLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 15,
    marginBottom: 5,
  },
  slider: {
    width: '100%',
    height: 40,
  },
});

export default SettingsScreen;