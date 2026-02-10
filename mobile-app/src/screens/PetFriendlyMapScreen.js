import Constants from "expo-constants";
import { useCallback, useMemo } from "react";
import {
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import ScreenHeader from "../components/ScreenHeader";
import { useTheme } from "../context/ThemeContext";

const LOCATIONS = [
  {
    name: "Bray Seafront Walk",
    type: "Walking route",
    distance: "1.8 km",
    latitude: 53.2028,
    longitude: -6.0988,
    mapsQuery: "Bray Seafront",
  },
  {
    name: "Kilruddery Woodland Trails",
    type: "Trail",
    distance: "6.2 km",
    latitude: 53.1762,
    longitude: -6.1148,
    mapsQuery: "Kilruddery House and Gardens",
  },
  {
    name: "Greystones Harbour Park",
    type: "Open park",
    distance: "8.4 km",
    latitude: 53.1457,
    longitude: -6.0638,
    mapsQuery: "Greystones Harbour",
  },
];

const extraConfig =
  Constants.expoConfig?.extra ??
  Constants.manifest?.extra ??
  Constants.manifest2?.extra ??
  {};
const MAPBOX_TOKEN = extraConfig.mapboxToken || process.env.EXPO_PUBLIC_MAPBOX_TOKEN;

const getMapboxStaticUrl = () => {
  if (!MAPBOX_TOKEN) return null;
  const markers = LOCATIONS.map(
    (item) => `pin-s+4D8EFF(${item.longitude},${item.latitude})`,
  ).join(",");
  return `https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/${markers}/-6.09,53.17,10.2/900x500?access_token=${MAPBOX_TOKEN}`;
};

const PetFriendlyMapScreen = ({ navigation, route }) => {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
const mapImageUrl = getMapboxStaticUrl();

  const handleBack = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }
    navigation.navigate(route?.params?.returnTo || "ProfileHome");
  }, [navigation, route?.params]);

  const openMaps = async (query) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
    await Linking.openURL(url);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator
        indicatorStyle={theme.isDark ? "white" : "black"}
      >
        <ScreenHeader title="Pet-friendly map" onBack={handleBack} />
        {mapImageUrl ? (
          <View style={styles.mapCard}>
            <Image source={{ uri: mapImageUrl }} style={styles.mapImage} resizeMode="cover" />
            <Text style={styles.mapTitle}>Nearby pet-friendly locations</Text>
            <Text style={styles.mapSubtitle}>Live static map preview powered by Mapbox.</Text>
          </View>
        ) : (
          <View style={styles.mapPlaceholder}>
            <MaterialCommunityIcons name="map-marker-radius" size={36} color={theme.colors.accent} />
            <Text style={styles.mapTitle}>Add a Mapbox token to show map preview</Text>
            <Text style={styles.mapSubtitle}>Set EXPO_PUBLIC_MAPBOX_TOKEN to render all locations on the map.</Text>
          </View>
        )}
        {LOCATIONS.map((location, index) => (
          <View key={location.name}>
            <Pressable
              style={({ pressed }) => [styles.locationCard, pressed && styles.locationCardPressed]}
              onPress={() => openMaps(location.mapsQuery)}
            >
              <View>
                <Text style={styles.locationName}>{location.name}</Text>
                <Text style={styles.locationMeta}>
                  {location.type} · {location.distance}
                </Text>
              </View>
              <MaterialCommunityIcons name="arrow-top-right" size={20} color={theme.colors.textSecondary} />
            </Pressable>
            {index < LOCATIONS.length - 1 ? <View style={styles.listDivider} /> : null}
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
     mapCard: {
      borderRadius: theme.radius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      overflow: "hidden",
      marginBottom: 8,
    },
    mapImage: {
      width: "100%",
      height: 180,
      backgroundColor: theme.colors.surfaceAccent,
    },
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
    mapTitle: {
      color: theme.colors.textPrimary,
      fontWeight: "700",
      fontSize: 16,
      paddingHorizontal: 14,
      paddingTop: 12,
    },
    mapSubtitle: {
      color: theme.colors.textSecondary,
      textAlign: "center",
      paddingHorizontal: 14,
      paddingBottom: 14,
    },
    locationCard: {
      borderRadius: theme.radius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surfaceElevated,
      paddingVertical: 14,
      paddingHorizontal: 14,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
    },
    locationCardPressed: { opacity: 0.8 },
    locationName: { color: theme.colors.textPrimary, fontWeight: "700", fontSize: 15 },
    locationMeta: { color: theme.colors.textSecondary, marginTop: 2 },
    listDivider: {
      height: 1,
      backgroundColor: theme.colors.borderSoft,
      marginVertical: 6,
      marginHorizontal: 4,
    },
  });

export default PetFriendlyMapScreen;