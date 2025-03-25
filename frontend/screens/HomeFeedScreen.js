import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  Dimensions,
  useWindowDimensions,
} from 'react-native';
import { Text, Card, ActivityIndicator, FAB } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { dummyPins } from '../data/dummyData';

const MIN_COLUMN_WIDTH = 150; // Minimum width for each column
const GRID_PADDING = 8; // Padding around the grid
const CARD_MARGIN = 4; // Margin around each card

const HomeFeedScreen = () => {
  const navigation = useNavigation();
  const { width: screenWidth } = useWindowDimensions();
  const [pins, setPins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Calculate number of columns based on screen width
  const numColumns = Math.max(2, Math.floor((screenWidth - (GRID_PADDING * 2)) / MIN_COLUMN_WIDTH));
  const columnWidth = (screenWidth - (GRID_PADDING * 2) - (CARD_MARGIN * 2 * numColumns)) / numColumns;

  const fetchPins = async () => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      setPins(dummyPins);
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
      style={[styles.card, { width: columnWidth }]}
      onPress={() => navigation.navigate('PinDetail', { pinId: item._id })}
    >
      <Card.Cover 
        source={{ uri: item.imageUrl }} 
        style={[styles.image, { height: columnWidth * 1.3 }]} // 1.3 aspect ratio
      />
      <Card.Title
        title={item.title}
        subtitle={item.author.username}
        titleNumberOfLines={1}
        subtitleNumberOfLines={1}
        titleStyle={styles.cardTitle}
        subtitleStyle={styles.cardSubtitle}
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
        key={numColumns} // Force re-render when number of columns changes
        contentContainerStyle={[styles.list, { padding: GRID_PADDING }]}
        columnWrapperStyle={styles.columnWrapper}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>No pins found</Text>
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
    alignItems: 'flex-start',
  },
  columnWrapper: {
    justifyContent: 'flex-start',
  },
  card: {
    margin: CARD_MARGIN,
    elevation: 2,
  },
  image: {
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  cardTitle: {
    fontSize: 12,
    lineHeight: 16,
  },
  cardSubtitle: {
    fontSize: 10,
    lineHeight: 14,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 32,
    color: '#666',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default HomeFeedScreen; 