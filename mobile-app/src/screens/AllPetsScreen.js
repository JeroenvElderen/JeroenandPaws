import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ScreenHeader from "../components/ScreenHeader";
import { supabase, supabaseAdmin } from "../api/supabaseClient";
import { useSession } from "../context/SessionContext";
import { useTheme } from "../context/ThemeContext";

const OWNER_EMAIL = "jeroen@jeroenandpaws.com";

const getInitials = (name) => {
  if (!name) return "JP";
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length === 0) return "JP";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};

const AllPetsScreen = ({ navigation, route }) => {
  const { session } = useSession();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const returnTo = route?.params?.returnTo;
  const handleReturn = () => {
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
  const [pets, setPets] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [status, setStatus] = useState("idle");
  const [ownerLookup, setOwnerLookup] = useState({});
  const isOwner =
    session?.email?.toLowerCase() === OWNER_EMAIL.toLowerCase();

  const loadPets = useCallback(async () => {
    const activeClient =
      isOwner && supabaseAdmin ? supabaseAdmin : supabase;
    if (!activeClient || !session?.email) return;
    setStatus("loading");
    try {
      const pageSize = 1000;
      let offset = 0;
      let allPets = [];

      while (true) {
        const { data, error } = await activeClient
          .from("pets")
          .select("id, name, breed, photo_data_url, owner_id, created_at")
          .order("created_at", { ascending: false })
          .range(offset, offset + pageSize - 1);

        if (error) throw error;

        const batch = data || [];
        allPets = [...allPets, ...batch];

        if (batch.length < pageSize) {
          break;
        }
        offset += pageSize;
      }

      const ownerIds = [
        ...new Set(allPets.map((pet) => pet.owner_id).filter(Boolean)),
      ];
      let owners = {};

      if (ownerIds.length) {
        const { data: ownersData, error: ownersError } = await activeClient
          .from("clients")
          .select("id, full_name, email")
          .in("id", ownerIds);
        if (ownersError) throw ownersError;
        owners = (ownersData || []).reduce((acc, owner) => {
          acc[owner.id] = owner;
          return acc;
        }, {});
      }

      setPets(allPets);
      setOwnerLookup(owners);
      setStatus("idle");
    } catch (error) {
      console.error("Failed to load pets", error);
      setStatus("error");
    }
  }, [isOwner, session?.email]);

  useEffect(() => {
    if (isOwner) {
      loadPets();
    }
  }, [isOwner, loadPets]);

  const filteredPets = useMemo(() => {
    const term = searchValue.trim().toLowerCase();
    if (!term) return pets;
    return pets.filter((pet) => {
      const owner = ownerLookup[pet.owner_id] || {};
      const petName = pet?.name?.toLowerCase() || "";
      const breed = pet?.breed?.toLowerCase() || "";
      const ownerName = owner?.full_name?.toLowerCase() || "";
      const ownerEmail = owner?.email?.toLowerCase() || "";
      return (
        petName.includes(term) ||
        breed.includes(term) ||
        ownerName.includes(term) ||
        ownerEmail.includes(term)
      );
    });
  }, [ownerLookup, pets, searchValue]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <ScreenHeader title="All pets" onBack={handleReturn} />
        {!isOwner ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>
              This screen is available to the owner account only.
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.searchCard}>
              <Text style={styles.searchLabel}>Search pets</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="Pet name, breed, or owner"
                value={searchValue}
                onChangeText={setSearchValue}
              />
            </View>
            {status === "loading" ? (
              <View style={styles.loadingState}>
                <ActivityIndicator size="small" color={theme.colors.accent} />
                <Text style={styles.loadingText}>Loading pets…</Text>
              </View>
            ) : null}
            {status !== "loading" && filteredPets.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>
                  No pets match your search yet.
                </Text>
              </View>
            ) : null}
            {filteredPets.map((pet) => {
              const owner = ownerLookup[pet.owner_id] || {};
              return (
                <Pressable
                  key={pet.id}
                  style={({ pressed }) => [
                    styles.petCard,
                    pressed && styles.cardPressed,
                  ]}
                  onPress={() =>
                    pet.owner_id
                      ? navigation.navigate("ProfileOverview", {
                          clientId: pet.owner_id,
                          returnTo: returnTo || "Profile",
                        })
                      : null
                  }
                >
                  <View style={styles.avatar}>
                    {pet.photo_data_url ? (
                      <Image
                        source={{ uri: pet.photo_data_url }}
                        style={styles.avatarImage}
                      />
                    ) : (
                      <Text style={styles.avatarText}>
                        {getInitials(pet.name)}
                      </Text>
                    )}
                  </View>
                  <View style={styles.petCopy}>
                    <Text style={styles.petName}>
                      {pet.name || "Pet profile"}
                    </Text>
                    <Text style={styles.petMeta}>
                      {pet.breed || "Breed not listed"}
                    </Text>
                    {owner?.full_name || owner?.email ? (
                      <Text style={styles.petMeta}>
                        {owner.full_name || owner.email}
                      </Text>
                    ) : null}
                  </View>
                  <Text style={styles.petChevron}>›</Text>
                </Pressable>
              );
            })}
          </>
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
      padding: theme.spacing.lg,
      paddingBottom: theme.spacing.xxl,
      backgroundColor: theme.colors.background,
    },
    searchCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.lg,
      padding: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.borderSoft,
      marginBottom: theme.spacing.md,
      shadowColor: theme.shadow.soft.shadowColor,
      shadowOpacity: theme.shadow.soft.shadowOpacity,
      shadowOffset: theme.shadow.soft.shadowOffset,
      shadowRadius: theme.shadow.soft.shadowRadius,
      elevation: theme.shadow.soft.elevation,
    },
    searchLabel: {
      fontSize: theme.typography.caption.fontSize,
      fontWeight: "700",
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.xs,
    },
    searchInput: {
      borderWidth: 1,
      borderColor: theme.colors.borderStrong,
      borderRadius: theme.radius.md,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      fontSize: theme.typography.body.fontSize,
      color: theme.colors.textPrimary,
      backgroundColor: theme.colors.surfaceElevated,
    },
    loadingState: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: theme.spacing.sm,
    },
    loadingText: {
      marginLeft: theme.spacing.sm,
      color: theme.colors.textSecondary,
    },
    emptyCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.lg,
      padding: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.borderSoft,
      marginBottom: theme.spacing.md,
    },
    emptyText: {
      color: theme.colors.textSecondary,
      textAlign: "center",
    },
    petCard: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.lg,
      padding: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.borderSoft,
      marginBottom: theme.spacing.sm,
      shadowColor: theme.shadow.soft.shadowColor,
      shadowOpacity: theme.shadow.soft.shadowOpacity,
      shadowOffset: theme.shadow.soft.shadowOffset,
      shadowRadius: theme.shadow.soft.shadowRadius,
      elevation: theme.shadow.soft.elevation,
    },
    cardPressed: {
      opacity: 0.85,
    },
    avatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: theme.colors.surfaceElevated,
      alignItems: "center",
      justifyContent: "center",
      marginRight: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.borderSoft,
      overflow: "hidden",
    },
    avatarImage: {
      width: "100%",
      height: "100%",
    },
    avatarText: {
      color: theme.colors.textPrimary,
      fontWeight: "700",
    },
    petCopy: {
      flex: 1,
    },
    petName: {
      fontSize: theme.typography.body.fontSize,
      fontWeight: "700",
      color: theme.colors.textPrimary,
      marginBottom: 2,
    },
    petMeta: {
      color: theme.colors.textSecondary,
      fontSize: theme.typography.caption.fontSize,
    },
    petChevron: {
      fontSize: 20,
      color: theme.colors.textSecondary,
      marginLeft: theme.spacing.sm,
    },
  });

export default AllPetsScreen;