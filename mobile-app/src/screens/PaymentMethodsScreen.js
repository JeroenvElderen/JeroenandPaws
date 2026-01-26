import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

const PaymentMethodsScreen = () => (
  <SafeAreaView style={styles.safeArea}>
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Payment methods</Text>
      <View style={styles.card}>
        <Text style={styles.label}>Primary card</Text>
        <Text style={styles.value}>•••• 2234 · Visa</Text>
        <Pressable style={styles.button}>
          <Text style={styles.buttonText}>Change card</Text>
        </Pressable>
      </View>
      <View style={styles.card}>
        <Text style={styles.label}>Billing settings</Text>
        <Text style={styles.value}>Invoices sent to your email.</Text>
        <Pressable style={styles.button}>
          <Text style={styles.buttonText}>Update billing details</Text>
        </Pressable>
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
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#2b1a4b",
    marginBottom: 6,
  },
  value: {
    fontSize: 13,
    color: "#6c5a92",
    marginBottom: 12,
  },
  button: {
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: "#efe9fb",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e6def6",
  },
  buttonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#4a3a68",
  },
});

export default PaymentMethodsScreen;