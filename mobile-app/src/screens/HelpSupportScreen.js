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

return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <ScreenHeader title="Help & Support" onBack={() => navigation.goBack()} />
        <Pressable style={styles.card} onPress={handleEmailPress}>
          <Text style={styles.cardTitle}>Email us</Text>
          <Text style={styles.cardDescription}>{SUPPORT_EMAIL}</Text>
        </Pressable>
        <Pressable style={styles.card} onPress={handleCallPress}>
          <Text style={styles.cardTitle}>Call</Text>
          <Text style={styles.cardDescription}>{SUPPORT_PHONE}</Text>
        </Pressable>
        <Pressable
          style={styles.card}
          onPress={() => navigation.navigate("MainTabs", { screen: "Messages" })}
        >
          <Text style={styles.cardTitle}>Live chat</Text>
          <Text style={styles.cardDescription}>
            Chat with us directly inside the app.
          </Text>
        </Pressable>
        <View style={styles.noteCard}>
          <Text style={styles.noteText}>
            We are available Monday to Saturday, 08:00–18:00.
          </Text>
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
    padding: 20,
    paddingBottom: 32,
    backgroundColor: "#f6f3fb",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#ebe4f7",
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#2b1a4b",
  },
  cardDescription: {
    fontSize: 13,
    color: "#6c5a92",
    marginTop: 6,
  },
  noteCard: {
    backgroundColor: "#efe9fb",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e6def6",
  },
  noteText: {
    fontSize: 13,
    color: "#6c5a92",
    textAlign: "center",
  },
});

export default HelpSupportScreen;