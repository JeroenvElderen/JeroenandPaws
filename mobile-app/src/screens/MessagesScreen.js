import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Keyboard,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { supabase } from "../api/supabaseClient";
import ScreenHeader from "../components/ScreenHeader";
import { useSession } from "../context/SessionContext";

const OWNER_EMAIL = "jeroen@jeroenandpaws.com";
const OWNER_CLIENT_ID = "94cab38a-1f08-498b-8efa-7ed8f561926f";

const formatMessageTime = (value) => {
  if (!value) return "";
  return new Date(value).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const parseMessagePayload = (message) => {
  const raw = message?.body || message?.message || "";
  if (typeof raw !== "string") {
    return { type: "text", text: String(raw || "") };
  }

  try {
    const parsed = JSON.parse(raw);
    if (parsed?.type === "jeroen_paws_card") {
      return {
        type: "card",
        cardId: parsed.card_id,
        title: parsed.title || "Jeroen & Paws card",
        summary: parsed.summary || "",
        petsLabel: parsed.pets_label || "",
      };
    }
  } catch (error) {
    // Ignore JSON parse errors and treat as text.
  }

  return { type: "text", text: raw };
};

const sortMessagesByTime = (messages) =>
  [...messages].sort(
    (a, b) =>
      new Date(a.created_at || 0).getTime() -
      new Date(b.created_at || 0).getTime()
  );

const MessagesScreen = ({ navigation, route }) => {
  const { session } = useSession();
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [threads, setThreads] = useState([]);
  const [lastReadAt, setLastReadAt] = useState(null);
  const insets = useSafeAreaInsets();
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const isOwner =
    session?.email?.toLowerCase() === OWNER_EMAIL.toLowerCase();
  const [activeClientId, setActiveClientId] = useState(
    route?.params?.clientId || null
  );
  const [activeClientName, setActiveClientName] = useState(
    route?.params?.clientName || ""
  );

  const clientId = session?.id;
  const chatClientId = isOwner ? activeClientId : clientId;
  const lastReadStorageKey = isOwner
    ? `messages:lastRead:${OWNER_CLIENT_ID}`
    : `messages:lastRead:${clientId || "unknown"}`;

  const formattedMessages = useMemo(
    () =>
      messages.map((message) => ({
        ...message,
        direction:
          message.sender === (isOwner ? "owner" : "client")
            ? "outgoing"
            : "incoming",
        payload: parseMessagePayload(message),
      })),
    [messages, isOwner]
  );

  const loadThreads = useCallback(async () => {
    if (!isOwner) return;
    if (!supabase) {
      setThreads([]);
      return;
    }

    try {
      const { data: clientData, error: clientError } = await supabase
        .from("clients")
        .select("id, full_name, email")
        .order("full_name", { ascending: true });

        if (clientError) {
        throw clientError;
      }

      const { data: messageData, error: messageError } = await supabase
        .from("messages")
        .select("client_id, body, sender, created_at")
        .order("created_at", { ascending: false });

        if (messageError) {
          throw messageError;
        }

      const latestByClient = new Map();
      (messageData || []).forEach((message) => {
        if (!message?.client_id) return;
        if (!latestByClient.has(message.client_id)) {
          latestByClient.set(message.client_id, message);
        }
      });

          const threadList = (clientData || [])
        .map((client) => {
          const message = latestByClient.get(client.id) || null;
          return {
            clientId: client.id,
            clientName:
              client.full_name || client.email || "Client conversation",
            email: client.email || "",
            lastMessage: message
              ? parseMessagePayload(message)
              : { type: "text", text: "Start a conversation" },
            lastMessageTime: message?.created_at || null,
          };
        })
        .sort((a, b) => {
          const timeA = a.lastMessageTime
            ? new Date(a.lastMessageTime).getTime()
            : 0;
          const timeB = b.lastMessageTime
            ? new Date(b.lastMessageTime).getTime()
            : 0;
          if (timeA !== timeB) {
            return timeB - timeA;
          }
        return a.clientName.localeCompare(b.clientName);
        });

      setThreads(threadList);
    } catch (loadError) {
      setError(loadError.message || "Unable to load conversations.");
    }
  }, [isOwner]);

  const loadMessages = useCallback(async () => {
    if (!chatClientId || !supabase) {
      setMessages([]);
      return;
    }

    try {
      const { data, error: loadError } = await supabase
        .from("messages")
        .select("*")
        .eq("client_id", chatClientId)
        .order("created_at", { ascending: true });

      if (loadError) {
        throw loadError;
      }
      setMessages(data || []);
    } catch (loadError) {
      setError(loadError.message || "Unable to load messages.");
    }
  }, [chatClientId]);

      const loadLastReadAt = useCallback(async () => {
    if (!chatClientId || !lastReadStorageKey) {
      setLastReadAt(null);
      return;
    }

    try {
      const raw = await AsyncStorage.getItem(lastReadStorageKey);
      const lastReadMap = raw ? JSON.parse(raw) : {};
      setLastReadAt(lastReadMap[chatClientId] || null);
    } catch (error) {
      setLastReadAt(null);
    }
  }, [chatClientId, lastReadStorageKey]);

  useFocusEffect(
    useCallback(() => {
      loadThreads();
    }, [loadThreads])
  );

  useFocusEffect(
    useCallback(() => {
      loadMessages();
      loadLastReadAt();
    }, [loadMessages, loadLastReadAt])
  );

  useEffect(() => {
    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showListener = Keyboard.addListener(showEvent, (event) => {
      setKeyboardHeight(event.endCoordinates?.height ?? 0);
    });
    const hideListener = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showListener.remove();
      hideListener.remove();
    };
  }, []);

  useEffect(() => {
    loadThreads();
  }, [loadThreads]);

  useEffect(() => {
    loadMessages();
    loadLastReadAt();
  }, [loadMessages, loadLastReadAt]);

  useEffect(() => {
    if (!chatClientId || !supabase) {
      return undefined;
    }

    const channel = supabase
      .channel(`client-messages-${chatClientId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `client_id=eq.${chatClientId}`,
        },
        (payload) => {
          setMessages((current) => {
            const exists = current.some(
              (message) => message.id === payload.new.id
            );
            if (exists) return current;
            return sortMessagesByTime([...current, payload.new]);
          });
          if (isOwner) {
            loadThreads();
          }
        }
      )
      .subscribe();

      const interval = setInterval(() => {
      loadMessages();
      if (isOwner) {
        loadThreads();
      }
    }, 10000);

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [chatClientId, isOwner, loadMessages, loadThreads]);

  useEffect(() => {
    const updateLastRead = async () => {
      if (!chatClientId || !lastReadStorageKey) return;
      const latestMessage = messages[messages.length - 1];
      if (!latestMessage?.created_at) return;

      try {
        const raw = await AsyncStorage.getItem(lastReadStorageKey);
        const lastReadMap = raw ? JSON.parse(raw) : {};
        lastReadMap[chatClientId] = latestMessage.created_at;
        await AsyncStorage.setItem(
          lastReadStorageKey,
          JSON.stringify(lastReadMap)
        );
        setLastReadAt(latestMessage.created_at);
      } catch (error) {
        // Ignore last-read update errors.
      }
    };

    updateLastRead();
  }, [chatClientId, lastReadStorageKey, messages]);

  useEffect(() => {
    const newClientId = route?.params?.clientId || null;
    const newClientName = route?.params?.clientName || "";
    setActiveClientId(newClientId);
    setActiveClientName(newClientName);
  }, [route?.params?.clientId, route?.params?.clientName]);

  const handleSend = async () => {
    const trimmed = messageText.trim();
    if (!trimmed || !chatClientId || !supabase) {
      return;
    }

    setStatus("sending");
    setError("");

    try {
      const { data: newMessage, error: insertError } = await supabase
        .from("messages")
        .insert({
          client_id: chatClientId,
          sender: isOwner ? "owner" : "client",
          body: trimmed,
        })
        .select("*")
        .single();

      if (insertError) {
        throw insertError;
      }

      if (newMessage) {
        setMessages((current) => {
          const exists = current.some(
            (message) => message.id === newMessage.id
          );
          if (exists) return current;
          return sortMessagesByTime([...current, newMessage]);
        });
      }

      setMessageText("");
      setStatus("idle");
    } catch (sendError) {
      setError(sendError.message || "Unable to send your message.");
      setStatus("error");
    }
  };

  if (isOwner && !chatClientId) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <ScreenHeader title="Inbox" />
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          {threads.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>
                No conversations yet.
              </Text>
            </View>
          ) : (
            <ScrollView contentContainerStyle={styles.threads}>
              {threads.map((thread) => (
                <Pressable
                  key={thread.clientId}
                  style={styles.threadCard}
                  onPress={() =>
                    navigation.navigate("Messages", {
                      clientId: thread.clientId,
                      clientName: thread.clientName,
                    })
                  }
                >
                  <View style={styles.threadAvatar}>
                    <Text style={styles.threadAvatarText}>
                      {thread.clientName.slice(0, 1).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.threadBody}>
                    <Text style={styles.threadName}>{thread.clientName}</Text>
                    {thread.email ? (
                      <Text style={styles.threadMeta}>{thread.email}</Text>
                    ) : null}
                    <Text style={styles.threadPreview} numberOfLines={2}>
                      {thread.lastMessage.type === "card"
                        ? "Jeroen & Paws card shared"
                        : thread.lastMessage.text}
                    </Text>
                  </View>
                  <View style={styles.threadTime}>
                    <Text style={styles.threadTimeText}>
                      {formatMessageTime(thread.lastMessageTime)}
                    </Text>
                    <Text style={styles.threadChevron}>›</Text>
                  </View>
                </Pressable>
              ))}
            </ScrollView>
          )}
        </View>
      </SafeAreaView>
    );
  }

  const keyboardOffset = Math.max(0, keyboardHeight - insets.bottom);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ScreenHeader
          title={isOwner ? activeClientName || "Client chat" : "Messages"}
          onBack={
            isOwner
              ? () => {
                  navigation.setParams({ clientId: null, clientName: null });
                  setActiveClientId(null);
                  setActiveClientName("");
                }
              : undefined
          }
        />
        <ScrollView
          contentContainerStyle={styles.messages}
          keyboardShouldPersistTaps="handled"
        >
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          {formattedMessages.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>
                No messages yet. Start a conversation below.
              </Text>
            </View>
          ) : (
            formattedMessages.map((message) => (
              <View
                key={message.id || message.created_at}
                style={[
                  styles.messageBubble,
                  message.direction === "outgoing"
                    ? styles.messageOutgoing
                    : styles.messageIncoming,
                ]}
              >
                {message.payload.type === "card" ? (
                  <View>
                    <Text style={styles.cardTitle}>
                      {message.payload.title}
                    </Text>
                    {message.payload.petsLabel ? (
                      <Text style={styles.cardMeta}>
                        {message.payload.petsLabel}
                      </Text>
                    ) : null}
                    {message.payload.summary ? (
                      <Text style={styles.cardMeta}>
                        {message.payload.summary}
                      </Text>
                    ) : null}
                    {message.payload.cardId ? (
                      <Pressable
                        style={styles.cardButton}
                        onPress={() =>
                          navigation.navigate("JeroenPawsCard", {
                            cardId: message.payload.cardId,
                            readOnly: true,
                          })
                        }
                      >
                        <Text style={styles.cardButtonText}>
                          View Jeroen & Paws card
                        </Text>
                      </Pressable>
                    ) : null}
                  </View>
                ) : (
                  <Text style={styles.messageText}>
                    {message.payload.text}
                  </Text>
                )}
                <View style={styles.messageMeta}>
                  <Text style={styles.messageTime}>
                    {formatMessageTime(message.created_at)}
                  </Text>
                  {message.direction === "outgoing" ? (
                    <Text style={styles.messageReadIcon}>
                      {lastReadAt &&
                      new Date(message.created_at) <= new Date(lastReadAt)
                        ? "✓✓"
                        : "✓"}
                    </Text>
                  ) : null}
                </View>
              </View>
            ))
          )}
        </ScrollView>
        <View
          style={[
            styles.inputContainer,
            {
              paddingBottom: Math.max(insets.bottom, 12),
              transform: [{ translateY: -keyboardOffset }],
            },
          ]}
        >
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="Write a message"
              value={messageText}
              onChangeText={setMessageText}
              multiline
            />
            <Pressable
              style={[
                styles.sendButton,
                status === "sending" && styles.sendButtonDisabled,
              ]}
              onPress={handleSend}
              disabled={status === "sending"}
            >
              <Text style={styles.sendButtonText}>Send</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f6f3fb",
  },
  container: {
    flex: 1,
    padding: 20,
    paddingBottom: 0,
    backgroundColor: "#f6f3fb",
  },
  threads: {
    paddingBottom: 0,
  },
  threadCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#ebe4f7",
    marginBottom: 12,
    gap: 12,
  },
  threadAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#efe9fb",
    alignItems: "center",
    justifyContent: "center",
  },
  threadAvatarText: {
    fontWeight: "700",
    color: "#5d2fc5",
  },
  threadBody: {
    flex: 1,
  },
  threadName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#2b1a4b",
  },
  threadMeta: {
    fontSize: 12,
    color: "#7b6a9f",
    marginTop: 2,
  },
  threadPreview: {
    fontSize: 13,
    color: "#4a3b63",
    marginTop: 6,
  },
  threadTime: {
    alignItems: "flex-end",
  },
  threadTimeText: {
    fontSize: 11,
    color: "#6c5a92",
  },
  threadChevron: {
    fontSize: 18,
    color: "#a194bb",
    marginTop: 6,
  },
  emptyCard: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#ebe4f7",
  },
  emptyText: {
    fontSize: 14,
    color: "#7b6a9f",
  },
  messages: {
    flexGrow: 1,
    paddingBottom: 0,
  },
  messageBubble: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#ebe4f7",
    marginBottom: 0,
    maxWidth: "80%",
  },
  messageIncoming: {
    alignSelf: "flex-start",
    backgroundColor: "#ffffff",
  },
  messageOutgoing: {
    alignSelf: "flex-end",
    backgroundColor: "#efe9fb",
  },
  messageText: {
    fontSize: 14,
    color: "#2b1a4b",
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#2b1a4b",
    marginBottom: 6,
  },
  cardMeta: {
    fontSize: 12,
    color: "#6c5a92",
    marginBottom: 6,
  },
  cardButton: {
    marginTop: 8,
    backgroundColor: "#2f63d6",
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: "center",
  },
  cardButtonText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#ffffff",
  },
  messageTime: {
    fontSize: 11,
    color: "#6c5a92",
    textAlign: "right",
  },
  messageMeta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 6,
  },
  messageReadIcon: {
    fontSize: 11,
    color: "#6c5a92",
  },
  inputContainer: {
    backgroundColor: "transparent",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#ebe4f7",
    padding: 10,
    gap: 8,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    fontSize: 14,
    color: "#2b1a4b",
  },
  sendButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: "#6c3ad6",
  },
  sendButtonDisabled: {
    opacity: 0.6,
  },
  sendButtonText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 13,
  },
  errorText: {
    color: "#b42318",
    fontSize: 13,
    marginBottom: 12,
  },
});

export default MessagesScreen;