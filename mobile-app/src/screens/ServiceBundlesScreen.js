import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ScreenHeader from "../components/ScreenHeader";
import { supabase } from "../api/supabaseClient";
import { useTheme } from "../context/ThemeContext";

const formatCurrency = (amount, currency = "EUR") =>
  new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);

const ServiceBundlesScreen = ({ navigation, route }) => {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [bundles, setBundles] = useState([]);
  const [seasonalBundles, setSeasonalBundles] = useState([]);
  const [status, setStatus] = useState("idle");
  const [seasonalStatus, setSeasonalStatus] = useState("idle");
  const returnTo = route?.params?.returnTo;

  const handleReturn = () => {
    if (returnTo) {
      navigation.navigate(returnTo);
      return;
    }
    navigation.goBack();
  };

  const loadBundles = useCallback(async () => {
    if (!supabase) {
      setBundles([]);
      setSeasonalBundles([]);
      return;
    }
    setStatus("loading");
    setSeasonalStatus("loading");
    try {
      const [bundleResponse, seasonalResponse] = await Promise.all([
        supabase
          .from("service_bundles")
          .select("*")
          .order("sort_order", { ascending: true }),
        supabase
          .from("seasonal_addon_bundles")
          .select("*")
          .eq("is_active", true)
          .order("sort_order", { ascending: true }),
      ]);
      if (bundleResponse.error) throw bundleResponse.error;
      if (seasonalResponse.error) throw seasonalResponse.error;
      setBundles(bundleResponse.data || []);
      setSeasonalBundles(seasonalResponse.data || []);
      setStatus("ready");
      setSeasonalStatus("ready");
    } catch (loadError) {
      console.error("Failed to load bundles", loadError);
      setStatus("error");
      setSeasonalStatus("error");
    }
  }, []);

  useEffect(() => {
    loadBundles();
  }, [loadBundles]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <ScreenHeader title="Service bundles" onBack={handleReturn} />
        <Text style={styles.subhead}>
          Prepaid packages that combine your most booked services.
        </Text>
        {status === "loading" ? (
          <ActivityIndicator color={theme.colors.accent} />
        ) : null}
        {status !== "loading" && bundles.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No bundles yet</Text>
            <Text style={styles.emptyBody}>
              New bundle offers will appear here as soon as they are ready.
            </Text>
          </View>
        ) : null}
        {bundles.map((bundle) => (
          <View key={bundle.id} style={styles.bundleCard}>
            <Text style={styles.bundleTitle}>{bundle.title}</Text>
            <Text style={styles.bundlePrice}>
              {formatCurrency((bundle.price_cents || 0) / 100, bundle.currency)}
            </Text>
            <Text style={styles.bundleDescription}>
              {bundle.description || "Includes multiple services."}
            </Text>
            {bundle.included_services ? (
              <Text style={styles.bundleMeta}>
                Includes: {bundle.included_services}
              </Text>
            ) : null}
            {bundle.validity_days ? (
              <Text style={styles.bundleMeta}>
                Valid for {bundle.validity_days} days
              </Text>
            ) : null}
          </View>
        ))}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Seasonal add-ons</Text>
          <Text style={styles.sectionMeta}>
            Limited-time care bundles
          </Text>
        </View>
        {seasonalStatus === "loading" ? (
          <ActivityIndicator color={theme.colors.accent} />
        ) : null}
        {seasonalStatus !== "loading" && seasonalBundles.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No seasonal add-ons</Text>
            <Text style={styles.emptyBody}>
              We'll announce seasonal care bundles when they go live.
            </Text>
          </View>
        ) : null}
        {seasonalBundles.map((bundle) => (
          <View key={bundle.id} style={styles.bundleCard}>
            <Text style={styles.bundleTitle}>{bundle.title}</Text>
            <Text style={styles.bundlePrice}>
              {formatCurrency(
                (bundle.price_cents || 0) / 100,
                bundle.currency
              )}
            </Text>
            <Text style={styles.bundleDescription}>
              {bundle.description || "Seasonal care add-on bundle."}
            </Text>
            {bundle.included_services ? (
              <Text style={styles.bundleMeta}>
                Includes: {bundle.included_services}
              </Text>
            ) : null}
            {bundle.season_label ? (
              <Text style={styles.bundleMeta}>
                Season: {bundle.season_label}
              </Text>
            ) : null}
            {bundle.available_from || bundle.available_until ? (
              <Text style={styles.bundleMeta}>
                {bundle.available_from
                  ? `From ${new Date(
                      bundle.available_from
                    ).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                    })}`
                  : "Available now"}
                {bundle.available_until
                  ? ` · Until ${new Date(
                      bundle.available_until
                    ).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                    })}`
                  : ""}
              </Text>
            ) : null}
          </View>
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
    subhead: {
      fontSize: theme.typography.caption.fontSize,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.lg,
    },
    sectionHeader: {
      marginTop: theme.spacing.lg,
      marginBottom: theme.spacing.sm,
    },
    sectionTitle: {
      fontSize: theme.typography.body.fontSize,
      fontWeight: "700",
      color: theme.colors.textPrimary,
    },
    sectionMeta: {
      fontSize: theme.typography.caption.fontSize,
      color: theme.colors.textSecondary,
      marginTop: theme.spacing.xs,
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
    bundleCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.lg,
      padding: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.borderSoft,
      marginBottom: theme.spacing.sm,
    },
    bundleTitle: {
      fontSize: theme.typography.body.fontSize,
      fontWeight: "700",
      color: theme.colors.textPrimary,
    },
    bundlePrice: {
      fontSize: theme.typography.headline.fontSize,
      fontWeight: "700",
      color: theme.colors.accent,
      marginTop: theme.spacing.xs,
    },
    bundleDescription: {
      fontSize: theme.typography.caption.fontSize,
      color: theme.colors.textSecondary,
      marginTop: theme.spacing.sm,
    },
    bundleMeta: {
      fontSize: theme.typography.caption.fontSize,
      color: theme.colors.textMuted,
      marginTop: theme.spacing.xs,
    },
  });

export default ServiceBundlesScreen;