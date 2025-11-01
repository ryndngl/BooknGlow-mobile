// hooks/useFavorites.js
import { useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API_URL from '../config/api';

const API_BASE_URL = API_URL.replace("/api", "") + "/api";

export const useFavorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);

  const getToken = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      return token;
    } catch (error) {
      console.error('Get token error:', error);
      return null;
    }
  };

  const cleanPrice = (price) => {
    if (!price) return '';
    const priceStr = price.toString().replace(/₱/g, '').trim();
    return priceStr || '';
  };

  const fetchFavorites = useCallback(async () => {
    try {
      setLoading(true);
      const token = await getToken();
      
      if (!token) {
        return;
      }

      const response = await fetch(`${API_BASE_URL}/favorites`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        setFavorites(result.data || []);
      }
    } catch (error) {
      console.error('Fetch favorites error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleFavorite = useCallback(async (service, style) => {
    try {
      if (!service?.name || !style?.name) {
        console.error('Missing data:', { service, style });
        return { success: false, message: 'Missing service or style name' };
      }

      const token = await getToken();
      
      if (!token) {
        console.error('No auth token');
        return { success: false, message: 'Please login first' };
      }

   
      const isFav = favorites.some(fav => 
        fav.service?.name?.toLowerCase() === service.name?.toLowerCase() &&
        fav.name?.toLowerCase() === style.name?.toLowerCase()
      );

      if (isFav) {
        const response = await fetch(`${API_BASE_URL}/favorites/remove`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            serviceName: service.name,
            styleName: style.name,
          }),
        });

        const result = await response.json();
        
        if (response.ok) {
          setFavorites(prev => prev.filter(fav =>
            !(fav.service?.name?.toLowerCase() === service.name?.toLowerCase() &&
              fav.name?.toLowerCase() === style.name?.toLowerCase())
          ));
          return { success: true, message: 'Removed from favorites' };
        } else {
          console.error('Remove failed:', result);
          return { success: false, message: result.message };
        }
      } else {
        const payload = {
          service: {
            name: service.name,
            _id: service._id || null,
          },
          style: {
            name: style.name,
            _id: style._id || null,
            price: cleanPrice(style.price),
            description: style.description || '',
            image: style.image || style.images?.[0] || '',
          },
        };

        const response = await fetch(`${API_BASE_URL}/favorites/add`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        const result = await response.json();
        
        if (response.ok) {
          setFavorites(prev => [...prev, result.data]);
          return { success: true, message: 'Added to favorites' };
        } else {
          console.error('Add failed:', result);
          return { success: false, message: result.message };
        }
      }
    } catch (error) {
      console.error('Toggle favorite error:', error);
      return { success: false, message: 'Network error' };
    }
  }, [favorites]);

  const clearAllFavorites = useCallback(async () => {
    try {
      const token = await getToken();
      
      if (!token) {
        console.error('No auth token');
        return { success: false, message: 'Please login first' };
      }

      const response = await fetch(`${API_BASE_URL}/favorites/clear`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      
      if (response.ok) {
        setFavorites([]);
        return { success: true, message: 'All favorites cleared' };
      } else {
        return { success: false, message: result.message };
      }
    } catch (error) {
      console.error('Clear all favorites error:', error);
      return { success: false, message: 'Network error' };
    }
  }, []);

  const isFavorite = useCallback((service, style) => {
    if (!service?.name || !style?.name) return false;
    return favorites.some(fav =>
      fav.service?.name?.toLowerCase() === service?.name?.toLowerCase() &&
      fav.name?.toLowerCase() === style?.name?.toLowerCase()
    );
  }, [favorites]);

  return {
    favorites,
    loading,
    fetchFavorites,
    toggleFavorite,
    clearAllFavorites,
    isFavorite,
  };
};