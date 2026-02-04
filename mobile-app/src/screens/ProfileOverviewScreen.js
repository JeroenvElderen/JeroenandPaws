import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { supabase } from "../api/supabaseClient";
import ScreenHeader from "../components/ScreenHeader";
import { useSession } from "../context/SessionContext";

const formatMonthYear = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
};

const getInitials = (name) => {
  if (!name) return "JP";
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length === 0) return "JP";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};

const ProfileOverviewScreen = ({ navigation, route }) => {
  const { session } = useSession();
  const [clientProfile, setClientProfile] = useState(null);
  const [pets, setPets] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [photoStatus, setPhotoStatus] = useState("idle");
  const [photoError, setPhotoError] = useState("");
  const viewingClientId = route?.params?.clientId || session?.id;
  const isOwnProfile = viewingClientId === session?.id;
  const displayName =
    clientProfile?.full_name ||
    (isOwnProfile ? session?.name : null) ||
    "Profile";
  const location =
    clientProfile?.address ||
    (isOwnProfile ? session?.address : null) ||
    "Add your area";
  const profilePhotoUrl =
    clientProfile?.profile_photo_url || clientProfile?.profilePhotoUrl || null;
  const contactEmail = clientProfile?.email || session?.email || "—";
  const aboutItems = [
    {
      icon: "calendar-month",
      label: "Member since",
      value: formatMonthYear(clientProfile?.created_at),
    },
    {
      icon: "paw",
      label: "Pets in profile",
      value: `${pets.length} ${pets.length === 1 ? "pet" : "pets"}`,
    },
  ];
  const contactItems = [
    {
      icon: "email",
      label: "Email address",
      value: contactEmail,
    },
    {
      icon: "phone",
      label: "Phone number",
      value: clientProfile?.phone_number || session?.phone || "—",
    },
    {
      icon: "map-marker",
      label: "Eircode",
      value: location,
    },
  ];

  const loadProfile = useCallback(async () => {
    if (!viewingClientId || !supabase) {
      return;
    }

    try {
      const clientResult = await supabase
        .from("clients")
        .select("*")
        .eq("id", viewingClientId)
        .maybeSingle();

      const petsResult = await supabase
        .from("pets")
        .select("*")
        .eq("owner_id", viewingClientId)
        .order("created_at", { ascending: false });

       if (clientResult.error) {
        throw clientResult.error;
      }
      if (petsResult.error) {
        throw petsResult.error;
      }

      setClientProfile(clientResult.data || null);
      setPets(petsResult.data || []);
    } catch (profileError) {
      console.error("Failed to load profile", profileError);
    }
  }, [viewingClientId]);

  const handleSelectPhoto = useCallback(async () => {
    if (!supabase || !isOwnProfile || !viewingClientId) {
      return;
    }
    setPhotoError("");
    setPhotoStatus("uploading");
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permission.status !== "granted") {
        setPhotoError("Please allow photo access to upload a profile photo.");
        setPhotoStatus("idle");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.7,
        base64: true,
      });

      if (result.canceled) {
        setPhotoStatus("idle");
        return;
      }

      const asset = result.assets?.[0];
      if (!asset?.base64) {
        setPhotoError("Unable to read that photo. Please try another one.");
        setPhotoStatus("idle");
        return;
      }

      const mimeType = asset.mimeType || "image/jpeg";
      const dataUrl = `data:${mimeType};base64,${asset.base64}`;

      const { error } = await supabase
        .from("clients")
        .update({ profile_photo_url: dataUrl })
        .eq("id", viewingClientId);
      if (error) throw error;

      setClientProfile((current) =>
        current ? { ...current, profile_photo_url: dataUrl } : current
      );
      setPhotoStatus("idle");
    } catch (error) {
      console.error("Failed to update profile photo", error);
      setPhotoError("We could not upload that photo right now.");
      setPhotoStatus("error");
    }
  }, [isOwnProfile, viewingClientId]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={async () => {
              setRefreshing(true);
              await loadProfile();
              setRefreshing(false);
            }}
            tintColor="#5d2fc5"
          />
        }
      >
        <ScreenHeader
          title="Profile overview"
          onBack={() => {
            if (route?.params?.returnTo) {
              navigation.getParent()?.navigate(route.params.returnTo);
              return;
            }
            navigation.goBack();
          }}
        />
        <View style={styles.profileCard}>
          <View style={styles.avatarCircle}>
            {profilePhotoUrl ? (
              <Image source={{ uri: profilePhotoUrl }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarText}>{getInitials(displayName)}</Text>
            )}
          </View>
          {isOwnProfile ? (
            <Pressable
              style={({ pressed }) => [
                styles.photoButton,
                pressed && styles.photoButtonPressed,
              ]}
              onPress={handleSelectPhoto}
              disabled={photoStatus === "uploading"}
            >
              {photoStatus === "uploading" ? (
                <ActivityIndicator size="small" color="#5d2fc5" />
              ) : (
                <Text style={styles.photoButtonText}>
                  {profilePhotoUrl ? "Change photo" : "Upload photo"}
                </Text>
              )}
            </Pressable>
          ) : null}
          {photoError ? (
            <Text style={styles.photoError}>{photoError}</Text>
          ) : null}
          <Text style={styles.profileName}>{displayName}</Text>
          <View style={styles.locationRow}>
            <MaterialCommunityIcons
              name="map-marker"
              size={18}
              color="#c9c5d8"
            />
            <Text style={styles.locationText}>{location}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.sectionCard}>
          {aboutItems.map((item, index) => (
            <View
              key={item.label}
              style={[
                styles.detailRow,
                index === aboutItems.length - 1 && styles.detailRowLast,
              ]}
            >
              <MaterialCommunityIcons
                name={item.icon}
                size={18}
                color="#c9c5d8"
              />
              <View style={styles.detailInfo}>
                <Text style={styles.detailLabel}>{item.label}</Text>
                <Text style={styles.detailValue}>{item.value}</Text>
              </View>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Contact</Text>
        <View style={styles.sectionCard}>
          {contactItems.map((item, index) => (
            <View
              key={item.label}
              style={[
                styles.detailRow,
                index === contactItems.length - 1 && styles.detailRowLast,
              ]}
            >
              <MaterialCommunityIcons
                name={item.icon}
                size={18}
                color="#c9c5d8"
              />
              <View style={styles.detailInfo}>
                <Text style={styles.detailLabel}>{item.label}</Text>
                <Text style={styles.detailValue}>{item.value}</Text>
              </View>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Pets ({pets.length})</Text>
        {pets.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>
              No pets saved yet. Add a pet in your next booking.
            </Text>
          </View>
        ) : (
          pets.map((pet) => {
            const meta = [pet.breed || "Breed TBD", pet.age || "Age TBD"]
              .filter(Boolean)
              .join(" • ");
            const petPhoto =
              pet.photo_data_url || pet.photoUrl || pet.photo_url || null;
            return (
              <Pressable
                key={pet.id || pet.name}
                style={({ pressed }) => [
                  styles.petCard,
                  pressed && styles.petCardPressed,
                ]}
                onPress={() => navigation.push("PetsProfile", { pet })}
              >
                <View style={styles.petAvatar}>
                  {petPhoto ? (
                    <Image
                      source={{ uri: petPhoto }}
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
                  <Text style={styles.petMeta}>{meta}</Text>
                </View>
                <Text style={styles.petChevron}>›</Text>
              </Pressable>
            );
          })
        )}
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
    backgroundColor: "#0c081f",
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  profileCard: {
    alignItems: "center",
    marginBottom: 24,
  },
  avatarCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#1f1535",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  avatarImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  avatarText: {
    fontSize: 30,
    fontWeight: "700",
    color: "#f4f2ff",
  },
  photoButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: "#1f1535",
    borderWidth: 1,
    borderColor: "#2a1d45",
    marginBottom: 10,
  },
  photoButtonPressed: {
    opacity: 0.9,
  },
  photoButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#f4f2ff",
  },
  photoError: {
    fontSize: 12,
    color: "#ff6b6b",
    marginBottom: 8,
  },
  profileName: {
    fontSize: 24,
    fontWeight: "700",
    color: "#f4f2ff",
    marginBottom: 6,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  locationText: {
    fontSize: 14,
    color: "#c9c5d8",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#f4f2ff",
    marginBottom: 12,
  },
  sectionCard: {
    backgroundColor: "#120d23",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#1f1535",
    marginBottom: 24,
    overflow: "hidden",
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#1f1535",
  },
  detailRowLast: {
    borderBottomWidth: 0,
  },
  detailInfo: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 13,
    color: "#c9c5d8",
    fontWeight: "600",
  },
  detailValue: {
    fontSize: 15,
    color: "#f4f2ff",
    fontWeight: "600",
    marginTop: 4,
  },
  emptyCard: {
    backgroundColor: "#120d23",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#1f1535",
    marginBottom: 24,
  },
  emptyText: {
    fontSize: 14,
    color: "#c9c5d8",
  },
  petCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#120d23",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#1f1535",
    marginBottom: 12,
  },
  petCardPressed: {
    opacity: 0.85,
  },
  petAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#1f1535",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  petAvatarImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  petAvatarText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#f4f2ff",
  },
  petInfo: {
    flex: 1,
  },
  petName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#f4f2ff",
  },
  petMeta: {
    fontSize: 13,
    color: "#c9c5d8",
    marginTop: 4,
  },
  petChevron: {
    fontSize: 22,
    color: "#8b7ca8",
  },
});

export default ProfileOverviewScreen;