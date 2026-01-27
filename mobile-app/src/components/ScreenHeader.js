import { Pressable, StyleSheet, Text, View } from "react-native";

const ScreenHeader = ({ title, onBack }) => (
  <View style={styles.container}>
    {onBack ? (
      <Pressable style={styles.backButton} onPress={onBack}>
        <Text style={styles.backIcon}>←</Text>
      </Pressable>
    ) : (
      <View style={styles.backPlaceholder} />
    )}
    <Text style={styles.title}>{title}</Text>
    <View style={styles.backPlaceholder} />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    paddingVertical: 6,
    marginBottom: 12,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#e7def7",
  },
  backIcon: {
    fontSize: 16,
    color: "#46315f",
  },
  backPlaceholder: {
    width: 36,
    height: 36,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2b1a4b",
  },
});

export default ScreenHeader;