import { useMemo } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import ScreenHeader from "../components/ScreenHeader";
import { supabase } from "../api/supabaseClient";
import { useSession } from "../context/SessionContext";
import { THEME_MODES, THEME_PREFERENCES, useTheme } from "../context/ThemeContext";

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
  const { theme, mode, preference, setThemeMode, setThemePreference } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const isOwner =
    session?.email?.toLowerCase() === OWNER_EMAIL.toLowerCase();
  const isSystemPreference = preference === THEME_PREFERENCES.system;

  const handleSetManualMode = async (nextMode) => {
    await setThemePreference(THEME_PREFERENCES.manual);
    await setThemeMode(nextMode);
  };

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
              onPress={() =>
                navigation.navigate(item.route, { returnTo: "Profile" })
              }
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
                onPress={() =>
                  navigation.navigate("ClientProfiles", { returnTo: "Profile" })
                }
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
        <Text style={styles.sectionTitle}>Appearance</Text>
        <View style={styles.sectionCard}>
          <Pressable
            style={styles.menuItem}
            onPress={() => setThemePreference(THEME_PREFERENCES.system)}
          >
            <View style={styles.menuLeft}>
              <MaterialCommunityIcons
                name="theme-light-dark"
                size={20}
                color={theme.colors.accent}
                style={styles.menuIcon}
              />
              <View>
                <Text style={styles.menuLabel}>Use device setting</Text>
                <Text style={styles.menuDescription}>
                  Follow your phone's light or dark mode.
                </Text>
              </View>
            </View>
            <Text style={styles.chevron}>
              {isSystemPreference ? "✓" : "›"}
            </Text>
          </Pressable>
          <Pressable
            style={styles.menuItem}
            onPress={() => handleSetManualMode(THEME_MODES.light)}
          >
            <View style={styles.menuLeft}>
              <MaterialCommunityIcons
                name="white-balance-sunny"
                size={20}
                color={theme.colors.accent}
                style={styles.menuIcon}
              />
              <View>
                <Text style={styles.menuLabel}>Light mode</Text>
                <Text style={styles.menuDescription}>
                  Bright background with dark text.
                </Text>
              </View>
            </View>
            <Text style={styles.chevron}>
              {!isSystemPreference && mode === THEME_MODES.light ? "✓" : "›"}
            </Text>
          </Pressable>
          <Pressable
            style={[styles.menuItem, styles.menuItemLast]}
            onPress={() => handleSetManualMode(THEME_MODES.dark)}
          >
            <View style={styles.menuLeft}>
              <MaterialCommunityIcons
                name="weather-night"
                size={20}
                color={theme.colors.accent}
                style={styles.menuIcon}
              />
              <View>
                <Text style={styles.menuLabel}>Dark mode</Text>
                <Text style={styles.menuDescription}>
                  Dark background with light text.
                </Text>
              </View>
            </View>
            <Text style={styles.chevron}>
              {!isSystemPreference && mode === THEME_MODES.dark ? "✓" : "›"}
            </Text>
          </Pressable>
        </View>
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
      marginBottom: theme.spacing.sm,
    },
    sectionCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginBottom: theme.spacing.lg,
      overflow: "hidden",
    },
    menuItem: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
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
      marginRight: theme.spacing.sm,
    },
    menuLabel: {
      fontSize: theme.typography.body.fontSize,
      color: theme.colors.textPrimary,
      fontWeight: "600",
    },
    menuDescription: {
      fontSize: theme.typography.caption.fontSize,
      color: theme.colors.textSecondary,
      marginTop: 2,
    },
  });

export default MoreScreen;
