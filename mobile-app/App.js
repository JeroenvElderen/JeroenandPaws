import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { StatusBar } from "expo-status-bar";
import { Text } from "react-native";
import HomeScreen from "./src/screens/HomeScreen";
import BookScreen from "./src/screens/BookScreen";
import ProfileScreen from "./src/screens/ProfileScreen";
import CalendarScreen from "./src/screens/CalendarScreen";
import AuthScreen from "./src/screens/AuthScreen";
import { SessionProvider, useSession } from "./src/context/SessionContext";

const Tab = createBottomTabNavigator();

const TabLabel = ({ label, color }) => (
  <Text style={{ color, fontSize: 12, marginBottom: 4 }}>{label}</Text>
);

const tabIcons = {
  Home: "🏠",
  Book: "📖",
  Calendar: "📅",
  Profile: "⋯",
};

const AppShell = () => {
  const { session, setSession } = useSession();

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
          name="Profile"
          component={ProfileScreen}
          options={{
            tabBarIcon: ({ color }) => (
              <Text style={{ color, fontSize: 18 }}>{tabIcons.Profile}</Text>
            ),
            tabBarLabel: ({ color }) => (
              <TabLabel label="More" color={color} />
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

const App = () => (
  <SessionProvider>
    <AppShell />
  </SessionProvider>
);

export default App;