import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ScreenHeader from "../components/ScreenHeader";
import { supabase, supabaseAdmin } from "../api/supabaseClient";
import { useSession } from "../context/SessionContext";
import { useTheme } from "../context/ThemeContext";

const OWNER_EMAIL = "jeroen@jeroenandpaws.com";

const BookingGalleryScreen = ({ navigation, route }) => {
  const { session } = useSession();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [photos, setPhotos] = useState([]);
  const [status, setStatus] = useState("idle");
  const bookingId = route?.params?.bookingId;
  const bookingTitle = route?.params?.bookingTitle;
  const isOwner =
    session?.email?.toLowerCase() === OWNER_EMAIL.toLowerCase();

  const handleReturn = () => {
    navigation.goBack();
  };

  const loadPhotos = useCallback(async () => {
    if (!bookingId || !supabase) return;
    setStatus("loading");
    try {
      const activeClient =
        isOwner && supabaseAdmin ? supabaseAdmin : supabase;
      const { data, error } = await activeClient
        .from("booking_photo_gallery")
        .select("*")
        .eq("booking_id", bookingId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      setPhotos(data || []);
      setStatus("ready");
    } catch (error) {
      console.error("Failed to load booking photos", error);
      setStatus("error");
    }
  }, [bookingId, isOwner]);

  useEffect(() => {
    loadPhotos();
  }, [loadPhotos]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ScreenHeader
          title={bookingTitle ? `${bookingTitle} gallery` : "Booking gallery"}
          onBack={handleReturn}
        />
        <Text style={styles.subtitle}>
          Keep memories from each booking in one place.
        </Text>
        {status === "loading" ? (
          <ActivityIndicator color={theme.colors.accent} />
        ) : null}
        <FlatList
          data={photos}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.column}
          contentContainerStyle={styles.gallery}
          renderItem={({ item }) => (
            <View style={styles.photoCard}>
              <Image source={{ uri: item.photo_url }} style={styles.photo} />
              {item.caption ? (
                <Text style={styles.caption}>{item.caption}</Text>
              ) : null}
            </View>
          )}
          ListEmptyComponent={
            status !== "loading" ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyTitle}>No photos yet</Text>
                <Text style={styles.emptyBody}>
                  Photos from this booking will appear here once shared.
                </Text>
              </View>
            ) : null
          }
        />
      </View>
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
      flex: 1,
      padding: theme.spacing.lg,
      backgroundColor: theme.colors.background,
    },
    subtitle: {
      fontSize: theme.typography.caption.fontSize,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.md,
    },
    gallery: {
      paddingBottom: theme.spacing.xxl,
    },
    column: {
      justifyContent: "space-between",
      marginBottom: theme.spacing.sm,
    },
    photoCard: {
      flex: 1,
      marginRight: theme.spacing.sm,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.lg,
      borderWidth: 1,
      borderColor: theme.colors.borderSoft,
      overflow: "hidden",
    },
    photo: {
      width: "100%",
      height: 140,
      backgroundColor: theme.colors.surfaceAccent,
    },
    caption: {
      fontSize: theme.typography.caption.fontSize,
      color: theme.colors.textSecondary,
      padding: theme.spacing.sm,
    },
    emptyState: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.lg,
      padding: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.borderSoft,
    },
    emptyTitle: {
      fontSize: theme.typography.body.fontSize,
      fontWeight: "600",
      color: theme.colors.textPrimary,
      marginBottom: theme.spacing.xs,
    },
    emptyBody: {
      fontSize: theme.typography.caption.fontSize,
      color: theme.colors.textSecondary,
    },
  });

export default BookingGalleryScreen;