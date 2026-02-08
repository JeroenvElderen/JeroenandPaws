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
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      marginBottom: theme.spacing.md,
      borderRadius: theme.radius.xl,
      backgroundColor: theme.colors.surfaceGlass,
      borderWidth: 1,
      borderColor: theme.colors.borderSoft,
      shadowColor: theme.shadow.soft.shadowColor,
      shadowOpacity: theme.shadow.soft.shadowOpacity,
      shadowOffset: theme.shadow.soft.shadowOffset,
      shadowRadius: theme.shadow.soft.shadowRadius,
      elevation: theme.shadow.soft.elevation,
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.colors.surfaceElevated,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: theme.colors.borderSoft,
    },
    backIcon: {
      fontSize: 18,
      color: theme.colors.textPrimary,
    },
    backPlaceholder: {
      width: 40,
      height: 40,
    },
    title: {
      fontSize: theme.typography.headline.fontSize,
      fontWeight: "700",
      letterSpacing: theme.typography.headline.letterSpacing,
      color: theme.colors.textPrimary,
    },
  });

export default ScreenHeader;
