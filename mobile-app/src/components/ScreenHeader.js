import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";

const ScreenHeader = ({ title, onBack, backLabel = "Back" }) => {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  return (
    <View style={styles.container}>
      {onBack ? (
        <Pressable style={styles.backButton} onPress={onBack}>
          <Ionicons
            name="chevron-back"
            size={18}
            color={theme.colors.textPrimary}
          />
          <Text style={styles.backLabel}>{backLabel}</Text>
        </Pressable>
      ) : (
        <View style={styles.backPlaceholder} />
      )}
      <Text style={styles.title}>{title}</Text>
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
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      marginBottom: theme.spacing.md,
      borderRadius: theme.radius.xl,
      backgroundColor: theme.colors.surfaceElevated,
      borderWidth: 1,
      borderColor: theme.colors.borderStrong,
      shadowColor: theme.shadow.soft.shadowColor,
      shadowOpacity: theme.shadow.soft.shadowOpacity,
      shadowOffset: theme.shadow.soft.shadowOffset,
      shadowRadius: theme.shadow.soft.shadowRadius,
      elevation: theme.shadow.soft.elevation,
    },
    backButton: {
      minWidth: 56,
      height: 44,
      borderRadius: 22,
      backgroundColor: theme.colors.surface,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: theme.colors.borderStrong,
      flexDirection: "row",
      paddingHorizontal: 8,
      gap: 2,
    },
    backPlaceholder: {
      width: 56,
      height: 44,
    },
    backLabel: {
      fontSize: 12,
      fontWeight: "600",
      color: theme.colors.textPrimary,
    },
    title: {
      fontSize: 20,
      fontWeight: "700",
      letterSpacing: 0.3,
      color: theme.colors.textPrimary,
    },
  });

export default ScreenHeader;
