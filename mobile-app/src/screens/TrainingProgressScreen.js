import { useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ScreenHeader from "../components/ScreenHeader";
import { useTheme } from "../context/ThemeContext";

const SKILL_PROGRESS = [
  { skill: "Lead walking", progress: 82, sessions: 14, trend: "+8% this month" },
  { skill: "Recall", progress: 64, sessions: 9, trend: "+12% this month" },
  { skill: "Social confidence", progress: 71, sessions: 11, trend: "+5% this month" },
  { skill: "Calm greetings", progress: 58, sessions: 6, trend: "+10% this month" },
];

const TrainingProgressScreen = ({ navigation, route }) => {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <ScreenHeader
          title="Training progress"
          onBack={() => navigation.navigate(route?.params?.returnTo || "ProfileHome")}
        />
        <Text style={styles.subtitle}>
          Skill-by-skill progress based on recent sessions.
        </Text>
        {SKILL_PROGRESS.map((item) => (
          <View key={item.skill} style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.skill}>{item.skill}</Text>
              <Text style={styles.percent}>{item.progress}%</Text>
            </View>
            <View style={styles.barTrack}>
              <View style={[styles.barFill, { width: `${item.progress}%` }]} />
            </View>
            <View style={styles.row}>
              <Text style={styles.meta}>{item.sessions} sessions logged</Text>
              <Text style={styles.trend}>{item.trend}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (theme) =>
  StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: theme.colors.background },
    container: { padding: 20, gap: 12 },
    subtitle: { color: theme.colors.textSecondary, marginBottom: 6 },
    card: {
      backgroundColor: theme.colors.surfaceElevated,
      borderRadius: theme.radius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: 14,
      gap: 8,
    },
    row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    skill: { color: theme.colors.textPrimary, fontSize: 15, fontWeight: "700" },
    percent: { color: theme.colors.accent, fontWeight: "700" },
    barTrack: {
      height: 8,
      borderRadius: 99,
      backgroundColor: theme.colors.surfaceAccent,
      overflow: "hidden",
    },
    barFill: { height: "100%", backgroundColor: theme.colors.accent, borderRadius: 99 },
    meta: { color: theme.colors.textMuted, fontSize: 12 },
    trend: { color: theme.colors.textSecondary, fontSize: 12, fontWeight: "600" },
  });

export default TrainingProgressScreen;