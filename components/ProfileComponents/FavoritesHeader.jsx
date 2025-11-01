import { View, Text, Pressable, StyleSheet } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

export function FavoritesHeader({ onBackPress, onClearAll, favoritesCount, isEmpty }) {
  return (
    <View style={styles.header}>
      <Pressable onPress={onBackPress} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="#333" />
      </Pressable>
      
      <Text style={styles.headerTitle}>My Favorites</Text>
      
      {!isEmpty ? (
        <Pressable onPress={onClearAll} style={styles.clearAllButton}>
          <Text style={styles.clearAllText}>Clear All</Text>
        </Pressable>
      ) : (
        <View style={styles.placeholder} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    marginTop: 16,  
    marginHorizontal: 16,
    borderRadius: 12,
    elevation: 1,
  },
  backButton: {
    padding: 4,
    width: 40,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    flex: 1,
    textAlign: "center",
  },
  placeholder: {
    width: 40,
  },
  clearAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#d13f3f",
    borderRadius: 6,
    width: 80,
    alignItems: "center",
  },
  clearAllText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
});