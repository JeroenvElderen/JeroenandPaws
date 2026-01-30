import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "../api/supabaseClient";
import ScreenHeader from "../components/ScreenHeader";
import { useSession } from "../context/SessionContext";
import { TAB_BAR_STYLE } from "../utils/tabBar";

const OWNER_EMAIL = "jeroen@jeroenandpaws.com";
const OWNER_CLIENT_ID = "94cab38a-1f08-498b-8efa-7ed8f561926f";
const MESSAGE_RETENTION_DAYS = 7;

const formatDayLabel = (value) =>
  new Intl.DateTimeFormat("en-GB", { weekday: "long" }).format(value);

const formatMessageTime = (value) =>
  new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(value);

const parseMessageBody = (body) => {
  if (!body) return { type: "text", text: "" };
  try {
    const parsed = JSON.parse(body);
    if (parsed && typeof parsed === "object" && parsed.type) {
      return parsed;
    }
  } catch (error) {
    // ignore parse failures and treat as text
  }
  return { type: "text", text: body };
};

const buildPreviewText = (body) => {
  const parsed = parseMessageBody(body);
  if (parsed.type === "image") {
    return "📷 Photo";
  }
  if (parsed.type === "jeroen_paws_card") {
    return parsed.title || "Jeroen & Paws Card";
  }
  return parsed.text || "";
};

const MessagesScreen = ({ navigation }) => {
  const { session } = useSession();
  const [selectedClientId, setSelectedClientId] = useState(null);
  const [inboxItems, setInboxItems] = useState([]);
  const [clientMeta, setClientMeta] = useState({});
  const [messages, setMessages] = useState([]);
  const [loadingChat, setLoadingChat] = useState(false);
  const [loadingInbox, setLoadingInbox] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [pendingImage, setPendingImage] = useState(null);
  const [sending, setSending] = useState(false);
  const [imagePickerError, setImagePickerError] = useState("");
  const listRef = useRef(null);
  const isOwner =
    session?.email?.toLowerCase() === OWNER_EMAIL.toLowerCase();

  useEffect(() => {
    if (!isOwner && session?.id) {
      setSelectedClientId(session.id);
    }
  }, [isOwner, session?.id]);

  const storageKey = useMemo(() => {
    if (!session?.id) return null;
    return `messages:lastRead:${isOwner ? OWNER_CLIENT_ID : session.id}`;
  }, [isOwner, session?.id]);

  const updateLastRead = useCallback(
    async (clientId, timestamp) => {
      if (!storageKey || !clientId || !timestamp) return;
      try {
        const raw = await AsyncStorage.getItem(storageKey);
        const map = raw ? JSON.parse(raw) : {};
        map[clientId] = timestamp;
        await AsyncStorage.setItem(storageKey, JSON.stringify(map));
      } catch (error) {
        console.error("Failed to persist last read timestamp", error);
      }
    },
    [storageKey]
  );

  const getKeepMessagesPreference = useCallback(
    (clientId) => {
      if (!clientId) return false;
      if (!isOwner) {
        return (
          session?.client?.keep_messages ||
          session?.user?.user_metadata?.keep_messages ||
          false
        );
      }
      return clientMeta?.[clientId]?.keep_messages || false;
    },
    [clientMeta, isOwner, session?.client?.keep_messages, session?.user]
  );

  const deleteOldMessages = useCallback(
    async (clientId) => {
      if (!supabase || !clientId) return;
      if (getKeepMessagesPreference(clientId)) return;
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - MESSAGE_RETENTION_DAYS);
      try {
        await supabase
          .from("messages")
          .delete()
          .eq("client_id", clientId)
          .lt("created_at", cutoff.toISOString());
      } catch (error) {
        console.error("Failed to delete old messages", error);
      }
    },
    [getKeepMessagesPreference]
  );

  const markMessagesRead = useCallback(
    async (clientId) => {
      if (!supabase || !clientId) return;
      const senderToMark = isOwner ? "client" : "owner";
      try {
        const { error } = await supabase
          .from("messages")
          .update({ read_at: new Date().toISOString() })
          .eq("client_id", clientId)
          .eq("sender", senderToMark)
          .is("read_at", null);
        if (error) throw error;
      } catch (error) {
        console.error("Failed to mark messages as read", error);
      }
    },
    [isOwner]
  );

  const loadInbox = useCallback(async () => {
    if (!supabase || !isOwner || !session?.email) return;
    setLoadingInbox(true);
    try {
      const { data, error } = await supabase
        .from("messages")
        .select("id, client_id, sender, body, created_at, read_at")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const latestByClient = new Map();
      const unreadClientIds = new Set();
      let lastReadMap = {};

      if (storageKey) {
        const raw = await AsyncStorage.getItem(storageKey);
        lastReadMap = raw ? JSON.parse(raw) : {};
      }

      (data || []).forEach((message) => {
        const clientId = message.client_id;
        if (!latestByClient.has(clientId)) {
          latestByClient.set(clientId, message);
        }
        if (message.sender === "client") {
          const lastRead = lastReadMap?.[clientId];
          if (!lastRead) {
            unreadClientIds.add(clientId);
          } else if (
            new Date(message.created_at) > new Date(lastRead)
          ) {
            unreadClientIds.add(clientId);
          }
        }
      });

      const clientIds = Array.from(latestByClient.keys());
      let clientLookup = {};

      if (clientIds.length > 0) {
        const { data: clientsData, error: clientsError } = await supabase
          .from("clients")
          .select("id, full_name, email, keep_messages")
          .in("id", clientIds);

        if (clientsError) throw clientsError;

        clientLookup = (clientsData || []).reduce((acc, client) => {
          acc[client.id] = client;
          return acc;
        }, {});
      }

      const items = Array.from(latestByClient.values()).map((message) => ({
        ...message,
        unread: unreadClientIds.has(message.client_id),
      }));

      setClientMeta(clientLookup);
      setInboxItems(items);
    } catch (error) {
      console.error("Failed to load inbox", error);
    } finally {
      setLoadingInbox(false);
    }
  }, [isOwner, session?.email, storageKey]);

  useEffect(() => {
    if (isOwner) {
      loadInbox();
    }
  }, [isOwner, loadInbox]);

  useEffect(() => {
    if (!supabase || !isOwner) return;

    const channel = supabase
      .channel("messages-inbox")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        () => {
          loadInbox();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isOwner, loadInbox]);

  const loadMessages = useCallback(
    async (clientId) => {
      if (!supabase || !clientId) return;
      setLoadingChat(true);
      try {
        await deleteOldMessages(clientId);
        const { data, error } = await supabase
          .from("messages")
          .select("*")
          .eq("client_id", clientId)
          .order("created_at", { ascending: true });

        if (error) throw error;
        setMessages(data || []);

        if (data && data.length > 0) {
          const latestTimestamp = data[data.length - 1].created_at;
          await updateLastRead(clientId, latestTimestamp);
        }
        await markMessagesRead(clientId);
      } catch (error) {
        console.error("Failed to load messages", error);
      } finally {
        setLoadingChat(false);
      }
    },
    [deleteOldMessages, markMessagesRead, updateLastRead]
  );

  useEffect(() => {
    if (!selectedClientId) return;
    loadMessages(selectedClientId);
  }, [loadMessages, selectedClientId]);

  useEffect(() => {
    if (!supabase || !selectedClientId) return;

    const channel = supabase
      .channel(`messages-chat-${selectedClientId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `client_id=eq.${selectedClientId}`,
        },
        (payload) => {
          const message = payload.new;
          setMessages((prev) => [...prev, message]);
          if (message?.sender !== (isOwner ? "owner" : "client")) {
            markMessagesRead(selectedClientId);
            updateLastRead(selectedClientId, message.created_at);
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
          filter: `client_id=eq.${selectedClientId}`,
        },
        (payload) => {
          const updated = payload.new;
          setMessages((prev) =>
            prev.map((message) =>
              message.id === updated.id ? updated : message
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isOwner, markMessagesRead, selectedClientId, updateLastRead]);

  useEffect(() => {
    if (!listRef.current || messages.length === 0) return;
    const timer = setTimeout(() => {
      listRef.current?.scrollToEnd({ animated: true });
    }, 100);
    return () => clearTimeout(timer);
  }, [messages.length]);

  const activeClientId = selectedClientId;
  const activeClient = useMemo(() => {
    if (!activeClientId) return null;
    if (!isOwner) {
      return session?.client || {
        id: session?.id,
        full_name: session?.name,
        email: session?.email,
      };
    }
    return clientMeta?.[activeClientId] || { id: activeClientId };
  }, [activeClientId, clientMeta, isOwner, session]);
  const isChatView = Boolean(activeClientId);

  useLayoutEffect(() => {
    const parent = navigation.getParent();
    const parentState = parent?.getState?.();
    const tabParent =
      parentState?.type === "tab" ? parent : parent?.getParent();
    if (!tabParent) return undefined;

    tabParent.setOptions({
      tabBarStyle: isChatView ? { display: "none" } : TAB_BAR_STYLE,
    });

    return () => {
      tabParent.setOptions({ tabBarStyle: TAB_BAR_STYLE });
    };
  }, [navigation, isChatView]);

  const messageItems = useMemo(() => {
    let lastDayKey = null;
    const items = [];
    messages.forEach((message) => {
      const createdAt = message.created_at
        ? new Date(message.created_at)
        : null;
      if (!createdAt || Number.isNaN(createdAt.getTime())) return;
      const dayKey = createdAt.toDateString();
      if (dayKey !== lastDayKey) {
        items.push({
          type: "date",
          id: `date-${dayKey}`,
          date: createdAt,
        });
        lastDayKey = dayKey;
      }
      items.push({ type: "message", id: message.id, message });
    });
    return items;
  }, [messages]);

  const handleSelectClient = (clientId) => {
    setSelectedClientId(clientId);
    if (clientId) {
      updateLastRead(clientId, new Date().toISOString());
    }
  };

  const handlePickImage = async () => {
    setImagePickerError("");
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        setImagePickerError("Please allow photo access to send images.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        base64: true,
      });

      if (result.canceled) return;

      const asset = result.assets?.[0];
      if (!asset) return;
      const mimeType = asset.mimeType || "image/jpeg";
      const dataUri = asset.base64
        ? `data:${mimeType};base64,${asset.base64}`
        : asset.uri;

      setPendingImage({ uri: dataUri, previewUri: asset.uri });
    } catch (error) {
      console.error("Failed to pick image", error);
      setImagePickerError("Unable to select image right now.");
    }
  };

  const handleSend = async () => {
    if (!supabase || !activeClientId || sending) return;
    const trimmed = inputValue.trim();
    const payloads = [];

    if (pendingImage?.uri) {
      payloads.push({
        body: JSON.stringify({
          type: "image",
          uri: pendingImage.uri,
        }),
      });
    }

    if (trimmed.length > 0) {
      payloads.push({ body: trimmed });
    }

    if (payloads.length === 0) return;

    setSending(true);
    try {
      const insertPayload = payloads.map((payload) => ({
        client_id: activeClientId,
        sender: isOwner ? "owner" : "client",
        body: payload.body,
      }));

      const { error } = await supabase
        .from("messages")
        .insert(insertPayload);

      if (error) throw error;

      setInputValue("");
      setPendingImage(null);
    } catch (error) {
      console.error("Failed to send message", error);
    } finally {
      setSending(false);
    }
  };

  const renderInboxItem = ({ item }) => {
    const client = clientMeta?.[item.client_id];
    const name = client?.full_name || client?.email || "Client";
    const preview = buildPreviewText(item.body);
    const timestamp = item.created_at
      ? formatMessageTime(new Date(item.created_at))
      : "";

    return (
      <Pressable
        style={({ pressed }) => [
          styles.inboxCard,
          pressed && styles.cardPressed,
        ]}
        onPress={() => handleSelectClient(item.client_id)}
      >
        <View style={styles.inboxHeader}>
          <View>
            <Text style={styles.inboxName}>{name}</Text>
            <Text style={styles.inboxPreview} numberOfLines={2}>
              {preview}
            </Text>
          </View>
          <View style={styles.inboxMeta}>
            <Text style={styles.inboxTime}>{timestamp}</Text>
            {item.unread ? <View style={styles.unreadDot} /> : null}
          </View>
        </View>
      </Pressable>
    );
  };

  const renderMessageItem = ({ item }) => {
    if (item.type === "date") {
      return (
        <View style={styles.dateRow}>
          <Text style={styles.dateText}>{formatDayLabel(item.date)}</Text>
        </View>
      );
    }

    const message = item.message;
    const parsed = parseMessageBody(message.body);
    const isOwnMessage =
      message.sender === (isOwner ? "owner" : "client");
    const createdAt = message.created_at
      ? new Date(message.created_at)
      : null;
    const timeLabel = createdAt ? formatMessageTime(createdAt) : "";
    const readLabel = message.read_at ? "✓✓" : "✓";
    const readColor = message.read_at ? "#1d9bf0" : "#9aa0a6";

    return (
      <View
        style={[
          styles.messageRow,
          isOwnMessage ? styles.messageRowOwn : styles.messageRowOther,
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            isOwnMessage
              ? styles.messageBubbleOwn
              : styles.messageBubbleOther,
          ]}
        >
          {parsed.type === "image" ? (
            <Image
              source={{ uri: parsed.uri }}
              style={styles.messageImage}
            />
          ) : parsed.type === "jeroen_paws_card" ? (
            <Pressable
              style={styles.cardMessage}
              onPress={() => {
                if (!parsed.card_id) return;
                navigation.navigate("JeroenPawsCard", {
                  cardId: parsed.card_id,
                  readOnly: true,
                });
              }}
            >
              <Text style={styles.cardMessageTitle}>
                {parsed.title || "Jeroen & Paws Card"}
              </Text>
              <Text style={styles.cardMessageBody}>
                {parsed.summary || "Tap to view the finished card."}
              </Text>
            </Pressable>
          ) : (
            <Text style={styles.messageText}>{parsed.text}</Text>
          )}
          <View style={styles.messageMeta}>
            <Text style={styles.messageTime}>{timeLabel}</Text>
            {isOwnMessage ? (
              <Text style={[styles.readStatus, { color: readColor }]}>
                {readLabel}
              </Text>
            ) : null}
          </View>
        </View>
      </View>
    );
  };

  const renderChatHeader = () => {
    if (!isOwner) return null;
    return (
      <View style={styles.chatHeaderRow}>
        <Pressable
          style={styles.backPill}
          onPress={() => setSelectedClientId(null)}
        >
          <Text style={styles.backText}>← Inbox</Text>
        </Pressable>
        <View>
          <Text style={styles.chatTitle}>Chat</Text>
          <Text style={styles.chatSubtitle}>
            {activeClient?.full_name || activeClient?.email || "Client"}
          </Text>
        </View>
      </View>
    );
  };

  const renderChat = () => (
    <View style={styles.chatContainer}>
      {renderChatHeader()}
      {loadingChat ? (
        <View style={styles.loadingState}>
          <ActivityIndicator size="small" color="#5d2fc5" />
          <Text style={styles.loadingText}>Loading chat…</Text>
        </View>
      ) : (
        <FlatList
          ref={listRef}
          data={messageItems}
          keyExtractor={(item) => item.id}
          renderItem={renderMessageItem}
          contentContainerStyle={styles.messageList}
          keyboardShouldPersistTaps="handled"
        />
      )}
      <View style={styles.inputWrapper}>
        {pendingImage ? (
          <View style={styles.previewRow}>
            <Image
              source={{ uri: pendingImage.previewUri || pendingImage.uri }}
              style={styles.previewImage}
            />
            <Pressable
              style={styles.previewRemove}
              onPress={() => setPendingImage(null)}
            >
              <Text style={styles.previewRemoveText}>✕</Text>
            </Pressable>
          </View>
        ) : null}
        <View style={styles.inputRow}>
          <Pressable style={styles.attachButton} onPress={handlePickImage}>
            <Text style={styles.attachIcon}>🖼️</Text>
          </Pressable>
          <TextInput
            style={styles.input}
            placeholder="Write a message"
            value={inputValue}
            onChangeText={setInputValue}
            multiline
          />
          <Pressable
            style={({ pressed }) => [
              styles.sendButton,
              pressed && styles.cardPressed,
              (sending || (!inputValue.trim() && !pendingImage)) &&
                styles.sendButtonDisabled,
            ]}
            onPress={handleSend}
            disabled={sending || (!inputValue.trim() && !pendingImage)}
          >
            <Text style={styles.sendButtonText}>Send</Text>
          </Pressable>
        </View>
        {imagePickerError ? (
          <Text style={styles.errorText}>{imagePickerError}</Text>
        ) : null}
      </View>
    </View>
  );

  if (isOwner && !selectedClientId) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.keyboardAvoid}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.container}>
            <ScreenHeader title="Inbox" />
            {loadingInbox ? (
              <View style={styles.loadingState}>
                <ActivityIndicator size="small" color="#5d2fc5" />
                <Text style={styles.loadingText}>Loading messages…</Text>
              </View>
            ) : inboxItems.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No conversations yet.</Text>
              </View>
            ) : (
              <FlatList
                data={inboxItems}
                keyExtractor={(item) => item.id}
                renderItem={renderInboxItem}
                contentContainerStyle={styles.inboxList}
              />
            )}
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
      >
        {renderChat()}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f6f3fb",
  },
  keyboardAvoid: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  inboxList: {
    paddingBottom: 24,
  },
  inboxCard: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#ebe4f7",
    padding: 16,
    marginBottom: 12,
  },
  cardPressed: {
    opacity: 0.7,
  },
  inboxHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  inboxName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2b1a4b",
    marginBottom: 6,
  },
  inboxPreview: {
    fontSize: 13,
    color: "#6c5a92",
    maxWidth: 220,
  },
  inboxMeta: {
    alignItems: "flex-end",
  },
  inboxTime: {
    fontSize: 12,
    color: "#8b7ca8",
    marginBottom: 8,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#5d2fc5",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyText: {
    color: "#6c5a92",
  },
  chatContainer: {
    flex: 1,
  },
  chatHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    gap: 12,
  },
  backPill: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "#e7def7",
  },
  backText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#46315f",
  },
  chatTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2b1a4b",
  },
  chatSubtitle: {
    fontSize: 12,
    color: "#6c5a92",
    marginTop: 2,
  },
  messageList: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  messageRow: {
    marginBottom: 12,
    flexDirection: "row",
  },
  messageRowOwn: {
    justifyContent: "flex-end",
  },
  messageRowOther: {
    justifyContent: "flex-start",
  },
  messageBubble: {
    maxWidth: "78%",
    padding: 12,
    borderRadius: 16,
  },
  messageBubbleOwn: {
    backgroundColor: "#e9e4ff",
    borderTopRightRadius: 4,
  },
  messageBubbleOther: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 4,
    borderWidth: 1,
    borderColor: "#e7def7",
  },
  messageText: {
    fontSize: 14,
    color: "#2b1a4b",
  },
  messageMeta: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: 6,
    gap: 6,
  },
  messageTime: {
    fontSize: 11,
    color: "#8b7ca8",
  },
  readStatus: {
    fontSize: 12,
    fontWeight: "700",
  },
  dateRow: {
    alignItems: "center",
    marginVertical: 16,
  },
  dateText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#7c6ba0",
    backgroundColor: "#efe9fb",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  inputWrapper: {
    borderTopWidth: 1,
    borderTopColor: "#e7def7",
    backgroundColor: "#ffffff",
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 12,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
  },
  attachButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f1ecfb",
    alignItems: "center",
    justifyContent: "center",
  },
  attachIcon: {
    fontSize: 18,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#e7def7",
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    maxHeight: 90,
    backgroundColor: "#ffffff",
  },
  sendButton: {
    backgroundColor: "#5d2fc5",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 18,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 13,
  },
  previewRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  previewImage: {
    width: 64,
    height: 64,
    borderRadius: 12,
  },
  previewRemove: {
    marginLeft: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#f3eefb",
    alignItems: "center",
    justifyContent: "center",
  },
  previewRemoveText: {
    fontSize: 12,
    color: "#5d2fc5",
  },
  messageImage: {
    width: 220,
    height: 160,
    borderRadius: 12,
  },
  cardMessage: {
    gap: 6,
  },
  cardMessageTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#2b1a4b",
  },
  cardMessageBody: {
    fontSize: 12,
    color: "#6c5a92",
  },
  loadingState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 30,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 12,
    color: "#6c5a92",
  },
  errorText: {
    marginTop: 6,
    fontSize: 12,
    color: "#c0392b",
  },
});

export default MessagesScreen;