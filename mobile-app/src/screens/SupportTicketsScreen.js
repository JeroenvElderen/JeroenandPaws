import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ScreenHeader from "../components/ScreenHeader";
import PrimaryButton from "../components/PrimaryButton";
import { supabase, supabaseAdmin } from "../api/supabaseClient";
import { useSession } from "../context/SessionContext";
import { useTheme } from "../context/ThemeContext";

const OWNER_EMAIL = "jeroen@jeroenandpaws.com";

const formatTicketDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const SupportTicketsScreen = ({ navigation, route }) => {
  const { session } = useSession();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [tickets, setTickets] = useState([]);
  const [status, setStatus] = useState("idle");
  const [formStatus, setFormStatus] = useState("idle");
  const [subject, setSubject] = useState("");
  const [details, setDetails] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const returnTo = route?.params?.returnTo;
  const isOwner =
    session?.email?.toLowerCase() === OWNER_EMAIL.toLowerCase();

  const handleReturn = () => {
    if (returnTo) {
      if (returnTo === "HelpSupport") {
        navigation.navigate("HelpSupport");
        return;
      }
      if (returnTo === "Profile") {
        navigation.getParent()?.navigate("Profile", { screen: "ProfileHome" });
        return;
      }
      navigation.getParent()?.navigate(returnTo);
      return;
    }
    navigation.goBack();
  };

  const loadTickets = useCallback(async () => {
    if (!session?.id || !supabase) {
      setTickets([]);
      return;
    }
    setStatus("loading");
    try {
      const activeClient =
        isOwner && supabaseAdmin ? supabaseAdmin : supabase;
      let query = activeClient
        .from("support_tickets")
        .select("*")
        .order("created_at", { ascending: false });
      if (!isOwner) {
        query = query.eq("client_id", session.id);
      }
      const { data, error } = await query;
      if (error) throw error;
      setTickets(data || []);
      setStatus("ready");
    } catch (loadError) {
      console.error("Failed to load support tickets", loadError);
      setStatus("error");
    }
  }, [isOwner, session?.id]);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  const handleCreateTicket = async () => {
    if (!supabase || !session?.id) return;
    if (!subject.trim() || !details.trim()) {
      setErrorMessage("Please add a subject and a short description.");
      return;
    }
    setErrorMessage("");
    setFormStatus("saving");
    try {
      const { error } = await supabase.from("support_tickets").insert({
        client_id: session.id,
        subject: subject.trim(),
        description: details.trim(),
        status: "open",
        priority: "normal",
      });
      if (error) throw error;
      setSubject("");
      setDetails("");
      setFormStatus("idle");
      loadTickets();
    } catch (saveError) {
      console.error("Failed to create ticket", saveError);
      setErrorMessage("Unable to submit your ticket right now.");
      setFormStatus("error");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <ScreenHeader title="Support tickets" onBack={handleReturn} />
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Open a new ticket</Text>
          <TextInput
            style={styles.input}
            placeholder="Subject"
            placeholderTextColor={theme.colors.textMuted}
            value={subject}
            onChangeText={setSubject}
          />
          <TextInput
            style={[styles.input, styles.inputMultiline]}
            placeholder="Describe what you need help with..."
            placeholderTextColor={theme.colors.textMuted}
            value={details}
            onChangeText={setDetails}
            multiline
            numberOfLines={4}
          />
          {errorMessage ? (
            <Text style={styles.errorText}>{errorMessage}</Text>
          ) : null}
          <PrimaryButton
            label={formStatus === "saving" ? "Submitting..." : "Submit ticket"}
            onPress={handleCreateTicket}
            disabled={formStatus === "saving"}
          />
        </View>
        <Text style={styles.sectionTitle}>Recent tickets</Text>
        {status === "loading" ? (
          <ActivityIndicator color={theme.colors.accent} />
        ) : null}
        {status !== "loading" && tickets.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No tickets yet</Text>
            <Text style={styles.emptyBody}>
              Submit a ticket and we will keep you posted here.
            </Text>
          </View>
        ) : null}
        {tickets.map((ticket) => (
          <View key={ticket.id} style={styles.ticketCard}>
            <View style={styles.ticketHeader}>
              <Text style={styles.ticketSubject}>{ticket.subject}</Text>
              <View style={styles.statusPill}>
                <Text style={styles.statusText}>
                  {(ticket.status || "open").toUpperCase()}
                </Text>
              </View>
            </View>
            <Text style={styles.ticketBody} numberOfLines={2}>
              {ticket.description || "No description provided."}
            </Text>
            <View style={styles.ticketFooter}>
              <Text style={styles.ticketMeta}>
                {formatTicketDate(ticket.created_at)}
              </Text>
              <Pressable
                onPress={() => navigation.navigate("Messages")}
                style={styles.ticketLink}
              >
                <Text style={styles.ticketLinkText}>Chat with us</Text>
              </Pressable>
            </View>
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
    formCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.lg,
      padding: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.borderSoft,
      marginBottom: theme.spacing.lg,
      shadowColor: theme.shadow.soft.shadowColor,
      shadowOpacity: theme.shadow.soft.shadowOpacity,
      shadowOffset: theme.shadow.soft.shadowOffset,
      shadowRadius: theme.shadow.soft.shadowRadius,
      elevation: theme.shadow.soft.elevation,
    },
    formTitle: {
      fontSize: theme.typography.body.fontSize,
      fontWeight: "700",
      color: theme.colors.textPrimary,
      marginBottom: theme.spacing.sm,
    },
    input: {
      borderWidth: 1,
      borderColor: theme.colors.borderSoft,
      borderRadius: theme.radius.md,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      fontSize: theme.typography.body.fontSize,
      color: theme.colors.textPrimary,
      backgroundColor: theme.colors.background,
      marginBottom: theme.spacing.sm,
    },
    inputMultiline: {
      minHeight: 110,
      textAlignVertical: "top",
    },
    errorText: {
      color: theme.colors.danger,
      fontSize: theme.typography.caption.fontSize,
      marginBottom: theme.spacing.sm,
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
    ticketCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.lg,
      padding: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.borderSoft,
      marginBottom: theme.spacing.sm,
    },
    ticketHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: theme.spacing.xs,
    },
    ticketSubject: {
      flex: 1,
      fontSize: theme.typography.body.fontSize,
      fontWeight: "700",
      color: theme.colors.textPrimary,
      marginRight: theme.spacing.sm,
    },
    statusPill: {
      backgroundColor: theme.colors.accentSoft,
      borderRadius: theme.radius.pill,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 4,
    },
    statusText: {
      fontSize: theme.typography.caption.fontSize,
      color: theme.colors.accent,
      fontWeight: "700",
    },
    ticketBody: {
      fontSize: theme.typography.caption.fontSize,
      color: theme.colors.textSecondary,
    },
    ticketFooter: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: theme.spacing.sm,
    },
    ticketMeta: {
      fontSize: theme.typography.caption.fontSize,
      color: theme.colors.textMuted,
    },
    ticketLink: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 4,
    },
    ticketLinkText: {
      fontSize: theme.typography.caption.fontSize,
      color: theme.colors.accent,
      fontWeight: "600",
    },
  });

export default SupportTicketsScreen;