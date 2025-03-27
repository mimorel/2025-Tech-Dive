import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Platform,
  Modal,
} from 'react-native';
import { TextInput, Button, Text, Surface, HelperText, IconButton } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getCurrentUser, dummyBoards } from '../data/dummyData';

const CreatePinScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { boardId: initialBoardId, pinId } = route.params || {};
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    boardId: initialBoardId || '',
  });
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [modalVisible, setModalVisible] = useState(true);

  useEffect(() => {
    fetchBoards();
    if (initialBoardId) {
      console.log('Initial board ID from params:', initialBoardId);
    }
  }, [initialBoardId]);

  const fetchBoards = async () => {
    try {
      const currentUser = getCurrentUser();
      // Filter boards to only show those created by the current user
      const userBoards = dummyBoards.filter(board => board.author._id === currentUser._id);
      console.log('Fetched boards:', userBoards);
      
      if (!userBoards || userBoards.length === 0) {
        console.log('No boards found. User needs to create a board first.');
        setError('Please create a board first before creating a pin');
      } else {
        setBoards(userBoards);
      }
    } catch (error) {
      console.error('Error fetching boards:', error);
      setError('Failed to load boards. Please try again.');
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        setFormData({ ...formData, imageUrl: result.assets[0].uri });
      }
    } catch (error) {
      console.error('Error picking image:', error);
    }
  };

  const closeModal = () => {
    setModalVisible(false);
    navigation.goBack();
  };

  const handleSubmit = async () => {
    console.log('Submitting form data:', formData);
    if (!formData.title || !formData.imageUrl || !formData.boardId) {
      console.log('Missing fields:', {
        title: !formData.title,
        imageUrl: !formData.imageUrl,
        boardId: !formData.boardId
      });
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Create new pin with dummy data
      const currentUser = getCurrentUser();
      const selectedBoard = dummyBoards.find(board => board._id === formData.boardId);
      
      if (!selectedBoard) {
        throw new Error('Selected board not found');
      }

      const newPin = {
        _id: `pin_${Date.now()}`,
        title: formData.title,
        description: formData.description,
        imageUrl: formData.imageUrl,
        author: currentUser,
        board: selectedBoard,
        likes: [],
        saves: [],
        comments: [],
        createdAt: new Date().toISOString(),
        isLiked: false,
        isSaved: false,
      };

      console.log('Created dummy pin:', newPin);
      
      // Add the new pin to the board's pins array
      selectedBoard.pins.push(newPin);
      
      // Navigate back to the previous screen with a refresh parameter
      navigation.navigate('Home', { refresh: true });
      navigation.navigate('Profile', { refresh: true });

      // Close the modal
      closeModal();
    } catch (error) {
      console.error('Error creating pin:', error);
      setError(error.message || 'Failed to create pin. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={closeModal}
    >
      <View style={styles.modalContainer}>
        <TouchableOpacity 
          style={styles.overlay} 
          activeOpacity={1} 
          onPress={closeModal}
        >
          <TouchableOpacity 
            style={styles.modalContent}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalHeader}>
              <Text variant="headlineSmall" style={styles.title}>
                {pinId ? 'Edit Pin' : 'Create Pin'}
              </Text>
              <IconButton
                icon={() => <MaterialCommunityIcons name="close" size={24} color="#FFFFFF" />}
                size={24}
                onPress={closeModal}
                style={styles.closeButton}
              />
            </View>

            <ScrollView style={styles.scrollContent}>
              {error ? <HelperText type="error">{error}</HelperText> : null}

              <TouchableOpacity onPress={pickImage} style={styles.imageContainer}>
                {formData.imageUrl ? (
                  <Image
                    source={{ uri: formData.imageUrl }}
                    style={styles.image}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.imagePlaceholder}>
                    <MaterialCommunityIcons name="image-plus" size={40} color="#666666" />
                    <Text style={styles.placeholderText}>Tap to select an image</Text>
                  </View>
                )}
              </TouchableOpacity>

              <TextInput
                mode="outlined"
                label="Title"
                value={formData.title}
                onChangeText={(text) => setFormData({ ...formData, title: text })}
                style={styles.input}
                theme={{ colors: { text: '#FFFFFF', placeholder: '#666666' } }}
                outlineColor="#333333"
                activeOutlineColor="#FFFFFF"
              />

              <TextInput
                mode="outlined"
                label="Description"
                value={formData.description}
                onChangeText={(text) => setFormData({ ...formData, description: text })}
                multiline
                numberOfLines={4}
                style={styles.input}
                theme={{ colors: { text: '#FFFFFF', placeholder: '#666666' } }}
                outlineColor="#333333"
                activeOutlineColor="#FFFFFF"
              />

              <TextInput
                mode="outlined"
                label="Board"
                value={boards.find(b => b._id === formData.boardId)?.name || ''}
                onPress={() => {
                  if (boards.length === 0) {
                    navigation.navigate('CreateBoard');
                    return;
                  }
                  console.log('Opening SelectBoard with boards:', boards);
                  console.log('Current formData:', formData);
                  navigation.navigate('SelectBoard', {
                    boards,
                    selectedBoardId: formData.boardId,
                    onSelect: (boardId) => {
                      console.log('Selected board:', boardId);
                      setFormData(prevData => {
                        console.log('Updating formData with new boardId:', boardId);
                        return { ...prevData, boardId };
                      });
                    },
                  });
                }}
                editable={false}
                right={<TextInput.Icon icon={() => <MaterialCommunityIcons name="chevron-down" size={24} color="#FFFFFF" />} />}
                style={styles.input}
                theme={{ colors: { text: '#FFFFFF', placeholder: '#666666' } }}
                outlineColor="#333333"
                activeOutlineColor="#FFFFFF"
              />
              {boards.length === 0 && (
                <Button
                  mode="outlined"
                  onPress={() => navigation.navigate('CreateBoard')}
                  style={styles.createBoardButton}
                  textColor="#FFFFFF"
                  icon={() => <MaterialCommunityIcons name="plus" size={24} color="#FFFFFF" />}
                >
                  Create New Board
                </Button>
              )}

              <Button
                mode="contained"
                onPress={handleSubmit}
                loading={loading}
                style={styles.button}
                buttonColor="#E60023"
                textColor="#FFFFFF"
              >
                {pinId ? 'Update Pin' : 'Create Pin'}
              </Button>
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1A1A1A',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  closeButton: {
    margin: 0,
  },
  scrollContent: {
    padding: 16,
  },
  title: {
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  imageContainer: {
    width: '100%',
    height: 200,
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#333333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#666666',
    marginTop: 8,
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#1A1A1A',
  },
  button: {
    marginTop: 8,
    marginBottom: 16,
  },
  createBoardButton: {
    marginTop: 8,
    marginBottom: 16,
  },
});

export default CreatePinScreen; 