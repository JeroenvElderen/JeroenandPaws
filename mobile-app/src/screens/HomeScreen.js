import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import PrimaryButton from "../components/PrimaryButton";

const HomeScreen = ({ navigation }) => (
  <SafeAreaView style={styles.safeArea}>
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Jeroen</Text>
          <Text style={styles.subtitle}>Monday, 26 Jan</Text>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>JP</Text>
          </View>
          <View style={styles.iconBadge}>
            <Text style={styles.iconBadgeText}>🔔</Text>
          </View>
        </View>
      </View>

    <Text style={styles.updateText}>Updated at 16:41</Text>

      <View style={styles.noticeCard}>
        <Text style={styles.noticeIcon}>☀️</Text>
        <Text style={styles.noticeText}>You have no more bookings today</Text>
      </View>

      <View style={styles.promoCard}>
        <Text style={styles.promoTitle}>
          Give new Jeroen & Paws families €10 off their first booking.
        </Text>
        <PrimaryButton
          label="View my profile"
          variant="outline"
          onPress={() => navigation.navigate("Profile")}
        />
      </View>

    <View style={styles.quickCard}>
        <View>
          <Text style={styles.quickLabel}>Manage weekly care for this week</Text>
          <Text style={styles.quickSubtext}>Update availability & recurring visits</Text>
        </View>
        <Text style={styles.chevron}>›</Text>
      </View>

      <Text style={styles.sectionTitle}>Completed</Text>
      <View style={styles.card}>
        <View style={styles.cardRow}>
          <View>
            <Text style={styles.cardTime}>10:52 – 11:24</Text>
            <Text style={styles.cardTitle}>Dog Walking</Text>
            <Text style={styles.cardMeta}>Meala, Lola</Text>
          </View>
          <View style={styles.statusBadge}>
            <Text style={styles.statusBadgeText}>Completed</Text>
          </View>
        </View>
        <PrimaryButton
          label="Open Care Card"
          onPress={() => navigation.navigate("Book")}
        />
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
    padding: 20,
    paddingBottom: 32,
    backgroundColor: "#f6f3fb",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#2b1a4b",
  },
  subtitle: {
    fontSize: 16,
    color: "#6c5a92",
    marginTop: 2,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#efe9fb",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#d8ccef",
  },
  avatarText: {
    fontWeight: "700",
    color: "#5d2fc5",
  },
  iconBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#e6def6",
  },
  iconBadgeText: {
    fontSize: 18,
  },
  updateText: {
    fontSize: 14,
    color: "#7b6a9f",
    marginBottom: 14,
  },
  noticeCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#ebe4f7",
    shadowColor: "#2b1a4b",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 2,
    marginBottom: 14,
  },
  noticeIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  noticeText: {
    fontSize: 14,
    color: "#3a2b55",
    fontWeight: "700",
  },
  promoCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#ebe4f7",
    marginBottom: 14,
  },
  promoTitle: {
    fontSize: 15,
    color: "#3a2b55",
    marginBottom: 12,
    fontWeight: "600",
  },
  quickCard: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#ebe4f7",
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  quickLabel: {
    fontSize: 15,
    color: "#2f2149",
    fontWeight: "600",
  },
  quickSubtext: {
    fontSize: 13,
    color: "#7b6a9f",
    marginTop: 4,
  },
  chevron: {
    fontSize: 24,
    color: "#a194bb",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2b1a4b",
    marginBottom: 12,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#ebe4f7",
  },
  CardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  cardTime: {
    fontSize: 16,
    color: "#2b1a4b",
    fontWeight: "700",
  },
  cardTitle: {
    fontSize: 15,
    color: "#4a3a68",
    marginTop: 4,
    fontWeight: "600",
  },
  cardMeta: {
    fontSize: 14,
    color: "#7b6a9f",
    marginTop: 4,
  },
  statusBadge: {
    backgroundColor: "#efe9fb",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  statusBadgeText: {
    color: "#5d2fc5",
    fontWeight: "600",
    fontSize: 12,
  },
});

export default HomeScreen;