import { useCallback, useEffect, useState } from "react";
import {
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { fetchJson } from "../api/client";
import ScreenHeader from "../components/ScreenHeader";
import { useSession } from "../context/SessionContext";

const getInitials = (name) => {
  if (!name) return "🐾";
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length === 0) return "🐾";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};

const PetsProfileScreen = ({ navigation }) => {
  const { session } = useSession();
  const [pets, setPets] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

const loadPets = useCallback(async () => {
    if (!session?.email) {
      return;
    }

    try {
      const data = await fetchJson(
        `/api/pets?ownerEmail=${encodeURIComponent(session.email)}`
      );
      setPets(Array.isArray(data?.pets) ? data.pets : []);
    } catch (error) {
      console.error("Failed to load pets", error);
    }
  }, [session?.email]);

  useEffect(() => {
    loadPets();
    }, [loadPets]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={async () => {
              setRefreshing(true);
              await loadPets();
              setRefreshing(false);
            }}
            tintColor="#5d2fc5"
          />
        }
      >
        <ScreenHeader title="Your pets" onBack={() => navigation.goBack()} />
        <View style={styles.header}>
          <Text style={styles.subtitle}>
            {pets.length} {pets.length === 1 ? "pet" : "pets"} in your profile
          </Text>
        </View>
        {pets.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>
              No pets saved yet. Add a pet when booking a service.
            </Text>
          </View>
        ) : (
          pets.map((pet) => (
            <View key={pet.id || pet.name} style={styles.petCard}>
              <View style={styles.petAvatar}>
                <Text style={styles.petAvatarText}>
                  {getInitials(pet.name || "Pet")}
                </Text>
              </View>
              <View style={styles.petInfo}>
                <Text style={styles.petName}>{pet.name || "Pet"}</Text>
                <Text style={styles.petMeta}>
                  {pet.breed || "Breed TBD"}
                </Text>
                <Text style={styles.petMeta}>{pet.age || "Age TBD"}</Text>
              </View>
              <Text style={styles.petChevron}>›</Text>
            </View>
          ))
        )}
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
    paddingHorizontal: 20,
    paddingBottom: 40,
    backgroundColor: "#ffffff",
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1f1f1f",
  },
  subtitle: {
    marginTop: 6,
    fontSize: 14,
    color: "#6f6f6f",
  },
  emptyCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e6e6e6",
  },
  emptyText: {
    fontSize: 14,
    color: "#6f6f6f",
  },
  petCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#e6e6e6",
    marginBottom: 12,
  },
  petAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#f2f2f2",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  petAvatarText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2b2b2b",
  },
  petInfo: {
    flex: 1,
  },
  petName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1f1f1f",
  },
  petMeta: {
    fontSize: 13,
    color: "#6f6f6f",
    marginTop: 4,
  },
  petChevron: {
    fontSize: 22,
    color: "#b0b0b0",
  },
});

export default PetsProfileScreen;