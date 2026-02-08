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
   const totalAmount = payload?.amount;
  const currencyCode = payload?.currency || "EUR";
  const dateValue = payload?.date;
  const timeValue = payload?.time;
  const serviceLabel = payload?.description;
  const formattedTotal = Number.isFinite(totalAmount)
    ? new Intl.NumberFormat("en-GB", {
        style: "currency",
        currency: currencyCode,
        maximumFractionDigits: 0,
      }).format(totalAmount)
    : null;
  const formattedDate = (() => {
    if (!dateValue) return null;
    const parsed = new Date(dateValue);
    if (Number.isNaN(parsed.getTime())) return dateValue;
    return new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(parsed);
  })();
  const summaryItems = [
    serviceLabel ? { label: "Service", value: serviceLabel } : null,
    formattedDate ? { label: "Date", value: formattedDate } : null,
    timeValue ? { label: "Time", value: timeValue } : null,
    formattedTotal ? { label: "Total", value: formattedTotal } : null,
  ].filter(Boolean);

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
          {summaryItems.length ? (
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Summary</Text>
              {summaryItems.map((item) => (
                <View key={item.label} style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>{item.label}</Text>
                  <Text style={styles.summaryValue}>{item.value}</Text>
                </View>
              ))}
            </View>
          ) : null}
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
    },summaryCard: {
      backgroundColor: theme.colors.background,
      borderRadius: theme.radius.md,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.borderSoft,
    },
    summaryTitle: {
      fontSize: theme.typography.body.fontSize,
      fontWeight: "700",
      color: theme.colors.textPrimary,
      marginBottom: theme.spacing.sm,
    },
    summaryRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: theme.spacing.sm,
      borderBottomWidth: 1,
      borderColor: theme.colors.borderSoft,
    },
    summaryLabel: {
      fontSize: theme.typography.body.fontSize,
      color: theme.colors.textSecondary,
      fontWeight: "600",
    },
    summaryValue: {
      fontSize: theme.typography.body.fontSize,
      fontWeight: "600",
      color: theme.colors.textPrimary,
    },
    errorText: {
      marginTop: theme.spacing.sm,
      color: theme.colors.danger,
      fontSize: theme.typography.caption.fontSize,
    },
  });

export default PaymentScreen;