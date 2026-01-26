import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import PrimaryButton from "../components/PrimaryButton";
import { API_BASE_URL } from "../api/config";

const ProfileScreen = () => {
  const [email, setEmail] = useState("");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadBookings = async () => {
    if (!email) {
      setError("Please enter the email you used for booking.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const res = await fetch(
        `${API_BASE_URL}/api/client-bookings?email=${encodeURIComponent(email)}`
      );
      if (!res.ok) {
        throw new Error("Unable to load bookings.");
      }
      const data = await res.json();
      setBookings(data.bookings || []);
    } catch (fetchError) {
      setError(fetchError.message || "Unable to load bookings.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your profile</Text>
      <Text style={styles.subtitle}>
        Log in with the email you used for booking to see your upcoming visits.
      </Text>

      <TextInput
        style={styles.input}
        placeholder="you@email.com"
        placeholderTextColor="#6f6a87"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <PrimaryButton label="Load my bookings" onPress={loadBookings} />

      {loading && <ActivityIndicator color="#7c45f3" />}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <FlatList
        data={bookings}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          !loading && (
            <Text style={styles.empty}>No bookings yet. Book a visit to start.</Text>
          )
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.service_title || "Service"}</Text>
            <Text style={styles.cardMeta}>{item.status || "Scheduled"}</Text>
            <Text style={styles.cardMeta}>
              {item.start_at ? new Date(item.start_at).toLocaleString() : "Time pending"}
            </Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0c081f",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#f4f2ff",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#c9c5d8",
    marginBottom: 16,
  },
  input: {
    backgroundColor: "#120d23",
    borderRadius: 12,
    padding: 12,
    color: "#f4f2ff",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    marginBottom: 10,
  },
  error: {
    color: "#f97316",
    marginTop: 8,
  },
  list: {
    paddingTop: 12,
    paddingBottom: 40,
  },
  empty: {
    color: "#c9c5d8",
    marginTop: 12,
  },
  card: {
    backgroundColor: "#120d23",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  cardTitle: {
    color: "#f4f2ff",
    fontSize: 16,
    fontWeight: "600",
  },
  cardMeta: {
    color: "#c9c5d8",
    marginTop: 4,
  },
});

export default ProfileScreen;