import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { TextInput, Button, Text, Surface } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../services/api';

const LoginScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('Attempting login with:', { email: formData.email });
      const response = await authAPI.login({ email: formData.email, password: formData.password });
      console.log('Login response:', JSON.stringify(response, null, 2));
      
      if (!response.token || !response.user) {
        console.error('Invalid response format:', response);
        throw new Error('Invalid response from server');
      }
      
      // Store the token
      await AsyncStorage.setItem('token', response.token);
      console.log('Token stored successfully');
      
      // Store the user data
      await AsyncStorage.setItem('userData', JSON.stringify(response.user));
      console.log('User data stored successfully:', JSON.stringify(response.user, null, 2));
      
      // Verify token was stored
      const storedToken = await AsyncStorage.getItem('token');
      console.log('Verified stored token:', storedToken ? 'Token exists' : 'No token found');
      
      // Navigate to home feed
      console.log('Login successful, navigating to HomeFeed');
      navigation.replace('HomeFeed');
    } catch (error) {
      console.error('Login error:', error);
      console.error('Error stack:', error.stack);
      setError(error.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <Surface style={styles.surface}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View>
            <Text variant="headlineMedium" style={styles.title}>Welcome Back</Text>
            {error ? <Text style={styles.error}>{error}</Text> : null}
          </View>
        </TouchableWithoutFeedback>

        <TextInput
          mode="outlined"
          label="Email"
          value={formData.email}
          onChangeText={(text) => setFormData({ ...formData, email: text })}
          keyboardType="email-address"
          autoCapitalize="none"
          style={styles.input}
        />

        <TextInput
          mode="outlined"
          label="Password"
          value={formData.password}
          onChangeText={(text) => setFormData({ ...formData, password: text })}
          secureTextEntry
          style={styles.input}
        />

        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.buttonContainer}>
            <Button
              mode="contained"
              onPress={handleSubmit}
              loading={loading}
              style={styles.button}
            >
              Login
            </Button>

            <Button
              mode="text"
              onPress={() => navigation.navigate('Register')}
              style={styles.linkButton}
            >
              Don't have an account? Sign up
            </Button>
          </View>
        </TouchableWithoutFeedback>
      </Surface>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  surface: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    marginBottom: 24,
    fontWeight: 'bold',
  },
  input: {
    width: '100%',
    marginBottom: 16,
  },
  buttonContainer: {
    width: '100%',
  },
  button: {
    width: '100%',
    marginTop: 8,
    padding: 4,
  },
  linkButton: {
    marginTop: 16,
  },
  error: {
    color: '#B00020',
    marginBottom: 16,
    textAlign: 'center',
  },
});

export default LoginScreen; 