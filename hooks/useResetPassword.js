import { useState } from 'react';
import { Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { CommonActions } from '@react-navigation/native';
import API_URL from '../config/api';

export const useResetPassword = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const { token, email } = route.params || {};

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async (showResetSuccessModal, hideResetSuccessModal) => {
    if (!newPassword || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      Alert.alert("Error", "Password must be at least 8 characters long");
      return;
    }

    if (!email || !token) {
      Alert.alert("Error", "Session expired. Please start over.");
      navigation.navigate('LoginScreen');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          token: token,
          email: email.toLowerCase().trim(),
          newPassword: newPassword,
          type: 'mobile'
        }),
      });

      const responseText = await response.text();
      
      if (!responseText) {
        Alert.alert('Error', 'Empty response from server');
        return;
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        Alert.alert('Error', 'Server returned invalid response. Please try again.');
        return;
      }

      let result;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        Alert.alert('Error', 'Invalid response from server');
        return;
      }

      if (result.success === true || result.isSuccess === true) {
        setNewPassword("");
        setConfirmPassword("");
        
        showResetSuccessModal();
        
        setTimeout(() => {
          hideResetSuccessModal();
          
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [
                { name: 'LoginScreen' },
              ],
            })
          );
        }, 3000); 

      } else {
        Alert.alert("Error", result.message || "Failed to reset password");
      }
    } catch (error) {
      console.error("Reset password error:", error);
      if (error.name === 'TypeError' && error.message.includes('Network request failed')) {
        Alert.alert('Connection Error', 'Cannot connect to server. Please check your connection.');
      } else {
        Alert.alert("Error", "Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    loading,
    handleResetPassword,
  };
};