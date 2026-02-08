import { useMemo } from "react";
import {
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ScreenHeader from "../components/ScreenHeader";
import { useTheme } from "../context/ThemeContext";

const SUPPORT_EMAIL = "jeroen@jeroenandpaws.com";
const SUPPORT_PHONE = "+353872473099";
const SUPPORT_WHATSAPP = "https://wa.me/353872473099";

const HelpSupportScreen = ({ navigation, route }) => {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const returnTo = route?.params?.returnTo;
  const handleReturn = () => {
    if (returnTo) {
      if (returnTo === "Profile") {
        navigation.getParent()?.navigate("Profile", { screen: "ProfileHome" });
        return;
      }
      navigation.getParent()?.navigate(returnTo);
      return;
    }
    navigation.goBack();
  };
  const handleEmailPress = async () => {
    const outlookUrl = `ms-outlook://compose?to=${SUPPORT_EMAIL}`;
    const mailUrl = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
      "Jeroen & Paws app support"
    )}`;

    const canOpenOutlook = await Linking.canOpenURL(outlookUrl);
    if (canOpenOutlook) {
      await Linking.openURL(outlookUrl);
      return;
    }

    await Linking.openURL(mailUrl);
  };

  const handleCallPress = async () => {
    await Linking.openURL(`tel:${SUPPORT_PHONE}`);
  };

  const handleWhatsAppPress = async () => {
    await Linking.openURL(SUPPORT_WHATSAPP);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <ScreenHeader title="Help & Support" onBack={handleReturn} />
        <Pressable style={styles.card} onPress={handleEmailPress}>
          <Text style={styles.cardTitle}>Email us</Text>
          <Text style={styles.cardDescription}>
            {SUPPORT_EMAIL} · Replies within 24 hours
          </Text>
        </Pressable>
        <Pressable style={styles.card} onPress={handleCallPress}>
          <Text style={styles.cardTitle}>Call</Text>
          <Text style={styles.cardDescription}>
            {SUPPORT_PHONE} · 09:00-18:00
          </Text>
        </Pressable>
        <Pressable
          style={styles.card}
          onPress={() => navigation.getParent()?.navigate("Messages")}
        >
          <Text style={styles.cardTitle}>Live chat</Text>
          <Text style={styles.cardDescription}>
            Available 09:00-18:00 inside the app.
          </Text>
        </Pressable>
        <Pressable style={styles.card} onPress={handleWhatsAppPress}>
          <Text style={styles.cardTitle}>WhatsApp</Text>
          <Text style={styles.cardDescription}>
            24/7 via WhatsApp.
          </Text>
        </Pressable>
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
      padding: theme.spacing.lg,
      paddingBottom: theme.spacing.xxl,
      backgroundColor: theme.colors.background,
    },
    card: {
      backgroundColor: theme.colors.surfaceElevated,
      borderRadius: theme.radius.lg,
      padding: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.borderSoft,
      marginBottom: theme.spacing.sm,
    },
    cardTitle: {
      fontSize: theme.typography.body.fontSize,
      fontWeight: "700",
      color: theme.colors.textPrimary,
    },
    cardDescription: {
      fontSize: theme.typography.caption.fontSize,
      color: theme.colors.textSecondary,
      marginTop: theme.spacing.xs,
    },
  });

export default HelpSupportScreen;