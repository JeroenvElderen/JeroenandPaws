import { useEffect, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { fetchJson } from "../api/client";
import { useSession } from "../context/SessionContext";

const PetsProfileScreen = () => {
  const { session } = useSession();
  const [pets, setPets] = useState([]);

  useEffect(() => {
    let isMounted = true;

    const loadPets = async () => {
      if (!session?.email) {
        return;
      }

      try {
        const data = await fetchJson(
          `/api/pets?ownerEmail=${encodeURIComponent(session.email)}`
        );
        if (!isMounted) return;
        setPets(Array.isArray(data?.pets) ? data.pets : []);
      } catch (error) {
        console.error("Failed to load pets", error);
      }
    };

    loadPets();

    return () => {
      isMounted = false;
    };
  }, [session?.email]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Your pets</Text>
        {pets.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>
              No pets saved yet. Add a pet when booking a service.
            </Text>
          </View>
        ) : (
          pets.map((pet) => (
            <View key={pet.id || pet.name} style={styles.card}>
              <Text style={styles.petName}>{pet.name || "Pet"}</Text>
              <Text style={styles.petMeta}>{pet.breed || "Breed TBD"}</Text>
              <Text style={styles.petMeta}>{pet.age || "Age TBD"}</Text>
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
  emptyCard: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#ebe4f7",
  },
  emptyText: {
    fontSize: 14,
    color: "#7b6a9f",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#ebe4f7",
    marginBottom: 12,
  },
  petName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2b1a4b",
  },
  petMeta: {
    fontSize: 13,
    color: "#6c5a92",
    marginTop: 4,
  },
});

export default PetsProfileScreen;