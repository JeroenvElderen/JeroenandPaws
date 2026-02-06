import { useMemo } from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { useTheme } from "../context/ThemeContext";

const PrimaryButton = ({ label, onPress, variant = "primary" }) => {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
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
};

const createStyles = (theme) =>
  StyleSheet.create({
    button: {
      backgroundColor: theme.colors.accent,
      paddingVertical: 14,
      paddingHorizontal: 20,
      borderRadius: 24,
      alignItems: "center",
      marginVertical: 8,
      ...theme.shadow.glow,
    },
    buttonOutline: {
      backgroundColor: "transparent",
      borderWidth: 1,
      borderColor: theme.colors.accent,
      shadowOpacity: 0,
      elevation: 0,
    },
    buttonPressed: {
      opacity: 0.9,
      transform: [{ scale: 0.985 }],
    },
    text: {
      color: theme.colors.white,
      fontWeight: "700",
      letterSpacing: 0.3,
      fontSize: 15,
    },
    textOutline: {
      color: theme.colors.textPrimary,
    },
  });

export default PrimaryButton;
