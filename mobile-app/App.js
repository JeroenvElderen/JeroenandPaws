import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
} from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  AppState,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useMemo, useState } from "react";
import * as Device from "expo-device";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
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
import PaymentScreen from "./src/screens/PaymentScreen";
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
import {
  clearPaymentReminderId,
  clearPendingPayment,
  getPaymentReminderId,
  getPendingPayment,
  storePaymentReminderId,
} from "./src/utils/paymentReminder";

const Tab = createBottomTabNavigator();
const RootStack = createNativeStackNavigator();
const ProfileStack = createNativeStackNavigator();
const OWNER_EMAIL = "jeroen@jeroenandpaws.com";
const OWNER_CLIENT_ID = "94cab38a-1f08-498b-8efa-7ed8f561926f";

const TabItem = ({
  label,
  color,
  icon,
  badgeCount = 0,
  badgeStyle,
  badgeTextStyle,
}) => (
  <View style={styles.tabItem}>
    <View style={styles.tabIconWrapper}>
      <Ionicons name={icon} size={20} color={color} />
      {badgeCount > 0 ? (
        <View style={[styles.tabBadge, badgeStyle]}>
          <Text style={[styles.tabBadgeText, badgeTextStyle]}>
            {badgeCount > 99 ? "99+" : badgeCount}
          </Text>
        </View>
      ) : null}
    </View>
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

const getNotificationsModule = () => {
  if (Constants.appOwnership === "expo") {
    return null;
  }
  return require("expo-notifications");
};

const configureNotifications = () => {
  const Notifications = getNotificationsModule();
  if (!Notifications) return;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
};

configureNotifications();

const PAYMENT_REMINDER_SECONDS = 60 * 30;
const PAYMENT_REMINDER_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000;

const buildPaymentReminderBody = (payload) => {
  const serviceLabel = payload?.description;
  const amount = payload?.amount;
  const currency = payload?.currency || "EUR";
  const formattedTotal = Number.isFinite(amount)
    ? new Intl.NumberFormat("en-GB", {
        style: "currency",
        currency,
        maximumFractionDigits: 0,
      }).format(amount)
    : null;
  if (serviceLabel && formattedTotal) {
    return `${serviceLabel} is still reserved. Complete your ${formattedTotal} payment.`;
  }
  if (serviceLabel) {
    return `${serviceLabel} is still reserved. Complete your payment.`;
  }
  if (formattedTotal) {
    return `Complete your ${formattedTotal} payment to confirm your booking.`;
  }
  return "Complete your payment to confirm your booking.";
};

const isPaidStatus = (status) =>
  typeof status === "string" && status.toLowerCase().includes("paid");

const registerForPushNotifications = async (accentColor) => {
  const Notifications = getNotificationsModule();
  if (!Notifications) {
    return null;
  }
  if (!Device.isDevice) {
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
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

const createTabPressListener =
  (targetScreen) =>
  ({ navigation, route }) => ({
    tabPress: () => {
      const nestedState = route.state;
      const needsReset =
        targetScreen &&
        (nestedState?.index > 0 ||
          nestedState?.routes?.[0]?.name !== targetScreen);
      if (needsReset) {
        navigation.navigate(route.name, { screen: targetScreen });
      }
    },
  });

const MainTabs = () => {
  const { theme } = useTheme();
  const { session } = useSession();
  const [unreadCount, setUnreadCount] = useState(0);
  const isJeroenAccount =
    session?.email?.toLowerCase() === OWNER_EMAIL.toLowerCase();
  const unreadBadgeCount = useMemo(() => {
    if (!unreadCount) return 0;
    if (isJeroenAccount) return unreadCount;
    return 1;
  }, [isJeroenAccount, unreadCount]);
  const badgeStyles = useMemo(
    () => ({
      badge: {
        backgroundColor: theme.colors.danger,
        borderColor: theme.colors.background,
      },
      badgeText: {
        color: theme.colors.white,
      },
    }),
    [theme.colors.background, theme.colors.danger, theme.colors.white],
  );

  const loadUnreadMessages = useCallback(async () => {
    if (!session?.id || !supabase) {
      setUnreadCount(0);
      return;
    }

    const storageKey = `messages:lastRead:${
      isJeroenAccount ? OWNER_CLIENT_ID : session.id
    }`;

    try {
      const raw = await AsyncStorage.getItem(storageKey);
      const lastReadMap = raw ? JSON.parse(raw) : {};
      const lastReadValues = Object.values(lastReadMap)
        .map((value) => new Date(value).getTime())
        .filter((value) => Number.isFinite(value));
      const minLastRead =
        lastReadValues.length > 0 ? Math.min(...lastReadValues) : null;

      let query = supabase
        .from("messages")
        .select("client_id, created_at, sender")
        .order("created_at", { ascending: false });

      if (isJeroenAccount) {
        query = query.eq("sender", "client").neq("client_id", OWNER_CLIENT_ID);
      } else {
        query = query.eq("sender", "owner").eq("client_id", session.id);
      }

      if (minLastRead) {
        query = query.gt("created_at", new Date(minLastRead).toISOString());
      }

      const { data, error } = await query;
      if (error) {
        throw error;
      }

      const unreadClients = (data || []).reduce((acc, message) => {
        const lastRead = lastReadMap[message.client_id];
        if (!lastRead) {
          acc.add(message.client_id);
          return acc;
        }
        if (new Date(message.created_at) > new Date(lastRead)) {
          acc.add(message.client_id);
        }
        return acc;
      }, new Set());

      setUnreadCount(unreadClients.size);
    } catch (error) {
      console.error("Failed to load unread messages", error);
    }
  }, [isJeroenAccount, session?.id]);

  useEffect(() => {
    loadUnreadMessages();
  }, [loadUnreadMessages]);

  useEffect(() => {
    if (!supabase || !session?.id) {
      return undefined;
    }

    const messageChannel = supabase
      .channel("messages-unread-tab")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        () => {
          loadUnreadMessages();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messageChannel);
    };
  }, [loadUnreadMessages, session?.id]);

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
          height: 72,
          justifyContent: "center",
          alignItems: "center",
        },
        tabBarIconStyle: {
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
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
            <TabItem
              label="Messages"
              color={color}
              icon={tabIcons.Messages}
              badgeCount={unreadBadgeCount}
              badgeStyle={badgeStyles.badge}
              badgeTextStyle={badgeStyles.badgeText}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStackScreen}
        listeners={createTabPressListener("ProfileHome")}
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
  const [petOnboardingReady, setPetOnboardingReady] = useState(false);
  const [initialRoute, setInitialRoute] = useState("MainTabs");
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
              }),
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
              }),
            );
          } catch (error) {
            console.warn("Failed to hydrate session", error);
          }
        },
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
              : current,
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
              : current,
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
    const Notifications = getNotificationsModule();
    if (!Notifications) {
      return undefined;
    }
    let isMounted = true;

    const cancelScheduledReminder = async () => {
      const reminderId = await getPaymentReminderId();
      if (reminderId) {
        try {
          await Notifications.cancelScheduledNotificationAsync(reminderId);
        } catch (error) {
          console.warn("Failed to cancel payment reminder", error);
        }
      }
      await clearPaymentReminderId();
    };

    const scheduleReminder = async (payloadRecord) => {
      if (!payloadRecord?.payload) {
        await cancelScheduledReminder();
        return;
      }
      await cancelScheduledReminder();
      try {
        const id = await Notifications.scheduleNotificationAsync({
          content: {
            title: "Payment reminder",
            body: buildPaymentReminderBody(payloadRecord.payload),
          },
          trigger: { seconds: PAYMENT_REMINDER_SECONDS },
        });
        await storePaymentReminderId(id);
      } catch (error) {
        console.warn("Failed to schedule payment reminder", error);
      }
    };

    const refreshPendingPayment = async () => {
      const pendingPayment = await getPendingPayment();
      if (!pendingPayment) {
        await cancelScheduledReminder();
        return;
      }

      const savedAtMs = new Date(pendingPayment.savedAt || 0).getTime();
      if (
        Number.isFinite(savedAtMs) &&
        Date.now() - savedAtMs > PAYMENT_REMINDER_EXPIRY_MS
      ) {
        await clearPendingPayment();
        await cancelScheduledReminder();
        return;
      }

      if (!supabase || !pendingPayment.payload?.bookingId) {
        return;
      }

      try {
        const { data, error } = await supabase
          .from("bookings")
          .select("status")
          .eq("id", pendingPayment.payload.bookingId)
          .maybeSingle();
        if (!error && isPaidStatus(data?.status)) {
          await clearPendingPayment();
          await cancelScheduledReminder();
        }
      } catch (error) {
        console.warn("Failed to check payment status", error);
      }
    };

    const handleAppStateChange = async (nextState) => {
      if (!isMounted) return;
      if (nextState === "active") {
        await refreshPendingPayment();
        return;
      }
      if (nextState === "background" || nextState === "inactive") {
        const pendingPayment = await getPendingPayment();
        if (!pendingPayment) {
          await cancelScheduledReminder();
          return;
        }
        await scheduleReminder(pendingPayment);
      }
    };

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange,
    );

    refreshPendingPayment();

    return () => {
      isMounted = false;
      subscription?.remove();
    };
  }, [session?.id]);
  
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
            .select(
              "id, full_name, email, address, profile_photo_url, created_at",
            )
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
              : current,
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
      const clientAddress = (
        session?.address ||
        session?.client?.address ||
        ""
      ).trim();
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
              defaultDurationMinutes,
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
            }),
          ),
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

  useEffect(() => {
    let isMounted = true;

    const checkPetOnboarding = async () => {
      if (isMounted) {
        setInitialRoute("MainTabs");
        setPetOnboardingReady(Boolean(session?.email));
      }
    };

    checkPetOnboarding();

    return () => {
      isMounted = false;
    };
  }, [session?.email]);

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
                <Text style={modalStyles.modalTitle}>Choose your theme</Text>
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

  if (!petOnboardingReady) {
    return null;
  }

  return (
    <NavigationContainer theme={navigationTheme}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <RootStack.Navigator
        screenOptions={{ headerShown: false }}
        initialRouteName={initialRoute}
      >
        <RootStack.Screen name="MainTabs" component={MainTabs} />
        <RootStack.Screen
          name="PetOnboarding"
          component={PetsProfileScreen}
          initialParams={{ mode: "create", returnTo: "MainTabs" }}
        />
        <RootStack.Screen
          name="JeroenPawsCard"
          component={JeroenPawsCardScreen}
        />
        <RootStack.Screen name="Payment" component={PaymentScreen} />
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
              <Text style={modalStyles.modalTitle}>Choose your theme</Text>
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
  tabIconWrapper: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  tabLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  tabBadge: {
    position: "absolute",
    top: -6,
    right: -12,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    paddingHorizontal: 4,
    backgroundColor: "#E5484D",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#FFFFFF",
  },
  tabBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#FFFFFF",
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
