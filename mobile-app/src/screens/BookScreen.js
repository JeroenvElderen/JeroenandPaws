import { SafeAreaView, StyleSheet, Text, View } from "react-native";
import { WebView } from "react-native-webview";
import { API_BASE_URL } from "../api/config";

const BookScreen = () => (
  <View style={styles.container}>
    <View style={styles.header}>
        <View style={styles.badgeRow}>
            <Text style={styles.badge}>Secure checkout</Text>
            <Text style={styles.badgeDot}>•</Text>
            <Text style={styles.badgeText}>Trusted by local pet parents</Text>
      </View>
      <Text style={styles.title}>Book a visit</Text>
      <Text style={styles.subtitle}>
        Complete booking, payments, and scheduling in the secure flow below.
      </Text>
    </View>
    <View style={styles.webviewCard}>
      <WebView
        source={{ uri: `${API_BASE_URL}/services?booking=1` }}
        style={styles.webview}
        startInLoadingState
      />
    </View>
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
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  badge: {
    backgroundColor: "rgba(124,69,243,0.18)",
    color: "#bda7ff",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    fontSize: 12,
    fontWeight: "600",
  },
  badgeDot: {
    color: "#6f6a87",
    marginHorizontal: 6,
  },
  badgeText: {
    color: "#9f9ab8",
    fontSize: 12,
  },
  webviewCard: {
    flex: 1,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    backgroundColor: "#120d23",
  },
  webview: {
    flex: 1,
    backgroundColor: "#120d23",
  },
});

export default BookScreen;