import { useEffect, useMemo, useState, useCallback } from "react";
import {
  Dimensions,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
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
import { useTheme } from "../context/ThemeContext";

const CATEGORY_ORDER = [
  "Daily strolls",
  "Home visits",
  "Training",
  "Solo Journeys",
  "Overnight Support",
  "Daytime Care",
  "Group Adventures",
];

const CATEGORY_ICONS = {
  Training: "school",
  "Overnight Support": "moon-waning-crescent",
  "Daytime Care": "weather-sunny",
  "Group Adventures": "compass-rose",
  "Home visits": "home-heart",
  "Solo Journeys": "dog-service",
  "Daily strolls": "walk",
  Services: "paw",
};

const CALENDAR_CARD_HORIZONTAL_MARGIN = 16;
const CALENDAR_CARD_PADDING = 18;
const CALENDAR_PAGE_WIDTH =
  Dimensions.get("window").width -
  (CALENDAR_CARD_HORIZONTAL_MARGIN * 2 + CALENDAR_CARD_PADDING * 2);

const parsePriceValue = (value) => {
  if (value === null || value === undefined) return 0;
  if (typeof value === "number") return value;
  const normalized = String(value).replace(/,/g, ".");
  const numeric = Number(normalized.replace(/[^0-9.]/g, ""));
  return Number.isFinite(numeric) ? numeric : 0;
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
        price: parsePriceValue(rawPrice),
      };
    })
    .filter((addon) => addon.label);

const createDog = () => ({
  name: "",
  breed: "",
  age: "",
  size: "",
  weight: "",
  adoptionDate: "",
});

const BOARDING_EIRCODE = "A98H940";
const SCHEDULE_OPTIONS = [
  { value: "one_time", label: "One time", icon: "calendar-month" },
  { value: "repeat_weekly", label: "Repeat weekly", icon: "repeat" },
];
const AGE_OPTIONS = [
  "Under 1 year",
  "1 year",
  "2 years",
  "3 years",
  "4 years",
  "5 years",
  "6 years",
  "7 years",
  "8 years",
  "9 years",
  "10+ years",
];
const SIZE_OPTIONS = ["Small", "Medium", "Large"];
const WEEKDAY_OPTIONS = [
  { value: 0, label: "S", name: "Sunday" },
  { value: 1, label: "M", name: "Monday" },
  { value: 2, label: "T", name: "Tuesday" },
  { value: 3, label: "W", name: "Wednesday" },
  { value: 4, label: "T", name: "Thursday" },
  { value: 5, label: "F", name: "Friday" },
  { value: 6, label: "S", name: "Saturday" },
];
const TIME_WINDOWS = [
  { id: "morning", label: "6am–11am", startHour: 6, endHour: 11 },
  { id: "midday", label: "11am–3pm", startHour: 11, endHour: 15 },
  { id: "evening", label: "3pm–10pm", startHour: 15, endHour: 22 },
];

const resolveServiceEircode = (service, session) => {
  const text = `${service?.title || ""} ${service?.category || ""}`.toLowerCase();
  if (text.includes("boarding")) {
    return BOARDING_EIRCODE;
  }
  return (session?.address || session?.client?.address || "").trim();
};

const createInitialState = (service, session) => ({
  name: session?.name || "",
  email: session?.email || "",
  phone: session?.phone || "",
  address: resolveServiceEircode(service, session),
  serviceType:
    service?.title || service?.category || "Service request",
  dogCount: "1",
  dogs: [createDog(), createDog(), createDog(), createDog()],
  bookingDate: "",
  startTime: "",
  endTime: "",
  scheduleType: "one_time",
  repeatDays: [],
  timeWindow: "",
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

const buildDateKey = (year, monthIndex, day) => {
  const month = String(monthIndex + 1).padStart(2, "0");
  const dayValue = String(day).padStart(2, "0");
  return `${year}-${month}-${dayValue}`;
};

const formatDateLabel = (dateKey) => {
  if (!dateKey) return "Select date";
  const date = new Date(dateKey);
  if (Number.isNaN(date.getTime())) return dateKey;
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
  }).format(date);
};

const parseTimeToMinutes = (time) => {
  const [hours, minutes] = (time || "").split(":").map(Number);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;
  return hours * 60 + minutes;
};

const resolveAvailabilityWindowDays = (
  bookingDate,
  fallbackDays = DEFAULT_AVAILABILITY_WINDOW_DAYS
) => {
  if (!bookingDate) return fallbackDays;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(`${bookingDate}T00:00:00`);
  if (Number.isNaN(target.getTime())) return fallbackDays;
  const msPerDay = 24 * 60 * 60 * 1000;
  const diffDays = Math.ceil((target - today) / msPerDay) + 1;
  if (!Number.isFinite(diffDays)) return fallbackDays;
  return Math.max(fallbackDays, diffDays);
};

const slotMatchesWindow = (slotTime, window) => {
  if (!window || !slotTime) return true;
  const minutes = parseTimeToMinutes(slotTime);
  if (minutes === null) return false;
  return (
    minutes >= window.startHour * 60 && minutes < window.endHour * 60
  );
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
            dog?.size && `Size: ${dog.size}`,
            dog?.weight && `Weight: ${dog.weight} kg`,
            dog?.adoptionDate && `Adoption date: ${dog.adoptionDate}`,
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
    state.scheduleType === "repeat_weekly"
      ? `Schedule: Repeat weekly`
      : `Schedule: One time`,
    state.repeatDays && state.repeatDays.length
      ? `Days of the week: ${state.repeatDays
          .map((dayIndex) => WEEKDAY_OPTIONS.find((d) => d.value === dayIndex)?.name)
          .filter(Boolean)
          .join(", ")}`
      : null,
    state.timeWindow && TIME_WINDOWS.find((window) => window.id === state.timeWindow)
      ? `Preferred window: ${
          TIME_WINDOWS.find((window) => window.id === state.timeWindow)?.label
        }`
      : null,
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

const BookScreen = ({ navigation, route }) => {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { session } = useSession();
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [formState, setFormState] = useState(() =>
    createInitialState(null, session)
  );
  const [expandedCategories, setExpandedCategories] = useState({});
  const [existingPets, setExistingPets] = useState([]);
  const [selectedPetIds, setSelectedPetIds] = useState([]);
  const [showNewDogForm, setShowNewDogForm] = useState(false);
  const [selectedOptionIds, setSelectedOptionIds] = useState([]);
  const [availableAddons, setAvailableAddons] = useState([]);
  const [showAddonDropdown, setShowAddonDropdown] = useState(false);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [availability, setAvailability] = useState(null);
  const [availabilityStatus, setAvailabilityStatus] = useState("idle");
  const [availabilityError, setAvailabilityError] = useState("");
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showAvailability, setShowAvailability] = useState(false);
  const [activeAgeDropdown, setActiveAgeDropdown] = useState(null);
  const [activeSizeDropdown, setActiveSizeDropdown] = useState(null);
  const [calendarMonth, setCalendarMonth] = useState(() => new Date());
  const [calendarDateDraft, setCalendarDateDraft] = useState(null);
  const [calendarPageWidth, setCalendarPageWidth] = useState(
    CALENDAR_PAGE_WIDTH
  );
  const [showCalendar, setShowCalendar] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
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

  const loadServices = useCallback(async () => {
    try {
      const data = await fetchJson("/api/services");
      setServices(data.services || []);
    } catch (error) {
      console.error("Failed to load services", error);
    }
  }, []);

  const loadAddons = useCallback(async () => {
    try {
      const data = await fetchJson("/api/addons");
      setAvailableAddons(normalizeAddons(data?.addons || []));
    } catch (error) {
      console.error("Failed to load add-ons", error);
      setAvailableAddons([]);
    }
  }, []);

  useEffect(() => {
    loadServices();
  }, [loadServices]);

  useEffect(() => {
    loadAddons();
  }, [loadAddons]);

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

  const loadPets = useCallback(async () => {
    if (!session?.email) {
      return;
    }

    try {
      const data = await fetchJson(
        `/api/pets?ownerEmail=${encodeURIComponent(session.email)}`
      );
      setExistingPets(Array.isArray(data?.pets) ? data.pets : []);
    } catch (error) {
      console.error("Failed to load pets", error);
    }
  }, [session?.email]);

  useEffect(() => {
    loadPets();
  }, [loadPets]);

  useEffect(() => {
    let isMounted = true;

    const loadAvailability = async () => {
      if (!selectedService || !showAvailability) {
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
        const windowDays = resolveAvailabilityWindowDays(
          formState.bookingDate,
          DEFAULT_AVAILABILITY_WINDOW_DAYS
        );
        const cachedAvailability = getCachedAvailability({
          durationMinutes,
          windowDays,
          clientAddress,
        });
        if (cachedAvailability) {
          setAvailability(cachedAvailability);
          const firstDate =
            formState.bookingDate ||
            cachedAvailability?.dates?.[0]?.date ||
            null;
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
        const firstDate =
          formState.bookingDate || data?.dates?.[0]?.date || null;
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
  }, [selectedService, debouncedAddress, formState.bookingDate, showAvailability]);

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
          const resolvedAddress = resolveServiceEircode(
            selectedService,
            session
          );
          setFormState((current) => {
            const next = {
              ...current,
              name: clientResult.data.full_name || current.name,
              email: clientResult.data.email || current.email,
              phone: clientResult.data.phone_number || current.phone,
              address:
                resolvedAddress ||
                clientResult.data.address ||
                current.address,
            };

            if (
              next.name === current.name &&
              next.email === current.email &&
              next.phone === current.phone &&
              next.address === current.address
            ) {
              return current;
            }

            return next;
          });
        }
      } catch (profileError) {
        console.error("Failed to load client profile", profileError);
      }
    };

    loadClientProfile();

    return () => {
      isMounted = false;
    };
  }, [session?.id, selectedService, session]);

  useEffect(() => {
    if (!session?.email) {
      return;
    }

    setFormState((current) => {
      const next = {
        ...current,
        name: session.name || current.name,
        email: session.email || current.email,
        phone: session.phone || current.phone,
        address:
          resolveServiceEircode(selectedService, session) || current.address,
      };

      if (
        next.name === current.name &&
        next.email === current.email &&
        next.phone === current.phone &&
        next.address === current.address
      ) {
        return current;
      }

      return next;
    });
  }, [
    session?.email,
    session?.name,
    session?.phone,
    session?.address,
    selectedService,
  ]);

  const categories = useMemo(() => {
    const filteredServices = services.filter((service) => {
      const title = (service.title || "").toLowerCase();
      const category = (service.category || "").toLowerCase();
      if (title.includes("tailored") || title.includes("custom solution")) {
        return false;
      }
      if (title.includes("custom care") || title.includes("custom adventure")) {
        return false;
      }
      if (category.includes("tailored")) {
        return false;
      }
      if (category.includes("custom care")) {
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
  const basePrice = parsePriceValue(
    selectedService?.price ??
      selectedService?.cost ??
      selectedService?.amount ??
      0
  );
  const optionsTotal = selectedOptions.reduce(
    (sum, option) => sum + option.price,
    0
  );
  const selectedPetCount = selectedPets.length;
  const newDogCount = showNewDogForm ? Number(formState.dogCount) || 0 : 0;
  const petCount = Math.max(selectedPetCount + newDogCount, 1);
  const additionalPetCount = Math.max(petCount - 1, 0);
  const petsSubtotal =
    basePrice * (1 + additionalPetCount * 0.5);
  const totalPrice = petsSubtotal + optionsTotal;
  const availableDates = availability?.dates || [];
  const selectedDateEntry =
    availableDates.find(
      (day) => day.date === (selectedDay || formState.bookingDate)
    ) || null;
  const availableSlots = selectedDateEntry?.slots || [];
  const selectedWindow = TIME_WINDOWS.find(
    (window) => window.id === formState.timeWindow
  );
  const filteredSlots = availableSlots.filter((slot) =>
    slotMatchesWindow(slot.time, selectedWindow) &&
    slot.available &&
    slot.reachable !== false
  );
  const calendarMonths = useMemo(() => {
    const months = [];
    const startMonth = new Date(
      calendarMonth.getFullYear(),
      calendarMonth.getMonth(),
      1
    );
    for (let offset = 0; offset < 12; offset += 1) {
      const monthDate = new Date(
        startMonth.getFullYear(),
        startMonth.getMonth() + offset,
        1
      );
      const year = monthDate.getFullYear();
      const monthIndex = monthDate.getMonth();
      const label = new Intl.DateTimeFormat("en-GB", {
        month: "long",
        year: "numeric",
      }).format(monthDate);
      const firstDay = new Date(year, monthIndex, 1).getDay();
      const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
      const slots = Array.from({ length: firstDay }, () => null).concat(
        Array.from({ length: daysInMonth }, (_, index) => index + 1)
      );
      const weeks = [];
      for (let i = 0; i < slots.length; i += 7) {
        const week = slots.slice(i, i + 7);
        while (week.length < 7) {
          week.push(null);
        }
        weeks.push(week);
      }
      months.push({
        key: `${year}-${monthIndex}`,
        year,
        monthIndex,
        label,
        weeks,
      });
    }
    return months;
  }, [calendarMonth]);

  const handleChange = (field, value) => {
    setFormState((current) => ({ ...current, [field]: value }));
  };

  const handleScheduleTypeChange = (value) => {
    setFormState((current) => ({
      ...current,
      scheduleType: value,
      repeatDays: value === "repeat_weekly" ? current.repeatDays : [],
    }));
  };

  const toggleRepeatDay = (value) => {
    setFormState((current) => {
      const exists = current.repeatDays.includes(value);
      return {
        ...current,
        repeatDays: exists
          ? current.repeatDays.filter((day) => day !== value)
          : [...current.repeatDays, value],
      };
    });
  };

  const handleTimeWindowSelect = (windowId) => {
    handleChange("timeWindow", windowId);
    if (!formState.bookingDate) {
      handleOpenCalendar();
      return;
    }
    setShowAvailability(true);
  };

  const handleOpenCalendar = () => {
    const today = new Date();
    const initialDateKey =
      formState.bookingDate ||
      buildDateKey(today.getFullYear(), today.getMonth(), today.getDate());
    setCalendarDateDraft(initialDateKey);
    setCalendarMonth(new Date(initialDateKey));
    setShowCalendar(true);
  };

  const handleConfirmCalendar = () => {
    if (calendarDateDraft) {
      handleChange("bookingDate", calendarDateDraft);
      setSelectedDay(calendarDateDraft);
      setSelectedSlot(null);
    }
    if (formState.timeWindow) {
        setShowAvailability(true);
      }
    setShowCalendar(false);
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
    setFormState(createInitialState(service, session));
    setSelectedOptionIds([]);
    setSelectedPetIds([]);
    setShowNewDogForm(false);
    setShowAddonDropdown(false);
    setActiveAgeDropdown(null);
    setActiveSizeDropdown(null);
    setAvailability(null);
    setAvailabilityStatus("idle");
    setAvailabilityError("");
    setSelectedDay(null);
    setSelectedSlot(null);
    setShowAvailability(false);
    setStatus("idle");
    setError("");
  };

  const closeService = () => {
    setSelectedService(null);
    setShowAvailability(false);
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

  const handleBackPress = () => {
    const returnTo = route?.params?.returnTo;
    if (returnTo) {
      if (returnTo === "Profile") {
        navigation.navigate("Profile", { screen: "ProfileHome" });
        return;
      }
      navigation.navigate(returnTo);
      return;
    }
    if (route?.params?.returnToProfile) {
      navigation.navigate("Profile", {
        screen: "ProfileOverview",
        params: { returnTo: "Profile" },
      });
      return;
    }
    navigation.navigate("Home");
  };

  const handleSubmit = async () => {
    if (
      !formState.address ||
      !formState.bookingDate ||
      !formState.startTime ||
      (formState.scheduleType === "repeat_weekly" &&
        formState.repeatDays.length === 0)
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
      setFormState(createInitialState(selectedService, session));
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
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={async () => {
              setRefreshing(true);
              await Promise.all([loadServices(), loadAddons(), loadPets()]);
              setRefreshing(false);
            }}
            tintColor={theme.colors.accent}
          />
        }
      >
        <View style={styles.header}>
          <Pressable
            style={styles.backButton}
            onPress={handleBackPress}
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
                    <MaterialCommunityIcons
                      name={icon}
                      size={20}
                      color={theme.colors.textPrimary}
                    />
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
                group.services.map((service, serviceIndex) => (
                  <Pressable
                    key={`${group.category}-${service.id || service.slug || service.title || serviceIndex}`}
                    style={({ pressed }) => [
                      styles.serviceCard,
                      pressed && styles.cardPressed,
                    ]}
                    onPress={() => openService(service)}
                  >
                    <View style={styles.serviceIcon}>
                      <MaterialCommunityIcons
                        name={icon}
                        size={18}
                        color={theme.colors.textPrimary}
                      />
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
                                <Pressable
                                  style={styles.dropdown}
                                  onPress={() =>
                                    setActiveAgeDropdown(
                                      activeAgeDropdown === index ? null : index
                                    )
                                  }
                                >
                                  <Text style={styles.dropdownValue}>
                                    {dog.age || "Select age"}
                                  </Text>
                                  <Ionicons
                                    name="chevron-down"
                                    size={16}
                                    color={theme.colors.textSecondary}
                                  />
                                </Pressable>
                                {activeAgeDropdown === index ? (
                                  <View style={styles.dropdownList}>
                                    {AGE_OPTIONS.map((option) => (
                                      <Pressable
                                        key={`${option}-${index}`}
                                        style={styles.dropdownItem}
                                        onPress={() => {
                                          handleDogChange(index, "age", option);
                                          setActiveAgeDropdown(null);
                                        }}
                                      >
                                        <Text style={styles.dropdownItemText}>
                                          {option}
                                        </Text>
                                      </Pressable>
                                    ))}
                                  </View>
                                ) : null}
                              </View>
                              <View style={styles.inlineInput}>
                                <Text style={styles.label}>Size *</Text>
                                <Pressable
                                  style={styles.dropdown}
                                  onPress={() =>
                                    setActiveSizeDropdown(
                                      activeSizeDropdown === index ? null : index
                                    )
                                  }
                                >
                                  <Text style={styles.dropdownValue}>
                                    {dog.size || "Select size"}
                                  </Text>
                                  <Ionicons
                                    name="chevron-down"
                                    size={16}
                                    color={theme.colors.textSecondary}
                                  />
                                </Pressable>
                                {activeSizeDropdown === index ? (
                                  <View style={styles.dropdownList}>
                                    {SIZE_OPTIONS.map((option) => (
                                      <Pressable
                                        key={`${option}-${index}`}
                                        style={styles.dropdownItem}
                                        onPress={() => {
                                          handleDogChange(index, "size", option);
                                          setActiveSizeDropdown(null);
                                        }}
                                      >
                                        <Text style={styles.dropdownItemText}>
                                          {option}
                                        </Text>
                                      </Pressable>
                                    ))}
                                  </View>
                                ) : null}
                              </View>
                            </View>
                            <View style={styles.inlineInputs}>
                              <View style={styles.inlineInput}>
                                <Text style={styles.label}>Weight (kg) *</Text>
                                <TextInput
                                  style={styles.input}
                                  placeholder="e.g., 12"
                                  value={dog.weight}
                                  keyboardType="numeric"
                                  onChangeText={(value) =>
                                    handleDogChange(index, "weight", value)
                                  }
                                />
                              </View>
                              <View style={styles.inlineInput}>
                                <Text style={styles.label}>Adoption date *</Text>
                                <TextInput
                                  style={styles.input}
                                  placeholder="YYYY-MM-DD"
                                  value={dog.adoptionDate}
                                  onChangeText={(value) =>
                                    handleDogChange(index, "adoptionDate", value)
                                  }
                                />
                              </View>
                            </View>
                          </View>
                        ))}
                      </View>
                    ) : null}

                    <Text style={styles.formSectionTitle}>Schedule</Text>
                    <Text style={styles.label}>Schedule type</Text>
                    <View style={styles.scheduleTypeRow}>
                      {SCHEDULE_OPTIONS.map((option) => {
                        const isActive =
                          formState.scheduleType === option.value;
                        return (
                          <Pressable
                            key={option.value}
                            style={({ pressed }) => [
                              styles.scheduleTypeCard,
                              isActive && styles.scheduleTypeCardActive,
                              pressed && styles.cardPressed,
                            ]}
                            onPress={() =>
                              handleScheduleTypeChange(option.value)
                            }
                          >
                            <MaterialCommunityIcons
                              name={option.icon}
                              size={18}
                              color={
                                isActive
                                  ? theme.colors.textPrimary
                                  : theme.colors.textSecondary
                              }
                              style={styles.scheduleTypeIcon}
                            />
                            <Text
                              style={[
                                styles.scheduleTypeLabel,
                                isActive && styles.scheduleTypeLabelActive,
                              ]}
                            >
                              {option.label}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                    {formState.scheduleType === "repeat_weekly" ? (
                      <>
                        <Text style={styles.label}>Days of the week *</Text>
                        <View style={styles.weekdayRow}>
                          {WEEKDAY_OPTIONS.map((day) => {
                            const isSelected = formState.repeatDays.includes(
                              day.value
                            );
                            return (
                              <Pressable
                                key={day.value}
                                style={({ pressed }) => [
                                  styles.weekdayChip,
                                  isSelected && styles.weekdayChipActive,
                                  pressed && styles.cardPressed,
                                ]}
                                onPress={() => toggleRepeatDay(day.value)}
                              >
                                <Text
                                  style={[
                                    styles.weekdayChipText,
                                    isSelected &&
                                      styles.weekdayChipTextActive,
                                  ]}
                                >
                                  {day.label}
                                </Text>
                              </Pressable>
                            );
                          })}
                        </View>
                      </>
                    ) : null}
                    <Pressable
                      style={styles.datePickerRow}
                      onPress={handleOpenCalendar}
                    >
                      <View>
                        <Text style={styles.label}>
                          {formState.scheduleType === "repeat_weekly"
                            ? "Start date *"
                            : "Date *"}
                        </Text>
                        <Text style={styles.datePickerValue}>
                          {formatDateLabel(formState.bookingDate)}
                        </Text>
                      </View>
                      <Text style={styles.chevron}>›</Text>
                    </Pressable>
                    <Text style={styles.label}>Times</Text>
                    <View style={styles.timeWindowRow}>
                      {TIME_WINDOWS.map((window) => {
                        const isSelected =
                          formState.timeWindow === window.id;
                        return (
                          <Pressable
                            key={window.id}
                            style={({ pressed }) => [
                              styles.timeWindowChip,
                              isSelected && styles.timeWindowChipActive,
                              pressed && styles.cardPressed,
                            ]}
                            onPress={() =>
                              handleTimeWindowSelect(window.id)
                            }
                          >
                            <Text
                              style={[
                                styles.timeWindowText,
                                isSelected && styles.timeWindowTextActive,
                              ]}
                            >
                              {window.label}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                    {showAvailability ? (
                      <View style={styles.availabilityCard}>
                        {availabilityStatus === "loading" ? (
                          <Text style={styles.helperText}>
                            Loading availability...
                          </Text>
                        ) : availabilityError ? (
                          <Text style={styles.errorText}>
                            {availabilityError}
                          </Text>
                        ) : (
                          <>
                            {selectedDateEntry ? (
                              <View>
                                <Text style={styles.label}>
                                  Select a timeslot
                                </Text>
                                <View style={styles.slotRow}>
                                  {filteredSlots.length === 0 ? (
                                    <Text style={styles.helperText}>
                                      No timeslots match this window yet.
                                    </Text>
                                  ) : (
                                    filteredSlots.map((slot) => {
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
                                            pressed && styles.cardPressed,
                                          ]}
                                          onPress={() => {
                                            setSelectedSlot(slot.time);
                                            handleChange(
                                              "bookingDate",
                                              selectedDateEntry.date
                                            );
                                            handleChange(
                                              "startTime",
                                              slot.time
                                            );
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
                                              isSelected &&
                                                styles.timeChipTextActive,
                                            ]}
                                          >
                                            {slot.time}
                                          </Text>
                                        </Pressable>
                                      );
                                    })
                                  )}
                                </View>
                              </View>
                            ) : null}
                          </>
                        )}
                      </View>
                    ) : null}

                    <Text style={styles.formSectionTitle}>Additional options</Text>
                    {availableAddons.length ? (
                      <View>
                        <Pressable
                          style={styles.dropdown}
                          onPress={() => setShowAddonDropdown((current) => !current)}
                        >
                          <Text style={styles.dropdownValue}>
                            {selectedOptions.length
                              ? selectedOptions.map((option) => option.label).join(", ")
                              : "Select add-ons"}
                          </Text>
                          <Ionicons
                            name={showAddonDropdown ? "chevron-up" : "chevron-down"}
                            size={16}
                            color={theme.colors.textSecondary}
                          />
                        </Pressable>
                        {showAddonDropdown ? (
                          <View style={styles.dropdownList}>
                            {availableAddons.map((option, optionIndex) => (
                              <Pressable
                                key={`${option.id || option.label || optionIndex}`}
                                style={styles.dropdownItem}
                                onPress={() => toggleOption(option.id)}
                              >
                                <View style={styles.dropdownItemRow}>
                                  <Text style={styles.dropdownItemText}>
                                    {option.label}
                                  </Text>
                                  <Text style={styles.dropdownItemMeta}>
                                    {formatCurrency(option.price)}
                                  </Text>
                                </View>
                              </Pressable>
                            ))}
                          </View>
                        ) : null}
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
                    {formatCurrency(totalPrice)}
                  </Text>
                </View>
                <Text style={styles.summaryLine}>Service: {serviceLabel}</Text>
                <Text style={styles.summaryLine}>
                  Price: {formatCurrency(basePrice)}
                </Text>
                <Text style={styles.summaryLine}>
                  Total: {formatCurrency(totalPrice)}
                </Text>
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
                <View style={styles.summaryTotals}>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Pets ({petCount})</Text>
                    <Text style={styles.summaryValue}>
                      {formatCurrency(petsSubtotal)}
                    </Text>
                  </View>
                  {petCount > 1 ? (
                    <Text style={styles.summaryNote}>
                      Additional pets are 50% off.
                    </Text>
                  ) : null}
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Add-ons</Text>
                    <Text style={styles.summaryValue}>
                      {formatCurrency(optionsTotal)}
                    </Text>
                  </View>
                </View>
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
        <Modal
          visible={showCalendar}
          animationType="slide"
          transparent
          onRequestClose={() => setShowCalendar(false)}
        >
          <View style={styles.calendarBackdrop}>
            <SafeAreaView style={styles.calendarCard}>
              <View style={styles.calendarHeader}>
                <Text style={styles.calendarHeaderTitle}>Select Date</Text>
                <Text style={styles.calendarHeaderSubtitle}>
                  Choose the perfect day for your visit.
                </Text>
              </View>
              <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                snapToInterval={calendarPageWidth}
                decelerationRate="fast"
                onLayout={(event) => {
                  const { width } = event.nativeEvent.layout;
                  if (width && width !== calendarPageWidth) {
                    setCalendarPageWidth(width);
                  }
                }}
                contentContainerStyle={styles.calendarMonthsScroll}
              >
                {calendarMonths.map((month) => (
                  <View
                    key={month.key}
                    style={[
                      styles.calendarMonthPage,
                      { width: calendarPageWidth },
                    ]}
                  >
                    <View style={styles.calendarMonthHeader}>
                      <Text style={styles.calendarMonthLabel}>
                        {month.label}
                      </Text>
                    </View>
                    <View style={styles.weekHeader}>
                      {"SMTWTFS".split("").map((day, index) => (
                        <Text
                          key={`${day}-${index}`}
                          style={styles.weekHeaderText}
                        >
                          {day}
                        </Text>
                      ))}
                    </View>
                    {month.weeks.map((week, weekIndex) => (
                      <View
                        key={`${month.key}-week-${weekIndex}`}
                        style={styles.weekRow}
                      >
                        {week.map((day, dayIndex) => {
                          if (!day) {
                            return (
                              <View
                                key={`${month.key}-empty-${weekIndex}-${dayIndex}`}
                                style={styles.dayCell}
                              />
                            );
                          }
                          const dateKey = buildDateKey(
                            month.year,
                            month.monthIndex,
                            day
                          );
                          const isSelected = calendarDateDraft === dateKey;
                          return (
                            <Pressable
                              key={dateKey}
                              style={({ pressed }) => [
                                styles.dayCell,
                                isSelected && styles.daySelected,
                                pressed && styles.dayPressed,
                              ]}
                              onPress={() => setCalendarDateDraft(dateKey)}
                            >
                              <Text
                                style={[
                                  styles.dayText,
                                  isSelected && styles.dayTextSelected,
                                ]}
                              >
                                {day}
                              </Text>
                            </Pressable>
                          );
                        })}
                      </View>
                    ))}
                  </View>
                ))}
              </ScrollView>
              <View style={styles.calendarActions}>
                <Pressable
                  style={({ pressed }) => [
                    styles.calendarActionButton,
                    styles.calendarCancelButton,
                    pressed && styles.calendarActionPressed,
                  ]}
                  onPress={() => setShowCalendar(false)}
                >
                  <Text style={styles.calendarCancelText}>Cancel</Text>
                </Pressable>
                <Pressable
                  style={({ pressed }) => [
                    styles.calendarActionButton,
                    styles.calendarConfirmButton,
                    pressed && styles.calendarActionPressed,
                  ]}
                  onPress={handleConfirmCalendar}
                >
                  <Text style={styles.calendarConfirmText}>Select date</Text>
                </Pressable>
              </View>
            </SafeAreaView>
          </View>
        </Modal>
      </Modal>
    </SafeAreaView>
  );
};

const createStyles = (theme) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flexGrow: 1,
    backgroundColor: theme.colors.background,
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
    backgroundColor: theme.colors.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: theme.colors.surfaceAccent,
    position: "absolute",
    left: 0,
  },
  backIcon: {
    fontSize: 18,
    color: theme.colors.textPrimary,
  },
  title: {
    color: theme.colors.textPrimary,
    fontSize: 20,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: "center",
    marginBottom: 12,
  },
  categorySection: {
    marginBottom: 8,
  },
  categoryCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: theme.colors.surface,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: theme.colors.surfaceAccent,
    shadowColor: theme.shadow.soft.shadowColor,
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 2,
    marginBottom: 8,
  },
  categoryLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  categoryIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.surfaceAccent,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.textPrimary,
  },
  categoryHint: {
    fontSize: 13,
    color: theme.colors.textMuted,
    marginTop: 4,
  },
  serviceCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: theme.colors.surfaceAccent,
    shadowColor: theme.shadow.soft.shadowColor,
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 2,
    marginBottom: 8,
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
    backgroundColor: theme.colors.surfaceAccent,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  serviceCopy: {
    flex: 1,
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.textPrimary,
  },
  serviceDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  chevron: {
    fontSize: 22,
    color: theme.colors.textMuted,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(5, 4, 15, 0.7)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: theme.colors.background,
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
    borderBottomColor: theme.colors.surfaceAccent,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: theme.colors.textPrimary,
  },
  modalSubtitle: {
    fontSize: 13,
     color: theme.colors.textSecondary,
    marginTop: 2,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  closeButtonText: {
    fontSize: 16,
    color: theme.colors.textPrimary,
  },
  formContent: {
    padding: 20,
    paddingBottom: 180,
  },
  formSectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.textPrimary,
    marginTop: 8,
    marginBottom: 10,
  },
  label: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginBottom: 6,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.accent,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    olor: theme.colors.textPrimary,
    marginBottom: 12,
    backgroundColor: theme.colors.surface,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: theme.colors.accent,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: theme.colors.surface,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
    gap: 8,
  },
  dropdownValue: {
    fontSize: 14,
    color: theme.colors.textPrimary,
    flex: 1,
  },
  dropdownList: {
    borderWidth: 1,
    borderColor: theme.colors.accent,
    borderRadius: 14,
    backgroundColor: theme.colors.surface,
    marginBottom: 12,
    overflow: "hidden",
  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surfaceAccent,
  },
  dropdownItemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dropdownItemText: {
    color: theme.colors.textPrimary,
    fontSize: 13,
    fontWeight: "600",
  },
  dropdownItemMeta: {
    color: theme.colors.textMuted,
    fontSize: 12,
  },
  readOnlyInput: {
    backgroundColor: theme.colors.surfaceAccent,
    color: theme.colors.textSecondary,
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
    borderColor: theme.colors.surfaceAccent,
    backgroundColor: theme.colors.surface,
  },
  dateChipActive: {
    backgroundColor: theme.colors.accent,
    borderColor: theme.colors.accent,
  },
  dateChipText: {
    color: theme.colors.textSecondary,
    fontWeight: "600",
    fontSize: 12,
  },
  dateChipTextActive: {
    color: theme.colors.white,
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
    borderColor: theme.colors.surfaceAccent,
    backgroundColor: theme.colors.surface,
  },
  timeChipActive: {
    borderColor: theme.colors.surfaceAccent,
    backgroundColor: theme.colors.surface,
  },
  timeChipDisabled: {
    backgroundColor: theme.colors.surfaceAccent,
    borderColor: theme.colors.surfaceAccent,
  },
  timeChipText: {
    color: theme.colors.textSecondary,
    fontWeight: "600",
    fontSize: 12,
  },
  timeChipTextActive: {
    color: theme.colors.white,
  },
  timeChipTextDisabled: {
    color: theme.colors.textMuted,
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
    borderColor: theme.colors.surfaceAccent,
    backgroundColor: theme.colors.surface,
  },
  countChipActive: {
    backgroundColor: theme.colors.accent,
    borderColor: theme.colors.accent,
  },
  countChipText: {
    color: theme.colors.textSecondary,
    fontWeight: "600",
  },
  countChipTextActive: {
    color: theme.colors.white,
  },
  petChip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: theme.colors.surfaceAccent,
    backgroundColor: theme.colors.surface,
  },
  petChipActive: {
    backgroundColor: theme.colors.accent,
    borderColor: theme.colors.accent,
  },
  petChipText: {
    color: theme.colors.textSecondary,
    fontWeight: "600",
    fontSize: 13,
  },
  petChipTextActive: {
    color: theme.colors.white,
  },
  addPetButton: {
    alignSelf: "flex-start",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: theme.colors.surfaceAccent,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    marginBottom: 16,
  },
  addPetButtonText: {
    color: theme.colors.textPrimary,
    fontWeight: "600",
  },
  helperText: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginBottom: 10,
  },
  scheduleTypeRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  scheduleTypeCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.surfaceAccent,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  scheduleTypeCardActive: {
    borderColor: theme.colors.accent,
    backgroundColor: theme.colors.surfaceAccent,
  },
  scheduleTypeIcon: {
    marginBottom: 2,
  },
  scheduleTypeLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.textSecondary,
  },
  scheduleTypeLabelActive: {
    color: theme.colors.textPrimary,
  },
  weekdayRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
    flexWrap: "wrap",
  },
  weekdayChip: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: theme.colors.surfaceAccent,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.surface,
  },
  weekdayChipActive: {
    backgroundColor: theme.colors.accent,
    borderColor: theme.colors.accent,
  },
  weekdayChipText: {
    fontSize: 12,
    fontWeight: "700",
    color: theme.colors.textSecondary,
  },
  weekdayChipTextActive: {
    color: theme.colors.white,
  },
  datePickerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.surfaceAccent,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
    backgroundColor: theme.colors.surface,
  },
  datePickerValue: {
    fontSize: 14,
    color: theme.colors.textPrimary,
    fontWeight: "600",
  },
  timeWindowRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 12,
  },
  timeWindowChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.surfaceAccent,
    backgroundColor: theme.colors.surface,
  },
  timeWindowChipActive: {
    backgroundColor: theme.colors.accent,
    borderColor: theme.colors.accent,
  },
  timeWindowText: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    fontWeight: "600",
  },
  timeWindowTextActive: {
    color: theme.colors.white,
  },
  availabilityCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: theme.colors.surfaceAccent,
    padding: 12,
    backgroundColor: theme.colors.surface,
    marginBottom: 12,
  },
  dogCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: theme.colors.surfaceAccent,
    marginBottom: 12,
  },
  dogTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: theme.colors.surfaceAccent,
    marginBottom: 8,
  },
  inlineInputs: {
    flexDirection: "row",
    gap: 10,
  },
  inlineInput: {
    flex: 1,
  },
  summaryBar: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: theme.colors.surfaceAccent,
    backgroundColor: theme.colors.background,
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
    color: theme.colors.textPrimary,
  },
  summaryTotal: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.textPrimary,
  },
  summaryLine: {
    fontSize: 13,
    color: theme.colors.textSecondary,
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
  summaryNote: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginBottom: 6,
  },
  summaryLabel: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.textPrimary,
  },
  calendarBackdrop: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(5, 4, 15, 0.7)",
  },
  calendarCard: {
    backgroundColor: theme.colors.background,
    borderRadius: 28,
    padding: CALENDAR_CARD_PADDING,
    marginHorizontal: CALENDAR_CARD_HORIZONTAL_MARGIN,
    maxHeight: "88%",
    borderWidth: 1,
    borderColor: "rgba(124, 69, 243, 0.4)",
    shadowColor: theme.shadow.soft.shadowColor,
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  calendarHeader: {
    alignItems: "center",
    marginBottom: 16,
  },
  calendarHeaderTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: theme.colors.textPrimary,
    marginBottom: 4,
    marginTop: 12,
  },
  calendarHeaderSubtitle: {
    fontSize: 12,
    color: theme.colors.textMuted,
  },
  calendarMonthsScroll: {
    paddingBottom: 8,
    flexGrow: 1,
  },
  calendarMonthPage: {
    flex: 1,
  },
  calendarMonthHeader: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 18,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.surfaceAccent,
    marginBottom: 12,
  },
  calendarMonthLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.textPrimary,
    textAlign: "center",
  },
  weekHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  weekHeaderText: {
    width: 36,
    textAlign: "center",
    color: theme.colors.textMuted,
    fontSize: 12,
    fontWeight: "600",
  },
  weekRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  dayCell: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "transparent",
  },
  daySelected: {
    backgroundColor: theme.colors.accent,
    borderColor: theme.colors.accentSoft,
  },
  dayPressed: {
    opacity: 0.85,
  },
  dayText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    fontWeight: "700",
  },
  dayTextSelected: {
    color: theme.colors.white,
  },
  calendarActions: {
    flexDirection: "row",
    gap: 0,
    marginTop: 1,
  },
  calendarActionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    marginRight: 12,
    marginLeft: 12,
    marginBottom: 12,
  },
  calendarCancelButton: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.borderStrong,
  },
  calendarConfirmButton: {
    backgroundColor: theme.colors.accent,
    borderColor: theme.colors.accent,
  },
  calendarActionPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  calendarCancelText: {
    fontSize: 13,
    fontWeight: "700",
    color: theme.colors.textPrimary,
  },
  calendarConfirmText: {
    fontSize: 13,
    fontWeight: "700",
    color: theme.colors.white,
  },
  errorText: {
    color: theme.colors.danger,
    fontSize: 13,
    marginBottom: 12,
  },
  successCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: theme.colors.surfaceAccent,
    alignItems: "center",
  },
  successTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: theme.colors.textPrimary,
    marginBottom: 8,
  },
  successText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: "center",
    marginBottom: 16,
  },
});

export default BookScreen;
