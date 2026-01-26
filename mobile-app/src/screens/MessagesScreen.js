import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

const mockThreads = [
  {
    id: "support",
    title: "Support",
    preview: "Hi Jeroen! Let us know how we can help with your booking.",
    timestamp: "Just now",
  },
  {
    id: "walker",
    title: "Your walker",
    preview: "See you tomorrow at 09:00 for the stroll.",
    timestamp: "2h ago",
  },
];

const MessagesScreen = () => (
  <SafeAreaView style={styles.safeArea}>
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Messages</Text>
      {mockThreads.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>No messages yet.</Text>
        </View>
      ) : (
        mockThreads.map((thread) => (
          <Pressable key={thread.id} style={styles.threadCard}>
            <View style={styles.threadHeader}>
              <Text style={styles.threadTitle}>{thread.title}</Text>
              <Text style={styles.threadTime}>{thread.timestamp}</Text>
            </View>
            <Text style={styles.threadPreview}>{thread.preview}</Text>
          </Pressable>
        ))
      )}
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
    padding: 20,
    paddingBottom: 32,
    backgroundColor: "#f6f3fb",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#2b1a4b",
    marginBottom: 16,
    textAlign: "center",
  },
  emptyCard: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#ebe4f7",
  },
  emptyText: {
    fontSize: 14,
    color: "#7b6a9f",
  },
  threadCard: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#ebe4f7",
    marginBottom: 12,
  },
  threadHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  threadTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#2b1a4b",
  },
  threadTime: {
    fontSize: 12,
    color: "#7b6a9f",
  },
  threadPreview: {
    fontSize: 13,
    color: "#6c5a92",
  },
});

export default MessagesScreen;