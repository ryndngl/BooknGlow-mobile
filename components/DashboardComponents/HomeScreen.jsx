// components/DashboardComponents/HomeScreen.jsx
import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useHomeScreen } from '../../hooks';
import { useFavorites } from '../../hooks';  // ✅ ADD THIS
import { notificationService } from '../../services/notificationService';
import SearchBar from './SearchBar';
import SearchResults from './SearchResults';
import HomeContent from './HomeContent';
import ImageModal from './ImageModal';

const HomeScreen = () => {
  const navigation = useNavigation();
  
  const {
    searchQuery,
    setSearchQuery,
    filteredStyles,
    handleClearSearch,
    modalVisible,
    setModalVisible,
    selectedImage,
    loading,
    displayName,
    userObj,
    refreshing,    
    onRefresh,     
    handleServicePress,
    openImageModal,
  } = useHomeScreen();

  // ✅ ADD FAVORITES HOOK
  const { 
    favorites, 
    fetchFavorites, 
    toggleFavorite, 
    isFavorite 
  } = useFavorites();

  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (!userData) return;

      const user = JSON.parse(userData);
      const userId = user._id || user.id;

      const data = await notificationService.getUserNotifications(userId);
      const unread = data.filter(n => !n.isRead).length;
      setUnreadCount(unread);
      
    } catch (error) {
      console.error('Fetch unread count error:', error);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    fetchFavorites(); // ✅ LOAD FAVORITES ON MOUNT
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchUnreadCount();
      fetchFavorites(); // ✅ REFRESH FAVORITES ON SCREEN FOCUS
    });

    return unsubscribe;
  }, [navigation]);

  // ✅ HANDLER FOR TOGGLE FAVORITE
  const handleToggleFavorite = async (service, style) => {
    const result = await toggleFavorite(service, style);
    if (result.success) {
      console.log(result.message);
    } else {
      console.error(result.message);
    }
  };

  // ✅ CUSTOM REFRESH HANDLER (includes favorites + badge refresh)
  const handleRefresh = async () => {
    await Promise.all([
      onRefresh(),
      fetchUnreadCount(),
      fetchFavorites() // ✅ REFRESH FAVORITES
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#ffffff" }}>
      <SearchBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onClearSearch={handleClearSearch}
        loading={loading}
      />

      {searchQuery.trim() === "" ? (
        <HomeContent
          displayName={displayName}
          loading={loading}
          onServicePress={handleServicePress}
          onImagePress={openImageModal}
          userObj={userObj}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          unreadCount={unreadCount}
          isFavorite={isFavorite}
          onToggleFavorite={handleToggleFavorite}
        />
      ) : (
        <SearchResults
          filteredStyles={filteredStyles}
          loading={loading}
          onImagePress={openImageModal}
          isFavorite={isFavorite}
          onToggleFavorite={handleToggleFavorite}
        />
      )}

      <ImageModal
        visible={modalVisible}
        selectedImage={selectedImage}
        onClose={() => setModalVisible(false)}
      />
    </SafeAreaView>
  );
};

export default HomeScreen;