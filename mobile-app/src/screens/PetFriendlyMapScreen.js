import { useMemo } from "react";
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import ScreenHeader from "../components/ScreenHeader";
import { useTheme } from "../context/ThemeContext";

const LOCATIONS = [
  { name: "Bray Seafront Walk", type: "Walking route", distance: "1.8 km", mapsQuery: "Bray Seafront" },
  { name: "Kilruddery Woodland Trails", type: "Trail", distance: "6.2 km", mapsQuery: "Kilruddery House and Gardens" },
  { name: "Greystones Harbour Park", type: "Open park", distance: "8.4 km", mapsQuery: "Greystones Harbour" },
];

const PetFriendlyMapScreen = ({ navigation, route }) => {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const openMaps = async (query) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
    await Linking.openURL(url);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <ScreenHeader
          title="Pet-friendly map"
          onBack={() => navigation.navigate(route?.params?.returnTo || "ProfileHome")}
        />
        <View style={styles.mapPlaceholder}>
          <MaterialCommunityIcons name="map-marker-radius" size={36} color={theme.colors.accent} />
          <Text style={styles.mapTitle}>Nearby pet-friendly places</Text>
          <Text style={styles.mapSubtitle}>Tap a place to open directions in your maps app.</Text>
        </View>
        {LOCATIONS.map((location) => (
          <Pressable
            key={location.name}
            style={({ pressed }) => [styles.locationCard, pressed && styles.locationCardPressed]}
            onPress={() => openMaps(location.mapsQuery)}
          >
            <View>
              <Text style={styles.locationName}>{location.name}</Text>
              <Text style={styles.locationMeta}>{location.type} · {location.distance}</Text>
            </View>
            <MaterialCommunityIcons name="arrow-top-right" size={20} color={theme.colors.textSecondary} />
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (theme) =>
  StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: theme.colors.background },
    container: { padding: 20, gap: 12 },
    mapPlaceholder: {
      borderRadius: theme.radius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      padding: 20,
      alignItems: "center",
      gap: 8,
      marginBottom: 8,
    },
    mapTitle: { color: theme.colors.textPrimary, fontWeight: "700", fontSize: 16 },
    mapSubtitle: { color: theme.colors.textSecondary, textAlign: "center" },
    locationCard: {
      borderRadius: theme.radius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surfaceElevated,
      padding: 14,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    locationCardPressed: { opacity: 0.85 },
    locationName: { color: theme.colors.textPrimary, fontWeight: "700" },
    locationMeta: { color: theme.colors.textMuted, marginTop: 2 },
  });

export default PetFriendlyMapScreen;