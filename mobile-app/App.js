import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import { Platform, Text } from "react-native";
import { useEffect, useState } from "react";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
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
import { fetchJson } from "./src/api/client";
import { supabase } from "./src/api/supabaseClient";
import { buildSessionPayload, resolveClientProfile } from "./src/utils/session";
import {
  AVAILABILITY_TIMEOUT_MS,
  prefetchAvailability,
} from "./src/api/availabilityCache";
import { TAB_BAR_STYLE } from "./src/utils/tabBar";

const Tab = createBottomTabNavigator();
const RootStack = createNativeStackNavigator();
const ProfileStack = createNativeStackNavigator();

const TabLabel = ({ label, color }) => (
  <Text style={{ color, fontSize: 12, marginBottom: 4 }}>{label}</Text>
);

const tabIcons = {
  Home: "🏠",
  Book: "📖",
  Calendar: "📅",
  Messages: "💬",
  Profile: "⋯",
};

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

const registerForPushNotifications = async () => {
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
      lightColor: "#5d2fc5",
    });
  }

  const tokenResponse = await Notifications.getExpoPushTokenAsync();
  return tokenResponse.data || null;
};

const ProfileStackScreen = () => (
  <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
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

const MainTabs = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarStyle: TAB_BAR_STYLE,
      tabBarActiveTintColor: "#5d2fc5",
      tabBarInactiveTintColor: "#a093b9",
      tabBarIconStyle: {
        marginTop: 8,
      },
      tabBarItemStyle: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
      },
    }}
  >
    <Tab.Screen
      name="Home"
      component={HomeScreen}
      options={{
        tabBarIcon: ({ color }) => (
          <Text style={{ color, fontSize: 18 }}>{tabIcons.Home}</Text>
        ),
        tabBarLabel: ({ color }) => <TabLabel label="Home" color={color} />,
      }}
    />
    <Tab.Screen
      name="Book"
      component={BookScreen}
      options={{
        tabBarIcon: ({ color }) => (
          <Text style={{ color, fontSize: 18 }}>{tabIcons.Book}</Text>
        ),
        tabBarLabel: ({ color }) => <TabLabel label="Book" color={color} />,
      }}
    />
    <Tab.Screen
      name="Calendar"
      component={CalendarScreen}
      options={{
        tabBarIcon: ({ color }) => (
          <Text style={{ color, fontSize: 18 }}>{tabIcons.Calendar}</Text>
        ),
        tabBarLabel: ({ color }) => (
          <TabLabel label="Calendar" color={color} />
        ),
      }}
    />
    <Tab.Screen
      name="Messages"
      component={MessagesScreen}
      options={{
        tabBarStyle: { ...TAB_BAR_STYLE, display: "none" },
        tabBarIcon: ({ color }) => (
          <Text style={{ color, fontSize: 18 }}>{tabIcons.Messages}</Text>
        ),
        tabBarLabel: ({ color }) => (
          <TabLabel label="Messages" color={color} />
        ),
      }}
    />
    <Tab.Screen
      name="Profile"
      component={ProfileStackScreen}
      options={{
        tabBarIcon: ({ color }) => (
          <Text style={{ color, fontSize: 18 }}>{tabIcons.Profile}</Text>
        ),
        tabBarLabel: ({ color }) => <TabLabel label="More" color={color} />,
      }}
    />
  </Tab.Navigator>
);

const AppShell = () => {
  const { session, setSession } = useSession();
  const [authReady, setAuthReady] = useState(false);

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
        const token = await registerForPushNotifications();
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
  }, [session?.user, setSession]);

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
      <NavigationContainer>
        <StatusBar style="dark" />
        <AuthScreen onAuthenticate={setSession} />
      </NavigationContainer>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        <RootStack.Screen name="MainTabs" component={MainTabs} />
        <RootStack.Screen
          name="JeroenPawsCard"
          component={JeroenPawsCardScreen}
        />
      </RootStack.Navigator>
    </NavigationContainer>
  );
};

const App = () => (
  <SessionProvider>
    <AppShell />
  </SessionProvider>
);

export default App;