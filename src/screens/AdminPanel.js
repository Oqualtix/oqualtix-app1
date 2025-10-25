import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/EnhancedAuthContext';

const AdminPanel = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [allData, setAllData] = useState({ users: [], companies: [] });
  const [selectedTab, setSelectedTab] = useState('users'); // 'users' or 'companies'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetailModal, setUserDetailModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [userToDelete, setUserToDelete] = useState(null);

  const { user, getAllUsersAndCompanies, isAdmin, deleteUser } = useAuth();

  useEffect(() => {
    if (!isAdmin()) {
      Alert.alert('Access Denied', 'Admin privileges required');
      navigation.goBack();
      return;
    }
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const data = getAllUsersAndCompanies();
      setAllData(data);
    } catch (error) {
      console.error('Error loading admin data:', error);
      Alert.alert('Error', 'Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAdminData();
    setRefreshing(false);
  };

  const filteredUsers = allData.users.filter(userData =>
    userData.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    userData.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    userData.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    userData.company.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCompanies = allData.companies.filter(company =>
    company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    company.industry.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getUserStatusColor = (userData) => {
    if (userData.verificationStatus === 'VERIFIED') return '#4CAF50';
    if (userData.verificationStatus === 'PENDING') return '#FF9500';
    return '#FF3B30';
  };

  const getCompanyStatusColor = (company) => {
    if (company.status === 'ACTIVE') return '#4CAF50';
    if (company.status === 'SUSPENDED') return '#FF9500';
    return '#FF3B30';
  };

  const initiateDeleteUser = (userData) => {
    // Prevent admin from deleting themselves
    if (userData.id === user.id) {
      Alert.alert('Error', 'You cannot delete your own account');
      return;
    }
    
    setUserToDelete(userData);
    setDeletePassword('');
    setDeleteModal(true);
  };

  const confirmDeleteUser = async () => {
    const ADMIN_PASSWORD = '00119077';
    
    if (deletePassword !== ADMIN_PASSWORD) {
      Alert.alert('Access Denied', 'Incorrect admin password');
      return;
    }

    try {
      const success = deleteUser(userToDelete.id);
      if (success) {
        Alert.alert(
          'User Deleted', 
          `User ${userToDelete.firstName} ${userToDelete.lastName} has been permanently removed from the system.`,
          [
            {
              text: 'OK',
              onPress: () => {
                setDeleteModal(false);
                setUserToDelete(null);
                setDeletePassword('');
                loadAdminData(); // Refresh the data
              }
            }
          ]
        );
      } else {
        Alert.alert('Error', 'Failed to delete user. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      Alert.alert('Error', 'An error occurred while deleting the user.');
    }
  };

  const cancelDelete = () => {
    setDeleteModal(false);
    setUserToDelete(null);
    setDeletePassword('');
  };

  const showUserDetails = (userData) => {
    setSelectedUser(userData);
    setUserDetailModal(true);
  };

  const renderUserCard = (userData, index) => (
    <View key={userData.id} style={styles.dataCard}>
      <TouchableOpacity
        style={styles.cardContent}
        onPress={() => showUserDetails(userData)}
      >
        <View style={styles.cardHeader}>
          <View style={styles.userInfo}>
            <View style={styles.avatarContainer}>
              <Ionicons
                name={userData.isAdmin ? "shield-checkmark" : "person"}
                size={24}
                color={userData.isAdmin ? "#FF9500" : "#007AFF"}
              />
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.userName}>
                {userData.firstName} {userData.lastName}
              </Text>
              <Text style={styles.userEmail}>{userData.email}</Text>
              <Text style={styles.userCompany}>{userData.company}</Text>
            </View>
          </View>
          <View style={styles.statusContainer}>
            <View style={[styles.statusDot, { backgroundColor: getUserStatusColor(userData) }]} />
            <Text style={styles.statusText}>{userData.verificationStatus}</Text>
          </View>
        </View>
        
        <View style={styles.cardFooter}>
          <View style={styles.roleContainer}>
            <Text style={styles.roleText}>{userData.role}</Text>
            {userData.isAdmin && (
              <View style={styles.adminBadge}>
                <Text style={styles.adminBadgeText}>ADMIN</Text>
              </View>
            )}
          </View>
          <Text style={styles.lastLoginText}>
            {userData.lastLogin ? 
              `Last login: ${new Date(userData.lastLogin).toLocaleDateString()}` : 
              'Never logged in'
            }
          </Text>
        </View>
      </TouchableOpacity>
      
      {/* Delete Button */}
      <View style={styles.cardActions}>
        <TouchableOpacity
          style={[
            styles.deleteButton,
            userData.id === user.id && styles.deleteButtonDisabled
          ]}
          onPress={() => initiateDeleteUser(userData)}
          disabled={userData.id === user.id}
        >
          <Ionicons 
            name="trash-outline" 
            size={18} 
            color={userData.id === user.id ? "#C7C7CC" : "#FF3B30"} 
          />
          <Text style={[
            styles.deleteButtonText,
            userData.id === user.id && styles.deleteButtonTextDisabled
          ]}>
            {userData.id === user.id ? 'Current User' : 'Delete'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderCompanyCard = (company, index) => (
    <View key={company.id} style={styles.dataCard}>
      <View style={styles.cardHeader}>
        <View style={styles.userInfo}>
          <View style={styles.avatarContainer}>
            <Ionicons name="business" size={24} color="#5856D6" />
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{company.name}</Text>
            <Text style={styles.userEmail}>{company.industry}</Text>
            <Text style={styles.userCompany}>
              {company.employees.length} employee(s)
            </Text>
          </View>
        </View>
        <View style={styles.statusContainer}>
          <View style={[styles.statusDot, { backgroundColor: getCompanyStatusColor(company) }]} />
          <Text style={styles.statusText}>{company.status}</Text>
        </View>
      </View>
      
      <View style={styles.cardFooter}>
        <View style={styles.roleContainer}>
          <Text style={styles.roleText}>{company.subscription}</Text>
        </View>
        <Text style={styles.lastLoginText}>
          Created: {new Date(company.createdAt).toLocaleDateString()}
        </Text>
      </View>
    </View>
  );

  const renderUserDetailModal = () => (
    <Modal
      visible={userDetailModal}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>User Details</Text>
          <TouchableOpacity
            onPress={() => setUserDetailModal(false)}
            style={styles.modalCloseButton}
          >
            <Ionicons name="close" size={24} color="#8E8E93" />
          </TouchableOpacity>
        </View>

        {selectedUser && (
          <ScrollView style={styles.modalContent}>
            <View style={styles.detailSection}>
              <Text style={styles.sectionTitle}>Personal Information</Text>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Name:</Text>
                <Text style={styles.detailValue}>
                  {selectedUser.firstName} {selectedUser.lastName}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Email:</Text>
                <Text style={styles.detailValue}>{selectedUser.email}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>User ID:</Text>
                <Text style={styles.detailValue}>{selectedUser.id}</Text>
              </View>
            </View>

            <View style={styles.detailSection}>
              <Text style={styles.sectionTitle}>Company Information</Text>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Company:</Text>
                <Text style={styles.detailValue}>{selectedUser.company}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Company ID:</Text>
                <Text style={styles.detailValue}>{selectedUser.companyId}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Role:</Text>
                <Text style={styles.detailValue}>{selectedUser.role}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Access Level:</Text>
                <Text style={styles.detailValue}>{selectedUser.accessLevel}</Text>
              </View>
            </View>

            <View style={styles.detailSection}>
              <Text style={styles.sectionTitle}>Account Status</Text>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Verification:</Text>
                <Text style={[
                  styles.detailValue,
                  { color: getUserStatusColor(selectedUser) }
                ]}>
                  {selectedUser.verificationStatus}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Terms Accepted:</Text>
                <Text style={styles.detailValue}>
                  {selectedUser.termsAccepted ? 'Yes' : 'No'}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Created:</Text>
                <Text style={styles.detailValue}>
                  {new Date(selectedUser.createdAt).toLocaleString()}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Last Login:</Text>
                <Text style={styles.detailValue}>
                  {selectedUser.lastLogin ? 
                    new Date(selectedUser.lastLogin).toLocaleString() : 
                    'Never'
                  }
                </Text>
              </View>
            </View>

            <View style={styles.detailSection}>
              <Text style={styles.sectionTitle}>Permissions</Text>
              {selectedUser.permissions.map((permission, index) => (
                <View key={index} style={styles.permissionItem}>
                  <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                  <Text style={styles.permissionText}>{permission}</Text>
                </View>
              ))}
            </View>
          </ScrollView>
        )}
      </View>
    </Modal>
  );

  const renderDeleteModal = () => (
    <Modal
      visible={deleteModal}
      animationType="fade"
      transparent={true}
    >
      <View style={styles.deleteModalOverlay}>
        <View style={styles.deleteModalContainer}>
          <View style={styles.deleteModalHeader}>
            <Ionicons name="warning" size={32} color="#FF3B30" />
            <Text style={styles.deleteModalTitle}>Delete User</Text>
          </View>
          
          {userToDelete && (
            <View style={styles.deleteModalContent}>
              <Text style={styles.deleteModalMessage}>
                You are about to permanently delete:
              </Text>
              <Text style={styles.deleteUserName}>
                {userToDelete.firstName} {userToDelete.lastName}
              </Text>
              <Text style={styles.deleteUserEmail}>
                {userToDelete.email}
              </Text>
              
              <Text style={styles.deleteWarning}>
                ⚠️ This action cannot be undone. All user data will be permanently removed from the system.
              </Text>
              
              <Text style={styles.passwordLabel}>
                Enter admin password to confirm:
              </Text>
              <TextInput
                style={styles.passwordInput}
                placeholder="Admin Password"
                value={deletePassword}
                onChangeText={setDeletePassword}
                secureTextEntry={true}
                autoFocus={true}
              />
            </View>
          )}
          
          <View style={styles.deleteModalActions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={cancelDelete}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.confirmDeleteButton,
                !deletePassword && styles.confirmDeleteButtonDisabled
              ]}
              onPress={confirmDeleteUser}
              disabled={!deletePassword}
            >
              <Text style={styles.confirmDeleteButtonText}>Delete User</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading admin data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#FF6B6B', '#FF8E53']} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Admin Panel</Text>
            <Text style={styles.headerSubtitle}>System Overview</Text>
          </View>
          <View style={styles.adminBadgeHeader}>
            <Ionicons name="shield-checkmark" size={20} color="#FFFFFF" />
            <Text style={styles.adminBadgeHeaderText}>ADMIN</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'users' && styles.activeTab]}
          onPress={() => setSelectedTab('users')}
        >
          <Ionicons
            name="people"
            size={20}
            color={selectedTab === 'users' ? "#007AFF" : "#8E8E93"}
          />
          <Text style={[
            styles.tabText,
            selectedTab === 'users' && styles.activeTabText
          ]}>
            Users ({allData.users.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, selectedTab === 'companies' && styles.activeTab]}
          onPress={() => setSelectedTab('companies')}
        >
          <Ionicons
            name="business"
            size={20}
            color={selectedTab === 'companies' ? "#007AFF" : "#8E8E93"}
          />
          <Text style={[
            styles.tabText,
            selectedTab === 'companies' && styles.activeTabText
          ]}>
            Companies ({allData.companies.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#8E8E93" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder={`Search ${selectedTab}...`}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#8E8E93" />
          </TouchableOpacity>
        )}
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {selectedTab === 'users' ? (
          <View style={styles.dataContainer}>
            <Text style={styles.sectionHeader}>
              {filteredUsers.length} User{filteredUsers.length !== 1 ? 's' : ''} Found
            </Text>
            {filteredUsers.map(renderUserCard)}
          </View>
        ) : (
          <View style={styles.dataContainer}>
            <Text style={styles.sectionHeader}>
              {filteredCompanies.length} Compan{filteredCompanies.length !== 1 ? 'ies' : 'y'} Found
            </Text>
            {filteredCompanies.map(renderCompanyCard)}
          </View>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>

      {renderUserDetailModal()}
      {renderDeleteModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#8E8E93',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.8,
  },
  adminBadgeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  adminBadgeHeaderText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: -10,
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#E3F2FD',
  },
  tabText: {
    fontSize: 14,
    color: '#8E8E93',
    marginLeft: 8,
    fontWeight: '500',
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 20,
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000000',
  },
  content: {
    flex: 1,
    marginTop: 16,
  },
  dataContainer: {
    paddingHorizontal: 20,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
  },
  dataCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardContent: {
    padding: 16,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5F5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFE5E5',
  },
  deleteButtonDisabled: {
    backgroundColor: '#F8F8F8',
    borderColor: '#E5E5EA',
  },
  deleteButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FF3B30',
    marginLeft: 4,
  },
  deleteButtonTextDisabled: {
    color: '#C7C7CC',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F2F2F7',
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
    color: '#000000',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 2,
  },
  userCompany: {
    fontSize: 12,
    color: '#8E8E93',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '500',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
  },
  roleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roleText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
  },
  adminBadge: {
    backgroundColor: '#FF9500',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 8,
  },
  adminBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  lastLoginText: {
    fontSize: 10,
    color: '#C7C7CC',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  detailSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  detailLabel: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: '#000000',
    fontWeight: '400',
    textAlign: 'right',
    flex: 1,
    marginLeft: 16,
  },
  permissionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  permissionText: {
    fontSize: 14,
    color: '#000000',
    marginLeft: 8,
  },
  bottomPadding: {
    height: 40,
  },
  // Delete Modal Styles
  deleteModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteModalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    margin: 20,
    maxWidth: 400,
    width: '90%',
  },
  deleteModalHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  deleteModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF3B30',
    marginTop: 8,
  },
  deleteModalContent: {
    marginBottom: 24,
  },
  deleteModalMessage: {
    fontSize: 16,
    color: '#000000',
    textAlign: 'center',
    marginBottom: 12,
  },
  deleteUserName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 4,
  },
  deleteUserEmail: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 16,
  },
  deleteWarning: {
    fontSize: 14,
    color: '#FF9500',
    textAlign: 'center',
    backgroundColor: '#FFF9E6',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    lineHeight: 20,
  },
  passwordLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    marginBottom: 8,
  },
  passwordInput: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#F8F8F8',
  },
  deleteModalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F2F2F7',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#8E8E93',
  },
  confirmDeleteButton: {
    flex: 1,
    backgroundColor: '#FF3B30',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmDeleteButtonDisabled: {
    backgroundColor: '#FFB3B3',
  },
  confirmDeleteButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});

export default AdminPanel;