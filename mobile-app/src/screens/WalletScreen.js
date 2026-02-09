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
import { supabase, supabaseAdmin } from "../api/supabaseClient";
import { useSession } from "../context/SessionContext";
import { useTheme } from "../context/ThemeContext";

const OWNER_EMAIL = "jeroen@jeroenandpaws.com";

const formatCurrency = (amount, currency = "EUR") =>
  new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);

const WalletScreen = ({ navigation, route }) => {
  const { session } = useSession();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [status, setStatus] = useState("idle");
  const returnTo = route?.params?.returnTo;
  const isOwner =
    session?.email?.toLowerCase() === OWNER_EMAIL.toLowerCase();

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

  const loadWallet = useCallback(async () => {
    if (!session?.id || !supabase) {
      setWallet(null);
      setTransactions([]);
      return;
    }
    setStatus("loading");
    try {
      const activeClient =
        isOwner && supabaseAdmin ? supabaseAdmin : supabase;
      const { data: walletData, error: walletError } = await activeClient
        .from("wallets")
        .select("*")
        .eq("client_id", session.id)
        .maybeSingle();
      if (walletError) throw walletError;

      const { data: transactionData, error: transactionError } =
        await activeClient
          .from("wallet_transactions")
          .select("*")
          .eq("client_id", session.id)
          .order("created_at", { ascending: false });
      if (transactionError) throw transactionError;

      setWallet(walletData || null);
      setTransactions(transactionData || []);
      setStatus("ready");
    } catch (loadError) {
      console.error("Failed to load wallet", loadError);
      setStatus("error");
    }
  }, [isOwner, session?.id]);

  useEffect(() => {
    loadWallet();
  }, [loadWallet]);

  const balanceCents = wallet?.balance_cents || 0;
  const currency = wallet?.currency || "EUR";

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <ScreenHeader title="Wallet" onBack={handleReturn} />
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Pre-paid balance</Text>
          <Text style={styles.balanceValue}>
            {formatCurrency(balanceCents / 100, currency)}
          </Text>
          <Text style={styles.balanceNote}>
            Use your balance to pay for upcoming services instantly.
          </Text>
        </View>
        <Text style={styles.sectionTitle}>Recent activity</Text>
        {status === "loading" ? (
          <ActivityIndicator color={theme.colors.accent} />
        ) : null}
        {status !== "loading" && transactions.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No activity yet</Text>
            <Text style={styles.emptyBody}>
              Top-ups and service deductions will show here.
            </Text>
          </View>
        ) : null}
        {transactions.map((transaction) => {
          const amount = (transaction.amount_cents || 0) / 100;
          const isCredit = amount >= 0;
          return (
            <View key={transaction.id} style={styles.transactionCard}>
              <View>
                <Text style={styles.transactionTitle}>
                  {transaction.title || transaction.type || "Wallet update"}
                </Text>
                <Text style={styles.transactionMeta}>
                  {transaction.created_at
                    ? new Date(transaction.created_at).toLocaleDateString(
                        "en-GB",
                        { day: "numeric", month: "short" }
                      )
                    : "—"}
                </Text>
              </View>
              <Text
                style={[
                  styles.transactionAmount,
                  isCredit ? styles.amountCredit : styles.amountDebit,
                ]}
              >
                {isCredit ? "+" : "-"}
                {formatCurrency(Math.abs(amount), currency)}
              </Text>
            </View>
          );
        })}
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
    balanceCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.lg,
      padding: theme.spacing.lg,
      borderWidth: 1,
      borderColor: theme.colors.borderSoft,
      marginBottom: theme.spacing.lg,
    },
    balanceLabel: {
      fontSize: theme.typography.caption.fontSize,
      color: theme.colors.textSecondary,
    },
    balanceValue: {
      fontSize: theme.typography.title.fontSize,
      fontWeight: "700",
      color: theme.colors.textPrimary,
      marginTop: theme.spacing.xs,
    },
    balanceNote: {
      fontSize: theme.typography.caption.fontSize,
      color: theme.colors.textMuted,
      marginTop: theme.spacing.sm,
    },
    sectionTitle: {
      fontSize: theme.typography.body.fontSize,
      fontWeight: "700",
      color: theme.colors.textPrimary,
      marginBottom: theme.spacing.sm,
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
    transactionCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.lg,
      padding: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.borderSoft,
      marginBottom: theme.spacing.sm,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    transactionTitle: {
      fontSize: theme.typography.body.fontSize,
      color: theme.colors.textPrimary,
      fontWeight: "600",
    },
    transactionMeta: {
      fontSize: theme.typography.caption.fontSize,
      color: theme.colors.textMuted,
      marginTop: theme.spacing.xs,
    },
    transactionAmount: {
      fontSize: theme.typography.body.fontSize,
      fontWeight: "700",
    },
    amountCredit: {
      color: theme.colors.success,
    },
    amountDebit: {
      color: theme.colors.danger,
    },
  });

export default WalletScreen;