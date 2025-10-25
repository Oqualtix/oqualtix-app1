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
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 20,
    marginBottom: 15,
    marginTop: 20,
  },
  profileCard: {
    backgroundColor: '#fff',
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
    backgroundColor: '#2196F3',
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
    color: '#333',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  profileRole: {
    fontSize: 12,
    color: '#2196F3',
    fontWeight: '600',
  },
  settingItem: {
    backgroundColor: '#fff',
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
    color: '#333',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
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
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
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
    color: '#333',
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
    borderColor: '#ddd',
    marginHorizontal: 5,
    alignItems: 'center',
  },
  roleButtonSelected: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  roleButtonText: {
    fontSize: 14,
    color: '#666',
  },
  roleButtonTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
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
    backgroundColor: '#f5f5f5',
  },
  saveButton: {
    backgroundColor: '#2196F3',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButtonText: {
    color: '#fff',
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
    borderBottomColor: '#f0f0f0',
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
    backgroundColor: '#2196F3',
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
    color: '#333',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  userRole: {
    fontSize: 12,
    color: '#2196F3',
    fontWeight: '500',
  },
  deleteButton: {
    padding: 8,
  },
});

export default SettingsScreen;