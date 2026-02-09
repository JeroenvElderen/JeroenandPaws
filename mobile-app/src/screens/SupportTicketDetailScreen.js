import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
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

const formatMessageTime = (value) =>
  new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);

const SupportTicketDetailScreen = ({ navigation, route }) => {
  const { session } = useSession();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [ticket, setTicket] = useState(route?.params?.ticket || null);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [status, setStatus] = useState("idle");
  const [saving, setSaving] = useState(false);
  const [clickupUrl, setClickupUrl] = useState("");
  const ticketId = route?.params?.ticketId || ticket?.id;
  const isOwner =
    session?.email?.toLowerCase() === OWNER_EMAIL.toLowerCase();

  const handleReturn = () => {
    const returnTo = route?.params?.returnTo;
    if (returnTo === "SupportTickets") {
      navigation.goBack();
      return;
    }
    navigation.goBack();
  };

  const loadTicket = useCallback(async () => {
    if (!ticketId || !supabase) return;
    try {
      const activeClient =
        isOwner && supabaseAdmin ? supabaseAdmin : supabase;
      const { data, error } = await activeClient
        .from("support_tickets")
        .select("*")
        .eq("id", ticketId)
        .maybeSingle();
      if (error) throw error;
      setTicket(data || null);
      setClickupUrl(data?.clickup_task_url || "");
    } catch (error) {
      console.error("Failed to load support ticket", error);
    }
  }, [isOwner, ticketId]);

  const loadMessages = useCallback(async () => {
    if (!ticketId || !supabase) return;
    setStatus("loading");
    try {
      const activeClient =
        isOwner && supabaseAdmin ? supabaseAdmin : supabase;
      const { data, error } = await activeClient
        .from("support_ticket_messages")
        .select("*")
        .eq("ticket_id", ticketId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      setMessages(data || []);
      setStatus("ready");
    } catch (error) {
      console.error("Failed to load ticket messages", error);
      setStatus("error");
    }
  }, [isOwner, ticketId]);

  useEffect(() => {
    loadTicket();
    loadMessages();
  }, [loadMessages, loadTicket]);

  useEffect(() => {
    if (!supabase || !ticketId) return undefined;
    const channel = supabase
      .channel(`support-ticket-${ticketId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "support_ticket_messages" },
        (payload) => {
          if (payload?.new?.ticket_id === ticketId) {
            loadMessages();
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "support_tickets" },
        (payload) => {
          if (payload?.new?.id === ticketId) {
            setTicket(payload.new);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadMessages, ticketId]);

  const handleSend = async () => {
    if (!supabase || !ticketId || !inputValue.trim()) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("support_ticket_messages").insert({
        ticket_id: ticketId,
        sender: isOwner ? "owner" : "client",
        body: inputValue.trim(),
      });
      if (error) throw error;
      setInputValue("");
      loadMessages();
    } catch (error) {
      console.error("Failed to send ticket message", error);
    } finally {
      setSaving(false);
    }
  };

  const handleCloseTicket = async () => {
    if (!supabase || !ticketId || !isOwner) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("support_tickets")
        .update({ status: "closed", closed_at: new Date().toISOString() })
        .eq("id", ticketId);
      if (error) throw error;
      loadTicket();
    } catch (error) {
      console.error("Failed to close ticket", error);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveClickup = async () => {
    if (!supabase || !ticketId || !isOwner) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("support_tickets")
        .update({ clickup_task_url: clickupUrl.trim() || null })
        .eq("id", ticketId);
      if (error) throw error;
      loadTicket();
    } catch (error) {
      console.error("Failed to update ClickUp link", error);
    } finally {
      setSaving(false);
    }
  };

  const isClosed = (ticket?.status || "").toLowerCase() === "closed";

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ScreenHeader title="Ticket" onBack={handleReturn} />
        <View style={styles.ticketCard}>
          <Text style={styles.ticketSubject}>
            {ticket?.subject || "Support ticket"}
          </Text>
          <Text style={styles.ticketBody}>
            {ticket?.description || "No description provided."}
          </Text>
          <View style={styles.ticketMetaRow}>
            <Text style={styles.ticketMeta}>
              Status: {(ticket?.status || "open").toUpperCase()}
            </Text>
            {isOwner && !isClosed ? (
              <Pressable
                style={styles.closeButton}
                onPress={handleCloseTicket}
                disabled={saving}
              >
                <Text style={styles.closeButtonText}>
                  {saving ? "Closing..." : "Close ticket"}
                </Text>
              </Pressable>
            ) : null}
          </View>
        </View>

        {isOwner ? (
          <View style={styles.clickupCard}>
            <Text style={styles.clickupTitle}>ClickUp task link</Text>
            <Text style={styles.clickupSubtitle}>
              Connect this ticket to a ClickUp task. Messaging in ClickUp can be
              synced here once the integration is connected.
            </Text>
            <TextInput
              style={styles.clickupInput}
              placeholder="Paste ClickUp task URL"
              placeholderTextColor={theme.colors.textMuted}
              value={clickupUrl}
              onChangeText={setClickupUrl}
              autoCapitalize="none"
            />
            <PrimaryButton
              label={saving ? "Saving..." : "Save ClickUp link"}
              onPress={handleSaveClickup}
              disabled={saving}
            />
          </View>
        ) : null}

        <Text style={styles.sectionTitle}>Conversation</Text>
        {status === "loading" ? (
          <ActivityIndicator color={theme.colors.accent} />
        ) : null}
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          style={styles.messageListView}
          contentContainerStyle={styles.messageList}
          renderItem={({ item }) => {
            const isOwnerMessage = item.sender === "owner";
            return (
              <View
                style={[
                  styles.messageBubble,
                  isOwnerMessage
                    ? styles.messageOwner
                    : styles.messageClient,
                ]}
              >
                <Text style={styles.messageText}>{item.body}</Text>
                <Text style={styles.messageTime}>
                  {item.created_at
                    ? formatMessageTime(new Date(item.created_at))
                    : "—"}
                </Text>
              </View>
            );
          }}
          ListEmptyComponent={
            status !== "loading" ? (
              <Text style={styles.emptyText}>No messages yet.</Text>
            ) : null
          }
        />
        <View style={styles.composer}>
          <TextInput
            style={styles.composerInput}
            placeholder="Write a message"
            placeholderTextColor={theme.colors.textMuted}
            value={inputValue}
            onChangeText={setInputValue}
            multiline
          />
          <Pressable
            style={styles.sendButton}
            onPress={handleSend}
            disabled={saving || isClosed}
          >
            <Text style={styles.sendButtonText}>
              {saving ? "Sending..." : "Send"}
            </Text>
          </Pressable>
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
      backgroundColor: theme.colors.background,
    },
    ticketCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.lg,
      padding: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.borderSoft,
      marginBottom: theme.spacing.md,
    },
    ticketSubject: {
      fontSize: theme.typography.body.fontSize,
      fontWeight: "700",
      color: theme.colors.textPrimary,
      marginBottom: theme.spacing.xs,
    },
    ticketBody: {
      fontSize: theme.typography.caption.fontSize,
      color: theme.colors.textSecondary,
    },
    ticketMetaRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: theme.spacing.sm,
    },
    ticketMeta: {
      fontSize: theme.typography.caption.fontSize,
      color: theme.colors.textMuted,
    },
    closeButton: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 4,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.surfaceAccent,
      borderWidth: 1,
      borderColor: theme.colors.borderStrong,
    },
    closeButtonText: {
      fontSize: theme.typography.caption.fontSize,
      fontWeight: "600",
      color: theme.colors.textPrimary,
    },
    clickupCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.lg,
      padding: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.borderSoft,
      marginBottom: theme.spacing.md,
    },
    clickupTitle: {
      fontSize: theme.typography.body.fontSize,
      fontWeight: "700",
      color: theme.colors.textPrimary,
      marginBottom: theme.spacing.xs,
    },
    clickupSubtitle: {
      fontSize: theme.typography.caption.fontSize,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.sm,
    },
    clickupInput: {
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
    sectionTitle: {
      fontSize: theme.typography.body.fontSize,
      fontWeight: "700",
      color: theme.colors.textPrimary,
      marginBottom: theme.spacing.sm,
    },
    messageList: {
      paddingBottom: theme.spacing.md,
      gap: theme.spacing.sm,
    },
    messageListView: {
      flex: 1,
    },
    messageBubble: {
      borderRadius: theme.radius.lg,
      padding: theme.spacing.md,
      maxWidth: "85%",
    },
    messageOwner: {
      backgroundColor: theme.colors.surfaceAccent,
      alignSelf: "flex-end",
    },
    messageClient: {
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.borderSoft,
      alignSelf: "flex-start",
    },
    messageText: {
      fontSize: theme.typography.body.fontSize,
      color: theme.colors.textPrimary,
    },
    messageTime: {
      fontSize: theme.typography.caption.fontSize,
      color: theme.colors.textMuted,
      marginTop: theme.spacing.xs,
    },
    emptyText: {
      fontSize: theme.typography.caption.fontSize,
      color: theme.colors.textMuted,
      marginBottom: theme.spacing.sm,
    },
    composer: {
      flexDirection: "row",
      alignItems: "flex-end",
      borderWidth: 1,
      borderColor: theme.colors.borderSoft,
      borderRadius: theme.radius.lg,
      padding: theme.spacing.sm,
      backgroundColor: theme.colors.surface,
    },
    composerInput: {
      flex: 1,
      fontSize: theme.typography.body.fontSize,
      color: theme.colors.textPrimary,
      minHeight: 40,
      maxHeight: 120,
    },
    sendButton: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.accent,
      marginLeft: theme.spacing.sm,
    },
    sendButtonText: {
      fontSize: theme.typography.caption.fontSize,
      fontWeight: "700",
      color: theme.colors.white,
    },
  });

export default SupportTicketDetailScreen;