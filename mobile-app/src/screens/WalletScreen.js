import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ScreenHeader from "../components/ScreenHeader";
import PrimaryButton from "../components/PrimaryButton";
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
  const [receipts, setReceipts] = useState([]);
  const [loyaltyWallet, setLoyaltyWallet] = useState(null);
  const [loyaltyTransactions, setLoyaltyTransactions] = useState([]);
  const [referralCode, setReferralCode] = useState(null);
  const [referrals, setReferrals] = useState([]);
  const [referralCredits, setReferralCredits] = useState([]);
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
      const [
        walletResponse,
        transactionResponse,
        receiptResponse,
        loyaltyResponse,
        loyaltyTransactionResponse,
        referralCodeResponse,
        referralResponse,
        referralCreditsResponse,
      ] = await Promise.all([
        activeClient
          .from("wallets")
          .select("*")
          .eq("client_id", session.id)
          .maybeSingle(),
        activeClient
          .from("wallet_transactions")
          .select("*")
          .eq("client_id", session.id)
          .order("created_at", { ascending: false }),
        activeClient
          .from("receipts")
          .select("*")
          .eq("client_id", session.id)
          .order("issued_at", { ascending: false }),
        activeClient
          .from("loyalty_wallets")
          .select("*")
          .eq("client_id", session.id)
          .maybeSingle(),
        activeClient
          .from("loyalty_transactions")
          .select("*")
          .eq("client_id", session.id)
          .order("created_at", { ascending: false }),
        activeClient
          .from("referral_codes")
          .select("*")
          .eq("client_id", session.id)
          .maybeSingle(),
        activeClient
          .from("referrals")
          .select("*")
          .eq("referrer_id", session.id)
          .order("created_at", { ascending: false }),
        activeClient
          .from("referral_credits")
          .select("*")
          .eq("client_id", session.id)
          .order("created_at", { ascending: false }),
      ]);

      if (walletResponse.error) throw walletResponse.error;
      if (transactionResponse.error) throw transactionResponse.error;
      if (receiptResponse.error) throw receiptResponse.error;
      if (loyaltyResponse.error) throw loyaltyResponse.error;
      if (loyaltyTransactionResponse.error)
        throw loyaltyTransactionResponse.error;
      if (referralCodeResponse.error) throw referralCodeResponse.error;
      if (referralResponse.error) throw referralResponse.error;
      if (referralCreditsResponse.error) throw referralCreditsResponse.error;

      setWallet(walletResponse.data || null);
      setTransactions(transactionResponse.data || []);
      setReceipts(receiptResponse.data || []);
      setLoyaltyWallet(loyaltyResponse.data || null);
      setLoyaltyTransactions(loyaltyTransactionResponse.data || []);
      setReferralCode(referralCodeResponse.data || null);
      setReferrals(referralResponse.data || []);
      setReferralCredits(referralCreditsResponse.data || []);
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
  const referralCreditsCents = referralCredits.reduce(
    (sum, credit) => sum + (credit?.credits_cents || 0),
    0
  );
  const referralCurrency =
    referralCredits.find((credit) => credit?.currency)?.currency || "EUR";
  const referralSuccessCount = referrals.filter(
    (referral) => (referral?.status || "").toLowerCase() === "completed"
  ).length;

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
        <View style={styles.topUpCard}>
          <Text style={styles.topUpTitle}>Add money to your wallet</Text>
          <Text style={styles.topUpBody}>
            Top-ups can be processed instantly using your saved card, or you
            can request a manual top-up from the team.
          </Text>
          <PrimaryButton
            label="Top up by card"
            onPress={() =>
              navigation.navigate("PaymentMethods", { returnTo: "Wallet" })
            }
          />
          <PrimaryButton
            label="Request a top-up"
            onPress={() => navigation.navigate("Messages")}
            variant="secondary"
          />
        </View>
        <View style={styles.rewardsCard}>
          <Text style={styles.rewardsTitle}>Rewards wallet</Text>
          <Text style={styles.rewardsPoints}>
            {loyaltyWallet?.points_balance ?? 0} points
          </Text>
          <Text style={styles.rewardsBody}>
            Earn points on every booking and redeem them for discounts at
            checkout.
          </Text>
          {loyaltyTransactions.length ? (
            <View style={styles.rewardsList}>
              {loyaltyTransactions.slice(0, 3).map((entry) => (
                <View key={entry.id} style={styles.rewardRow}>
                  <Text style={styles.rewardTitle}>
                    {entry.title || entry.reason || "Reward update"}
                  </Text>
                  <Text style={styles.rewardPoints}>
                    {entry.points > 0 ? "+" : ""}
                    {entry.points || 0} pts
                  </Text>
                </View>
              ))}
            </View>
          ) : null}
        </View>
        <View style={styles.referralCard}>
          <Text style={styles.referralTitle}>Referral credits</Text>
          <Text style={styles.referralBalance}>
            {formatCurrency(referralCreditsCents / 100, referralCurrency)}
          </Text>
          <Text style={styles.referralBody}>
            Share your code and earn credits when a friend completes their
            first booking.
          </Text>
          <View style={styles.referralRow}>
            <View>
              <Text style={styles.referralLabel}>Your code</Text>
              <Text style={styles.referralCode}>
                {referralCode?.code ||
                  referralCode?.referral_code ||
                  "Invite code pending"}
              </Text>
            </View>
            <View style={styles.referralStat}>
              <Text style={styles.referralStatValue}>
                {referralSuccessCount}
              </Text>
              <Text style={styles.referralStatLabel}>Completed</Text>
            </View>
            <View style={styles.referralStat}>
              <Text style={styles.referralStatValue}>{referrals.length}</Text>
              <Text style={styles.referralStatLabel}>Invites</Text>
            </View>
          </View>
          {referrals.length ? (
            <View style={styles.referralList}>
              {referrals.slice(0, 3).map((referral) => (
                <View key={referral.id} style={styles.referralItem}>
                  <View>
                    <Text style={styles.referralItemTitle}>
                      {referral?.referred_name ||
                        referral?.referred_email ||
                        "New referral"}
                    </Text>
                    <Text style={styles.referralItemMeta}>
                      {referral?.created_at
                        ? new Date(referral.created_at).toLocaleDateString(
                            "en-GB",
                            { day: "numeric", month: "short" }
                          )
                        : "Pending"}
                    </Text>
                  </View>
                  <Text style={styles.referralItemStatus}>
                    {referral?.status || "Pending"}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.referralEmpty}>
              No referrals yet. Share your code to start earning credits.
            </Text>
          )}
        </View>
        <Text style={styles.sectionTitle}>Receipts</Text>
        {receipts.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No receipts yet</Text>
            <Text style={styles.emptyBody}>
              Downloadable PDFs will appear after each paid booking.
            </Text>
          </View>
        ) : null}
        {receipts.map((receipt) => (
          <View key={receipt.id} style={styles.receiptCard}>
            <View style={styles.receiptCopy}>
              <Text style={styles.receiptTitle}>
                {receipt.title || "Service receipt"}
              </Text>
              <Text style={styles.receiptMeta}>
                {receipt.issued_at
                  ? new Date(receipt.issued_at).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                  : "Pending"}
              </Text>
            </View>
            {receipt.pdf_url ? (
              <Pressable
                style={styles.receiptButton}
                onPress={() => Linking.openURL(receipt.pdf_url)}
              >
                <Text style={styles.receiptButtonText}>Download PDF</Text>
              </Pressable>
            ) : (
              <Text style={styles.receiptPending}>Preparing...</Text>
            )}
          </View>
        ))}
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
    topUpCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.lg,
      padding: theme.spacing.lg,
      borderWidth: 1,
      borderColor: theme.colors.borderSoft,
      marginBottom: theme.spacing.lg,
    },
    topUpTitle: {
      fontSize: theme.typography.body.fontSize,
      fontWeight: "700",
      color: theme.colors.textPrimary,
      marginBottom: theme.spacing.xs,
    },
    topUpBody: {
      fontSize: theme.typography.caption.fontSize,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.sm,
    },
    rewardsCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.lg,
      padding: theme.spacing.lg,
      borderWidth: 1,
      borderColor: theme.colors.borderSoft,
      marginBottom: theme.spacing.lg,
    },
    rewardsTitle: {
      fontSize: theme.typography.body.fontSize,
      fontWeight: "700",
      color: theme.colors.textPrimary,
    },
    rewardsPoints: {
      fontSize: theme.typography.title.fontSize,
      fontWeight: "700",
      color: theme.colors.accent,
      marginTop: theme.spacing.xs,
    },
    rewardsBody: {
      fontSize: theme.typography.caption.fontSize,
      color: theme.colors.textSecondary,
      marginTop: theme.spacing.sm,
    },
    rewardsList: {
      marginTop: theme.spacing.md,
      gap: theme.spacing.sm,
    },
    referralCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.lg,
      borderWidth: 1,
      borderColor: theme.colors.borderSoft,
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.lg,
      shadowColor: theme.shadow.soft.shadowColor,
      shadowOpacity: theme.shadow.soft.shadowOpacity,
      shadowOffset: theme.shadow.soft.shadowOffset,
      shadowRadius: theme.shadow.soft.shadowRadius,
      elevation: theme.shadow.soft.elevation,
    },
    referralTitle: {
      fontSize: theme.typography.body.fontSize,
      fontWeight: "700",
      color: theme.colors.textPrimary,
    },
    referralBalance: {
      fontSize: theme.typography.title.fontSize,
      fontWeight: "700",
      color: theme.colors.textPrimary,
      marginTop: theme.spacing.xs,
    },
    referralBody: {
      fontSize: theme.typography.caption.fontSize,
      color: theme.colors.textSecondary,
      marginTop: theme.spacing.xs,
    },
    referralRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-end",
      marginTop: theme.spacing.md,
      gap: theme.spacing.sm,
    },
    referralLabel: {
      fontSize: theme.typography.caption.fontSize,
      color: theme.colors.textSecondary,
    },
    referralCode: {
      fontSize: theme.typography.body.fontSize,
      fontWeight: "700",
      color: theme.colors.textPrimary,
      marginTop: 2,
    },
    referralStat: {
      alignItems: "flex-end",
    },
    referralStatValue: {
      fontSize: theme.typography.body.fontSize,
      fontWeight: "700",
      color: theme.colors.textPrimary,
    },
    referralStatLabel: {
      fontSize: theme.typography.caption.fontSize,
      color: theme.colors.textSecondary,
    },
    referralList: {
      marginTop: theme.spacing.md,
      gap: theme.spacing.sm,
    },
    referralItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: theme.spacing.sm,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.surfaceElevated,
      borderWidth: 1,
      borderColor: theme.colors.borderSoft,
    },
    referralItemTitle: {
      fontSize: theme.typography.caption.fontSize,
      fontWeight: "600",
      color: theme.colors.textPrimary,
    },
    referralItemMeta: {
      fontSize: theme.typography.caption.fontSize,
      color: theme.colors.textSecondary,
      marginTop: 2,
    },
    referralItemStatus: {
      fontSize: theme.typography.caption.fontSize,
      fontWeight: "600",
      color: theme.colors.textSecondary,
      textTransform: "capitalize",
    },
    referralEmpty: {
      marginTop: theme.spacing.md,
      fontSize: theme.typography.caption.fontSize,
      color: theme.colors.textSecondary,
    },
    rewardRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    rewardTitle: {
      fontSize: theme.typography.caption.fontSize,
      color: theme.colors.textPrimary,
    },
    rewardPoints: {
      fontSize: theme.typography.caption.fontSize,
      color: theme.colors.success,
      fontWeight: "600",
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
    receiptCard: {
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
    receiptCopy: {
      flex: 1,
      paddingRight: theme.spacing.sm,
    },
    receiptTitle: {
      fontSize: theme.typography.body.fontSize,
      fontWeight: "600",
      color: theme.colors.textPrimary,
      marginBottom: theme.spacing.xs,
    },
    receiptMeta: {
      fontSize: theme.typography.caption.fontSize,
      color: theme.colors.textMuted,
    },
    receiptButton: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 6,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.surfaceAccent,
      borderWidth: 1,
      borderColor: theme.colors.borderStrong,
    },
    receiptButtonText: {
      fontSize: theme.typography.caption.fontSize,
      fontWeight: "600",
      color: theme.colors.textPrimary,
    },
    receiptPending: {
      fontSize: theme.typography.caption.fontSize,
      color: theme.colors.textMuted,
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