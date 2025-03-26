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
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';

const CreatePinScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { boardId, pinId } = route.params || {};
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    boardId: boardId || '',
  });
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBoards();
  }, []);

  const fetchBoards = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/boards', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch boards');
      }
      setBoards(data);
    } catch (error) {
      console.error('Error fetching boards:', error);
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

  const handleSubmit = async () => {
    if (!formData.title || !formData.imageUrl || !formData.boardId) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = await AsyncStorage.getItem('token');
      const url = pinId
        ? `http://localhost:3000/api/pins/${pinId}`
        : 'http://localhost:3000/api/pins';
      const method = pinId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create/update pin');
      }

      navigation.goBack();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.modalContainer}>
      <TouchableOpacity 
        style={styles.overlay} 
        activeOpacity={1} 
        onPress={() => navigation.goBack()}
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
              icon="close"
              size={24}
              onPress={() => navigation.goBack()}
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
                  <Text>Tap to select an image</Text>
                </View>
              )}
            </TouchableOpacity>

            <TextInput
              mode="outlined"
              label="Title"
              value={formData.title}
              onChangeText={(text) => setFormData({ ...formData, title: text })}
              style={styles.input}
            />

            <TextInput
              mode="outlined"
              label="Description"
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
              multiline
              numberOfLines={4}
              style={styles.input}
            />

            <TextInput
              mode="outlined"
              label="Board"
              value={boards.find(b => b._id === formData.boardId)?.name || ''}
              onPressIn={() => navigation.navigate('SelectBoard', {
                boards,
                selectedBoardId: formData.boardId,
                onSelect: (boardId) => setFormData({ ...formData, boardId }),
              })}
              editable={false}
              right={<TextInput.Icon icon="chevron-down" />}
              style={styles.input}
            />

            <Button
              mode="contained"
              onPress={handleSubmit}
              loading={loading}
              style={styles.button}
            >
              {pinId ? 'Update Pin' : 'Create Pin'}
            </Button>
          </ScrollView>
        </TouchableOpacity>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  overlayTouchable: {
    flex: 1,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
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
    borderBottomColor: '#E0E0E0',
  },
  closeButton: {
    margin: 0,
  },
  scrollContent: {
    padding: 16,
  },
  title: {
    fontWeight: 'bold',
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
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
    marginBottom: 16,
  },
});

export default CreatePinScreen; 