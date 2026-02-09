import { useMemo } from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { useTheme } from "../context/ThemeContext";

const PrimaryButton = ({
  label,
  onPress,
  variant = "primary",
  disabled = false,
  accessibilityLabel,
}) => {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        variant === "outline" && styles.buttonOutline,
        variant === "secondary" && styles.buttonSecondary,
        disabled && styles.buttonDisabled,
        pressed && !disabled && styles.buttonPressed,
      ]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || label}
      disabled={disabled}
    >
      <Text
        style={[
          styles.text,
          variant === "outline" && styles.textOutline,
          variant === "secondary" && styles.textSecondary,
          disabled && styles.textDisabled,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
};

const createStyles = (theme) =>
  StyleSheet.create({
    button: {
      backgroundColor: theme.colors.accentDeep,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.xl,
      borderRadius: theme.radius.pill,
      alignItems: "center",
      marginVertical: theme.spacing.xs,
      borderWidth: 1,
      borderColor: theme.colors.accentDeep,
      shadowColor: theme.shadow.lift.shadowColor,
      shadowOpacity: theme.shadow.lift.shadowOpacity,
      shadowOffset: theme.shadow.lift.shadowOffset,
      shadowRadius: theme.shadow.lift.shadowRadius,
      elevation: theme.shadow.lift.elevation,
      minHeight: 52,
      justifyContent: "center",
    },
    buttonOutline: {
      backgroundColor: "transparent",
      borderColor: theme.colors.borderStrong,
      shadowOpacity: 0,
      elevation: 0,
    },
    buttonSecondary: {
      backgroundColor: theme.colors.surfaceElevated,
      borderColor: theme.colors.borderSoft,
      shadowOpacity: theme.shadow.soft.shadowOpacity,
      shadowOffset: theme.shadow.soft.shadowOffset,
      shadowRadius: theme.shadow.soft.shadowRadius,
      elevation: theme.shadow.soft.elevation,
    },
    buttonDisabled: {
      backgroundColor: theme.colors.surfaceAccent,
      borderColor: theme.colors.borderSoft,
      shadowOpacity: 0,
      elevation: 0,
    },
    buttonPressed: {
      opacity: 0.9,
      transform: [{ scale: 0.98 }],
    },
    text: {
      color: theme.colors.white,
      fontWeight: "700",
      letterSpacing: 0.3,
    },
    textOutline: {
      color: theme.colors.textPrimary,
      fontWeight: "600",
    },
    textSecondary: {
      color: theme.colors.textPrimary,
      fontWeight: "600",
    },
    textDisabled: {
      color: theme.colors.textMuted,
      fontWeight: "600",
    },
  });

export default PrimaryButton;
