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
  const [status, setStatus] = useState("idle");
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
      return;
    }
    setStatus("loading");
    try {
      const { data, error } = await supabase
        .from("service_bundles")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      setBundles(data || []);
      setStatus("ready");
    } catch (loadError) {
      console.error("Failed to load bundles", loadError);
      setStatus("error");
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