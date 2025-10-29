import { useState } from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { useBooking } from '../context/BookingContext'; // ✅ IMPORT BookingContext

export const useLoginForm = () => {
  const navigation = useNavigation();
  const { login, setUser, setIsAuthenticated } = useAuth();
  const { fetchUserBookings } = useBooking(); // ✅ Get fetchUserBookings function

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (showSuccessModal, hideSuccessModal) => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    try {
      setLoading(true);
      
      const result = await login(email, password);
         
      if (result.success) {
        showSuccessModal();

        // ✅ FETCH USER BOOKINGS from database
        const userId = result.user.id || result.user._id;
        if (userId) {
          await fetchUserBookings(userId);
        }

        setTimeout(() => {
          hideSuccessModal();

          setUser(result.user);
          setIsAuthenticated(true);

          navigation.reset({
            index: 0,
            routes: [{ name: "MainTabs" }],
          });
        }, 1000);
      } else {
        Alert.alert("Login Failed", result.message || "Invalid credentials");
      }
    } catch (error) {
      Alert.alert("Error", "Something went wrong. Please try again.");
      console.error("Login Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    loading,
    handleLogin,
  };
};