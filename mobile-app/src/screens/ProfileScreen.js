import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";

const serviceItems = [
  { label: "Service settings", icon: "✏️", badge: "NEW RATES" },
  { label: "Payments", icon: "💳" },
  { label: "Insights", icon: "📊" },
  { label: "Promote Your Profile", icon: "📣" },
  { label: "Jeroen & Paws Cards", icon: "🗂️" },
];

const userItems = [
  { label: "Profile", icon: "👤" },
  { label: "Your pets", icon: "🐾" },
  { label: "Settings", icon: "⚙️" },
  { label: "Help Centre & Support", icon: "❓" },
];

const ProfileScreen = () => (
  <SafeAreaView style={styles.safeArea}>
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>More</Text>
      <View style={styles.searchRow}>
        <Text style={styles.searchIcon}>🔍</Text>
        <Text style={styles.searchText}>Book a new service</Text>
        <Text style={styles.chevron}>›</Text>
      </View>

  <Text style={styles.sectionTitle}>Your pet sitting services</Text>
      <View style={styles.sectionCard}>
        {serviceItems.map((item, index) => (
          <View
            key={item.label}
            style={[
              styles.menuItem,
              index === serviceItems.length - 1 && styles.menuItemLast,
            ]}
          >
            <View style={styles.menuLeft}>
              <Text style={styles.menuIcon}>{item.icon}</Text>
              <Text style={styles.menuLabel}>{item.label}</Text>
            </View>
            <View style={styles.menuRight}>
              {item.badge ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{item.badge}</Text>
                </View>
              ) : null}
              <Text style={styles.chevron}>›</Text>
            </View>
          </View>
        ))}
      </View>

      <Text style={styles.sectionTitle}>You</Text>
      <View style={styles.sectionCard}>
        {userItems.map((item, index) => (
          <View
            key={item.label}
            style={[
              styles.menuItem,
              index === userItems.length - 1 && styles.menuItemLast,
            ]}
          >
            <View style={styles.menuLeft}>
              <Text style={styles.menuIcon}>{item.icon}</Text>
              <Text style={styles.menuLabel}>{item.label}</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  </SafeAreaView>
);

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f6f3fb",
  },
  container: {
    flexGrow: 1,
    backgroundColor: "#f6f3fb",
    padding: 20,
    paddingBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#2b1a4b",
    marginBottom: 16,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#ebe4f7",
    marginBottom: 20,
  },
  searchIcon: {
    marginRight: 10,
    fontSize: 18,
  },
  searchText: {
    flex: 1,
    fontSize: 15,
    color: "#3a2b55",
    fontWeight: "600",
  },
  chevron: {
    fontSize: 20,
    color: "#a194bb",
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#2b1a4b",
    marginBottom: 12,
  },
  sectionCard: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#ebe4f7",
    marginBottom: 20,
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f2ecfb",
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  menuLabel: {
    fontSize: 15,
    color: "#3a2b55",
    fontWeight: "600",
  },
  menuRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  badge: {
    backgroundColor: "#f2d7ff",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    marginRight: 8,
  },
  badgeText: {
    color: "#6c3ad6",
    fontSize: 12,
    fontWeight: "700",
  },
});

export default ProfileScreen;