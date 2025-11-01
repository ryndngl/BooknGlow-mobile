import { View, Text, Image, Pressable, StyleSheet, Dimensions } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

const screenWidth = Dimensions.get("window").width;
const cardWidth = (screenWidth - 48) / 2;

export function FavoriteCard({ 
  item, 
  isFavorite, 
  onToggleFavorite, 
  onImagePress,
  onBookPress 
}) {
  const getImageSource = (imageData) => {
    if (!imageData) return null;
    if (typeof imageData === "object" && (imageData.uri || imageData.require)) {
      return imageData;
    }
    if (typeof imageData === "string") {
      return { uri: imageData };
    }
    if (typeof imageData === "number") {
      return imageData;
    }
    return null;
  };

  const rawImageSource = item.image || (Array.isArray(item.images) ? item.images[0] : null);
  const imageSource = getImageSource(rawImageSource);

  const service = item?.service || { name: item?.serviceName || "Service", _id: null };
  
  const handleToggle = () => {
    if (!service.name || !item?.name) {
      console.error("Missing service or item name:", { service, item });
      return;
    }
    
    console.log("Toggling favorite:", {
      serviceName: service.name,
      styleName: item.name
    });
    
    onToggleFavorite(service, item);
  };

  return (
    <View style={styles.card}>
      <Pressable onPress={() => onImagePress(imageSource)}>
        <View style={styles.imageWrapper}>
          {imageSource ? (
            <Image source={imageSource} style={styles.image} />
          ) : (
            <View style={[styles.image, styles.placeholderImage]}>
              <Text style={styles.placeholderText}>No Image</Text>
            </View>
          )}
        </View>
      </Pressable>

      <View style={styles.cardContent}>
        <View style={styles.serviceBadge}>
          <Text style={styles.serviceBadgeText}>
            {service.name}
          </Text>
        </View>

        <View style={styles.namePriceRow}>
          <Text style={styles.styleName} numberOfLines={1}>{item?.name}</Text>
        </View>
        
        <Text style={styles.price}>
          {item?.price?.toString().startsWith('₱') ? item.price : `₱${item.price}`}
        </Text>

        {item?.description && (
          <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
        )}

        <View style={styles.bottomRow}>
          <Pressable
            onPress={handleToggle}
            style={({ pressed }) => [
              styles.heartWrapper,
              { opacity: pressed ? 0.6 : 1 },
            ]}
          >
            <Ionicons
              name={isFavorite ? "heart" : "heart-outline"}
              size={22}
              color={isFavorite ? "red" : "#555"}
            />
          </Pressable>

          <Pressable style={styles.bookNowButton} onPress={onBookPress}>
            <Text style={styles.bookNowText}>BOOK NOW</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 12,  
    marginBottom: 16,  
    width: cardWidth,
    overflow: "hidden",
    elevation: 3,
    borderWidth: 0.5,
    borderColor: "#D4D4D4",
  },
  imageWrapper: {
    width: "100%",
    aspectRatio: 1,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  placeholderImage: {
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    color: "#999",
    fontSize: 12,
    fontWeight: "500",
  },
  cardContent: {
    padding: 10,  
    flex: 1,
    justifyContent: "space-between",
  },
  serviceBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#007d3f",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 6,  
  },
  serviceBadgeText: {
    color: "#fff",
    fontSize: 9,  
    fontWeight: "600",
    textTransform: "uppercase",
  },
  namePriceRow: {
    marginTop: 2,  
    marginBottom: 4,  
  },
  styleName: {
    fontSize: 14,  
    fontWeight: "600",
    color: "#1a1a1a",
  },
  price: {
    fontSize: 13, 
    fontWeight: "700",
    color: "#d10000",
    marginBottom: 6,  
  },
  description: {
    fontSize: 12, 
    color: "#555",
    marginBottom: 8,  
    lineHeight: 16,  
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8, 
    gap: 10,  
  },
  heartWrapper: {
    padding: 6,  
    backgroundColor: "rgba(0,0,0,0.02)",
    borderRadius: 20,
  },
  bookNowButton: {
    backgroundColor: "#007d3f",
    paddingVertical: 7,  
    paddingHorizontal: 14,  
    borderRadius: 20,
  },
  bookNowText: {
    color: "#fff",
    fontSize: 11,  
    fontWeight: "600",
    textTransform: "uppercase",
  },
});