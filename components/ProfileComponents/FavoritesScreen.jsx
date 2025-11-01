// components/ProfileComponents/FavoritesScreen.jsx
import React, { useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useFavorites } from '../../hooks';
import { FavoritesHeader } from './FavoritesHeader';
import { FavoriteCard } from './FavoriteCard'; 

export default function FavoritesScreen() {
  const navigation = useNavigation();
  const { 
    favorites, 
    loading, 
    fetchFavorites, 
    toggleFavorite, 
    clearAllFavorites,
    isFavorite
  } = useFavorites();

  useEffect(() => {
    fetchFavorites();
  }, []);

  const handleToggleFavorite = async (service, style) => {
    await toggleFavorite(service, style);
  };

  const handleClearAll = () => {
    if (favorites.length === 0) {
      Alert.alert("No Favorites", "You don't have any favorites to clear.");
      return;
    }

    Alert.alert(
      "Clear All Favorites",
      "Are you sure you want to delete all your favorites? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete All",
          style: "destructive",
          onPress: async () => {
            try {
              const result = await clearAllFavorites();
              if (result.success) {
                Alert.alert("Success", "All favorites have been cleared.");
              } else {
                Alert.alert("Error", "Failed to clear favorites. Please try again.");
              }
            } catch (error) {
              console.error("Error clearing favorites:", error);
              Alert.alert("Error", "An unexpected error occurred.");
            }
          },
        },
      ]
    );
  };

  const handleImagePress = (image) => {
    console.log('Image pressed:', image);
  };

  const handleBookPress = (item) => {
    navigation.navigate('BookingFormScreen', {
      serviceName: item.service?.name,
      styleName: item.name,
      stylePrice: item.price,
    });
  };

  const renderItem = ({ item }) => {
    return (
      <FavoriteCard
        item={item}
        isFavorite={isFavorite(item.service, item)}
        onToggleFavorite={handleToggleFavorite}
        onImagePress={handleImagePress}
        onBookPress={() => handleBookPress(item)}
      />
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No favorites yet</Text>
      <Text style={styles.emptySubtext}>
        Add items to your favorites to see them here
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FavoritesHeader
        onBackPress={() => navigation.goBack()}
        onClearAll={handleClearAll}
        favoritesCount={favorites.length}
        isEmpty={favorites.length === 0}
      />

      <FlatList
        data={favorites}
        renderItem={renderItem}
        keyExtractor={(item, index) => item._id || `fav-${index}`}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={fetchFavorites}
            colors={['#7a0000']}
            tintColor="#7a0000"
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  row: {
    justifyContent: 'space-between',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});