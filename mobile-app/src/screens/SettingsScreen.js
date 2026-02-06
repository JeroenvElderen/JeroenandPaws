import { useEffect, useMemo, useState } from "react";
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
import { useTheme } from "../context/ThemeContext";
import { THEME_MODES } from "../theme/theme";

const SettingsScreen = ({ navigation }) => {
  const { theme, mode, setThemeMode } = useTheme();
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
     setStatus("idle");
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
    } catch (updateError) {
      console.error("Failed to update preferences", updateError);
      setStatus("error");
    }
  };

  const updateMessageRetention = async (value) => {
    if (!supabase || !session?.user) {
      return;
    }
    setStatus("idle");
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
    } catch (updateError) {
      console.error("Failed to update message retention", updateError);
      setStatus("error");
    }
  };

  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <ScreenHeader title="Settings" onBack={() => navigation.goBack()} />
        <Text style={styles.sectionTitle}>Appearance</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowCopy}>
              <Text style={styles.label}>Dark theme</Text>
              <Text style={styles.helper}>
                Switch between light and dark mode.
              </Text>
            </View>
            <Switch
              value={mode === THEME_MODES.dark}
              onValueChange={(value) =>
                setThemeMode(value ? THEME_MODES.dark : THEME_MODES.light)
              }
              trackColor={{
                false: theme.colors.surfaceElevated,
                true: theme.colors.accent,
              }}
              thumbColor={
                mode === THEME_MODES.dark
                  ? theme.colors.textPrimary
                  : theme.colors.textMuted
              }
            />
          </View>
        </View>
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
                setSession((current) =>
                  current
                    ? {
                        ...current,
                        user: {
                          ...current.user,
                          user_metadata: {
                            ...current.user.user_metadata,
                            notification_preferences: {
                              push: value,
                              email: emailUpdates,
                              sms: smsAlerts,
                            },
                          },
                        },
                        client: {
                          ...(current.client || {}),
                          notification_preferences: {
                            push: value,
                            email: emailUpdates,
                            sms: smsAlerts,
                          },
                        },
                      }
                    : current
                );
                void updatePreferences({
                  push: value,
                  email: emailUpdates,
                  sms: smsAlerts,
                });
              }}
              trackColor={{
                false: theme.colors.surfaceElevated,
                true: theme.colors.accent,
              }}
              thumbColor={
                notificationsEnabled
                  ? theme.colors.textPrimary
                  : theme.colors.textMuted
              }
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
                setSession((current) =>
                  current
                    ? {
                        ...current,
                        user: {
                          ...current.user,
                          user_metadata: {
                            ...current.user.user_metadata,
                            notification_preferences: {
                              push: notificationsEnabled,
                              email: value,
                              sms: smsAlerts,
                            },
                          },
                        },
                        client: {
                          ...(current.client || {}),
                          notification_preferences: {
                            push: notificationsEnabled,
                            email: value,
                            sms: smsAlerts,
                          },
                        },
                      }
                    : current
                );
                void updatePreferences({
                  push: notificationsEnabled,
                  email: value,
                  sms: smsAlerts,
                });
              }}
              trackColor={{
                false: theme.colors.surfaceElevated,
                true: theme.colors.accent,
              }}
              thumbColor={
                emailUpdates
                  ? theme.colors.textPrimary
                  : theme.colors.textMuted
              }
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
                setSession((current) =>
                  current
                    ? {
                        ...current,
                        user: {
                          ...current.user,
                          user_metadata: {
                            ...current.user.user_metadata,
                            notification_preferences: {
                              push: notificationsEnabled,
                              email: emailUpdates,
                              sms: value,
                            },
                          },
                        },
                        client: {
                          ...(current.client || {}),
                          notification_preferences: {
                            push: notificationsEnabled,
                            email: emailUpdates,
                            sms: value,
                          },
                        },
                      }
                    : current
                );
                void updatePreferences({
                  push: notificationsEnabled,
                  email: emailUpdates,
                  sms: value,
                });
              }}
              trackColor={{
                false: theme.colors.surfaceElevated,
                true: theme.colors.accent,
              }}
              thumbColor={
                smsAlerts ? theme.colors.textPrimary : theme.colors.textMuted
              }
            />
          </View>
          {status === "error" ? (
            <Text style={styles.helperText}>
              We couldn’t save that change yet. Please try again.
            </Text>
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
                void updateMessageRetention(value);
              }}
              trackColor={{
                false: theme.colors.surfaceElevated,
                true: theme.colors.accentSoft,
              }}
              thumbColor={
                keepMessages ? theme.colors.accent : theme.colors.surface
              }
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
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.md,
    ...theme.shadow.soft,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  rowCopy: {
    flex: 1,
    paddingRight: 12,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    color: theme.colors.textPrimary,
  },
  helper: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  helperText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  value: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginBottom: 12,
  },
  button: {
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    marginBottom: 6,
  },
  buttonText: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: theme.spacing.md,
  },
  });

export default SettingsScreen;
