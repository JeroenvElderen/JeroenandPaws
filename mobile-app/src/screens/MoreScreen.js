import { useMemo } from "react";
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
import { useTheme } from "../context/ThemeContext";

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
  const { theme } = useTheme();
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

  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.container}
      >
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
                  color={theme.colors.accent}
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
                    color={theme.colors.accent}
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
                color={theme.colors.accent}
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

const createStyles = (theme) =>
  StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flexGrow: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },
  scrollView: {
    backgroundColor: theme.colors.background,
  },
  chevron: {
    fontSize: 20,
    color: theme.colors.textMuted,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  sectionCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.lg,
    overflow: "hidden",
    ...theme.shadow.soft,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
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
    color: theme.colors.textPrimary,
    fontWeight: "600",
  },
  menuDescription: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  });

export default MoreScreen;
