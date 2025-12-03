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

const BookingModal = ({ service, onClose }) => {
  const MAX_DOGS = 4;
  const { profile, isAuthenticated, setProfile } = useAuth();
  const [customerMode, setCustomerMode] = useState(() => (profile ? "login" : "null"));
  const [loginEmail, setLoginEmail] = useState(profile?.client?.email || "");
  const [loginPassword, setLoginPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [is24h, setIs24h] = useState(true);
  const [availability, setAvailability] = useState({
    dates: [],
    timeZone: "UTC",
  });
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientAddress, setClientAddress] = useState("");
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
  const customerDetailsRef = useRef(null);
  const addOnDropdownRef = useRef(null);
  const addonsSectionRef = useRef(null);
  const bookingModalRef = useRef(null);
  const calendarSectionRef = useRef(null);
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

  const formatCurrency = useCallback((value) => {
    const numeric = Number.isFinite(value) ? value : 0;
    return `€${numeric.toFixed(2)}`;
  }, []);

  const allowMultiDay = service?.allowMultiDay !== false;
  const allowRecurring = service?.allowRecurring !== false;
  const serviceLabel = (service?.label || service?.title || "").toLowerCase();
  const isBoardingService = serviceLabel.includes("boarding");
  const allowWeeklyRecurring = allowRecurring && !isBoardingService;

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

  const trimmedEmail = clientEmail.trim();
  const canLoadPets = Boolean(trimmedEmail);

  const stepOrder = [
    "calendar",
    "time",
    "customer",
    "pet",
    "addons",
    "summary",
  ];
  const stepLabels = {
    calendar: "Calendar",
    time: "Choose time",
    customer: "Customer",
    pet: "Pets",
    addons: "Additional care",
    summary: "Summary",
  };

  const apiBaseUrl = useMemo(() => computeApiBaseUrl(), []);

  useEffect(() => {
    if (isAuthenticated) {
      setCustomerMode("new");
    }
  }, [isAuthenticated]);

  const isDayAvailableForService = useCallback((day) => {
    if (!day || !Array.isArray(day.slots) || day.slots.length === 0) {
      return false;
    }

    return day.slots.some((slot) => slot.available);
  }, []);

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

  const setInitialVisibleMonth = useCallback(
    (data) => {
      const firstOpenDate = data.dates.find((day) =>
        isDayAvailableForService(day)
      );
      if (firstOpenDate) {
        setVisibleMonth(new Date(firstOpenDate.date));
      }
    },
    [isDayAvailableForService]
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
        setAvailability(cached);
        setInitialVisibleMonth(cached);
        return;
      }

      const data = await prefetchAvailability(service, apiBaseUrl);
      setAvailability(data);
      setInitialVisibleMonth(cached);
    } catch (error) {
      console.error("Unable to load live availability", error);
      const fallback = generateDemoAvailability(service.durationMinutes);
      setAvailability(fallback);
      setInitialVisibleMonth(cached);
      setAvailabilityNotice(
        "Live calendar is unreachable — displaying demo slots so you can keep booking."
      );
    } finally {
      setLoading(false);
    }
  }, [
    apiBaseUrl,
    setInitialVisibleMonth,
    service.durationMinutes,
    service.id,
  ]);
  useEffect(() => {
    loadAvailability();
  }, [loadAvailability]);

  useEffect(() => {
    setExistingPets([]);
    setSelectedPetIds([]);
    setHasAttemptedPetLoad(false);
    setShowDogDetails(true);
  }, [clientEmail]);

  useEffect(() => {
    if (!isAuthenticated) return;
    if (!canLoadPets) return;
    if (hasAttemptedPetLoad || isLoadingPets) return;

    fetchExistingPets();
  }, [
    canLoadPets,
    fetchExistingPets,
    hasAttemptedPetLoad,
    isAuthenticated,
    isLoadingPets,
  ]);

  const applyProfileDetails = useCallback(() => {
    const client = profile?.client;
    if (!client) return;

    const phoneNumber = client.phone_number || client.phone || "";

    setClientName(client.full_name || "");
    setClientPhone(phoneNumber || "");
    setClientEmail(client.email || "");
    setClientAddress(client.address || "");
    setLoginEmail(client.email || "");
  }, [profile]);

  useEffect(() => {
    if (!profile) return;
    setCustomerMode("login");
    applyProfileDetails();
  }, [applyProfileDetails, profile]);

  const handleCustomerModeChange = (mode) => {
    setCustomerMode(mode);
    setAuthError("");
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
      setClientAddress("");
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
      setClientAddress(payload?.client?.address || "");
      setLoginPassword("");
    } catch (loginError) {
      console.error("Client login failed", loginError);
      setAuthError(loginError.message || "Incorrect email or password.");
    } finally {
      setAuthLoading(false);
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

  const calendarDays = useMemo(() => availability.dates || [], [availability]);
  const availabilityMap = useMemo(() => {
    return calendarDays.reduce((acc, day) => {
      acc[day.date] = day;
      return acc;
    }, {});
  }, [calendarDays]);
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

  const getDefaultSlotForDate = useCallback(
    (iso) => {
      const day = availabilityMap[iso];
      if (!day || !Array.isArray(day.slots)) return "";

      const firstAvailable = day.slots.find((slot) => slot.available);
      return firstAvailable?.time || "";
    },
    [availabilityMap]
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
    setCurrentStep("time");
    requestAnimationFrame(() => scrollToSection(timesSectionRef));
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

  const canProceedToCustomer = Boolean(selectedDate && selectedTime);

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

  const selectedDay = selectedDate ? availabilityMap[selectedDate] : null;
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

      // 1️⃣ Prepare amount
      const amountInEuro = Number(pricing.totalPrice.toFixed(2));

      // 2️⃣ Create payment order FIRST
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

      // 3️⃣ Now create booking WITH payment_order_id
      const bookingId = await handleBook(paymentOrderId);
      if (!bookingId) throw new Error("No booking ID returned!");

      // 4️⃣ Redirect user to Revolut checkout
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

  const handleBook = async (paymentOrderId) => {
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
        additionals,
        notes: notes.trim(),
        timeZone: availability.timeZone || "UTC",
        pets: petPayload,
        dogCount: petPayload.length,
        schedule: schedulePayload,
        recurrence: recurrenceSelection,
        autoRenew: Boolean(recurrenceSelection),
        bookingMode,
        amount: amountInEuro,
        payment_order_id: paymentOrderId, // <-- CRITICAL
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
    if (selectedDate) {
      setVisibleMonth(new Date(selectedDate));
      const day = availabilityMap[selectedDate];

      if (!isDayAvailableForService(day)) {
        const nextAvailable = calendarDays.find((entry) =>
          isDayAvailableForService(entry)
        );

        if (nextAvailable) {
          setSelectedDate(nextAvailable.date);
          const firstSlot = nextAvailable.slots.find((slot) => slot.available);
          setSelectedTime(firstSlot?.time || "");
        } else {
          setSelectedDate("");
          setSelectedTime("");
        }

        return;
      }

      const hasSelectedSlot = day.slots.some(
        (slot) => slot.time === selectedTime && slot.available
      );
      if (!hasSelectedSlot) {
        const firstOpen = day.slots.find((slot) => slot.available);
        if (firstOpen) {
          setSelectedTime(firstOpen.time);
        }
      }
    }
  }, [
    availabilityMap,
    calendarDays,
    isDayAvailableForService,
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
    const baseTotal =
      activeDogsCount && visitCount
        ? perDogPerVisit * activeDogsCount * visitCount
        : 0;
    const totalPrice = baseTotal + addonTotal;

    const descriptionParts = [service.title];

    if (activeDogsCount) {
      descriptionParts.push(
        `${activeDogsCount} dog${activeDogsCount > 1 ? "s" : ""}`
      );
    }

    if (visitCount) {
      descriptionParts.push(
        `${visitCount} visit${visitCount > 1 ? "s" : ""}`
      );
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
      bookingModalRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, []);

  const recommendedSlot = useMemo(() => {
    const availableDays = calendarDays
      .filter((day) => isDayAvailableForService(day))
      .sort((a, b) => a.date.localeCompare(b.date));
    if (!availableDays.length) return null;
    const slot = availableDays[0].slots.find((item) => item.available);
    if (!slot) return null;
    return { date: availableDays[0].date, time: slot.time };
  }, [calendarDays, isDayAvailableForService]);

  const progressPercent = ((stepOrder.indexOf(currentStep) + 1) / stepOrder.length) * 100;

  const handleUseRecommended = () => {
    if (!recommendedSlot) return;
    setSelectedSlots({ [recommendedSlot.date]: recommendedSlot.time });
    setSelectedDate(recommendedSlot.date);
    setSelectedTime(recommendedSlot.time);
    setCurrentStep("time");
    scrollToSection(timesSectionRef);
  };

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
    pricing.dogCount ? `${pricing.dogCount} dog${pricing.dogCount > 1 ? "s" : ""}` : null,
  ].filter(Boolean);

  const goToStepAndScroll = (step) => {
    setCurrentStep(step);
    if (step === "calendar") scrollToSection(calendarSectionRef);
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
              <button type="button" className="ghost-button" onClick={() => setSupportOpen(true)}>
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

          <div
            className="progress-track"
            role="progressbar"
            aria-valuenow={progressPercent}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
          </div>

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
                      <span className="step-icon">{isComplete ? "✓" : stepIndex + 1}</span>
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
                      <p className="muted subtle">Try another time or message us for concierge scheduling.</p>
                    </div>
                    <div className="actions-stack">
                      <button type="button" className="ghost-button" onClick={() => goToStepAndScroll("time")}>
                        Pick another time
                      </button>
                      <button type="button" className="ghost-button" onClick={() => setSupportOpen(true)}>
                        Message us
                      </button>
                    </div>
                  </div>
                )}

                {currentStep === "calendar" && (
                  <div className="step-card" ref={calendarSectionRef}>
                    <CalendarSection
                      availabilityNotice={availabilityNotice}
                      loading={loading}
                      monthLabel={monthLabel}
                      weekdayLabels={weekdayLabels}
                      monthMatrix={monthMatrix}
                      visibleMonth={visibleMonth}
                      onPrevMonth={() =>
                        setVisibleMonth(
                          (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
                        )
                      }
                      onNextMonth={() =>
                        setVisibleMonth(
                          (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
                        )
                      }
                      is24h={is24h}
                      onToggleTimeFormat={(value) => setIs24h(value)}
                      availabilityMap={availabilityMap}
                      isDayAvailableForService={isDayAvailableForService}
                      selectedDate={selectedDate}
                      selectedSlots={selectedSlots}
                      handleDaySelection={handleDaySelection}
                      calendarSectionRef={calendarSectionRef}
                      timeZoneLabel={availability.timeZone}
                    />
                  </div>
                )}

                {currentStep === "time" && (
                  <div className="step-card" ref={timesSectionRef}>
                    <TimesSection
                      selectedDay={selectedDay}
                      isDayAvailableForService={isDayAvailableForService}
                      selectedDateLabel={selectedDateLabel}
                      selectedTime={selectedTime}
                      handleTimeSelection={handleTimeSelection}
                      formatTime={formatTime}
                      onContinue={() => goToStepAndScroll("customer")}
                      onBack={() => goToStepAndScroll("calendar")}
                      canContinue={canProceedToCustomer}
                      timesSectionRef={timesSectionRef}
                      recommendedSlot={recommendedSlot}
                      onUseRecommended={handleUseRecommended}
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
                    {!isAuthenticated && (
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
                          <form className="auth-form" onSubmit={handleSupabaseLogin}>
                            {authError && <p className="error-banner">{authError}</p>}
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
                                  onChange={(e) => setLoginPassword(e.target.value)}
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
                                  {authLoading ? "Logging in…" : "Login to Jeroen & Paws"}
                                </button>
                              </div>
                            </div>
                          </form>
                        ) : customerMode === "new" ? (
                          <div className="actions-stack">
                            <p className="muted subtle">We’ll create your account after booking.</p>
                          </div>
                        ) : null}
                      </div>
                    )}
                    {isAuthenticated && (
                      <div className="input-group full-width">
                        <p className="success-banner subtle">
                          You’re logged in as {clientEmail || loginEmail}.
                        </p>
                      </div>
                    )}
                    {(customerMode === "new" || isAuthenticated) && (
                      <BookingForm
                        error={error}
                        success={success}
                        customerMode={customerMode}
                        onSelectCustomerMode={handleCustomerModeChange}
                        service={service}
                        scheduleEntries={scheduleEntries}
                        timeZoneLabel={availability.timeZone}
                        formatTime={formatTime}
                        clientName={clientName}
                        setClientName={setClientName}
                        clientPhone={clientPhone}
                        setClientPhone={setClientPhone}
                        clientEmail={clientEmail}
                        setClientEmail={setClientEmail}
                        clientAddress={clientAddress}
                        setClientAddress={setClientAddress}
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
                      timeZoneLabel={availability.timeZone}
                      formatTime={formatTime}
                      clientName={clientName}
                      setClientName={setClientName}
                      clientPhone={clientPhone}
                      setClientPhone={setClientPhone}
                      clientEmail={clientEmail}
                      setClientEmail={setClientEmail}
                      clientAddress={clientAddress}
                      setClientAddress={setClientAddress}
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
                      timeZoneLabel={availability.timeZone}
                      formatTime={formatTime}
                      clientName={clientName}
                      setClientName={setClientName}
                      clientPhone={clientPhone}
                      setClientPhone={setClientPhone}
                      clientEmail={clientEmail}
                      setClientEmail={setClientEmail}
                      clientAddress={clientAddress}
                      setClientAddress={setClientAddress}
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
                      timeZoneLabel={availability.timeZone}
                      formatTime={formatTime}
                      clientName={clientName}
                      setClientName={setClientName}
                      clientPhone={clientPhone}
                      setClientPhone={setClientPhone}
                      clientEmail={clientEmail}
                      setClientEmail={setClientEmail}
                      clientAddress={clientAddress}
                      setClientAddress={setClientAddress}
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
                      visibleStage="summary"
                      onContinue={() => goToStepAndScroll("summary")}
                    />
                  </div>
                )}
              </div>

              <div className="price-summary-card inline-price-summary">
                <div className="price-summary__header">
                  <div>
                    <p className="muted small">Current total</p>
                    <h4>{formatCurrency(pricing.totalPrice)}</h4>
                  </div>
                  <p className="muted subtle price-summary__meta">
                    {pricing.dogCount && pricing.visitCount
                      ? `${pricing.dogCount} dog${pricing.dogCount > 1 ? "s" : ""} × ${pricing.visitCount} visit${
                          pricing.visitCount > 1 ? "s" : ""
                        }`
                      : "Add dogs and pick dates"}
                  </p>
                </div>
                <ul className="price-summary__list">
                  <li>
                    Service: {formatCurrency(pricing.servicePrice)} per dog / visit
                  </li>
                  {pricing.selectedAddons.map((addon) => (
                    <li key={addon.id || addon.value}>
                      + {addon.label}: {formatCurrency(parsePriceValue(addon.price))} one-time
                    </li>
                  ))}
                  <li>
                    Total per dog / visit: {formatCurrency(pricing.servicePrice)}
                  </li>
                </ul>
                <div className="sticky-cta">
                  <p className="muted subtle">Secure payment after confirmation.</p>
                </div>
              </div>
              </div>
            </div>
          </div>
        </div>
      {supportOpen && <ChatOrFormModal service={supportService} onClose={() => setSupportOpen(false)} />}
    </>
  );
};

export default BookingModal;