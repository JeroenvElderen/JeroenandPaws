import { useEffect, useMemo, useState } from "react";
import {
  Linking,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { supabase } from "../api/supabaseClient";
import { useSession } from "../context/SessionContext";
import { useTheme } from "../context/ThemeContext";

const REVOLUT_PORTAL_URL = "https://revolut.me/jeroenandpaws";

const PaymentMethodsScreen = () => {
  const { theme } = useTheme();
  const { session, setSession } = useSession();
  const [billingName, setBillingName] = useState("");
  const [billingAddress, setBillingAddress] = useState("");
  const [billingVat, setBillingVat] = useState("");
  const [status, setStatus] = useState("idle");

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

  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Payment methods</Text>
        <View style={styles.card}>
          <Text style={styles.label}>Primary card</Text>
          <Text style={styles.value}>
            Manage your saved card through Revolut checkout.
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
              We could not save your billing details.
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
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.md,
    ...theme.shadow.soft,
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: theme.colors.textPrimary,
    marginBottom: 6,
  },
  value: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginBottom: 12,
  },
  button: {
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
  },
  buttonText: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.textPrimary,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.colors.textSecondary,
    marginBottom: 6,
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
    marginBottom: 12,
  },
  errorText: {
    fontSize: 12,
    color: theme.colors.danger,
    marginTop: 6,
  },
  });

export default PaymentMethodsScreen;
