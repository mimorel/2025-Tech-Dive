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
import { pinsAPI, authAPI } from '../services/api';

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
  const [currentUser, setCurrentUser] = useState(null);
  const [error, setError] = useState(null);
  const [commentAuthors, setCommentAuthors] = useState({});

  useEffect(() => {
    console.log('PinDetailScreen mounted with pinId:', pinId);
    const getCurrentUser = async () => {
      try {
        const userData = await AsyncStorage.getItem('userData');
        if (userData) {
          const parsedUser = JSON.parse(userData);
          console.log('Retrieved current user:', parsedUser);
          setCurrentUser(parsedUser);
        }
      } catch (error) {
        console.error('Error getting current user:', error);
      }
    };

    getCurrentUser();
  }, []);

  const fetchUserDetails = async (userId) => {
    try {
      console.log('Fetching user details for userId:', userId);
      const userData = await authAPI.getUserById(userId);
      console.log('Fetched user details:', userData);
      return userData;
    } catch (error) {
      console.error('Error fetching user details:', error);
      return null;
    }
  };

  const fetchPinDetails = async () => {
    try {
      console.log('Fetching pin details for pinId:', pinId);
      setLoading(true);
      const response = await pinsAPI.getPinById(pinId);
      
      // Detailed logging of the API response
      console.log('=== FULL PIN DATA ===');
      console.log(JSON.stringify(response, null, 2));
      
      if (!response) {
        throw new Error('No pin data received');
      }

      setPin(response);
      
      // Check if current user has liked or saved the pin
      if (currentUser && response) {
        setIsLiked(response.likes?.includes(currentUser._id) || false);
        setIsSaved(response.saves?.includes(currentUser._id) || false);
      }
      
      // Set comments, ensuring it's an array
      const commentsArray = Array.isArray(response.comments) ? response.comments : [];
      setComments(commentsArray);

      // Log comments data to see structure
      console.log('=== COMMENTS DATA ===');
      console.log(JSON.stringify(commentsArray, null, 2));

      // Fetch user details for each comment author
      const authorIds = [...new Set(commentsArray.map(comment => {
        console.log('=== Testing getUserById ===');
        console.log('Raw comment:', JSON.stringify(comment, null, 2));
        console.log('Comment user field:', comment.user);
        return comment.user;
      }))].filter(id => id); // Remove any undefined/null values

      console.log('Unique author IDs:', authorIds);
      const authorDetails = {};
      
      for (const authorId of authorIds) {
        if (authorId) {
          try {
            console.log('=== Testing getUserById API Call ===');
            console.log('Attempting to fetch user with ID:', authorId);
            console.log('ID type:', typeof authorId);
            console.log('Current authorDetails:', JSON.stringify(authorDetails, null, 2));
            
            const userData = await authAPI.getUserById(authorId);
            console.log('API Response received:', JSON.stringify(userData, null, 2));
            
            if (userData && userData.username) {
              authorDetails[authorId] = {
                username: userData.username,
                avatarUrl: userData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.username)}&background=9C27B0&color=fff`
              };
              console.log('Successfully added author details:', JSON.stringify(authorDetails[authorId], null, 2));
              console.log('Updated authorDetails:', JSON.stringify(authorDetails, null, 2));
            } else {
              console.error('Invalid user data received:', JSON.stringify(userData, null, 2));
            }
          } catch (error) {
            console.error('=== getUserById Error ===');
            console.error('Error fetching user details for ID:', authorId);
            console.error('Error details:', error);
            console.error('Error stack:', error.stack);
          }
        }
      }
      
      console.log('=== Final Author Details ===');
      console.log(JSON.stringify(authorDetails, null, 2));
      setCommentAuthors(authorDetails);
    } catch (err) {
      console.error('Error fetching pin details:', err);
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (pinId) {
      console.log('pinId changed, fetching details...');
      fetchPinDetails();
    }
  }, [pinId, currentUser]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPinDetails();
  };

  const handleLike = async () => {
    if (!currentUser) {
      // Handle not logged in state
      return;
    }

    try {
      // Simulate API call
      setIsLiked(!isLiked);
      setPin(prev => ({
        ...prev,
        likes: isLiked
          ? prev.likes.filter(id => id !== currentUser._id)
          : [...prev.likes, currentUser._id],
      }));
    } catch (error) {
      console.error('Error liking pin:', error);
    }
  };

  const handleSave = async () => {
    if (!currentUser) {
      // Handle not logged in state
      return;
    }

    try {
      // Simulate API call
      setIsSaved(!isSaved);
      setPin(prev => ({
        ...prev,
        saves: isSaved
          ? prev.saves.filter(id => id !== currentUser._id)
          : [...prev.saves, currentUser._id],
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
    if (!newComment.trim() || !currentUser) return;

    try {
      // Simulate API call
      const newCommentObj = {
        _id: `comment${Date.now()}`,
        text: newComment,
        author: currentUser,
        createdAt: new Date().toISOString(),
      };
      
      setComments(prev => [...prev, newCommentObj]);
      setNewComment('');
      setCommentDialogVisible(false);
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  if (loading) {
    console.log('Rendering loading state');
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#9C27B0" />
      </View>
    );
  }

  if (error) {
    console.log('Rendering error state:', error);
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={{ color: '#FFFFFF' }}>Error: {error}</Text>
        <Button onPress={fetchPinDetails} style={styles.retryButton}>
          Retry
        </Button>
      </View>
    );
  }

  if (!pin) {
    console.log('Rendering no pin state');
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={{ color: '#FFFFFF' }}>Pin not found</Text>
      </View>
    );
  }

  console.log('Rendering pin details:', pin);
  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Image
          source={{ uri: pin.imageUrl }}
          style={styles.pinImage}
          resizeMode="cover"
        />

        <Surface style={styles.content}>
          {/* Header Actions */}
          <View style={styles.headerActions}>
            <IconButton
              icon={() => <MaterialCommunityIcons name="dots-horizontal" size={24} color="#FFFFFF" />}
              onPress={() => setMenuVisible(true)}
            />
            <Menu
              visible={menuVisible}
              onDismiss={() => setMenuVisible(false)}
              anchor={<View />}
              style={{ backgroundColor: '#1E1E1E' }}
            >
              <Menu.Item 
                onPress={handleShare} 
                title="Share" 
                leadingIcon={() => <MaterialCommunityIcons name="share" size={24} color="#FFFFFF" />}
                titleStyle={{ color: '#FFFFFF' }}
              />
              <Menu.Item 
                onPress={handleCopyLink} 
                title="Copy link" 
                leadingIcon={() => <MaterialCommunityIcons name="link" size={24} color="#FFFFFF" />}
                titleStyle={{ color: '#FFFFFF' }}
              />
              <Menu.Item 
                onPress={handleReport} 
                title="Report" 
                leadingIcon={() => <MaterialCommunityIcons name="flag" size={24} color="#FFFFFF" />}
                titleStyle={{ color: '#FFFFFF' }}
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

          {/* Author Info */}
          <TouchableOpacity
            style={styles.authorSection}
            onPress={() => navigation.navigate('Profile', { userId: pin.user._id })}
          >
            <Avatar.Image
              source={{ uri: pin.user.avatarUrl || 'https://via.placeholder.com/150' }}
              size={40}
            />
            <View style={styles.authorInfo}>
              <Text variant="titleMedium" style={{ color: '#FFFFFF' }}>
                {pin.user.name}
              </Text>
              <Text variant="bodyMedium" style={{ color: '#B0B0B0' }}>
                {pin.user.title}
              </Text>
            </View>
          </TouchableOpacity>

          <Divider style={[styles.divider, { backgroundColor: '#333333' }]} />

          {/* Tags */}
          <View style={styles.tagsContainer}>
            {pin.tags?.map((tag, index) => (
              <Chip
                key={index}
                style={[styles.tag, { backgroundColor: '#333333' }]}
                textStyle={{ color: '#FFFFFF' }}
                onPress={() => navigation.navigate('Search', { query: tag })}
              >
                {tag}
              </Chip>
            ))}
          </View>

          <Divider style={[styles.divider, { backgroundColor: '#333333' }]} />

          {/* Stats and Actions */}
          <View style={styles.statsContainer}>
            <View style={styles.stats}>
              <Text style={[styles.statCount, { color: '#FFFFFF' }]}>
                {pin.likes?.length || 0}
              </Text>
              <Text style={[styles.statLabel, { color: '#B0B0B0' }]}>likes</Text>
            </View>
            <View style={styles.stats}>
              <Text style={[styles.statCount, { color: '#FFFFFF' }]}>
                {pin.saves?.length || 0}
              </Text>
              <Text style={[styles.statLabel, { color: '#B0B0B0' }]}>saves</Text>
            </View>
            <View style={styles.stats}>
              <Text style={[styles.statCount, { color: '#FFFFFF' }]}>
                {comments.length}
              </Text>
              <Text style={[styles.statLabel, { color: '#B0B0B0' }]}>comments</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <Button
              mode={isLiked ? "contained" : "outlined"}
              onPress={handleLike}
              style={[
                styles.actionButton,
                {
                  backgroundColor: isLiked ? '#9C27B0' : 'transparent',
                  borderColor: '#9C27B0'
                }
              ]}
              icon={() => (
                <MaterialCommunityIcons
                  name={isLiked ? "heart" : "heart-outline"}
                  size={24}
                  color={isLiked ? "#FFFFFF" : "#9C27B0"}
                />
              )}
            >
              {isLiked ? 'Liked' : 'Like'}
            </Button>
            <Button
              mode={isSaved ? "contained" : "outlined"}
              onPress={handleSave}
              style={[
                styles.actionButton,
                {
                  backgroundColor: isSaved ? '#9C27B0' : 'transparent',
                  borderColor: '#9C27B0'
                }
              ]}
              icon={() => (
                <MaterialCommunityIcons
                  name={isSaved ? "bookmark" : "bookmark-outline"}
                  size={24}
                  color={isSaved ? "#FFFFFF" : "#9C27B0"}
                />
              )}
            >
              {isSaved ? 'Saved' : 'Save'}
            </Button>
          </View>

          <Divider style={[styles.divider, { backgroundColor: '#333333' }]} />

          {/* Comments Section */}
          <View style={styles.commentsSection}>
            <View style={styles.commentHeader}>
              <Text variant="titleMedium" style={{ color: '#FFFFFF' }}>
                Comments
              </Text>
              <Button
                mode="text"
                onPress={() => setCommentDialogVisible(true)}
                textColor="#9C27B0"
              >
                Add Comment
              </Button>
            </View>

            {Array.isArray(comments) && comments.length > 0 ? (
              comments.map((comment, index) => {
                const authorId = comment.user;
                const authorData = commentAuthors[authorId];
                console.log('Rendering comment:', {
                  commentId: comment._id,
                  authorId,
                  authorData,
                  comment
                });
                return (
                  <View key={comment._id || index} style={styles.commentItem}>
                    <Avatar.Image
                      source={{ 
                        uri: authorData?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(authorData?.username || 'User')}&background=9C27B0&color=fff`
                      }}
                      size={32}
                    />
                    <View style={styles.commentContent}>
                      <Text variant="titleSmall" style={{ color: '#FFFFFF' }}>
                        {authorData?.username || 'Loading...'}
                      </Text>
                      <Text variant="bodyMedium" style={{ color: '#B0B0B0' }}>
                        {comment.text || ''}
                      </Text>
                      <Text variant="bodySmall" style={{ color: '#666666' }}>
                        {comment.createdAt ? new Date(comment.createdAt).toLocaleDateString() : 'Unknown date'}
                      </Text>
                    </View>
                  </View>
                );
              })
            ) : (
              <Text style={{ color: '#B0B0B0', textAlign: 'center', marginTop: 16 }}>
                No comments yet. Be the first to comment!
              </Text>
            )}
          </View>
        </Surface>
      </ScrollView>

      {/* Comment Dialog */}
      <Portal>
        <Dialog
          visible={commentDialogVisible}
          onDismiss={() => setCommentDialogVisible(false)}
          style={{ backgroundColor: '#1E1E1E' }}
        >
          <Dialog.Title style={{ color: '#FFFFFF' }}>Add Comment</Dialog.Title>
          <Dialog.Content>
            <TextInput
              value={newComment}
              onChangeText={setNewComment}
              mode="outlined"
              multiline
              numberOfLines={3}
              placeholder="Write your comment..."
              style={{ backgroundColor: '#333333' }}
              textColor="#FFFFFF"
              placeholderTextColor="#666666"
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setCommentDialogVisible(false)} textColor="#9C27B0">
              Cancel
            </Button>
            <Button onPress={handleAddComment} textColor="#9C27B0">
              Post
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
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  pinImage: {
    width: width,
    height: width,
    backgroundColor: '#1E1E1E',
  },
  content: {
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    marginTop: -16,
    backgroundColor: '#1E1E1E',
    minHeight: width, // Ensure content takes at least the height of the image
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 16,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    marginBottom: 8,
  },
  description: {
    lineHeight: 24,
  },
  authorSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  authorInfo: {
    marginLeft: 12,
    flex: 1,
  },
  divider: {
    marginVertical: 16,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    marginRight: 8,
    marginBottom: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 16,
  },
  stats: {
    alignItems: 'center',
  },
  statCount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  actionButton: {
    flex: 1,
  },
  commentsSection: {
    marginTop: 16,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  commentContent: {
    marginLeft: 12,
    flex: 1,
  },
  retryButton: {
    marginTop: 16,
  },
});

export default PinDetailScreen; 