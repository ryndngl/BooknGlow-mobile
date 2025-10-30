import { useState } from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import API_URL from '../config/api';

export const useTokenValidation = () => {
  const navigation = useNavigation();
  const [manualToken, setManualToken] = useState('');
  const [validatingToken, setValidatingToken] = useState(false);

  const validateTokenBeforeNavigate = async (token, email) => {
    try {
      setValidatingToken(true);
      
      console.log('🔍 Validating token...');
      console.log('API URL:', `${API_URL}/api/auth/validate-token`);
      console.log('Request body:', { 
        token: token.trim(),
        email: email.toLowerCase().trim(),
        type: 'mobile'
      });

      const response = await fetch(`${API_URL}/api/auth/validate-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          token: token.trim(),
          email: email.toLowerCase().trim(),
          type: 'mobile'
        }),
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response headers:', response.headers);
      
      // Check if response is OK
      if (!response.ok) {
        console.error('❌ Response not OK:', response.status, response.statusText);
      }

      // Get response text first
      const responseText = await response.text();
      console.log('📄 Response text (first 500 chars):', responseText.substring(0, 500));

      // Try to parse as JSON
      let result;
      try {
        result = JSON.parse(responseText);
        console.log('✅ Parsed JSON result:', result);
      } catch (parseError) {
        console.error('❌ JSON Parse Error:', parseError);
        console.error('❌ Response is NOT JSON! Full response:', responseText);
        Alert.alert(
          'Server Error',
          'Server returned invalid response. The backend may be misconfigured or crashed.\n\nPlease check server logs or contact support.'
        );
        return false;
      }

      // Check success
      if (result.success === true || result.isSuccess === true) {
        console.log('✅ Token is valid!');
        return true;
      } else {
        console.error('❌ Token validation failed:', result.message);
        Alert.alert('Error', result.message || 'Invalid reset code');
        return false;
      }
    } catch (error) {
      console.error('❌ Token validation error:', error);
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      
      Alert.alert(
        'Connection Error',
        `Unable to validate token.\n\nError: ${error.message}\n\nPlease check:\n- Internet connection\n- Server is running\n- API URL is correct`
      );
      return false;
    } finally {
      setValidatingToken(false);
    }
  };

  const handleManualTokenSubmit = async (email) => {
    if (!manualToken.trim()) {
      Alert.alert('Error', 'Please enter the token from your email');
      return;
    }

    if (!email) {
      Alert.alert('Error', 'Email not found. Please try again from the beginning.');
      return;
    }

    console.log('🚀 Submitting token:', manualToken.trim());
    console.log('📧 For email:', email.toLowerCase().trim());

    const isValidToken = await validateTokenBeforeNavigate(manualToken.trim(), email);
    
    if (isValidToken) {
      console.log('✅ Navigating to ResetPasswordScreen');
      navigation.navigate('ResetPasswordScreen', { 
        token: manualToken.trim(),
        email: email.toLowerCase().trim()
      });
    } else {
      console.log('❌ Token validation failed, not navigating');
    }
  };

  return {
    manualToken,
    setManualToken,
    validatingToken,
    handleManualTokenSubmit,
    validateTokenBeforeNavigate,
  };
};