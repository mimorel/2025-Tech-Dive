import React, { useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';

const HomeScreen = () => {
  const navigation = useNavigation();

  useEffect(() => {
    fetchPins();
    const unsubscribe = navigation.addListener('refreshHome', () => {
      fetchPins();
    });
    return unsubscribe;
  }, [navigation]);

  return (
    // Rest of the component code
  );
};

export default HomeScreen; 