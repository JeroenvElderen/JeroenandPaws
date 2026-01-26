import { useEffect, useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { API_BASE_URL } from "../api/config";
import { fetchJson } from "../api/client";
import PrimaryButton from "../components/PrimaryButton";
import { useSession } from "../context/SessionContext";

const createDog = () => ({
  name: "",
  breed: "",
  age: "",
  size: "",
});

const createInitialState = (serviceLabel, session) => ({
  name: session?.name || "",
  email: session?.email || "",
  phone: "",
  serviceType: serviceLabel || "Custom booking",
  dogCount: "1",
  dogs: [createDog(), createDog(), createDog(), createDog()],
  careTiming: "",
  pickupLocation: "",
  preferences: "",
  specialNotes: "",
  message: "",
});

const buildBookingMessage = (state, serviceLabel) => {
  const dogCount = Number(state.dogCount) || 1;
  const dogDetails = (state.dogs || [])
    .slice(0, dogCount)
    .map((dog, index) => {
      const parts = [
        dog?.name && `Name: ${dog.name}`,
        dog?.breed && `Breed: ${dog.breed}`,
        dog?.age && `Age: ${dog.age}`,
        dog?.size && `Size/weight: ${dog.size}`,
      ].filter(Boolean);

      return parts.length
        ? [`Dog ${index + 1}:`, ...parts.map((detail) => `  - ${detail}`)].join(
            "\n"
          )
        : "";
    })
    .filter(Boolean);

  const lines = [
    `Service: ${state.serviceType || serviceLabel || "Custom booking"}`,
    state.dogCount && `Number of dogs: ${state.dogCount}`,
    ...dogDetails,
    state.careTiming && `Preferred timing: ${state.careTiming}`,
    state.pickupLocation && `Pickup/visit location: ${state.pickupLocation}`,
    state.preferences && `Routine & preferences: ${state.preferences}`,
    state.specialNotes && `Notes or medications: ${state.specialNotes}`,
    state.message && `Extra details: ${state.message}`,
  ].filter(Boolean);

  return lines.join("\n");
};

const BookScreen = ({ navigation }) => {
  const { session } = useSession();
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [formState, setFormState] = useState(() =>
    createInitialState("", session)
  );
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadServices = async () => {
      try {
        const data = await fetchJson("/api/services");
        if (!isMounted) return;
        setServices(data.services || []);
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

  const serviceLabel =
    selectedService?.title || selectedService?.category || "Custom booking";

  const visibleDogCount = Math.min(Number(formState.dogCount) || 1, 4);
  const visibleDogs = (formState.dogs || []).slice(0, visibleDogCount);

  const handleChange = (field, value) => {
    setFormState((current) => ({ ...current, [field]: value }));
  };

  const handleDogChange = (index, field, value) => {
    setFormState((current) => {
      const updatedDogs = [...(current.dogs || [])];
      updatedDogs[index] = { ...updatedDogs[index], [field]: value };

      return {
        ...current,
        dogs: updatedDogs,
      };
    });
  };

  const openService = (service) => {
    setSelectedService(service);
    setFormState(createInitialState(service?.title || "Custom booking", session));
    setStatus("idle");
    setError("");
  };

  const closeService = () => {
    setSelectedService(null);
    setStatus("idle");
    setError("");
  };

  const handleSubmit = async () => {
    if (!formState.name || !formState.email || !formState.careTiming) {
      setError("Please complete the required fields before submitting.");
      return;
    }

    setStatus("submitting");
    setError("");
    const composedMessage = buildBookingMessage(formState, serviceLabel);

    try {
      const response = await fetch(`${API_BASE_URL}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formState, message: composedMessage }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload?.message || "Failed to send request");
      }

      setStatus("success");
      setFormState(createInitialState(serviceLabel, session));
    } catch (submissionError) {
      setError(
        submissionError.message ||
          "Unable to send your booking request. Please try again."
      );
      setStatus("error");
    }
  };

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
        
        <Text style={styles.subtitle}>Tap a service to open the booking form.</Text>

        {categories.map((group) => (
          <View key={group.category} style={styles.categorySection}>
            <Text style={styles.sectionTitle}>{group.category}</Text>
            {group.services.map((service) => (
              <Pressable
                key={service.id}
                style={({ pressed }) => [
                  styles.serviceCard,
                  pressed && styles.cardPressed,
                ]}
                onPress={() => openService(service)}
              >
                <View style={styles.serviceIcon}>
                  <Text style={styles.serviceIconText}>🐾</Text>
                </View>
                <View style={styles.serviceCopy}>
                  <Text style={styles.serviceTitle}>{service.title}</Text>
                  <Text style={styles.serviceDescription}>
                    {service.description ||
                      "Tap to share your booking details."}
                  </Text>
                </View>
                <Text style={styles.chevron}>›</Text>
              </Pressable>
            ))}
          </View>
        ))}
      </ScrollView>

      <Modal
        visible={Boolean(selectedService)}
        animationType="slide"
        transparent
        onRequestClose={closeService}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>{serviceLabel}</Text>
                <Text style={styles.modalSubtitle}>Booking details</Text>
              </View>
              <Pressable style={styles.closeButton} onPress={closeService}>
                <Text style={styles.closeButtonText}>✕</Text>
              </Pressable>
            </View>

            <ScrollView contentContainerStyle={styles.formContent}>
              {status === "success" ? (
                <View style={styles.successCard}>
                  <Text style={styles.successTitle}>Request sent!</Text>
                  <Text style={styles.successText}>
                    Thank you! We’ll review your booking and follow up shortly.
                  </Text>
                  <PrimaryButton label="Close" onPress={closeService} />
                </View>
              ) : (
                <View>
                  <Text style={styles.formSectionTitle}>Your details</Text>
                  <Text style={styles.label}>Name *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Your name"
                    value={formState.name}
                    onChangeText={(value) => handleChange("name", value)}
                  />
                  <Text style={styles.label}>Email *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="you@example.com"
                    value={formState.email}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    onChangeText={(value) => handleChange("email", value)}
                  />
                  <Text style={styles.label}>Phone (optional)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="WhatsApp or phone number"
                    value={formState.phone}
                    keyboardType="phone-pad"
                    onChangeText={(value) => handleChange("phone", value)}
                  />
                  <Text style={styles.label}>Service type</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Service"
                    value={formState.serviceType}
                    onChangeText={(value) =>
                      handleChange("serviceType", value)
                    }
                  />

        <Text style={styles.formSectionTitle}>About your dog(s)</Text>
                  <Text style={styles.label}>How many dogs?</Text>
                  <View style={styles.optionRow}>
                    {[1, 2, 3, 4].map((count) => (
                      <Pressable
                        key={count}
                        style={({ pressed }) => [
                          styles.countChip,
                          Number(formState.dogCount) === count &&
                            styles.countChipActive,
                          pressed && styles.cardPressed,
                        ]}
                        onPress={() =>
                          handleChange("dogCount", String(count))
                        }
                      >
                        <Text
                          style={[
                            styles.countChipText,
                            Number(formState.dogCount) === count &&
                              styles.countChipTextActive,
                          ]}
                        >
                          {count}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                  {visibleDogs.map((dog, index) => (
                    <View key={`dog-${index}`} style={styles.dogCard}>
                      <Text style={styles.dogTitle}>Dog {index + 1}</Text>
                      <Text style={styles.label}>Name *</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="e.g., Luna"
                        value={dog.name}
                        onChangeText={(value) =>
                          handleDogChange(index, "name", value)
                        }
                      />
                      <Text style={styles.label}>Breed *</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="e.g., Border Collie mix"
                        value={dog.breed}
                        onChangeText={(value) =>
                          handleDogChange(index, "breed", value)
                        }
                      />
                      <View style={styles.inlineInputs}>
                        <View style={styles.inlineInput}>
                          <Text style={styles.label}>Age *</Text>
                          <TextInput
                            style={styles.input}
                            placeholder="2 years"
                            value={dog.age}
                            onChangeText={(value) =>
                              handleDogChange(index, "age", value)
                            }
                          />
                        </View>
                        <View style={styles.inlineInput}>
                          <Text style={styles.label}>Size *</Text>
                          <TextInput
                            style={styles.input}
                            placeholder="12 kg"
                            value={dog.size}
                            onChangeText={(value) =>
                              handleDogChange(index, "size", value)
                            }
                          />
                        </View>
                      </View>
                    </View>
                  ))}

                  <Text style={styles.formSectionTitle}>Care details</Text>
                  <Text style={styles.label}>Preferred dates or cadence *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Weekdays at 11:00 or March 10–12"
                    value={formState.careTiming}
                    onChangeText={(value) => handleChange("careTiming", value)}
                  />
                <Text style={styles.label}>Pickup/visit location</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Address or neighborhood"
                    value={formState.pickupLocation}
                    onChangeText={(value) =>
                      handleChange("pickupLocation", value)
                    }
                  />
                  <Text style={styles.label}>Routine & preferences</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Feeding times, leash style, play style"
                    value={formState.preferences}
                    multiline
                    onChangeText={(value) => handleChange("preferences", value)}
                  />
                  <Text style={styles.label}>Medications or special notes</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Allergies, reactivity, medical needs"
                    value={formState.specialNotes}
                    multiline
                    onChangeText={(value) =>
                      handleChange("specialNotes", value)
                    }
                  />
                  <Text style={styles.label}>Anything else?</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Share preferences, goals, or questions"
                    value={formState.message}
                    multiline
                    onChangeText={(value) => handleChange("message", value)}
                  />

                  {error ? <Text style={styles.errorText}>{error}</Text> : null}

                  <PrimaryButton
                    label={
                      status === "submitting" ? "Sending..." : "Submit request"
                    }
                    onPress={handleSubmit}
                    disabled={status === "submitting"}
                  />
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
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
    marginBottom: 12,
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
  subtitle: {
    fontSize: 14,
    color: "#6c5a92",
    textAlign: "center",
    marginBottom: 12,
  },
  categorySection: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2b1a4b",
    marginBottom: 8,
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
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(43, 26, 75, 0.35)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: "#f6f3fb",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "92%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e8def7",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2b1a4b",
  },
  modalSubtitle: {
    fontSize: 13,
    color: "#7b6a9f",
    marginTop: 2,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#e7def7",
  },
  closeButtonText: {
    fontSize: 16,
    color: "#46315f",
  },
  formContent: {
    padding: 20,
    paddingBottom: 40,
  },
  formSectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2b1a4b",
    marginTop: 8,
    marginBottom: 10,
  },
  label: {
    fontSize: 13,
    color: "#6c5a92",
    marginBottom: 6,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderColor: "#e6def6",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#2b1a4b",
    marginBottom: 12,
    backgroundColor: "#ffffff",
  },
  textArea: {
    minHeight: 90,
    textAlignVertical: "top",
  },
  optionRow: {
    flexDirection: "row",
    marginBottom: 12,
    gap: 8,
  },
  countChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e6def6",
    backgroundColor: "#ffffff",
  },
  countChipActive: {
    backgroundColor: "#6c3ad6",
    borderColor: "#6c3ad6",
  },
  countChipText: {
    color: "#5d2fc5",
    fontWeight: "600",
  },
  countChipTextActive: {
    color: "#ffffff",
  },
  dogCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#ebe4f7",
    marginBottom: 12,
  },
  dogTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#2b1a4b",
    marginBottom: 8,
  },
  inlineInputs: {
    flexDirection: "row",
    gap: 10,
  },
  inlineInput: {
    flex: 1,
  },
  errorText: {
    color: "#b42318",
    fontSize: 13,
    marginBottom: 12,
  },
  successCard: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: "#ebe4f7",
    alignItems: "center",
  },
  successTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2b1a4b",
    marginBottom: 8,
  },
  successText: {
    fontSize: 14,
    color: "#6c5a92",
    textAlign: "center",
    marginBottom: 16,
  },
});

export default BookScreen;