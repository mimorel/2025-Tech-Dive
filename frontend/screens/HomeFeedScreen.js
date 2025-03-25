import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Dimensions,
  RefreshControl,
  useWindowDimensions,
} from 'react-native';
import { Text, Card, ActivityIndicator, FAB, Searchbar, Chip, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { dummyPins } from '../data/dummyData';

const MIN_COLUMN_WIDTH = 150; // Minimum width for each column
const GRID_PADDING = 8; // Padding around the grid
const CARD_MARGIN = 4; // Margin around each card

const CATEGORIES = [
  { id: 'all', label: 'All', icon: 'apps' },
  { id: 'interior', label: 'Interior Design', icon: 'home-variant' },
  { id: 'food', label: 'Food', icon: 'food' },
  { id: 'travel', label: 'Travel', icon: 'airplane' },
  { id: 'tech', label: 'Technology', icon: 'laptop' },
  { id: 'architecture', label: 'Architecture', icon: 'office-building' },
  { id: 'nature', label: 'Nature', icon: 'tree' }
];

const HomeFeedScreen = () => {
  const navigation = useNavigation();
  const theme = useTheme();
  const { width: screenWidth } = useWindowDimensions();
  const [pins, setPins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

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

  const filterPins = useCallback(() => {
    return pins.filter(pin => {
      const matchesSearch = searchQuery === '' ||
        pin.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pin.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const category = CATEGORIES.find(cat => cat.id === selectedCategory);
      const matchesCategory = selectedCategory === 'all' ||
        pin.title.includes(category.label) ||
        pin.description.includes(category.label);

      return matchesSearch && matchesCategory;
    });
  }, [pins, searchQuery, selectedCategory]);

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
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  const filteredPins = filterPins();

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search pins..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          iconColor={theme.colors.primary}
          placeholderTextColor={theme.colors.placeholder}
          inputStyle={styles.searchInput}
          icon={({ size, color }) => (
            <MaterialCommunityIcons name="magnify" size={size} color={color} />
          )}
          clearIcon={({ size, color }) => (
            <MaterialCommunityIcons name="close" size={size} color={color} />
          )}
        />
      </View>
      
      <View style={styles.categoriesContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={CATEGORIES}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Chip
              selected={selectedCategory === item.id}
              onPress={() => setSelectedCategory(item.id)}
              style={styles.categoryChip}
              selectedColor={theme.colors.primary}
              textStyle={styles.chipText}
              icon={({ size, color }) => (
                <MaterialCommunityIcons 
                  name={item.icon} 
                  size={size - 4} 
                  color={color}
                  style={styles.chipIcon}
                />
              )}
            >
              {item.label}
            </Chip>
          )}
          contentContainerStyle={styles.categoriesList}
        />
      </View>

      <FlatList
        data={filteredPins}
        renderItem={renderPin}
        keyExtractor={(item) => item._id}
        numColumns={numColumns}
        key={numColumns} // Force re-render when number of columns changes
        contentContainerStyle={[styles.list, { padding: GRID_PADDING }]}
        columnWrapperStyle={styles.columnWrapper}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
          />
        }
        ListEmptyComponent={
          <Text style={[styles.emptyText, { color: theme.colors.placeholder }]}>
            No pins found
          </Text>
        }
      />
      <FAB
        icon={({ size, color }) => (
          <MaterialCommunityIcons name="plus" size={size} color={color} />
        )}
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        color="white"
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
  searchContainer: {
    padding: 8,
    backgroundColor: '#fff',
    elevation: 2,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  searchBar: {
    elevation: 0,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  searchInput: {
    fontSize: 14,
  },
  categoriesContainer: {
    backgroundColor: '#fff',
    elevation: 2,
    marginBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  categoriesList: {
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  categoryChip: {
    marginRight: 8,
    backgroundColor: '#f5f5f5',
  },
  chipText: {
    fontSize: 12,
  },
  chipIcon: {
    marginLeft: 4,
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
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default HomeFeedScreen; 