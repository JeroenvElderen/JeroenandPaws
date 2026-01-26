import { StyleSheet, Text, View } from "react-native";
import PrimaryButton from "../components/PrimaryButton";

const HomeScreen = ({ navigation }) => (
  <View style={styles.container}>
    <Text style={styles.title}>Jeroen & Paws</Text>
    <Text style={styles.subtitle}>Personalized pet care & walking</Text>
    <Text style={styles.body}>
      Book visits, check availability, and keep your companion's care details in
      one place.
    </Text>
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Why clients book here</Text>
      <Text style={styles.cardItem}>• Flexible weekday & weekend visits</Text>
      <Text style={styles.cardItem}>• Photo updates after every visit</Text>
      <Text style={styles.cardItem}>• Fully insured & trusted locally</Text>
    </View>
    <PrimaryButton
      label="Start booking"
      onPress={() => navigation.navigate("Book")}
    />
    <PrimaryButton
      label="View my profile"
      variant="outline"
      onPress={() => navigation.navigate("Profile")}
    />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "#0c081f",
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
    marginBottom: 16,
  },
  body: {
    fontSize: 16,
    color: "#f4f2ff",
    lineHeight: 22,
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#120d23",
    padding: 16,
    borderRadius: 16,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  cardTitle: {
    fontSize: 16,
    color: "#f4f2ff",
    fontWeight: "600",
    marginBottom: 8,
  },
  cardItem: {
    color: "#c9c5d8",
    marginBottom: 6,
  },
});

export default HomeScreen;