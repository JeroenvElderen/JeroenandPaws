import { Pressable, StyleSheet, Text } from "react-native";

const PrimaryButton = ({ label, onPress, variant = "primary" }) => (
  <Pressable
    style={({ pressed }) => [
      styles.button,
      variant === "outline" && styles.buttonOutline,
      pressed && styles.buttonPressed,
    ]}
    onPress={onPress}
  >
    <Text style={[styles.text, variant === "outline" && styles.textOutline]}>
      {label}
    </Text>
  </Pressable>
);

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#7c45f3",
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 20,
    alignItems: "center",
    marginVertical: 6,
    shadowColor: "#000000",
    shadowOpacity: 0.16,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 14,
    elevation: 3,
  },
  buttonOutline: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#7c45f3",
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  text: {
    color: "#ffffff",
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  textOutline: {
    color: "#f4f2ff",
  },
});

export default PrimaryButton;