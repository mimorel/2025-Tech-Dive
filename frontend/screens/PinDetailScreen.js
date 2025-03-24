import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { Text, Button, Surface, IconButton, Divider } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const PinDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { pinId } = route.params;
  const [pin, setPin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const fetchPinDetails = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/pins/${pinId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch pin details');
      }
      setPin(data);
      setIsLiked(data.likes?.includes(data.currentUser?._id));
      setIsSaved(data.savedBy?.includes(data.currentUser?._id));
    } catch (error) {
      console.error('Error fetching pin details:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPinDetails();
  }, [pinId]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPinDetails();
  };

  const handleLike = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/pins/${pinId}/like`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to like pin');
      }
      setIsLiked(!isLiked);
      setPin(prev => ({
        ...prev,
        likes: isLiked
          ? prev.likes.filter(id => id !== prev.currentUser._id)
          : [...prev.likes, prev.currentUser._id],
      }));
    } catch (error) {
      console.error('Error liking pin:', error);
    }
  };

  const handleSave = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/pins/${pinId}/save`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to save pin');
      }
      setIsSaved(!isSaved);
      setPin(prev => ({
        ...prev,
        savedBy: isSaved
          ? prev.savedBy.filter(id => id !== prev.currentUser._id)
          : [...prev.savedBy, prev.currentUser._id],
      }));
    } catch (error) {
      console.error('Error saving pin:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading pin details...</Text>
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
      <Image
        source={{ uri: pin?.imageUrl }}
        style={styles.image}
        resizeMode="cover"
      />

      <Surface style={styles.content}>
        <View style={styles.header}>
          <Text variant="headlineSmall" style={styles.title}>
            {pin?.title}
          </Text>
          <Text variant="bodyLarge" style={styles.description}>
            {pin?.description}
          </Text>
        </View>

        <Divider style={styles.divider} />

        <View style={styles.authorSection}>
          <Image
            source={{ uri: pin?.author?.avatar || 'https://via.placeholder.com/40' }}
            style={styles.authorAvatar}
          />
          <View style={styles.authorInfo}>
            <Text variant="titleMedium">{pin?.author?.username}</Text>
            <Text variant="bodyMedium" style={styles.boardName}>
              {pin?.board?.name}
            </Text>
          </View>
        </View>

        <View style={styles.actions}>
          <IconButton
            icon={isLiked ? 'heart' : 'heart-outline'}
            onPress={handleLike}
            iconColor={isLiked ? '#E60023' : '#666'}
          />
          <Text variant="bodyMedium">{pin?.likes?.length || 0}</Text>

          <IconButton
            icon={isSaved ? 'bookmark' : 'bookmark-outline'}
            onPress={handleSave}
            iconColor={isSaved ? '#E60023' : '#666'}
          />
          <Text variant="bodyMedium">{pin?.savedBy?.length || 0}</Text>
        </View>

        <Button
          mode="contained"
          onPress={() => navigation.navigate('CreatePin', { pinId })}
          style={styles.editButton}
        >
          Edit Pin
        </Button>
      </Surface>
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
  image: {
    width: width,
    height: width,
  },
  content: {
    padding: 16,
    marginTop: -20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 4,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    color: '#666',
  },
  divider: {
    marginVertical: 16,
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
  boardName: {
    color: '#666',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  editButton: {
    marginTop: 8,
  },
});

export default PinDetailScreen; 