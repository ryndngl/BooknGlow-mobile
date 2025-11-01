import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useAuth } from './AuthContext';
import { extractImages } from '../utils/imageHelper';

const FavoritesContext = createContext();
const API_URL = "https://salon-app-server.onrender.com/api/favorites";

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user, isAuthenticated } = useAuth();

  const getFavoritesKey = () => {
    if (isAuthenticated && (user?.id || user?._id)) {
      const userId = user.id || user._id;
      return `favorites_${userId}`;
    }
    return null;
  };

  const getAuthHeader = async () => {
    const token = await AsyncStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // Load favorites from BACKEND
  const loadFavorites = async (forceReload = false) => {
    try {
      if (isLoading && !forceReload) return;
      if (!isAuthenticated || !user) {
        setFavorites([]);
        return;
      }

      setIsLoading(true);

      // Try to load from backend first
      const headers = await getAuthHeader();
      const response = await axios.get(API_URL, { 
        headers,
        timeout: 10000 
      });

      if (response.data.success) {
        const backendFavorites = response.data.data || [];
        setFavorites(backendFavorites);
        
        // Cache to AsyncStorage
        const favoritesKey = getFavoritesKey();
        if (favoritesKey) {
          await AsyncStorage.setItem(favoritesKey, JSON.stringify(backendFavorites));
        }
      }
    } catch (error) {
      console.error("Load favorites error:", error);
      
      // Fallback to AsyncStorage if backend fails
      const favoritesKey = getFavoritesKey();
      if (favoritesKey) {
        const cached = await AsyncStorage.getItem(favoritesKey);
        if (cached) {
          setFavorites(JSON.parse(cached));
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user && (user.id || user._id)) {
      loadFavorites(true);
    } else if (!isAuthenticated) {
      setFavorites([]);
    }
  }, [isAuthenticated, user?.id, user?._id]);

  const getItemKey = (service, style) => {
    if (!service?.name || !style?.name) return null;
    return `${service.name.toLowerCase().trim()}|${style.name.toLowerCase().trim()}`;
  };

  // Toggle with BACKEND SYNC
  const toggleFavorite = async (service, style) => {
    try {
      if (!isAuthenticated || !user) return false;

      const key = getItemKey(service, style);
      if (!key) return false;

      const existingIndex = favorites.findIndex(item => 
        getItemKey(item.service, item) === key
      );

      const headers = await getAuthHeader();

      if (existingIndex >= 0) {
        // REMOVE from backend
        await axios.delete(`${API_URL}/remove`, {
          headers,
          data: {
            serviceName: service.name,
            styleName: style.name
          },
          timeout: 10000
        });

        // Update local state
        const updated = favorites.filter((_, index) => index !== existingIndex);
        setFavorites(updated);
        
        const favoritesKey = getFavoritesKey();
        if (favoritesKey) {
          await AsyncStorage.setItem(favoritesKey, JSON.stringify(updated));
        }
      } else {
        // ADD to backend
        const favoriteItem = {
          ...style,
          service: {
            ...service,
            name: service.name
          },
          timestamp: new Date().toISOString(),
          userId: user?.id || user?._id,
          ...(style.images && Array.isArray(style.images) && style.images.length > 0 
            ? { images: style.images } 
            : style.image 
              ? { image: style.image }
              : extractImages && extractImages(style) 
                ? (() => {
                    const extracted = extractImages(style);
                    return Array.isArray(extracted) && extracted.length > 1 
                      ? { images: extracted }
                      : { image: extracted[0] || extracted };
                  })()
                : {}
          )
        };

        await axios.post(`${API_URL}/add`, {
          service,
          style: favoriteItem
        }, {
          headers,
          timeout: 10000
        });

        // Update local state
        const updated = [...favorites, favoriteItem];
        setFavorites(updated);
        
        const favoritesKey = getFavoritesKey();
        if (favoritesKey) {
          await AsyncStorage.setItem(favoritesKey, JSON.stringify(updated));
        }
      }

      return true;
    } catch (error) {
      console.error("Toggle favorite error:", error);
      return false;
    }
  };

  const isFavorite = (serviceName, styleName) => {
    if (!serviceName || !styleName || !isAuthenticated) return false;
    const key = `${serviceName.toLowerCase().trim()}|${styleName.toLowerCase().trim()}`;
    return favorites.some(item => {
      const itemKey = getItemKey(item.service, item);
      return itemKey === key;
    });
  };

  const addToFavorites = async (service, style) => {
    if (!isAuthenticated || !user) return false;
    const key = getItemKey(service, style);
    if (!key) return false;
    const exists = favorites.some(item => getItemKey(item.service, item) === key);
    if (!exists) {
      await toggleFavorite(service, style);
      return true;
    }
    return false;
  };

  const removeFromFavorites = async (service, style) => {
    if (!isAuthenticated || !user) return false;
    const key = getItemKey(service, style);
    if (!key) return false;
    const exists = favorites.some(item => getItemKey(item.service, item) === key);
    if (exists) {
      await toggleFavorite(service, style);
      return true;
    }
    return false;
  };

  const clearFavorites = async () => {
    try {
      if (!isAuthenticated || !user) return false;

      const headers = await getAuthHeader();
      await axios.delete(`${API_URL}/clear`, { 
        headers,
        timeout: 10000 
      });

      setFavorites([]);
      const favoritesKey = getFavoritesKey();
      if (favoritesKey) {
        await AsyncStorage.removeItem(favoritesKey);
      }
      return true;
    } catch (error) {
      console.error('Clear favorites error:', error);
      return false;
    }
  };

  const getFavoritesByService = (serviceName) => {
    if (!isAuthenticated) return [];
    return favorites.filter(item => 
      item.service?.name?.toLowerCase() === serviceName?.toLowerCase()
    );
  };

  const refreshFavorites = () => {
    return loadFavorites(true);
  };

  const value = {
    favorites,
    toggleFavorite,
    isFavorite,
    isLoading,
    refreshFavorites,
    count: favorites.length,
    addToFavorites,
    removeFromFavorites,
    clearFavorites,
    getFavoritesByService,
    isAuthenticated,
    user: user ? { id: user.id || user._id, email: user.email || user.fullName } : null,
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }
  return context;
};