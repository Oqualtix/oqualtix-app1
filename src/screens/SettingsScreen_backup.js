import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  TextInput,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

const SettingsScreen = ({ navigation }) => {
  const { user, logout, updateProfile, createUser, getAllUsers, deleteUser } = useAuth();
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [userManagementModalVisible, setUserManagementModalVisible] = useState(false);
  const [createUserModalVisible, setCreateUserModalVisible] = useState(false);
  
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
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [biometricEnabled, setBiometricEnabled] = useState(false);

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

  const renderSettingItem = (icon, title, subtitle, onPress, rightComponent = null) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <View style={styles.settingLeft}>
        <Ionicons name={icon} size={24} color="#2196F3" style={styles.settingIcon} />
        <View>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {rightComponent || <Ionicons name="chevron-forward" size={20} color="#ccc" />}
    </TouchableOpacity>
  );

  const renderUser = (userData) => (
    <View key={userData.id} style={styles.userItem}>
      <View style={styles.userInfo}>
        <View style={styles.userAvatar}>
          <Ionicons
            name={userData.role === 'admin' ? 'shield' : 'person'}
            size={20}
            color="#fff"
          />
        </View>
        <View style={styles.userDetails}>
          <Text style={styles.userName}>{userData.name}</Text>
          <Text style={styles.userEmail}>{userData.email}</Text>
          <Text style={styles.userRole}>
            {userData.role === 'admin' ? 'Administrator' : 'User'}
          </Text>
        </View>
      </View>
      {userData.email !== user.email && (
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteUser(userData.email)}
        >
          <Ionicons name="trash" size={18} color="#F44336" />
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Profile Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Profile</Text>
        
        <View style={styles.profileCard}>
          <View style={styles.profileAvatar}>
            <Ionicons name="person" size={40} color="#fff" />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.name}</Text>
            <Text style={styles.profileEmail}>{user?.email}</Text>
            <Text style={styles.profileRole}>
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
          <Text style={styles.sectionTitle}>User Management</Text>
          
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

      {/* App Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App Settings</Text>
        
        {renderSettingItem(
          'notifications',
          'Notifications',
          'Push notifications and alerts',
          null,
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: '#ccc', true: '#2196F3' }}
            thumbColor="#fff"
          />
        )}
        
        {renderSettingItem(
          'finger-print',
          'Biometric Authentication',
          'Use fingerprint or face recognition',
          null,
          <Switch
            value={biometricEnabled}
            onValueChange={setBiometricEnabled}
            trackColor={{ false: '#ccc', true: '#2196F3' }}
            thumbColor="#fff"
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
        <Text style={styles.sectionTitle}>Support</Text>
        
        {renderSettingItem(
          'help-circle',
          'Help & Support',
          'Get help and contact support',
          () => Alert.alert('Support', 'For support, please contact: support@oqualtix.com')
        )}
        
        {renderSettingItem(
          'information-circle',
          'About Oqualtix',
          'Version 1.0.0',
          () => Alert.alert('About', 'Oqualtix App v1.0.0\nForensic Financial Analysis Platform')
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
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Update Profile</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              value={profileForm.name}
              onChangeText={(text) => setProfileForm({...profileForm, name: text})}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={profileForm.email}
              onChangeText={(text) => setProfileForm({...profileForm, email: text})}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            
            <TextInput
              style={styles.input}
              placeholder="Phone Number"
              value={profileForm.phone}
              onChangeText={(text) => setProfileForm({...profileForm, phone: text})}
              keyboardType="phone-pad"
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setProfileModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleUpdateProfile}
              >
                <Text style={styles.saveButtonText}>Save</Text>
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
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create New User</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Full Name *"
              value={newUserForm.name}
              onChangeText={(text) => setNewUserForm({...newUserForm, name: text})}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Email *"
              value={newUserForm.email}
              onChangeText={(text) => setNewUserForm({...newUserForm, email: text})}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            
            <TextInput
              style={styles.input}
              placeholder="Password *"
              value={newUserForm.password}
              onChangeText={(text) => setNewUserForm({...newUserForm, password: text})}
              secureTextEntry
            />
            
            <TextInput
              style={styles.input}
              placeholder="Phone Number"
              value={newUserForm.phone}
              onChangeText={(text) => setNewUserForm({...newUserForm, phone: text})}
              keyboardType="phone-pad"
            />

            <View style={styles.roleContainer}>
              <Text style={styles.roleLabel}>Role:</Text>
              <View style={styles.roleButtons}>
                <TouchableOpacity
                  style={[
                    styles.roleButton,
                    newUserForm.role === 'user' && styles.roleButtonSelected
                  ]}
                  onPress={() => setNewUserForm({...newUserForm, role: 'user'})}
                >
                  <Text style={[
                    styles.roleButtonText,
                    newUserForm.role === 'user' && styles.roleButtonTextSelected
                  ]}>User</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.roleButton,
                    newUserForm.role === 'admin' && styles.roleButtonSelected
                  ]}
                  onPress={() => setNewUserForm({...newUserForm, role: 'admin'})}
                >
                  <Text style={[
                    styles.roleButtonText,
                    newUserForm.role === 'admin' && styles.roleButtonTextSelected
                  ]}>Admin</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setCreateUserModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleCreateUser}
              >
                <Text style={styles.saveButtonText}>Create</Text>
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
          <View style={[styles.modalContent, styles.largeModal]}>
            <Text style={styles.modalTitle}>User Management</Text>
            
            <ScrollView style={styles.usersList}>
              {users.map(renderUser)}
            </ScrollView>
            
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setUserManagementModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  container: {
    backgroundColor: '#f5f5f5',
    flex: 1,
  },
  deleteButton: {
    padding: 8,
  },
  input: {
    borderColor: '#ddd',
    borderRadius: 10,
    borderWidth: 1,
    fontSize: 16,
    marginBottom: 15,
    padding: 15,
  },
  largeModal: {
    height: '80%',
    maxHeight: '90%',
  },
  modalButton: {
    alignItems: 'center',
    borderRadius: 10,
    flex: 1,
    marginHorizontal: 5,
    padding: 15,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    maxHeight: '80%',
    maxWidth: 400,
    padding: 30,
    width: '90%',
  },
  modalOverlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    flex: 1,
    justifyContent: 'center',
  },
  modalTitle: {
    color: '#333',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  profileAvatar: {
    alignItems: 'center',
    backgroundColor: '#2196F3',
    borderRadius: 30,
    height: 60,
    justifyContent: 'center',
    marginRight: 15,
    width: 60,
  },
  profileCard: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 3,
    flexDirection: 'row',
    marginBottom: 10,
    marginHorizontal: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  profileEmail: {
    color: '#666',
    fontSize: 14,
    marginBottom: 2,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    color: '#333',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  profileRole: {
    color: '#2196F3',
    fontSize: 12,
    fontWeight: '600',
  },
  roleButton: {
    alignItems: 'center',
    borderColor: '#ddd',
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    marginHorizontal: 5,
    padding: 12,
  },
  roleButtonSelected: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  roleButtonText: {
    color: '#666',
    fontSize: 14,
  },
  roleButtonTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
  roleButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  roleContainer: {
    marginBottom: 20,
  },
  roleLabel: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  saveButton: {
    backgroundColor: '#2196F3',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    color: '#333',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    marginLeft: 20,
    marginTop: 20,
  },
  settingIcon: {
    marginRight: 15,
  },
  settingItem: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 3,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    marginHorizontal: 20,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  settingLeft: {
    alignItems: 'center',
    flexDirection: 'row',
    flex: 1,
  },
  settingSubtitle: {
    color: '#666',
    fontSize: 14,
  },
  settingTitle: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  userAvatar: {
    alignItems: 'center',
    backgroundColor: '#2196F3',
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    marginRight: 12,
    width: 40,
  },
  userDetails: {
    flex: 1,
  },
  userEmail: {
    color: '#666',
    fontSize: 14,
    marginBottom: 2,
  },
  userInfo: {
    alignItems: 'center',
    flexDirection: 'row',
    flex: 1,
  },
  userItem: {
    alignItems: 'center',
    borderBottomColor: '#f0f0f0',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
  },
  userName: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  userRole: {
    color: '#2196F3',
    fontSize: 12,
    fontWeight: '500',
  },
  usersList: {
    flex: 1,
    marginBottom: 20,
  },
});

export default SettingsScreen;