import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
  RefreshControl,
  Share,
  TouchableOpacity,
  Linking,
} from 'react-native';
import {
  Text,
  Button,
  Surface,
  IconButton,
  Divider,
  Avatar,
  Chip,
  Menu,
  Portal,
  Dialog,
  TextInput,
  useTheme,
  ActivityIndicator,
} from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Clipboard from 'expo-clipboard';
import { dummyPins } from '../data/dummyData';

const { width } = Dimensions.get('window');

const PinDetailScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const { pinId } = route.params;
  const [pin, setPin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [commentDialogVisible, setCommentDialogVisible] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState([]);

  const fetchPinDetails = async () => {
    try {
      setLoading(true);
      console.log('Fetching pin details for ID:', pinId);
      
      // For now, let's use dummy data instead of API call
      const dummyPin = dummyPins.find(p => p._id === pinId);
      if (!dummyPin) {
        throw new Error('Pin not found');
      }

      console.log('Found pin:', dummyPin);
      setPin(dummyPin);
      setIsLiked(dummyPin.likes?.includes('testuser123')); // Using test user ID
      setIsSaved(dummyPin.savedBy?.includes('testuser123')); // Using test user ID
      setComments(dummyPin.comments || []);
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

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this pin: ${pin.title}\n${pin.imageUrl}`,
      });
    } catch (error) {
      console.error('Error sharing pin:', error);
    }
  };

  const handleCopyLink = async () => {
    try {
      await Clipboard.setStringAsync(pin.imageUrl);
      // Show toast or feedback
    } catch (error) {
      console.error('Error copying link:', error);
    }
  };

  const handleReport = () => {
    setMenuVisible(false);
    // Implement report functionality
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/pins/${pinId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text: newComment }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to add comment');
      }

      const comment = await response.json();
      setComments(prev => [...prev, comment]);
      setNewComment('');
      setCommentDialogVisible(false);
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!pin) {
    return (
      <View style={styles.loadingContainer}>
        <Text>No pin found</Text>
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
        source={{ uri: pin.imageUrl }}
        style={styles.image}
        resizeMode="cover"
      />

      <Surface style={[styles.content, { backgroundColor: '#1E1E1E' }]}>
        {/* Header Actions */}
        <View style={styles.headerActions}>
          <IconButton
            icon={() => <MaterialCommunityIcons name="dots-horizontal" size={24} color="#FFFFFF" />}
            size={24}
            onPress={() => setMenuVisible(true)}
          />
          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            anchor={<View />}
          >
            <Menu.Item 
              onPress={handleShare} 
              title="Share" 
              leadingIcon={() => <MaterialCommunityIcons name="share" size={24} color="#FFFFFF" />}
            />
            <Menu.Item 
              onPress={handleCopyLink} 
              title="Copy link" 
              leadingIcon={() => <MaterialCommunityIcons name="link" size={24} color="#FFFFFF" />}
            />
            <Menu.Item 
              onPress={handleReport} 
              title="Report" 
              leadingIcon={() => <MaterialCommunityIcons name="flag" size={24} color="#FFFFFF" />}
            />
          </Menu>
        </View>

        {/* Title and Description */}
        <View style={styles.header}>
          <Text variant="headlineSmall" style={[styles.title, { color: '#FFFFFF' }]}>
            {pin.title}
          </Text>
          <Text variant="bodyLarge" style={[styles.description, { color: '#B0B0B0' }]}>
            {pin.description}
          </Text>
        </View>

        <Divider style={[styles.divider, { backgroundColor: '#333333' }]} />

        {/* Author Section */}
        <TouchableOpacity 
          style={styles.authorSection}
          onPress={() => navigation.navigate('Profile', { userId: pin.author?._id })}
        >
          <Avatar.Image
            size={40}
            source={{ uri: pin.author?.avatar || 'https://via.placeholder.com/40' }}
          />
          <View style={styles.authorInfo}>
            <Text variant="titleMedium" style={{ color: '#FFFFFF' }}>
              {pin.author?.username}
            </Text>
            <Text variant="bodyMedium" style={[styles.followers, { color: '#B0B0B0' }]}>
              {pin.author?.followers?.length || 0} followers
            </Text>
          </View>
          <Button 
            mode="outlined" 
            onPress={() => {}}
            style={{ borderColor: '#9C27B0' }}
            textColor="#9C27B0"
          >
            Follow
          </Button>
        </TouchableOpacity>

        <Divider style={[styles.divider, { backgroundColor: '#333333' }]} />

        {/* Board Section */}
        <TouchableOpacity 
          style={styles.boardSection}
          onPress={() => navigation.navigate('BoardDetail', { boardId: pin.board?._id })}
        >
          <Image
            source={{ uri: pin.board?.coverImage || pin.imageUrl }}
            style={styles.boardImage}
          />
          <View style={styles.boardInfo}>
            <Text variant="titleMedium" style={{ color: '#FFFFFF' }}>
              {pin.board?.name}
            </Text>
            <Text variant="bodyMedium" style={{ color: '#B0B0B0' }}>
              {pin.board?.pins?.length || 0} pins
            </Text>
          </View>
        </TouchableOpacity>

        <Divider style={[styles.divider, { backgroundColor: '#333333' }]} />

        {/* Stats and Actions */}
        <View style={styles.statsSection}>
          <View style={styles.stats}>
            <Text variant="titleMedium" style={{ color: '#FFFFFF' }}>
              {pin.likes?.length || 0}
            </Text>
            <Text variant="bodyMedium" style={{ color: '#B0B0B0' }}>
              likes
            </Text>
          </View>
          <View style={styles.stats}>
            <Text variant="titleMedium" style={{ color: '#FFFFFF' }}>
              {pin.savedBy?.length || 0}
            </Text>
            <Text variant="bodyMedium" style={{ color: '#B0B0B0' }}>
              saves
            </Text>
          </View>
          <View style={styles.stats}>
            <Text variant="titleMedium" style={{ color: '#FFFFFF' }}>
              {comments.length}
            </Text>
            <Text variant="bodyMedium" style={{ color: '#B0B0B0' }}>
              comments
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <IconButton
            icon={() => (
              <MaterialCommunityIcons 
                name={isLiked ? 'heart' : 'heart-outline'} 
                size={24} 
                color={isLiked ? '#E91E63' : '#FFFFFF'} 
              />
            )}
            size={24}
            onPress={handleLike}
          />
          <IconButton
            icon={() => (
              <MaterialCommunityIcons 
                name={isSaved ? 'bookmark' : 'bookmark-outline'} 
                size={24} 
                color={isSaved ? '#9C27B0' : '#FFFFFF'} 
              />
            )}
            size={24}
            onPress={handleSave}
          />
          <IconButton
            icon={() => (
              <MaterialCommunityIcons 
                name="comment-outline" 
                size={24} 
                color="#FFFFFF" 
              />
            )}
            size={24}
            onPress={() => setCommentDialogVisible(true)}
          />
          <IconButton
            icon={() => (
              <MaterialCommunityIcons 
                name="share-variant" 
                size={24} 
                color="#FFFFFF" 
              />
            )}
            size={24}
            onPress={handleShare}
          />
        </View>

        <Divider style={[styles.divider, { backgroundColor: '#333333' }]} />

        {/* Comments Section */}
        <View style={styles.commentsSection}>
          <Text variant="titleMedium" style={[styles.sectionTitle, { color: '#FFFFFF' }]}>
            Comments
          </Text>
          {comments.length > 0 ? (
            comments.map((comment, index) => (
              <View key={comment._id || index} style={styles.comment}>
                <Avatar.Image
                  size={32}
                  source={{ uri: comment.author?.avatar || 'https://via.placeholder.com/32' }}
                />
                <View style={[styles.commentContent, { backgroundColor: '#2D2D2D' }]}>
                  <Text variant="bodyMedium" style={[styles.commentAuthor, { color: '#FFFFFF' }]}>
                    {comment.author?.username}
                  </Text>
                  <Text variant="bodyMedium" style={{ color: '#B0B0B0' }}>
                    {comment.text}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={[styles.emptyText, { color: '#B0B0B0' }]}>
              No comments yet
            </Text>
          )}
        </View>
      </Surface>

      {/* Comment Dialog */}
      <Portal>
        <Dialog
          visible={commentDialogVisible}
          onDismiss={() => setCommentDialogVisible(false)}
          style={{ backgroundColor: '#1E1E1E' }}
        >
          <Dialog.Title style={{ color: '#FFFFFF' }}>Add a comment</Dialog.Title>
          <Dialog.Content>
            <TextInput
              mode="outlined"
              value={newComment}
              onChangeText={setNewComment}
              placeholder="Write a comment..."
              multiline
              style={{ backgroundColor: '#2D2D2D' }}
              textColor="#FFFFFF"
              placeholderTextColor="#B0B0B0"
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setCommentDialogVisible(false)} textColor="#B0B0B0">Cancel</Button>
            <Button onPress={handleAddComment} textColor="#9C27B0">Post</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212', // Dark background
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
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
    backgroundColor: '#1E1E1E', // Slightly lighter dark background
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#FFFFFF', // White text
  },
  description: {
    lineHeight: 20,
    color: '#B0B0B0', // Light gray text
  },
  divider: {
    marginVertical: 16,
    backgroundColor: '#333333', // Dark divider
  },
  authorSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  authorInfo: {
    flex: 1,
    marginLeft: 12,
  },
  followers: {
    marginTop: 2,
    color: '#B0B0B0', // Light gray text
  },
  boardSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  boardImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  boardInfo: {
    flex: 1,
  },
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  stats: {
    alignItems: 'center',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  commentsSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#FFFFFF', // White text
  },
  comment: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  commentContent: {
    flex: 1,
    marginLeft: 8,
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#2D2D2D', // Darker background for comments
  },
  commentAuthor: {
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#FFFFFF', // White text
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 8,
    color: '#B0B0B0', // Light gray text
  },
});

export default PinDetailScreen; 