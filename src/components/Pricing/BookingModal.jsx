import React, { useState, useMemo, useEffect, useCallback, useRef } from "react";
import SearchableSelect from "./SearchableSelect";
import { DOG_BREEDS, weekdayLabels } from "./constants";
import {
  buildMonthMatrix,
  createEmptyDogProfile,
  generateDemoAvailability,
} from "./utils";
import { useAuth } from "../../context/AuthContext";

const ADDITIONAL_OPTIONS = [
  {
    value: "feeding",
    label: "Feeding & fresh water",
    description: "Meal prep, slow feeders, and water refreshes",
  },
  {
    value: "meds",
    label: "Medication support",
    description: "Pills, toppers, and timing reminders",
  },
  {
    value: "enrichment",
    label: "Enrichment time",
    description: "Puzzle toys, sniffaris, and brain games",
  },
  {
    value: "cleanup",
    label: "Accident clean-up",
    description: "Potty spot refresh and light deodorizing",
  },
  {
    value: "house-care",
    label: "House touches",
    description: "Plants, mail, and lights while we’re there",
  },
];

const BookingModal = ({ service, onClose }) => {
  const MAX_DOGS = 4;
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
  const [showFormPopup, setShowFormPopup] = useState(false);
  const [hasAttemptedPetLoad, setHasAttemptedPetLoad] = useState(false);
  const [showDogDetails, setShowDogDetails] = useState(true);
  const [selectedSlots, setSelectedSlots] = useState({});
  const [isMultiDay, setIsMultiDay] = useState(false);
  const [recurrence, setRecurrence] = useState("none");
  const [additionals, setAdditionals] = useState([]);
  const [additionalsOpen, setAdditionalsOpen] = useState(false);
  const { profile, isAuthenticated } = useAuth();
  const addOnDropdownRef = useRef(null);

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

      return Boolean(name || breed || notes || dog.photoDataUrl || dog.profileId);
    });
  }, [dogCount, dogs, selectedPetIds]);

  const trimmedName = clientName.trim();
  const trimmedEmail = clientEmail.trim();
  const canLoadPets = Boolean(trimmedName && trimmedEmail);

  const apiBaseUrl = useMemo(() => {
    const configuredBase = (
      process.env.NEXT_PUBLIC_BACKEND_BASE_URL || ""
    ).replace(/\/$/, "");

    if (configuredBase) return configuredBase;

    if (typeof window !== "undefined") {
      return window.location.origin.replace(/\/$/, "");
    }

    return "";
  }, []);

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

  const initializeSelection = useCallback((data) => {
    const firstOpenDate = data.dates.find((day) =>
      isDayAvailableForService(day)
    );
    if (firstOpenDate) {
      setSelectedDate(firstOpenDate.date);
      const firstSlot = firstOpenDate.slots.find((slot) => slot.available);
      setSelectedTime(firstSlot?.time || "");
      setSelectedSlots({
        [firstOpenDate.date]: firstSlot?.time || "",
      });
      setVisibleMonth(new Date(firstOpenDate.date));
    }
  }, [isDayAvailableForService]);

  const loadAvailability = useCallback(async () => {
    setLoading(true);
    setError("");
    setSuccess("");
    setAvailabilityNotice("");
    setSelectedSlots({});
    setIsMultiDay(false);
    setRecurrence("none");
    try {
      const durationMinutes = Number.isFinite(service.durationMinutes)
        ? service.durationMinutes
        : 60;
      const requestUrl = `${apiBaseUrl}/api/availability?serviceId=${service.id}&durationMinutes=${durationMinutes}`;
      const response = await fetch(requestUrl, {
        headers: { Accept: "application/json" },
      });
      if (!response.ok) {
        throw new Error(
          "Availability could not be loaded right now. Try again shortly."
        );
      }

      const data = await parseJsonSafely(response, requestUrl);
      setAvailability(data);
      initializeSelection(data);
    } catch (error) {
      console.error("Unable to load live availability", error);
      const fallback = generateDemoAvailability(service.durationMinutes);
      setAvailability(fallback);
      initializeSelection(fallback);
      setAvailabilityNotice(
        "Live calendar is unreachable — displaying demo slots so you can keep booking."
      );
    } finally {
      setLoading(false);
    }
  }, [
    apiBaseUrl,
    initializeSelection,
    parseJsonSafely,
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
    const client = profile?.client;
    if (!client) return;

    const phoneNumber = client.phone_number || client.phone || "";

    setClientName(client.full_name || "");
    setClientPhone(phoneNumber || "");
    setClientEmail(client.email || "");
    setClientAddress(client.address || "");
  }, [profile]);

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
      }
      setShowDogDetails(true);
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
        if (newDogs[i]?.profileId && !selectedPetIds.includes(newDogs[i].profileId)) {
          newDogs[i] = createEmptyDogProfile();
        }
      }

      return newDogs.slice(0, desiredCount);
    });

    setShowDogDetails(true);
  }, [
    dogCount,
    existingPets,
    hasAttemptedPetLoad,
    selectedPetIds,
  ]);

  useEffect(() => {
    if (!isAuthenticated || !canLoadPets || hasAttemptedPetLoad) return;

    fetchExistingPets();
  }, [
    canLoadPets,
    fetchExistingPets,
    hasAttemptedPetLoad,
    isAuthenticated,
  ]);
  
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
      return;
    }

    setSelectedSlots({ [iso]: nextTime });
    setSelectedDate(iso);
    setSelectedTime(nextTime);
  };

  const handleTimeSelection = (time) => {
    if (!selectedDate) return;
    setSelectedTime(time);
    setSelectedSlots((prev) => ({
      ...prev,
      [selectedDate]: time,
    }));
  };

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

  const handleBook = async () => {
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
    const bookingMode = isMultiDay || validSchedule.length > 1 ? "multi-day" : "single";

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

          if (parsedError?.message) {
            message = parsedError.message;
          }
        } catch (parseError) {
          console.error("Failed to parse booking error response", parseError);
        }

        throw new Error(message);
      }

      const data = await parseJsonSafely(response, requestUrl);

      const readableDates = validSchedule.map((entry) => {
        const start = new Date(`${entry.date}T${entry.time}:00`);
        return start.toLocaleString(undefined, {
          weekday: "long",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      });

      const passwordDelivery = data?.passwordDelivery;
      const emailStatus = data?.emailStatus;
      let emailMessage = "";
      let passwordNote = "";

      if (emailStatus?.confirmationSent) {
        emailMessage = "Confirmation emails have been sent.";
      } else if (emailStatus?.error) {
        emailMessage =
          "We saved your booking, but couldn't send a confirmation email. We'll reach out shortly.";
      } else if (emailStatus?.skipped) {
        emailMessage =
          "We saved your booking, but automated confirmation emails are paused. We'll confirm manually.";
      } else {
        emailMessage =
          "We saved your booking, but couldn't send a confirmation email. We'll reach out shortly.";
      }

      if (passwordDelivery) {
        const tempPasswordMessage = passwordDelivery.temporaryPassword
          ? ` Use this temporary password to access your profile: ${passwordDelivery.temporaryPassword}.`
          : "";

        if (emailStatus?.confirmationSent) {
          passwordNote =
            " Check your inbox for your new account password so you can update pets and bookings." +
            tempPasswordMessage;
        } else {
          passwordNote =
            " Save the password below so you can sign in to manage pets and bookings." +
            tempPasswordMessage;
        }
      }
      
      const calendarStatus = data?.calendarStatus;
      let calendarMessage = "";

      if (calendarStatus?.error) {
        calendarMessage =
          " We couldn't add this booking to the calendar automatically; we'll add it manually.";
      } else if (calendarStatus?.skipped) {
        calendarMessage =
          " Calendar sync is currently paused; we'll add this booking manually.";
      }

      const recurrenceLabel =
        recurrence === "weekly"
          ? " This plan will auto-renew each week."
          : recurrence === "monthly"
          ? " This plan will auto-renew each month."
          : recurrence === "six-months"
          ? " This plan will auto-renew every 6 months."
          : recurrence === "yearly"
          ? " This plan will auto-renew each year."
          : "";

      const scheduleLabel =
        readableDates.length > 1
          ? `${readableDates.length} visits booked: ${readableDates.join(", ")}`
          : readableDates[0];

      setSuccess(
        `Booked ${service.title} for ${scheduleLabel}. ${emailMessage}${calendarMessage}${passwordNote}${recurrenceLabel}`
      );

      setAvailabilityNotice("");
      setSelectedSlots({});
      setSelectedDate("");
      setSelectedTime("");
      setIsMultiDay(false);
      setRecurrence("none");

      setClientName("");
      setClientPhone("");
      setClientAddress("");
      setClientEmail("");
      setNotes("");
      setAdditionals([]);
      setAdditionalsOpen(false);
      resetDogProfiles();
      setExistingPets([]);
      setSelectedPetIds([]);
      setError("");
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
    if (!additionals.length) return ["Feeding", "Meds", "Playtime"];

    return additionals
      .map(
        (value) =>
          ADDITIONAL_OPTIONS.find((option) => option.value === value)?.label ||
          value
      )
      .slice(0, 3);
  }, [additionals]);

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

  const renderFormContent = (isPopup = false) => (
    <>
      {error && <p className="error-banner">{error}</p>}
      {success && <p className="success-banner">{success}</p>}
      <div className="form-grid">
        <label className="input-group">
          <span>Your name</span>
          <input
            type="text"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            placeholder="Client name"
          />
        </label>
        <label className="input-group">
          <span>Your phone</span>
          <input
            type="tel"
            value={clientPhone}
            onChange={(e) => setClientPhone(e.target.value)}
            placeholder="Best number to reach you"
          />
        </label>
        <label className="input-group email-group">
          <span>Your email</span>
          <div className="email-row">
            <input
              type="email"
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
              placeholder="name@email.com"
            />
            {canLoadPets && (
              <button
                type="button"
                className="ghost-button load-pets-button"
                onClick={fetchExistingPets}
                disabled={isLoadingPets}
              >
                {isLoadingPets ? "Loading…" : "Load pets"}
              </button>
            )}
          </div>
        </label>
        <label className="input-group full-width">
          <span>Service address</span>
          <input
            type="text"
            value={clientAddress}
            onChange={(e) => setClientAddress(e.target.value)}
            placeholder="Street, city, and any entry details"
          />
        </label>
        {(existingPets.length > 0 || hasAttemptedPetLoad) && (
          <div className="input-group full-width pet-list-group">
            {existingPets.length === 0 ? (
              <p className="muted subtle">
                No pets found for this email. Start a new pet profile below.
              </p>
            ) : (
              <div className="pet-list">
                {existingPets.map((pet) => {
                  const isSelected = selectedPetIds.includes(pet.id);
                  const petInitial = (pet.name || pet.breed || "🐾")
                    .charAt(0)
                    .toUpperCase();
                  const noteText = pet.notes || pet.bio || "";

                  return (
                    <label
                      key={pet.id}
                      className={`pet-option ${isSelected ? "selected" : ""}`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(event) => {
                          const checked = event.target.checked;
                          setSelectedPetIds((prev) => {
                            if (checked) {
                              return [...prev, pet.id];
                            }
                            return prev.filter((id) => id !== pet.id);
                          });
                        }}
                      />
                      <div className="pet-option__details">
                        <div className="pet-option__identity">
                          <div className="pet-option__thumb" aria-hidden="true">
                            {pet.photo_data_url || pet.photoDataUrl ? (
                              <img
                                src={pet.photo_data_url || pet.photoDataUrl}
                                alt={`${pet.name} avatar`}
                                className="pet-option__avatar"
                              />
                            ) : (
                              <div className="pet-option__avatar placeholder">
                                <span className="pet-option__initial">{petInitial}</span>
                              </div>
                            )}
                            <div className="pet-option__glow" />
                          </div>
                          <div className="pet-option__text">
                            <span className="pet-option__name">
                              {pet.name || "Your pup"}
                            </span>
                            <div className="pet-option__meta-row">
                              {pet.breed && (
                                <span className="pet-option__breed">{pet.breed}</span>
                              )}
                              <span className="pet-option__pill">Saved profile</span>
                            </div>
                            {noteText && (
                              <p className="pet-option__notes" title={noteText}>
                                {noteText}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        )}
        {existingPets.length > 0 && !showDogDetails && (
          <div className="input-group full-width">
            <div className="label-row">
              <span className="muted subtle">
                Need to share details for another dog?
              </span>
              <button
                type="button"
                className="ghost-button"
                onClick={() => setShowDogDetails(true)}
                disabled={dogCount >= MAX_DOGS}
              >
                {dogCount >= MAX_DOGS ? "Dog limit reached" : "Add another dog"}
              </button>
            </div>
          </div>
        )}
        {showDogDetails && (
          <>
            <div className="input-group full-width">
              <div className="label-row">
                <span>Dog details</span>
                <button
                  type="button"
                  className="ghost-button"
                  onClick={addAnotherDog}
                  disabled={dogCount >= MAX_DOGS}
                >
                  Add another dog
                </button>
              </div>
            </div>
            {Array.from({ length: dogCount }).map((_, index) => {
              const dogProfile = dogs[index] || createEmptyDogProfile();
              return (
                <div className="dog-row" key={index}>
                  <label className="input-group">
                    <span>Dog {index + 1} Name</span>
                    <input
                      type="text"
                      value={dogProfile.name}
                      onChange={(e) =>
                        updateDogField(index, "name", e.target.value)
                      }
                      placeholder="e.g. Bella"
                    />
                  </label>

                  <SearchableSelect
                    label={`Dog ${index + 1} Breed`}
                    options={["Mixed breed", ...DOG_BREEDS]}
                    value={dogProfile.breed}
                    onChange={(value) => updateDogField(index, "breed", value)}
                    className="dog-breed-select"
                    fullWidth={false}
                  />
                  <label className="input-group">
                    <span>Dog {index + 1} Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(event) =>
                        handleDogPhotoChange(index, event.target.files?.[0])
                      }
                    />
                    {dogProfile.photoDataUrl && (
                      <img
                        src={dogProfile.photoDataUrl}
                        alt={`Dog ${index + 1} preview`}
                        className="dog-photo-preview"
                      />
                    )}
                  </label>
                  <div className="dog-row__actions">
                    <button
                      type="button"
                      className="ghost-button remove-dog-button"
                      onClick={() => removeDog(index)}
                      aria-label={`Remove dog ${index + 1}`}
                    >
                      Remove dog
                    </button>
                  </div>
                </div>
              );
            })}
            <label className="input-group full-width">
              <span>Notes for Jeroen</span>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Tell us about your pup or preferences"
                rows={3}
              />
            </label>
          </>
        )}
        {allowRecurring && (
          <label className="input-group full-width recurrence-group">
            <span>Auto-renewal</span>
            <select
              className="input-like-select recurrence-select"
              value={recurrence}
              onChange={(event) => setRecurrence(event.target.value)}
            >
              <option value="none">One-time booking</option>
              {allowWeeklyRecurring && <option value="weekly">Renew every week</option>}
              <option value="monthly">Renew every month (auto books next month)</option>
              <option value="six-months">Renew every 6 months</option>
              <option value="yearly">Renew every year</option>
            </select>
            <p className="muted subtle">
              </p>
          </label>
        )}
      </div>
      <div className="input-group full-width add-on-group" ref={addOnDropdownRef}>
          <div className="label-row">
            <span>Additional care (optional)</span>
            <span className="muted subtle">
              
            </span>
          </div>
          <button
            type="button"
            className={`add-on-trigger ${additionalsOpen ? "open" : ""}`}
            onClick={() => setAdditionalsOpen((open) => !open)}
            aria-expanded={additionalsOpen}
          >
            <div className="add-on-chip-row">
              {additionals.length === 0 ? (
                <span className="add-on-chip placeholder">
                  Feeding • Meds • Enrichment
                </span>
              ) : (
                selectedAdditionalLabels.map((label) => (
                  <span key={label} className="add-on-chip">
                    {label}
                  </span>
                ))
              )}
            </div>
            <span className="chevron" aria-hidden="true">
              {additionalsOpen ? "▲" : "▼"}
            </span>
          </button>
          {additionalsOpen && (
            <div className="add-on-menu" role="listbox">
              {ADDITIONAL_OPTIONS.map((option) => {
                const isSelected = additionals.includes(option.value);
                return (
                  <label
                    key={option.value}
                    className={`add-on-option ${isSelected ? "selected" : ""}`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleAdditional(option.value)}
                    />
                    <div className="add-on-copy">
                      <span className="add-on-title">{option.label}</span>
                      <p className="add-on-description">{option.description}</p>
                    </div>
                    <span className="add-on-check" aria-hidden="true">
                      ✓
                    </span>
                  </label>
                );
              })}
            </div>
          )}
        </div>
      <div className="actions-row">
        <div className="actions-stack">
          {hasAtLeastOneDog ? (
            <button
              type="button"
              className="button w-button"
              onClick={handleBook}
              disabled={isBooking || loading}
            >
              {isBooking ? "Booking…" : "Confirm / Book"}
            </button>
          ) : (
            <p className="muted subtle">Add at least one dog to continue.</p>
          )}
          {isPopup && (
            <button
              type="button"
              className="ghost-button"
              onClick={() => setShowFormPopup(false)}
            >
              Close form
            </button>
          )}
        </div>
      </div>
      <p className="muted subtle">Times shown in your timezone</p>
    </>
  );

  return (
    <div className="booking-overlay" role="dialog" aria-modal="true">
      <div className="booking-modal">
        <header className="booking-header">
          <div>
            <p className="eyebrow">{service.duration}</p>
            <h3>{service.title}</h3>
            <p className="muted">Jeroen van Elderen · Jeroen & Paws</p>
          </div>
          <button
            className="close-button"
            type="button"
            onClick={onClose}
            aria-label="Close booking"
          >
            ×
          </button>
        </header>

        <div className="booking-body">
          <div className="schedule-controls">
            {allowMultiDay && (
              <label className="checkbox-row">
                <input
                  type="checkbox"
                  checked={isMultiDay}
                  onChange={(event) => setIsMultiDay(event.target.checked)}
                />
                <span className="muted subtle">
                  Book multiple days at once (tap calendar dates to add more)
                </span>
              </label>
            )}

            {isMultiDay && (
              <div className="input-group full-width">
                <span className="muted small">Selected days</span>
                <div className="schedule-summary">
                  {scheduleEntries.length === 0 ? (
                    <p className="muted subtle">Pick dates on the calendar to add them here.</p>
                  ) : (
                    <ul className="schedule-list">
                      {scheduleEntries.map((entry) => {
                        const readableDate = entry.date
                          ? new Date(entry.date).toLocaleDateString(undefined, {
                              weekday: "long",
                              month: "long",
                              day: "numeric",
                            })
                          : "Date";
                        return (
                          <li key={entry.date} className="schedule-list__item">
                            <div>
                              <strong>{readableDate}</strong>
                              <p className="muted small">
                                {entry.time ? formatTime(entry.time) : "Pick a time"}
                              </p>
                            </div>
                            <button
                              type="button"
                              className="ghost-button"
                              onClick={() => removeDateFromSchedule(entry.date)}
                            >
                              Remove
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </div>
            )}
          </div>
          <div className="calendar-card">
            <div className="calendar-toolbar">
              <div>
                <p className="muted small">{availability.timeZone}</p>
                <h4>{monthLabel}</h4>
              </div>
              <div className="toolbar-controls">
                <div className="month-nav" aria-label="Month navigation">
                  <button
                    type="button"
                    className="nav-button"
                    onClick={() =>
                      setVisibleMonth(
                        (prev) =>
                          new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
                      )
                    }
                    aria-label="Previous month"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    className="nav-button"
                    onClick={() =>
                      setVisibleMonth(
                        (prev) =>
                          new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
                      )
                    }
                    aria-label="Next month"
                  >
                    ›
                  </button>
                </div>
                <div
                  className="toggle-group"
                  role="group"
                  aria-label="Time display format"
                >
                  <button
                    type="button"
                    className={`pill ${is24h ? "active" : ""}`}
                    onClick={() => setIs24h(true)}
                  >
                    24h
                  </button>
                  <button
                    type="button"
                    className={`pill ${!is24h ? "active" : ""}`}
                    onClick={() => setIs24h(false)}
                  >
                    12h
                  </button>
                </div>
              </div>
            </div>
            {availabilityNotice && (
              <p className="info-banner">{availabilityNotice}</p>
            )}
            {loading ? (
              <p className="muted">Loading availability…</p>
            ) : (
              <>
                <div className="weekday-row">
                  {weekdayLabels.map((label) => (
                    <span key={label}>{label}</span>
                  ))}
                </div>
                <div className="calendar-grid" aria-label="Calendar">
                  {monthMatrix.map((dateObj) => {
                    const iso = dateObj.toISOString().slice(0, 10);
                    const isCurrentMonth =
                      dateObj.getMonth() === visibleMonth.getMonth();
                    const dayData = availabilityMap[iso];
                    const isAvailable = isDayAvailableForService(dayData);
                    const isSelected = iso === selectedDate;
                    const isScheduled = Boolean(selectedSlots[iso]);
                    const isPastDate = dateObj < new Date().setHours(0, 0, 0, 0);
                    return (
                      <button
                        key={iso}
                        type="button"
                        className={`day ${isSelected ? "selected" : ""} ${
                          isScheduled && !isSelected ? "scheduled" : ""
                        } ${isCurrentMonth ? "" : "muted"} ${
                          isAvailable ? "day-has-slots" : "day-no-slots"
                        }`}
                        onClick={() => handleDaySelection(iso)}
                        aria-pressed={isSelected}
                        disabled={isPastDate || !isAvailable}
                      >
                        <span>{dateObj.getDate()}</span>
                        <span className="day-dot-wrapper">
                          {isAvailable && <span className="day-dot" />}
                          {isScheduled && !isSelected && <span className="day-check">✓</span>}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
          <div className="times-card">
            <div className="times-header">
              <div>
                <p className="muted small">{selectedDateLabel}</p>
                <h4>Available slots</h4>
              </div>
              <div className="times-actions">
                <p className="muted subtle">
                  {selectedTime ? formatTime(selectedTime) : "Choose a time"}
                </p>
                <button
                  type="button"
                  className="ghost-button"
                  onClick={() => setShowFormPopup(true)}
                >
                  Book time
                </button>
              </div>
            </div>
            <div className="times-list" aria-label="Time options">
              {!selectedDay && (
                <p className="muted">Select a date to see times.</p>
              )}
              
              {selectedDay && !isDayAvailableForService(selectedDay) && (
                <p className="muted">
                  No compatible start times are available for this service on this
                  date because of other bookings.
                </p>
              )}

              {selectedDay && isDayAvailableForService(selectedDay) &&
                selectedDay.slots
                  ?.filter((slot) => slot.available)
                  .map((slot) => {
                    const isActive = selectedTime === slot.time;
                    return (
                      <button
                        key={`${selectedDay.date}-${slot.time}`}
                        type="button"
                        className={`time-slot ${isActive ? "active" : ""}`}
                        onClick={() => handleTimeSelection(slot.time)}
                        aria-pressed={isActive}
                      >
                        <span className="dot" />
                        <span className="time-slot__label">
                          {formatTime(slot.time)}
                        </span>
                      </button>
                    );
                  })}

              {selectedDay &&
              isDayAvailableForService(selectedDay) &&
                selectedDay.slots.every((slot) => !slot.available) && (
                  <p className="muted">All slots are full for this day.</p>
                )}
              <p className="muted subtle">Times shown in your timezone</p>
            </div>
          </div>
        </div>

        {showFormPopup && (
          <div className="form-popup-overlay" role="dialog" aria-modal="true">
            <div className="form-popup">
              <header className="popup-header">
                <div>
                  <p className="muted small">Complete booking</p>
                  <h4>{service.title}</h4>
                  <p className="muted">
                    {selectedDateLabel} · {selectedTime || "Pick a time"}
                  </p>
                </div>
                <button
                  className="close-button"
                  type="button"
                  onClick={() => setShowFormPopup(false)}
                  aria-label="Close booking form"
                >
                  ×
                </button>
              </header>
              <div className="popup-body">{renderFormContent(true)}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingModal;
