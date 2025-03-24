import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { Text, Button, Surface, IconButton, Divider, FAB } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');
const numColumns = 2;
const itemWidth = width / numColumns - 16;

const BoardDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { boardId } = route.params;
  const [board, setBoard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  const fetchBoardDetails = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/boards/${boardId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch board details');
      }
      setBoard(data);
      setIsFollowing(data.followers?.includes(data.currentUser?._id));
    } catch (error) {
      console.error('Error fetching board details:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBoardDetails();
  }, [boardId]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchBoardDetails();
  };

  const handleFollow = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/boards/${boardId}/follow`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to follow board');
      }
      setIsFollowing(!isFollowing);
      setBoard(prev => ({
        ...prev,
        followers: isFollowing
          ? prev.followers.filter(id => id !== prev.currentUser._id)
          : [...prev.followers, prev.currentUser._id],
      }));
    } catch (error) {
      console.error('Error following board:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading board details...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Surface style={styles.header}>
          <Image
            source={{ uri: board?.coverImage || 'https://via.placeholder.com/400x200' }}
            style={styles.coverImage}
          />
          <View style={styles.headerContent}>
            <Text variant="headlineSmall" style={styles.title}>
              {board?.name}
            </Text>
            <Text variant="bodyLarge" style={styles.description}>
              {board?.description}
            </Text>
            <View style={styles.authorSection}>
              <Image
                source={{ uri: board?.author?.avatar || 'https://via.placeholder.com/40' }}
                style={styles.authorAvatar}
              />
              <View style={styles.authorInfo}>
                <Text variant="titleMedium">{board?.author?.username}</Text>
                <Text variant="bodyMedium">{board?.pins?.length || 0} Pins</Text>
              </View>
            </View>
            <Button
              mode={isFollowing ? 'outlined' : 'contained'}
              onPress={handleFollow}
              style={styles.followButton}
            >
              {isFollowing ? 'Following' : 'Follow'}
            </Button>
          </View>
        </Surface>

        <View style={styles.pinsGrid}>
          {board?.pins?.map((pin) => (
            <Surface
              key={pin._id}
              style={styles.pinCard}
              onPress={() => navigation.navigate('PinDetail', { pinId: pin._id })}
            >
              <Image
                source={{ uri: pin.imageUrl }}
                style={styles.pinImage}
                resizeMode="cover"
              />
              <Text variant="bodyMedium" style={styles.pinTitle} numberOfLines={2}>
                {pin.title}
              </Text>
            </Surface>
          ))}
        </View>
      </ScrollView>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate('CreatePin', { boardId })}
      />
    </View>
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
    elevation: 4,
  },
  coverImage: {
    width: width,
    height: 200,
  },
  headerContent: {
    padding: 16,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    color: '#666',
    marginBottom: 16,
  },
  authorSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  authorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  authorInfo: {
    flex: 1,
  },
  followButton: {
    marginTop: 8,
  },
  pinsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
  },
  pinCard: {
    width: itemWidth,
    margin: 8,
    elevation: 4,
  },
  pinImage: {
    width: itemWidth,
    height: itemWidth,
  },
  pinTitle: {
    padding: 8,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default BoardDetailScreen; 