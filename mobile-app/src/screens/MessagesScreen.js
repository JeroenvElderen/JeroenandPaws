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
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "../api/supabaseClient";
import { useSession } from "../context/SessionContext";
import { useTheme } from "../context/ThemeContext";
import { getTabBarStyle } from "../utils/tabBar";

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
    return "Photo attachment";
  }
  if (parsed.type === "jeroen_paws_card") {
    return parsed.title || "Jeroen & Paws Card";
  }
  return parsed.text || "";
};

const MessagesScreen = ({ navigation }) => {
  const { session, clientProfiles } = useSession();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const tabBarStyle = useMemo(() => getTabBarStyle(theme), [theme]);
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
  const isOwner = useMemo(() => {
    const normalizedEmail = session?.email?.toLowerCase();
    const ownerEmail = OWNER_EMAIL.toLowerCase();
    if (normalizedEmail && normalizedEmail === ownerEmail) {
      return true;
    }
    const sessionId = session?.id || session?.client?.id || session?.user?.id;
    return Boolean(sessionId && sessionId === OWNER_CLIENT_ID);
  }, [session?.client?.id, session?.email, session?.id, session?.user?.id]);

  const selfClientId = useMemo(() => {
    if (isOwner) {
      return OWNER_CLIENT_ID;
    }
    const clientId = session?.client?.id || null;
    if (!clientId || clientId === OWNER_CLIENT_ID) {
      return null;
    }
    return clientId;
  }, [isOwner, session?.client?.id]);

  useEffect(() => {
    if (!isOwner && selfClientId) {
      setSelectedClientId(selfClientId);
    }
  }, [isOwner, selfClientId]);

  const storageKey = useMemo(() => {
    if (!selfClientId) return null;
    return `messages:lastRead:${
      isOwner ? OWNER_CLIENT_ID : selfClientId
    }`;
  }, [isOwner, selfClientId]);

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
        .neq("client_id", OWNER_CLIENT_ID)
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

      const clientIds = Array.from(latestByClient.keys()).filter(
        (clientId) => clientId !== OWNER_CLIENT_ID
      );
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
      if (clientProfiles?.length) {
        clientLookup = clientProfiles.reduce((acc, client) => {
          if (!client?.id) return acc;
          if (!acc[client.id]) {
            acc[client.id] = client;
          }
          return acc;
        }, clientLookup);
      }
      
      const items = Array.from(latestByClient.values()).map((message) => ({
        ...message,
        unread: unreadClientIds.has(message.client_id),
      }));

      const dedupedMap = new Map();
      items.forEach((message) => {
        const email =
          clientLookup?.[message.client_id]?.email?.toLowerCase();
        const dedupeKey = email || message.client_id;
        const existing = dedupedMap.get(dedupeKey);
        if (!existing) {
          dedupedMap.set(dedupeKey, message);
          return;
        }
        const currentTime = new Date(message.created_at || 0).getTime();
        const existingTime = new Date(existing.created_at || 0).getTime();
        if (currentTime > existingTime) {
          dedupedMap.set(dedupeKey, message);
        }
      });

      const dedupedItems = Array.from(dedupedMap.values()).sort(
        (a, b) =>
          new Date(b.created_at || 0).getTime() -
          new Date(a.created_at || 0).getTime()
      );

      setClientMeta(clientLookup);
      setInboxItems(dedupedItems);
    } catch (error) {
      console.error("Failed to load inbox", error);
    } finally {
      setLoadingInbox(false);
    }
  }, [clientProfiles, isOwner, session?.email, storageKey]);

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
      if (isOwner && clientId === OWNER_CLIENT_ID) {
        setMessages([]);
        return;
      }
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
    [deleteOldMessages, isOwner, markMessagesRead, updateLastRead]
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
          setMessages((prev) => {
            if (prev.some((existing) => existing.id === message.id)) {
              return prev;
            }
            return [...prev, message];
          });
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

  const activeClientId = isOwner ? selectedClientId : selfClientId;
  const canSendMessage = isOwner
    ? Boolean(activeClientId && activeClientId !== OWNER_CLIENT_ID)
    : Boolean(
        selfClientId &&
          activeClientId === selfClientId &&
          activeClientId !== OWNER_CLIENT_ID
      );
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

  useLayoutEffect(() => {
    const parent = navigation.getParent();
    const parentState = parent?.getState?.();
    const tabParent =
      parentState?.type === "tab" ? parent : parent?.getParent();
    if (!tabParent) return undefined;

    tabParent.setOptions({
      tabBarStyle: { display: "none", height: 0 },
    });

    return () => {
      tabParent.setOptions({ tabBarStyle });
    };
  }, [navigation, tabBarStyle]);

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
    if (isOwner && clientId === OWNER_CLIENT_ID) return;
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
    if (!supabase || !canSendMessage || sending) return;
    const targetClientId = isOwner ? activeClientId : selfClientId;
    if (!targetClientId) {
      return;
    }
    if (targetClientId === OWNER_CLIENT_ID) {
      return;
    }
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
        client_id: targetClientId,
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
        <View style={styles.avatarGlow}>
          <View style={styles.avatarCircle}>
            <Ionicons
              name="person"
              size={18}
              color={theme.colors.textSecondary}
            />
          </View>
        </View>
        <View style={styles.inboxBody}>
          <View style={styles.inboxTopRow}>
            <Text style={styles.inboxName}>{name}</Text>
            <Text style={styles.inboxTime}>{timestamp}</Text>
          </View>
          <View style={styles.inboxBottomRow}>
            <Text style={styles.inboxPreview} numberOfLines={1}>
              {preview}
            </Text>
            {item.unread ? (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadBadgeText}>NEW</Text>
              </View>
            ) : null}
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
    const readColor = message.read_at
      ? isOwnMessage
        ? theme.colors.white
        : theme.colors.accent
      : theme.colors.textMuted;

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
                  returnTo: "Messages",
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
            <Text
              style={[
                styles.messageText,
                isOwnMessage && styles.messageTextOwn,
              ]}
            >
              {parsed.text}
            </Text>
          )}
          <View style={styles.messageMeta}>
            <Text
              style={[
                styles.messageTime,
                isOwnMessage && styles.messageTimeOwn,
              ]}
            >
              {timeLabel}
            </Text>
            {isOwnMessage ? (
              <View style={styles.readStatusStack}>
                <Text style={[styles.readStatus, { color: readColor }]}>
                  ✓
                </Text>
                <Text
                  style={[
                    styles.readStatus,
                    styles.readStatusOverlap,
                    { color: readColor },
                  ]}
                >
                  ✓
                </Text>
              </View>
            ) : null}
          </View>
        </View>
      </View>
    );
  };

  const renderChatHeader = () => {
    return (
      <View style={styles.chatHeader}>
        <Pressable
          style={styles.backButton}
          onPress={() => {
            if (isOwner) {
              setSelectedClientId(null);
              return;
            }
            navigation.navigate("Home");
          }}
        >
          <Text style={styles.backButtonIcon}>←</Text>
        </Pressable>
        <View style={styles.headerAvatar}>
          <Ionicons
            name="person"
            size={20}
            color={theme.colors.textSecondary}
          />
        </View>
        <View style={styles.chatHeaderText}>
          <Text style={styles.chatTitle}>
            {activeClient?.full_name || "Chat"}
          </Text>
          <View style={styles.statusRow}>
            <View style={styles.statusDot} />
            <Text style={styles.chatSubtitle}>
              {activeClient?.email || "Active now"}
            </Text>
          </View>
        </View>
        {isOwner && activeClientId ? (
          <Pressable
            style={styles.headerAction}
            onPress={() =>
              navigation.navigate("Profile", {
                screen: "ProfileOverview",
                params: { clientId: activeClientId, returnTo: "Messages" },
              })
            }
          >
            <Ionicons
              name="person-circle"
              size={28}
              color={theme.colors.success}
            />
          </Pressable>
        ) : (
          <View style={styles.headerSpacer} />
        )}
      </View>
    );
  };

  const renderInboxHeader = () => {
    return (
      <View style={styles.inboxHeader}>
        <Pressable
          style={styles.backButton}
          onPress={() => navigation.navigate("Home")}
        >
          <Text style={styles.backButtonIcon}>←</Text>
        </Pressable>
        <View style={styles.inboxHeaderText}>
          <Text style={styles.inboxHeaderTitle}>Messages</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>
    );
  };

  const renderChat = () => (
    <View style={styles.chatContainer}>
      {renderChatHeader()}
      {loadingChat ? (
        <View style={styles.loadingState}>
          <ActivityIndicator size="small" color={theme.colors.accent} />
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
            <Ionicons name="image" size={20} color={theme.colors.textMuted} />
          </Pressable>
          <TextInput
            style={styles.input}
            placeholder="Message"
            value={inputValue}
            onChangeText={setInputValue}
            multiline
            placeholderTextColor={theme.colors.textMuted}
          />
          <Pressable
            style={({ pressed }) => [
              styles.sendButton,
              pressed && styles.cardPressed,
              (sending ||
                !canSendMessage ||
                (!inputValue.trim() && !pendingImage)) &&
                styles.sendButtonDisabled,
            ]}
            onPress={handleSend}
            disabled={
              sending || !canSendMessage || (!inputValue.trim() && !pendingImage)
            }
          >
            <Ionicons name="send" size={18} color={theme.colors.white} />
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
            {renderInboxHeader()}
            {loadingInbox ? (
              <View style={styles.loadingState}>
                <ActivityIndicator size="small" color={theme.colors.accent} />
                <Text style={styles.loadingText}>Loading messages…</Text>
              </View>
            ) : inboxItems.length === 0 ? (
              <View style={styles.emptyState}>
                <View style={styles.emptyIcon}>
                  <Ionicons
                    name="chatbubbles"
                    size={24}
                    color={theme.colors.accent}
                  />
                </View>
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
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        {renderChat()}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const createStyles = (theme) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    keyboardAvoid: {
      flex: 1,
    },
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    inboxList: {
      paddingHorizontal: theme.spacing.md,
      paddingBottom: theme.spacing.lg,
      paddingTop: theme.spacing.sm,
    },
    inboxCard: {
      flexDirection: "row",
      alignItems: "center",
      padding: theme.spacing.md,
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.surface,
      marginBottom: theme.spacing.sm,
      shadowColor: theme.shadow.soft.shadowColor,
      shadowOpacity: 0.12,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 6 },
      elevation: 3,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    cardPressed: {
      opacity: 0.7,
    },
    inboxName: {
      fontSize: theme.typography.body.fontSize,
      fontWeight: "700",
      color: theme.colors.textPrimary,
    },
    inboxPreview: {
      fontSize: theme.typography.caption.fontSize,
      color: theme.colors.textSecondary,
      flex: 1,
      marginRight: theme.spacing.sm,
    },
    avatarGlow: {
      width: 50,
      height: 50,
      borderRadius: 25,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.surfaceAccent,
      marginRight: theme.spacing.md,
      shadowColor: theme.colors.accent,
      shadowOpacity: 0.22,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 6 },
      elevation: 4,
    },
    avatarCircle: {
      width: 38,
      height: 38,
      borderRadius: 19,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.surface,
    },
    inboxBody: {
      flex: 1,
    },
    inboxTopRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 4,
    },
    inboxBottomRow: {
      flexDirection: "row",
      alignItems: "center",
    },
    inboxMeta: {
      alignItems: "flex-end",
    },
    inboxTime: {
      fontSize: theme.typography.caption.fontSize,
      color: theme.colors.textMuted,
    },
    unreadDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: theme.colors.accent,
    },
    unreadBadge: {
      minWidth: 36,
      height: 22,
      borderRadius: 11,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.accent,
      paddingHorizontal: theme.spacing.xs,
    },
    unreadBadgeText: {
      fontSize: 10,
      fontWeight: "700",
      color: theme.colors.white,
      letterSpacing: 0.5,
    },
    emptyState: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: theme.spacing.xxl,
      paddingHorizontal: theme.spacing.lg,
    },
    emptyIcon: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: theme.colors.surfaceAccent,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: theme.spacing.md,
      shadowColor: theme.colors.accent,
      shadowOpacity: 0.2,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 6 },
      elevation: 4,
    },
    emptyText: {
      color: theme.colors.textSecondary,
      fontSize: theme.typography.body.fontSize,
      fontWeight: "700",
      marginBottom: theme.spacing.xs,
    },
    emptySubtext: {
      color: theme.colors.textMuted,
      fontSize: theme.typography.caption.fontSize,
      textAlign: "center",
    },
    chatContainer: {
      flex: 1,
      backgroundColor: theme.colors.surfaceElevated,
    },
    chatHeader: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      shadowColor: theme.shadow.soft.shadowColor,
      shadowOpacity: 0.08,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 6 },
      elevation: 2,
    },
    inboxHeader: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      shadowColor: theme.shadow.soft.shadowColor,
      shadowOpacity: 0.08,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 6 },
      elevation: 2,
    },
    backButton: {
      width: 38,
      height: 38,
      borderRadius: 19,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.surfaceAccent,
      borderWidth: 1,
      borderColor: theme.colors.borderStrong,
    },
    backButtonIcon: {
      fontSize: 18,
      color: theme.colors.textPrimary,
    },
    chatHeaderText: {
      flex: 1,
      marginLeft: theme.spacing.sm,
    },
    headerAvatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.surfaceAccent,
      marginLeft: theme.spacing.sm,
    },
    headerSpacer: {
      width: 38,
    },
    headerAction: {
      width: 38,
      height: 38,
      borderRadius: 19,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.surfaceAccent,
      borderWidth: 1,
      borderColor: theme.colors.borderStrong,
    },
    chatTitle: {
      fontSize: theme.typography.headline.fontSize,
      fontWeight: "700",
      color: theme.colors.textPrimary,
    },
    chatSubtitle: {
      fontSize: theme.typography.caption.fontSize,
      color: theme.colors.textSecondary,
      marginLeft: theme.spacing.xs,
    },
    statusRow: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 4,
    },
    statusDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: theme.colors.success,
    },
    inboxHeaderTitle: {
      fontSize: theme.typography.headline.fontSize,
      fontWeight: "700",
      color: theme.colors.textPrimary,
    },
    inboxHeaderText: {
      flex: 1,
      alignItems: "center",
    },
    inboxHeaderSubtitle: {
      fontSize: theme.typography.caption.fontSize,
      color: theme.colors.textMuted,
      marginTop: 2,
    },
    messageList: {
      paddingHorizontal: theme.spacing.md,
      paddingBottom: theme.spacing.md,
      paddingTop: theme.spacing.sm,
    },
    messageRow: {
      marginBottom: theme.spacing.sm,
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
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.radius.lg,
      shadowColor: theme.shadow.soft.shadowColor,
      shadowOpacity: 0.16,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 6 },
      elevation: 3,
    },
    messageBubbleOwn: {
      backgroundColor: theme.colors.accent,
      borderTopRightRadius: 10,
      borderBottomRightRadius: 4,
    },
    messageBubbleOther: {
      backgroundColor: theme.colors.surface,
      borderTopLeftRadius: 10,
      borderBottomLeftRadius: 4,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    messageText: {
      fontSize: theme.typography.body.fontSize,
      color: theme.colors.textPrimary,
    },
    messageTextOwn: {
      color: theme.colors.white,
    },
    messageMeta: {
      flexDirection: "row",
      justifyContent: "flex-end",
      alignItems: "center",
      marginTop: 6,
      gap: theme.spacing.xs,
    },
    messageTime: {
      fontSize: 11,
      color: theme.colors.textMuted,
    },
    messageTimeOwn: {
      color: theme.colors.white,
    },
    readStatus: {
      fontSize: 12,
      fontWeight: "700",
    },
    readStatusStack: {
      flexDirection: "row",
      alignItems: "center",
    },
    readStatusOverlap: {
      marginLeft: -6,
    },
    dateRow: {
      alignItems: "center",
      marginVertical: theme.spacing.md,
    },
    dateText: {
      fontSize: theme.typography.caption.fontSize,
      fontWeight: "600",
      color: theme.colors.textSecondary,
      backgroundColor: theme.colors.surfaceAccent,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 4,
      borderRadius: theme.radius.md,
    },
    inputWrapper: {
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      paddingHorizontal: theme.spacing.md,
      paddingTop: theme.spacing.sm,
      paddingBottom: theme.spacing.lg,
    },
    inputRow: {
      flexDirection: "row",
      alignItems: "flex-end",
      gap: theme.spacing.xs,
    },
    attachButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: theme.colors.surfaceAccent,
      alignItems: "center",
      justifyContent: "center",
    },
    input: {
      flex: 1,
      borderWidth: 1,
      borderColor: theme.colors.borderStrong,
      borderRadius: theme.radius.lg,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      fontSize: theme.typography.body.fontSize,
      maxHeight: 90,
      backgroundColor: theme.colors.surfaceElevated,
      color: theme.colors.textPrimary,
    },
    sendButton: {
      backgroundColor: theme.colors.accent,
      width: 42,
      height: 42,
      borderRadius: 21,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: theme.colors.accent,
      shadowOpacity: 0.3,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 6 },
      elevation: 4,
    },
    sendButtonDisabled: {
      opacity: 0.5,
    },
    sendButtonText: {
      color: theme.colors.white,
      fontWeight: "700",
      fontSize: theme.typography.caption.fontSize,
    },
    previewRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: theme.spacing.xs,
    },
    previewImage: {
      width: 64,
      height: 64,
      borderRadius: theme.radius.md,
    },
    previewRemove: {
      marginLeft: theme.spacing.xs,
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: theme.colors.surfaceAccent,
      alignItems: "center",
      justifyContent: "center",
    },
    previewRemoveText: {
      fontSize: theme.typography.caption.fontSize,
      color: theme.colors.textPrimary,
    },
    messageImage: {
      width: 220,
      height: 160,
      borderRadius: theme.radius.md,
    },
    cardMessage: {
      gap: theme.spacing.xs,
    },
    cardMessageTitle: {
      fontSize: theme.typography.body.fontSize,
      fontWeight: "700",
      color: theme.colors.textPrimary,
    },
    cardMessageBody: {
      fontSize: theme.typography.caption.fontSize,
      color: theme.colors.textSecondary,
    },
    loadingState: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: theme.spacing.xxl,
    },
    loadingText: {
      marginTop: theme.spacing.xs,
      fontSize: theme.typography.caption.fontSize,
      color: theme.colors.textSecondary,
    },
    errorText: {
      marginTop: theme.spacing.xs,
      fontSize: theme.typography.caption.fontSize,
      color: theme.colors.danger,
    },
  });

export default MessagesScreen;
