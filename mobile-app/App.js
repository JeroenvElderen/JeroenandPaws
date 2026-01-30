import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import { Text } from "react-native";
import { useEffect, useState } from "react";
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
import { SessionProvider, useSession } from "./src/context/SessionContext";
import { fetchJson } from "./src/api/client";
import { supabase } from "./src/api/supabaseClient";
import { buildSessionPayload, resolveClientProfile } from "./src/utils/session";
import {
  AVAILABILITY_TIMEOUT_MS,
  prefetchAvailability,
} from "./src/api/availabilityCache";

const Tab = createBottomTabNavigator();
const RootStack = createNativeStackNavigator();

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

const MainTabs = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarStyle: {
        backgroundColor: "#ffffff",
        borderTopColor: "#efe7dd",
        borderTopWidth: 0,
        borderRadius: 32,
        marginHorizontal: 16,
        marginBottom: 12,
        height: 70,
        position: "absolute",
        shadowColor: "#2b1a4b",
        shadowOpacity: 0.08,
        shadowOffset: { width: 0, height: 10 },
        shadowRadius: 18,
        elevation: 6,
        alignItems: "center",
        justifyContent: "center",
        alignSelf: "center",
        width: "90%",
      },
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
      component={MoreScreen}
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
        for (const durationMinutes of durations) {
          await prefetchAvailability({
            durationMinutes,
            windowDays: 21,
            clientAddress,
            timeoutMs: AVAILABILITY_TIMEOUT_MS,
          });
        }
      } catch (error) {
        console.error("Failed to prefetch availability after auth", error);
      }
    };

    if (session?.email) {
      timeoutId = setTimeout(prefetchBookingAvailability, 500);
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
          name="ProfileOverview"
          component={ProfileOverviewScreen}
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
        <RootStack.Screen name="PetsProfile" component={PetsProfileScreen} />
        <RootStack.Screen name="Settings" component={SettingsScreen} />
        <RootStack.Screen
          name="PaymentMethods"
          component={PaymentMethodsScreen}
        />
        <RootStack.Screen
          name="JeroenPawsCard"
          component={JeroenPawsCardScreen}
        />
        <Tab.Screen
          name="Profile"
          component={MoreScreen}
          options={{
            tabBarIcon: ({ color }) => (
              <Text style={{ color, fontSize: 18 }}>{tabIcons.Profile}</Text>
            ),
            tabBarLabel: ({ color }) => (
              <TabLabel label="More" color={color} />
            ),
          }}
        />
        <RootStack.Screen name="HelpSupport" component={HelpSupportScreen} />
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