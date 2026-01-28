import { useEffect, useMemo, useState } from "react";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

const defaultActivities = [
  { key: "pee", label: "Pee", icon: "💧" },
  { key: "poo", label: "Poo", icon: "💩" },
  { key: "food", label: "Food", icon: "🍽️" },
  { key: "water", label: "Water", icon: "🧊" },
  { key: "walk", label: "Walk", icon: "🐾" },
  { key: "training", label: "Training", icon: "🎯" },
];

const formatPetsLabel = (pets) => {
  if (!pets) return "Pets";
  if (Array.isArray(pets)) {
    const names = pets
      .map((pet) => (typeof pet === "string" ? pet : pet?.name))
      .filter(Boolean);
    return names.length ? names.join(", ") : "Pets";
  }
  if (typeof pets === "string") return pets;
  if (typeof pets === "object") return pets.name || "Pets";
  return "Pets";
};

const normalizePets = (pets) => {
  if (!pets) return [];
  if (Array.isArray(pets)) {
    return pets
      .map((pet) => {
        if (!pet) return null;
        if (typeof pet === "string") return { name: pet };
        return pet;
      })
      .filter(Boolean);
  }
  if (typeof pets === "string") {
    return [{ name: pets }];
  }
  if (typeof pets === "object") {
    return [pets];
  }
  return [];
};

const buildPetMeta = (pet) => {
  if (!pet) return "Pet details";
  const resolveAge = () => {
    if (pet.age) {
      return typeof pet.age === "number" ? `${pet.age} yrs` : pet.age;
    }
    if (Number.isFinite(pet.age_years)) {
      return `${pet.age_years} yrs`;
    }
    if (Number.isFinite(pet.ageYears)) {
      return `${pet.ageYears} yrs`;
    }
    if (Number.isFinite(pet.age_months)) {
      return `${pet.age_months} mos`;
    }
    if (Number.isFinite(pet.ageMonths)) {
      return `${pet.ageMonths} mos`;
    }
    return null;
  };
  const age = resolveAge();
  const weight = pet.weight_kg
    ? `${pet.weight_kg} kg`
    : pet.weight
    ? `${pet.weight}`
    : null;
  const details = [pet.breed, age, weight].filter(Boolean);
  return details.length ? details.join(" · ") : "Pet details";
};

const JeroenPawsCardScreen = ({ navigation, route }) => {
  const petList = useMemo(
    () => normalizePets(route?.params?.pets || route?.params?.pet),
    [route?.params?.pet, route?.params?.pets]
  );
  const petsLabel = petList.length
    ? formatPetsLabel(petList)
    : "Your pets";
  const resolvedPets = useMemo(
    () =>
      petList.length
        ? petList
        : [
            {
              name: petsLabel,
              id: "default",
            },
          ],
    [petList, petsLabel]
  );
  const serviceTitle = route?.params?.serviceTitle || "Drop-In Visits";
  const [note, setNote] = useState("");
  const [photoCount, setPhotoCount] = useState(1);
  const [walkCompleted, setWalkCompleted] = useState(false);

  const getPetKey = (pet, index) => pet?.id || pet?.name || `pet-${index}`;

  const buildActivityCounts = (pets) =>
    pets.reduce((acc, pet, index) => {
      const petKey = getPetKey(pet, index);
      acc[petKey] = defaultActivities.reduce((activityAcc, activity) => {
        activityAcc[activity.key] = 0;
        return activityAcc;
      }, {});
      return acc;
    }, {});

  const [counts, setCounts] = useState(() =>
    buildActivityCounts(resolvedPets)
  );

  useEffect(() => {
    setCounts(buildActivityCounts(resolvedPets));
  }, [resolvedPets]);

  const updateCount = (petKey, key, delta) => {
    setCounts((prev) => ({
      ...prev,
      [petKey]: {
        ...prev[petKey],
        [key]: Math.max(0, (prev[petKey]?.[key] || 0) + delta),
      },
    }));
  };

  const handleFinishVisit = () => {
    const totalWalks = Object.values(counts).reduce(
      (sum, petCounts) => sum + (petCounts?.walk || 0),
      0
    );
    if (totalWalks > 0) {
      setWalkCompleted(true);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Pressable
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backIcon}>←</Text>
          </Pressable>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>{serviceTitle}</Text>
            <Text style={styles.headerSubtitle}>{petsLabel}</Text>
          </View>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.mapCard}>
          <View style={styles.mapPlaceholder}>
            <Text style={styles.mapPlaceholderText}>Walk Map Preview</Text>
            {walkCompleted ? (
              <View style={styles.routeBadge}>
                <Text style={styles.routeBadgeText}>
                  Walking route tracked
                </Text>
              </View>
            ) : null}
          </View>
          <Pressable
            style={styles.addPhotoButton}
            onPress={() => setPhotoCount((count) => count + 1)}
          >
            <Text style={styles.addPhotoText}>📷 Add Photo</Text>
          </Pressable>
        </View>

        <View style={styles.noteCard}>
          <Text style={styles.noteTitle}>Note</Text>
          <TextInput
            style={styles.noteInput}
            multiline
            placeholder={`Add a note for ${petsLabel}`}
            value={note}
            onChangeText={setNote}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Activities</Text>
          {resolvedPets.map((pet, index) => {
            const petName = pet?.name || petsLabel;
            const avatarText = petName.slice(0, 1).toUpperCase();
            const meta = buildPetMeta(pet);
            const petKey = getPetKey(pet, index);
            return (
              <View key={petKey} style={styles.petSection}>
                <View style={styles.petRow}>
                  <View style={styles.petAvatar}>
                    <Text style={styles.petAvatarText}>{avatarText}</Text>
                  </View>
                  <View>
                    <Text style={styles.petName}>{petName}</Text>
                    <Text style={styles.petBreed}>{meta}</Text>
                  </View>
                </View>
              
              {defaultActivities.map((activity) => (
                  <View key={activity.key} style={styles.activityRow}>
                    <View style={styles.activityLabel}>
                      <Text style={styles.activityIcon}>{activity.icon}</Text>
                      <Text style={styles.activityText}>
                        {activity.label}
                      </Text>
                    </View>
                    <View style={styles.counter}>
                      <Pressable
                        style={[styles.counterButton, styles.counterButtonPrimary]}
                        onPress={() => updateCount(petKey, activity.key, -1)}
                      >
                        <Text style={styles.counterButtonText}>−</Text>
                      </Pressable>
                      <Text style={styles.counterValue}>
                        {counts[petKey]?.[activity.key] ?? 0}
                      </Text>
                      <Pressable
                        style={[styles.counterButton, styles.counterButtonPrimary]}
                        onPress={() => updateCount(petKey, activity.key, 1)}
                      >
                        <Text style={styles.counterButtonText}>+</Text>
                      </Pressable>
                    </View>
                  </View>
                ))}
              </View>
              );
          })}
        </View>

        <View style={styles.actionRow}>
          <Pressable style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Care Info</Text>
          </Pressable>
          <Pressable style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Call owner</Text>
          </Pressable>
        </View>

        <Pressable style={styles.finishButton} onPress={handleFinishVisit}>
          <Text style={styles.finishButtonText}>Finish Visit</Text>
        </Pressable>
        <Text style={styles.photoCountText}>
          Photos: {photoCount} uploaded
        </Text>
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
    padding: 20,
    paddingBottom: 32,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#efe7dd",
  },
  backIcon: {
    fontSize: 20,
    color: "#2b1a4b",
  },
  headerText: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2b1a4b",
  },
  headerSubtitle: {
    marginTop: 4,
    fontSize: 14,
    color: "#6c5a92",
  },
  headerSpacer: {
    width: 42,
  },
  mapCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ebe4f7",
    padding: 16,
    marginBottom: 16,
  },
  mapPlaceholder: {
    height: 160,
    borderRadius: 16,
    backgroundColor: "#f0ecf6",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  mapPlaceholderText: {
    color: "#8c7bb0",
    fontSize: 13,
    marginBottom: 8,
  },
  routeBadge: {
    backgroundColor: "#2f63d6",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  routeBadgeText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 12,
  },
  addPhotoButton: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#cfd6e0",
    paddingVertical: 12,
    alignItems: "center",
  },
  addPhotoText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#3a2b55",
  },
  noteCard: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#ebe4f7",
    padding: 16,
    marginBottom: 16,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2b1a4b",
    marginBottom: 8,
  },
  noteInput: {
    minHeight: 72,
    fontSize: 14,
    color: "#4a3b63",
  },
  section: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ebe4f7",
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2b1a4b",
    marginBottom: 16,
  },
  petSection: {
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#efe4f7",
    paddingBottom: 12,
  },
  petRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  petAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#efe9fb",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  petAvatarText: {
    fontWeight: "700",
    color: "#5d2fc5",
  },
  petName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2b1a4b",
  },
  petBreed: {
    fontSize: 13,
    color: "#7b6a9f",
    marginTop: 4,
  },
  activityRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
  },
  activityLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  activityIcon: {
    fontSize: 18,
  },
  activityText: {
    fontSize: 15,
    color: "#2b1a4b",
  },
  counter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  counterButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#d9d9de",
    alignItems: "center",
    justifyContent: "center",
  },
  counterButtonPrimary: {
    backgroundColor: "#2b1a4b",
  },
  counterButtonText: {
    fontSize: 18,
    color: "#ffffff",
  },
  counterValue: {
    fontSize: 15,
    color: "#2b1a4b",
    fontWeight: "600",
    minWidth: 20,
    textAlign: "center",
  },
  actionRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  secondaryButton: {
    flex: 1,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#cfd6e0",
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
  secondaryButtonText: {
    color: "#2b1a4b",
    fontWeight: "600",
  },
  finishButton: {
    borderRadius: 999,
    backgroundColor: "#2f63d6",
    paddingVertical: 14,
    alignItems: "center",
    shadowColor: "#2b1a4b",
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
  },
  finishButtonText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 16,
  },
  photoCountText: {
    marginTop: 12,
    textAlign: "center",
    fontSize: 12,
    color: "#7b6a9f",
  },
});

export default JeroenPawsCardScreen;