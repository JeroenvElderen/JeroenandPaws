import { useEffect, useState } from "react";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { supabase } from "../api/supabaseClient";
import ScreenHeader from "../components/ScreenHeader";
import { useSession } from "../context/SessionContext";

const SettingsScreen = ({ navigation }) => {
  const { session, setSession } = useSession();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(false);
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [keepMessages, setKeepMessages] = useState(false);
  const [status, setStatus] = useState("idle");

  useEffect(() => {
    const preferences =
      session?.user?.user_metadata?.notification_preferences ||
      session?.client?.notification_preferences;
    if (!preferences) {
      return;
    }
    setNotificationsEnabled(Boolean(preferences.push));
    setEmailUpdates(Boolean(preferences.email));
    setSmsAlerts(Boolean(preferences.sms));
  }, [session?.user?.user_metadata, session?.client?.notification_preferences]);

  useEffect(() => {
    const keepPreference =
      session?.client?.keep_messages ||
      session?.user?.user_metadata?.keep_messages ||
      false;
    setKeepMessages(Boolean(keepPreference));
  }, [session?.client?.keep_messages, session?.user?.user_metadata]);

  const updatePreferences = async (next) => {
    if (!supabase || !session?.user) {
      return;
    }
    setStatus("saving");
    try {
      const [{ error: authError }, { error: clientError }] =
        await Promise.all([
          supabase.auth.updateUser({
            data: {
              notification_preferences: next,
            },
          }),
          supabase
            .from("clients")
            .update({ notification_preferences: next })
            .eq("id", session.user.id),
        ]);
      if (authError || clientError) {
        throw authError || clientError;
      }
      setSession((current) =>
        current
          ? {
              ...current,
              user: {
                ...current.user,
                user_metadata: {
                  ...current.user.user_metadata,
                  notification_preferences: next,
                },
              },
              client: {
                ...(current.client || {}),
                notification_preferences: next,
              },
            }
          : current
      );
      setStatus("idle");
    } catch (updateError) {
      console.error("Failed to update preferences", updateError);
      setStatus("error");
    }
  };

  const updateMessageRetention = async (value) => {
    if (!supabase || !session?.user) {
      return;
    }
    setStatus("saving");
    try {
      const [{ error: authError }, { error: clientError }] =
        await Promise.all([
          supabase.auth.updateUser({
            data: {
              keep_messages: value,
            },
          }),
          supabase
            .from("clients")
            .update({ keep_messages: value })
            .eq("id", session.user.id),
        ]);
      if (authError || clientError) {
        throw authError || clientError;
      }
      setSession((current) =>
        current
          ? {
              ...current,
              user: {
                ...current.user,
                user_metadata: {
                  ...current.user.user_metadata,
                  keep_messages: value,
                },
              },
              client: {
                ...(current.client || {}),
                keep_messages: value,
              },
            }
          : current
      );
      setStatus("idle");
    } catch (updateError) {
      console.error("Failed to update message retention", updateError);
      setStatus("error");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <ScreenHeader title="Settings" onBack={() => navigation.goBack()} />
        <View style={styles.card}>
          <View style={styles.row}>
            <View>
              <Text style={styles.label}>Push notifications</Text>
              <Text style={styles.helper}>Booking reminders and updates.</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={(value) => {
                setNotificationsEnabled(value);
                updatePreferences({
                  push: value,
                  email: emailUpdates,
                  sms: smsAlerts,
                });
              }}
              trackColor={{ false: "#e6def6", true: "#bda8f0" }}
              thumbColor={notificationsEnabled ? "#6c3ad6" : "#f2ecfb"}
            />
          </View>
          <View style={styles.row}>
            <View>
              <Text style={styles.label}>Email summaries</Text>
              <Text style={styles.helper}>Weekly booking overview.</Text>
            </View>
            <Switch
              value={emailUpdates}
              onValueChange={(value) => {
                setEmailUpdates(value);
                updatePreferences({
                  push: notificationsEnabled,
                  email: value,
                  sms: smsAlerts,
                });
              }}
              trackColor={{ false: "#e6def6", true: "#bda8f0" }}
              thumbColor={emailUpdates ? "#6c3ad6" : "#f2ecfb"}
            />
          </View>
          <View style={styles.row}>
            <View>
              <Text style={styles.label}>SMS alerts</Text>
              <Text style={styles.helper}>Last-minute schedule changes.</Text>
            </View>
            <Switch
              value={smsAlerts}
              onValueChange={(value) => {
                setSmsAlerts(value);
                updatePreferences({
                  push: notificationsEnabled,
                  email: emailUpdates,
                  sms: value,
                });
              }}
              trackColor={{ false: "#e6def6", true: "#bda8f0" }}
              thumbColor={smsAlerts ? "#6c3ad6" : "#f2ecfb"}
            />
          </View>
          {status === "saving" ? (
            <Text style={styles.helperText}>Saving preferences…</Text>
          ) : null}
        </View>

        <Text style={styles.sectionTitle}>Messages</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowCopy}>
              <Text style={styles.label}>Never delete messages</Text>
              <Text style={styles.helper}>
                Keep your chat history instead of auto-deleting after a week.
              </Text>
            </View>
            <Switch
              value={keepMessages}
              onValueChange={(value) => {
                setKeepMessages(value);
                updateMessageRetention(value);
              }}
              trackColor={{ false: "#e6def6", true: "#bda8f0" }}
              thumbColor={keepMessages ? "#6c3ad6" : "#f2ecfb"}
            />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Payment methods</Text>
        <View style={styles.card}>
          <Text style={styles.label}>Primary card</Text>
          <Text style={styles.value}>Manage your card on your next invoice.</Text>
          <Pressable
            style={styles.button}
            onPress={() => navigation.navigate("PaymentMethods")}
          >
            <Text style={styles.buttonText}>Update payment method</Text>
          </Pressable>
          <View style={styles.divider} />
          <Text style={styles.label}>Billing settings</Text>
          <Text style={styles.value}>Invoices go to {session?.email || "your email"}.</Text>
          <Pressable
            style={styles.button}
            onPress={() => navigation.navigate("PaymentMethods")}
          >
            <Text style={styles.buttonText}>Update billing details</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f6f3fb",
  },
  container: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 32,
    backgroundColor: "#f6f3fb",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#ebe4f7",
    marginBottom: 16,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f2ecfb",
  },
  rowCopy: {
    flex: 1,
    paddingRight: 12,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    color: "#2b1a4b",
  },
  helper: {
    fontSize: 12,
    color: "#7b6a9f",
    marginTop: 4,
  },
  helperText: {
    fontSize: 12,
    color: "#6c5a92",
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#2b1a4b",
    marginBottom: 12,
  },
  value: {
    fontSize: 13,
    color: "#6c5a92",
    marginBottom: 12,
  },
  button: {
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: "#efe9fb",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e6def6",
    marginBottom: 6,
  },
  buttonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#4a3a68",
  },
  divider: {
    height: 1,
    backgroundColor: "#f2ecfb",
    marginVertical: 12,
  },
});

export default SettingsScreen;