import { useCallback, useEffect, useState } from "react";
import {
  Image,
  Pressable,
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

const PetsProfileScreen = ({ navigation, route }) => {
  const { session } = useSession();
  const [pets, setPets] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const selectedPet = route?.params?.pet || null;
  const isDetailView = Boolean(selectedPet);

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
    if (!isDetailView) {
      loadPets();
    }
  }, [isDetailView, loadPets]);

  if (isDetailView) {
    const petPhoto =
      selectedPet.photo_data_url ||
      selectedPet.photoUrl ||
      selectedPet.photo_url ||
      null;
    const detailRows = [
      { label: "Breed", value: selectedPet.breed },
      { label: "Age", value: selectedPet.age },
      { label: "Gender", value: selectedPet.gender },
      { label: "Weight", value: selectedPet.weight },
      { label: "Size", value: selectedPet.size },
    ].filter((item) => Boolean(item.value));

    return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.container}>
          <ScreenHeader
            title={selectedPet.name || "Pet profile"}
            onBack={() => navigation.goBack()}
          />
          <View style={styles.petDetailHeader}>
            {petPhoto ? (
              <Image
                source={{ uri: petPhoto }}
                style={styles.petHeroImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.petHeroPlaceholder}>
                <Text style={styles.petHeroPlaceholderText}>
                  {getInitials(selectedPet.name || "Pet")}
                </Text>
              </View>
            )}
            <Text style={styles.petDetailName}>
              {selectedPet.name || "Pet"}
            </Text>
            {selectedPet.breed ? (
              <Text style={styles.petDetailMeta}>{selectedPet.breed}</Text>
            ) : null}
          </View>
          {detailRows.length ? (
            <View style={styles.sectionCard}>
              {detailRows.map((detail, index) => (
                <View
                  key={detail.label}
                  style={[
                    styles.detailRow,
                    index === detailRows.length - 1 && styles.detailRowLast,
                  ]}
                >
                  <Text style={styles.detailLabel}>{detail.label}</Text>
                  <Text style={styles.detailValue}>{detail.value}</Text>
                </View>
              ))}
            </View>
          ) : null}
          <Text style={styles.sectionTitle}>Notes</Text>
          <View style={styles.sectionCard}>
            <Text style={styles.noteText}>
              {selectedPet.notes || "No notes yet."}
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

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
            <Pressable
              key={pet.id || pet.name}
              style={({ pressed }) => [
                styles.petCard,
                pressed && styles.petCardPressed,
              ]}
              onPress={() => navigation.push("PetsProfile", { pet })}
            >
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
            </Pressable>
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
  petDetailHeader: {
    alignItems: "center",
    marginBottom: 20,
  },
  petHeroImage: {
    width: "100%",
    height: 220,
    borderRadius: 18,
    marginBottom: 16,
  },
  petHeroPlaceholder: {
    width: "100%",
    height: 220,
    borderRadius: 18,
    backgroundColor: "#efe9fb",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  petHeroPlaceholderText: {
    fontSize: 40,
    fontWeight: "700",
    color: "#5d2fc5",
  },
  petDetailName: {
    fontSize: 24,
    fontWeight: "700",
    color: "#2b1a4b",
  },
  petDetailMeta: {
    fontSize: 16,
    color: "#6c5a92",
    marginTop: 6,
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2b1a4b",
    marginTop: 12,
    marginBottom: 8,
  },
  sectionCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#ece4fb",
    marginBottom: 16,
  },
  detailRow: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f1edf9",
  },
  detailRowLast: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
  detailLabel: {
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    color: "#8d80a8",
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 15,
    color: "#2b1a4b",
  },
  noteText: {
    fontSize: 14,
    color: "#4a3a67",
    lineHeight: 20,
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
  petCardPressed: {
    opacity: 0.85,
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