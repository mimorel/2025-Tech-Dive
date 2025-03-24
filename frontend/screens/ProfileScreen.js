import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  RefreshControl,
} from 'react-native';
import { Text, Button, Surface, Divider, List } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ProfileScreen = () => {
  const navigation = useNavigation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchUserProfile = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/users/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch user profile');
      }
      setUser(data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchUserProfile();
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      navigation.replace('Login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Surface style={styles.header}>
        <Image
          source={{ uri: user?.avatar || 'https://via.placeholder.com/150' }}
          style={styles.avatar}
        />
        <Text variant="headlineSmall" style={styles.username}>
          {user?.username}
        </Text>
        <Text variant="bodyLarge" style={styles.email}>
          {user?.email}
        </Text>
      </Surface>

      <Surface style={styles.stats}>
        <View style={styles.statItem}>
          <Text variant="headlineMedium">{user?.pins?.length || 0}</Text>
          <Text variant="bodyMedium">Pins</Text>
        </View>
        <View style={styles.statItem}>
          <Text variant="headlineMedium">{user?.boards?.length || 0}</Text>
          <Text variant="bodyMedium">Boards</Text>
        </View>
        <View style={styles.statItem}>
          <Text variant="headlineMedium">{user?.followers?.length || 0}</Text>
          <Text variant="bodyMedium">Followers</Text>
        </View>
        <View style={styles.statItem}>
          <Text variant="headlineMedium">{user?.following?.length || 0}</Text>
          <Text variant="bodyMedium">Following</Text>
        </View>
      </Surface>

      <Divider style={styles.divider} />

      <List.Section>
        <List.Item
          title="My Boards"
          left={props => <List.Icon {...props} icon="folder" />}
          onPress={() => navigation.navigate('UserBoards')}
        />
        <List.Item
          title="My Pins"
          left={props => <List.Icon {...props} icon="pin" />}
          onPress={() => navigation.navigate('UserPins')}
        />
        <List.Item
          title="Edit Profile"
          left={props => <List.Icon {...props} icon="account-edit" />}
          onPress={() => navigation.navigate('EditProfile')}
        />
        <List.Item
          title="Settings"
          left={props => <List.Icon {...props} icon="cog" />}
          onPress={() => navigation.navigate('Settings')}
        />
      </List.Section>

      <Button
        mode="outlined"
        onPress={handleLogout}
        style={styles.logoutButton}
      >
        Logout
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    alignItems: 'center',
    elevation: 4,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
  },
  username: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  email: {
    color: '#666',
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    elevation: 4,
  },
  statItem: {
    alignItems: 'center',
  },
  divider: {
    marginVertical: 8,
  },
  logoutButton: {
    margin: 16,
  },
});

export default ProfileScreen; 