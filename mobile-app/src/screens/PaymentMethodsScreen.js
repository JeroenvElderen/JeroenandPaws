import { useEffect, useMemo, useState } from "react";
import {
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../api/supabaseClient";
import ScreenHeader from "../components/ScreenHeader";
import { useSession } from "../context/SessionContext";
import { useTheme } from "../context/ThemeContext";

const REVOLUT_PORTAL_URL = "https://revolut.me/jeroenandpaws";

const PaymentMethodsScreen = ({ navigation, route }) => {
  const { session, setSession } = useSession();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [billingName, setBillingName] = useState("");
  const [billingAddress, setBillingAddress] = useState("");
  const [billingVat, setBillingVat] = useState("");
  const [status, setStatus] = useState("idle");
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

  useEffect(() => {
    const details =
      session?.user?.user_metadata?.billing_details || session?.client || {};
    setBillingName(details?.billing_name || session?.name || "");
    setBillingAddress(details?.billing_address || session?.address || "");
    setBillingVat(details?.billing_vat || "");
  }, [session]);

  const handleUpdatePayment = async () => {
    await Linking.openURL(REVOLUT_PORTAL_URL);
  };

  const handleSaveBilling = async () => {
    if (!supabase || !session?.user) return;
    setStatus("saving");
    try {
      const billingDetails = {
        billing_name: billingName.trim(),
        billing_address: billingAddress.trim(),
        billing_vat: billingVat.trim(),
      };
      const { error } = await supabase.auth.updateUser({
        data: { billing_details: billingDetails },
      });
      if (error) throw error;
      setSession((current) =>
        current
          ? {
              ...current,
              user: {
                ...current.user,
                user_metadata: {
                  ...current.user.user_metadata,
                  billing_details: billingDetails,
                },
              },
            }
          : current
      );
      setStatus("idle");
    } catch (error) {
      console.error("Failed to update billing details", error);
      setStatus("error");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <ScreenHeader title="Payment methods" onBack={handleReturn} />
        <Text style={styles.title}>Payment methods</Text>
        <View style={styles.card}>
          <Text style={styles.label}>Primary card</Text>
          <Text style={styles.value}>
            Manage your card during Revolut checkout.
          </Text>
          <Pressable style={styles.button} onPress={handleUpdatePayment}>
            <Text style={styles.buttonText}>Update payment method</Text>
          </Pressable>
        </View>
        <View style={styles.card}>
          <Text style={styles.label}>Billing settings</Text>
          <Text style={styles.value}>
            Keep invoice details up to date for receipts.
          </Text>
          <Text style={styles.inputLabel}>Billing name</Text>
          <TextInput
            style={styles.input}
            value={billingName}
            onChangeText={setBillingName}
            placeholder="Name or company"
          />
          <Text style={styles.inputLabel}>Billing address</Text>
          <TextInput
            style={styles.input}
            value={billingAddress}
            onChangeText={setBillingAddress}
            placeholder="Address or Eircode"
          />
          <Text style={styles.inputLabel}>VAT number (optional)</Text>
          <TextInput
            style={styles.input}
            value={billingVat}
            onChangeText={setBillingVat}
            placeholder="VAT number"
          />
          <Pressable style={styles.button} onPress={handleSaveBilling}>
            <Text style={styles.buttonText}>
              {status === "saving" ? "Saving..." : "Update billing details"}
            </Text>
          </Pressable>
          {status === "error" ? (
            <Text style={styles.errorText}>
              We couldn't save your billing details. Try again in a moment.
            </Text>
          ) : null}
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
      padding: theme.spacing.lg,
      paddingBottom: theme.spacing.xxl,
      backgroundColor: theme.colors.background,
    },
    title: {
      fontSize: 24,
      fontWeight: "700",
      color: theme.colors.textPrimary,
      marginBottom: theme.spacing.md,
      textAlign: "center",
    },
    card: {
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
    label: {
      fontSize: theme.typography.body.fontSize,
      fontWeight: "700",
      color: theme.colors.textPrimary,
      marginBottom: theme.spacing.xs,
    },
    value: {
      fontSize: theme.typography.caption.fontSize,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.sm,
    },
    button: {
      alignSelf: "flex-start",
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.xs,
      backgroundColor: theme.colors.surfaceAccent,
      borderRadius: theme.radius.md,
      borderWidth: 1,
      borderColor: theme.colors.borderStrong,
    },
    buttonText: {
      fontSize: theme.typography.caption.fontSize,
      fontWeight: "600",
      color: theme.colors.textPrimary,
    },
    inputLabel: {
      fontSize: theme.typography.caption.fontSize,
      fontWeight: "600",
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.xs,
    },
    input: {
      borderWidth: 1,
      borderColor: theme.colors.borderStrong,
      borderRadius: theme.radius.md,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      fontSize: theme.typography.body.fontSize,
      color: theme.colors.textPrimary,
      backgroundColor: theme.colors.surfaceElevated,
      marginBottom: theme.spacing.sm,
    },
    errorText: {
      fontSize: theme.typography.caption.fontSize,
      color: theme.colors.danger,
      marginTop: theme.spacing.xs,
    },
  });

export default PaymentMethodsScreen;
