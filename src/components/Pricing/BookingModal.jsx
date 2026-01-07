import React, {
  useState,
  useMemo,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { cancellationPolicy, weekdayLabels, DOG_BREEDS } from "./constants";
import {
  buildMonthMatrix,
  createEmptyDogProfile,
  generateDemoAvailability,
} from "./utils";
import { useAuth } from "../../context/AuthContext";
import {
  computeApiBaseUrl,
  getCachedAvailability,
  prefetchAvailability,
} from "./availabilityCache";
import ChatOrFormModal from "./ChatOrFormModal";
import CalendarSection from "./components/CalendarSection";
import TimesSection from "./components/TimesSection";
import BookingForm from "./components/BookingForm";

const BUSINESS_TIME_ZONE = "Europe/Dublin";
const HOME_EIRCODE = "A98H940";
const HOME_COORDS = { lat: 53.204, lng: -6.111 }; // Bray (home)
const NOMINATIM_ENDPOINT = "https://nominatim.openstreetmap.org/search";
const ROUTING_COORDS = {
  // Approximate centroids for common routing keys so we can estimate travel when
  // an online lookup fails. These are fallbacks and should be avoided when the
  // full Eircode can be resolved through OpenStreetMap.
  A98: HOME_COORDS,
  A96: { lat: 53.293, lng: -6.129 }, // Dun Laoghaire
  A94: { lat: 53.306, lng: -6.211 }, // Blackrock
  D01: { lat: 53.352, lng: -6.262 }, // Dublin 1
  D02: { lat: 53.338, lng: -6.247 },
  D04: { lat: 53.321, lng: -6.228 },
  D06: { lat: 53.312, lng: -6.260 },
  D08: { lat: 53.337, lng: -6.278 },
  D09: { lat: 53.379, lng: -6.238 },
  D15: { lat: 53.385, lng: -6.398 },
  D18: { lat: 53.262, lng: -6.149 },
  K36: { lat: 53.449, lng: -6.226 }, // Swords
  K78: { lat: 53.347, lng: -6.446 }, // Lucan
  W23: { lat: 53.351, lng: -6.538 },
  W91: { lat: 53.179, lng: -6.667 },
};

const BookingModal = ({ service, onClose }) => {
  const MAX_DOGS = 4;
  const { profile, isAuthenticated, setProfile } = useAuth();
  const [customerMode, setCustomerMode] = useState(() =>
    profile ? "login" : "null"
  );
  const [loginEmail, setLoginEmail] = useState(profile?.client?.email || "");
  const [loginPassword, setLoginPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const is24h = true;
  const [availability, setAvailability] = useState({
    dates: [],
    timeZone: BUSINESS_TIME_ZONE,
  });
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [clientEircode, setClientEircode] = useState("");
  const [pendingProfileEircode, setPendingProfileEircode] = useState("");
  const [eircodeChoiceOpen, setEircodeChoiceOpen] = useState(false);
  const [clientEmail, setClientEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [isBooking, setIsBooking] = useState(false);
  const [isLoadingPets, setIsLoadingPets] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(() => new Date());
  const [availabilityNotice, setAvailabilityNotice] = useState("");
  const [dogCount, setDogCount] = useState(1);
  const [dogs, setDogs] = useState([createEmptyDogProfile()]);
  const [breedSearch, setBreedSearch] = useState({});
  const [existingPets, setExistingPets] = useState([]);
  const [selectedPetIds, setSelectedPetIds] = useState([]);
  const [hasAttemptedPetLoad, setHasAttemptedPetLoad] = useState(false);
  const [showDogDetails, setShowDogDetails] = useState(true);
  const [selectedSlots, setSelectedSlots] = useState({});
  const [isMultiDay, setIsMultiDay] = useState(false);
  const [recurrence, setRecurrence] = useState("none");
  const [additionals, setAdditionals] = useState([]);
  const [additionalsOpen, setAdditionalsOpen] = useState(false);
  const [addons, setAddons] = useState([]);
  const [supportOpen, setSupportOpen] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [showLoginReset, setShowLoginReset] = useState(false);
  const [loginResetStatus, setLoginResetStatus] = useState({
    state: "idle",
    message: "",
  });
  const [travelAnchor, setTravelAnchor] = useState("home");
  const [homeCoordinates, setHomeCoordinates] = useState(HOME_COORDS);
  const [previousBookingTime, setPreviousBookingTime] = useState("");
  const [clientCoordinates, setClientCoordinates] = useState(null);
  const [travelMinutes, setTravelMinutes] = useState(0);
  const [travelNote, setTravelNote] = useState("");
  const [travelValidationState, setTravelValidationState] = useState("pending");
  const isTravelValidationPending = travelValidationState === "pending";
  const [paymentPreference, setPaymentPreference] = useState("pay_now");
  const customerDetailsRef = useRef(null);
  const addOnDropdownRef = useRef(null);
  const addonsSectionRef = useRef(null);
  const bookingModalRef = useRef(null);
  const calendarSectionRef = useRef(null);
  const travelSectionRef = useRef(null);
  const timesSectionRef = useRef(null);
  const summarySectionRef = useRef(null);
  const [currentStep, setCurrentStep] = useState("calendar");
  const parsePriceValue = useCallback((value) => {
    if (value === null || value === undefined) return 0;
    if (typeof value === "number") return value;

    const normalized = String(value).replace(/,/g, ".");
    const numeric = Number(normalized.replace(/[^0-9.]/g, ""));
    return Number.isFinite(numeric) ? numeric : 0;
  }, []);

  const normalizeEircode = useCallback((value) => {
    return (value || "").replace(/\s+/g, "").toUpperCase();
  }, []);

  const isFullEircode = useCallback(
    (value) => /^[A-Z0-9]{3}[A-Z0-9]{4}$/.test(normalizeEircode(value)),
    [normalizeEircode]
  );

  const getRoutingKey = useCallback(
    (eircodeValue) => normalizeEircode(eircodeValue).slice(0, 3),
    [normalizeEircode]
  );

  const geocodeEircode = useCallback(async (eircodeValue, signal) => {
    const query = normalizeEircode(eircodeValue);
    if (!query || !isFullEircode(query)) return null;

    const url = `${NOMINATIM_ENDPOINT}?format=jsonv2&limit=1&countrycodes=ie&q=${encodeURIComponent(
      query
    )}`;

    const response = await fetch(url, {
      headers: {
        "User-Agent": "JeroenandPaws-booking/1.0 (+https://jeroenandpaws.com)",
      },
      signal,
    });

    if (!response.ok) {
      throw new Error(`Nominatim error ${response.status}`);
    }

    const results = await response.json();
    if (!Array.isArray(results) || results.length === 0) return null;

    const best = results[0];
    const lat = Number(best.lat);
    const lng = Number(best.lon);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

    return { lat, lng };
  }, [isFullEircode, normalizeEircode]);

  const haversineKm = (coordA, coordB) => {
    const toRadians = (deg) => (deg * Math.PI) / 180;
    const R = 6371; // km
    const dLat = toRadians(coordB.lat - coordA.lat);
    const dLon = toRadians(coordB.lng - coordA.lng);
    const lat1 = toRadians(coordA.lat);
    const lat2 = toRadians(coordB.lat);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const estimateTravelMinutes = useCallback(
    (from, to) => {
      const anchor =
        to || {
          eircode: HOME_EIRCODE,
          coords: homeCoordinates,
        };

      if (from?.coords && anchor?.coords) {
        const distanceKm = haversineKm(from.coords, anchor.coords);
        const minutes = Math.round((distanceKm / 50) * 60 + 10); // assume 50km/h + buffer
        return Math.min(Math.max(minutes, 12), 120);
      }

      const routingKey = getRoutingKey(from?.eircode);
      const anchorKey = getRoutingKey(anchor?.eircode);

      if (!routingKey || !anchorKey) return 0;

      const fromCoord = ROUTING_COORDS[routingKey];
      const anchorCoord = ROUTING_COORDS[anchorKey];

      if (fromCoord && anchorCoord) {
        const distanceKm = haversineKm(fromCoord, anchorCoord);
        const minutes = Math.round((distanceKm / 50) * 60 + 10);
        return Math.min(Math.max(minutes, 12), 120);
      }

      if (routingKey === anchorKey) return 15;
      return 45;
    },
    [getRoutingKey, homeCoordinates]
  );

  const parseTimeToMinutes = useCallback((time) => {
    if (!time) return 0;
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + (minutes || 0);
  }, []);

  const formatCurrency = useCallback((value) => {
    const numeric = Number.isFinite(value) ? value : 0;
    return `€${numeric.toFixed(2)}`;
  }, []);

  const allowMultiDay = service?.allowMultiDay !== false;
  const allowRecurring = service?.allowRecurring !== false;
  const serviceLabel = (service?.label || service?.title || "").toLowerCase();
  const isBoardingService = serviceLabel.includes("boarding");
  const allowWeeklyRecurring = allowRecurring && !isBoardingService;
  const serviceDuration = useMemo(
    () => (Number.isFinite(service.durationMinutes) ? service.durationMinutes : 60),
    [service.durationMinutes]
  );
  const calendarDays = useMemo(() => availability.dates || [], [availability]);
  const availabilityMap = useMemo(() => {
    return calendarDays.reduce((acc, day) => {
      acc[day.date] = day;
      return acc;
    }, {});
  }, [calendarDays]);
  const busyByDate = useMemo(() => {
    return (availability.busy || []).reduce((acc, interval) => {
      const start = interval?.start ? new Date(interval.start) : null;
      const end = interval?.end ? new Date(interval.end) : null;

      if (!start || !end || Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
        return acc;
      }

      const dateKey = start.toISOString().slice(0, 10);
      const startMinutes = start.getUTCHours() * 60 + start.getUTCMinutes();
      const endMinutes = end.getUTCHours() * 60 + end.getUTCMinutes();

      acc[dateKey] = acc[dateKey] || [];
      acc[dateKey].push({ startMinutes, endMinutes });
      return acc;
    }, {});
  }, [availability.busy]);
  const normalizeAvailability = useCallback(
    (data = {}) => ({
      ...data,
      dates: data?.dates || [],
      timeZone: BUSINESS_TIME_ZONE,
      busy: data?.busy || [],
    }),
    []
  );

  useEffect(() => {
    const controller = new AbortController();

    const loadHomeCoordinates = async () => {
      try {
        const coords = await geocodeEircode(HOME_EIRCODE, controller.signal);
        if (coords) {
          setHomeCoordinates(coords);
        }
      } catch (homeLookupError) {
        console.warn("Home Eircode lookup failed, using fallback coords", {
          error: homeLookupError,
        });
      }
    };

    loadHomeCoordinates();

    return () => controller.abort();
  }, [geocodeEircode]);

  const hasAtLeastOneDog = useMemo(() => {
    if (selectedPetIds.length > 0) return true;

    const dogsToCheck = dogs.slice(0, dogCount);
    return dogsToCheck.some((dog) => {
      if (!dog) return false;
      const name = (dog.name || "").trim();
      const breed = (dog.breed || "").trim();
      const notes = (dog.notes || "").trim();

      return Boolean(
        name || breed || notes || dog.photoDataUrl || dog.profileId
      );
    });
  }, [dogCount, dogs, selectedPetIds]);

  const trimmedName = clientName.trim();
  const trimmedEmail = clientEmail.trim();
  const canLoadPets = Boolean(trimmedName && trimmedEmail);

  const stepOrder = [
    "calendar",
    "travel",
    "time",
    "customer",
    "pet",
    "addons",
    "summary",
  ];
  const stepLabels = {
    calendar: "Calendar",
    travel: "Eircode",
    time: "Choose time",
    customer: "Customer",
    pet: "Pets",
    addons: "Additional care",
    summary: "Summary",
  };

  const apiBaseUrl = useMemo(() => computeApiBaseUrl(), []);

  const isSlotReachable = useCallback(
    (slot, slotDate) => {
      if (!slot || !slot.available) return false;

      const startMinutes = parseTimeToMinutes(slot.time);

      const baseMinutes =
        travelAnchor === "previous" && previousBookingTime
          ? parseTimeToMinutes(previousBookingTime)
          : 8 * 60;

      if (startMinutes < baseMinutes + travelMinutes) return false;

      const serviceStart = startMinutes;
      const serviceEnd = startMinutes + serviceDuration;

      if (!slotDate || !busyByDate[slotDate]) return true;

      const conflictsWithBufferedEvent = busyByDate[slotDate].some(
        ({ startMinutes: eventStart, endMinutes: eventEnd }) => {
          const bufferedStart = eventStart - travelMinutes;
          const bufferedEnd = eventEnd + travelMinutes;
          return serviceEnd > bufferedStart && serviceStart < bufferedEnd;
        }
      );

      return !conflictsWithBufferedEvent;
    },
    [
      busyByDate,
      parseTimeToMinutes,
      previousBookingTime,
      serviceDuration,
      travelAnchor,
      travelMinutes,
    ]
  );

  const isDayAvailableForService = useCallback(
    (day) => {
      if (!day || !Array.isArray(day.slots) || day.slots.length === 0) {
        return false;
      }

      return day.slots.some((slot) => isSlotReachable(slot, day.date));
    },
    [isSlotReachable]
  );

  const addAnotherDog = () => {
    setShowDogDetails(true);
    setDogCount((prevCount) => {
      const nextCount = Math.min(MAX_DOGS, prevCount + 1);
      if (nextCount === prevCount) return prevCount;

      setDogs((prevDogs) => {
        const newDogs = [...prevDogs];
        while (newDogs.length < nextCount) {
          newDogs.push(createEmptyDogProfile());
        }
        return newDogs;
      });

      return nextCount;
    });
  };

  const updateDogField = (index, field, value) => {
    setDogs((prevDogs) => {
      const newDogs = [...prevDogs];
      newDogs[index] = { ...newDogs[index], [field]: value };
      return newDogs;
    });
  };

  const removeDog = (index) => {
    setSelectedPetIds((prev) => {
      const profileId = dogs[index]?.profileId;
      if (!profileId) return prev;
      return prev.filter((id) => id !== profileId);
    });

    setDogs((prevDogs) => {
      const updatedDogs = prevDogs.filter((_, dogIndex) => dogIndex !== index);
      const nextDogs = updatedDogs.length > 0 ? updatedDogs : [];
      setDogCount(nextDogs.length);
      return nextDogs;
    });
  };

  const handleDogPhotoChange = (index, file) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      updateDogField(index, "photoDataUrl", reader.result);
      updateDogField(index, "photoName", file.name);
    };
    reader.readAsDataURL(file);
  };

  const resetDogProfiles = () => {
    setDogs(Array.from({ length: dogCount }, () => createEmptyDogProfile()));
    setBreedSearch({});
  };

  const parseJsonSafely = useCallback(async (response, requestUrl) => {
    const contentType = response.headers.get("content-type") || "";
    const text = await response.text();
    const trimmed = text.trim();

    if (!response.ok) {
      const fallbackMessage = `Unable to load availability (${response.status})`;
      const message =
        trimmed && !trimmed.startsWith("<") ? trimmed : fallbackMessage;
      throw new Error(message);
    }

    const looksLikeJson =
      contentType.includes("application/json") ||
      trimmed.startsWith("{") ||
      trimmed.startsWith("[") ||
      trimmed === "";

    if (!looksLikeJson) {
      throw new Error(
        `Received an unexpected response while loading availability. Please try again or use the contact form (source: ${requestUrl}).`
      );
    }

    try {
      return trimmed ? JSON.parse(trimmed) : {};
    } catch (parseError) {
      throw new Error(
        "Availability response could not be read. Please refresh and try again."
      );
    }
  }, []);

  const setInitialVisibleMonth = useCallback((data) => {
    const firstOpenDate = data.dates.find((day) => {
      if (!day || !Array.isArray(day.slots) || day.slots.length === 0) {
        return false;
      }
    
      return day.slots.some((slot) => slot.available);
    });

    if (firstOpenDate) {
      setVisibleMonth(new Date(firstOpenDate.date));
    }
  }, []);

  const handleMonthChange = useCallback((offset) => {
    setVisibleMonth((prev) => {
      const next = new Date(prev);
      next.setDate(1);
      next.setMonth(prev.getMonth() + offset);
      return next;
    });
  }, []);

  const handleNextMonth = useCallback(() => handleMonthChange(1), [handleMonthChange]);
  const handlePreviousMonth = useCallback(
    () => handleMonthChange(-1),
    [handleMonthChange]
  );

  const loadAvailability = useCallback(async () => {
    setLoading(true);
    setError("");
    setSuccess("");
    setAvailabilityNotice("");
    setSelectedSlots({});
    setSelectedDate("");
    setSelectedTime("");
    setIsMultiDay(false);
    setRecurrence("none");
    try {
      const cached = getCachedAvailability(service.id);
      if (cached) {
        const normalized = normalizeAvailability(cached);
        setAvailability(normalized);
        setInitialVisibleMonth(normalized);
        return;
      }

      const data = await prefetchAvailability(service, apiBaseUrl);
      const normalized = normalizeAvailability(data);
      setAvailability(normalized);
      setInitialVisibleMonth(normalized);
    } catch (error) {
      console.error("Unable to load live availability", error);
      const fallback = normalizeAvailability(
        generateDemoAvailability(service.durationMinutes)
      );
      setAvailability(fallback);
      setInitialVisibleMonth(fallback);
      setAvailabilityNotice(
        "Live calendar is unreachable — displaying demo slots so you can keep booking."
      );
    } finally {
      setLoading(false);
    }
  }, [
    apiBaseUrl,
    normalizeAvailability,
    setInitialVisibleMonth,
    service.durationMinutes,
    service.id,
  ]);
  useEffect(() => {
    loadAvailability();
  }, [loadAvailability]);

  useEffect(() => {
    let isCancelled = false;
    const controller = new AbortController();

    const normalized = normalizeEircode(clientEircode);
    if (!normalized) {
      setClientCoordinates(null);
      setTravelMinutes(0);
      setTravelNote("Enter your full Eircode to calculate travel time.");
      setTravelValidationState("pending");
      return () => controller.abort();
    }

    const hasFullClientEircode = isFullEircode(normalized);

    const anchorEircode =
      travelAnchor === "home"
        ? HOME_EIRCODE
        : normalizeEircode(clientAddress) || HOME_EIRCODE;

    if (!hasFullClientEircode) {
      const minutes = estimateTravelMinutes(
        { eircode: normalized, coords: null },
        { eircode: anchorEircode, coords: null }
      );

      setClientCoordinates(null);
      setTravelMinutes(minutes);
      setTravelNote(
        "Please enter your full 7-character Eircode so we can geocode your exact location. We're using the routing key as a fallback for now."
      );
      setTravelValidationState("approximate");
      return () => controller.abort();
    }

    const loadCoordinatesAndEstimate = async () => {
      try {
        setTravelNote("Looking up your Eircode with OpenStreetMap (Nominatim)...");

        const [fromCoords, anchorCoords] = await Promise.all([
          geocodeEircode(normalized, controller.signal),
          travelAnchor === "home"
            ? Promise.resolve(homeCoordinates)
            : geocodeEircode(anchorEircode, controller.signal),
        ]);

        if (isCancelled) return;

        const resolvedAnchorCoords =
          anchorCoords || (travelAnchor === "home" ? homeCoordinates : null);

        setClientCoordinates(fromCoords);
        setClientAddress(normalized);

        const minutes = estimateTravelMinutes(
          { eircode: normalized, coords: fromCoords },
          { eircode: anchorEircode, coords: resolvedAnchorCoords }
        );
        setTravelMinutes(minutes);
        setTravelValidationState("ready");

        if (travelAnchor === "previous" && !previousBookingTime) {
          setTravelNote(
            "Share the end time of your earlier booking so we can hide impossible slots."
          );
          return;
        }

        const anchorLabel =
          travelAnchor === "previous" && previousBookingTime
            ? `after your earlier booking at ${previousBookingTime}`
            : `from home base (${HOME_EIRCODE})`;

        const geocodeDescriptor = fromCoords
          ? "using your exact Eircode location"
          : "using your routing key as a fallback";
        const anchorDescriptor =
          travelAnchor === "home"
            ? resolvedAnchorCoords
              ? "and our exact A98H940 address"
              : "and our base routing key"
            : resolvedAnchorCoords
            ? "and your previous booking location"
            : "and your previous booking routing key";

        setTravelNote(
          `We estimate about ${minutes} minutes of travel ${anchorLabel} ${geocodeDescriptor} ${anchorDescriptor}, then hide times that don't fit.`
        );
      } catch (lookupError) {
        if (isCancelled) return;

        setClientCoordinates(null);
        const minutes = estimateTravelMinutes(
          { eircode: normalized, coords: null },
          {
            eircode: anchorEircode,
            coords: travelAnchor === "home" ? homeCoordinates : null,
          }
        );

        setTravelMinutes(minutes);
        setTravelValidationState("approximate");
        setTravelNote(
          "We couldn't confirm the exact location from your full Eircode via OpenStreetMap, so we're falling back to routing keys."
        );
      }
    };

    loadCoordinatesAndEstimate();

    return () => {
      isCancelled = true;
      controller.abort();
    };
  }, [
    clientAddress,
    clientEircode,
    estimateTravelMinutes,
    geocodeEircode,
    homeCoordinates,
    isFullEircode,
    normalizeEircode,
    previousBookingTime,
    travelAnchor,
  ]);

  useEffect(() => {
    setExistingPets([]);
    setSelectedPetIds([]);
    setHasAttemptedPetLoad(false);
    setShowDogDetails(true);
  }, [clientEmail]);

  const applyProfileDetails = useCallback(() => {
    const client = profile?.client;
    if (!client) return;

    const phoneNumber = client.phone_number || client.phone || "";
    const normalizedAddress = normalizeEircode(client.address || "");
    const existingEircode = normalizeEircode(clientEircode);
    const shouldPromptEircodeChoice =
      Boolean(existingEircode) &&
      Boolean(normalizedAddress) &&
      existingEircode !== normalizedAddress;

    setClientName(client.full_name || "");
    setClientPhone(phoneNumber || "");
    setClientEmail(client.email || "");
    setLoginEmail(client.email || "");
    
    if (shouldPromptEircodeChoice) {
      setPendingProfileEircode(normalizedAddress);
      setEircodeChoiceOpen(true);
      return;
    }

    setPendingProfileEircode("");
    setEircodeChoiceOpen(false);
    setClientAddress(normalizedAddress || client.address || "");

    if (normalizedAddress) {
      setClientEircode(normalizedAddress);
    }
  }, [clientEircode, normalizeEircode, profile]);

  const handleUseSavedEircode = useCallback(() => {
    if (!pendingProfileEircode) return;
    setClientEircode(pendingProfileEircode);
    setClientAddress(pendingProfileEircode);
    setPendingProfileEircode("");
    setEircodeChoiceOpen(false);
  }, [pendingProfileEircode]);

  const handleKeepEnteredEircode = useCallback(() => {
    setPendingProfileEircode("");
    setEircodeChoiceOpen(false);
  }, []);

  useEffect(() => {
    if (!profile) return;
    setCustomerMode("login");
    applyProfileDetails();
  }, [applyProfileDetails, profile]);

  const handleCustomerModeChange = (mode) => {
    setCustomerMode(mode);
    setAuthError("");
    setLoginAttempts(0);
    setShowLoginReset(false);
    setLoginResetStatus({ state: "idle", message: "" });
    if (mode === "login") {
      setLoginPassword("");
      if (profile?.client) {
        applyProfileDetails();
      }
      return;
    }

    setLoginPassword("");
    if (!profile?.client) {
      setClientName("");
      setClientPhone("");
      setClientEmail("");
      setClientAddress(normalizeEircode(clientEircode) || "");
    }
  };

  const handleSupabaseLogin = async (event) => {
    event?.preventDefault?.();

    const email = loginEmail.trim();
    const password = loginPassword.trim();

    if (!email || !password) {
      setAuthError("Please enter your email and password to log in.");
      return;
    }

    setAuthLoading(true);
    setAuthError("");
    try {
      const response = await fetch("/api/client-auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(payload?.message || "Unable to log in.");
      }

      setProfile(payload);
      setCustomerMode("login");
      setClientEmail(payload?.client?.email || email);
      setClientName(payload?.client?.full_name || "");
      setClientPhone(payload?.client?.phone_number || "");
      const preferredAddress =
        normalizeEircode(clientEircode) ||
        normalizeEircode(payload?.client?.address || "") ||
        payload?.client?.address ||
        "";

      setClientAddress(preferredAddress);
      if (preferredAddress) {
        setClientEircode(normalizeEircode(preferredAddress));
      }
      setLoginPassword("");
      setLoginAttempts(0);
      setShowLoginReset(false);
      setLoginResetStatus({ state: "idle", message: "" });
    } catch (loginError) {
      console.error("Client login failed", loginError);
      setAuthError(loginError.message || "Incorrect email or password.");
      setLoginAttempts((previous) => {
        const next = previous + 1;
        if (next >= 3) {
          setShowLoginReset(true);
        }
        return next;
      });
    } finally {
      setAuthLoading(false);
    }
  };

  const sendLoginResetRequest = async () => {
    const email = loginEmail.trim();

    if (!email) {
      setLoginResetStatus({ state: "error", message: "Enter your email to get a reset link." });
      return;
    }

    setLoginResetStatus({ state: "loading", message: "" });
    try {
      const response = await fetch("/api/password-reset-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(payload?.message || "Could not send reset instructions.");
      }

      setLoginResetStatus({
        state: "success",
        message: "Check your email for a link to set a new password.",
      });
    } catch (resetError) {
      setLoginResetStatus({
        state: "error",
        message: resetError.message || "Unable to send reset instructions right now.",
      });
    }
  };

  const fetchExistingPets = useCallback(async () => {
    if (!clientEmail) {
      setExistingPets([]);
      setSelectedPetIds([]);
      setHasAttemptedPetLoad(false);
      return;
    }

    setIsLoadingPets(true);
    setHasAttemptedPetLoad(false);
    try {
      const requestUrl = `${apiBaseUrl}/api/pets?ownerEmail=${encodeURIComponent(
        clientEmail
      )}`;
      const response = await fetch(requestUrl, {
        headers: { Accept: "application/json" },
      });

      if (!response.ok) {
        throw new Error("Could not load pets for this email");
      }

      const data = await parseJsonSafely(response, requestUrl);
      setExistingPets(Array.isArray(data?.pets) ? data.pets : []);
      setSelectedPetIds([]);
      const hasPets = Array.isArray(data?.pets) && data.pets.length > 0;

      if (!hasPets) {
        setDogCount(1);
        resetDogProfiles();
        setShowDogDetails(true);
      } else {
        setShowDogDetails(false);
      }
    } catch (loadError) {
      console.error("Failed to load pets", loadError);
      setExistingPets([]);
      setSelectedPetIds([]);
    } finally {
      setIsLoadingPets(false);
      setHasAttemptedPetLoad(true);
    }
  }, [apiBaseUrl, clientEmail, parseJsonSafely]);

  useEffect(() => {
    const selectedPets = existingPets.filter((pet) =>
      selectedPetIds.includes(pet.id)
    );

    if (selectedPets.length === 0) {
      if (existingPets.length === 0 && hasAttemptedPetLoad) {
        setShowDogDetails(true);
      }
      return;
    }

    const desiredCount = Math.min(
      MAX_DOGS,
      Math.max(dogCount, selectedPets.length)
    );

    if (desiredCount !== dogCount) {
      setDogCount(desiredCount);
    }

    setDogs((prevDogs) => {
      const newDogs = [...prevDogs];
      while (newDogs.length < desiredCount) {
        newDogs.push(createEmptyDogProfile());
      }

      selectedPets.forEach((pet, index) => {
        newDogs[index] = {
          ...newDogs[index],
          name: pet.name || "",
          breed: pet.breed || "",
          notes: pet.notes || "",
          profileId: pet.id,
        };
      });

      for (let i = selectedPets.length; i < newDogs.length; i += 1) {
        if (
          newDogs[i]?.profileId &&
          !selectedPetIds.includes(newDogs[i].profileId)
        ) {
          newDogs[i] = createEmptyDogProfile();
        }
      }

      return newDogs.slice(0, desiredCount);
    });

    setShowDogDetails(selectedPets.length === 0);
  }, [dogCount, existingPets, hasAttemptedPetLoad, selectedPetIds]);

  useEffect(() => {
    if (!isAuthenticated || !canLoadPets || hasAttemptedPetLoad) return;

    fetchExistingPets();
  }, [canLoadPets, fetchExistingPets, hasAttemptedPetLoad, isAuthenticated]);

  const preparePetPayload = () => {
    const normalizedDogs = dogs.slice(0, dogCount).map((dog) => {
      const name = (dog?.name || "").trim();
      const breed = (dog?.breed || "").trim();
      const notes = (dog?.notes || "").trim();
      const photo = dog?.photoDataUrl;
      const photoName = dog?.photoName;
      const profileId = dog?.profileId;

      const hasDetails = Boolean(name || breed || notes || photo || profileId);
      if (!hasDetails) return null;

      return {
        id: profileId || undefined,
        name,
        breed,
        notes,
        photoDataUrl: photo,
        photoName,
      };
    });

    return normalizedDogs.filter(Boolean);
  };

  const monthMatrix = useMemo(
    () => buildMonthMatrix(visibleMonth),
    [visibleMonth]
  );

  const formatTime = (slot) => {
    if (is24h) return slot;
    const [hourStr, minutes] = slot.split(":");
    const hour = Number(hourStr);
    const suffix = hour >= 12 ? "PM" : "AM";
    const adjustedHour = hour % 12 === 0 ? 12 : hour % 12;
    return `${adjustedHour}:${minutes} ${suffix}`;
  };

  const scheduleEntries = useMemo(() => {
    return Object.entries(selectedSlots || {})
      .map(([date, time]) => ({ date, time }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [selectedSlots]);

  const selectedAdditionalLabels = useMemo(() => {
    if (!additionals.length) return addons.slice(0, 3).map((a) => a.label);

    return additionals
      .map((value) => addons.find((a) => a.value === value)?.label || value)
      .slice(0, 3);
  }, [additionals, addons]);

  const selectedAddonObjects = useMemo(() => {
    return additionals
      .map((value) => addons.find((addon) => addon.value === value))
      .filter(Boolean);
  }, [additionals, addons]);

  const pricing = useMemo(() => {
    const servicePrice = parsePriceValue(service.price ?? service.cost ?? "0");
    const addonTotal = selectedAddonObjects.reduce(
      (sum, addon) => sum + parsePriceValue(addon.price),
      0
    );

    const activeDogsCount = dogs
      .slice(0, dogCount)
      .map((dog) => {
        const name = (dog?.name || "").trim();
        const breed = (dog?.breed || "").trim();
        const notes = (dog?.notes || "").trim();
        const profileId = dog?.profileId;
        return name || breed || notes || profileId ? dog : null;
      })
      .filter(Boolean).length;

    const visitsWithTime = scheduleEntries.filter(
      (entry) => entry.date && entry.time
    ).length;

    const visitCount = visitsWithTime || 0;
    const perDogPerVisit = servicePrice;
    const secondDogPrice = 10;
    const secondDogDiscount =
      activeDogsCount >= 2 ? Math.max(perDogPerVisit - secondDogPrice, 0) : 0;

    let perVisitTotal = 0;
    if (activeDogsCount >= 1) perVisitTotal += perDogPerVisit;
    if (activeDogsCount >= 2) perVisitTotal += secondDogPrice;
    if (activeDogsCount > 2)
      perVisitTotal += perDogPerVisit * (activeDogsCount - 2);

    const baseTotal = visitCount ? perVisitTotal * visitCount : 0;
    const totalPrice = baseTotal + addonTotal;

    const descriptionParts = [service.title];

    if (activeDogsCount) {
      descriptionParts.push(
        `${activeDogsCount} dog${activeDogsCount > 1 ? "s" : ""}`
      );
    }

    if (visitCount) {
      descriptionParts.push(`${visitCount} visit${visitCount > 1 ? "s" : ""}`);
    }

    if (selectedAddonObjects.length) {
      const addonNames = selectedAddonObjects
        .map((addon) => addon.label || addon.value)
        .join(", ");
      descriptionParts.push(`Add-ons: ${addonNames}`);
    }

    return {
      servicePrice,
      addonTotal,
      perDogPerVisit,
      dogCount: activeDogsCount,
      visitCount,
      totalPrice,
      description: descriptionParts.join(" · "),
      selectedAddons: selectedAddonObjects,
      secondDogDiscount,
      secondDogPrice,
      perVisitTotal,
    };
  }, [
    dogCount,
    dogs,
    parsePriceValue,
    scheduleEntries,
    selectedAddonObjects,
    service.cost,
    service.price,
    service.title,
  ]);

  useEffect(() => {
    if (!selectedDate) return;

    if (!(selectedDate in selectedSlots)) {
      const nextDate = scheduleEntries[0]?.date || "";
      setSelectedDate(nextDate);
      setSelectedTime(nextDate ? selectedSlots[nextDate] || "" : "");
      return;
    }

    const savedTime = selectedSlots[selectedDate] || "";
    if (savedTime !== selectedTime) {
      setSelectedTime(savedTime || "");
    }
  }, [selectedDate, selectedSlots, selectedTime, scheduleEntries]);

  useEffect(() => {
    if (isMultiDay || scheduleEntries.length <= 1) return;

    const primary = scheduleEntries[0];
    if (!primary?.date) return;

    setSelectedSlots({ [primary.date]: primary.time || "" });
    setSelectedDate(primary.date);
    setSelectedTime(primary.time || "");
  }, [isMultiDay, scheduleEntries]);

  useEffect(() => {
    if (!allowMultiDay || !allowWeeklyRecurring) {
      setIsMultiDay(false);
    }
  }, [allowMultiDay, allowWeeklyRecurring]);

  useEffect(() => {
    if (isMultiDay && recurrence !== "weekly") {
      setRecurrence("weekly");
    }
  }, [isMultiDay, recurrence]);

  useEffect(() => {
    if (!allowWeeklyRecurring && recurrence !== "none") {
      setRecurrence("none");
    }
  }, [allowWeeklyRecurring, recurrence]);

  const getDefaultSlotForDate = useCallback(
    (iso) => {
      const day = availabilityMap[iso];
      if (!day || !Array.isArray(day.slots)) return "";

      const firstAvailable = day.slots.find((slot) =>
        isSlotReachable(slot, day.date)
      );
      return firstAvailable?.time || "";
    },
    [availabilityMap, isSlotReachable]
  );

  const handleDaySelection = (iso) => {
    const existingTime = selectedSlots[iso];
    if (isMultiDay && existingTime) {
      removeDateFromSchedule(iso);
      return;
    }
    const nextTime = existingTime || getDefaultSlotForDate(iso);

    if (isMultiDay) {
      setSelectedSlots((prev) => ({
        ...prev,
        [iso]: nextTime,
      }));
      setSelectedDate(iso);
      setSelectedTime(nextTime);
      requestAnimationFrame(() => scrollToSection(timesSectionRef));
      return;
    }

    setSelectedSlots({ [iso]: nextTime });
    setSelectedDate(iso);
    setSelectedTime(nextTime);
    setCurrentStep("travel");
    requestAnimationFrame(() => scrollToSection(travelSectionRef));
  };

  const scrollToSection = (ref) => {
    if (ref?.current) {
      ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleTimeSelection = (time) => {
    if (!selectedDate) return;
    setSelectedTime(time);
    setSelectedSlots((prev) => ({
      ...prev,
      [selectedDate]: time,
    }));
  };

  const selectedDay = selectedDate ? availabilityMap[selectedDate] : null;
  const selectedDayWithTravel = useMemo(() => {
    if (!selectedDay)
      return { day: null, hiddenCount: 0, hasSelectedSlot: false, selectedSlotReachable: false };

    const slotsWithReachability = (selectedDay.slots || []).map((slot) => ({
      ...slot,
      reachable: isSlotReachable(slot, selectedDay.date),
    }));

    const hiddenCount = slotsWithReachability.filter(
      (slot) => slot.available && !slot.reachable
    ).length;

    const reachableSlots = slotsWithReachability.filter(
      (slot) => slot.available && slot.reachable
    );

    const selectedSlot = slotsWithReachability.find(
      (slot) => slot.time === selectedTime
    );

    const slotsWithSelection = [...reachableSlots];

    if (selectedSlot && !selectedSlot.reachable) {
      slotsWithSelection.unshift({ ...selectedSlot, forceVisible: true });
    }
    
    return {
      day: { ...selectedDay, slots: slotsWithSelection },
      hiddenCount,
      hasSelectedSlot: Boolean(selectedSlot),
      selectedSlotReachable: selectedSlot?.reachable !== false,
    };
  }, [isSlotReachable, selectedDay, selectedTime]);

  const isSelectedTimeReachable = useMemo(() => {
    if (!selectedTime || !selectedDayWithTravel.day) return false;

    return Boolean(
      selectedDayWithTravel.hasSelectedSlot &&
        selectedDayWithTravel.selectedSlotReachable
    );
  }, [
    selectedDayWithTravel.hasSelectedSlot,
    selectedDayWithTravel.selectedSlotReachable,
    selectedDayWithTravel.day,
    selectedTime,
  ]);

  const canProceedToCustomer = Boolean(
    selectedDate &&
    selectedTime &&
    normalizeEircode(clientEircode) &&
    isSelectedTimeReachable
  );

  const removeDateFromSchedule = (date) => {
    setSelectedSlots((prev) => {
      const next = { ...prev };
      delete next[date];

      const remainingDates = Object.keys(next);
      const nextDate = remainingDates.includes(selectedDate)
        ? selectedDate
        : remainingDates[0] || "";

      setSelectedDate(nextDate);
      setSelectedTime(nextDate ? next[nextDate] || "" : "");

      return next;
    });
  };

  const monthLabel = visibleMonth.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
  const selectedDateLabel = selectedDate
    ? new Date(selectedDate).toLocaleDateString(undefined, {
        weekday: "long",
        month: "long",
        day: "numeric",
      })
    : "Pick a date";

  const handleBookAndPay = async () => {
    try {
      if (!pricing.dogCount || !pricing.visitCount) {
        setError("Add at least one dog and choose a time to see the price.");
        return;
      }

      if (paymentPreference === "invoice") {
        const bookingId = await handleBook(null, "invoice");
        if (bookingId) {
          setSuccess(
            "Invoice requested — we will email payment details once the booking is confirmed."
          );
        }
        return;
      }

      const amountInEuro = Number(pricing.totalPrice.toFixed(2));

      const paymentRes = await fetch("/api/create-payment-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: amountInEuro,
          description: pricing.description || `Booking: ${service.title}`,
        }),
      });

      const paymentData = await paymentRes.json();
      if (!paymentData?.orderId) {
        throw new Error("Payment order could not be created.");
      }

      const paymentOrderId = paymentData.orderId;

      const bookingId = await handleBook(paymentOrderId, "pay_now");
      if (!bookingId) throw new Error("No booking ID returned!");

      if (paymentData.url) {
        window.location.href = paymentData.url;
      } else {
        alert("Unable to begin payment");
      }
    } catch (err) {
      console.error("💥 Booking + payment error:", err);
      alert("Unable to start payment. Try again.");
    }
  };

  const handleBook = async (paymentOrderId, preference = paymentPreference) => {
    const sortedSchedule = Object.entries(selectedSlots || {})
      .map(([date, time]) => ({ date, time }))
      .filter((entry) => entry.date)
      .sort((a, b) => a.date.localeCompare(b.date));

    const validSchedule = sortedSchedule.filter((entry) => Boolean(entry.time));

    if (!validSchedule.length) {
      setError("Please pick at least one date and time.");
      return;
    }

    if (isMultiDay && validSchedule.length !== sortedSchedule.length) {
      setError("Please choose a time for each selected day.");
      return;
    }

    const primaryEntry = validSchedule[0];
    const recurrenceSelection = recurrence === "none" ? null : recurrence;
    const bookingMode =
      isMultiDay || validSchedule.length > 1 ? "multi-day" : "single";

    if (
      !clientName.trim() ||
      !clientPhone.trim() ||
      !clientEmail.trim() ||
      !clientAddress.trim()
    ) {
      setError(
        "Please add your name, phone number, email, and address so we can confirm your booking."
      );
      return;
    }

    setIsBooking(true);
    setError("");
    setSuccess("");

    try {
      const durationMinutes = Number.isFinite(service.durationMinutes)
        ? service.durationMinutes
        : 60;

      const petPayload = preparePetPayload();

      const schedulePayload = validSchedule.map((entry) => ({
        ...entry,
        durationMinutes,
      }));

      const amountInEuro = Number(pricing.totalPrice.toFixed(2));

      // ⭐ ADD PAYMENT ORDER ID INTO BOOKING HERE
      const payload = {
        date: primaryEntry.date,
        time: primaryEntry.time,
        durationMinutes,
        serviceId: service.id,
        serviceTitle: service.title,
        clientName: clientName.trim(),
        clientPhone: clientPhone.trim(),
        clientAddress: clientAddress.trim(),
        clientEmail: clientEmail.trim(),
        clientEircode: normalizeEircode(clientEircode),
        additionals,
        notes: notes.trim(),
        timeZone: availability.timeZone || BUSINESS_TIME_ZONE,
        pets: petPayload,
        dogCount: petPayload.length,
        schedule: schedulePayload,
        recurrence: recurrenceSelection,
        autoRenew: Boolean(recurrenceSelection),
        bookingMode,
        amount: amountInEuro,
        payment_order_id: paymentOrderId, // <-- CRITICAL
        payment_preference: preference,
        travel_minutes: travelMinutes,
        travel_anchor: travelAnchor,
        previous_booking_time: previousBookingTime,
        client_coordinates: clientCoordinates,
      };

      const requestUrl = `${apiBaseUrl}/api/book`;
      const response = await fetch(requestUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        let message =
          "Booking could not be completed right now. Please try again shortly.";

        try {
          const errorText = await response.text();
          const parsedError = errorText ? JSON.parse(errorText) : {};
          if (parsedError?.message) message = parsedError.message;
        } catch (_) {}

        throw new Error(message);
      }

      const data = await response.json();
      console.log("📦 BOOKING API RESPONSE:", data);

      const bookingId = data?.booking_id;
      if (!bookingId) throw new Error("No booking ID returned!");

      return bookingId;
    } catch (bookingError) {
      console.error("Booking failed", bookingError);
      setError(
        bookingError.message ||
          "Unable to send booking. Please try again later."
      );
    } finally {
      setIsBooking(false);
    }
  };

  useEffect(() => {
    if (!selectedDate) return;

    setVisibleMonth(new Date(selectedDate));
    const day = availabilityMap[selectedDate];
    if (!day) return;

    const reachableSlots = (day.slots || []).filter((slot) =>
      isSlotReachable(slot, day.date)
    );

    if (!reachableSlots.length) return;

    const hasSelectedSlot = reachableSlots.some(
      (slot) => slot.time === selectedTime
    );

    if (!hasSelectedSlot) {
      setSelectedTime(reachableSlots[0].time);
    }
  }, [
    availabilityMap,
    isSlotReachable,
    selectedDate,
    selectedTime,
  ]);

  const filteredBreeds = (dogIndex) => {
    const query = breedSearch[dogIndex]?.toLowerCase() || "";
    return DOG_BREEDS.filter((breed) => breed.toLowerCase().includes(query));
  };

  const toggleAdditional = (value) => {
    setAdditionals((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value]
    );
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        addOnDropdownRef.current &&
        !addOnDropdownRef.current.contains(event.target)
      ) {
        setAdditionalsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    fetch("/api/addons")
      .then((res) => res.json())
      .then((data) => setAddons(data.addons ?? []));
  }, []);

  useEffect(() => {
    if (bookingModalRef.current) {
      bookingModalRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, []);

  const progressPercent =
    ((stepOrder.indexOf(currentStep) + 1) / stepOrder.length) * 100;

  const supportService = useMemo(
    () => ({
      ...service,
      ctaOptions: {
        heading: "Need a hand?",
        description:
          "Chat with us for concierge booking support or share your request and we’ll set everything up.",
      },
    }),
    [service]
  );

  const summaryChips = [
    selectedDateLabel || "Pick a date",
    selectedTime ? formatTime(selectedTime) : "Pick a time",
    normalizeEircode(clientEircode) || null,
    pricing.dogCount
      ? `${pricing.dogCount} dog${pricing.dogCount > 1 ? "s" : ""}`
      : null,
  ].filter(Boolean);

  const goToStepAndScroll = (step) => {
    setCurrentStep(step);
    if (step === "calendar") scrollToSection(calendarSectionRef);
    if (step === "travel") scrollToSection(travelSectionRef);
    if (step === "time") scrollToSection(timesSectionRef);
    if (step === "addons") scrollToSection(addonsSectionRef);
    if (step === "summary") scrollToSection(summarySectionRef);
  };

  return (
    <>
      <div
        className="booking-overlay"
        role="dialog"
        aria-modal="true"
        ref={bookingModalRef}
      >
        <div className="booking-modal">
          <header className="booking-hero">
            <div>
              <p className="eyebrow">{service.duration || "Premium care"}</p>
              <h3>{service.title}</h3>
              <p className="muted">Jeroen van Elderen · Jeroen & Paws</p>
            </div>
            <div className="hero-actions">
              <button
                type="button"
                className="ghost-button"
                onClick={() => setSupportOpen(true)}
              >
                Need help?
              </button>
              <button
                className="close-button"
                type="button"
                onClick={onClose}
                aria-label="Close booking"
              >
                ×
              </button>
            </div>
          </header>

          {/* <div
            className="progress-track"
            role="progressbar"
            aria-valuenow={progressPercent}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="progress-fill"
              style={{ width: `${progressPercent}%` }}
            />
          </div> */}

          <div className="booking-body">
            <div className="booking-wayfinding">
              <div className="step-chip-row">
                {stepOrder.map((step) => {
                  const stepIndex = stepOrder.indexOf(step);
                  const activeIndex = stepOrder.indexOf(currentStep);
                  const isActive = currentStep === step;
                  const isComplete = stepIndex < activeIndex;
                  return (
                    <button
                      key={step}
                      type="button"
                      className={`step-chip ${isActive ? "active" : ""} ${
                        isComplete ? "complete" : ""
                      }`}
                      onClick={() => goToStepAndScroll(step)}
                    >
                      <span className="step-icon">
                        {isComplete ? "✓" : stepIndex + 1}
                      </span>
                      <span className="step-label">{stepLabels[step]}</span>
                    </button>
                  );
                })}
              </div>
              <div className="wayfinding-summary">
                {summaryChips.map((chip, index) => (
                  <span key={index} className="summary-chip">
                    {chip}
                  </span>
                ))}
              </div>
            </div>

            <div className="booking-layout">
              <div className="booking-main">
                {error && (
                  <div className="error-banner actionable">
                    <div>
                      <p>{error}</p>
                      <p className="muted subtle">
                        Try another time or message us for concierge scheduling.
                      </p>
                    </div>
                    <div className="actions-stack">
                      <button
                        type="button"
                        className="ghost-button"
                        onClick={() => goToStepAndScroll("time")}
                      >
                        Pick another time
                      </button>
                      <button
                        type="button"
                        className="ghost-button"
                        onClick={() => setSupportOpen(true)}
                      >
                        Message us
                      </button>
                    </div>
                  </div>
                )}

                {currentStep === "calendar" && (
                  <div className="step-card" ref={calendarSectionRef}>
                    {allowMultiDay && allowWeeklyRecurring && (
                      <div className="selection-summary">
                        <div>
                          <h4>Visit schedule</h4>
                          <p className="muted subtle">
                            Pick a single date or toggle multi-day to repeat your selected days weekly.
                          </p>
                        </div>
                        <label className="pill-toggle">
                          <input
                            type="checkbox"
                            checked={isMultiDay}
                            onChange={() => setIsMultiDay((prev) => !prev)}
                          />
                          <div>
                            <strong>Multi-day weekly</strong>
                            <small>Select multiple days in the calendar</small>
                          </div>
                        </label>
                      </div>
                    )}
                    <CalendarSection
                      availabilityNotice={availabilityNotice}
                      loading={loading}
                      monthLabel={monthLabel}
                      weekdayLabels={weekdayLabels}
                      monthMatrix={monthMatrix}
                      visibleMonth={visibleMonth}
                      availabilityMap={availabilityMap}
                      isDayAvailableForService={isDayAvailableForService}
                      selectedDate={selectedDate}
                      selectedSlots={selectedSlots}
                      handleDaySelection={handleDaySelection}
                      calendarSectionRef={calendarSectionRef}
                      onPreviousMonth={handlePreviousMonth}
                      onNextMonth={handleNextMonth}
                    />
                  </div>
                )}

                {currentStep === "travel" && (
                  <div className="step-card" ref={travelSectionRef}>
                    <div className="step-toolbar">
                      <div className="actions-stack">
                        <button
                          type="button"
                          className="ghost-button"
                          onClick={() => goToStepAndScroll("calendar")}
                        >
                          Back to calendar
                        </button>
                        <button
                          type="button"
                          className="ghost-button"
                          onClick={() => goToStepAndScroll("time")}
                          disabled={!normalizeEircode(clientEircode)}
                        >
                          Continue to times
                        </button>
                      </div>
                    </div>
                    <div className="form-grid">
                      <label className="input-group">
                        <span>Your Eircode</span>
                        <input
                          type="text"
                          value={clientEircode}
                          onChange={(event) => setClientEircode(event.target.value)}
                          placeholder="e.g. A98H940"
                        />
                      </label>
                      {travelAnchor === "previous" && (
                        <label className="input-group">
                          <span>Previous booking ends at</span>
                          <input
                            type="time"
                            value={previousBookingTime}
                            onChange={(event) =>
                              setPreviousBookingTime(event.target.value)
                            }
                          />
                        </label>
                      )}
                    </div>
                    <p className="muted subtle">{travelNote}</p>
                  </div>
                )}

                {currentStep === "time" && (
                  <div className="step-card" ref={timesSectionRef}>
                    <TimesSection
                      selectedDay={selectedDayWithTravel.day}
                      isDayAvailableForService={isDayAvailableForService}
                      selectedTime={selectedTime}
                      handleTimeSelection={handleTimeSelection}
                      selectedSlotReachable={
                        selectedDayWithTravel.selectedSlotReachable
                      }
                      formatTime={formatTime}
                      onContinue={() => goToStepAndScroll("customer")}
                      onBack={() => goToStepAndScroll("travel")}
                      canContinue={canProceedToCustomer}
                      timesSectionRef={timesSectionRef}
                      hiddenSlotCount={selectedDayWithTravel.hiddenCount}
                      travelMinutes={travelMinutes}
                      travelAnchor={travelAnchor}
                      isTravelValidationPending={isTravelValidationPending}
                      travelNote={travelNote}
                    />
                  </div>
                )}

                {currentStep === "customer" && (
                  <div className="step-card">
                    <div className="step-toolbar">
                      <button
                        type="button"
                        className="ghost-button"
                        onClick={() => goToStepAndScroll("time")}
                      >
                        Change time
                      </button>
                    </div>
                    <div className="input-group full-width">
                      <div className="label-row">
                        <span>Account access</span>
                        <div className="actions-stack">
                          <button
                            type="button"
                            className={`ghost-button ${
                              customerMode === "login" ? "active" : ""
                            }`}
                            onClick={() => handleCustomerModeChange("login")}
                            aria-pressed={customerMode === "login"}
                          >
                            Login
                          </button>
                          <button
                            type="button"
                            className={`ghost-button ${
                              customerMode === "new" ? "active" : ""
                            }`}
                            onClick={() => handleCustomerModeChange("new")}
                            aria-pressed={customerMode === "new"}
                          >
                            Register
                          </button>
                        </div>
                      </div>

                      {customerMode === "login" ? (
                        <form
                          className="auth-form"
                          onSubmit={handleSupabaseLogin}
                        >
                          {authError && (
                            <p className="error-banner">{authError}</p>
                          )}
                          <div className="form-grid">
                            <label className="input-group">
                              <span>Email</span>
                              <input
                                type="email"
                                value={loginEmail}
                                onChange={(e) => setLoginEmail(e.target.value)}
                                placeholder="you@example.com"
                                autoComplete="email"
                              />
                            </label>
                            <label className="input-group">
                              <span>Password</span>
                              <input
                                type="password"
                                value={loginPassword}
                                onChange={(e) =>
                                  setLoginPassword(e.target.value)
                                }
                                placeholder="Enter your password"
                                autoComplete="current-password"
                              />
                            </label>
                          </div>
                          <div className="actions-row">
                            <div className="actions-stack">
                              <button
                                type="submit"
                                className="button w-button"
                                disabled={authLoading}
                              >
                                {authLoading
                                  ? "Logging in…"
                                  : "Login to Jeroen & Paws"}
                              </button>
                              <button
                                type="button"
                                className="ghost-button"
                                onClick={() => {
                                  setShowLoginReset(true);
                                  setLoginResetStatus({ state: "idle", message: "" });
                                }}
                              >
                                Set a new password
                              </button>
                            </div>
                          </div>
                          {showLoginReset && (
                            <div
                              style={{
                                marginTop: "12px",
                                padding: "12px",
                                borderRadius: "12px",
                                border: "1px solid #e5e7eb",
                                background: "#f9fafb",
                                display: "grid",
                                gap: "10px",
                              }}
                            >
                              <p style={{ margin: 0, color: "#111827", fontWeight: 700 }}>
                                Set a new password
                              </p>
                              <p style={{ margin: 0, color: "#4b5563" }}>
                                After multiple login attempts, request a secure email to create a new password.
                              </p>
                              <label className="input-group" style={{ margin: 0 }}>
                                <span>Email</span>
                                <input
                                  type="email"
                                  value={loginEmail}
                                  onChange={(e) => setLoginEmail(e.target.value)}
                                  placeholder="you@example.com"
                                  autoComplete="email"
                                />
                              </label>
                              <div className="actions-row" style={{ justifyContent: "space-between", alignItems: "center" }}>
                                <button
                                  type="button"
                                  className="button w-button"
                                  disabled={loginResetStatus.state === "loading"}
                                  onClick={sendLoginResetRequest}
                                >
                                  {loginResetStatus.state === "loading"
                                    ? "Sending reset link…"
                                    : "Email me a reset link"}
                                </button>
                                <button
                                  type="button"
                                  className="ghost-button"
                                  onClick={() => setShowLoginReset(false)}
                                >
                                  Keep trying to log in
                                </button>
                              </div>
                              {loginResetStatus.message && (
                                <p
                                  className={
                                    loginResetStatus.state === "success" ? "success-banner subtle" : "error-banner"
                                  }
                                  style={{ margin: 0 }}
                                >
                                  {loginResetStatus.message}
                                </p>
                              )}
                            </div>
                          )}
                          {isAuthenticated && (
                            <p className="success-banner subtle">
                              You’re logged in as {clientEmail || loginEmail}.
                            </p>
                          )}
                          {eircodeChoiceOpen && (
                            <div className="success-banner subtle">
                              <p>
                                We found a saved Eircode. Which do you want to use?
                              </p>
                              <div className="actions-row">
                                <button
                                  type="button"
                                  className="button w-button"
                                  onClick={handleUseSavedEircode}
                                >
                                  Use saved
                                </button>
                                <button
                                  type="button"
                                  className="ghost-button"
                                  onClick={handleKeepEnteredEircode}
                                >
                                  Keep entered
                                </button>
                              </div>
                            </div>
                          )}
                        </form>
                      ) : customerMode === "new" ? (
                        <div className="actions-stack">
                          <p className="muted subtle">
                            We’ll create your account after booking.
                          </p>
                        </div>
                      ) : null}
                    </div>
                    {(customerMode === "new" || isAuthenticated) && (
                      <BookingForm
                        error={error}
                        success={success}
                        customerMode={customerMode}
                        onSelectCustomerMode={handleCustomerModeChange}
                        service={service}
                        scheduleEntries={scheduleEntries}
                        formatTime={formatTime}
                        clientName={clientName}
                        setClientName={setClientName}
                        clientPhone={clientPhone}
                        setClientPhone={setClientPhone}
                        clientEmail={clientEmail}
                        setClientEmail={setClientEmail}
                        clientAddress={clientAddress}
                        setClientAddress={setClientAddress}
                        clientAddressLocked={Boolean(
                          normalizeEircode(clientEircode)
                        )}
                        canLoadPets={canLoadPets}
                        fetchExistingPets={fetchExistingPets}
                        isLoadingPets={isLoadingPets}
                        existingPets={existingPets}
                        hasAttemptedPetLoad={hasAttemptedPetLoad}
                        selectedPetIds={selectedPetIds}
                        setSelectedPetIds={setSelectedPetIds}
                        showDogDetails={showDogDetails}
                        setShowDogDetails={setShowDogDetails}
                        dogCount={dogCount}
                        addAnotherDog={addAnotherDog}
                        removeDog={removeDog}
                        dogs={dogs}
                        updateDogField={updateDogField}
                        handleDogPhotoChange={handleDogPhotoChange}
                        MAX_DOGS={MAX_DOGS}
                        breedSearch={breedSearch}
                        setBreedSearch={setBreedSearch}
                        notes={notes}
                        setNotes={setNotes}
                        additionals={additionals}
                        additionalsOpen={additionalsOpen}
                        setAdditionalsOpen={setAdditionalsOpen}
                        toggleAdditional={toggleAdditional}
                        addons={addons}
                        selectedAdditionalLabels={selectedAdditionalLabels}
                        formatCurrency={formatCurrency}
                        parsePriceValue={parsePriceValue}
                        pricing={pricing}
                        hasAtLeastOneDog={hasAtLeastOneDog}
                        handleBookAndPay={handleBookAndPay}
                        isBooking={isBooking}
                        loading={loading}
                        isPopup={false}
                        addOnDropdownRef={addOnDropdownRef}
                        filteredBreeds={filteredBreeds}
                        customerDetailsRef={customerDetailsRef}
                        travelNote={travelNote}
                        paymentPreference={paymentPreference}
                        onPaymentPreferenceChange={setPaymentPreference}
                        allowRecurring={allowWeeklyRecurring}
                        recurrence={recurrence}
                        isMultiDay={isMultiDay}
                        onRecurrenceChange={setRecurrence}
                        visibleStage="customer"
                        onContinue={() => goToStepAndScroll("pet")}
                      />
                    )}
                  </div>
                )}

                {currentStep === "pet" && (
                  <div className="step-card">
                    <div className="step-toolbar">
                      <div className="actions-stack">
                        <button
                          type="button"
                          className="ghost-button"
                          onClick={() => goToStepAndScroll("customer")}
                        >
                          Back to customer
                        </button>
                        <button
                          type="button"
                          className="ghost-button"
                          onClick={() => goToStepAndScroll("time")}
                        >
                          Change time
                        </button>
                      </div>
                    </div>
                    <BookingForm
                      error={error}
                      success={success}
                      customerMode={customerMode}
                      onSelectCustomerMode={handleCustomerModeChange}
                      service={service}
                      scheduleEntries={scheduleEntries}
                      formatTime={formatTime}
                      clientName={clientName}
                      setClientName={setClientName}
                      clientPhone={clientPhone}
                      setClientPhone={setClientPhone}
                      clientEmail={clientEmail}
                      setClientEmail={setClientEmail}
                      clientAddress={clientAddress}
                      setClientAddress={setClientAddress}
                      clientAddressLocked={Boolean(
                        normalizeEircode(clientEircode)
                      )}
                      canLoadPets={canLoadPets}
                      fetchExistingPets={fetchExistingPets}
                      isLoadingPets={isLoadingPets}
                      existingPets={existingPets}
                      hasAttemptedPetLoad={hasAttemptedPetLoad}
                      selectedPetIds={selectedPetIds}
                      setSelectedPetIds={setSelectedPetIds}
                      showDogDetails={showDogDetails}
                      setShowDogDetails={setShowDogDetails}
                      dogCount={dogCount}
                      addAnotherDog={addAnotherDog}
                      removeDog={removeDog}
                      dogs={dogs}
                      updateDogField={updateDogField}
                      handleDogPhotoChange={handleDogPhotoChange}
                      MAX_DOGS={MAX_DOGS}
                      breedSearch={breedSearch}
                      setBreedSearch={setBreedSearch}
                      notes={notes}
                      setNotes={setNotes}
                      additionals={additionals}
                      additionalsOpen={additionalsOpen}
                      setAdditionalsOpen={setAdditionalsOpen}
                      toggleAdditional={toggleAdditional}
                      addons={addons}
                      selectedAdditionalLabels={selectedAdditionalLabels}
                      formatCurrency={formatCurrency}
                      parsePriceValue={parsePriceValue}
                      pricing={pricing}
                      hasAtLeastOneDog={hasAtLeastOneDog}
                      handleBookAndPay={handleBookAndPay}
                      isBooking={isBooking}
                      loading={loading}
                      isPopup={false}
                      addOnDropdownRef={addOnDropdownRef}
                      filteredBreeds={filteredBreeds}
                      customerDetailsRef={customerDetailsRef}
                      travelNote={travelNote}
                      paymentPreference={paymentPreference}
                      onPaymentPreferenceChange={setPaymentPreference}
                      allowRecurring={allowWeeklyRecurring}
                      recurrence={recurrence}
                      isMultiDay={isMultiDay}
                      onRecurrenceChange={setRecurrence}
                      visibleStage="pet"
                      onContinue={() => goToStepAndScroll("addons")}
                    />
                  </div>
                )}

                {currentStep === "addons" && (
                  <div className="step-card" ref={addonsSectionRef}>
                    <div className="step-toolbar">
                      <div className="actions-stack">
                        <button
                          type="button"
                          className="ghost-button"
                          onClick={() => goToStepAndScroll("pet")}
                        >
                          Back to pets
                        </button>
                        <button
                          type="button"
                          className="ghost-button"
                          onClick={() => goToStepAndScroll("time")}
                        >
                          Change time
                        </button>
                      </div>
                    </div>
                    <BookingForm
                      error={error}
                      success={success}
                      customerMode={customerMode}
                      onSelectCustomerMode={handleCustomerModeChange}
                      service={service}
                      scheduleEntries={scheduleEntries}
                      formatTime={formatTime}
                      clientName={clientName}
                      setClientName={setClientName}
                      clientPhone={clientPhone}
                      setClientPhone={setClientPhone}
                      clientEmail={clientEmail}
                      setClientEmail={setClientEmail}
                      clientAddress={clientAddress}
                      setClientAddress={setClientAddress}
                      clientAddressLocked={Boolean(
                        normalizeEircode(clientEircode)
                      )}
                      canLoadPets={canLoadPets}
                      fetchExistingPets={fetchExistingPets}
                      isLoadingPets={isLoadingPets}
                      existingPets={existingPets}
                      hasAttemptedPetLoad={hasAttemptedPetLoad}
                      selectedPetIds={selectedPetIds}
                      setSelectedPetIds={setSelectedPetIds}
                      showDogDetails={showDogDetails}
                      setShowDogDetails={setShowDogDetails}
                      dogCount={dogCount}
                      addAnotherDog={addAnotherDog}
                      removeDog={removeDog}
                      dogs={dogs}
                      updateDogField={updateDogField}
                      handleDogPhotoChange={handleDogPhotoChange}
                      MAX_DOGS={MAX_DOGS}
                      breedSearch={breedSearch}
                      setBreedSearch={setBreedSearch}
                      notes={notes}
                      setNotes={setNotes}
                      additionals={additionals}
                      additionalsOpen={additionalsOpen}
                      setAdditionalsOpen={setAdditionalsOpen}
                      toggleAdditional={toggleAdditional}
                      addons={addons}
                      selectedAdditionalLabels={selectedAdditionalLabels}
                      formatCurrency={formatCurrency}
                      parsePriceValue={parsePriceValue}
                      pricing={pricing}
                      hasAtLeastOneDog={hasAtLeastOneDog}
                      handleBookAndPay={handleBookAndPay}
                      isBooking={isBooking}
                      loading={loading}
                      isPopup={false}
                      addOnDropdownRef={addOnDropdownRef}
                      filteredBreeds={filteredBreeds}
                      customerDetailsRef={customerDetailsRef}
                      travelNote={travelNote}
                      paymentPreference={paymentPreference}
                      onPaymentPreferenceChange={setPaymentPreference}
                      allowRecurring={allowWeeklyRecurring}
                      recurrence={recurrence}
                      isMultiDay={isMultiDay}
                      onRecurrenceChange={setRecurrence}
                      visibleStage="addons"
                      onContinue={() => goToStepAndScroll("summary")}
                    />
                  </div>
                )}

                {currentStep === "summary" && (
                  <div className="step-card" ref={summarySectionRef}>
                    <div className="step-toolbar">
                      <button
                        type="button"
                        className="ghost-button"
                        onClick={() => goToStepAndScroll("addons")}
                      >
                        Back to additional care
                      </button>
                    </div>
                    <BookingForm
                      error={error}
                      success={success}
                      customerMode={customerMode}
                      onSelectCustomerMode={handleCustomerModeChange}
                      service={service}
                      scheduleEntries={scheduleEntries}
                      formatTime={formatTime}
                      clientName={clientName}
                      setClientName={setClientName}
                      clientPhone={clientPhone}
                      setClientPhone={setClientPhone}
                      clientEmail={clientEmail}
                      setClientEmail={setClientEmail}
                      clientAddress={clientAddress}
                      setClientAddress={setClientAddress}
                      clientAddressLocked={Boolean(
                        normalizeEircode(clientEircode)
                      )}
                      canLoadPets={canLoadPets}
                      fetchExistingPets={fetchExistingPets}
                      isLoadingPets={isLoadingPets}
                      existingPets={existingPets}
                      hasAttemptedPetLoad={hasAttemptedPetLoad}
                      selectedPetIds={selectedPetIds}
                      setSelectedPetIds={setSelectedPetIds}
                      showDogDetails={showDogDetails}
                      setShowDogDetails={setShowDogDetails}
                      dogCount={dogCount}
                      addAnotherDog={addAnotherDog}
                      removeDog={removeDog}
                      dogs={dogs}
                      updateDogField={updateDogField}
                      handleDogPhotoChange={handleDogPhotoChange}
                      MAX_DOGS={MAX_DOGS}
                      breedSearch={breedSearch}
                      setBreedSearch={setBreedSearch}
                      notes={notes}
                      setNotes={setNotes}
                      additionals={additionals}
                      additionalsOpen={additionalsOpen}
                      setAdditionalsOpen={setAdditionalsOpen}
                      toggleAdditional={toggleAdditional}
                      addons={addons}
                      selectedAdditionalLabels={selectedAdditionalLabels}
                      formatCurrency={formatCurrency}
                      parsePriceValue={parsePriceValue}
                      pricing={pricing}
                      hasAtLeastOneDog={hasAtLeastOneDog}
                      handleBookAndPay={handleBookAndPay}
                      isBooking={isBooking}
                      loading={loading}
                      isPopup={false}
                      addOnDropdownRef={addOnDropdownRef}
                      filteredBreeds={filteredBreeds}
                      customerDetailsRef={customerDetailsRef}
                      travelNote={travelNote}
                      paymentPreference={paymentPreference}
                      onPaymentPreferenceChange={setPaymentPreference}
                      allowRecurring={allowWeeklyRecurring}
                      recurrence={recurrence}
                      isMultiDay={isMultiDay}
                      onRecurrenceChange={setRecurrence}
                      visibleStage="summary"
                      onContinue={() => goToStepAndScroll("summary")}
                    />
                  </div>
                )}

                <div className="price-summary-card inline-price-summary">
                  <div className="price-summary__header">
                    <div>
                      <p className="muted small">Current total</p>
                      <h4>{formatCurrency(pricing.totalPrice)}</h4>
                    </div>
                    <p className="muted subtle price-summary__meta">
                      {pricing.dogCount && pricing.visitCount
                        ? `${pricing.dogCount} dog${
                            pricing.dogCount > 1 ? "s" : ""
                          } × ${pricing.visitCount} visit${
                            pricing.visitCount > 1 ? "s" : ""
                          }`
                        : "Add dogs and pick dates"}
                    </p>
                  </div>
                  <ul className="price-summary__list">
                    <li>
                      Service: {formatCurrency(pricing.servicePrice)} per dog /
                      visit
                    </li>
                    {pricing.dogCount >= 2 && (
                      <li>
                        Second dog rate: {formatCurrency(pricing.secondDogPrice)}
                        / visit (flat €10 add-on)
                      </li>
                    )}
                    {pricing.selectedAddons.map((addon) => (
                      <li key={addon.id || addon.value}>
                        + {addon.label}:{" "}
                        {formatCurrency(parsePriceValue(addon.price))}
                      </li>
                    ))}
                    <li>
                      Total per visit (all dogs): {formatCurrency(pricing.perVisitTotal)}
                    </li>
                    <li>
                      Total per dog / visit:{" "}
                      {formatCurrency(pricing.servicePrice)}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {supportOpen && (
        <ChatOrFormModal
          service={supportService}
          onClose={() => setSupportOpen(false)}
        />
      )}
    </>
  );
};

export default BookingModal;
