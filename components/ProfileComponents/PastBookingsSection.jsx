import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useBooking } from "../../context/BookingContext";

export default function PastBookingsSection({ onPress }) {
  const { bookings } = useBooking();

  // Count completed bookings
  const completedCount = bookings.filter(
    (booking) => booking.status === "completed"
  ).length;

  return (
    <View style={styles.menuSection}>
      <Text style={styles.sectionTitle}>Past Bookings</Text>
      <TouchableOpacity style={styles.menuItem} onPress={onPress}>
        <View style={styles.menuItemLeft}>
          <Icon name="history" size={20} color="#666" />
          <View style={styles.menuItemContent}>
            <Text style={styles.menuItemText}>View All Past Bookings</Text>
            <Text style={styles.countText}>({completedCount})</Text>
          </View>
        </View>
        <Icon name="chevron-right" size={24} color="#999" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  menuSection: {
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 12,
    paddingVertical: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 8,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  menuItemContent: {
    marginLeft: 12,
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  menuItemText: {
    fontSize: 16,
    color: "#333",
    marginRight: 6,
  },
  countText: {
    fontSize: 16,
    color: "#666",
  },
});