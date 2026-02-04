import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import ScreenHeader from "../components/ScreenHeader";
import { supabase } from "../api/supabaseClient";
import { useSession } from "../context/SessionContext";

const userItems = [
  {
    label: "Profile",
    icon: "card-account-details",
    description: "View your profile details",
    route: "ProfileOverview",
  },
  {
    label: "Your pets",
    icon: "dog",
    description: "Manage pet profiles",
    route: "PetsProfile",
  },
  {
    label: "Settings",
    icon: "cog",
    description: "Notifications and preferences",
    route: "Settings",
  },
  {
    label: "Help Centre & Support",
    icon: "lifebuoy",
    description: "Email, call, or WhatsApp",
    route: "HelpSupport",
  },
];

const OWNER_EMAIL = "jeroen@jeroenandpaws.com";

const MoreScreen = ({ navigation }) => {
  const { session, setSession } = useSession();
  const isOwner =
    session?.email?.toLowerCase() === OWNER_EMAIL.toLowerCase();

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
                <MaterialCommunityIcons
                  name={item.icon}
                  size={20}
                  color="#7c45f3"
                  style={styles.menuIcon}
                />
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
        {isOwner ? (
          <>
            <Text style={styles.sectionTitle}>Owner tools</Text>
            <View style={styles.sectionCard}>
              <Pressable
                style={[styles.menuItem, styles.menuItemLast]}
                onPress={() => navigation.navigate("ClientProfiles")}
              >
                <View style={styles.menuLeft}>
                  <MaterialCommunityIcons
                    name="folder-account"
                    size={20}
                    color="#7c45f3"
                    style={styles.menuIcon}
                  />
                  <View>
                    <Text style={styles.menuLabel}>Client profiles</Text>
                    <Text style={styles.menuDescription}>
                      Find and open client profiles
                    </Text>
                  </View>
                </View>
                <Text style={styles.chevron}>›</Text>
              </Pressable>
            </View>
          </>
        ) : null}
        <View style={styles.sectionCard}>
          <Pressable style={styles.menuItem} onPress={handleLogout}>
            <View style={styles.menuLeft}>
              <MaterialCommunityIcons
                name="logout"
                size={20}
                color="#7c45f3"
                style={styles.menuIcon}
              />
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
    backgroundColor: "#0c081f",
  },
  container: {
    flexGrow: 1,
    backgroundColor: "#0c081f",
    padding: 20,
    paddingBottom: 32,
  },
  chevron: {
    fontSize: 20,
    color: "#8b7ca8",
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#f4f2ff",
    marginBottom: 12,
  },
  sectionCard: {
    backgroundColor: "#120d23",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#1f1535",
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
    borderBottomColor: "#1f1535",
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuIcon: {
    marginRight: 10,
  },
  menuLabel: {
    fontSize: 15,
    color: "#f4f2ff",
    fontWeight: "600",
  },
  menuDescription: {
    fontSize: 12,
    color: "#c9c5d8",
    marginTop: 2,
  },
});

export default MoreScreen;