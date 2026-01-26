import { ScrollView, StyleSheet, Text, View } from "react-native";
import PrimaryButton from "../components/PrimaryButton";

const HomeScreen = ({ navigation }) => (
  <ScrollView contentContainerStyle={styles.container}>
    <View style={styles.hero}>
      <Text style={styles.kicker}>Jeroen & Paws</Text>
      <Text style={styles.title}>Your pet care, beautifully organized.</Text>
      <Text style={styles.subtitle}>
        Plan visits, share updates, and keep every tail wagging from one calm,
        friendly space.
      </Text>
    </View>

    <View style={styles.card}>
      <Text style={styles.cardTitle}>Quick actions</Text>
      <Text style={styles.cardBody}>
        Jump straight into a new booking or check your upcoming care plan.
      </Text>
      <View style={styles.actions}>
        <PrimaryButton
          label="Request a booking"
          onPress={() => navigation.navigate("Book")}
        />
        <PrimaryButton
          label="View my profile"
          variant="outline"
          onPress={() => navigation.navigate("Profile")}
        />
      </View>
      </View>

    <View style={styles.metricsCard}>
      <Text style={styles.cardTitle}>Today at a glance</Text>
      <View style={styles.metricsRow}>
        <View style={styles.metricBlock}>
          <Text style={styles.metricValue}>5</Text>
          <Text style={styles.metricLabel}>Walks</Text>
        </View>
        <View style={styles.metricBlock}>
          <Text style={styles.metricValue}>2</Text>
          <Text style={styles.metricLabel}>Drop-ins</Text>
        </View>
        <View style={styles.metricBlock}>
          <Text style={styles.metricValue}>24h</Text>
          <Text style={styles.metricLabel}>Response</Text>
        </View>
      </View>
    </View>
    <Text style={styles.metricNote}>
        We keep availability tight so every visit feels personal and calm.
      </Text>
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Why families choose us</Text>
      <Text style={styles.listItem}>• Friendly, insured local carers</Text>
      <Text style={styles.listItem}>• Photo updates after every visit</Text>
      <Text style={styles.listItem}>• Flexible schedules with clear pricing</Text>
    </View>
    </ScrollView>
);

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    backgroundColor: "#0c081f",
  },
  hero: {
    paddingBottom: 18,
  },
  kicker: {
    fontSize: 12,
    color: "#a99fe5",
    letterSpacing: 1.6,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  title: {
    fontSize: 30,
    fontWeight: "700",
    color: "#f4f2ff",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 16,
    color: "#c9c5d8",
    lineHeight: 22,
  },
  card: {
    backgroundColor: "#120d23",
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  cardTitle: {
    fontSize: 16,
    color: "#f4f2ff",
    fontWeight: "600",
    marginBottom: 6,
  },
  cardBody: {
    color: "#c9c5d8",
    marginBottom: 12,
    lineHeight: 20,
  },
  actions: {
    marginTop: 4,
  },
  metricsCard: {
    backgroundColor: "#120d23",
    borderRadius: 22,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  metricsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  metricBlock: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.04)",
    marginHorizontal: 4,
    paddingVertical: 12,
    borderRadius: 14,
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
  metricNote: {
    fontSize: 13,
    color: "#c9c5d8",
  },
  listItem: {
    color: "#c9c5d8",
    marginTop: 6,
  },
});

export default HomeScreen;