import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import {
  Text,
  Surface,
  useTheme,
  ActivityIndicator,
  Button,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { pinsAPI } from '../services/api';

const { width } = Dimensions.get('window');
const numColumns = 2;
const pinSize = (width - 48) / numColumns;

const HomeScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const [pins, setPins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchPins = async () => {
    try {
      setLoading(true);
      const response = await pinsAPI.getAllPins();
      console.log('Fetched pins:', JSON.stringify(response, null, 2));
      setPins(response.pins);
    } catch (err) {
      console.error('Error fetching pins:', err);
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPins();
    const unsubscribe = navigation.addListener('refreshHome', () => {
      fetchPins();
    });
    return unsubscribe;
  }, [navigation]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPins();
  };

  const renderPin = (pin) => {
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

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#9C27B0" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={{ color: '#FFFFFF' }}>Error: {error}</Text>
        <Button onPress={fetchPins} style={styles.retryButton}>
          Retry
        </Button>
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
      <View style={styles.pinsGrid}>
        {pins.map(renderPin)}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  pinsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    justifyContent: 'space-between',
  },
  pinCard: {
    width: pinSize,
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
  retryButton: {
    marginTop: 16,
  },
});

export default HomeScreen; 