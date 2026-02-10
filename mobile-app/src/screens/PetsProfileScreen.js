import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { fetchJson } from "../api/client";
import { supabase } from "../api/supabaseClient";
import PrimaryButton from "../components/PrimaryButton";
import ScreenHeader from "../components/ScreenHeader";
import { useSession } from "../context/SessionContext";
import { useTheme } from "../context/ThemeContext";
import {
  loadCachedPets,
  saveCachedPets,
  upsertCachedPet,
} from "../utils/petProfilesCache";

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
  const { session } = useSession();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [pets, setPets] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState(PET_TABS[0]);
  const [isEditing, setIsEditing] = useState(false);
  const [draftPet, setDraftPet] = useState(null);
  const [saveStatus, setSaveStatus] = useState("idle");
  const [saveError, setSaveError] = useState("");
  const [openSelectField, setOpenSelectField] = useState(null);
  const [offlineState, setOfflineState] = useState({
    isOffline: false,
    updatedAt: null,
  });
  const selectedPet = route?.params?.pet || null;
  const isCreating = route?.params?.mode === "create";
  const isDetailView = Boolean(selectedPet) || isCreating;
  const returnTo = route?.params?.returnTo;

  const handleReturn = () => {
    if (returnTo === "MainTabs") {
      navigation.reset({ index: 0, routes: [{ name: "MainTabs" }] });
      return;
    }
    if (returnTo) {
      if (returnTo === "Profile") {
        navigation.getParent()?.navigate("Profile", { screen: "ProfileHome" });
        return;
      }
      navigation.getParent()?.navigate(returnTo);
      return;
    }
    navigation.goBack();
  };

  const loadPets = useCallback(
    async ({ allowCache = true } = {}) => {
      if (!session?.email) {
        return;
      }

      if (allowCache) {
        const cached = await loadCachedPets(session.email);
        if (cached?.pets) {
          setPets(cached.pets);
          setOfflineState({
            isOffline: false,
            updatedAt: cached.updatedAt || null,
          });
        }
      }

      try {
        const data = await fetchJson(
          `/api/pets?ownerEmail=${encodeURIComponent(session.email)}`
        );
        const nextPets = Array.isArray(data?.pets) ? data.pets : [];
        setPets(nextPets);
        setOfflineState({
          isOffline: false,
          updatedAt: new Date().toISOString(),
        });
        await saveCachedPets(session.email, nextPets);
      } catch (error) {
        console.error("Failed to load pets", error);
        const cached = await loadCachedPets(session.email);
        if (cached?.pets) {
          setPets(cached.pets);
          setOfflineState({
            isOffline: true,
            updatedAt: cached.updatedAt || null,
          });
        } else {
          setOfflineState({
            isOffline: true,
            updatedAt: null,
          });
        }
      }
    },
    [session?.email]
  );

  useEffect(() => {
    if (!isDetailView) {
      loadPets();
    }
  }, [isDetailView, loadPets]);

  useEffect(() => {
    if (isCreating) {
      setDraftPet({
        name: "",
        breed: "",
        birthdate: null,
        age_years: "",
        weight_kg: "",
        color: "",
        microchip_id: "",
        notes: "",
        gender: "",
        socialization_dogs: "",
        socialization_cats: "",
        socialization_children: "",
        spayed_neutered: null,
        house_trained: null,
        energy_level: "",
        toilet_break_interval_hours: "",
        time_alone_max_hours: "",
        feeding_schedule: "",
        care_instructions: "",
        vet_name: "",
        vet_phone: "",
        insurance_provider: "",
        emergency_contact_name: "",
        emergency_contact_phone: "",
        emergency_contact_relationship: "",
        allergies: "",
        medications: "",
        medical_notes: "",
        photo_data_url: "",
        photo_gallery_urls: [],
      });
      setIsEditing(true);
      setActiveTab(PET_TABS[0]);
      setSaveError("");
      setSaveStatus("idle");
      setOpenSelectField(null);
      return;
    }
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
    if (!supabase || !draftPet) {
      setIsEditing(false);
      return;
    }

    const isFieldEmpty = (value) =>
      value === null || value === undefined || value === "";
    const missingFields = [
      { key: "name", label: "Name" },
      { key: "age_years", label: "Age" },
      { key: "weight_kg", label: "Weight (kg)" },
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
      const timestamp = new Date().toISOString();
      const { id, ...payload } = draftPet;
      const normalizeOptionalValue = (value) => (value === "" ? null : value);
      const normalizedPayload = {
        ...payload,
       birthdate: normalizeOptionalValue(payload?.birthdate),
        age_years: normalizeOptionalValue(payload?.age_years),
        weight_kg: normalizeOptionalValue(payload?.weight_kg),
        toilet_break_interval_hours: normalizeOptionalValue(
          payload?.toilet_break_interval_hours
        ),
        time_alone_max_hours: normalizeOptionalValue(
          payload?.time_alone_max_hours
        ),
      };
      const basePayload = {
        ...normalizedPayload,
        updated_at: timestamp,
      };
      const { data, error } = draftPet?.id
        ? await supabase
            .from("pets")
            .update(basePayload)
            .eq("id", draftPet.id)
            .select("*")
            .maybeSingle()
        : await supabase
            .from("pets")
            .insert({
              ...basePayload,
              owner_id: session?.id,
              created_at: timestamp,
            })
            .select("*")
            .maybeSingle();
      if (error) throw error;
      if (data) {
        setDraftPet(data);
        if (session?.email) {
          const updatedPets = await upsertCachedPet(session.email, data);
          if (updatedPets) {
            setPets(updatedPets);
          }
        }
      }
      setSaveStatus("idle");
      setIsEditing(false);
      if (!draftPet?.id) {
        handleReturn();
      }
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
              onPress={handleReturn}
            >
              <Text style={styles.headerIcon}>←</Text>
            </Pressable>
            <Text style={styles.headerTitle}>
              {isCreating ? "Add a pet" : pet.name || "Pet profile"}
            </Text>
            <Pressable
              style={styles.headerIconButton}
              onPress={
                isEditing || isCreating
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
                  : isEditing || isCreating
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
              {renderField("Name *", "name", {
                placeholder: "Pet name",
              })}
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
               {renderField("Gender", "gender")}
              {renderField("Microchip ID", "microchip_id")}
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
              <Text style={styles.sectionSubTitle}>Emergency contact</Text>
              <View style={styles.nestedCard}>
                {renderField(
                  "Contact name",
                  "emergency_contact_name",
                  { placeholder: "Name" }
                )}
                {renderField("Phone", "emergency_contact_phone", {
                  keyboardType: "phone-pad",
                  placeholder: "+353",
                })}
                {renderField(
                  "Relationship",
                  "emergency_contact_relationship",
                  { placeholder: "Friend, family, neighbour" }
                )}
              </View>
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

          {!isEditing && !isCreating ? (
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
                {saveStatus === "saving"
                  ? "Saving..."
                  : isCreating
                  ? "Save pet"
                  : "Save profile"}
              </Text>
            </Pressable>
          )}
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
              await loadPets({ allowCache: false });
              setRefreshing(false);
            }}
            tintColor={theme.colors.accent}
          />
        }
      >
        <ScreenHeader title="Your pets" onBack={handleReturn} />
        <View style={styles.header}>
          <Text style={styles.subtitle}>
            {pets.length} {pets.length === 1 ? "pet" : "pets"} in your profile
          </Text>
        </View>
        {offlineState.updatedAt ? (
          <View
            style={[
              styles.offlineBanner,
              offlineState.isOffline && styles.offlineBannerWarning,
            ]}
          >
            <MaterialCommunityIcons
              name={offlineState.isOffline ? "cloud-off-outline" : "check-decagram-outline"}
              size={16}
              color={offlineState.isOffline ? theme.colors.accent : theme.colors.success}
            />
            <Text
              style={[
                styles.offlineBannerText,
                offlineState.isOffline && styles.offlineBannerTextWarning,
              ]}
            >
              {offlineState.isOffline
                ? `Offline mode: showing cached profiles from ${new Date(
                    offlineState.updatedAt
                  ).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                  })}.`
                : `Last updated ${new Date(
                    offlineState.updatedAt
                  ).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}.`}
            </Text>
          </View>
        ) : null}
        {pets.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>
              No pets saved yet.
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
              onPress={() =>
                navigation.push("PetsProfile", {
                  pet,
                  returnTo: returnTo || "Profile",
                })
              }
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
        <View style={styles.addPetButton}>
          <PrimaryButton
            label="Add a pet"
            onPress={() =>
              navigation.push("PetsProfile", {
                mode: "create",
                returnTo: returnTo || "Profile",
              })
            }
          />
        </View>
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
      marginBottom: theme.spacing.sm,
    },
    headerIconButton: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: theme.colors.surfaceElevated,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: theme.colors.borderSoft,
    },
    headerIcon: {
      fontSize: 18,
      color: theme.colors.textPrimary,
    },
    headerTitle: {
      fontSize: theme.typography.body.fontSize,
      fontWeight: "600",
      color: theme.colors.textPrimary,
    },
    headerActionText: {
      fontSize: theme.typography.body.fontSize,
      fontWeight: "600",
      color: theme.colors.textPrimary,
    },
    header: {
      alignItems: "center",
      marginBottom: theme.spacing.lg,
    },
    offlineBanner: {
      backgroundColor: theme.colors.surfaceElevated,
      borderRadius: theme.radius.md,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.borderSoft,
      marginBottom: theme.spacing.sm,
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.sm,
    },
    offlineBannerWarning: {
      borderColor: theme.colors.accent,
      backgroundColor: theme.colors.accentMuted,
    },
    offlineBannerText: {
      fontSize: theme.typography.caption.fontSize,
      color: theme.colors.textSecondary,
      textAlign: "left",
    },
    offlineBannerTextWarning: {
      color: theme.colors.accent,
      fontWeight: "700",
    },
    petDetailHeader: {
      alignItems: "center",
      marginBottom: theme.spacing.md,
    },
    petHeroImage: {
      width: "100%",
      height: 220,
      borderRadius: theme.radius.lg,
      marginBottom: theme.spacing.md,
    },
    petHeroPlaceholder: {
      width: "100%",
      height: 220,
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.surfaceAccent,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: theme.spacing.md,
    },
    petHeroPlaceholderText: {
      fontSize: 40,
      fontWeight: "700",
      color: theme.colors.textPrimary,
    },
    photoAction: {
      marginBottom: theme.spacing.sm,
    },
    photoActionText: {
      fontSize: theme.typography.caption.fontSize,
      color: theme.colors.accentSoft,
      fontWeight: "600",
    },
    petDetailName: {
      fontSize: theme.typography.title.fontSize,
      fontWeight: "700",
      color: theme.colors.textPrimary,
    },
    petDetailMeta: {
      fontSize: theme.typography.body.fontSize,
      color: theme.colors.textSecondary,
      marginTop: theme.spacing.xs,
    },
    tabRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.md,
    },
    tabPill: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.surfaceElevated,
      borderWidth: 1,
      borderColor: theme.colors.borderSoft,
    },
    tabPillActive: {
      backgroundColor: theme.colors.surfaceAccent,
      borderColor: theme.colors.surfaceAccent,
    },
    tabText: {
      fontSize: theme.typography.caption.fontSize,
      fontWeight: "600",
      color: theme.colors.textSecondary,
    },
    tabTextActive: {
      color: theme.colors.white,
    },
    title: {
      fontSize: theme.typography.title.fontSize,
      fontWeight: "700",
      color: theme.colors.textPrimary,
    },
    subtitle: {
      marginTop: theme.spacing.xs,
      fontSize: theme.typography.body.fontSize,
      color: theme.colors.textSecondary,
    },
    emptyCard: {
      backgroundColor: theme.colors.surfaceElevated,
      borderRadius: theme.radius.md,
      padding: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.borderSoft,
    },
    emptyText: {
      fontSize: theme.typography.body.fontSize,
      color: theme.colors.textSecondary,
    },
    sectionTitle: {
      fontSize: theme.typography.headline.fontSize,
      fontWeight: "700",
      color: theme.colors.textPrimary,
      marginTop: theme.spacing.sm,
      marginBottom: theme.spacing.xs,
    },
    sectionSubTitle: {
      fontSize: theme.typography.caption.fontSize,
      textTransform: "uppercase",
      letterSpacing: 0.6,
      color: theme.colors.textMuted,
      marginTop: theme.spacing.md,
      marginBottom: theme.spacing.xs,
    },
    sectionCard: {
      backgroundColor: theme.colors.surfaceElevated,
      borderRadius: theme.radius.md,
      padding: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.borderSoft,
      marginBottom: theme.spacing.md,
    },
    nestedCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.md,
      padding: theme.spacing.sm,
      borderWidth: 1,
      borderColor: theme.colors.borderSoft,
      marginBottom: theme.spacing.sm,
    },
    detailRow: {
      paddingVertical: theme.spacing.xs,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    detailRowLast: {
      borderBottomWidth: 0,
      paddingBottom: 0,
    },
    detailLabel: {
      fontSize: theme.typography.caption.fontSize,
      textTransform: "uppercase",
      letterSpacing: 0.6,
      color: theme.colors.textMuted,
      marginBottom: theme.spacing.xs,
    },
    detailValue: {
      fontSize: theme.typography.body.fontSize,
      color: theme.colors.textPrimary,
    },
    selectInput: {
      borderWidth: 1,
      borderColor: theme.colors.accent,
      borderRadius: theme.radius.md,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      backgroundColor: theme.colors.surfaceElevated,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    selectValue: {
      fontSize: theme.typography.body.fontSize,
      color: theme.colors.textPrimary,
    },
    selectChevron: {
      fontSize: theme.typography.caption.fontSize,
      color: theme.colors.textSecondary,
    },
    selectOptions: {
      marginTop: theme.spacing.xs,
      borderRadius: theme.radius.md,
      borderWidth: 1,
      borderColor: theme.colors.accent,
      backgroundColor: theme.colors.surfaceElevated,
      overflow: "hidden",
    },
    selectOption: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    selectOptionText: {
      fontSize: theme.typography.body.fontSize,
      color: theme.colors.textPrimary,
    },
    input: {
      borderWidth: 1,
      borderColor: theme.colors.accent,
      borderRadius: theme.radius.md,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      fontSize: theme.typography.body.fontSize,
      color: theme.colors.textPrimary,
      backgroundColor: theme.colors.surfaceElevated,
    },
    textArea: {
      minHeight: 80,
      textAlignVertical: "top",
    },
    noteText: {
      fontSize: theme.typography.body.fontSize,
      color: theme.colors.textSecondary,
      lineHeight: 20,
    },
    galleryTitle: {
      fontSize: theme.typography.headline.fontSize,
      fontWeight: "700",
      color: theme.colors.textPrimary,
      marginBottom: theme.spacing.xs,
    },
    gallerySubtitle: {
      fontSize: theme.typography.caption.fontSize,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.sm,
    },
    photoGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: theme.spacing.sm,
    },
    galleryPhoto: {
      width: 120,
      height: 120,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.surfaceAccent,
    },
    addPhotoTile: {
      width: 120,
      height: 120,
      borderRadius: theme.radius.md,
      borderWidth: 1,
      borderStyle: "dashed",
      borderColor: theme.colors.borderStrong,
      alignItems: "center",
      justifyContent: "center",
    },
    addPhotoIcon: {
      fontSize: 28,
      color: theme.colors.accentSoft,
      marginBottom: theme.spacing.xs,
    },
    addPhotoLabel: {
      fontSize: theme.typography.caption.fontSize,
      color: theme.colors.textPrimary,
    },
    editProfileButton: {
      borderRadius: 999,
      borderWidth: 1,
      borderColor: theme.colors.borderStrong,
      paddingVertical: theme.spacing.sm,
      alignItems: "center",
      backgroundColor: theme.colors.surfaceElevated,
      marginBottom: theme.spacing.sm,
    },
    editProfileText: {
      fontSize: theme.typography.body.fontSize,
      fontWeight: "600",
      color: theme.colors.textPrimary,
    },
    errorText: {
      color: theme.colors.danger,
      marginBottom: theme.spacing.sm,
      textAlign: "left",
    },
    petCard: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colors.surfaceElevated,
      borderRadius: theme.radius.md,
      padding: theme.spacing.sm,
      borderWidth: 1,
      borderColor: theme.colors.borderSoft,
      marginBottom: theme.spacing.sm,
    },
    petCardPressed: {
      opacity: 0.85,
    },
    petAvatar: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: theme.colors.surfaceAccent,
      alignItems: "center",
      justifyContent: "center",
      marginRight: theme.spacing.sm,
    },
    petAvatarImage: {
      width: 60,
      height: 60,
      borderRadius: 30,
    },
    petAvatarText: {
      fontSize: theme.typography.body.fontSize,
      fontWeight: "700",
      color: theme.colors.textPrimary,
    },
    petInfo: {
      flex: 1,
    },
    petName: {
      fontSize: theme.typography.body.fontSize,
      fontWeight: "700",
      color: theme.colors.textPrimary,
    },
    petMeta: {
      fontSize: theme.typography.caption.fontSize,
      color: theme.colors.textSecondary,
      marginTop: theme.spacing.xs,
    },
    petChevron: {
      fontSize: 22,
      color: theme.colors.textMuted,
    },
    addPetButton: {
      marginTop: theme.spacing.sm,
    },
  });

export default PetsProfileScreen;
