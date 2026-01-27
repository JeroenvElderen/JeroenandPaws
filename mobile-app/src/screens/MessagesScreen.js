import { useEffect, useMemo, useState } from "react";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { supabase } from "../api/supabaseClient";
import ScreenHeader from "../components/ScreenHeader";
import { useSession } from "../context/SessionContext";

const MessagesScreen = () => {
  const { session } = useSession();
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  const clientId = session?.id;

  const formattedMessages = useMemo(
    () =>
      messages.map((message) => ({
        ...message,
        direction: message.sender === "client" ? "outgoing" : "incoming",
      })),
    [messages]
  );

  useEffect(() => {
    let isMounted = true;

    const loadMessages = async () => {
      if (!clientId || !supabase) {
        setMessages([]);
        return;
      }

      try {
        const { data, error: loadError } = await supabase
          .from("messages")
          .select("*")
          .eq("client_id", clientId)
          .order("created_at", { ascending: true });

        if (!isMounted) return;
        if (loadError) {
          throw loadError;
        }
        setMessages(data || []);
      } catch (loadError) {
        if (!isMounted) return;
        setError(loadError.message || "Unable to load messages.");
      }
    };

    loadMessages();

    if (!clientId || !supabase) {
      return () => {
        isMounted = false;
      };
    }

    const channel = supabase
      .channel(`client-messages-${clientId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `client_id=eq.${clientId}`,
        },
        (payload) => {
          setMessages((current) => [...current, payload.new]);
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [clientId]);

  const handleSend = async () => {
    const trimmed = messageText.trim();
    if (!trimmed || !clientId || !supabase) {
      return;
    }

    setStatus("sending");
    setError("");

    try {
      const { error: insertError } = await supabase.from("messages").insert({
        client_id: clientId,
        sender: "client",
        body: trimmed,
      });

      if (insertError) {
        throw insertError;
      }

      setMessageText("");
      setStatus("idle");
    } catch (sendError) {
      setError(sendError.message || "Unable to send your message.");
      setStatus("error");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ScreenHeader title="Messages" />
        <ScrollView contentContainerStyle={styles.messages}>
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
                <Text style={styles.messageText}>
                  {message.body || message.message}
                </Text>
                <Text style={styles.messageTime}>
                  {message.created_at
                    ? new Date(message.created_at).toLocaleTimeString("en-GB", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : ""}
                </Text>
              </View>
            ))
          )}
        </ScrollView>
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
    paddingBottom: 16,
    backgroundColor: "#f6f3fb",
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
    paddingBottom: 24,
  },
  messageBubble: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#ebe4f7",
    marginBottom: 12,
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
  messageTime: {
    fontSize: 11,
    color: "#6c5a92",
    textAlign: "right",
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