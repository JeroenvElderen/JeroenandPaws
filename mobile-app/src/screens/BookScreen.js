import { StyleSheet, Text, View } from "react-native";
import { WebView } from "react-native-webview";
import { API_BASE_URL } from "../api/config";

const BookScreen = () => (
  <View style={styles.container}>
    <View style={styles.header}>
      <Text style={styles.title}>Book a visit</Text>
      <Text style={styles.subtitle}>
        Complete booking, payments, and scheduling in the secure flow below.
      </Text>
    </View>
    <WebView
      source={{ uri: `${API_BASE_URL}/services?booking=1` }}
      style={styles.webview}
      startInLoadingState
    />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0c081f",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    color: "#f4f2ff",
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 4,
  },
  subtitle: {
    color: "#c9c5d8",
    fontSize: 14,
  },
  webview: {
    flex: 1,
    backgroundColor: "#0c081f",
  },
});

export default BookScreen;