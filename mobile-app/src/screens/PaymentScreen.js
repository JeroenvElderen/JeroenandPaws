import { useMemo, useState } from "react";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ScreenHeader from "../components/ScreenHeader";
import PrimaryButton from "../components/PrimaryButton";
import { useTheme } from "../context/ThemeContext";
import { createPaymentSession } from "../api/payments";

const PaymentScreen = ({ navigation, route }) => {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [status, setStatus] = useState("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const payload = route?.params?.payload || null;

  const handleBack = () => navigation.goBack();

  const handleStartPayment = async () => {
    if (!payload) {
      setErrorMessage("Missing payment details. Please try again.");
      return;
    }
    setStatus("loading");
    setErrorMessage("");
    try {
      const response = await createPaymentSession(payload);
      const checkoutUrl =
        response?.checkoutUrl || response?.url || response?.redirectUrl;
      if (!checkoutUrl) {
        throw new Error("Payment session failed. Please try again.");
      }
      await Linking.openURL(checkoutUrl);
      setStatus("idle");
    } catch (error) {
      console.error("Failed to start payment", error);
      setStatus("error");
      setErrorMessage(
        error?.message || "We couldn't start the payment. Please try again."
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ScreenHeader title="Pay in app" onBack={handleBack} />
        <View style={styles.card}>
          <Text style={styles.title}>Complete your payment</Text>
          <Text style={styles.subtitle}>
            You'll be redirected to the secure Revolut checkout to finish your
            payment.
          </Text>
          <PrimaryButton
            label={status === "loading" ? "Opening payment..." : "Pay now"}
            onPress={handleStartPayment}
          />
          {errorMessage ? (
            <Text style={styles.errorText}>{errorMessage}</Text>
          ) : null}
        </View>
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
    },
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.lg,
      padding: theme.spacing.lg,
      borderWidth: 1,
      borderColor: theme.colors.borderSoft,
      shadowColor: theme.shadow.soft.shadowColor,
      shadowOpacity: theme.shadow.soft.shadowOpacity,
      shadowOffset: theme.shadow.soft.shadowOffset,
      shadowRadius: theme.shadow.soft.shadowRadius,
      elevation: theme.shadow.soft.elevation,
    },
    title: {
      fontSize: 20,
      fontWeight: "700",
      color: theme.colors.textPrimary,
      marginBottom: theme.spacing.sm,
    },
    subtitle: {
      fontSize: theme.typography.body.fontSize,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.md,
    },
    errorText: {
      marginTop: theme.spacing.sm,
      color: theme.colors.danger,
      fontSize: theme.typography.caption.fontSize,
    },
  });

export default PaymentScreen;