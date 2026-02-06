import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Image,
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { fetchJson } from "../api/client";
import { supabase } from "../api/supabaseClient";
import ScreenHeader from "../components/ScreenHeader";
import { useSession } from "../context/SessionContext";
import { useTheme } from "../context/ThemeContext";

const getInitials = (name) => {
  if (!name) return "JP";
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length === 0) return "JP";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};

const PET_TABS = ["About", "Summary", "Health", "Photo Gallery"];
const YES_MAYBE_NO_OPTIONS = ["Yes", "Maybe", "No"];
const ENERGY_LEVEL_OPTIONS = ["Low", "Medium", "High", "Extreme"];

const safeValue = (value) =>
  value === null || value === undefined || value === "" ? "—" : value;

const PetsProfileScreen = ({ navigation, route }) => {
  const { theme } = useTheme();
  const { session } = useSession();
  const [pets, setPets] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState(PET_TABS[0]);
  const [isEditing, setIsEditing] = useState(false);
  const [draftPet, setDraftPet] = useState(null);
  const [saveStatus, setSaveStatus] = useState("idle");
  const [saveError, setSaveError] = useState("");
  const [openSelectField, setOpenSelectField] = useState(null);
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

  useEffect(() => {
    if (isDetailView) {
      setDraftPet(selectedPet);
      setIsEditing(false);
      setActiveTab(PET_TABS[0]);
      setSaveError("");
      setSaveStatus("idle");
      setOpenSelectField(null);
    }
  }, [isDetailView, selectedPet]);

  const updateDraftField = (field, value) => {
    setDraftPet((current) => ({ ...(current || {}), [field]: value }));
  };

  const handleSavePet = async () => {
    if (!draftPet?.id || !supabase) {
      setIsEditing(false);
      return;
    }

    const isFieldEmpty = (value) =>
      value === null || value === undefined || value === "";
    const missingFields = [
      { key: "age_years", label: "Age" },
      { key: "weight_kg", label: "Weight (kg)" },
      { key: "adoption_date", label: "Adoption date" },
    ].filter((field) => isFieldEmpty(draftPet?.[field.key]));

    if (missingFields.length) {
      setSaveError(
        `Please fill in ${missingFields.map((field) => field.label).join(", ")}.`
      );
      setSaveStatus("idle");
      return;
    }

    setSaveStatus("saving");
    setSaveError("");
    try {
      const payload = { ...draftPet, updated_at: new Date().toISOString() };
      const { data, error } = await supabase
        .from("pets")
        .update(payload)
        .eq("id", draftPet.id)
        .select("*")
        .maybeSingle();
      if (error) throw error;
      if (data) {
        setDraftPet(data);
      }
      setSaveStatus("idle");
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to save pet profile", error);
      setSaveError(error.message || "Unable to save changes.");
      setSaveStatus("idle");
    }
  };

  const handlePickPhoto = async (field) => {
    setSaveError("");
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        setSaveError("Photo access is required to upload images.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        base64: true,
      });

      if (result.canceled) return;

      const asset = result.assets?.[0];
      if (!asset?.base64) return;
      const dataUrl = `data:image/jpeg;base64,${asset.base64}`;

      if (field === "photo_gallery_urls") {
        const existing = Array.isArray(draftPet?.photo_gallery_urls)
          ? draftPet.photo_gallery_urls
          : [];
        updateDraftField(field, [...existing, dataUrl]);
        return;
      }

      updateDraftField(field, dataUrl);
    } catch (error) {
      console.error("Failed to pick photo", error);
      setSaveError(error.message || "Unable to load photo.");
    }
  };

  if (isDetailView) {
    const pet = draftPet || selectedPet || {};
    const petPhoto =
      pet.photo_data_url || pet.photoUrl || pet.photo_url || null;
    const galleryPhotos = Array.isArray(pet.photo_gallery_urls)
      ? pet.photo_gallery_urls
      : [];

    const renderField = (label, field, options = {}) => (
      <View style={styles.detailRow} key={field}>
        <Text style={styles.detailLabel}>{label}</Text>
        {isEditing ? (
          <TextInput
            style={[styles.input, options.multiline && styles.textArea]}
            value={pet?.[field] ? String(pet[field]) : ""}
            placeholder={options.placeholder || "Add info"}
            multiline={options.multiline}
            keyboardType={options.keyboardType}
            onChangeText={(value) => updateDraftField(field, value)}
          />
        ) : (
          <Text style={styles.detailValue}>{safeValue(pet?.[field])}</Text>
        )}
      </View>
    );

    const resolveYesMaybeNo = (value) => {
      if (value === true) return "Yes";
      if (value === false) return "No";
      if (typeof value === "string") {
        const normalized = value.toLowerCase();
        if (normalized.startsWith("y")) return "Yes";
        if (normalized.startsWith("n")) return "No";
        if (normalized.startsWith("m")) return "Maybe";
      }
      return "Maybe";
    };

    const renderSelectField = (
      label,
      field,
      options,
      { isBoolean = false } = {}
    ) => {
      const rawValue = pet?.[field];
      const displayValue = isBoolean
        ? resolveYesMaybeNo(rawValue)
        : rawValue
        ? String(rawValue)
        : "—";

      const handleSelect = (selection) => {
        if (isBoolean) {
          updateDraftField(
            field,
            selection === "Yes" ? true : selection === "No" ? false : null
          );
        } else {
          updateDraftField(field, selection);
        }
        setOpenSelectField(null);
      };

      return (
        <View style={styles.detailRow} key={field}>
          <Text style={styles.detailLabel}>{label}</Text>
          {isEditing ? (
            <View>
              <Pressable
                style={styles.selectInput}
                onPress={() =>
                  setOpenSelectField((current) =>
                    current === field ? null : field
                  )
                }
              >
                <Text style={styles.selectValue}>{displayValue}</Text>
                <Text style={styles.selectChevron}>▾</Text>
              </Pressable>
              {openSelectField === field ? (
                <View style={styles.selectOptions}>
                  {options.map((option) => (
                    <Pressable
                      key={`${field}-${option}`}
                      style={styles.selectOption}
                      onPress={() => handleSelect(option)}
                    >
                      <Text style={styles.selectOptionText}>{option}</Text>
                    </Pressable>
                  ))}
                </View>
              ) : null}
            </View>
          ) : (
            <Text style={styles.detailValue}>{displayValue}</Text>
          )}
        </View>
      );
    };

    return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.detailHeader}>
            <Pressable
              style={styles.headerIconButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.headerIcon}>←</Text>
            </Pressable>
            <Text style={styles.headerTitle}>
              {pet.name || "Pet profile"}
            </Text>
            <Pressable
              style={styles.headerIconButton}
              onPress={
                isEditing
                  ? handleSavePet
                  : () => {
                      setIsEditing(true);
                      setSaveError("");
                    }
              }
              disabled={saveStatus === "saving"}
            >
              <Text style={styles.headerActionText}>
                {saveStatus === "saving"
                  ? "Saving"
                  : isEditing
                  ? "Save"
                  : "Edit"}
              </Text>
            </Pressable>
          </View>

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
                  {getInitials(pet.name || "Pet")}
                </Text>
              </View>
            )}
            {isEditing ? (
              <Pressable
                style={styles.photoAction}
                onPress={() => handlePickPhoto("photo_data_url")}
              >
                <Text style={styles.photoActionText}>
                  {petPhoto ? "Change photo" : "Add photo"}
                </Text>
              </Pressable>
            ) : null}
            <Text style={styles.petDetailName}>
              {pet.name || "Pet"}
            </Text>
            <Text style={styles.petDetailMeta}>
              {[pet.breed, pet.gender]
                .filter(Boolean)
                .join(" · ") || "Pet details"}
            </Text>
          </View>

          <View style={styles.tabRow}>
            {PET_TABS.map((tab) => (
              <Pressable
                key={tab}
                style={[
                  styles.tabPill,
                  activeTab === tab && styles.tabPillActive,
                ]}
                onPress={() => setActiveTab(tab)}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === tab && styles.tabTextActive,
                  ]}
                >
                  {tab}
                </Text>
              </Pressable>
            ))}
          </View>

          {activeTab === "About" ? (
            <View style={styles.sectionCard}>
              {renderField("Breed", "breed")}
              {renderField("Birthdate", "birthdate", {
                placeholder: "YYYY-MM-DD",
              })}
              {renderField("Age *", "age_years", {
                keyboardType: "numeric",
              })}
              {renderField("Weight (kg) *", "weight_kg", {
                keyboardType: "numeric",
              })}
              {renderField("Color", "color")}
              {renderField("Microchip ID", "microchip_id")}
              {renderField("Adoption date *", "adoption_date", {
                placeholder: "YYYY-MM-DD",
              })}
              {renderField("About your pet", "notes", {
                multiline: true,
              })}
            </View>
          ) : null}
          
          {activeTab === "Summary" ? (
            <View style={styles.sectionCard}>
              {renderSelectField(
                "Friendly with dogs",
                "socialization_dogs",
                YES_MAYBE_NO_OPTIONS
              )}
              {renderSelectField(
                "Friendly with cats",
                "socialization_cats",
                YES_MAYBE_NO_OPTIONS
              )}
              {renderSelectField(
                "Friendly with children",
                "socialization_children",
                YES_MAYBE_NO_OPTIONS
              )}
              {renderSelectField(
                "Spayed/neutered",
                "spayed_neutered",
                YES_MAYBE_NO_OPTIONS,
                { isBoolean: true }
              )}
              {renderSelectField(
                "House trained",
                "house_trained",
                YES_MAYBE_NO_OPTIONS,
                { isBoolean: true }
              )}
              {renderSelectField(
                "Energy level",
                "energy_level",
                ENERGY_LEVEL_OPTIONS
              )}
              {renderField("Toilet break interval (hrs)", "toilet_break_interval_hours", {
                keyboardType: "numeric",
              })}
              {renderField("Time alone (hrs)", "time_alone_max_hours", {
                keyboardType: "numeric",
              })}
              {renderField("Feeding schedule", "feeding_schedule")}
              {renderField("Care instructions", "care_instructions", {
                multiline: true,
              })}
            </View>
          ) : null}

          {activeTab === "Health" ? (
            <View style={styles.sectionCard}>
              {renderField("Veterinary info", "vet_name")}
              {renderField("Vet phone", "vet_phone")}
              {renderField("Insurance provider", "insurance_provider")}
              {renderField("Allergies", "allergies")}
              {renderField("Medications", "medications")}
              {renderField("Medical notes", "medical_notes", {
                multiline: true,
              })}
            </View>
          ) : null}

          {activeTab === "Photo Gallery" ? (
            <View style={styles.sectionCard}>
              <Text style={styles.galleryTitle}>Photo Gallery</Text>
              <Text style={styles.gallerySubtitle}>
                Photos uploaded by the pet owner and sitters.
              </Text>
              <View style={styles.photoGrid}>
                {galleryPhotos.map((uri, index) => (
                  <Image
                    key={`${uri}-${index}`}
                    source={{ uri }}
                    style={styles.galleryPhoto}
                  />
                ))}
                {isEditing ? (
                  <Pressable
                    style={styles.addPhotoTile}
                    onPress={() => handlePickPhoto("photo_gallery_urls")}
                  >
                    <Text style={styles.addPhotoIcon}>＋</Text>
                    <Text style={styles.addPhotoLabel}>Add photos</Text>
                  </Pressable>
                ) : null}
              </View>
            </View>
          ) : null}

          {saveError ? (
            <Text style={styles.errorText}>{saveError}</Text>
          ) : null}

          {!isEditing ? (
            <Pressable
              style={styles.editProfileButton}
              onPress={() => setIsEditing(true)}
            >
              <Text style={styles.editProfileText}>Edit profile</Text>
            </Pressable>
          ) : (
            <Pressable
              style={styles.editProfileButton}
              onPress={handleSavePet}
              disabled={saveStatus === "saving"}
            >
              <Text style={styles.editProfileText}>
                {saveStatus === "saving" ? "Saving..." : "Save profile"}
              </Text>
            </Pressable>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  const styles = useMemo(() => createStyles(theme), [theme]);

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
            tintColor={theme.colors.accent}
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
                {pet.photo_data_url || pet.photoUrl || pet.photo_url ? (
                  <Image
                    source={{
                      uri: pet.photo_data_url || pet.photoUrl || pet.photo_url,
                    }}
                    style={styles.petAvatarImage}
                  />
                ) : (
                  <Text style={styles.petAvatarText}>
                    {getInitials(pet.name || "Pet")}
                  </Text>
                )}
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

const createStyles = (theme) =>
  StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
    backgroundColor: theme.colors.background,
  },
  detailHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  headerIconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: theme.colors.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  headerIcon: {
    fontSize: 18,
    color: theme.colors.textPrimary,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.textPrimary,
  },
  headerActionText: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.textPrimary,
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
    backgroundColor: theme.colors.surfaceElevated,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  petHeroPlaceholderText: {
    fontSize: 40,
    fontWeight: "700",
    color: theme.colors.textPrimary,
  },
  photoAction: {
    marginBottom: 12,
  },
  photoActionText: {
    fontSize: 13,
    color: theme.colors.accentSoft,
    fontWeight: "600",
  },
  petDetailName: {
    fontSize: 24,
    fontWeight: "700",
    color: theme.colors.textPrimary,
  },
  petDetailMeta: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginTop: 6,
  },
  tabRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 16,
  },
  tabPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  tabPillActive: {
    backgroundColor: theme.colors.surfaceAccent,
    borderColor: theme.colors.surfaceAccent,
  },
  tabText: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.colors.textSecondary,
  },
  tabTextActive: {
    color: theme.colors.white,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: theme.colors.textPrimary,
  },
  subtitle: {
    marginTop: 6,
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  emptyCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  emptyText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: theme.colors.textPrimary,
    marginTop: 12,
    marginBottom: 8,
  },
  sectionCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 16,
  },
  detailRow: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  detailRowLast: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
  detailLabel: {
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    color: theme.colors.textMuted,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 15,
    color: theme.colors.textPrimary,
  },
  selectInput: {
    borderWidth: 1,
    borderColor: theme.colors.accent,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: theme.colors.surface,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  selectValue: {
    fontSize: 14,
    color: theme.colors.textPrimary,
  },
  selectChevron: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  selectOptions: {
    marginTop: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.accent,
    backgroundColor: theme.colors.surface,
    overflow: "hidden",
  },
  selectOption: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  selectOptionText: {
    fontSize: 14,
    color: theme.colors.textPrimary,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.accent,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: theme.colors.textPrimary,
    backgroundColor: theme.colors.surface,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  noteText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  galleryTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  gallerySubtitle: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginBottom: 12,
  },
  photoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  galleryPhoto: {
    width: 120,
    height: 120,
    borderRadius: 14,
    backgroundColor: theme.colors.surfaceElevated,
  },
  addPhotoTile: {
    width: 120,
    height: 120,
    borderRadius: 14,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: theme.colors.borderStrong,
    alignItems: "center",
    justifyContent: "center",
  },
  addPhotoIcon: {
    fontSize: 28,
    color: theme.colors.accentSoft,
    marginBottom: 4,
  },
  addPhotoLabel: {
    fontSize: 12,
    color: theme.colors.textPrimary,
  },
  editProfileButton: {
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    marginBottom: 12,
  },
  editProfileText: {
    fontSize: 15,
    fontWeight: "600",
    color: theme.colors.textPrimary,
  },
  errorText: {
    color: theme.colors.danger,
    marginBottom: 12,
    textAlign: "center",
  },
  petCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.md,
  },
  petCardPressed: {
    opacity: 0.85,
  },
  petAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.surfaceElevated,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  petAvatarImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  petAvatarText: {
    fontSize: 18,
    fontWeight: "700",
    color: theme.colors.textPrimary,
  },
  petInfo: {
    flex: 1,
  },
  petName: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.textPrimary,
  },
  petMeta: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  petChevron: {
    fontSize: 22,
    color: theme.colors.textMuted,
  },
  });

export default PetsProfileScreen;
