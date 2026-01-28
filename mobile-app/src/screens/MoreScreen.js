import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import ScreenHeader from "../components/ScreenHeader";
import { supabase } from "../api/supabaseClient";
import { useSession } from "../context/SessionContext";

const userItems = [
  {
    label: "Profile",
    icon: "🪪",
    description: "View your profile details",
    route: "ProfileOverview",
  },
  {
    label: "Your pets",
    icon: "🐶",
    description: "Manage pet profiles",
    route: "PetsProfile",
  },
  {
    label: "Settings",
    icon: "🛠️",
    description: "Notifications and preferences",
    route: "Settings",
  },
  {
    label: "Help Centre & Support",
    icon: "🛟",
    description: "Email, call, or WhatsApp",
    route: "HelpSupport",
  },
];

const MoreScreen = ({ navigation }) => {
  const { setSession } = useSession();

  const handleLogout = async () => {
    try {
      if (supabase) {
        await supabase.auth.signOut();
      }
    } catch (error) {
      console.warn("Failed to sign out", error);
    } finally {
      setSession(null);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <ScreenHeader title="Profile" />
        <Text style={styles.sectionTitle}>More</Text>
        <View style={styles.sectionCard}>
          {userItems.map((item, index) => (
            <Pressable
              key={item.label}
              style={[
                styles.menuItem,
                index === userItems.length - 1 && styles.menuItemLast,
              ]}
              onPress={() => navigation.navigate(item.route)}
            >
              <View style={styles.menuLeft}>
                <Text style={styles.menuIcon}>{item.icon}</Text>
                <View>
                  <Text style={styles.menuLabel}>{item.label}</Text>
                  <Text style={styles.menuDescription}>
                    {item.description}
                  </Text>
                </View>
              </View>
              <Text style={styles.chevron}>›</Text>
            </Pressable>
          ))}
        </View>
        <View style={styles.sectionCard}>
          <Pressable style={styles.menuItem} onPress={handleLogout}>
            <View style={styles.menuLeft}>
              <Text style={styles.menuIcon}>🚪</Text>
              <View>
                <Text style={styles.menuLabel}>Log out</Text>
                <Text style={styles.menuDescription}>
                  Sign out of your account
                </Text>
              </View>
            </View>
            <Text style={styles.chevron}>›</Text>
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
    backgroundColor: "#f6f3fb",
    padding: 20,
    paddingBottom: 32,
  },
  chevron: {
    fontSize: 20,
    color: "#a194bb",
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#2b1a4b",
    marginBottom: 12,
  },
  sectionCard: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#ebe4f7",
    marginBottom: 20,
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f2ecfb",
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  menuLabel: {
    fontSize: 15,
    color: "#3a2b55",
    fontWeight: "600",
  },
  menuDescription: {
    fontSize: 12,
    color: "#7b6a9f",
    marginTop: 2,
  },
});

export default MoreScreen;