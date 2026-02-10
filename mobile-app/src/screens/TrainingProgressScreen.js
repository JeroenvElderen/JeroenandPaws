import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ScreenHeader from "../components/ScreenHeader";
import { supabase } from "../api/supabaseClient";
import { useSession } from "../context/SessionContext";
import { useTheme } from "../context/ThemeContext";

const OWNER_EMAIL = "jeroen@jeroenandpaws.com";

const DEFAULT_SKILLS = [
  { key: "lead_walking", label: "Lead walking", progress: 0, sessions: 0 },
  { key: "recall", label: "Recall", progress: 0, sessions: 0 },
  { key: "social_confidence", label: "Social confidence", progress: 0, sessions: 0 },
  { key: "calm_greetings", label: "Calm greetings", progress: 0, sessions: 0 },
];

const toProgressRows = (rows) => {
  const map = new Map((rows || []).map((row) => [row.skill_key, row]));
  return DEFAULT_SKILLS.map((skill) => {
    const row = map.get(skill.key);
    return {
      ...skill,
      id: row?.id,
      progress: Number.isFinite(Number(row?.progress)) ? Number(row.progress) : skill.progress,
      sessions: Number.isFinite(Number(row?.sessions)) ? Number(row.sessions) : skill.sessions,
      updatedAt: row?.updated_at || null,
      updatedBy: row?.updated_by || null,
    };
  });
};

const TrainingProgressScreen = ({ navigation, route }) => {
  const { theme } = useTheme();
  const { session } = useSession();
  const styles = useMemo(() => createStyles(theme), [theme]);
    const [pets, setPets] = useState([]);
  const [selectedPetId, setSelectedPetId] = useState("");
  const [skills, setSkills] = useState(DEFAULT_SKILLS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingPets, setIsLoadingPets] = useState(true);

  const isOwner = session?.email?.toLowerCase() === OWNER_EMAIL.toLowerCase();
  const clientId = route?.params?.clientId || session?.id;
  const clientName = route?.params?.clientName || session?.name || "client";
  const selectedPet = pets.find((pet) => pet.id === selectedPetId) || null;

  const handleBack = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }
    navigation.navigate(route?.params?.returnTo || "ProfileHome");
  }, [navigation, route?.params]);

  useEffect(() => {
    let isMounted = true;

    const loadPets = async () => {
      if (!clientId || !supabase) {
        if (isMounted) {
          setPets([]);
          setSelectedPetId("");
          setIsLoadingPets(false);
        }
        return;
      }

      try {
        const { data, error } = await supabase
          .from("pets")
          .select("id, name, breed, owner_id, created_at")
          .eq("owner_id", clientId)
          .order("created_at", { ascending: true });

        if (error) {
          throw error;
        }

        const nextPets = Array.isArray(data) ? data : [];
        if (!isMounted) return;
        setPets(nextPets);
        setSelectedPetId((current) => {
          if (current && nextPets.some((pet) => pet.id === current)) return current;
          return nextPets[0]?.id || "";
        });
      } catch (error) {
        console.warn("Failed to load pets for training progress", error);
        if (isMounted) {
          setPets([]);
          setSelectedPetId("");
        }
      } finally {
        if (isMounted) {
          setIsLoadingPets(false);
        }
      }
    };

    loadPets();

    return () => {
      isMounted = false;
    };
  }, [clientId]);

  const loadProgress = useCallback(async () => {
    if (!selectedPetId || !supabase) {
      setSkills(DEFAULT_SKILLS);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("training_progress")
        .select("id, pet_id, owner_id, skill_key, progress, sessions, updated_at, updated_by")
        .eq("pet_id", selectedPetId);

      if (error) {
        throw error;
      }

      setSkills(toProgressRows(data));
    } catch (error) {
      console.warn("Failed to load training progress", error);
      setSkills(DEFAULT_SKILLS);
    } finally {
      setIsLoading(false);
    }
  }, [selectedPetId]);

  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  const updateSkill = (skillKey, field, value) => {
    setSkills((current) =>
      current.map((skill) => {
        if (skill.key !== skillKey) return skill;
        return {
          ...skill,
          [field]: value,
        };
      }),
    );
  };

  const handleSave = async () => {
    if (!isOwner || !clientId || !selectedPetId || !supabase) return;
    setIsSaving(true);

    try {
      const payload = skills.map((skill) => ({
        owner_id: clientId,
        pet_id: selectedPetId,
        skill_key: skill.key,
        skill_label: skill.label,
        progress: Math.max(0, Math.min(100, Number(skill.progress) || 0)),
        sessions: Math.max(0, Number(skill.sessions) || 0),
        updated_by: session?.email || OWNER_EMAIL,
      }));

      const { error } = await supabase
        .from("training_progress")
        .upsert(payload, { onConflict: "pet_id,skill_key" });

      if (error) {
        throw error;
      }

      await loadProgress();
      Alert.alert("Saved", "Training progress has been updated.");
    } catch (error) {
      console.warn("Failed to save training progress", error);
      Alert.alert(
        "Unable to save",
        "Could not update training progress in Supabase. Please run the latest training_progress SQL migration.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <ScreenHeader title="Training progress" onBack={handleBack} />
        <Text style={styles.subtitle}>
          {isOwner
            ? `Owner mode: updating progress for ${clientName}.`
            : "Progress data from Supabase based on completed training sessions."}
        </Text>
        
        <View style={styles.petSelectorCard}>
          <Text style={styles.petSelectorTitle}>Select pet</Text>
          {isLoadingPets ? <ActivityIndicator color={theme.colors.accent} /> : null}
          {!isLoadingPets && pets.length === 0 ? (
            <Text style={styles.noPetsText}>No pets found yet for this profile.</Text>
          ) : null}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.petChips}>
            {pets.map((pet) => {
              const isSelected = pet.id === selectedPetId;
              return (
                <Pressable
                  key={pet.id}
                  style={[styles.petChip, isSelected && styles.petChipSelected]}
                  onPress={() => setSelectedPetId(pet.id)}
                >
                  <Text style={[styles.petChipText, isSelected && styles.petChipTextSelected]}>
                    {pet.name || "Unnamed pet"}
                  </Text>
                  {pet.breed ? (
                    <Text
                      style={[styles.petChipMeta, isSelected && styles.petChipMetaSelected]}
                    >
                      {pet.breed}
                    </Text>
                  ) : null}
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {!selectedPetId && !isLoadingPets ? (
          <Text style={styles.noPetsText}>Add a pet profile first to track training progress.</Text>
        ) : null}

        {selectedPet ? (
          <Text style={styles.selectedPetText}>
            Tracking for: {selectedPet.name || "Unnamed pet"}
          </Text>
        ) : null}

        {isLoading ? <ActivityIndicator color={theme.colors.accent} /> : null}

        {selectedPetId
          ? skills.map((item) => (
              <View key={item.key} style={styles.card}>
                <View style={styles.row}>
                  <Text style={styles.skill}>{item.label}</Text>
                  <Text style={styles.percent}>{Math.max(0, Number(item.progress) || 0)}%</Text>
                </View>
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.barFill,
                      { width: `${Math.max(0, Math.min(100, Number(item.progress) || 0))}%` },
                    ]}
                  />
                </View>
                {isOwner ? (
                  <View style={styles.ownerControls}>
                    <View style={styles.inputWrap}>
                      <Text style={styles.inputLabel}>Progress %</Text>
                      <TextInput
                        style={styles.input}
                        keyboardType="number-pad"
                        value={String(item.progress)}
                        onChangeText={(value) =>
                          updateSkill(item.key, "progress", value.replace(/[^\d]/g, ""))
                        }
                      />
                    </View>
                    <View style={styles.inputWrap}>
                      <Text style={styles.inputLabel}>Sessions</Text>
                      <TextInput
                        style={styles.input}
                        keyboardType="number-pad"
                        value={String(item.sessions)}
                        onChangeText={(value) =>
                          updateSkill(item.key, "sessions", value.replace(/[^\d]/g, ""))
                        }
                      />
                    </View>
                  </View>
                ) : (
                  <Text style={styles.meta}>{item.sessions} sessions logged</Text>
                )}
              </View>
            ))
          : null}

        {isOwner && selectedPetId ? (
          <Pressable
            style={({ pressed }) => [styles.saveButton, pressed && styles.saveButtonPressed]}
            onPress={handleSave}
            disabled={isSaving}
          >
            <Text style={styles.saveButtonText}>{isSaving ? "Saving..." : "Save training updates"}</Text>
          </Pressable>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (theme) =>
  StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: theme.colors.background },
    container: { padding: 20, gap: 12 },
    subtitle: { color: theme.colors.textSecondary, marginBottom: 6 },
    petSelectorCard: {
      borderRadius: theme.radius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      padding: 12,
      gap: 8,
    },
    petSelectorTitle: { color: theme.colors.textPrimary, fontWeight: "700" },
    petChips: { gap: 8, paddingRight: 8 },
    petChip: {
      borderWidth: 1,
      borderColor: theme.colors.borderStrong,
      borderRadius: 12,
      paddingVertical: 8,
      paddingHorizontal: 10,
      minWidth: 108,
      backgroundColor: theme.colors.surfaceElevated,
    },
    petChipSelected: {
      backgroundColor: theme.colors.accent,
      borderColor: theme.colors.accent,
    },
    petChipText: { color: theme.colors.textPrimary, fontWeight: "700" },
    petChipTextSelected: { color: "#fff" },
    petChipMeta: { color: theme.colors.textSecondary, fontSize: 12, marginTop: 2 },
    petChipMetaSelected: { color: "#fff" },
    selectedPetText: { color: theme.colors.textSecondary, fontSize: 13 },
    noPetsText: { color: theme.colors.textMuted, fontSize: 13 },
    card: {
      backgroundColor: theme.colors.surfaceElevated,
      borderRadius: theme.radius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: 14,
      gap: 10,
    },
    row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    skill: { color: theme.colors.textPrimary, fontSize: 15, fontWeight: "700" },
    percent: { color: theme.colors.accent, fontWeight: "700" },
    barTrack: {
      height: 8,
      borderRadius: 99,
      backgroundColor: theme.colors.surfaceAccent,
      overflow: "hidden",
    },
    barFill: { height: "100%", backgroundColor: theme.colors.accent, borderRadius: 99 },
    meta: { color: theme.colors.textMuted, fontSize: 12 },
    ownerControls: { flexDirection: "row", gap: 10 },
    inputWrap: { flex: 1, gap: 4 },
    inputLabel: { color: theme.colors.textSecondary, fontSize: 12, fontWeight: "600" },
    input: {
      borderWidth: 1,
      borderColor: theme.colors.borderStrong,
      borderRadius: theme.radius.md,
      paddingHorizontal: 10,
      paddingVertical: 8,
      color: theme.colors.textPrimary,
      backgroundColor: theme.colors.surface,
    },
    saveButton: {
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.accent,
      paddingVertical: 12,
      alignItems: "center",
      marginTop: 8,
    },
    saveButtonPressed: { opacity: 0.85 },
    saveButtonText: { color: "#fff", fontWeight: "700" },
  });

export default TrainingProgressScreen;