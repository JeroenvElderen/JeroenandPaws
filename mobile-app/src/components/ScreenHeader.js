import { Pressable, StyleSheet, Text, View } from "react-native";

const ScreenHeader = ({ title, onBack, variant = "light" }) => {
  const isDark = variant === "dark";
  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      {onBack ? (
        <Pressable
          style={[styles.backButton, isDark && styles.backButtonDark]}
          onPress={onBack}
        >
          <Text style={[styles.backIcon, isDark && styles.backIconDark]}>
            ←
          </Text>
        </Pressable>
      ) : (
        <View style={styles.backPlaceholder} />
      )}
      <Text style={[styles.title, isDark && styles.titleDark]}>{title}</Text>
      <View style={styles.backPlaceholder} />
    </View>
  );
};

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
  containerDark: {
    marginBottom: 16,
  },
  backButtonDark: {
    backgroundColor: "#120d23",
    borderColor: "#1f1535",
  },
  backIconDark: {
    color: "#f4f2ff",
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
  titleDark: {
    color: "#f4f2ff",
  },
});

export default ScreenHeader;