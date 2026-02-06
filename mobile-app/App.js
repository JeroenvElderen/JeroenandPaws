import { NavigationContainer, DefaultTheme, DarkTheme } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import { Modal, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import HomeScreen from "./src/screens/HomeScreen";
import BookScreen from "./src/screens/BookScreen";
import MoreScreen from "./src/screens/MoreScreen";
import CalendarScreen from "./src/screens/CalendarScreen";
import AuthScreen from "./src/screens/AuthScreen";
import MessagesScreen from "./src/screens/MessagesScreen";
import ProfileOverviewScreen from "./src/screens/ProfileOverviewScreen";
import PetsProfileScreen from "./src/screens/PetsProfileScreen";
import SettingsScreen from "./src/screens/SettingsScreen";
import PaymentMethodsScreen from "./src/screens/PaymentMethodsScreen";
import HelpSupportScreen from "./src/screens/HelpSupportScreen";
import JeroenPawsCardScreen from "./src/screens/JeroenPawsCardScreen";
import ClientProfilesScreen from "./src/screens/ClientProfilesScreen";
import { SessionProvider, useSession } from "./src/context/SessionContext";
import {
  ThemeProvider,
  THEME_MODES,
  THEME_PREFERENCES,
  useTheme,
} from "./src/context/ThemeContext";
import { fetchJson } from "./src/api/client";
import { supabase, supabaseAdmin } from "./src/api/supabaseClient";
import { buildSessionPayload, resolveClientProfile } from "./src/utils/session";
import {
  AVAILABILITY_TIMEOUT_MS,
  prefetchAvailability,
} from "./src/api/availabilityCache";
import { getTabBarStyle } from "./src/utils/tabBar";

const Tab = createBottomTabNavigator();
const RootStack = createNativeStackNavigator();
const ProfileStack = createNativeStackNavigator();
const OWNER_EMAIL = "jeroen@jeroenandpaws.com";

const TabItem = ({ label, color, icon }) => (
  <View style={styles.tabItem}>
    <Ionicons name={icon} size={20} color={color} />
    <Text style={[styles.tabLabel, { color }]}>{label}</Text>
  </View>
);

const tabIcons = {
  Home: "home",
  Book: "book",
  Calendar: "calendar",
  Messages: "chatbubbles",
  Profile: "ellipsis-horizontal",
};

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

const registerForPushNotifications = async (accentColor) => {
  if (!Device.isDevice) {
    return null;
  }

  const { status: existingStatus } =
    await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    return null;
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: accentColor,
    });
  }

  const projectId =
    Constants.easConfig?.projectId ||
    Constants.expoConfig?.extra?.eas?.projectId ||
    Constants.expoConfig?.extra?.projectId;
  if (!projectId) {
    return null;
  }

  const tokenResponse = await Notifications.getExpoPushTokenAsync({
    projectId,
  });
  return tokenResponse.data || null;
};

const ProfileStackScreen = () => {
  const { theme } = useTheme();
  return (
    <ProfileStack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <ProfileStack.Screen name="ProfileHome" component={MoreScreen} />
      <ProfileStack.Screen
        name="ProfileOverview"
        component={ProfileOverviewScreen}
      />
      <ProfileStack.Screen
        name="ClientProfiles"
        component={ClientProfilesScreen}
      />
      <ProfileStack.Screen name="PetsProfile" component={PetsProfileScreen} />
      <ProfileStack.Screen name="Settings" component={SettingsScreen} />
      <ProfileStack.Screen
        name="PaymentMethods"
        component={PaymentMethodsScreen}
      />
      <ProfileStack.Screen name="HelpSupport" component={HelpSupportScreen} />
    </ProfileStack.Navigator>
  );
};

const createTabPressListener = (targetScreen) => ({ navigation, route }) => ({
  tabPress: () => {
    const nestedState = route.state;
    if (nestedState?.index > 0) {
      navigation.navigate(
        route.name,
        targetScreen ? { screen: targetScreen } : undefined
      );
    }
  },
});

const MainTabs = () => {
  const { theme } = useTheme();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        unmountOnBlur: true,
        tabBarStyle: getTabBarStyle(theme),
        tabBarActiveTintColor: theme.colors.accent,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarShowLabel: false,
        tabBarItemStyle: {
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          paddingVertical: 0,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        listeners={createTabPressListener()}
        options={{
          tabBarIcon: ({ color }) => (
            <TabItem label="Home" color={color} icon={tabIcons.Home} />
          ),
        }}
      />
      <Tab.Screen
        name="Book"
        component={BookScreen}
        listeners={createTabPressListener()}
        options={{
          tabBarIcon: ({ color }) => (
            <TabItem label="Book" color={color} icon={tabIcons.Book} />
          ),
        }}
      />
      <Tab.Screen
        name="Calendar"
        component={CalendarScreen}
        listeners={createTabPressListener()}
        options={{
          tabBarIcon: ({ color }) => (
            <TabItem label="Calendar" color={color} icon={tabIcons.Calendar} />
          ),
        }}
      />
      <Tab.Screen
        name="Messages"
        component={MessagesScreen}
        listeners={createTabPressListener()}
        options={{
          tabBarStyle: { ...getTabBarStyle(theme), display: "none" },
          tabBarIcon: ({ color }) => (
            <TabItem label="Messages" color={color} icon={tabIcons.Messages} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStackScreen}
        listeners={createTabPressListener()}
        options={{
          tabBarIcon: ({ color }) => (
            <TabItem label="More" color={color} icon={tabIcons.Profile} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const AppShell = () => {
  const {
    theme,
    mode,
    preference,
    hasHydrated,
    needsThemeChoice,
    completeThemeChoice,
  } = useTheme();
  const { session, setSession, clientProfiles, setClientProfiles } =
    useSession();
  const [authReady, setAuthReady] = useState(false);
  const isDark = mode === THEME_MODES.dark;
  const modalStyles = useMemo(() => createModalStyles(theme), [theme]);
  const navigationTheme = isDark
    ? {
        ...DarkTheme,
        colors: { ...DarkTheme.colors, background: theme.colors.background },
      }
    : {
        ...DefaultTheme,
        colors: { ...DefaultTheme.colors, background: theme.colors.background },
      };

  useEffect(() => {
    let isMounted = true;
    let subscription;

    const restoreSession = async () => {
      if (!supabase) {
        if (isMounted) {
          setAuthReady(true);
        }
        return;
      }

      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          throw error;
        }

        const authSession = data?.session;
        if (authSession?.user) {
          const clientProfile = await resolveClientProfile({
            supabase,
            user: authSession.user,
            fallback: { email: authSession.user.email || "" },
          });

          if (isMounted) {
            setSession(
              buildSessionPayload({
                user: authSession.user,
                client: clientProfile,
                fallback: { email: authSession.user.email || "" },
              })
            );
          }
        }
      } catch (error) {
        console.warn("Failed to restore session", error);
      } finally {
        if (isMounted) {
          setAuthReady(true);
        }
      }
    };

    restoreSession();

    if (supabase) {
      const authListener = supabase.auth.onAuthStateChange(
        async (_event, authSession) => {
          if (!isMounted) return;
          if (!authSession?.user) {
            setSession(null);
            return;
          }

          try {
            const clientProfile = await resolveClientProfile({
              supabase,
              user: authSession.user,
              fallback: { email: authSession.user.email || "" },
            });
            setSession(
              buildSessionPayload({
                user: authSession.user,
                client: clientProfile,
                fallback: { email: authSession.user.email || "" },
              })
            );
          } catch (error) {
            console.warn("Failed to hydrate session", error);
          }
        }
      );
      subscription = authListener.data?.subscription;
    }

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, [setSession]);

  useEffect(() => {
    let isMounted = true;

    const syncPushToken = async () => {
      if (!supabase || !session?.user) {
        return;
      }

      const preferences =
        session?.user?.user_metadata?.notification_preferences || {};
      const pushEnabled =
        typeof preferences.push === "boolean" ? preferences.push : true;

      if (!pushEnabled) {
        if (session?.user?.user_metadata?.expo_push_token) {
          await supabase.auth.updateUser({
            data: { expo_push_token: null },
          });
          if (session?.id) {
            await supabase
              .from("clients")
              .update({ expo_push_token: null })
              .eq("id", session.id);
          }
          if (!isMounted) return;
          setSession((current) =>
            current
              ? {
                  ...current,
                  user: {
                    ...current.user,
                    user_metadata: {
                      ...current.user.user_metadata,
                      expo_push_token: null,
                    },
                  },
                }
              : current
          );
        }
        return;
      }

      try {
        const token = await registerForPushNotifications(theme.colors.accent);
        if (!token || !isMounted) return;
        if (token !== session?.user?.user_metadata?.expo_push_token) {
          const { error } = await supabase.auth.updateUser({
            data: { expo_push_token: token },
          });
          if (error) {
            console.warn("Failed to store push token", error);
            return;
          }
          if (session?.id) {
            const { error: clientError } = await supabase
              .from("clients")
              .update({ expo_push_token: token })
              .eq("id", session.id);
            if (clientError) {
              console.warn("Failed to store client push token", clientError);
            }
          }
          setSession((current) =>
            current
              ? {
                  ...current,
                  user: {
                    ...current.user,
                    user_metadata: {
                      ...current.user.user_metadata,
                      expo_push_token: token,
                    },
                  },
                }
              : current
          );
        }
      } catch (error) {
        console.warn("Failed to register for push notifications", error);
      }
    };

    syncPushToken();

    return () => {
      isMounted = false;
    };
  }, [session?.user, setSession, theme.colors.accent]);

  useEffect(() => {
    let isMounted = true;

    const preloadClientProfiles = async () => {
      if (
        !supabase ||
        !session?.email ||
        clientProfiles.length ||
        session.email.toLowerCase() !== OWNER_EMAIL.toLowerCase()
      ) {
        return;
      }

      try {
        const activeClient = supabaseAdmin || supabase;
        const pageSize = 1000;
        let offset = 0;
        let allClients = [];

        while (true) {
          const { data, error } = await activeClient
            .from("clients")
            .select("id, full_name, email, address, profile_photo_url, created_at")
            .order("created_at", { ascending: false })
            .range(offset, offset + pageSize - 1);

          if (error) {
            throw error;
          }

          const batch = data || [];
          allClients = [...allClients, ...batch];

          if (batch.length < pageSize) {
            break;
          }
          offset += pageSize;
        }

        if (isMounted) {
          setClientProfiles(allClients);
        }
      } catch (error) {
        console.warn("Failed to preload client profiles", error);
      }
    };

    preloadClientProfiles();

    return () => {
      isMounted = false;
    };
  }, [clientProfiles.length, session?.email, setClientProfiles]);

  useEffect(() => {
    let isMounted = true;

    const ensureClientAddress = async () => {
      if (!supabase || !session?.id) {
        return;
      }
      const existingAddress = (session.address || "").trim();
      if (existingAddress) {
        return;
      }

      try {
        const clientResult = await supabase
          .from("clients")
          .select("address")
          .eq("id", session.id)
          .maybeSingle();
        if (!isMounted) return;
        if (clientResult.error) {
          throw clientResult.error;
        }
        if (clientResult.data?.address) {
          setSession((current) =>
            current
              ? {
                  ...current,
                  address: clientResult.data.address,
                  client: {
                    ...(current.client || {}),
                    address: clientResult.data.address,
                  },
                }
              : current
          );
        }
      } catch (error) {
        console.warn("Failed to refresh client address", error);
      }
    };

    ensureClientAddress();

    return () => {
      isMounted = false;
    };
  }, [session?.id, session?.address, setSession]);

  useEffect(() => {
    let isMounted = true;
    let timeoutId;

    const prefetchBookingAvailability = async () => {
      const clientAddress = (session?.address || session?.client?.address || "")
        .trim();
      if (!clientAddress) return;

      try {
        const defaultDurationMinutes = 60;
        const data = await fetchJson("/api/services", { timeoutMs: 30000 });
        if (!isMounted) return;
        const services = Array.isArray(data?.services) ? data.services : [];
        if (!services.length) return;
        const durations = new Set([defaultDurationMinutes]);
        services.forEach((service) => {
          const duration = Number(
            service?.duration_minutes ||
              service?.durationMinutes ||
              defaultDurationMinutes
          );
          durations.add(duration);
        });
        await Promise.allSettled(
          Array.from(durations).map((durationMinutes) =>
            prefetchAvailability({
              durationMinutes,
              windowDays: 21,
              clientAddress,
              timeoutMs: AVAILABILITY_TIMEOUT_MS,
            })
          )
        );
      } catch (error) {
        console.error("Failed to prefetch availability after auth", error);
      }
    };

    if (session?.email) {
      timeoutId = setTimeout(prefetchBookingAvailability, 150);
    }

    return () => {
      isMounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [session?.email, session?.address]);

  if (!authReady) {
    return null;
  }

  if (!session?.email) {
    return (
      <NavigationContainer theme={navigationTheme}>
        <StatusBar style={isDark ? "light" : "dark"} />
        <AuthScreen onAuthenticate={setSession} />
        {hasHydrated ? (
          <Modal
            visible={needsThemeChoice}
            transparent
            animationType="fade"
            statusBarTranslucent
          >
            <View style={modalStyles.modalOverlay}>
              <View style={modalStyles.modalCard}>
                <Text style={modalStyles.modalTitle}>
                  Choose your theme
                </Text>
                <Text style={modalStyles.modalBody}>
                  Use your system setting or choose in-app settings anytime.
                </Text>
                <Pressable
                  style={modalStyles.modalButton}
                  onPress={() => completeThemeChoice(THEME_PREFERENCES.system)}
                >
                  <Text style={modalStyles.modalButtonText}>
                    Use system setting
                  </Text>
                </Pressable>
                <Pressable
                  style={modalStyles.modalButtonOutline}
                  onPress={() => completeThemeChoice(THEME_PREFERENCES.manual)}
                >
                  <Text style={modalStyles.modalButtonTextOutline}>
                    Choose in app
                  </Text>
                </Pressable>
              </View>
            </View>
          </Modal>
        ) : null}
      </NavigationContainer>
    );
  }

  return (
    <NavigationContainer theme={navigationTheme}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        <RootStack.Screen name="MainTabs" component={MainTabs} />
        <RootStack.Screen
          name="JeroenPawsCard"
          component={JeroenPawsCardScreen}
        />
      </RootStack.Navigator>
      {hasHydrated ? (
        <Modal
          visible={needsThemeChoice}
          transparent
          animationType="fade"
          statusBarTranslucent
        >
          <View style={modalStyles.modalOverlay}>
            <View style={modalStyles.modalCard}>
              <Text style={modalStyles.modalTitle}>
                Choose your theme
              </Text>
              <Text style={modalStyles.modalBody}>
                Use your system setting or choose in-app settings anytime.
              </Text>
              <Pressable
                style={modalStyles.modalButton}
                onPress={() => completeThemeChoice(THEME_PREFERENCES.system)}
              >
                <Text style={modalStyles.modalButtonText}>
                  Use system setting
                </Text>
              </Pressable>
              <Pressable
                style={modalStyles.modalButtonOutline}
                onPress={() => completeThemeChoice(THEME_PREFERENCES.manual)}
              >
                <Text style={modalStyles.modalButtonTextOutline}>
                  Choose in app
                </Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      ) : null}
    </NavigationContainer>
  );
};

const App = () => (
  <ThemeProvider>
    <SessionProvider>
      <AppShell />
    </SessionProvider>
  </ThemeProvider>
);

const styles = StyleSheet.create({
  tabItem: {
    alignItems: "center",
    justifyContent: "center",
  },
  tabLabel: {
    fontSize: 12,
    marginTop: 4,
  },
});

const createModalStyles = (theme) =>
  StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: theme.colors.background,
  },
  modalCard: {
    borderRadius: 24,
    padding: 24,
    backgroundColor: theme.colors.surface,
    shadowColor: theme.shadow.soft.shadowColor,
    shadowOpacity: theme.shadow.soft.shadowOpacity,
    shadowOffset: theme.shadow.soft.shadowOffset,
    shadowRadius: theme.shadow.soft.shadowRadius,
    elevation: theme.shadow.soft.elevation,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
    color: theme.colors.textPrimary,
  },
  modalBody: {
    fontSize: 14,
    marginBottom: 16,
    color: theme.colors.textSecondary,
  },
  modalButton: {
    borderRadius: 18,
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 12,
    backgroundColor: theme.colors.accent,
  },
  modalButtonOutline: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
  },
  modalButtonText: {
    fontWeight: "600",
    fontSize: 14,
    color: theme.colors.white,
  },
  modalButtonTextOutline: {
    fontWeight: "600",
    fontSize: 14,
    color: theme.colors.textPrimary,
  },
});

export default App;
