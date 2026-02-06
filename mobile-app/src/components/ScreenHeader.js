import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTheme } from "../context/ThemeContext";

const ScreenHeader = ({ title, onBack, variant = "dark" }) => {
  const isDark = variant === "dark";
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
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

const createStyles = (theme) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.sm,
      marginBottom: theme.spacing.md,
    },
    backButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: theme.colors.white,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    backIcon: {
      fontSize: 16,
      color: theme.colors.textMuted,
    },
    containerDark: {
      marginBottom: theme.spacing.lg,
    },
    backButtonDark: {
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.border,
    },
    backIconDark: {
      color: theme.colors.textPrimary,
    },
    backPlaceholder: {
      width: 36,
      height: 36,
    },
    title: {
      ...theme.typography.headline,
      color: theme.colors.textPrimary,
    },
    titleDark: {
      color: theme.colors.textPrimary,
    },
  });

export default ScreenHeader;
