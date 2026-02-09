import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Linking,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { fetchJson } from "../api/client";
import { DEFAULT_AVAILABILITY_WINDOW_DAYS } from "../api/availability";
import {
  AVAILABILITY_TIMEOUT_MS,
  getCachedAvailability,
  prefetchAvailability,
} from "../api/availabilityCache";
import { supabase } from "../api/supabaseClient";
import { useSession } from "../context/SessionContext";
import { loadActiveCards, saveActiveCards } from "../utils/activeCards";
import {
  DEFAULT_HOME_LAYOUT,
  loadHomeLayout,
  saveHomeLayout,
} from "../utils/homeWidgets";
import {
  loadCachedPets,
  saveCachedPets,
} from "../utils/petProfilesCache";
import { useTheme } from "../context/ThemeContext";

const OWNER_EMAIL = "jeroen@jeroenandpaws.com";
const SUPPORT_PHONE = "+353872473099";
const DEFAULT_WIDGETS = ["wallet", "pets", "support", "bundles"];
const DEFAULT_SECTIONS = ["hero", "summary", "upcoming"];
const DASHBOARD_PROFILE_KEY = "home-dashboard-profile";
const HEADER_STYLES = [
  {
    id: "classic",
    label: "Classic",
    titleSize: 28,
    showBadge: true,
    showMeta: true,
  },
  {
    id: "minimal",
    label: "Minimal",
    titleSize: 22,
    showBadge: false,
    showMeta: false,
  },
  {
    id: "bold",
    label: "Bold",
    titleSize: 32,
    showBadge: true,
    showMeta: true,
  },
];

const ANNOUNCEMENTS = [
  {
    id: "consent-forms",
    title: "Digital consent forms are live",
    body: "Review treatment approvals and medical notes before each visit.",
    cta: "Review forms",
  },
];

const formatDateLabel = (date) =>
  new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "2-digit",
    month: "short",
  }).format(date);

const formatDateStamp = (date) =>
  new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);

const formatTime = (date) =>
  new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);

const formatTimeRange = (start, end) => {
  if (!start || !end) return "Time TBD";
  return `${formatTime(start)} – ${formatTime(end)}`;
};

const formatCurrency = (amount, currency = "EUR") =>
  new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);

const formatElapsedTime = (totalMs) => {
  if (!Number.isFinite(totalMs) || totalMs < 0) return "00:00:00";
  const totalSeconds = Math.floor(totalMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [
    String(hours).padStart(2, "0"),
    String(minutes).padStart(2, "0"),
    String(seconds).padStart(2, "0"),
  ].join(":");
};

const formatPetsLabel = (pets) => {
  if (!pets) return "Pets";
  if (Array.isArray(pets)) {
    const names = pets
      .map((pet) => (typeof pet === "string" ? pet : pet?.name))
      .filter(Boolean);
    return names.length ? names.join(", ") : "Pets";
  }
  if (typeof pets === "string") return pets;
  if (typeof pets === "object") return pets.name || "Pets";
  return "Pets";
};

const resolvePetId = (pet, index = 0) =>
  (
    pet?.id ||
    pet?.pet_id ||
    pet?.uuid ||
    pet?.slug ||
    pet?.name ||
    `pet-${index}`
  ).toString();

const resolvePetPreferences = (pet) => {
  const temperament =
    pet?.temperament || pet?.energy_level || pet?.personality;
  const handling =
    pet?.handling ||
    pet?.handling_notes ||
    pet?.care_instructions ||
    pet?.notes;
  const preferences = [];
  preferences.push({
    label: "Temperament",
    value: temperament || "Gentle & curious",
  });
  preferences.push({
    label: "Handling",
    value: handling || "Standard handling",
  });
  return preferences;
};

const BOOKING_STATUS_STEPS = [
  "Requested",
  "Confirmed",
  "Paid",
  "Completed",
];

const resolveBookingStepIndex = (status) => {
  const normalized = (status || "").toLowerCase();
  if (
    normalized.includes("complete") ||
    normalized.includes("finished") ||
    normalized.includes("done")
  ) {
    return 3;
  }
  if (normalized.includes("paid")) return 2;
  if (normalized.includes("confirm")) return 1;
  if (normalized.includes("request") || normalized.includes("pending")) return 0;
  return 0;
};

const startOfDay = (value = new Date()) => {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
};

const endOfDay = (value = new Date()) => {
  const date = startOfDay(value);
  date.setDate(date.getDate() + 1);
  return date;
};

const isSameDay = (value, reference) =>
  value &&
  reference &&
  startOfDay(value).getTime() === startOfDay(reference).getTime();

const resolveBookingPets = (booking) => {
  const directPets = booking?.pets;

  if (Array.isArray(directPets)) {
    return directPets.filter(Boolean);
  }

  if (directPets && typeof directPets === "object") {
    return [directPets];
  }

  if (typeof directPets === "string") {
    return [directPets];
  }

  const bookingPets = Array.isArray(booking?.booking_pets)
    ? booking.booking_pets
        .map((bookingPet) => bookingPet?.pets || bookingPet?.pet)
        .filter(Boolean)
    : [];

  return bookingPets;
};

const HomeScreen = ({ navigation }) => {
  const { session } = useSession();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [bookings, setBookings] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [activeRoverCards, setActiveRoverCards] = useState({});
  const [activeCardsLoaded, setActiveCardsLoaded] = useState(false);
  const [timeTick, setTimeTick] = useState(Date.now());
  const [refreshing, setRefreshing] = useState(false);
  const [finishedCards, setFinishedCards] = useState({});
  const [widgetIds, setWidgetIds] = useState(DEFAULT_WIDGETS);
  const [sectionIds, setSectionIds] = useState(DEFAULT_SECTIONS);
  const [customWidgets, setCustomWidgets] = useState([]);
  const [headerStyle, setHeaderStyle] = useState("classic");
  const [widgetsLoaded, setWidgetsLoaded] = useState(false);
  const [showWidgetSettings, setShowWidgetSettings] = useState(false);
  const [walletSummary, setWalletSummary] = useState(null);
  const [petsSummary, setPetsSummary] = useState({ count: 0, updatedAt: null });
  const [petsOffline, setPetsOffline] = useState(false);
  const [petProfiles, setPetProfiles] = useState([]);
  const [customForm, setCustomForm] = useState({
    title: "",
    body: "",
    action: "",
    cta: "",
  });
  const [layoutProfileId, setLayoutProfileId] = useState("all");
  const hasShownEmptyPetsPrompt = useRef(false);
  const isJeroenAccount =
    session?.email?.toLowerCase() === OWNER_EMAIL.toLowerCase();
  const dateStamp = useMemo(() => formatDateStamp(new Date()), []);

  const loadBookings = useCallback(
    async (options = {}) => {
      const { silent = false } = options;
      if (!session?.email) return;

      try {
        const data = await fetchJson(
          `/api/client-bookings?email=${encodeURIComponent(session.email)}`,
          { timeoutMs: 10000 }
        );
        setBookings(data.bookings || []);
        setLastUpdated(new Date());
      } catch (error) {
        console.error("Failed to load bookings", error);
      }
    },
    [session?.email]
  );

  useEffect(() => {
    if (session?.email) {
      loadBookings();
    }
  }, [session?.email, loadBookings]);

  useEffect(() => {
    let isMounted = true;
    const loadStoredActiveCards = async () => {
      if (!isJeroenAccount || !session?.email) {
        setActiveCardsLoaded(true);
        return;
      }
      const stored = await loadActiveCards(session.email);
      if (!isMounted) return;
      setActiveRoverCards(stored);
      setActiveCardsLoaded(true);
    };
    loadStoredActiveCards();
    return () => {
      isMounted = false;
    };
  }, [isJeroenAccount, session?.email]);

  useEffect(() => {
    if (!activeCardsLoaded || !isJeroenAccount || !session?.email) {
      return;
    }
    saveActiveCards(session.email, activeRoverCards);
  }, [activeCardsLoaded, activeRoverCards, isJeroenAccount, session?.email]);

  useEffect(() => {
    let isMounted = true;
    const loadDashboardProfile = async () => {
      if (!session?.email) return;
      try {
        const stored = await AsyncStorage.getItem(
          `${DASHBOARD_PROFILE_KEY}:${session.email.toLowerCase()}`
        );
        if (!isMounted) return;
        if (stored) {
          setLayoutProfileId(stored);
        }
      } catch (error) {
        console.warn("Unable to load dashboard profile", error);
      }
    };
    loadDashboardProfile();
    return () => {
      isMounted = false;
    };
  }, [session?.email]);

  useEffect(() => {
    if (!session?.email) return;
    AsyncStorage.setItem(
      `${DASHBOARD_PROFILE_KEY}:${session.email.toLowerCase()}`,
      layoutProfileId
    ).catch((error) =>
      console.warn("Unable to save dashboard profile", error)
    );
  }, [layoutProfileId, session?.email]);

  useEffect(() => {
    let isMounted = true;
    const loadWidgets = async () => {
      if (!session?.email) {
        setWidgetsLoaded(true);
        return;
      }
      setWidgetsLoaded(false);
      const stored = await loadHomeLayout(session.email, {
        ...DEFAULT_HOME_LAYOUT,
        widgetIds: DEFAULT_WIDGETS,
        sectionIds: DEFAULT_SECTIONS,
        headerStyle: "classic",
      }, layoutProfileId === "all" ? null : layoutProfileId);
      if (!isMounted) return;
      setWidgetIds(stored.widgetIds || DEFAULT_WIDGETS);
      setSectionIds(stored.sectionIds || DEFAULT_SECTIONS);
      setCustomWidgets(
        Array.isArray(stored.customWidgets) ? stored.customWidgets : []
      );
      setHeaderStyle(stored.headerStyle || "classic");
      setWidgetsLoaded(true);
    };
    loadWidgets();
    return () => {
      isMounted = false;
    };
  }, [layoutProfileId, session?.email]);

  useEffect(() => {
    if (!widgetsLoaded || !session?.email) return;
    saveHomeLayout(session.email, {
      widgetIds,
      sectionIds,
      customWidgets,
      headerStyle,
    }, layoutProfileId === "all" ? null : layoutProfileId);
  }, [
    customWidgets,
    headerStyle,
    sectionIds,
    widgetIds,
    widgetsLoaded,
    layoutProfileId,
    session?.email,
  ]);

  useFocusEffect(
    useCallback(() => {
      if (session?.email) {
        loadBookings({ silent: true });
      }
    }, [loadBookings, session?.email])
  );

  const loadWalletSummary = useCallback(async () => {
    if (!supabase || !session?.id) {
      setWalletSummary(null);
      return;
    }
    try {
      const { data, error } = await supabase
        .from("wallets")
        .select("*")
        .eq("client_id", session.id)
        .maybeSingle();
      if (error) throw error;
      setWalletSummary(data || null);
    } catch (error) {
      console.error("Failed to load wallet summary", error);
    }
  }, [session?.id]);

  const loadPetsSummary = useCallback(
    async ({ allowCache = true } = {}) => {
      if (!session?.email) return;
      if (allowCache) {
        const cached = await loadCachedPets(session.email);
        if (cached?.pets) {
          setPetsSummary({
            count: cached.pets.length,
            updatedAt: cached.updatedAt || null,
          });
          setPetProfiles(cached.pets);
        }
      }
      try {
        const data = await fetchJson(
          `/api/pets?ownerEmail=${encodeURIComponent(session.email)}`
        );
        const pets = Array.isArray(data?.pets) ? data.pets : [];
        setPetsSummary({
          count: pets.length,
          updatedAt: new Date().toISOString(),
        });
        setPetProfiles(pets);
        setPetsOffline(false);
        await saveCachedPets(session.email, pets);
      } catch (error) {
        console.error("Failed to load pet summary", error);
        setPetsOffline(true);
      }
    },
    [session?.email]
  );

  useEffect(() => {
    if (session?.email) {
      loadWalletSummary();
      loadPetsSummary();
    }
  }, [loadPetsSummary, loadWalletSummary, session?.email]);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const checkPets = async () => {
        if (!session?.email || isJeroenAccount) return;
        if (hasShownEmptyPetsPrompt.current) return;
        try {
          const data = await fetchJson(
            `/api/pets?ownerEmail=${encodeURIComponent(session.email)}`
          );
          if (!isActive) return;
          const pets = Array.isArray(data?.pets) ? data.pets : [];
          if (pets.length === 0) {
            hasShownEmptyPetsPrompt.current = true;
            Alert.alert(
              "Add your pets",
              "You don't have any pets yet. Add a pet to start booking walks and services.",
              [
                {
                  text: "Add pets",
                  onPress: () =>
                    navigation.navigate("Profile", {
                      screen: "PetsProfile",
                      params: { mode: "create", returnTo: "MainTabs" },
                    }),
                },
                { text: "Not now", style: "cancel" },
              ]
            );
          }
        } catch (error) {
          console.error("Failed to check pets", error);
        }
      };

      checkPets();

      return () => {
        isActive = false;
      };
    }, [isJeroenAccount, navigation, session?.email])
  );

  useEffect(() => {
    let isMounted = true;
    let timeoutId;

    const loadInitialAvailability = async () => {
      const clientAddress = (session?.address || session?.client?.address || "")
        .trim();
      if (!clientAddress) return;

      try {
        const defaultDurationMinutes = 60;
        const cached = getCachedAvailability({
          durationMinutes: defaultDurationMinutes,
          windowDays: DEFAULT_AVAILABILITY_WINDOW_DAYS,
          clientAddress,
        });
        if (cached) return;
        const data = await fetchJson("/api/services", {
          timeoutMs: AVAILABILITY_TIMEOUT_MS,
        });
        if (!isMounted) return;
        const services = (data?.services || []).filter(Boolean);
        if (!services.length) return;
        await Promise.all(
          services.map((service) => {
            const durationMinutes = Number(
              service.duration_minutes ||
                service.durationMinutes ||
                defaultDurationMinutes
            );
            return prefetchAvailability({
              durationMinutes,
              windowDays: DEFAULT_AVAILABILITY_WINDOW_DAYS,
              clientAddress,
              timeoutMs: AVAILABILITY_TIMEOUT_MS,
            });
          })
        );
      } catch (error) {
        console.warn("Failed to prefetch availability", error);
      }
    };

    if (session?.email) {
      timeoutId = setTimeout(loadInitialAvailability, 150);
    }

    return () => {
      isMounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [session?.email, session?.address]);

  useEffect(() => {
    const activeCount = Object.keys(activeRoverCards).length;
    if (!activeCount) {
      return undefined;
    }
    const interval = setInterval(() => setTimeTick(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [activeRoverCards]);

  const loadFinishedCards = useCallback(async () => {
    if (!supabase || !session?.email) {
      setFinishedCards({});
      return;
    }

    try {
      const dayStart = startOfDay();
      const dayEnd = endOfDay();
      let query = supabase
        .from("jeroen_paws_cards")
        .select("*")
        .gte("finished_at", dayStart.toISOString())
        .lt("finished_at", dayEnd.toISOString());

      if (isJeroenAccount) {
        query = query.eq("owner_email", session.email);
      } else if (session?.id) {
        query = query.eq("client_id", session.id);
      }

      const { data, error } = await query;
      if (error) {
        throw error;
      }

      const mapped = (data || []).reduce((acc, card) => {
        if (card?.booking_id) {
          acc[card.booking_id] = card;
        }
        return acc;
      }, {});
      setFinishedCards(mapped);
    } catch (error) {
      console.error("Failed to load finished cards", error);
    }
  }, [isJeroenAccount, session?.email, session?.id]);

  useEffect(() => {
    loadFinishedCards();
  }, [loadFinishedCards]);

  useEffect(() => {
    if (!Object.keys(finishedCards).length) {
      return;
    }
    setActiveRoverCards((prev) => {
      const next = { ...prev };
      Object.keys(finishedCards).forEach((bookingId) => {
        delete next[bookingId];
      });
      return next;
    });
  }, [finishedCards]);

  useEffect(() => {
    if (!supabase || !session?.id) {
      return undefined;
    }

    const bookingFilter =
      !isJeroenAccount && session?.id
        ? `client_id=eq.${session.id}`
        : undefined;
    const bookingChannel = supabase
      .channel("bookings-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bookings", filter: bookingFilter },
        () => {
          loadBookings({ silent: true });
        }
      )
      .subscribe();

    const cardChannel = supabase
      .channel("jeroen-paws-cards-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "jeroen_paws_cards" },
        () => {
          loadFinishedCards();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(bookingChannel);
      supabase.removeChannel(cardChannel);
    };
  }, [isJeroenAccount, loadBookings, loadFinishedCards, session?.id]);


  const now = new Date();
  const upcomingBookings = bookings
    .filter((booking) => {
      const start = booking?.start_at ? new Date(booking.start_at) : null;
      const status = (booking?.status || "").toLowerCase();
      if (!start) return false;
      if (status.includes("cancelled") || status.includes("canceled")) {
        return false;
      }
      const isAllowedStatus =
        !status ||
        status.includes("confirmed") ||
        status.includes("paid") ||
        status.includes("scheduled") ||
        status.includes("completed") ||
        status.includes("finished");
      if (!isAllowedStatus) {
        return false;
      }
      if (isSameDay(start, now)) {
        return true;
      }
      return start >= now;
    })
    .sort(
      (a, b) => new Date(a.start_at || 0) - new Date(b.start_at || 0)
    );
  const upcomingPreview = upcomingBookings;
  const nextBooking = upcomingBookings[0];
  const nextStart = nextBooking?.start_at ? new Date(nextBooking.start_at) : null;
  const nextEnd = nextBooking?.end_at ? new Date(nextBooking.end_at) : null;
  const nextServiceTitle =
    nextBooking?.service_title || nextBooking?.services_catalog?.title;

  const displayName = session?.name || "Jeroen";
  const firstName = displayName.split(" ").filter(Boolean)[0] || displayName;
  const initials = displayName
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

    const toggleWidget = (widgetId) => {
    setWidgetIds((prev) =>
      prev.includes(widgetId)
        ? prev.filter((id) => id !== widgetId)
        : [...prev, widgetId]
    );
  };

  const toggleSection = (sectionId) => {
    setSectionIds((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const handleWidgetPress = (widget) => {
    if (widget.action === "call-support") {
      Linking.openURL(`tel:${SUPPORT_PHONE}`);
      return;
    }
    if (widget.action === "link" && widget.actionValue) {
      Linking.openURL(widget.actionValue);
      return;
    }
    if (widget.action === "profile" && widget.actionValue) {
      navigation.navigate("Profile", {
        screen: widget.actionValue,
        params: { returnTo: "Home" },
      });
      return;
    }
    if (widget.action === "screen" && widget.actionValue) {
      navigation.navigate(
        widget.actionValue,
        widget.actionParams || { returnTo: "Home" }
      );
    }
  };

  const handleAddCustomWidget = () => {
    if (!customForm.title || !customForm.action) return;
    const newWidget = {
      id: `custom-${Date.now()}`,
      title: customForm.title,
      body: customForm.body || "Custom shortcut",
      cta: customForm.cta || "Open",
      action: "link",
      actionValue: customForm.action,
      icon: "sparkles-outline",
    };
    setCustomWidgets((prev) => [...prev, newWidget]);
    setWidgetIds((prev) => [...prev, newWidget.id]);
    setCustomForm({ title: "", body: "", action: "", cta: "" });
  };

  const handleRemoveCustomWidget = (widgetId) => {
    setCustomWidgets((prev) => prev.filter((widget) => widget.id !== widgetId));
    setWidgetIds((prev) => prev.filter((id) => id !== widgetId));
  };

  const widgets = useMemo(() => {
    const baseWidgets = [
      {
        id: "wallet",
        title: "Wallet balance",
        body: walletSummary
          ? formatCurrency(
              (walletSummary.balance_cents || 0) / 100,
              walletSummary.currency || "EUR"
            )
          : "Link a wallet to see your balance.",
        cta: "View wallet",
        action: "screen",
        actionValue: "Wallet",
        icon: "cash-outline",
      },
      {
        id: "pets",
        title: "Pet profiles",
        body: `${petsSummary.count} pet${
          petsSummary.count === 1 ? "" : "s"
        } saved${petsOffline ? " (offline)" : ""}.`,
        cta: "View pets",
        action: "profile",
        actionValue: "PetsProfile",
        icon: "paw-outline",
      },
      {
        id: "support",
        title: "Call support",
        body: "One-tap call for urgent help.",
        cta: "Call now",
        action: "call-support",
        icon: "call-outline",
      },
      {
        id: "bundles",
        title: "Seasonal add-ons",
        body: "Explore limited-time care bundles.",
        cta: "Browse bundles",
        action: "screen",
        actionValue: "ServiceBundles",
        icon: "leaf-outline",
      },
      {
        id: "messages",
        title: "Inbox",
        body: "Stay in sync with updates.",
        cta: "Open messages",
        action: "screen",
        actionValue: "Messages",
        icon: "chatbubble-ellipses-outline",
      },
      {
        id: "book",
        title: "Book a service",
        body: "Plan your next visit.",
        cta: "Book now",
        action: "screen",
        actionValue: "Book",
        icon: "calendar-outline",
      },
    ];

    const ownerWidgets = isJeroenAccount
      ? [
          {
            id: "clients",
            title: "Client profiles",
            body: "View all client accounts and pets.",
            cta: "Open clients",
            action: "screen",
            actionValue: "ClientProfiles",
            icon: "people-outline",
          },
          {
            id: "all-pets",
            title: "All pets",
            body: "Browse pets across your client list.",
            cta: "View pets",
            action: "screen",
            actionValue: "ClientProfiles",
            icon: "paw-outline",
          },
          {
            id: "support-tickets",
            title: "Support tickets",
            body: "Check open support requests.",
            cta: "Review tickets",
            action: "screen",
            actionValue: "SupportTickets",
            icon: "help-circle-outline",
          },
        ]
      : [];

    const custom = customWidgets.map((widget) => ({
      ...widget,
      action: widget.action || "link",
      actionValue: widget.actionValue || widget.action,
      isCustom: true,
    }));

    return [...baseWidgets, ...ownerWidgets, ...custom];
  }, [
    customWidgets,
    isJeroenAccount,
    petsOffline,
    petsSummary.count,
    walletSummary,
  ]);

  const petDashboardOptions = useMemo(() => {
    const options = [
      {
        id: "all",
        label: "All pets",
      },
    ];
    petProfiles.forEach((pet, index) => {
      options.push({
        id: resolvePetId(pet, index),
        label: pet?.name || `Pet ${index + 1}`,
      });
    });
    return options;
  }, [petProfiles]);

  const activeDashboardLabel =
    petDashboardOptions.find((option) => option.id === layoutProfileId)?.label ||
    "All pets";

  const careHighlights = useMemo(
    () => [
      {
        id: "multi-pet",
        title: "Multi-pet booking",
        body: "Reserve one time slot for all of your pets together.",
        cta: "Book multiple pets",
        action: () => navigation.navigate("Book", { mode: "multi-pet" }),
      },
      {
        id: "consent",
        title: "Digital consent forms",
        body: "Approve treatments and medications before each visit.",
        cta: "Review consent forms",
        action: () =>
          navigation.navigate("Profile", {
            screen: "ProfileOverview",
            params: { returnTo: "Home", focus: "consent-forms" },
          }),
      },
      {
        id: "preferences",
        title: "Saved service preferences",
        body: "Store temperament and handling notes per pet.",
        cta: "Edit pet preferences",
        action: () =>
          navigation.navigate("Profile", {
            screen: "PetsProfile",
            params: { returnTo: "Home" },
          }),
      },
      {
        id: "dashboards",
        title: "Switchable home layouts",
        body: "Save a home layout per pet and toggle dashboards instantly.",
        cta: "Manage layouts",
        action: () => setShowWidgetSettings(true),
      },
    ],
    [navigation]
  );

  const sectionChoices = useMemo(
    () => [
      {
        id: "announcements",
        title: "Announcements banner",
        description: "App-wide updates and service notes.",
      },
      {
        id: "hero",
        title: "Welcome hero",
        description: "Greeting, badge, and profile access.",
      },
      {
        id: "summary",
        title: "Summary cards",
        description: "Upcoming count and next visit details.",
      },
      {
        id: "careHub",
        title: "Pet care hub",
        description: "Multi-pet booking, consent forms, and preferences.",
      },
      {
        id: "highlight",
        title: "Booking spotlight",
        description: "Highlight your next booking.",
      },
      {
        id: "widgets",
        title: "Dashboard widgets",
        description: "Quick shortcuts and custom tiles.",
      },
      {
        id: "quickActions",
        title: "Quick actions",
        description: "Book and message shortcuts.",
      },
      {
        id: "upcoming",
        title: "Upcoming visits",
        description: "Your scheduled services list.",
      },
    ],
    []
  );

  const activeHeaderStyle =
    HEADER_STYLES.find((style) => style.id === headerStyle) ||
    HEADER_STYLES[0];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={async () => {
              setRefreshing(true);
              await Promise.all([
                loadBookings(),
                loadFinishedCards(),
                loadWalletSummary(),
                loadPetsSummary({ allowCache: false }),
              ]);
              setRefreshing(false);
            }}
            tintColor={theme.colors.accent}
          />
        }
      >
        {sectionIds.includes("hero") ? (
          <View style={styles.heroCard}>
            <View style={styles.heroGlow} />
            <View style={styles.heroRow}>
              <View style={styles.heroCopy}>
                {activeHeaderStyle.showBadge ? (
                  <View style={styles.heroBadge}>
                    <Ionicons
                      name="sparkles"
                      size={14}
                      color={theme.colors.accent}
                    />
                    <Text style={styles.heroBadgeText}>Premium care</Text>
                  </View>
                ) : null}
                <Text
                  style={[
                    styles.title,
                    { fontSize: activeHeaderStyle.titleSize },
                  ]}
                >
                  Welcome back, {firstName}
                </Text>
                <Text style={styles.subtitle}>
                  Warm, attentive walks designed for every personality.
                </Text>
              </View>
              <View style={styles.headerRight}>
                <Pressable
                  onPress={() =>
                    navigation.navigate("Profile", {
                      screen: "ProfileOverview",
                      params: { returnTo: "Home" },
                    })
                  }
                >
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{initials}</Text>
                  </View>
                </Pressable>
              </View>
            </View>
            <View style={styles.heroActions}>
              <Pressable
                style={({ pressed }) => [
                  styles.metaPill,
                  styles.metaAction,
                  pressed && styles.cardPressed,
                ]}
                onPress={() => setShowWidgetSettings((current) => !current)}
              >
                <Ionicons
                  name="options-outline"
                  size={14}
                  color={theme.colors.accent}
                />
                <Text style={styles.metaActionText}>
                  {showWidgetSettings ? "Close editor" : "Customize"}
                </Text>
              </Pressable>
            </View>
            {activeHeaderStyle.showMeta ? (
              <View style={styles.heroMetaRow}>
                <View style={styles.metaPill}>
                  <Ionicons
                    name="calendar-outline"
                    size={14}
                    color={theme.colors.textPrimary}
                  />
                  <Text style={styles.metaText}>{dateStamp}</Text>
                </View>
                <View style={styles.metaPill}>
                  <Ionicons
                    name="time-outline"
                    size={14}
                    color={theme.colors.textPrimary}
                  />
                  <Text style={styles.metaText}>
                    Updated {lastUpdated ? formatTime(lastUpdated) : "—"}
                  </Text>
                </View>
              </View>
            ) : null}
          </View>
        ) : null}

        {sectionIds.includes("announcements") ? (
          <View style={styles.announcementCard}>
            <View style={styles.announcementIcon}>
              <Ionicons
                name="megaphone-outline"
                size={18}
                color={theme.colors.accent}
              />
            </View>
            <View style={styles.announcementCopy}>
              <Text style={styles.announcementTitle}>
                {ANNOUNCEMENTS[0].title}
              </Text>
              <Text style={styles.announcementBody}>
                {ANNOUNCEMENTS[0].body}
              </Text>
            </View>
            <Pressable
              style={({ pressed }) => [
                styles.announcementButton,
                pressed && styles.cardPressed,
              ]}
              onPress={() =>
                navigation.navigate("Profile", {
                  screen: "ProfileOverview",
                  params: { returnTo: "Home", focus: "consent-forms" },
                })
              }
            >
              <Text style={styles.announcementButtonText}>
                {ANNOUNCEMENTS[0].cta}
              </Text>
            </Pressable>
          </View>
        ) : null}

        {sectionIds.includes("summary") ? (
          <View style={styles.summaryRow}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Upcoming</Text>
              <Text style={styles.summaryValue}>{upcomingBookings.length}</Text>
              <Text style={styles.summaryCaption}>
                booking{upcomingBookings.length === 1 ? "" : "s"}
              </Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Next visit</Text>
              <Text style={styles.summaryValue}>
                {nextStart ? formatDateLabel(nextStart) : "No visits"}
              </Text>
              <Text style={styles.summaryCaption}>
                {nextStart ? formatTimeRange(nextStart, nextEnd) : "Tap to book"}
              </Text>
            </View>
          </View>
          ) : null}

        {sectionIds.includes("careHub") ? (
          <View style={styles.careHub}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Pet care hub</Text>
              <Text style={styles.sectionMeta}>
                Multi-pet booking, consent forms, and preferences.
              </Text>
            </View>
            <View style={styles.careGrid}>
              {careHighlights.map((item) => (
                <Pressable
                  key={item.id}
                  style={({ pressed }) => [
                    styles.careCard,
                    pressed && styles.cardPressed,
                  ]}
                  onPress={item.action}
                >
                  <Text style={styles.careTitle}>{item.title}</Text>
                  <Text style={styles.careBody}>{item.body}</Text>
                  <Text style={styles.careCta}>{item.cta}</Text>
                </Pressable>
              ))}
            </View>
            <View style={styles.preferencesCard}>
              <Text style={styles.preferencesTitle}>
                Saved service preferences
              </Text>
              {petProfiles.length ? (
                petProfiles.slice(0, 3).map((pet, index) => (
                  <View
                    key={resolvePetId(pet, index)}
                    style={styles.preferencesRow}
                  >
                    <Text style={styles.preferencesName}>
                      {pet?.name || `Pet ${index + 1}`}
                    </Text>
                    <View style={styles.preferenceTags}>
                      {resolvePetPreferences(pet).map((pref) => (
                        <View
                          key={`${pref.label}-${pref.value}`}
                          style={styles.preferenceTag}
                        >
                          <Text style={styles.preferenceTagText}>
                            {pref.label}: {pref.value}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                ))
              ) : (
                <Text style={styles.preferencesEmpty}>
                  Add temperament and handling notes in pet profiles to see them
                  here.
                </Text>
              )}
            </View>
          </View>
        ) : null}

        {sectionIds.includes("upcoming") ? (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Upcoming visits</Text>
              <Text style={styles.sectionMeta}>
                {upcomingBookings.length
                  ? `${upcomingBookings.length} scheduled`
                  : "No upcoming bookings yet"}
              </Text>
            </View>
            {upcomingPreview.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>
                  Upcoming bookings will appear once confirmed. Tap Book to
                  schedule your next visit.
                </Text>
              </View>
            ) : (
              upcomingPreview.map((booking, index) => {
                const start = booking?.start_at
                  ? new Date(booking.start_at)
                  : null;
                const end = booking?.end_at ? new Date(booking.end_at) : null;
                const serviceTitle =
                  booking?.service_title || booking?.services_catalog?.title;
                const petList = resolveBookingPets(booking);
                const petsLabel = formatPetsLabel(petList);
                const isMultiPet = petList.length > 1;
                const isNextBooking = index === 0;
                const bookingId =
                  booking?.id ?? booking?.start_at ?? serviceTitle;
                const finishedCard = finishedCards[booking?.id];
                const hasActiveCard = Boolean(activeRoverCards[bookingId]);
                const activeStart = activeRoverCards[bookingId];
                const canViewCard = Boolean(finishedCard?.id);
                const elapsedMs =
                  hasActiveCard && activeStart
                    ? Math.max(timeTick - activeStart, 0)
                    : 0;
                const statusStepIndex = resolveBookingStepIndex(
                  finishedCard ? "completed" : booking?.status
                );

            return (
                  <View
                    key={bookingId}
                    style={[
                      styles.card,
                      isJeroenAccount && styles.cardJeroen,
                      hasActiveCard && styles.cardJeroenActive,
                      isNextBooking && styles.nextBookingCard,
                    ]}
                  >
                    <View style={styles.cardRow}>
                      <View>
                        <Text style={styles.cardTime}>
                          {formatTimeRange(start, end)}
                        </Text>
                        <View style={styles.cardTitleRow}>
                          <Text style={styles.cardTitle}>
                            {serviceTitle || "Service"}
                          </Text>
                          {isMultiPet ? (
                            <View style={styles.multiPetBadge}>
                              <Ionicons
                                name="paw"
                                size={12}
                                color={theme.colors.accent}
                              />
                              <Text style={styles.multiPetText}>Multi-pet</Text>
                            </View>
                          ) : null}
                        </View>
                        <Text style={styles.cardMeta}>{petsLabel}</Text>
                      </View>
                      <View style={styles.statusBadge}>
                        <Text style={styles.statusBadgeText}>
                          {finishedCard
                            ? "Finished"
                            : booking.status || "Scheduled"}
                        </Text>
                      </View>
                    </View>
                    {isNextBooking ? (
                      <View style={styles.nextBookingBadge}>
                        <Text style={styles.nextBookingBadgeText}>
                          Next booking
                        </Text>
                      </View>
                    ) : null}
                    <View style={styles.statusTimeline}>
                      {BOOKING_STATUS_STEPS.map((step, index) => {
                        const isComplete = index <= statusStepIndex;
                        const isLast =
                          index === BOOKING_STATUS_STEPS.length - 1;
                        return (
                          <View key={step} style={styles.statusStep}>
                            <View style={styles.statusIndicator}>
                              <View
                                style={[
                                  styles.statusDot,
                                  isComplete && styles.statusDotActive,
                                ]}
                              />
                              {!isLast ? (
                                <View
                                  style={[
                                    styles.statusLine,
                                    isComplete && styles.statusLineActive,
                                  ]}
                                />
                              ) : null}
                            </View>
                            <Text
                              style={[
                                styles.statusLabel,
                                isComplete && styles.statusLabelActive,
                              ]}
                            >
                              {step}
                            </Text>
                          </View>
                        );
                      })}
                    </View>
                    {isJeroenAccount || canViewCard ? (
                      <View style={styles.cardFooter}>
                        {isJeroenAccount && hasActiveCard ? (
                          <Text style={styles.cardTimerText}>
                            Timer {formatElapsedTime(elapsedMs)}
                          </Text>
                        ) : null}
                        <Pressable
                          style={({ pressed }) => [
                            styles.cardButton,
                            (hasActiveCard || finishedCard) &&
                              styles.cardButtonActive,
                            pressed && styles.cardPressed,
                          ]}
                          onPress={() => {
                            if (finishedCard?.id) {
                              navigation.navigate("JeroenPawsCard", {
                                cardId: finishedCard.id,
                                readOnly: true,
                                returnTo: "Home",
                              });
                              return;
                            }
                            if (hasActiveCard) {
                              navigation.navigate("JeroenPawsCard", {
                                bookingId,
                                serviceTitle,
                                pets: petList,
                                clientId: booking?.client_id,
                                startedAt: activeStart,
                                bookingStart: booking?.start_at,
                                bookingEnd: booking?.end_at,
                                returnTo: "Home",
                              });
                              return;
                            }
                            if (!isJeroenAccount) {
                              return;
                            }
                            const startTimestamp = Date.now();
                            setActiveRoverCards((prev) => ({
                              ...prev,
                              [bookingId]: startTimestamp,
                            }));
                            navigation.navigate("JeroenPawsCard", {
                              bookingId,
                              serviceTitle,
                              pets: petList,
                              clientId: booking?.client_id,
                              startedAt: startTimestamp,
                              bookingStart: booking?.start_at,
                              bookingEnd: booking?.end_at,
                              returnTo: "Home",
                            });
                          }}
                        >
                          <Text
                            style={[
                              styles.cardButtonText,
                              (hasActiveCard || finishedCard) &&
                                styles.cardButtonTextActive,
                            ]}
                          >
                            {finishedCard
                              ? "Open Jeroen & Paws Card"
                              : hasActiveCard
                              ? "Open Jeroen & Paws Card"
                              : isJeroenAccount
                              ? "Start Jeroen & Paws Card"
                              : "View Jeroen & Paws Card"}
                          </Text>
                        </Pressable>
                        {isJeroenAccount && booking?.client_id ? (
                          <Pressable
                            style={({ pressed }) => [
                              styles.cardButton,
                              pressed && styles.cardPressed,
                            ]}
                            onPress={() =>
                              navigation.navigate("Profile", {
                                screen: "ProfileOverview",
                                params: {
                                  clientId: booking.client_id,
                                  returnTo: "Home",
                                },
                              })
                            }
                          >
                            <Text style={styles.cardButtonText}>
                              View client profile
                            </Text>
                          </Pressable>
                        ) : null}
                      </View>
                    ) : null}
                  </View>
                );
              })
            )}
          </>
        ) : null}

        {sectionIds.includes("highlight") ? (
          <View style={styles.highlightCard}>
            <View style={styles.highlightIcon}>
              <Ionicons
                name="calendar"
                size={18}
                color={theme.colors.accent}
              />
            </View>
            <View>
              <Text style={styles.highlightTitle}>
                {nextServiceTitle || "Booking spotlight"}
              </Text>
              <Text style={styles.highlightText}>
                {nextStart
                  ? `Next visit on ${formatDateLabel(nextStart)}.`
                  : "Plan your next service in just a few taps."}
              </Text>
            </View>
          </View>
        ) : null}

        

        {sectionIds.includes("widgets") ? (
          <>
            <View style={styles.widgetGrid}>
              {widgets
                .filter((widget) => widgetIds.includes(widget.id))
                .map((widget) => (
                  <Pressable
                    key={widget.id}
                    style={({ pressed }) => [
                      styles.widgetCard,
                      pressed && styles.cardPressed,
                    ]}
                    onPress={() => handleWidgetPress(widget)}
                  >
                    <View style={styles.widgetIcon}>
                      <Ionicons
                        name={widget.icon}
                        size={20}
                        color={theme.colors.accent}
                      />
                    </View>
                    <Text style={styles.widgetTitle}>{widget.title}</Text>
                    <Text style={styles.widgetBody}>{widget.body}</Text>
                    <Text style={styles.widgetCta}>{widget.cta}</Text>
                  </Pressable>
                ))}
            </View>
          </>
        ) : null}

        {sectionIds.includes("quickActions") ? (
          <View style={styles.quickActions}>
            <Pressable
              style={({ pressed }) => [
                styles.quickCard,
                pressed && styles.cardPressed,
              ]}
              onPress={() => navigation.navigate("Book")}
            >
              <View style={styles.quickIcon}>
                <Ionicons
                  name="add-circle"
                  size={22}
                  color={theme.colors.accent}
                />
              </View>
              <View style={styles.quickCopy}>
                <Text style={styles.quickLabel}>Book a service</Text>
                <Text style={styles.quickSubtext}>
                  Send a new request in seconds
                </Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.quickCard,
                pressed && styles.cardPressed,
              ]}
              onPress={() => navigation.navigate("Messages")}
            >
              <View style={styles.quickIcon}>
                <Ionicons
                  name="chatbubble-ellipses"
                  size={20}
                  color={theme.colors.accent}
                />
              </View>
              <View style={styles.quickCopy}>
                <Text style={styles.quickLabel}>Message Jeroen</Text>
                <Text style={styles.quickSubtext}>
                  Ask a question or share details
                </Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </Pressable>
          </View>
        ) : null}


        
        {showWidgetSettings ? (
          <View style={styles.widgetSettings}>
            <Text style={styles.widgetSettingsTitle}>Dashboard profile</Text>
            <Text style={styles.widgetSettingsHint}>
              Layouts are saved per pet. Active: {activeDashboardLabel}
            </Text>
            <View style={styles.profileChips}>
              {petDashboardOptions.map((option) => (
                <Pressable
                  key={option.id}
                  style={({ pressed }) => [
                    styles.profileChip,
                    layoutProfileId === option.id && styles.profileChipActive,
                    pressed && styles.cardPressed,
                  ]}
                  onPress={() => setLayoutProfileId(option.id)}
                >
                  <Text
                    style={[
                      styles.profileChipText,
                      layoutProfileId === option.id &&
                        styles.profileChipTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              ))}
            </View>
            <Text style={styles.widgetSettingsTitle}>Home layout</Text>
            {sectionChoices.map((section) => (
              <View key={section.id} style={styles.widgetSettingRow}>
                <View style={styles.widgetSettingCopy}>
                  <Text style={styles.widgetSettingTitle}>
                    {section.title}
                  </Text>
                  <Text style={styles.widgetSettingBody}>
                    {section.description}
                  </Text>
                </View>
                <Switch
                  value={sectionIds.includes(section.id)}
                  onValueChange={() => toggleSection(section.id)}
                />
              </View>
            ))}
            <Text style={styles.widgetSettingsTitle}>Header style</Text>
            <View style={styles.widgetOptionsRow}>
              {HEADER_STYLES.map((style) => (
                <Pressable
                  key={style.id}
                  style={[
                    styles.widgetOption,
                    headerStyle === style.id && styles.widgetOptionActive,
                  ]}
                  onPress={() => setHeaderStyle(style.id)}
                >
                  <Text
                    style={[
                      styles.widgetOptionText,
                      headerStyle === style.id && styles.widgetOptionTextActive,
                    ]}
                  >
                    {style.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.widgetSettingsTitle}>Dashboard widgets</Text>
            {widgets.map((widget) => (
              <View key={widget.id} style={styles.widgetSettingRow}>
                <View style={styles.widgetSettingCopy}>
                  <Text style={styles.widgetSettingTitle}>
                    {widget.title}
                  </Text>
                  <Text style={styles.widgetSettingBody}>
                    {widget.cta}
                  </Text>
                </View>
                <View style={styles.widgetSettingActions}>
                  {widget.isCustom ? (
                    <Pressable
                      style={styles.widgetRemoveButton}
                      onPress={() => handleRemoveCustomWidget(widget.id)}
                    >
                      <Text style={styles.widgetRemoveText}>Remove</Text>
                    </Pressable>
                  ) : null}
                  <Switch
                    value={widgetIds.includes(widget.id)}
                    onValueChange={() => toggleWidget(widget.id)}
                  />
                </View>
              </View>
            ))}
          </View>
        ) : null}

      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (theme) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    container: {
      flexGrow: 1,
      padding: theme.spacing.lg,
      paddingBottom: theme.spacing.xxl,
      backgroundColor: theme.colors.background,
    },
    heroCard: {
      padding: theme.spacing.lg,
      borderRadius: theme.radius.xl,
      backgroundColor: theme.colors.surfaceElevated,
      borderWidth: 1,
      borderColor: theme.colors.borderSoft,
      marginBottom: theme.spacing.md,
      overflow: "hidden",
    },
    heroGlow: {
      position: "absolute",
      top: -80,
      right: -60,
      width: 220,
      height: 220,
      borderRadius: 999,
      backgroundColor: theme.colors.accentMuted,
      opacity: 0.35,
    },
    heroRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: theme.spacing.sm,
    },
    heroCopy: {
      flex: 1,
      gap: 6,
    },
    heroBadge: {
      alignSelf: "flex-start",
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: theme.colors.surfaceGlass,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 6,
      borderRadius: theme.radius.pill,
      borderWidth: 1,
      borderColor: theme.colors.borderSoft,
    },
    heroBadgeText: {
      fontSize: 12,
      fontWeight: "600",
      color: theme.colors.accent,
      textTransform: "uppercase",
      letterSpacing: 0.6,
    },
    heroMetaRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: theme.spacing.sm,
      marginTop: theme.spacing.md,
    },
    heroActions: {
      flexDirection: "row",
      marginTop: theme.spacing.sm,
    },
    metaPill: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: theme.colors.surface,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 8,
      borderRadius: theme.radius.pill,
      borderWidth: 1,
      borderColor: theme.colors.borderSoft,
    },
    metaText: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      fontWeight: "600",
    },
    headerRight: {
      flexDirection: "row",
      alignItems: "center",
    },
    title: {
      fontSize: 28,
      fontWeight: "700",
      color: theme.colors.textPrimary,
      letterSpacing: 0.3,
    },
    subtitle: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      marginTop: 2,
      lineHeight: 22,
      letterSpacing: 0.2,
    },
    summaryRow: {
      flexDirection: "row",
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.md,
    },
    summaryCard: {
      flex: 1,
      padding: theme.spacing.md,
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.borderSoft,
      shadowColor: theme.shadow.soft.shadowColor,
      shadowOpacity: theme.shadow.soft.shadowOpacity,
      shadowOffset: theme.shadow.soft.shadowOffset,
      shadowRadius: theme.shadow.soft.shadowRadius,
      elevation: theme.shadow.soft.elevation,
    },
    summaryLabel: {
      fontSize: 12,
      fontWeight: "600",
      color: theme.colors.textMuted,
      textTransform: "uppercase",
      letterSpacing: 0.6,
    },
    summaryValue: {
      fontSize: 18,
      fontWeight: "700",
      color: theme.colors.textPrimary,
      marginTop: 8,
    },
    summaryCaption: {
      fontSize: 13,
      color: theme.colors.textSecondary,
      marginTop: 4,
    },
    avatar: {
      width: 46,
      height: 46,
      borderRadius: 23,
      backgroundColor: theme.colors.surfaceAccent,
      alignItems: "center",
      justifyContent: "center",
      marginRight: theme.spacing.sm,
      borderWidth: 1,
      borderColor: theme.colors.borderStrong,
    },
    avatarText: {
      fontWeight: "700",
      color: theme.colors.textPrimary,
    },
    highlightCard: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: theme.spacing.sm,
      backgroundColor: theme.colors.surfaceElevated,
      padding: theme.spacing.md,
      borderRadius: theme.radius.lg,
      borderWidth: 1,
      borderColor: theme.colors.borderSoft,
      shadowColor: theme.shadow.soft.shadowColor,
      shadowOpacity: theme.shadow.soft.shadowOpacity,
      shadowOffset: theme.shadow.soft.shadowOffset,
      shadowRadius: theme.shadow.soft.shadowRadius,
      elevation: theme.shadow.soft.elevation,
      marginBottom: theme.spacing.md,
    },
    highlightIcon: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.surfaceAccent,
    },
    highlightTitle: {
      fontSize: 14,
      fontWeight: "700",
      color: theme.colors.textPrimary,
    },
    highlightText: {
      fontSize: 13,
      color: theme.colors.textSecondary,
      marginTop: 4,
      lineHeight: 18,
    },
    metaAction: {
      borderColor: theme.colors.accentMuted,
      backgroundColor: theme.colors.surfaceAccent,
    },
    metaActionText: {
      fontSize: 12,
      fontWeight: "700",
      color: theme.colors.accent,
    },
    announcementCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.sm,
      padding: theme.spacing.md,
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.surfaceElevated,
      borderWidth: 1,
      borderColor: theme.colors.borderSoft,
      marginBottom: theme.spacing.md,
    },
    announcementIcon: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: theme.colors.surfaceAccent,
      alignItems: "center",
      justifyContent: "center",
    },
    announcementCopy: {
      flex: 1,
    },
    announcementTitle: {
      fontSize: 14,
      fontWeight: "700",
      color: theme.colors.textPrimary,
    },
    announcementBody: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      marginTop: 4,
      lineHeight: 16,
    },
    announcementButton: {
      borderRadius: theme.radius.pill,
      borderWidth: 1,
      borderColor: theme.colors.accent,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 6,
      backgroundColor: theme.colors.surface,
    },
    announcementButtonText: {
      fontSize: 12,
      color: theme.colors.accent,
      fontWeight: "700",
    },
    careHub: {
      marginBottom: theme.spacing.md,
      gap: theme.spacing.sm,
    },
    careGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: theme.spacing.sm,
    },
    careCard: {
      flexBasis: "48%",
      backgroundColor: theme.colors.surfaceElevated,
      borderRadius: theme.radius.lg,
      padding: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.borderSoft,
    },
    careTitle: {
      fontSize: 13,
      fontWeight: "700",
      color: theme.colors.textPrimary,
      marginBottom: 4,
    },
    careBody: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      lineHeight: 16,
      marginBottom: theme.spacing.sm,
    },
    careCta: {
      fontSize: 12,
      color: theme.colors.accent,
      fontWeight: "600",
    },
    preferencesCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.lg,
      padding: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.borderSoft,
      gap: theme.spacing.sm,
    },
    preferencesTitle: {
      fontSize: 13,
      fontWeight: "700",
      color: theme.colors.textPrimary,
    },
    preferencesRow: {
      gap: 6,
    },
    preferencesName: {
      fontSize: 12,
      fontWeight: "600",
      color: theme.colors.textPrimary,
    },
    preferenceTags: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 6,
    },
    preferenceTag: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.surfaceAccent,
    },
    preferenceTagText: {
      fontSize: 11,
      color: theme.colors.textSecondary,
      fontWeight: "600",
    },
    preferencesEmpty: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      lineHeight: 16,
    },
    widgetHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: theme.spacing.sm,
      gap: theme.spacing.sm,
    },
    widgetCustomizeButton: {
      borderRadius: theme.radius.pill,
      borderWidth: 1,
      borderColor: theme.colors.borderStrong,
      paddingVertical: 6,
      paddingHorizontal: theme.spacing.sm,
      backgroundColor: theme.colors.surfaceElevated,
    },
    widgetCustomizeText: {
      fontSize: 12,
      fontWeight: "700",
      color: theme.colors.textPrimary,
      textTransform: "uppercase",
      letterSpacing: 0.6,
    },
    widgetGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.md,
    },
    widgetCard: {
      flexBasis: "48%",
      backgroundColor: theme.colors.surfaceElevated,
      borderRadius: theme.radius.lg,
      padding: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.borderSoft,
    },
    widgetIcon: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.surfaceAccent,
      marginBottom: theme.spacing.sm,
    },
    widgetTitle: {
      fontSize: 13,
      fontWeight: "700",
      color: theme.colors.textPrimary,
      marginBottom: 4,
    },
    widgetBody: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.sm,
    },
    widgetCta: {
      fontSize: 12,
      color: theme.colors.accent,
      fontWeight: "600",
    },
    widgetSettings: {
      backgroundColor: theme.colors.surfaceElevated,
      borderRadius: theme.radius.lg,
      padding: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.borderSoft,
      marginBottom: theme.spacing.md,
      gap: theme.spacing.sm,
    },
    widgetSettingsTitle: {
      fontSize: 14,
      fontWeight: "700",
      color: theme.colors.textPrimary,
      marginTop: theme.spacing.sm,
    },
    widgetSettingsHint: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.xs,
    },
    profileChips: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.sm,
    },
    profileChip: {
      paddingVertical: 6,
      paddingHorizontal: theme.spacing.sm,
      borderRadius: theme.radius.pill,
      borderWidth: 1,
      borderColor: theme.colors.borderStrong,
      backgroundColor: theme.colors.surface,
    },
    profileChipActive: {
      backgroundColor: theme.colors.accent,
      borderColor: theme.colors.accent,
    },
    profileChipText: {
      fontSize: 12,
      fontWeight: "600",
      color: theme.colors.textPrimary,
    },
    profileChipTextActive: {
      color: theme.colors.white,
    },
    widgetOptionsRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.sm,
    },
    widgetOption: {
      paddingVertical: 6,
      paddingHorizontal: theme.spacing.sm,
      borderRadius: theme.radius.pill,
      borderWidth: 1,
      borderColor: theme.colors.borderStrong,
      backgroundColor: theme.colors.surface,
    },
    widgetOptionActive: {
      backgroundColor: theme.colors.accent,
      borderColor: theme.colors.accent,
    },
    widgetOptionText: {
      fontSize: 12,
      color: theme.colors.textPrimary,
      fontWeight: "600",
    },
    widgetOptionTextActive: {
      color: theme.colors.white,
    },
    widgetSettingRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      gap: theme.spacing.sm,
    },
    widgetSettingCopy: {
      flex: 1,
    },
    widgetSettingTitle: {
      fontSize: 13,
      fontWeight: "600",
      color: theme.colors.textPrimary,
    },
    widgetSettingBody: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      marginTop: 2,
    },
    widgetSettingActions: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.xs,
    },
    widgetRemoveButton: {
      paddingVertical: 4,
      paddingHorizontal: theme.spacing.sm,
      borderRadius: theme.radius.pill,
      borderWidth: 1,
      borderColor: theme.colors.borderStrong,
      backgroundColor: theme.colors.surface,
    },
    widgetRemoveText: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      fontWeight: "600",
    },
    widgetInput: {
      borderWidth: 1,
      borderColor: theme.colors.borderStrong,
      borderRadius: theme.radius.md,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      fontSize: 13,
      backgroundColor: theme.colors.surface,
      color: theme.colors.textPrimary,
    },
    widgetAddButton: {
      borderRadius: theme.radius.pill,
      paddingVertical: theme.spacing.sm,
      alignItems: "center",
      backgroundColor: theme.colors.accent,
      marginTop: theme.spacing.xs,
    },
    widgetAddButtonText: {
      fontSize: 13,
      color: theme.colors.white,
      fontWeight: "700",
    },
    quickActions: {
      gap: 12,
      marginBottom: theme.spacing.sm,
    },
    quickCard: {
      backgroundColor: theme.colors.surfaceElevated,
      borderRadius: theme.radius.lg,
      padding: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.borderSoft,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: theme.spacing.sm,
    },
    quickIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.surfaceAccent,
    },
    quickCopy: {
      flex: 1,
    },
    cardPressed: {
      transform: [{ scale: 0.99 }],
      opacity: 0.96,
    },
    quickLabel: {
      fontSize: 15,
      color: theme.colors.textPrimary,
      fontWeight: "600",
    },
    quickSubtext: {
      fontSize: 13,
      color: theme.colors.textSecondary,
      marginTop: 4,
    },
    chevron: {
      fontSize: 24,
      color: theme.colors.textMuted,
    },
    sectionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "baseline",
      marginBottom: theme.spacing.sm,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: theme.colors.accentDeep,
    },
    sectionMeta: {
      fontSize: 12,
      color: theme.colors.textMuted,
      fontWeight: "600",
    },
    emptyCard: {
      backgroundColor: theme.colors.surfaceElevated,
      borderRadius: theme.radius.lg,
      padding: theme.spacing.md,
      borderWidth: 1,
      orderColor: theme.colors.border,
    },
    emptyText: {
      fontSize: 14,
      color: theme.colors.textSecondary,
    },
    card: {
      backgroundColor: theme.colors.surfaceElevated,
      borderRadius: theme.radius.xl,
      padding: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginBottom: theme.spacing.md,
    },
    nextBookingCard: {
      borderColor: theme.colors.accentDeep,
      borderWidth: 2,
      backgroundColor: theme.colors.surface,
    },
    cardJeroen: {
      borderColor: theme.colors.borderStrong,
    },
    cardJeroenActive: {
      borderWidth: 2,
      borderColor: theme.colors.accentDeep,
      shadowColor: theme.shadow.soft.shadowColor,
      shadowOpacity: theme.shadow.soft.shadowOpacity,
      shadowOffset: theme.shadow.soft.shadowOffset,
      shadowRadius: theme.shadow.soft.shadowRadius,
      elevation: theme.shadow.soft.elevation,
    },
    nextBookingBadge: {
      alignSelf: "flex-start",
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 4,
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.accentDeep,
      marginBottom: theme.spacing.sm,
    },
    nextBookingBadgeText: {
      fontSize: 11,
      fontWeight: "700",
      color: theme.colors.white,
      letterSpacing: 0.3,
    },
    cardRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: theme.spacing.sm,
    },
    cardTime: {
      fontSize: 16,
      color: theme.colors.textPrimary,
      fontWeight: "700",
    },
    cardTitle: {
      fontSize: 15,
      color: theme.colors.textSecondary,
      marginTop: 4,
      fontWeight: "600",
    },
    cardTitleRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.xs,
    },
    multiPetBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.surfaceAccent,
      borderWidth: 1,
      borderColor: theme.colors.borderSoft,
    },
    multiPetText: {
      fontSize: 11,
      fontWeight: "600",
      color: theme.colors.accent,
    },
    cardMeta: {
      fontSize: 14,
      color: theme.colors.textMuted,
      marginTop: 4,
    },
    statusBadge: {
      backgroundColor: theme.colors.accentDeep,
      borderRadius: 999,
      paddingHorizontal: 12,
      paddingVertical: 6,
    },
    statusBadgeText: {
      color: theme.colors.white,
      fontWeight: "600",
      fontSize: 12,
    },
    statusTimeline: {
      flexDirection: "row",
      alignItems: "flex-start",
      marginTop: theme.spacing.xs,
      marginBottom: theme.spacing.sm,
    },
    statusStep: {
      flex: 1,
      alignItems: "center",
    },
    statusIndicator: {
      flexDirection: "row",
      alignItems: "center",
      width: "100%",
    },
    statusDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: theme.colors.border,
    },
    statusDotActive: {
      backgroundColor: theme.colors.accent,
    },
    statusLine: {
      flex: 1,
      height: 2,
      backgroundColor: theme.colors.border,
      marginHorizontal: 4,
    },
    statusLineActive: {
      backgroundColor: theme.colors.accent,
    },
    statusLabel: {
      marginTop: theme.spacing.xs,
      fontSize: theme.typography.caption.fontSize,
      color: theme.colors.textMuted,
      textAlign: "center",
    },
    statusLabelActive: {
      color: theme.colors.textPrimary,
      fontWeight: "600",
    },
    cardFooter: {
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      paddingTop: theme.spacing.sm,
      marginTop: 4,
    },
    cardTimerText: {
      fontSize: 16,
      fontWeight: "700",
      color: theme.colors.accent,
      marginBottom: theme.spacing.sm,
    },
    cardButton: {
      borderRadius: 999,
      borderWidth: 1,
      borderColor: theme.colors.borderStrong,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.surfaceElevated,
      marginBottom: theme.spacing.sm,
    },
    cardButtonActive: {
      backgroundColor: theme.colors.accent,
      borderColor: theme.colors.accent,
    },
    cardButtonText: {
      fontSize: 14,
      fontWeight: "700",
      color: theme.colors.textPrimary,
      textAlign: "center",
    },
    cardButtonTextActive: {
      color: theme.colors.white,
    },
  });

export default HomeScreen;
