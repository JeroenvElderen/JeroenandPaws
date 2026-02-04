import {
  Linking,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import ScreenHeader from "../components/ScreenHeader";

const SUPPORT_EMAIL = "jeroen@jeroenandpaws.com";
const SUPPORT_PHONE = "+353872473099";
const SUPPORT_WHATSAPP = "https://wa.me/353872473099";

const HelpSupportScreen = ({ navigation }) => {
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
        <ScreenHeader title="Help & Support" onBack={() => navigation.goBack()} />
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

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0c081f",
  },
  container: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 32,
    backgroundColor: "#0c081f",
  },
  card: {
    backgroundColor: "#120d23",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#1f1535",
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#f4f2ff",
  },
  cardDescription: {
    fontSize: 13,
    color: "#c9c5d8",
    marginTop: 6,
  },
});

export default HelpSupportScreen;