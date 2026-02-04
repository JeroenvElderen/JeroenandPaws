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

const ProfileOverviewScreen = ({ navigation }) => {
  const { session } = useSession();
  const [clientProfile, setClientProfile] = useState(null);
  const [pets, setPets] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const displayName = clientProfile?.full_name || session?.name || "Your profile";
  const location = clientProfile?.address || session?.address || "Add your area";
  const aboutItems = [
    {
      icon: "📅",
      label: "Member since",
      value: formatMonthYear(clientProfile?.created_at),
    },
    {
      icon: "🐾",
      label: "Pets in profile",
      value: `${pets.length} ${pets.length === 1 ? "pet" : "pets"}`,
    },
  ];
  const contactItems = [
    {
      icon: "📧",
      label: "Email address",
      value: clientProfile?.email || session?.email || "—",
    },
    {
      icon: "📞",
      label: "Phone number",
      value: clientProfile?.phone_number || session?.phone || "—",
    },
    {
      icon: "📍",
      label: "Eircode",
      value: location,
    },
  ];

  const loadProfile = useCallback(async () => {
    if (!session?.id || !supabase) {
      return;
    }

    try {
      const clientResult = await supabase
        .from("clients")
        .select("*")
        .eq("id", session.id)
        .maybeSingle();

      const petsResult = await supabase
        .from("pets")
        .select("*")
        .eq("owner_id", session.id)
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
  }, [session?.id]);

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
        <ScreenHeader title="Profile overview" onBack={() => navigation.goBack()} />
        <View style={styles.profileCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{getInitials(displayName)}</Text>
          </View>
          <Text style={styles.profileName}>{displayName}</Text>
          <View style={styles.locationRow}>
            <Text style={styles.locationIcon}>📍</Text>
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
              <Text style={styles.detailIcon}>{item.icon}</Text>
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
              <Text style={styles.detailIcon}>{item.icon}</Text>
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
    backgroundColor: "#ffffff",
  },
  container: {
    flexGrow: 1,
    backgroundColor: "#ffffff",
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
    backgroundColor: "#f2f2f2",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 30,
    fontWeight: "700",
    color: "#1f1f1f",
  },
  profileName: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1f1f1f",
    marginBottom: 6,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  locationIcon: {
    marginRight: 6,
    fontSize: 14,
  },
  locationText: {
    fontSize: 14,
    color: "#5f5f5f",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1f1f1f",
    marginBottom: 12,
  },
  sectionCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e6e6e6",
    marginBottom: 24,
    overflow: "hidden",
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eeeeee",
  },
  detailRowLast: {
    borderBottomWidth: 0,
  },
  detailIcon: {
    width: 28,
    fontSize: 18,
    marginRight: 12,
  },
  detailInfo: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 13,
    color: "#6f6f6f",
    fontWeight: "600",
  },
  detailValue: {
    fontSize: 15,
    color: "#1f1f1f",
    fontWeight: "600",
    marginTop: 4,
  },
  emptyCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e6e6e6",
    marginBottom: 24,
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
  petCardPressed: {
    opacity: 0.85,
  },
  petAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#f2f2f2",
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

export default ProfileOverviewScreen;