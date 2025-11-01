import { useState, useEffect } from 'react';
import { useRoute, useNavigation } from '@react-navigation/native';
import { extractImages } from '../utils/imageHelper';
import { servicesAPI } from '../services/servicesAPI';
import { useFavorites } from './useFavorites'; 

export const useServiceDetail = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { toggleFavorite, isFavorite } = useFavorites();

  const { service: passedService } = route.params || {};
  
  const [service, setService] = useState(passedService || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const isHairCut = service?.name?.trim().toLowerCase() === 'hair cut';
  const isHairColor = service?.name?.trim().toLowerCase() === 'hair color';
  const isFootSpa = service?.name?.trim().toLowerCase() === 'foot spa';

  const haircutCategories = ['Men', 'Women', 'Kids'];
  const hairColorCategories = ['Root Touch Up', 'Full Hair', 'Highlight', 'Balayage'];
  const initialCategory = isHairCut ? 'Men' : (isHairColor ? 'Root Touch Up' : null);

  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [imageViewerVisible, setImageViewerVisible] = useState(false);
  const [viewerImageSource, setViewerImageSource] = useState(null);

  useEffect(() => {
    if (service && !selectedCategory) {
      const newCategory = isHairCut ? 'Men' : (isHairColor ? 'Root Touch Up' : null);
      setSelectedCategory(newCategory);
    }
  }, [service?.name]);

  const onRefresh = async () => {
    if (!service?.name) return;
    
    setRefreshing(true);
    try {
      const updatedService = await servicesAPI.getServiceByName(service.name);
      setService(updatedService);
    } catch (error) {
      console.error('❌ Error refreshing service:', error);
      setError(error.message);
    } finally {
      setRefreshing(false);
    }
  };

  const filteredStyles = (() => {
    if (!service || !service.categories) {
      return [];
    }

    if (isHairCut || isHairColor) {
      if (!selectedCategory) {
        return [];
      }

      const category = service.categories.find(
        cat => cat.name.toLowerCase() === selectedCategory.toLowerCase()
      );

      if (!category) {
        return [];
      }

      return (category.styles || []).filter(style => style.isActive !== false);
    }

    const allStyles = service.categories.flatMap(category => 
      (category.styles || []).filter(style => style.isActive !== false)
    );
    return allStyles;
  })();

  const openImageViewer = (image) => {
    const { getImageSource } = require('../utils/imageHelper');
    const imageSource = getImageSource(image, service.name);
    setViewerImageSource(imageSource);
    setImageViewerVisible(true);
  };

  const closeImageViewer = () => {
    setImageViewerVisible(false);
    setViewerImageSource(null);
  };

  const goToBooking = (style) => {
    navigation.navigate('BookingFormScreen', {
      serviceName: service.name,
      styleName: style.name,
      stylePrice: style.price,
    });
  };

  const handleToggleFavorite = async (style) => {
    try {
      const styleObj = {
        ...style,
        ...(isFootSpa && { images: extractImages(style) })
      };
      
      await toggleFavorite(service, styleObj);
    } catch (error) {
      console.error('Toggle favorite error:', error);
    }
  };

  // ✅ FIXED: Pass objects, not strings!
  const checkIsFavorite = (style) => {
    return isFavorite(service, style);  // ✅ Pass full objects
  };

  const categoriesToRender = isHairCut ? haircutCategories : (isHairColor ? hairColorCategories : []);

  const hasMultipleImages = (style) => {
    const imagesArray = extractImages(style);
    return imagesArray.length > 1;
  };

  return {
    service,
    loading,
    error,
    isHairCut,
    isHairColor,
    isFootSpa,
    selectedCategory,
    setSelectedCategory,
    categoriesToRender,
    filteredStyles,
    imageViewerVisible,
    viewerImageSource,
    openImageViewer,
    closeImageViewer,
    refreshing,
    onRefresh,
    goToBooking,
    handleToggleFavorite,
    checkIsFavorite,
    hasMultipleImages,
  };
};