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
import config from '../config';

const LoginScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${config.API_URL}/auth/login`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Store the token and user data
      await AsyncStorage.setItem('token', data.token);
      await AsyncStorage.setItem('user', JSON.stringify(data.user));
      
      // Navigate to home feed
      navigation.replace('HomeFeed');
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'An error occurred during login');
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