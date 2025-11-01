import { useState } from "react";
import { Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

export function useProfileEditor(user, setUser, updateUser) {
  const [editing, setEditing] = useState(false);

  const handleNameChange = (text) => {
    setUser({ ...user, fullName: text });
  };

  const handlePhoneChange = (text) => {
    setUser({ ...user, phone: text });
  };

  const handleUpdate = async () => {
    if (!user.fullName?.trim()) {
      Alert.alert("Error", "Please enter your name");
      return;
    }

    try {
      const storedToken = await AsyncStorage.getItem("token");
      if (storedToken && user._id) {
        await axios.put(
          `https://salon-app-server.onrender.com/api/users/${user._id}`,
          { 
            fullName: user.fullName,
            phone: user.phone 
          },
          {
            headers: { Authorization: `Bearer ${storedToken}` },
            timeout: 10000,
          }
        );

        const updatedUserData = { 
          ...user, 
          fullName: user.fullName,
          phone: user.phone 
        };
        await updateUser(updatedUserData);
        setUser(updatedUserData);

        Alert.alert("Success", "Profile updated successfully");
      }
      setEditing(false);
    } catch (error) {
      console.error("Failed to update profile:", error);
      Alert.alert("Error", "Failed to update profile");
    }
  };

  const handleEditPress = () => {
    if (editing) {
      handleUpdate();
    } else {
      setEditing(true);
    }
  };

  return {
    editing,
    handleNameChange,
    handlePhoneChange,
    handleEditPress,
  };
}