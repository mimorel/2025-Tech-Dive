import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Dimensions,
} from 'react-native';
import { Text, Surface, ActivityIndicator, FAB } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');
const numColumns = 2;
const itemWidth = width / numColumns - 16;

const SelectBoardScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { boards, selectedBoardId, onSelect } = route.params;
  const [loading, setLoading] = useState(false);

  const handleSelect = (boardId) => {
    onSelect(boardId);
    navigation.goBack();
  };

  const renderBoard = ({ item }) => (
    <Surface
      style={[
        styles.boardCard,
        selectedBoardId === item._id && styles.selectedBoard,
      ]}
      onPress={() => handleSelect(item._id)}
    >
      <Surface.Cover
        source={{ uri: item.coverImage || 'https://via.placeholder.com/300' }}
        style={styles.boardImage}
      />
      <Surface.Title
        title={item.name}
        subtitle={`${item.pins?.length || 0} pins`}
        titleNumberOfLines={2}
        style={styles.boardTitle}
      />
    </Surface>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.title}>
          Select Board
        </Text>
        <Text variant="bodyLarge" style={styles.subtitle}>
          Choose a board to save your pin
        </Text>
      </View>

      <FlatList
        data={boards}
        renderItem={renderBoard}
        keyExtractor={(item) => item._id}
        numColumns={numColumns}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No boards found</Text>
        }
      />

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate('CreateBoard')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    elevation: 4,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    color: '#666',
  },
  list: {
    padding: 8,
  },
  boardCard: {
    width: itemWidth,
    margin: 8,
    elevation: 4,
  },
  selectedBoard: {
    borderColor: '#E60023',
    borderWidth: 2,
  },
  boardImage: {
    height: itemWidth,
  },
  boardTitle: {
    padding: 8,
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

export default SelectBoardScreen; 