import { Pressable, StyleSheet, Text } from "react-native";

const PrimaryButton = ({ label, onPress, variant = "primary" }) => (
  <Pressable
    style={[styles.button, variant === "outline" && styles.buttonOutline]}
    onPress={onPress}
  >
    <Text
      style={[styles.text, variant === "outline" && styles.textOutline]}
    >
      {label}
    </Text>
  </Pressable>
);

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#7c45f3",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 999,
    alignItems: "center",
    marginVertical: 6,
  },
  buttonOutline: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#7c45f3",
  },
  text: {
    color: "#fff",
    fontWeight: "600",
  },
  textOutline: {
    color: "#7c45f3",
  },
});

export default PrimaryButton;