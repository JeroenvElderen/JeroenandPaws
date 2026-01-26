import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useEffect, useMemo, useState } from "react";
import { fetchJson } from "../api/client";

const BookScreen = ({ navigation }) => {
  const [services, setServices] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [selectedServiceId, setSelectedServiceId] = useState(null);

useEffect(() => {
    let isMounted = true;

    const loadServices = async () => {
      try {
        const data = await fetchJson("/api/services");
        if (!isMounted) return;
        const fetched = data.services || [];
        setServices(fetched);
        if (fetched.length > 0) {
          setActiveCategory(fetched[0].category || "Services");
          setSelectedServiceId(fetched[0].id);
        }
      } catch (error) {
        console.error("Failed to load services", error);
      }
    };

    loadServices();

    return () => {
      isMounted = false;
    };
  }, []);

  const categories = useMemo(() => {
    const grouped = services.reduce((acc, service) => {
      const category = service.category || "Services";
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(service);
      return acc;
    }, {});

    return Object.entries(grouped).map(([category, items]) => ({
      category,
      services: items,
    }));
  }, [services]);

  const activeServices =
    categories.find((group) => group.category === activeCategory)?.services ||
    [];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Pressable
            style={styles.backButton}
            onPress={() => navigation.navigate("Home")}
          >
            <Text style={styles.backIcon}>←</Text>
          </Pressable>
          <Text style={styles.title}>Select a Service</Text>
        </View>
        <View style={styles.list}>
          {categories.map((group) => (
            <Pressable
              key={group.category}
              style={({ pressed }) => [
                styles.serviceCard,
                activeCategory === group.category && styles.serviceCardActive,
                pressed && styles.cardPressed,
              ]}
              onPress={() => setActiveCategory(group.category)}
            >
              <View style={styles.serviceIcon}>
                <Text style={styles.serviceIconText}>🐾</Text>
              </View>
              <View style={styles.serviceCopy}>
                <Text style={styles.serviceTitle}>{group.category}</Text>
                <Text style={styles.serviceDescription}>
                  Choose a service type from this category
                </Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Booking details</Text>
          <Text style={styles.formSubtitle}>
            Choose a service option from your Supabase catalog.
          </Text>
          {activeServices.length === 0 ? (
            <Text style={styles.emptyText}>
              No services available for this category yet.
            </Text>
          ) : (
            <View style={styles.optionsList}>
              {activeServices.map((service) => (
                <Pressable
                  key={service.id}
                  style={({ pressed }) => [
                    styles.optionRow,
                    selectedServiceId === service.id && styles.optionRowActive,
                    pressed && styles.cardPressed,
                  ]}
                  onPress={() => setSelectedServiceId(service.id)}
                >
                  <View>
                    <Text style={styles.optionLabel}>{service.title}</Text>
                    {service.description ? (
                      <Text style={styles.optionDescription}>
                        {service.description}
                      </Text>
                    ) : null}
                  </View>
                  <View
                    style={[
                      styles.optionDot,
                      selectedServiceId === service.id && styles.optionDotActive,
                    ]}
                  />
                </Pressable>
              ))}
            </View>
            )}
          <Pressable style={styles.ctaButton}>
            <Text style={styles.ctaButtonText}>Open booking form</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f6f3fb",
  },
  container: {
    flexGrow: 1,
    backgroundColor: "#f6f3fb",
    padding: 20,
    paddingBottom: 32,
  },
  header: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    minHeight: 44,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#e7def7",
    position: "absolute",
    left: 0,
  },
  backIcon: {
    fontSize: 18,
    color: "#46315f",
  },
  title: {
    color: "#2b1a4b",
    fontSize: 20,
    fontWeight: "700",
  },
  list: {
    paddingBottom: 8,
  },
  serviceCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#ebe4f7",
    shadowColor: "#2b1a4b",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 2,
    marginBottom: 12,
  },
  serviceCardActive: {
    borderColor: "#c9b8ee",
    shadowOpacity: 0.12,
  },
  cardPressed: {
    opacity: 0.95,
    transform: [{ scale: 0.99 }],
  },
  serviceIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#efe9fb",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  serviceCopy: {
    flex: 1,
  },
  serviceIconText: {
    fontSize: 20,
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2b1a4b",
  },
  serviceDescription: {
    fontSize: 14,
    color: "#7b6a9f",
    marginTop: 4,
  },
  chevron: {
    fontSize: 22,
    color: "#b2a6c9",
  },
  formCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "#ebe4f7",
    marginTop: 8,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2b1a4b",
    marginBottom: 6,
  },
  formSubtitle: {
    fontSize: 14,
    color: "#7b6a9f",
    marginBottom: 14,
  },
  optionsList: {
    gap: 10,
    marginBottom: 16,
  },
  optionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#efe9fb",
    backgroundColor: "#fbf9ff",
  },
  optionRowActive: {
    borderColor: "#c9b8ee",
    backgroundColor: "#f2edff",
  },
  optionLabel: {
    color: "#2b1a4b",
    fontSize: 14,
    fontWeight: "600",
  },
  optionDescription: {
    fontSize: 12,
    color: "#7b6a9f",
    marginTop: 4,
  },
  optionDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: "#d2c7ea",
    backgroundColor: "#ffffff",
  },
  optionDotActive: {
    borderColor: "#6c3ad6",
    backgroundColor: "#6c3ad6",
  },
  ctaButton: {
    backgroundColor: "#6c3ad6",
    borderRadius: 18,
    paddingVertical: 12,
    alignItems: "center",
  },
  ctaButtonText: {
    color: "#ffffff",
    fontWeight: "600",
  },
  emptyText: {
    fontSize: 13,
    color: "#7b6a9f",
    marginBottom: 16,
  },
});

export default BookScreen;