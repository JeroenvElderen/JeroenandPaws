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
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.lg,
      borderRadius: theme.radius.lg,
      alignItems: "center",
      marginVertical: theme.spacing.xs,
      shadowColor: theme.shadow.soft.shadowColor,
      shadowOpacity: theme.shadow.soft.shadowOpacity,
      shadowOffset: theme.shadow.soft.shadowOffset,
      shadowRadius: theme.shadow.soft.shadowRadius,
      elevation: theme.shadow.soft.elevation,
    },
    buttonOutline: {
      backgroundColor: "transparent",
      borderWidth: 1,
      borderColor: theme.colors.accent,
      shadowOpacity: 0,
      elevation: 0,
    },
    buttonPressed: {
      opacity: 0.85,
      transform: [{ scale: 0.98 }],
    },
    text: {
      color: theme.colors.white,
      fontWeight: "600",
      letterSpacing: 0.2,
    },
    textOutline: {
      color: theme.colors.textPrimary,
    },
  });

export default PrimaryButton;