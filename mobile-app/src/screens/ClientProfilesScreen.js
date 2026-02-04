import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import ScreenHeader from "../components/ScreenHeader";
import { supabase } from "../api/supabaseClient";
import { useSession } from "../context/SessionContext";

const OWNER_EMAIL = "jeroen@jeroenandpaws.com";

const getInitials = (name) => {
  if (!name) return "JP";
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length === 0) return "JP";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};

const ClientProfilesScreen = ({ navigation }) => {
  const { session } = useSession();
  const [clients, setClients] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [status, setStatus] = useState("idle");
  const isOwner =
    session?.email?.toLowerCase() === OWNER_EMAIL.toLowerCase();

  const loadClients = useCallback(async () => {
    if (!supabase || !isOwner) return;
    setStatus("loading");
    try {
      const { data, error } = await supabase
        .from("clients")
        .select("id, full_name, email, address, profile_photo_url, created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setClients(data || []);
      setStatus("idle");
    } catch (error) {
      console.error("Failed to load clients", error);
      setStatus("error");
    }
  }, [isOwner]);

  useEffect(() => {
    loadClients();
  }, [loadClients]);

  const filteredClients = useMemo(() => {
    const term = searchValue.trim().toLowerCase();
    if (!term) return clients;
    return clients.filter((client) => {
      const name = client?.full_name?.toLowerCase() || "";
      const email = client?.email?.toLowerCase() || "";
      const address = client?.address?.toLowerCase() || "";
      return (
        name.includes(term) || email.includes(term) || address.includes(term)
      );
    });
  }, [clients, searchValue]);

  if (!isOwner) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <ScreenHeader
            title="Client profiles"
            onBack={() => navigation.goBack()}
            variant="dark"
          />
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>
              This section is only available for the owner account.
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <ScreenHeader
          title="Client profiles"
          onBack={() => navigation.goBack()}
          variant="dark"
        />
        <View style={styles.searchCard}>
          <Text style={styles.searchLabel}>Search clients</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Name, email, or address"
            value={searchValue}
            onChangeText={setSearchValue}
          />
        </View>
        {status === "loading" ? (
          <View style={styles.loadingState}>
            <ActivityIndicator size="small" color="#7c45f3" />
            <Text style={styles.loadingText}>Loading client list…</Text>
          </View>
        ) : null}
        {status !== "loading" && filteredClients.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>
              No clients match your search yet.
            </Text>
          </View>
        ) : null}
        {filteredClients.map((client) => (
          <Pressable
            key={client.id}
            style={({ pressed }) => [
              styles.clientCard,
              pressed && styles.cardPressed,
            ]}
            onPress={() =>
              navigation.navigate("ProfileOverview", { clientId: client.id })
            }
          >
            <View style={styles.avatar}>
              {client.profile_photo_url ? (
                <Image
                  source={{ uri: client.profile_photo_url }}
                  style={styles.avatarImage}
                />
              ) : (
                <Text style={styles.avatarText}>
                  {getInitials(client.full_name || client.email)}
                </Text>
              )}
            </View>
            <View style={styles.clientCopy}>
              <Text style={styles.clientName}>
                {client.full_name || "Client profile"}
              </Text>
              <Text style={styles.clientMeta}>
                {client.email || "Email missing"}
              </Text>
              {client.address ? (
                <Text style={styles.clientMeta}>{client.address}</Text>
              ) : null}
            </View>
            <Text style={styles.clientChevron}>›</Text>
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0c081f",
  },
  container: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 32,
    backgroundColor: "#0c081f",
  },
  searchCard: {
    backgroundColor: "#120d23",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#1f1535",
    marginBottom: 16,
  },
  searchLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#c9c5d8",
    marginBottom: 8,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: "#1f1535",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#f4f2ff",
    backgroundColor: "#0c081f",
  },
  loadingState: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  loadingText: {
    marginLeft: 10,
    color: "#c9c5d8",
    fontSize: 13,
  },
  emptyCard: {
    backgroundColor: "#120d23",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#1f1535",
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 13,
    color: "#c9c5d8",
  },
  clientCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#120d23",
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "#1f1535",
    marginBottom: 12,
  },
  cardPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#1f1535",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarImage: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#f4f2ff",
  },
  clientCopy: {
    flex: 1,
  },
  clientName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#f4f2ff",
  },
  clientMeta: {
    fontSize: 12,
    color: "#c9c5d8",
    marginTop: 3,
  },
  clientChevron: {
    fontSize: 22,
    color: "#7c45f3",
  },
});

export default ClientProfilesScreen;