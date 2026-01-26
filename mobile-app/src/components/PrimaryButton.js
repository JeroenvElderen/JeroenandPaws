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
    backgroundColor: "#6c3ad6",
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 20,
    alignItems: "center",
    marginVertical: 6,
    shadowColor: "#6c3ad6",
    shadowOpacity: 0.16,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 14,
    elevation: 3,
  },
  buttonOutline: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#c9b8ee",
    shadowOpacity: 0.04,
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
    color: "#5d2fc5",
  },
});

export default PrimaryButton;