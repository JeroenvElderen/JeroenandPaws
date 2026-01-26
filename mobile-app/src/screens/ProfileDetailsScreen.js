import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSession } from "../context/SessionContext";

const ProfileDetailsScreen = () => {
  const { session } = useSession();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Profile</Text>
        <View style={styles.card}>
          <Text style={styles.label}>Name</Text>
          <Text style={styles.value}>{session?.name || "Jeroen"}</Text>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{session?.email || "—"}</Text>
          <Text style={styles.label}>Phone</Text>
          <Text style={styles.value}>{session?.phone || "Add a phone number"}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

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
  },
  label: {
    fontSize: 12,
    color: "#7b6a9f",
    fontWeight: "600",
    marginTop: 12,
  },
  value: {
    fontSize: 15,
    color: "#2b1a4b",
    fontWeight: "600",
    marginTop: 6,
  },
});

export default ProfileDetailsScreen;