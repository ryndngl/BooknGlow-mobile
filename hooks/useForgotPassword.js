import { useState } from 'react';
import { Alert } from 'react-native';
import API_URL from '../config/api';

export const useForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [showTokenEntry, setShowTokenEntry] = useState(false);

  const handleForgotPassword = async (showEmailSentModal, hideEmailSentModal) => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.toLowerCase().trim() }),
      });
      
      const responseText = await response.text();
      if (!responseText) {
        Alert.alert('Error', 'Empty response from server');
        return;
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        Alert.alert('Error', `Server returned ${contentType || 'unknown'} instead of JSON. Check server logs.`);
        return;
      }

      let result;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        Alert.alert('Error', 'Invalid JSON response from server');
        return;
      }

      if (!response.ok) {
        Alert.alert('Error', result.message || `Server error: ${response.status}`);
        return;
      }

      if (result.success === true || result.isSuccess === true) {
        showEmailSentModal();
        
        setTimeout(() => {
          hideEmailSentModal();
          setShowTokenEntry(true);
        }, 3000);
      } else {
        Alert.alert('Error', result.message || 'Failed to send reset email');
      }
    } catch (error) {  
      if (error.name === 'TypeError' && error.message.includes('Network request failed')) {
        Alert.alert('Connection Error', 'Cannot connect to server. Please check:\n• Server is running\n• Correct IP address\n• Network connection');
      } else {
        Alert.alert('Error', `Network error: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    email,
    setEmail,
    loading,
    showTokenEntry,
    setShowTokenEntry,
    handleForgotPassword,
  };
};