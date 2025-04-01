import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

const SettingsScreen = ({ navigation }) => {
  const { logout } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await authAPI.getCurrentUser();
      setUser(userData);
    } catch (error) {
      console.error('Error loading user data:', error);
      Alert.alert('Error', 'Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigation.replace('Login');
    } catch (error) {
      console.error('Error logging out:', error);
      Alert.alert('Error', 'Failed to logout');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E60023" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <View style={styles.section}>
        <View style={styles.profileSection}>
          <Image
            source={{ uri: user?.avatar || 'https://via.placeholder.com/100' }}
            style={styles.avatar}
          />
          <View style={styles.profileInfo}>
            <Text style={styles.username}>{user?.username || 'Username'}</Text>
            <Text style={styles.email}>{user?.email || 'email@example.com'}</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuItemContent}>
            <Ionicons name="person-outline" size={24} color="#333" />
            <Text style={styles.menuItemText}>Edit Profile</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#666" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuItemContent}>
            <Ionicons name="lock-closed-outline" size={24} color="#333" />
            <Text style={styles.menuItemText}>Change Password</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuItemContent}>
            <Ionicons name="notifications-outline" size={24} color="#333" />
            <Text style={styles.menuItemText}>Notifications</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#666" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuItemContent}>
            <Ionicons name="globe-outline" size={24} color="#333" />
            <Text style={styles.menuItemText}>Language</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Support</Text>
        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuItemContent}>
            <Ionicons name="help-circle-outline" size={24} color="#333" />
            <Text style={styles.menuItemText}>Help Center</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#666" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuItemContent}>
            <Ionicons name="document-text-outline" size={24} color="#333" />
            <Text style={styles.menuItemText}>Terms of Service</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#666" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuItemContent}>
            <Ionicons name="shield-checkmark-outline" size={24} color="#333" />
            <Text style={styles.menuItemText}>Privacy Policy</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Log Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 12,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  username: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#666',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  logoutButton: {
    margin: 16,
    padding: 16,
    backgroundColor: '#E60023',
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SettingsScreen; 