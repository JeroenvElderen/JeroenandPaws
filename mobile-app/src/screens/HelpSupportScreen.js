import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

const supportOptions = [
  {
    id: "email",
    title: "Email us",
    description: "support@jeroenandpaws.com",
  },
  {
    id: "call",
    title: "Call",
    description: "+31 20 123 4567",
  },
  {
    id: "chat",
    title: "Live chat",
    description: "We reply in under 5 minutes",
  },
];

const HelpSupportScreen = () => (
  <SafeAreaView style={styles.safeArea}>
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Help & support</Text>
      {supportOptions.map((option) => (
        <Pressable key={option.id} style={styles.card}>
          <Text style={styles.cardTitle}>{option.title}</Text>
          <Text style={styles.cardDescription}>{option.description}</Text>
        </Pressable>
      ))}
      <View style={styles.noteCard}>
        <Text style={styles.noteText}>
          We are available Monday to Saturday, 08:00–18:00.
        </Text>
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
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#2b1a4b",
    marginBottom: 16,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#ebe4f7",
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#2b1a4b",
  },
  cardDescription: {
    fontSize: 13,
    color: "#6c5a92",
    marginTop: 6,
  },
  noteCard: {
    backgroundColor: "#efe9fb",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e6def6",
  },
  noteText: {
    fontSize: 13,
    color: "#6c5a92",
    textAlign: "center",
  },
});

export default HelpSupportScreen;