import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

const services = [
  {
    title: "Boarding",
    description: "in the sitter's home",
    icon: "🏠",
  },
  {
    title: "House Sitting",
    description: "in your home",
    icon: "🛋️",
  },
  {
    title: "Drop-In Visits",
    description: "visits in your home",
    icon: "🐾",
  },
  {
    title: "Doggy Day Care",
    description: "in the sitter's home",
    icon: "☀️",
  },
  {
    title: "Dog Walking",
    description: "in your neighbourhood",
    icon: "🚶‍♂️",
  },
];

const BookScreen = ({ navigation }) => (
  <SafeAreaView style={styles.safeArea}>
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => navigation.navigate("Home")}
        >
          <Text style={styles.backIcon}>←</Text>
        </Pressable>
        <Text style={styles.title}>Select a Service</Text>
      </View>
      <View style={styles.list}>
        {services.map((service) => (
          <View key={service.title} style={styles.serviceCard}>
            <View style={styles.serviceIcon}>
              <Text style={styles.serviceIconText}>{service.icon}</Text>
            </View>
            <View style={styles.serviceCopy}>
              <Text style={styles.serviceTitle}>{service.title}</Text>
              <Text style={styles.serviceDescription}>{service.description}</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  </SafeAreaView>
);

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
  header: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    minHeight: 44,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#e7def7",
    position: "absolute",
    left: 0,
  },
  backIcon: {
    fontSize: 18,
    color: "#46315f",
  },
  title: {
    color: "#2b1a4b",
    fontSize: 20,
    fontWeight: "700",
  },
  list: {
    paddingBottom: 8,
  },
  serviceCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#ebe4f7",
    shadowColor: "#2b1a4b",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 2,
    marginBottom: 12,
  },
  serviceIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#efe9fb",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  serviceCopy: {
    flex: 1,
    },
  serviceIconText: {
    fontSize: 20,
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2b1a4b",
  },
  serviceDescription: {
    fontSize: 14,
    color: "#7b6a9f",
    marginTop: 4,
  },
  chevron: {
    fontSize: 22,
    color: "#b2a6c9",
  },
});

export default BookScreen;