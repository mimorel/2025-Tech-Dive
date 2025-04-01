import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Dimensions,
  RefreshControl,
  useWindowDimensions,
  Image,
  TouchableOpacity,
} from 'react-native';
import { Text, Card, ActivityIndicator, FAB, Searchbar, Chip, useTheme, IconButton } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getFeed } from '../services/api';
import config from '../config';

const MIN_COLUMN_WIDTH = 150; // Minimum width for each column
const GRID_PADDING = 8; // Padding around the grid
const CARD_MARGIN = 4; // Margin around each card

const CATEGORIES = [
  { id: 'all', label: 'All', icon: 'apps' },
  { id: 'diy & crafts', label: 'DIY & Crafts', icon: 'hammer-wrench' },
  { id: 'food & drinks', label: 'Food & Drinks', icon: 'food' },
  { id: 'travel', label: 'Travel', icon: 'airplane' },
  { id: 'fashion', label: 'Fashion', icon: 'hanger' },
  { id: 'technology', label: 'Technology', icon: 'laptop' },
  { id: 'art & design', label: 'Art & Design', icon: 'palette' },
  { id: 'nature', label: 'Nature', icon: 'tree' },
  { id: 'sports', label: 'Sports', icon: 'basketball' },
  { id: 'home & garden', label: 'Home & Garden', icon: 'home' },
  { id: 'inspiration', label: 'Inspiration', icon: 'lightbulb-on' },
  { id: 'creative', label: 'Creative', icon: 'brush' }
];

const DARK_PURPLE_GREY = '#2F2F3E';
const LIGHT_PURPLE_GREY = '#3A3A4C';

const HomeFeedScreen = () => {
  const navigation = useNavigation();
  const theme = useTheme();
  const { width: screenWidth } = useWindowDimensions();
  const [pins, setPins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);

  // Calculate number of columns based on screen width
  const numColumns = Math.max(2, Math.floor((screenWidth - (GRID_PADDING * 2)) / MIN_COLUMN_WIDTH));
  const columnWidth = (screenWidth - (GRID_PADDING * 2) - (CARD_MARGIN * 2 * numColumns)) / numColumns;

  const fetchPins = useCallback(async (pageNum = 1, shouldRefresh = false) => {
    try {
      setError(null);
      const newPins = await getFeed(pageNum);
      
      if (shouldRefresh) {
        setPins(newPins);
      } else {
        setPins(prevPins => [...prevPins, ...newPins]);
      }
      
      setHasMore(newPins.length === 20); // If we get less than 20 pins, we've reached the end
      setPage(pageNum);
    } catch (err) {
      console.error('Error fetching pins:', err);
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchPins(1, true);
  }, [fetchPins]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchPins(1, true);
  }, [fetchPins]);

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchPins(page + 1);
    }
  };

  const filterPins = useCallback(() => {
    return pins.filter(pin => {
      // Search filter
      const matchesSearch = searchQuery === '' ||
        pin.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pin.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Category filter
      const matchesCategory = selectedCategory === 'all' ||
        pin.tags.some(tag => {
          // Handle special cases for category matching
          if (selectedCategory === 'food & drinks') {
            return tag.toLowerCase().includes('food') || tag.toLowerCase().includes('drink');
          }
          if (selectedCategory === 'art & design') {
            return tag.toLowerCase().includes('art') || tag.toLowerCase().includes('design');
          }
          if (selectedCategory === 'home & garden') {
            return tag.toLowerCase().includes('home') || tag.toLowerCase().includes('garden');
          }
          return tag.toLowerCase() === selectedCategory.toLowerCase();
        });

      return matchesSearch && matchesCategory;
    });
  }, [pins, searchQuery, selectedCategory]);

  const renderPin = ({ item }) => (
    <Card style={[styles.pinContainer, { width: columnWidth }]}>
      <Card.Cover 
        source={{ uri: item.imageUrl }}
        style={[styles.pinImage, { height: columnWidth * 1.3 }]} // 1.3 aspect ratio
      />
      <Card.Title
        title={item.title}
        subtitle={item.description}
        titleNumberOfLines={1}
        subtitleNumberOfLines={2}
        style={styles.pinInfo}
        titleStyle={styles.cardTitle}
        subtitleStyle={styles.cardSubtitle}
      />
    </Card>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  const filteredPins = filterPins();

  return (
    <View style={styles.container}>
      <View style={[styles.searchContainer, { backgroundColor: DARK_PURPLE_GREY }]}>
        <View style={styles.searchHeader}>
          <Searchbar
            placeholder="Search pins..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={[styles.searchBar, { backgroundColor: LIGHT_PURPLE_GREY }]}
            iconColor="#fff"
            placeholderTextColor="rgba(255, 255, 255, 0.6)"
            inputStyle={{ color: '#fff' }}
            icon={({ size }) => (
              <MaterialCommunityIcons name="magnify" size={size} color="#fff" />
            )}
            clearIcon={({ size }) => (
              <MaterialCommunityIcons name="close" size={size} color="#fff" />
            )}
          />
          <IconButton
            icon={({ size }) => (
              <MaterialCommunityIcons name="cog" size={size} color="#fff" />
            )}
            size={24}
            onPress={() => navigation.navigate('Settings')}
            style={styles.iconButton}
          />
          <IconButton
            icon={({ size }) => (
              <MaterialCommunityIcons name="account-circle" size={size} color="#fff" />
            )}
            size={24}
            onPress={() => navigation.navigate('Profile')}
            style={styles.iconButton}
          />
        </View>
      </View>
      
      <View style={[styles.categoriesContainer, { backgroundColor: DARK_PURPLE_GREY }]}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={CATEGORIES}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Chip
              selected={selectedCategory === item.id}
              onPress={() => setSelectedCategory(item.id)}
              style={[
                styles.categoryChip,
                { backgroundColor: LIGHT_PURPLE_GREY },
                selectedCategory === item.id && { backgroundColor: theme.colors.primary }
              ]}
              textStyle={{ 
                color: selectedCategory === item.id ? '#fff' : 'rgba(255, 255, 255, 0.9)',
                fontSize: 12
              }}
              icon={({ size }) => (
                <MaterialCommunityIcons 
                  name={item.icon} 
                  size={size - 4} 
                  color={selectedCategory === item.id ? '#fff' : 'rgba(255, 255, 255, 0.9)'}
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
        keyExtractor={item => item._id}
        numColumns={numColumns}
        key={numColumns} // Force re-render when number of columns changes
        contentContainerStyle={[styles.list, { padding: GRID_PADDING }]}
        columnWrapperStyle={styles.columnWrapper}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={() =>
          loading && hasMore ? (
            <ActivityIndicator style={styles.footerLoader} size="small" color={theme.colors.primary} />
          ) : null
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
    elevation: 2,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  searchBar: {
    flex: 1,
    elevation: 0,
    borderRadius: 8,
  },
  categoriesContainer: {
    elevation: 2,
    marginBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  categoriesList: {
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  categoryChip: {
    marginRight: 8,
  },
  list: {
    paddingBottom: 16,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: CARD_MARGIN * 2,
  },
  pinContainer: {
    margin: CARD_MARGIN,
    elevation: 2,
  },
  pinImage: {
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  pinInfo: {
    padding: 8,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  cardSubtitle: {
    fontSize: 12,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
  },
  footerLoader: {
    marginVertical: 16,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  iconButton: {
    marginLeft: 8,
  },
});

export default HomeFeedScreen; 