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
import { fetchJson } from "../api/client";
import {
  DEFAULT_AVAILABILITY_WINDOW_DAYS,
  fetchAvailability,
} from "../api/availability";
import {
  AVAILABILITY_TIMEOUT_MS,
  getCachedAvailability,
  setCachedAvailability,
} from "../api/availabilityCache";
import { supabase } from "../api/supabaseClient";
import PrimaryButton from "../components/PrimaryButton";
import { useSession } from "../context/SessionContext";

const CATEGORY_ORDER = [
  "Daily strolls",
  "Home visits",
  "Training",
  "Solo Journeys",
  "Overnight Support",
  "Daytime Care",
  "Group Adventures",
  "Custom Care",
];

const CATEGORY_ICONS = {
  Training: "🎓",
  "Overnight Support": "🌙",
  "Daytime Care": "☀️",
  "Custom Care": "🧩",
  "Group Adventures": "🧭",
  "Home visits": "🏡",
  "Solo Journeys": "🦮",
  "Daily strolls": "🚶",
  Services: "🐾",
};

const normalizeAddons = (addons = []) =>
  addons
    .map((addon, index) => {
      const label =
        addon.label ||
        addon.name ||
        addon.title ||
        addon.description ||
        "Add-on";
      const rawPrice = addon.price ?? addon.amount ?? addon.cost ?? 0;

      return {
        id: String(addon.id ?? addon.value ?? addon.slug ?? index),
        label,
        price: Number(rawPrice) || 0,
      };
    })
    .filter((addon) => addon.label);

const createDog = () => ({
  name: "",
  breed: "",
  age: "",
  size: "",
});

const createInitialState = (serviceLabel, session) => ({
  name: session?.name || "",
  email: session?.email || "",
  phone: session?.phone || "",
  address: session?.address || "",
  serviceType: serviceLabel || "Service request",
  dogCount: "1",
  dogs: [createDog(), createDog(), createDog(), createDog()],
  bookingDate: "",
  startTime: "",
  endTime: "",
  preferences: "",
  specialNotes: "",
  message: "",
});

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(amount);

const addMinutesToTime = (time, minutes) => {
  const [hours, mins] = (time || "").split(":").map((val) => Number(val));
  if (!Number.isFinite(hours) || !Number.isFinite(mins)) {
    return "";
  }
  const total = hours * 60 + mins + minutes;
  const nextHours = Math.floor((total % (24 * 60)) / 60);
  const nextMins = total % 60;
  return `${String(nextHours).padStart(2, "0")}:${String(nextMins).padStart(
    2,
    "0"
  )}`;
};

const buildBookingMessage = (
  state,
  { serviceLabel, selectedPets, selectedOptions, includeNewDogs }
) => {
  const dogCount = Number(state.dogCount) || 1;
  const dogDetails = includeNewDogs
    ? (state.dogs || [])
        .slice(0, dogCount)
        .map((dog, index) => {
          const parts = [
            dog?.name && `Name: ${dog.name}`,
            dog?.breed && `Breed: ${dog.breed}`,
            dog?.age && `Age: ${dog.age}`,
            dog?.size && `Size/weight: ${dog.size}`,
          ].filter(Boolean);

          return parts.length
            ? [
                `Dog ${index + 1}:`,
                ...parts.map((detail) => `  - ${detail}`),
              ].join("\n")
            : "";
        })
        .filter(Boolean)
    : [];

  const lines = [
    `Service: ${state.serviceType || serviceLabel || "Service request"}`,
    selectedPets.length
      ? `Existing pets: ${selectedPets.map((pet) => pet.name).join(", ")}`
      : null,
    includeNewDogs && state.dogCount
      ? `Number of new dogs: ${state.dogCount}`
      : null,
    ...dogDetails,
    state.bookingDate && `Visit date: ${state.bookingDate}`,
    state.startTime && `Start time: ${state.startTime}`,
    state.endTime && `End time: ${state.endTime}`,
    state.address && `Eircode: ${state.address}`,
    state.preferences && `Routine & preferences: ${state.preferences}`,
    state.specialNotes && `Notes or medications: ${state.specialNotes}`,
    selectedOptions.length
      ? `Add-ons: ${selectedOptions.map((option) => option.label).join(", ")}`
      : null,
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
  const [expandedCategories, setExpandedCategories] = useState({});
  const [existingPets, setExistingPets] = useState([]);
  const [selectedPetIds, setSelectedPetIds] = useState([]);
  const [showNewDogForm, setShowNewDogForm] = useState(false);
  const [selectedOptionIds, setSelectedOptionIds] = useState([]);
  const [availableAddons, setAvailableAddons] = useState([]);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [availability, setAvailability] = useState(null);
  const [availabilityStatus, setAvailabilityStatus] = useState("idle");
  const [availabilityError, setAvailabilityError] = useState("");
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [debouncedAddress, setDebouncedAddress] = useState(
    (session?.address || "").trim()
  );

  useEffect(() => {
    const trimmedAddress = (formState.address || "").trim();
    if (!trimmedAddress) {
      setDebouncedAddress("");
      return undefined;
    }

    const timeoutId = setTimeout(() => {
      setDebouncedAddress(trimmedAddress);
    }, 400);

    return () => clearTimeout(timeoutId);
  }, [formState.address]);

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

  useEffect(() => {
    let isMounted = true;

    const loadAddons = async () => {
      try {
        const data = await fetchJson("/api/addons");
        if (!isMounted) return;
        setAvailableAddons(normalizeAddons(data?.addons || []));
      } catch (error) {
        console.error("Failed to load add-ons", error);
        if (!isMounted) return;
        setAvailableAddons([]);
      }
    };

    loadAddons();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!categories.length) {
      return;
    }

    setExpandedCategories((current) => {
      if (Object.keys(current).length) {
        return current;
      }

      return { [categories[0].category]: true };
    });
  }, [categories]);

  useEffect(() => {
    let isMounted = true;

    const loadPets = async () => {
      if (!session?.email) {
        return;
      }

      try {
        const data = await fetchJson(
          `/api/pets?ownerEmail=${encodeURIComponent(session.email)}`
        );
        if (!isMounted) return;
        setExistingPets(Array.isArray(data?.pets) ? data.pets : []);
      } catch (error) {
        console.error("Failed to load pets", error);
      }
    };

    loadPets();

    return () => {
      isMounted = false;
    };
  }, [session?.email]);

  useEffect(() => {
    let isMounted = true;

    const loadAvailability = async () => {
      if (!selectedService) {
        setAvailability(null);
        setAvailabilityStatus("idle");
        setAvailabilityError("");
        setSelectedDay(null);
        setSelectedSlot(null);
        return;
      }

      const clientAddress = (debouncedAddress || "").trim();
      if (!clientAddress) {
        setAvailability(null);
        setAvailabilityStatus("idle");
        setAvailabilityError("Add your Eircode to load availability.");
        return;
      }

      try {
        setAvailabilityStatus("loading");
        setAvailabilityError("");
        const durationMinutes = Number(
          selectedService.duration_minutes ||
            selectedService.durationMinutes ||
            60
        );
        const windowDays = DEFAULT_AVAILABILITY_WINDOW_DAYS;
        const cachedAvailability = getCachedAvailability({
          durationMinutes,
          windowDays,
          clientAddress,
        });
        if (cachedAvailability) {
          setAvailability(cachedAvailability);
          const firstDate = cachedAvailability?.dates?.[0]?.date || null;
          setSelectedDay(firstDate);
          setSelectedSlot(null);
          setAvailabilityStatus("success");
          return;
        }
        const data = await fetchAvailability({
          durationMinutes,
          windowDays,
          clientAddress,
          timeoutMs: AVAILABILITY_TIMEOUT_MS,
        });
        if (!isMounted) return;
        setCachedAvailability({
          durationMinutes,
          windowDays,
          clientAddress,
          data,
        });
        setAvailability(data);
        const firstDate = data?.dates?.[0]?.date || null;
        setSelectedDay(firstDate);
        setSelectedSlot(null);
        setAvailabilityStatus("success");
      } catch (availabilityLoadError) {
        console.error("Failed to load availability", availabilityLoadError);
        if (!isMounted) return;
        setAvailability(null);
        setAvailabilityStatus("error");
        setAvailabilityError(
          availabilityLoadError.message ||
            "Unable to load availability right now."
        );
      }
    };

    loadAvailability();

    return () => {
      isMounted = false;
    };
  }, [selectedService, debouncedAddress]);

  useEffect(() => {
    let isMounted = true;

    const loadClientProfile = async () => {
      if (!session?.id || !supabase) {
        return;
      }

      try {
        const clientResult = await supabase
          .from("clients")
          .select("*")
          .eq("id", session.id)
          .maybeSingle();

        if (!isMounted) return;
        if (clientResult.error) {
          throw clientResult.error;
        }

        if (clientResult.data) {
          setFormState((current) => ({
            ...current,
            name: clientResult.data.full_name || current.name,
            email: clientResult.data.email || current.email,
            phone: clientResult.data.phone_number || current.phone,
            address: clientResult.data.address || current.address,
          }));
        }
      } catch (profileError) {
        console.error("Failed to load client profile", profileError);
      }
    };

    loadClientProfile();

    return () => {
      isMounted = false;
    };
  }, [session?.id]);

  useEffect(() => {
    if (!session?.email) {
      return;
    }

    setFormState((current) => ({
      ...current,
      name: session.name || current.name,
      email: session.email || current.email,
      phone: session.phone || current.phone,
      address: session.address || current.address,
    }));
  }, [session?.email, session?.name, session?.phone, session?.address]);

  const categories = useMemo(() => {
    const filteredServices = services.filter((service) => {
      const title = (service.title || "").toLowerCase();
      const category = (service.category || "").toLowerCase();
      if (title.includes("tailored") || title.includes("custom solution")) {
        return false;
      }
      if (category.includes("tailored")) {
        return false;
      }
      return true;
    });

    const grouped = filteredServices.reduce((acc, service) => {
      const category = service.category || "Services";
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(service);
      return acc;
    }, {});

    const normalizedLookup = Object.keys(grouped).reduce((acc, category) => {
      acc[category.toLowerCase()] = category;
      return acc;
    }, {});

    const orderedCategories = CATEGORY_ORDER.map(
      (category) => normalizedLookup[category.toLowerCase()]
    ).filter(Boolean);

    const remainingCategories = Object.keys(grouped).filter(
      (category) => !orderedCategories.includes(category)
    );

    return [...orderedCategories, ...remainingCategories].map((category) => ({
      category,
      services: grouped[category],
    }));
  }, [services]);

  const serviceLabel =
    selectedService?.title || selectedService?.category || "Service request";
  const durationMinutes = Number(
    selectedService?.duration_minutes ||
      selectedService?.durationMinutes ||
      60
  );

  const visibleDogCount = Math.min(Number(formState.dogCount) || 1, 4);
  const visibleDogs = (formState.dogs || []).slice(0, visibleDogCount);
  const selectedPets = existingPets.filter((pet) =>
    selectedPetIds.includes(pet.id)
  );
  const selectedOptions = availableAddons.filter((option) =>
    selectedOptionIds.includes(option.id)
  );
  const basePrice = Number(selectedService?.price) || 0;
  const optionsTotal = selectedOptions.reduce(
    (sum, option) => sum + option.price,
    0
  );
  const totalPrice = basePrice + optionsTotal;
  const availableDates = availability?.dates || [];
  const selectedDateEntry =
    availableDates.find((day) => day.date === selectedDay) ||
    availableDates[0] ||
    null;
  const availableSlots = selectedDateEntry?.slots || [];

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
    setFormState(
      createInitialState(service?.title || "Service request", session)
    );
    setSelectedOptionIds([]);
    setSelectedPetIds([]);
    setShowNewDogForm(false);
    setAvailability(null);
    setAvailabilityStatus("idle");
    setAvailabilityError("");
    setSelectedDay(null);
    setSelectedSlot(null);
    setStatus("idle");
    setError("");
  };

  const closeService = () => {
    setSelectedService(null);
    setStatus("idle");
    setError("");
  };

  const toggleCategory = (category) => {
    setExpandedCategories((current) => ({
      ...current,
      [category]: !current[category],
    }));
  };

  const togglePet = (petId) => {
    setSelectedPetIds((current) =>
      current.includes(petId)
        ? current.filter((id) => id !== petId)
        : [...current, petId]
    );
  };

  const toggleOption = (optionId) => {
    setSelectedOptionIds((current) =>
      current.includes(optionId)
        ? current.filter((id) => id !== optionId)
        : [...current, optionId]
    );
  };

  const handleSubmit = async () => {
    if (
      !formState.name ||
      !formState.email ||
      !formState.phone ||
      !formState.address ||
      !formState.bookingDate ||
      !formState.startTime
    ) {
      setError("Please complete the required fields before booking.");
      return;
    }

    setStatus("submitting");
    setError("");
    const composedMessage = buildBookingMessage(formState, {
      serviceLabel,
      selectedPets,
      selectedOptions,
      includeNewDogs: showNewDogForm,
    });
    const notesToStore = [
      formState.preferences,
      formState.specialNotes,
      formState.message,
      selectedOptions.length
        ? `Add-ons: ${selectedOptions.map((option) => option.label).join(", ")}`
        : "",
    ]
      .map((entry) => entry?.trim())
      .filter(Boolean)
      .join("\n\n");

    try {
      const response = await fetch(`${API_BASE_URL}/api/book`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: formState.bookingDate,
          time: formState.startTime,
          durationMinutes,
          serviceId: selectedService?.id || selectedService?.slug,
          serviceTitle: serviceLabel,
          clientName: formState.name,
          clientPhone: formState.phone,
          clientAddress: formState.address,
          clientEmail: formState.email,
          notes: notesToStore || composedMessage,
          pets: selectedPets,
          dogs: showNewDogForm ? visibleDogs : [],
          dogCount: showNewDogForm ? Number(formState.dogCount) : undefined,
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload?.message || "Failed to send request");
      }

      if (supabase && session?.id && notesToStore) {
        await supabase
          .from("clients")
          .update({ notes: notesToStore })
          .eq("id", session.id);
      }

      setStatus("success");
      setFormState(createInitialState(serviceLabel, session));
      setSelectedPetIds([]);
      setSelectedOptionIds([]);
      setShowNewDogForm(false);
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
        
        <Text style={styles.subtitle}>
          Tap a category to explore services and book instantly.
        </Text>

        {categories.map((group) => {
          const isExpanded = expandedCategories[group.category];
          const icon = CATEGORY_ICONS[group.category] || CATEGORY_ICONS.Services;

        return (
            <View key={group.category} style={styles.categorySection}>
              <Pressable
                style={({ pressed }) => [
                  styles.categoryCard,
                  pressed && styles.cardPressed,
                ]}
                onPress={() => toggleCategory(group.category)}
              >
                <View style={styles.categoryLeft}>
                  <View style={styles.categoryIcon}>
                    <Text style={styles.categoryIconText}>{icon}</Text>
                  </View>
                  <View>
                    <Text style={styles.categoryTitle}>{group.category}</Text>
                    <Text style={styles.categoryHint}>
                      {isExpanded ? "Hide services" : "View services"}
                    </Text>
                  </View>
                </View>
                <Text style={styles.chevron}>{isExpanded ? "⌃" : "⌄"}</Text>
              </Pressable>
            {isExpanded &&
                group.services.map((service) => (
                  <Pressable
                    key={service.id}
                    style={({ pressed }) => [
                      styles.serviceCard,
                      pressed && styles.cardPressed,
                    ]}
                    onPress={() => openService(service)}
                  >
                    <View style={styles.serviceIcon}>
                      <Text style={styles.serviceIconText}>
                        {icon}
                      </Text>
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
          );
        })}
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
            <View style={styles.modalBody}>
              <ScrollView contentContainerStyle={styles.formContent}>
                {status === "success" ? (
                  <View style={styles.successCard}>
                    <Text style={styles.successTitle}>Booking confirmed!</Text>
                    <Text style={styles.successText}>
                      Your booking is reserved and ready for payment. We’ll send
                      a confirmation shortly.
                    </Text>
                    <PrimaryButton label="Close" onPress={closeService} />
                  </View>
                  ) : (
                  <View>
                    <Text style={styles.formSectionTitle}>Your details</Text>
                    <Text style={styles.label}>Name *</Text>
                    <TextInput
                      style={styles.input}
                      value={formState.name}
                      onChangeText={(value) => handleChange("name", value)}
                    />
                    <Text style={styles.label}>Email *</Text>
                    <TextInput
                      style={styles.input}
                      value={formState.email}
                      onChangeText={(value) => handleChange("email", value)}
                      autoCapitalize="none"
                      keyboardType="email-address"
                    />
                    <Text style={styles.label}>Phone *</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="WhatsApp or phone number"
                      value={formState.phone}
                      keyboardType="phone-pad"
                      onChangeText={(value) => handleChange("phone", value)}
                    />
                    <Text style={styles.label}>Eircode *</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="D02..."
                      value={formState.address}
                      onChangeText={(value) => handleChange("address", value)}
                      autoCapitalize="characters"
                    />
                    <Text style={styles.label}>Service type</Text>
                    <TextInput
                      style={[styles.input, styles.readOnlyInput]}
                      value={formState.serviceType}
                      editable={false}
                    />

                    <Text style={styles.formSectionTitle}>Your pets</Text>
                    <Text style={styles.label}>Select existing pets</Text>
                    {existingPets.length ? (
                      <View style={styles.chipRow}>
                        {existingPets.map((pet) => (
                          <Pressable
                            key={pet.id}
                            style={({ pressed }) => [
                              styles.petChip,
                              selectedPetIds.includes(pet.id) &&
                                styles.petChipActive,
                              pressed && styles.cardPressed,
                            ]}
                            onPress={() => togglePet(pet.id)}
                          >
                            <Text
                              style={[
                                styles.petChipText,
                                selectedPetIds.includes(pet.id) &&
                                  styles.petChipTextActive,
                              ]}
                            >
                              {pet.name || "Pet"}
                            </Text>
                          </Pressable>
                        ))}
                      </View>
                    ) : (
                      <Text style={styles.helperText}>
                        No pets saved yet — add a new dog below.
                      </Text>
                    )}
                    <Pressable
                      style={({ pressed }) => [
                        styles.addPetButton,
                        pressed && styles.cardPressed,
                      ]}
                      onPress={() => setShowNewDogForm((current) => !current)}
                    >
                      <Text style={styles.addPetButtonText}>
                        {showNewDogForm ? "Hide new dog form" : "Add a new dog"}
                      </Text>
                    </Pressable>

                    {showNewDogForm ? (
                      <View>
                        <Text style={styles.label}>How many new dogs?</Text>
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
                            <Text style={styles.dogTitle}>
                              New dog {index + 1}
                            </Text>
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
                      </View>
                    ) : null}

                    <Text style={styles.formSectionTitle}>Schedule</Text>
                    <Text style={styles.helperText}>
                      Choose a date and time from the live Outlook calendar.
                    </Text>
                    {availabilityStatus === "loading" ? (
                      <Text style={styles.helperText}>
                        Loading availability...
                      </Text>
                    ) : availabilityError ? (
                      <Text style={styles.errorText}>{availabilityError}</Text>
                    ) : (
                      <>
                        <ScrollView
                          horizontal
                          showsHorizontalScrollIndicator={false}
                          contentContainerStyle={styles.dateRow}
                        >
                          {availableDates.map((day) => (
                            <Pressable
                              key={day.date}
                              style={({ pressed }) => [
                                styles.dateChip,
                                selectedDay === day.date &&
                                  styles.dateChipActive,
                                pressed && styles.cardPressed,
                              ]}
                              onPress={() => {
                                setSelectedDay(day.date);
                                setSelectedSlot(null);
                                handleChange("bookingDate", day.date);
                              }}
                            >
                              <Text
                                style={[
                                  styles.dateChipText,
                                  selectedDay === day.date &&
                                    styles.dateChipTextActive,
                                ]}
                              >
                                {day.date}
                              </Text>
                            </Pressable>
                          ))}
                        </ScrollView>
                        {selectedDateEntry ? (
                          <View>
                            <Text style={styles.label}>Available times</Text>
                            <View style={styles.slotRow}>
                              {availableSlots.map((slot) => {
                                const isAvailable =
                                  slot.available && slot.reachable !== false;
                                const isSelected =
                                  selectedSlot === slot.time &&
                                  selectedDateEntry.date ===
                                    formState.bookingDate;
                                return (
                                  <Pressable
                                    key={`${selectedDateEntry.date}-${slot.time}`}
                                    style={({ pressed }) => [
                                      styles.timeChip,
                                      isSelected && styles.timeChipActive,
                                      !isAvailable && styles.timeChipDisabled,
                                      pressed && styles.cardPressed,
                                    ]}
                                    disabled={!isAvailable}
                                    onPress={() => {
                                      setSelectedSlot(slot.time);
                                      handleChange(
                                        "bookingDate",
                                        selectedDateEntry.date
                                      );
                                      handleChange("startTime", slot.time);
                                      handleChange(
                                        "endTime",
                                        addMinutesToTime(
                                          slot.time,
                                          durationMinutes
                                        )
                                      );
                                    }}
                                  >
                                    <Text
                                      style={[
                                        styles.timeChipText,
                                        isSelected && styles.timeChipTextActive,
                                        !isAvailable &&
                                          styles.timeChipTextDisabled,
                                      ]}
                                    >
                                      {slot.time}
                                    </Text>
                                  </Pressable>
                                );
                              })}
                            </View>
                          </View>
                        ) : null}
                      </>
                    )}

                    <Text style={styles.formSectionTitle}>Additional options</Text>
                    {availableAddons.length ? (
                      <View style={styles.chipRow}>
                        {availableAddons.map((option) => (
                          <Pressable
                            key={option.id}
                            style={({ pressed }) => [
                              styles.optionChip,
                              selectedOptionIds.includes(option.id) &&
                                styles.optionChipActive,
                              pressed && styles.cardPressed,
                            ]}
                            onPress={() => toggleOption(option.id)}
                          >
                            <Text
                              style={[
                                styles.optionChipText,
                                selectedOptionIds.includes(option.id) &&
                                  styles.optionChipTextActive,
                              ]}
                            >
                              {option.label} · {formatCurrency(option.price)}
                            </Text>
                          </Pressable>
                        ))}
                      </View>
                    ) : (
                      <Text style={styles.helperText}>
                        No add-ons available right now.
                      </Text>
                    )}

                    <Text style={styles.formSectionTitle}>Care details</Text>
                    <Text style={styles.label}>Routine & preferences</Text>
                    <TextInput
                      style={[styles.input, styles.textArea]}
                      placeholder="Feeding times, leash style, play style"
                      value={formState.preferences}
                      multiline
                      onChangeText={(value) =>
                        handleChange("preferences", value)
                      }
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
                  </View>
                )}
              </ScrollView>
            </View>
            {status !== "success" ? (
              <View style={styles.summaryBar}>
                <View style={styles.summaryHeader}>
                  <Text style={styles.summaryTitle}>Booking summary</Text>
                  <Text style={styles.summaryTotal}>
                    {basePrice
                      ? formatCurrency(totalPrice)
                      : "Quote required"}
                  </Text>
                </View>
              <Text style={styles.summaryLine}>Service: {serviceLabel}</Text>
                <Text style={styles.summaryLine}>
                  Pets:{" "}
                  {selectedPets.length
                    ? selectedPets.map((pet) => pet.name).join(", ")
                    : showNewDogForm
                    ? `New dog x${formState.dogCount}`
                    : "Select pets"}
                </Text>
                <Text style={styles.summaryLine}>
                  Date:{" "}
                  {formState.bookingDate || "Select date"}
                  {formState.startTime
                    ? ` · ${formState.startTime}${
                        formState.endTime ? `–${formState.endTime}` : ""
                      }`
                    : ""}
                </Text>
                {selectedOptions.length ? (
                  <Text style={styles.summaryLine}>
                    Add-ons:{" "}
                    {selectedOptions.map((option) => option.label).join(", ")}
                  </Text>
                ) : null}
                {basePrice ? (
                  <View style={styles.summaryTotals}>
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Service</Text>
                      <Text style={styles.summaryValue}>
                        {formatCurrency(basePrice)}
                      </Text>
                    </View>
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Add-ons</Text>
                      <Text style={styles.summaryValue}>
                        {formatCurrency(optionsTotal)}
                      </Text>
                    </View>
                  </View>
                ) : null}
                {error ? <Text style={styles.errorText}>{error}</Text> : null}
                <PrimaryButton
                  label={
                    status === "submitting" ? "Booking..." : "Book & pay"
                  }
                  onPress={handleSubmit}
                  disabled={status === "submitting"}
                />
              </View>
            ) : null}
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
  categoryCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
  categoryLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  categoryIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#efe9fb",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  categoryIconText: {
    fontSize: 20,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2b1a4b",
  },
  categoryHint: {
    fontSize: 13,
    color: "#7b6a9f",
    marginTop: 4,
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
    marginLeft: 8,
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
    height: "92%",
  },
  modalBody: {
    flex: 1,
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
    paddingBottom: 180,
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
  readOnlyInput: {
    backgroundColor: "#f2ecfb",
    color: "#5b4a7c",
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
  dateRow: {
    gap: 8,
    marginBottom: 12,
    paddingVertical: 4,
  },
  dateChip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e6def6",
    backgroundColor: "#ffffff",
  },
  dateChipActive: {
    backgroundColor: "#6c3ad6",
    borderColor: "#6c3ad6",
  },
  dateChipText: {
    color: "#5d2fc5",
    fontWeight: "600",
    fontSize: 12,
  },
  dateChipTextActive: {
    color: "#ffffff",
  },
  slotRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  timeChip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e6def6",
    backgroundColor: "#ffffff",
  },
  timeChipActive: {
    backgroundColor: "#2b1a4b",
    borderColor: "#2b1a4b",
  },
  timeChipDisabled: {
    backgroundColor: "#f2ecfb",
    borderColor: "#e6def6",
  },
  timeChipText: {
    color: "#5d2fc5",
    fontWeight: "600",
    fontSize: 12,
  },
  timeChipTextActive: {
    color: "#ffffff",
  },
  timeChipTextDisabled: {
    color: "#a093b9",
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
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
  petChip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#e6def6",
    backgroundColor: "#ffffff",
  },
  petChipActive: {
    backgroundColor: "#6c3ad6",
    borderColor: "#6c3ad6",
  },
  petChipText: {
    color: "#5d2fc5",
    fontWeight: "600",
    fontSize: 13,
  },
  petChipTextActive: {
    color: "#ffffff",
  },
  addPetButton: {
    alignSelf: "flex-start",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: "#efe9fb",
    borderWidth: 1,
    borderColor: "#e6def6",
    marginBottom: 16,
  },
  addPetButtonText: {
    color: "#4a3a68",
    fontWeight: "600",
  },
  helperText: {
    fontSize: 12,
    color: "#7b6a9f",
    marginBottom: 10,
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
  optionChip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#e6def6",
    backgroundColor: "#ffffff",
  },
  optionChipActive: {
    backgroundColor: "#6c3ad6",
    borderColor: "#6c3ad6",
  },
  optionChipText: {
    color: "#5d2fc5",
    fontWeight: "600",
    fontSize: 13,
  },
  optionChipTextActive: {
    color: "#ffffff",
  },
  summaryBar: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: "#e8def7",
    backgroundColor: "#f6f3fb",
  },
  summaryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2b1a4b",
  },
  summaryTotal: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2b1a4b",
  },
  summaryLine: {
    fontSize: 13,
    color: "#6c5a92",
    marginBottom: 4,
  },
  summaryTotals: {
    marginTop: 10,
    marginBottom: 6,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 13,
    color: "#6c5a92",
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: "600",
    color: "#2b1a4b",
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