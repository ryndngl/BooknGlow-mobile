import { View, Text, TouchableOpacity, Image, TextInput, StyleSheet, Alert, ActivityIndicator } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';

export default function ProfileCard({ 
  user, 
  editing,
  onNameChange,
  onPhoneChange,
  onEditPress,
  onPhotoUpdate
}) {
  const [uploading, setUploading] = useState(false);

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert("Permission Required", "Allow access to your photos to upload a profile picture.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      uploadToCloudinary(result.assets[0].uri);
    }
  };

  const uploadToCloudinary = async (uri) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: uri,
        type: 'image/jpeg',
        name: 'profile.jpg',
      });
      formData.append('upload_preset', 'salon_styles'); // Change to your preset name
      formData.append('cloud_name', 'dyw0qxjzn');

      const response = await fetch(
        'https://api.cloudinary.com/v1_1/dyw0qxjzn/image/upload',
        {
          method: 'POST',
          body: formData,
        }
      );

      const data = await response.json();
      
      if (data.secure_url) {
        onPhotoUpdate(data.secure_url);
      } else {
        Alert.alert("Upload Failed", "Could not upload image. Please try again.");
      }
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert("Error", "An error occurred while uploading. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.profileCard}>
      <View style={styles.profileHeader}>
        <View style={styles.profileImageContainer}>
          {user.photo ? (
            <Image source={{ uri: user.photo }} style={styles.profileImage} />
          ) : (
            <View style={styles.placeholderCircle}>
              <Icon name="person" size={40} color="#999" />
            </View>
          )}
          <TouchableOpacity 
            style={styles.cameraIcon} 
            onPress={pickImage}
            disabled={uploading}
          >
            {uploading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Icon name="camera-alt" size={12} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
        <View style={styles.profileInfo}>
          {editing ? (
            <TextInput
              style={styles.nameInput}
              placeholder="Full Name"
              value={user.fullName}
              onChangeText={onNameChange}
              placeholderTextColor="#aaa"
            />
          ) : (
            <Text style={styles.userName}>
              {user.fullName || "No name"}
            </Text>
          )}
          <Text style={styles.userEmail}>{user.email || "No email"}</Text>
          {editing ? (
            <TextInput
              style={styles.phoneInput}
              placeholder="+63 --- --- ----"
              value={user.phone}
              onChangeText={onPhoneChange}
              keyboardType="phone-pad"
              placeholderTextColor="#aaa"
            />
          ) : (
            <Text style={styles.userPhone}>
              {user.phone || "No phone number"}
            </Text>
          )}
        </View>
      </View>
      <TouchableOpacity style={styles.editButton} onPress={onEditPress}>
        <Text style={styles.editButtonText}>
          {editing ? "Save Changes" : "Edit Profile"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  profileCard: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 20,
    marginBottom: 10,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  profileImageContainer: {
    position: "relative",
    marginRight: 16,
  },
  profileImage: {
    width: 95,
    height: 95,
    borderRadius: 47.5,
  },
  placeholderCircle: {
    width: 95,
    height: 95,
    borderRadius: 50,
    backgroundColor: "#e0e0e0",
    alignItems: "center",
    justifyContent: "center",
  },
  cameraIcon: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#666",
    alignItems: "center",
    justifyContent: "center",
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  nameInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  userPhone: {
    fontSize: 14,
    color: "#666",
  },
  phoneInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    fontSize: 14,
    color: "#333",
    marginTop: 4,
  },
  editButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 8,
    alignItems: "center",
    width: 160,
  },
  editButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
    flexWrap: "wrap",
  },
});