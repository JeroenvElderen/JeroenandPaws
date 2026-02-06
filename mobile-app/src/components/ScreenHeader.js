import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTheme } from "../context/ThemeContext";

const ScreenHeader = ({ title, onBack }) => {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  return (
    <View style={styles.container}>
      {onBack ? (
        <Pressable
          style={styles.backButton}
          onPress={onBack}
        >
          <Text style={styles.backIcon}>←</Text>
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
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      marginBottom: theme.spacing.sm,
    },
    backButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: theme.colors.surface,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    backIcon: {
      fontSize: 16,
      color: theme.colors.textPrimary,
    },
    backPlaceholder: {
      width: 36,
      height: 36,
    },
    title: {
      fontSize: theme.typography.headline.fontSize,
      fontWeight: "700",
      color: theme.colors.textPrimary,
    },
  });

export default ScreenHeader;