import { useEffect, useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../api/supabaseClient";
import ScreenHeader from "../components/ScreenHeader";
import { useSession } from "../context/SessionContext";
import { THEME_MODES, THEME_PREFERENCES, useTheme } from "../context/ThemeContext";

const SettingsScreen = ({ navigation, route }) => {
  const { session, setSession } = useSession();
  const { theme, mode, preference, setThemeMode, setThemePreference } =
    useTheme();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(false);
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [keepMessages, setKeepMessages] = useState(false);
  const [status, setStatus] = useState("idle");
  const isSystemTheme = preference === THEME_PREFERENCES.system;
  const isDarkMode = mode === THEME_MODES.dark;
  const styles = useMemo(() => createStyles(theme), [theme]);
  const returnTo = route?.params?.returnTo;
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <ScreenHeader title="Settings" onBack={handleReturn} />
        <View style={styles.heroCard}>
          <View style={styles.heroIcon}>
            <Ionicons
              name="sparkles"
              size={18}
              color={theme.colors.accent}
            />
          </View>
          <View style={styles.heroCopy}>
            <Text style={styles.heroTitle}>Make it feel like home</Text>
            <Text style={styles.heroSubtitle}>
              Tailor your notifications and theme to match your day.
            </Text>
          </View>
        </View>
        <Text style={styles.sectionTitle}>Appearance</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowCopy}>
              <Text style={styles.label}>Use system setting</Text>
              <Text style={styles.helper}>
                Match your device light or dark theme automatically.
              </Text>
            </View>
            <Switch
              value={isSystemTheme}
              onValueChange={(value) =>
                setThemePreference(
                  value ? THEME_PREFERENCES.system : THEME_PREFERENCES.manual
                )
              }
              trackColor={{
                false: theme.colors.borderStrong,
                true: theme.colors.accent,
              }}
              thumbColor={
                isSystemTheme ? theme.colors.white : theme.colors.surfaceAccent
              }
            />
          </View>
          <View style={[styles.row, styles.rowLast]}>
            <View style={styles.rowCopy}>
              <Text style={styles.label}>Dark mode</Text>
              <Text style={styles.helper}>
                Only applies when using in-app settings.
              </Text>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={(value) =>
                setThemeMode(value ? THEME_MODES.dark : THEME_MODES.light)
              }
              disabled={isSystemTheme}
              trackColor={{
                false: theme.colors.borderStrong,
                true: theme.colors.accent,
              }}
              thumbColor={
                isDarkMode ? theme.colors.white : theme.colors.surfaceAccent
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
                false: theme.colors.borderStrong,
                true: theme.colors.accent,
              }}
              thumbColor={
                notificationsEnabled
                  ? theme.colors.white
                  : theme.colors.surfaceAccent
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
                false: theme.colors.borderStrong,
                true: theme.colors.accent,
              }}
              thumbColor={
                emailUpdates ? theme.colors.white : theme.colors.surfaceAccent
              }
            />
          </View>
          <View style={[styles.row, styles.rowLast]}>
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
                false: theme.colors.borderStrong,
                true: theme.colors.accent,
              }}
              thumbColor={
                smsAlerts ? theme.colors.white : theme.colors.surfaceAccent
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
                false: theme.colors.border,
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
            onPress={() =>
              navigation.navigate("PaymentMethods", {
                returnTo: returnTo || "Profile",
              })
            }
          >
            <Text style={styles.buttonText}>Update payment method</Text>
          </Pressable>
          <View style={styles.divider} />
          <Text style={styles.label}>Billing settings</Text>
          <Text style={styles.value}>Invoices go to {session?.email || "your email"}.</Text>
          <Pressable
            style={styles.button}
            onPress={() =>
              navigation.navigate("PaymentMethods", {
                returnTo: returnTo || "Profile",
              })
            }
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
    heroCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.md,
      padding: theme.spacing.md,
      borderRadius: theme.radius.xl,
      backgroundColor: theme.colors.surfaceElevated,
      borderWidth: 1,
      borderColor: theme.colors.borderSoft,
      marginBottom: theme.spacing.lg,
      shadowColor: theme.shadow.soft.shadowColor,
      shadowOpacity: theme.shadow.soft.shadowOpacity,
      shadowOffset: theme.shadow.soft.shadowOffset,
      shadowRadius: theme.shadow.soft.shadowRadius,
      elevation: theme.shadow.soft.elevation,
    },
    heroIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.surfaceAccent,
      borderWidth: 1,
      borderColor: theme.colors.borderStrong,
    },
    heroCopy: {
      flex: 1,
    },
    heroTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: theme.colors.textPrimary,
    },
    heroSubtitle: {
      fontSize: 13,
      color: theme.colors.textSecondary,
      marginTop: 4,
      lineHeight: 18,
    },
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.lg,
      padding: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.borderSoft,
      marginBottom: theme.spacing.md,
      shadowColor: theme.shadow.soft.shadowColor,
      shadowOpacity: theme.shadow.soft.shadowOpacity,
      shadowOffset: theme.shadow.soft.shadowOffset,
      shadowRadius: theme.shadow.soft.shadowRadius,
      elevation: theme.shadow.soft.elevation,
    },
    row: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: theme.spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    rowLast: {
      borderBottomWidth: 0,
      paddingBottom: 0,
    },
    rowCopy: {
      flex: 1,
      paddingRight: theme.spacing.sm,
    },
    label: {
      fontSize: theme.typography.body.fontSize,
      fontWeight: "600",
      color: theme.colors.textPrimary,
    },
    helper: {
      fontSize: theme.typography.caption.fontSize,
      color: theme.colors.textSecondary,
      marginTop: theme.spacing.xs,
    },
    helperText: {
      fontSize: theme.typography.caption.fontSize,
      color: theme.colors.textSecondary,
      marginTop: theme.spacing.xs,
    },
    sectionTitle: {
      fontSize: 17,
      fontWeight: "700",
      color: theme.colors.textPrimary,
      marginBottom: theme.spacing.sm,
    },
    value: {
      fontSize: theme.typography.caption.fontSize,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.sm,
    },
    button: {
      alignSelf: "flex-start",
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.xs,
      backgroundColor: theme.colors.surfaceAccent,
      borderRadius: theme.radius.md,
      borderWidth: 1,
      borderColor: theme.colors.borderStrong,
      marginBottom: theme.spacing.xs,
    },
    buttonText: {
      fontSize: theme.typography.caption.fontSize,
      fontWeight: "600",
      color: theme.colors.textPrimary,
    },
    divider: {
      height: 1,
      backgroundColor: theme.colors.border,
      marginVertical: theme.spacing.sm,
    },
  });

export default SettingsScreen;
