import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { StatusBar } from "expo-status-bar";
import { Text } from "react-native";
import HomeScreen from "./src/screens/HomeScreen";
import BookScreen from "./src/screens/BookScreen";
import ProfileScreen from "./src/screens/ProfileScreen";

const Tab = createBottomTabNavigator();

const TabLabel = ({ label, color }) => (
  <Text style={{ color, fontSize: 12, marginBottom: 4 }}>{label}</Text>
);

const App = () => (
  <NavigationContainer>
    <StatusBar style="dark" />
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#ffffff",
          borderTopColor: "#efe7dd",
        },
        tabBarActiveTintColor: "#1f4b3f",
        tabBarInactiveTintColor: "#8d887f",
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: ({ color }) => <TabLabel label="Home" color={color} />,
        }}
      />
      <Tab.Screen
        name="Book"
        component={BookScreen}
        options={{
          tabBarLabel: ({ color }) => <TabLabel label="Book" color={color} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: ({ color }) => (
            <TabLabel label="Profile" color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  </NavigationContainer>
);

export default App;