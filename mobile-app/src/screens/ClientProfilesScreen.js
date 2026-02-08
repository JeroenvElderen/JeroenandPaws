import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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

const ClientProfilesScreen = ({ navigation, route }) => {
  const { session, clientProfiles, setClientProfiles } = useSession();
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
  const [clients, setClients] = useState(clientProfiles);
  const [searchValue, setSearchValue] = useState("");
  const [status, setStatus] = useState("idle");
  const ownerLoadRef = useRef(false);
  const isOwner =
    session?.email?.toLowerCase() === OWNER_EMAIL.toLowerCase();

  const loadClients = useCallback(async () => {
    const activeClient =
      isOwner && supabaseAdmin ? supabaseAdmin : supabase;
    if (!activeClient) return;
    if (!session?.email) return;
    setStatus("loading");
    try {
      const pageSize = 1000;
      let offset = 0;
      let allClients = [];

      while (true) {
        let query = activeClient
          .from("clients")
          .select("id, full_name, email, address, profile_photo_url, created_at")
          .order("created_at", { ascending: false })
          .range(offset, offset + pageSize - 1);

        if (!isOwner) {
          query = query.eq("email", session.email);
        }

        const { data, error } = await query;

        if (error) throw error;

        const batch = data || [];
        allClients = [...allClients, ...batch];

        if (batch.length < pageSize) {
          break;
        }
        offset += pageSize;
      }

      setClients(allClients);
      setClientProfiles(allClients);
      setStatus("idle");
    } catch (error) {
      console.error("Failed to load clients", error);
      setStatus("error");
    } finally {
      if (isOwner) {
        ownerLoadRef.current = true;
      }
    }
  }, [isOwner, session?.email]);

  useEffect(() => {
    if (clientProfiles.length && !isOwner) {
      setClients(clientProfiles);
      setStatus("idle");
      return;
    }
    if (isOwner && ownerLoadRef.current) {
      return;
    }
    loadClients();
  }, [clientProfiles, isOwner, loadClients]);

  const filteredClients = useMemo(() => {
    const term = searchValue.trim().toLowerCase();
    if (!term) return clients;
    return clients.filter((client) => {
      const name = client?.full_name?.toLowerCase() || "";
      const email = client?.email?.toLowerCase() || "";
      const address = client?.address?.toLowerCase() || "";
      return (
        name.includes(term) || email.includes(term) || address.includes(term)
      );
    });
  }, [clients, searchValue]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <ScreenHeader title="Client profiles" onBack={handleReturn} />
        <View style={styles.searchCard}>
          <Text style={styles.searchLabel}>Search clients</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Name, email, or address"
            value={searchValue}
            onChangeText={setSearchValue}
          />
        </View>
        {status === "loading" ? (
          <View style={styles.loadingState}>
            <ActivityIndicator size="small" color={theme.colors.accent} />
            <Text style={styles.loadingText}>Loading client list…</Text>
          </View>
        ) : null}
        {status !== "loading" && filteredClients.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>
              No clients match your search yet.
            </Text>
          </View>
        ) : null}
        {filteredClients.map((client) => (
          <Pressable
            key={client.id}
            style={({ pressed }) => [
              styles.clientCard,
              pressed && styles.cardPressed,
            ]}
            onPress={() =>
              navigation.navigate("ProfileOverview", {
                clientId: client.id,
                returnTo: returnTo || "Profile",
              })
            }
          >
            <View style={styles.avatar}>
              {client.profile_photo_url ? (
                <Image
                  source={{ uri: client.profile_photo_url }}
                  style={styles.avatarImage}
                />
              ) : (
                <Text style={styles.avatarText}>
                  {getInitials(client.full_name || client.email)}
                </Text>
              )}
            </View>
            <View style={styles.clientCopy}>
              <Text style={styles.clientName}>
                {client.full_name || "Client profile"}
              </Text>
              <Text style={styles.clientMeta}>
                {client.email || "Email missing"}
              </Text>
              {client.address ? (
                <Text style={styles.clientMeta}>{client.address}</Text>
              ) : null}
            </View>
            <Text style={styles.clientChevron}>›</Text>
          </Pressable>
        ))}
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
      fontSize: theme.typography.caption.fontSize,
    },
    emptyCard: {
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
    emptyText: {
      fontSize: theme.typography.caption.fontSize,
      color: theme.colors.textSecondary,
    },
    clientCard: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.lg,
      padding: theme.spacing.sm,
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
      opacity: 0.92,
      transform: [{ scale: 0.99 }],
    },
    avatar: {
      width: 52,
      height: 52,
      borderRadius: 26,
      backgroundColor: theme.colors.surfaceAccent,
      alignItems: "center",
      justifyContent: "center",
      marginRight: theme.spacing.sm,
    },
    avatarImage: {
      width: 52,
      height: 52,
      borderRadius: 26,
    },
    avatarText: {
      fontSize: theme.typography.body.fontSize,
      fontWeight: "700",
      color: theme.colors.textPrimary,
    },
    clientCopy: {
      flex: 1,
    },
    clientName: {
      fontSize: theme.typography.body.fontSize,
      fontWeight: "700",
      color: theme.colors.textPrimary,
    },
    clientMeta: {
      fontSize: theme.typography.caption.fontSize,
      color: theme.colors.textSecondary,
      marginTop: 3,
    },
    clientChevron: {
      fontSize: 22,
      color: theme.colors.accent,
    },
  });

export default ClientProfilesScreen;
