import { ScrollView, StyleSheet, Text, View } from "react-native";
import PrimaryButton from "../components/PrimaryButton";

const HomeScreen = ({ navigation }) => (
  <ScrollView contentContainerStyle={styles.container}>
    <View style={styles.hero}>
      <Text style={styles.kicker}>Jeroen & Paws</Text>
      <Text style={styles.title}>Care built around your pets.</Text>
      <Text style={styles.subtitle}>
        Manage bookings, updates, and visit notes in one trusted place.
      </Text>
    </View>

    <View style={styles.actions}>
      <PrimaryButton
        label="Book a visit"
        onPress={() => navigation.navigate("Book")}
      />
      <PrimaryButton
        label="My profile"
        variant="outline"
        onPress={() => navigation.navigate("Profile")}
      />
    </View>

    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>Today at a glance</Text>
        <Text style={styles.pill}>Open slots</Text>
      </View>
      <View style={styles.metrics}>
        <View style={styles.metric}>
          <Text style={styles.metricValue}>5</Text>
          <Text style={styles.metricLabel}>Walks</Text>
        </View>
        <View style={styles.metric}>
          <Text style={styles.metricValue}>2</Text>
          <Text style={styles.metricLabel}>Drop-ins</Text>
        </View>
        <View style={styles.metric}>
          <Text style={styles.metricValue}>24h</Text>
          <Text style={styles.metricLabel}>Response</Text>
        </View>
      </View>
    </View>
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Why clients book here</Text>
      <Text style={styles.cardItem}>• Flexible weekday & weekend visits</Text>
      <Text style={styles.cardItem}>• Photo updates after every visit</Text>
      <Text style={styles.cardItem}>• Fully insured & trusted locally</Text>
    </View>
    </ScrollView>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "#0c081f",
    paddingBottom: 32,
  },
  hero: {
    marginBottom: 24,
  },
  kicker: {
    fontSize: 13,
    color: "#a99fe5",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginBottom: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#f4f2ff",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "#c9c5d8",
    lineHeight: 22,
    },
    actions: {
    marginBottom: 24,
  },
  card: {
    backgroundColor: "#120d23",
    padding: 16,
    borderRadius: 16,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  pill: {
    backgroundColor: "rgba(124,69,243,0.15)",
    color: "#bda7ff",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
    fontSize: 12,
    fontWeight: "600",
  },
  cardTitle: {
    fontSize: 16,
    color: "#f4f2ff",
    fontWeight: "600",
    },
  metric: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.04)",
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 12,
    alignItems: "center",
  },
  metricValue: {
    fontSize: 18,
    color: "#f4f2ff",
    fontWeight: "700",
  },
  metricLabel: {
    fontSize: 12,
    color: "#c9c5d8",
    marginTop: 4,
  },
  cardItem: {
    color: "#c9c5d8",
    marginTop: 8,
  },
  metrics: {
    flexDirection: "row",
    gap: 8,
  },
});

export default HomeScreen;