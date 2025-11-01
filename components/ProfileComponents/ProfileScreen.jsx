import { View, Text, ScrollView, StyleSheet } from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../../context/AuthContext";
import { useEffect, useCallback } from "react";

// Components
import ProfileHeader from "./ProfileHeader";
import ProfileCard from "./ProfileCard";
import FavoritesSection from "./FavoritesSection";
import PastBookingsSection from "./PastBookingsSection";
import LogoutSection from "./LogoutSection";
import LogoutConfirmModal from "./LogoutConfirmModal";
import LogoutSuccessModal from "./LogoutSuccessModal";

// Hooks
import { useProfileData, useProfileEditor, useLogoutFlow } from "../../hooks";
import { useFavorites } from "../../hooks/useFavorites";

export default function ProfileScreen() {
  const navigation = useNavigation();

  const {
    user: authUser,
    logout,
    updateUser,
    isAuthenticated,
    setShowSplashOnLogout,
  } = useAuth();
  
  const { favorites, fetchFavorites } = useFavorites();

  // Custom hooks
  const { user, setUser, loading, dataLoaded, setDataLoaded } = useProfileData(
    authUser,
    isAuthenticated,
    updateUser,
    fetchFavorites
  );

  const { editing, handleNameChange, handlePhoneChange, handleEditPress } =
    useProfileEditor(user, setUser, updateUser);

  const {
    confirmVisible,
    setConfirmVisible,
    logoutSuccessVisible,
    scaleAnim,
    fadeAnim,
    confirmLogout,
    handleLogout,
  } = useLogoutFlow(logout, setShowSplashOnLogout, setUser, setDataLoaded);

  // ✅ Fetch favorites on mount
  useEffect(() => {
    fetchFavorites();
  }, []);

  // ✅ Refresh favorites when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchFavorites();
    }, [])
  );

  const handlePastBookingsPress = () => {
    navigation.navigate("PastBookingsScreen");
  };

  return (
    <>
      <View style={styles.container}>
        <ProfileHeader
          onBackPress={() => navigation.goBack()}
          onSettingsPress={() => navigation.navigate("SettingsScreen")}
        />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        >
          <ProfileCard
            user={user}
            editing={editing}
            onNameChange={handleNameChange}
            onPhoneChange={handlePhoneChange}
            onEditPress={handleEditPress}
          />

          <View style={styles.menuContainer}>
            <FavoritesSection
              favoritesCount={favorites.length}
              onPress={() => navigation.navigate("FavoritesScreen")}
            />

            <PastBookingsSection onPress={handlePastBookingsPress} />

            <LogoutSection onLogoutPress={confirmLogout} />
          </View>

          <View style={styles.versionContainer}>
            <Text style={styles.versionText}>App version 0.1</Text>
          </View>
        </ScrollView>
      </View>

      <LogoutConfirmModal
        visible={confirmVisible}
        onConfirm={handleLogout}
        onCancel={() => setConfirmVisible(false)}
      />

      <LogoutSuccessModal
        visible={logoutSuccessVisible}
        scaleAnim={scaleAnim}
        fadeAnim={fadeAnim}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollView: {
    flex: 1,
  },
  menuContainer: {
    paddingHorizontal: 16,
  },
  versionContainer: {
    alignItems: "center",
    paddingVertical: 20,
    marginBottom: 75,
  },
  versionText: {
    fontSize: 14,
    color: "#999",
  },
});