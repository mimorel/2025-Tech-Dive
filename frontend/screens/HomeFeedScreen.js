import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { Text, Card, ActivityIndicator, FAB } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const numColumns = 2;
const itemWidth = width / numColumns - 16;

const HomeFeedScreen = () => {
  const navigation = useNavigation();
  const [pins, setPins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPins = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/pins');
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch pins');
      }
      setPins(data);
    } catch (error) {
      console.error('Error fetching pins:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPins();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPins();
  };

  const renderPin = ({ item }) => (
    <Card
      style={styles.card}
      onPress={() => navigation.navigate('PinDetail', { pinId: item._id })}
    >
      <Card.Cover source={{ uri: item.imageUrl }} style={styles.image} />
      <Card.Title
        title={item.title}
        subtitle={item.author.username}
        titleNumberOfLines={2}
        style={styles.cardTitle}
      />
    </Card>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={pins}
        renderItem={renderPin}
        keyExtractor={(item) => item._id}
        numColumns={numColumns}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate('CreatePin')}
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
  list: {
    padding: 8,
  },
  card: {
    width: itemWidth,
    margin: 8,
    elevation: 4,
  },
  image: {
    height: itemWidth,
  },
  cardTitle: {
    padding: 8,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default HomeFeedScreen; 