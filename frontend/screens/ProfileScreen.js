import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  RefreshControl,
  Dimensions,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  Text,
  Button,
  Surface,
  Divider,
  List,
  useTheme,
  ActivityIndicator,
  IconButton,
  Menu,
  Portal,
  Dialog,
  Avatar,
} from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI, pinsAPI, boardsAPI } from '../services/api';

const { width } = Dimensions.get('window');
const numColumns = 3;
const pinSize = width / numColumns - 8;

const ProfileScreen = ({ navigation }) => {
  const theme = useTheme();
  const route = useRoute();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [logoutDialogVisible, setLogoutDialogVisible] = useState(false);
  const [selectedView, setSelectedView] = useState('pins'); // 'pins' or 'boards'
  const [userPins, setUserPins] = useState([]);
  const [userBoards, setUserBoards] = useState([]);
  const [stats, setStats] = useState({
    pins: 0,
    boards: 0,
    followers: 0,
    following: 0
  });
  const [error, setError] = useState(null);

  const fetchUserProfile = async () => {
    try {
      console.log('Starting to fetch user profile...');
      setLoading(true);
      setError(null);
      
      // Get stored user data
      const storedUserData = await AsyncStorage.getItem('userData');
      console.log('Retrieved stored user data:', storedUserData);
      
      let userData;
      if (storedUserData) {
        try {
          userData = JSON.parse(storedUserData);
          console.log('Successfully parsed user data:', userData);
        } catch (parseError) {
          console.error('Error parsing stored user data:', parseError);
          userData = null;
        }
      }

      if (!userData) {
        console.log('No stored user data, fetching from API...');
        try {
          userData = await authAPI.getCurrentUser();
          console.log('=== RAW USER DATA FROM API ===');
          console.log(JSON.stringify(userData, null, 2));
          console.log('=== USER DATA KEYS ===');
          console.log(Object.keys(userData));
          console.log('=== FOLLOWERS DATA ===');
          console.log('Followers array:', userData.followers);
          console.log('Followers type:', typeof userData.followers);
          console.log('Is followers array?', Array.isArray(userData.followers));
          console.log('=== FOLLOWING DATA ===');
          console.log('Following array:', userData.following);
          console.log('Following type:', typeof userData.following);
          console.log('Is following array?', Array.isArray(userData.following));
        } catch (apiError) {
          console.error('Error fetching current user:', apiError);
          throw new Error('Failed to fetch user data from API');
        }
      }

      if (!userData) {
        throw new Error('No user data available');
      }

      // Ensure we have all required user fields
      const completeUserData = {
        ...userData,
        name: userData.name || 'User',
        title: userData.title || '',
        bio: userData.bio || '',
        followers: userData.followers || [],
        following: userData.following || []
      };

      console.log('=== COMPLETE USER DATA ===');
      console.log(JSON.stringify(completeUserData, null, 2));
      console.log('=== FOLLOWERS AND FOLLOWING IN COMPLETE DATA ===');
      console.log('Followers:', completeUserData.followers);
      console.log('Following:', completeUserData.following);
      
      setUser(completeUserData);
      
      // Fetch user's pins
      console.log('=== FETCHING USER PINS ===');
      const pinsResponse = await pinsAPI.getAllPins();
      console.log('Pins response:', JSON.stringify(pinsResponse, null, 2));
      const userPins = pinsResponse.pins.filter(pin => {
        console.log('Checking pin:', JSON.stringify(pin, null, 2));
        console.log('Pin user ID:', pin.user._id);
        console.log('Current user ID:', userData.id);
        return pin.user._id === userData.id;
      });
      console.log('Filtered user pins:', JSON.stringify(userPins, null, 2));
      setUserPins(userPins);
      
      // Fetch user's boards
      console.log('=== FETCHING USER BOARDS ===');
      const boardsResponse = await boardsAPI.getAllBoards();
      console.log('Boards response:', JSON.stringify(boardsResponse, null, 2));
      const userBoards = boardsResponse.boards.filter(board => board.user._id === userData.id);
      console.log('Filtered user boards:', JSON.stringify(userBoards, null, 2));
      setUserBoards(userBoards);
      
      // Update stats with proper follower/following counts
      console.log('=== CALCULATING STATS ===');
      console.log('User followers:', JSON.stringify(completeUserData.followers, null, 2));
      console.log('User following:', JSON.stringify(completeUserData.following, null, 2));
      
      // Get follower and following counts from the user data
      const followersCount = Array.isArray(completeUserData.followers) ? completeUserData.followers.length : 0;
      const followingCount = Array.isArray(completeUserData.following) ? completeUserData.following.length : 0;
      
      console.log('Followers count:', followersCount);
      console.log('Following count:', followingCount);
      
      const finalStats = {
        pins: userPins.length,
        boards: userBoards.length,
        followers: followersCount,
        following: followingCount
      };
      
      console.log('=== FINAL STATS ===');
      console.log(JSON.stringify(finalStats, null, 2));
      
      setStats(finalStats);

      console.log('=== PROFILE DATA LOADED ===');
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      setError(error.message);
      Alert.alert('Error', 'Failed to load profile data: ' + error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    console.log('ProfileScreen mounted, fetching profile...');
    fetchUserProfile();
  }, []);

  const onRefresh = async () => {
    console.log('Refreshing profile...');
    setRefreshing(true);
    await fetchUserProfile();
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('userData');
      navigation.replace('Login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const renderPin = (pin) => {
    console.log('Rendering pin:', JSON.stringify(pin, null, 2));
    return (
      <TouchableOpacity
        key={pin._id}
        style={styles.pinCard}
        onPress={() => navigation.navigate('PinDetail', { pinId: pin._id })}
      >
        <Image
          source={{ uri: pin.imageUrl }}
          style={styles.pinImage}
          resizeMode="cover"
        />
        <View style={styles.pinInfo}>
          <Text variant="titleMedium" style={styles.pinTitle} numberOfLines={2}>
            {pin.title}
          </Text>
          <Text variant="bodySmall" style={styles.pinDescription} numberOfLines={2}>
            {pin.description}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderBoard = (board) => (
    <TouchableOpacity
      key={board._id}
      style={styles.boardContainer}
      onPress={() => navigation.navigate('BoardDetail', { boardId: board._id })}
    >
      <Image
        source={{ uri: board.coverImage }}
        style={styles.boardCover}
        resizeMode="cover"
      />
      <View style={styles.boardInfo}>
        <Text variant="titleMedium" style={{ color: '#FFFFFF' }}>
          {board.name}
        </Text>
        <Text variant="bodySmall" style={{ color: '#B0B0B0' }}>
          {board.pins.length} pins
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    console.log('Rendering loading state...');
    return (
      <View style={[styles.loadingContainer, { backgroundColor: '#121212' }]}>
        <ActivityIndicator size="large" color="#9C27B0" />
      </View>
    );
  }

  if (error) {
    console.log('Rendering error state:', error);
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text>Error: {error}</Text>
        <Button onPress={fetchUserProfile} style={styles.retryButton}>
          Retry
        </Button>
      </View>
    );
  }

  if (!user) {
    console.log('Rendering no user state...');
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text>No user data found</Text>
      </View>
    );
  }

  console.log('Rendering profile with user:', user);
  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Surface style={styles.header}>
          <View style={styles.headerActions}>
            <IconButton
              icon={() => <MaterialCommunityIcons name="share" size={24} color="#FFFFFF" />}
              onPress={() => {}}
            />
            <IconButton
              icon={() => <MaterialCommunityIcons name="dots-vertical" size={24} color="#FFFFFF" />}
              onPress={() => setMenuVisible(true)}
            />
          </View>

          <Avatar.Text 
            size={80} 
            label={user.name.split(' ').map(n => n[0]).join('')} 
            style={styles.avatar}
          />
          <Text variant="headlineSmall" style={styles.name}>
            {user.name}
          </Text>
          <Text variant="titleMedium" style={styles.title}>
            {user.title}
          </Text>
          <Text variant="bodyMedium" style={styles.bio}>
            {user.bio}
          </Text>

          <View style={styles.stats}>
            <TouchableOpacity style={styles.statItem}>
              <Text variant="titleLarge" style={styles.statNumber}>
                {stats.pins}
              </Text>
              <Text variant="bodyMedium" style={styles.statLabel}>
                Pins
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.statItem}>
              <Text variant="titleLarge" style={styles.statNumber}>
                {stats.boards}
              </Text>
              <Text variant="bodyMedium" style={styles.statLabel}>
                Boards
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.statItem}
              onPress={() => navigation.navigate('Followers', { userId: user.id })}
            >
              <Text variant="titleLarge" style={styles.statNumber}>
                {stats.followers}
              </Text>
              <Text variant="bodyMedium" style={styles.statLabel}>
                Followers
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.statItem}
              onPress={() => navigation.navigate('Following', { userId: user.id })}
            >
              <Text variant="titleLarge" style={styles.statNumber}>
                {stats.following}
              </Text>
              <Text variant="bodyMedium" style={styles.statLabel}>
                Following
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.actions}>
            <Button
              mode="contained"
              onPress={() => navigation.navigate('EditProfile')}
              style={[styles.actionButton, { backgroundColor: '#9C27B0' }]}
              labelStyle={{ color: '#FFFFFF' }}
            >
              Edit Profile
            </Button>
            <Button
              mode="outlined"
              onPress={() => navigation.navigate('CreateBoard')}
              style={[styles.actionButton, { borderColor: '#9C27B0' }]}
              textColor="#9C27B0"
            >
              Create Board
            </Button>
          </View>
        </Surface>

        <View style={styles.contentSelector}>
          <TouchableOpacity
            style={[
              styles.selectorButton,
              selectedView === 'pins' && styles.selectedButton,
            ]}
            onPress={() => setSelectedView('pins')}
          >
            <MaterialCommunityIcons
              name="pin"
              size={24}
              color={selectedView === 'pins' ? '#9C27B0' : '#FFFFFF'}
            />
            <Text style={[
              styles.selectorText,
              selectedView === 'pins' && styles.selectedText,
            ]}>
              Pins
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.selectorButton,
              selectedView === 'boards' && styles.selectedButton,
            ]}
            onPress={() => setSelectedView('boards')}
          >
            <MaterialCommunityIcons
              name="grid"
              size={24}
              color={selectedView === 'boards' ? '#9C27B0' : '#FFFFFF'}
            />
            <Text style={[
              styles.selectorText,
              selectedView === 'boards' && styles.selectedText,
            ]}>
              Boards
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {selectedView === 'pins' ? (
            <View style={styles.pinsGrid}>
              {userPins.map(renderPin)}
            </View>
          ) : (
            <View style={styles.boardsGrid}>
              {userBoards.map(renderBoard)}
            </View>
          )}
        </View>
      </ScrollView>

      <Menu
        visible={menuVisible}
        onDismiss={() => setMenuVisible(false)}
        anchor={<View />}
        style={{ backgroundColor: '#1E1E1E' }}
      >
        <Menu.Item
          onPress={() => {
            setMenuVisible(false);
            navigation.navigate('Settings');
          }}
          title="Settings"
          leadingIcon={() => <MaterialCommunityIcons name="cog" size={24} color="#FFFFFF" />}
          titleStyle={{ color: '#FFFFFF' }}
        />
        <Menu.Item
          onPress={() => {
            setMenuVisible(false);
            setLogoutDialogVisible(true);
          }}
          title="Logout"
          leadingIcon={() => <MaterialCommunityIcons name="logout" size={24} color="#FFFFFF" />}
          titleStyle={{ color: '#FFFFFF' }}
        />
      </Menu>

      <Portal>
        <Dialog
          visible={logoutDialogVisible}
          onDismiss={() => setLogoutDialogVisible(false)}
          style={{ backgroundColor: '#1E1E1E' }}
        >
          <Dialog.Title style={{ color: '#FFFFFF' }}>Confirm Logout</Dialog.Title>
          <Dialog.Content>
            <Text style={{ color: '#B0B0B0' }}>Are you sure you want to logout?</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setLogoutDialogVisible(false)} textColor="#B0B0B0">
              Cancel
            </Button>
            <Button onPress={handleLogout} textColor="#9C27B0">
              Logout
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    width: '100%',
    marginBottom: 16,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
  },
  name: {
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#FFFFFF',
  },
  title: {
    color: '#B0B0B0',
    marginBottom: 8,
  },
  bio: {
    color: '#B0B0B0',
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 32,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  statLabel: {
    color: '#B0B0B0',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    maxWidth: 160,
  },
  contentSelector: {
    flexDirection: 'row',
    backgroundColor: '#1E1E1E',
    marginTop: 1,
    padding: 12,
  },
  selectorButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  selectedButton: {
    borderBottomWidth: 2,
    borderBottomColor: '#9C27B0',
  },
  selectorText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  selectedText: {
    color: '#9C27B0',
  },
  content: {
    flex: 1,
    padding: 8,
  },
  pinsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  pinCard: {
    width: (width - 32) / 2,
    marginBottom: 16,
    backgroundColor: '#2D2D2D',
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  pinImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#1E1E1E',
  },
  pinInfo: {
    padding: 12,
  },
  pinTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  pinDescription: {
    color: '#B0B0B0',
    fontSize: 14,
  },
  boardsGrid: {
    padding: 8,
  },
  boardContainer: {
    flexDirection: 'row',
    backgroundColor: '#2D2D2D',
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
  },
  boardCover: {
    width: 100,
    height: 100,
  },
  boardInfo: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  retryButton: {
    marginTop: 16,
  },
});

export default ProfileScreen; 