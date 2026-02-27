import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { generateDemoAvailability } from "../utils";
import {
  computeApiBaseUrl,
  getCachedAvailability,
  prefetchAvailability,
} from "../availabilityCache";

const BUSINESS_TZ = "Europe/Dublin";
const SLOT_START_HOUR = 8;
const SLOT_END_HOUR = 20;
const SLOT_STEP_MINUTES = 30;
const DURATION_STEP_MINUTES = 15;
const DEFAULT_MIN_DURATION_MINUTES = 30;
const CALENDAR_SCROLL_HEIGHT = 520;

const VIEW_MODES = ["day", "week", "month"];
const COMPOSER_TABS = ["details", "pets", "additional", "confirm"];

const makeIsoDate = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const buildTimes = () => {
  const slots = [];
  for (
    let mins = SLOT_START_HOUR * 60;
    mins < SLOT_END_HOUR * 60;
    mins += SLOT_STEP_MINUTES
  ) {
    const h = String(Math.floor(mins / 60)).padStart(2, "0");
    const m = String(mins % 60).padStart(2, "0");
    slots.push(`${h}:${m}`);
  }
  return slots;
};

const ALL_TIMES = buildTimes();

const formatDisplayDate = (isoDate) =>
  new Date(`${isoDate}T00:00:00`).toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

const formatWeekdayShort = (isoDate) =>
  new Date(`${isoDate}T00:00:00`).toLocaleDateString(undefined, {
    weekday: "short",
  });

const formatMonthShort = (isoDate) =>
  new Date(`${isoDate}T00:00:00`).toLocaleDateString(undefined, {
    month: "short",
  });

const formatDayNumber = (isoDate) =>
  new Date(`${isoDate}T00:00:00`).toLocaleDateString(undefined, {
    day: "numeric",
  });

const timeToMinutes = (timeValue) => {
  if (!timeValue) {
    return null;
  }
  const [hoursPart, minutesPart] = timeValue.split(":").map(Number);
  return hoursPart * 60 + minutesPart;
};

const minutesToTime = (totalMinutes) => {
  const hoursPart = String(Math.floor(totalMinutes / 60)).padStart(2, "0");
  const minutesPart = String(totalMinutes % 60).padStart(2, "0");
  return `${hoursPart}:${minutesPart}`;
};

const parsePriceNumber = (priceText) => {
  if (!priceText) return null;
  const normalized = String(priceText).replace(/,/g, ".");
  const match = normalized.match(/(\d+(?:\.\d+)?)/);
  if (!match) return null;
  return Number(match[1]);
};

const isWeekendDate = (isoDate) => {
  const day = new Date(`${isoDate}T00:00:00`).getDay();
  return day === 0 || day === 6;
};

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(amount || 0));

const BookingModal = ({ service, onClose }) => {
  const { profile, isAuthenticated } = useAuth();
  const [stage, setStage] = useState(isAuthenticated ? "calendar" : "register");
  const [viewMode, setViewMode] = useState("week");
  const [composerTab, setComposerTab] = useState("details");

  const [availability, setAvailability] = useState(() => {
    const cached = service?.id ? getCachedAvailability(service.id) : null;
    return cached || { dates: [] };
  });
  const [availabilityError, setAvailabilityError] = useState("");
  const [availabilitySource, setAvailabilitySource] = useState("live");

  const [visibleDate, setVisibleDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedStart, setSelectedStart] = useState("");
  const [selectedEnd, setSelectedEnd] = useState("");
  const [dragHandle, setDragHandle] = useState("");

  const [clientName, setClientName] = useState(profile?.client?.name || "");
  const [clientEmail, setClientEmail] = useState(profile?.client?.email || "");
  const [clientPhone, setClientPhone] = useState(profile?.client?.phone || "");
  const [clientEircode, setClientEircode] = useState(
    profile?.client?.eircode || "",
  );
  const [password, setPassword] = useState("");

  const [petNames, setPetNames] = useState("");
  const [savedPets, setSavedPets] = useState([]);
  const [selectedPetIds, setSelectedPetIds] = useState([]);
  const [petsLoading, setPetsLoading] = useState(false);
  const [newPetName, setNewPetName] = useState("");
  const [newPetBreed, setNewPetBreed] = useState("");
  const [newPetNotes, setNewPetNotes] = useState("");
  const [savingPet, setSavingPet] = useState(false);
  const [petFormMessage, setPetFormMessage] = useState("");
  const [additionalCare, setAdditionalCare] = useState([]);
  const [availableAddons, setAvailableAddons] = useState([]);
  const [addonsLoading, setAddonsLoading] = useState(false);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");

  const apiBaseUrl = useMemo(() => computeApiBaseUrl(), []);
  const serviceUnitPrice = useMemo(
    () => parsePriceNumber(service?.price),
    [service?.price],
  );
  const serviceUnitMinutes = Number(service?.durationMinutes || 0) || 0;
  const minimumDurationMinutes =
    serviceUnitMinutes || DEFAULT_MIN_DURATION_MINUTES;
  const isBoardingService = /overnight|boarding/i.test(
    `${service?.slug || ""} ${service?.category || ""} ${service?.title || ""}`,
  );

  useEffect(() => {
    if (!profile?.client) {
      return;
    }

    setClientName((previous) => previous || profile.client.name || "");
    setClientEmail((previous) => previous || profile.client.email || "");
    setClientPhone((previous) => previous || profile.client.phone || "");
    setClientEircode(
      (previous) => previous || profile.client.eircode?.toUpperCase() || "",
    );
  }, [profile]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        if (!service?.id) {
          const demo = generateDemoAvailability(service?.durationMinutes || 30);
          if (mounted) {
            setAvailability(demo);
            setAvailabilitySource("demo");
          }
          return;
        }

        prefetchAvailability(service);
        const query = new URLSearchParams({
          serviceId: String(service.id),
          durationMinutes: String(service?.durationMinutes || 30),
        });
        if (clientEircode.trim()) {
          query.set("clientAddress", clientEircode.trim());
        }

        const response = await fetch(
          `${apiBaseUrl}/api/availability?${query.toString()}`,
        );
        if (!response.ok) {
          throw new Error(`Availability unavailable (${response.status})`);
        }
        const payload = await response.json();
        if (mounted) {
          setAvailability(payload || { dates: [] });
          setAvailabilityError("");
          setAvailabilitySource("live");
        }
      } catch (error) {
        if (!mounted) return;
        setAvailability(
          generateDemoAvailability(service?.durationMinutes || 30),
        );
        setAvailabilityError(
          "Live calendar unavailable. Showing demo calendar.",
        );
        setAvailabilitySource("demo");
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [apiBaseUrl, clientEircode, service]);

  useEffect(() => {
    let active = true;
    const ownerEmail = (clientEmail || profile?.client?.email || "")
      .trim()
      .toLowerCase();
    if (!ownerEmail) return undefined;

    const loadPets = async () => {
      setPetsLoading(true);
      try {
        const response = await fetch(
          `${apiBaseUrl}/api/pets?ownerEmail=${encodeURIComponent(ownerEmail)}`,
        );
        if (!response.ok) throw new Error("Failed to load pets");
        const payload = await response.json();
        if (active) {
          setSavedPets(payload?.pets || []);
        }
      } catch (error) {
        if (active) {
          setSavedPets([]);
        }
      } finally {
        if (active) setPetsLoading(false);
      }
    };

    loadPets();
    return () => {
      active = false;
    };
  }, [apiBaseUrl, clientEmail, profile?.client?.email]);

  useEffect(() => {
    let active = true;
    const loadAddons = async () => {
      setAddonsLoading(true);
      try {
        const response = await fetch(`${apiBaseUrl}/api/addons`);
        if (!response.ok) throw new Error("Failed to load addons");
        const payload = await response.json();
        if (active) {
          setAvailableAddons(
            (payload?.addons || []).filter(
              (addon) => addon?.is_active !== false,
            ),
          );
        }
      } catch (error) {
        if (active) setAvailableAddons([]);
      } finally {
        if (active) setAddonsLoading(false);
      }
    };
    loadAddons();
    return () => {
      active = false;
    };
  }, [apiBaseUrl]);

  const availabilityMap = useMemo(() => {
    const map = {};
    (availability?.dates || []).forEach((entry) => {
      if (entry?.date) map[entry.date] = entry;
    });
    return map;
  }, [availability]);

  const travelBufferSlots = useMemo(() => {
    const eircode = (clientEircode || "").replace(/\s+/g, "").toUpperCase();
    if (!eircode) return 0;
    if (eircode.startsWith("A98")) return 1;
    if (eircode.startsWith("D")) return 1;
    return 2;
  }, [clientEircode]);

  const daySlots = useCallback(
    (isoDate) => {
      const day = availabilityMap[isoDate];
      const apiSlots = day?.slots || [];
      const apiSlotMap = new Map(apiSlots.map((slot) => [slot.time, slot]));
      const weekend = isWeekendDate(isoDate);
      const now = new Date();
      const isToday = isoDate === makeIsoDate(now);
      const nowMinutes = now.getHours() * 60 + now.getMinutes();

      const slots = ALL_TIMES.map((time) => {
        const source = apiSlotMap.get(time);
        const minuteMark = timeToMinutes(time) || 0;
        const isPastTime = isToday && minuteMark < nowMinutes;
        const hasApiState = typeof source?.available === "boolean";
        const available = hasApiState
          ? Boolean(source?.available)
          : Boolean(isBoardingService && weekend);

        if (isPastTime) {
          return {
            time,
            state: "booked",
            reason: "Past time",
          };
        }

        return {
          time,
          state: available ? "open" : "booked",
          reason: available ? "Open" : "Booked",
        };
      });

      if (selectedDate === isoDate && selectedStart && selectedEnd) {
        const start = timeToMinutes(selectedStart);
        const end = timeToMinutes(selectedEnd);
        slots.forEach((slot, index) => {
          const slotMins = timeToMinutes(slot.time);
          if (
            slotMins !== null &&
            start !== null &&
            end !== null &&
            slotMins >= start &&
            slotMins < end
          ) {
            slots[index] = {
              ...slot,
              state: "held",
              reason: "Selected in draft",
            };
          }
        });
      }

      if (travelBufferSlots > 0) {
        const bookedIndexes = slots
          .map((slot, index) => ({ slot, index }))
          .filter(({ slot }) => slot.state === "booked")
          .map(({ index }) => index);

        bookedIndexes.forEach((index) => {
          for (let offset = 1; offset <= travelBufferSlots; offset += 1) {
            const prev = index - offset;
            const next = index + offset;
            if (slots[prev] && slots[prev].state === "open") {
              slots[prev] = {
                ...slots[prev],
                state: "travel",
                reason: "Booked (travel)",
              };
            }
            if (slots[next] && slots[next].state === "open") {
              slots[next] = {
                ...slots[next],
                state: "travel",
                reason: "Booked (travel)",
              };
            }
          }
        });
      }

      return slots;
    },
    [
      availabilityMap,
      isBoardingService,
      selectedDate,
      selectedEnd,
      selectedStart,
      travelBufferSlots,
    ],
  );

  const dayBlocks = useCallback(
    (isoDate) => {
      const slotsForDay = daySlots(isoDate);
      const blocks = [];
      let currentBlock = null;

      slotsForDay.forEach((slot) => {
        if (!currentBlock || currentBlock.state !== slot.state) {
          if (currentBlock) {
            blocks.push(currentBlock);
          }
          currentBlock = {
            state: slot.state,
            start: slot.time,
            end: minutesToTime(
              (timeToMinutes(slot.time) || 0) + SLOT_STEP_MINUTES,
            ),
          };
          return;
        }

        currentBlock.end = minutesToTime(
          (timeToMinutes(slot.time) || 0) + SLOT_STEP_MINUTES,
        );
      });

      if (currentBlock) {
        blocks.push(currentBlock);
      }

      return blocks;
    },
    [daySlots],
  );

  const currentDate = selectedDate || makeIsoDate(visibleDate);
  const currentDaySlots = useMemo(
    () => daySlots(currentDate),
    [currentDate, daySlots],
  );

  const plannerDates = useMemo(() => {
    const anchor = new Date(`${currentDate}T00:00:00`);
    if (viewMode === "day") return [currentDate];
    if (viewMode === "week") {
      const monday = new Date(anchor);
      const weekday = (monday.getDay() + 6) % 7;
      monday.setDate(monday.getDate() - weekday);
      return Array.from({ length: 7 }, (_, idx) => {
        const next = new Date(monday);
        next.setDate(monday.getDate() + idx);
        return makeIsoDate(next);
      });
    }

    const first = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
    const days = new Date(
      anchor.getFullYear(),
      anchor.getMonth() + 1,
      0,
    ).getDate();
    return Array.from({ length: days }, (_, idx) =>
      makeIsoDate(new Date(first.getFullYear(), first.getMonth(), idx + 1)),
    );
  }, [currentDate, viewMode]);

  const plannerLabel = useMemo(() => {
    const anchor = new Date(`${currentDate}T00:00:00`);
    if (viewMode === "day") {
      return anchor.toLocaleDateString(undefined, {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    }
    return anchor.toLocaleDateString(undefined, {
      month: "long",
      year: "numeric",
    });
  }, [currentDate, viewMode]);

  const canContinueFromRegister = useMemo(() => {
    if (isAuthenticated) return true;
    return Boolean(
      clientName.trim() &&
      clientEmail.trim() &&
      clientPhone.trim() &&
      clientEircode.trim() &&
      password.trim(),
    );
  }, [
    clientName,
    clientEircode,
    clientEmail,
    clientPhone,
    isAuthenticated,
    password,
  ]);

  const pickSlot = (isoDate, slotTime) => {
    const slot = daySlots(isoDate).find((item) => item.time === slotTime);
    if (!slot || slot.state !== "open") return;

    const startMinutes = timeToMinutes(slotTime);
    const nextStart = startMinutes || 0;
    const nextEnd = nextStart + minimumDurationMinutes;
    if (nextEnd > maxDayMinutes) {
      return;
    }
    if (!isRangeOpen(nextStart, nextEnd, isoDate)) {
      return;
    }

    setSelectedDate(isoDate);
    setSelectedStart(slotTime);
    setSelectedEnd(minutesToTime(nextEnd));
    setStage("composer");
    setComposerTab("details");
  };

  const navigatePlanner = useCallback(
    (direction) => {
      const anchor = new Date(`${currentDate}T00:00:00`);
      if (viewMode === "day") {
        anchor.setDate(anchor.getDate() + direction);
      } else if (viewMode === "week") {
        anchor.setDate(anchor.getDate() + direction * 7);
      } else {
        anchor.setMonth(anchor.getMonth() + direction, 1);
      }
      setVisibleDate(anchor);
      setSelectedDate(makeIsoDate(anchor));
    },
    [currentDate, viewMode],
  );

  const selectedStartMinutes = useMemo(
    () => timeToMinutes(selectedStart),
    [selectedStart],
  );
  const selectedEndMinutes = useMemo(
    () => timeToMinutes(selectedEnd),
    [selectedEnd],
  );
  const maxDayMinutes = SLOT_END_HOUR * 60;

  const isRangeOpen = useCallback(
    (startMins, endMins, dateValue = currentDate) => {
      if (startMins === null || endMins === null || endMins <= startMins) {
        return false;
      }
      const slotsForDay = daySlots(dateValue);
      for (
        let minuteValue = startMins;
        minuteValue < endMins;
        minuteValue += DURATION_STEP_MINUTES
      ) {
        const snappedMinute =
          SLOT_START_HOUR * 60 +
          Math.floor((minuteValue - SLOT_START_HOUR * 60) / SLOT_STEP_MINUTES) *
            SLOT_STEP_MINUTES;
        const timeValue = minutesToTime(snappedMinute);
        const slot = slotsForDay.find(
          (slotItem) => slotItem.time === timeValue,
        );
        if (!slot || slot.state !== "open") {
          return false;
        }
      }
      return true;
    },
    [currentDate, daySlots],
  );

  const updateSelectionFromHandle = useCallback(
    (handle, clientY) => {
      if (!handle) {
        return;
      }
      const railElement = document.getElementById("booking-day-rail-grid");
      if (!railElement) {
        return;
      }

      const railRect = railElement.getBoundingClientRect();
      const relativePosition = clientY - railRect.top + railElement.scrollTop;
      const clamped = Math.min(
        Math.max(relativePosition, 0),
        railElement.scrollHeight,
      );
      const relativeSteps = Math.round(
        clamped /
          (railElement.scrollHeight /
            ((maxDayMinutes - SLOT_START_HOUR * 60) / DURATION_STEP_MINUTES)),
      );
      const minuteValue = Math.min(
        Math.max(
          SLOT_START_HOUR * 60 + relativeSteps * DURATION_STEP_MINUTES,
          SLOT_START_HOUR * 60,
        ),
        maxDayMinutes,
      );

      if (handle === "move") {
        if (selectedStartMinutes === null || selectedEndMinutes === null) {
          return;
        }
        const duration = selectedEndMinutes - selectedStartMinutes;
        if (duration < minimumDurationMinutes) {
          return;
        }
        const nextStart = Math.min(
          Math.max(minuteValue, SLOT_START_HOUR * 60),
          maxDayMinutes - duration,
        );
        const nextEnd = nextStart + duration;
        if (!isRangeOpen(nextStart, nextEnd)) {
          return;
        }
        setSelectedStart(minutesToTime(nextStart));
        setSelectedEnd(minutesToTime(nextEnd));
        return;
      }

      if (handle === "start") {
        if (
          selectedEndMinutes === null ||
          minuteValue > selectedEndMinutes - minimumDurationMinutes
        ) {
          return;
        }
        if (!isRangeOpen(minuteValue, selectedEndMinutes)) {
          return;
        }
        setSelectedStart(minutesToTime(minuteValue));
        return;
      }

      if (
        selectedStartMinutes === null ||
        minuteValue < selectedStartMinutes + minimumDurationMinutes
      ) {
        return;
      }
      if (!isRangeOpen(selectedStartMinutes, minuteValue)) {
        return;
      }
      setSelectedEnd(minutesToTime(minuteValue));
    },
    [
      isRangeOpen,
      maxDayMinutes,
      minimumDurationMinutes,
      selectedEndMinutes,
      selectedStartMinutes,
    ],
  );

  useEffect(() => {
    if (!dragHandle) {
      return undefined;
    }

    const onPointerMove = (event) => {
      event.preventDefault();
      updateSelectionFromHandle(dragHandle, event.clientY);
    };

    const onPointerUp = () => {
      setDragHandle("");
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, [dragHandle, updateSelectionFromHandle]);

  const selectionTopPercent =
    selectedStartMinutes === null
      ? 0
      : ((selectedStartMinutes - SLOT_START_HOUR * 60) /
          (maxDayMinutes - SLOT_START_HOUR * 60)) *
        100;
  const selectionHeightPercent =
    selectedStartMinutes === null || selectedEndMinutes === null
      ? 0
      : ((selectedEndMinutes - selectedStartMinutes) /
          (maxDayMinutes - SLOT_START_HOUR * 60)) *
        100;

  const selectedDurationMinutes = useMemo(() => {
    if (selectedStartMinutes === null || selectedEndMinutes === null) return 0;
    return Math.max(0, selectedEndMinutes - selectedStartMinutes);
  }, [selectedEndMinutes, selectedStartMinutes]);

  const selectedDurationLabel = selectedDurationMinutes
    ? `${selectedDurationMinutes} min`
    : service?.duration || `${minimumDurationMinutes} min`;
  const durationTitleSuffix =
    selectedDurationMinutes > minimumDurationMinutes
      ? ` · Extended ${selectedDurationLabel}`
      : ` · ${selectedDurationLabel}`;
  const petsLabel =
    petNames
      .split(",")
      .map((name) => name.trim())
      .filter(Boolean)
      .join(", ") || "Your dog";
  const bookingTitle = `${petsLabel} - ${service?.title || "Service"}${durationTitleSuffix}`;

  const baseServicePrice = useMemo(() => {
    if (!serviceUnitPrice || !serviceUnitMinutes || !selectedDurationMinutes) {
      return 0;
    }
    return (serviceUnitPrice / serviceUnitMinutes) * selectedDurationMinutes;
  }, [selectedDurationMinutes, serviceUnitMinutes, serviceUnitPrice]);

  const selectedPetCount = useMemo(() => {
    if (selectedPetIds.length > 0) {
      return selectedPetIds.length;
    }
    const namedPets = petNames
      .split(",")
      .map((name) => name.trim())
      .filter(Boolean);
    return Math.max(namedPets.length, 1);
  }, [petNames, selectedPetIds]);

  const petPriceMultiplier = useMemo(() => {
    if (selectedPetCount <= 1) return 1;
    return 1 + (selectedPetCount - 1) * 0.5;
  }, [selectedPetCount]);

  const servicePrice = useMemo(
    () => baseServicePrice * petPriceMultiplier,
    [baseServicePrice, petPriceMultiplier],
  );

  const selectedAddonDetails = useMemo(
    () =>
      availableAddons.filter((addon) =>
        additionalCare.includes(addon.value || addon.id),
      ),
    [additionalCare, availableAddons],
  );

  const addonsPrice = useMemo(
    () =>
      selectedAddonDetails.reduce(
        (sum, addon) => sum + Number(addon.price || 0),
        0,
      ),
    [selectedAddonDetails],
  );

  const totalPrice = servicePrice + addonsPrice;

  const savePetInline = useCallback(async () => {
    const ownerEmail = (clientEmail || profile?.client?.email || "")
      .trim()
      .toLowerCase();

    if (!ownerEmail || !newPetName.trim()) {
      setPetFormMessage("Add a pet name to save your pet.");
      return;
    }

    setSavingPet(true);
    setPetFormMessage("");
    try {
      const response = await fetch(`${apiBaseUrl}/api/pets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ownerEmail,
          name: newPetName.trim(),
          breed: newPetBreed.trim(),
          notes: newPetNotes.trim(),
        }),
      });
      if (!response.ok) throw new Error("Failed to save pet");
      const payload = await response.json();
      if (payload?.pet) {
        setSavedPets((prev) => [payload.pet, ...prev]);
      }
      setPetNames((prev) =>
        [prev, newPetName.trim()].filter(Boolean).join(", "),
      );
      setNewPetName("");
      setNewPetBreed("");
      setNewPetNotes("");
      setPetFormMessage("Pet saved.");
    } catch (error) {
      setPetFormMessage("Could not save pet right now.");
    } finally {
      setSavingPet(false);
    }
  }, [
    apiBaseUrl,
    clientEmail,
    newPetBreed,
    newPetName,
    newPetNotes,
    profile?.client?.email,
  ]);

  const submitBooking = async () => {
    if (!selectedDate || !selectedStart || !selectedEnd) {
      setSubmitMessage("Pick a valid date/time first.");
      return;
    }

    setSubmitting(true);
    setSubmitMessage("");
    try {
      const response = await fetch(`${apiBaseUrl}/api/book`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId: service?.id,
          client_name: clientName,
          client_email: clientEmail,
          client_phone: clientPhone,
          client_eircode: clientEircode,
          dog_names: petNames,
          additionals: additionalCare,
          date: selectedDate,
          start_time: selectedStart,
          end_time: selectedEnd,
          notes,
        }),
      });

      if (!response.ok) throw new Error("Booking failed");
      setSubmitMessage("Booking request submitted.");
      setStage("calendar");
    } catch (error) {
      setSubmitMessage("Could not submit booking right now.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="booking-overlay" role="dialog" aria-modal="true">
      <div className="booking-shell">
        <header className="booking-shell__header">
          <div>
            <p className="eyebrow">{service?.duration || "Visit"}</p>
            <h3>{service?.title || "Booking"}</h3>
            <p className="muted">Jeroen van Elderen · Jeroen & Paws</p>
          </div>
          <button
            type="button"
            className="close-button"
            onClick={onClose}
            aria-label="Close booking"
          >
            ×
          </button>
        </header>

        {!isAuthenticated && stage === "register" && (
          <section className="card">
            <h4>Create account first</h4>
            <p className="muted">
              Before choosing slots, clients must register an account.
            </p>
            <div className="grid-2">
              <label className="input-group">
                <span>Name</span>
                <input
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                />
              </label>
              <label className="input-group">
                <span>Email</span>
                <input
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                />
              </label>
              <label className="input-group">
                <span>Phone</span>
                <input
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                />
              </label>
              <label className="input-group">
                <span>Eircode</span>
                <input
                  value={clientEircode}
                  onChange={(e) =>
                    setClientEircode(e.target.value.toUpperCase())
                  }
                />
              </label>
              <label className="input-group full">
                <span>Password</span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </label>
            </div>
            <div className="actions-row">
              <button type="button" className="ghost-button" onClick={onClose}>
                Cancel
              </button>
              <button
                type="button"
                className="button"
                disabled={!canContinueFromRegister}
                onClick={() => setStage("calendar")}
              >
                Continue to calendar
              </button>
            </div>
          </section>
        )}

        {stage === "calendar" && (
          <section className="card">
            <div className="calendar-topbar">
              <div className="toggle-group">
                {VIEW_MODES.map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    className={`ghost-button tiny ${viewMode === mode ? "is-active" : ""}`}
                    onClick={() => setViewMode(mode)}
                  >
                    {mode[0].toUpperCase() + mode.slice(1)}
                  </button>
                ))}
              </div>
              <div className="planner-nav">
                <button
                  type="button"
                  className="ghost-button tiny"
                  onClick={() => navigatePlanner(-1)}
                >
                  Previous {viewMode}
                </button>
                <strong>{plannerLabel}</strong>
                <button
                  type="button"
                  className="ghost-button tiny"
                  onClick={() => navigatePlanner(1)}
                >
                  Next {viewMode}
                </button>
              </div>
              <div className="muted">
                {availabilitySource === "live"
                  ? "Live owner calendar check"
                  : "Demo availability"}{" "}
                · Travel buffer: {travelBufferSlots * SLOT_STEP_MINUTES} min ·
                Time zone: {BUSINESS_TZ}
              </div>
            </div>

            {availabilityError && (
              <p className="muted subtle">{availabilityError}</p>
            )}

            {viewMode === "month" ? (
              <div className="month-grid">
                {plannerDates.map((isoDate) => {
                  const openCount = daySlots(isoDate).filter(
                    (slot) => slot.state === "open",
                  ).length;
                  return (
                    <button
                      key={isoDate}
                      type="button"
                      className={`month-cell ${isoDate === currentDate ? "active" : ""}`}
                      onClick={() => setSelectedDate(isoDate)}
                    >
                      <strong>
                        {new Date(`${isoDate}T00:00:00`).getDate()}
                      </strong>
                      <span>{openCount} open</span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="planner-table outlook-planner-table">
                <div
                  className="planner-header"
                  style={{ "--planner-cols": plannerDates.length }}
                >
                  <span className="planner-time" />
                  {plannerDates.map((isoDate) => (
                    <button
                      key={isoDate}
                      type="button"
                      className={`planner-day ${isoDate === currentDate ? "active" : ""}`}
                      onClick={() => setSelectedDate(isoDate)}
                    >
                      <span className="planner-day-number">
                        {formatDayNumber(isoDate)}
                      </span>
                      <span className="planner-day-week">
                        {formatWeekdayShort(isoDate)}
                      </span>
                      <span className="planner-day-month">
                        {formatMonthShort(isoDate)}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="planner-body-wrapper">
                  <div
                    className="planner-body"
                    style={{
                      "--planner-cols": plannerDates.length,
                      "--planner-scroll-height": `${CALENDAR_SCROLL_HEIGHT}px`,
                    }}
                  >
                    <div className="planner-time-column">
                      {ALL_TIMES.filter((_, idx) => idx % 2 === 0).map(
                        (time) => (
                          <span key={`label-${time}`} className="planner-time">
                            {time}
                          </span>
                        ),
                      )}
                    </div>
                
                  {plannerDates.map((isoDate) => (
                      <div key={`col-${isoDate}`} className="planner-column">
                        <div className="planner-grid-lines">
                          {ALL_TIMES.map((time) => (
                            <div
                              key={`${isoDate}-line-${time}`}
                              className="planner-line"
                            />
                          ))}
                        </div>

                        {dayBlocks(isoDate)
                          .filter((block) => block.state !== "held")
                          .map((block) => {
                            const startMinutes =
                              timeToMinutes(block.start) || 0;
                            const endMinutes = timeToMinutes(block.end) || 0;
                            const top =
                              ((startMinutes - SLOT_START_HOUR * 60) /
                                (maxDayMinutes - SLOT_START_HOUR * 60)) *
                              100;
                            const height =
                              ((endMinutes - startMinutes) /
                                (maxDayMinutes - SLOT_START_HOUR * 60)) *
                              100;

                            return (
                              <button
                                key={`${isoDate}-${block.start}-${block.end}-${block.state}`}
                                type="button"
                                className={`planner-block ${block.state}`}
                                style={{ top: `${top}%`, height: `${height}%` }}
                                onClick={() =>
                                  block.state === "open" &&
                                  pickSlot(isoDate, block.start)
                                }
                                disabled={block.state !== "open"}
                              >
                                <span className="event-meta">
                                  {block.start} - {block.end}
                                </span>
                                <strong className="event-title">
                                  {block.state === "open"
                                    ? service?.name || "Booking"
                                    : block.state === "travel"
                                      ? "Travel buffer"
                                      : block.state === "held"
                                        ? "Reserved"
                                        : "Busy"}
                                </strong>
                              </button>
                            );
                          })}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="actions-row">
              <button type="button" className="ghost-button" onClick={onClose}>
                Close
              </button>
              <button
                type="button"
                className="button"
                onClick={() => setStage("composer")}
                disabled={!selectedStart || !selectedDate}
              >
                Open selected slot
              </button>
            </div>
          </section>
        )}

        {stage === "composer" && (
          <section className="card composer-shell">
            <div className="composer-toolbar">
              <div className="toggle-group">
                {COMPOSER_TABS.map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    className={`ghost-button tiny ${composerTab === tab ? "is-active" : ""}`}
                    onClick={() => setComposerTab(tab)}
                  >
                    {tab === "additional"
                      ? "Additional care"
                      : tab[0].toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>
              <div className="toolbar-meta">
                <div className="price-pill">
                  Total {formatCurrency(totalPrice)}
                </div>
                <button
                  type="button"
                  className="ghost-button tiny"
                  onClick={() => setStage("calendar")}
                >
                  Back to calendar
                </button>
              </div>
            </div>

            <div className="composer-layout">
              <div className="composer-main">
                {composerTab === "details" && (
                  <div className="grid-2">
                    <label className="input-group full">
                      <span>Title</span>
                      <input value={bookingTitle} readOnly />
                    </label>
                    <label className="input-group">
                      <span>Date</span>
                      <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                      />
                    </label>
                    <label className="input-group">
                      <span>Start</span>
                      <input
                        type="time"
                        step={900}
                        value={selectedStart}
                        onChange={(e) => {
                          const nextStart = e.target.value;
                          const nextStartMinutes = timeToMinutes(nextStart);
                          const endMinutes = selectedEndMinutes;
                          if (nextStartMinutes === null || endMinutes === null)
                            return;
                          if (
                            endMinutes - nextStartMinutes <
                            minimumDurationMinutes
                          )
                            return;
                          if (
                            !isRangeOpen(
                              nextStartMinutes,
                              endMinutes,
                              selectedDate || currentDate,
                            )
                          )
                            return;
                          setSelectedStart(nextStart);
                        }}
                      />
                    </label>
                    <label className="input-group">
                      <span>End</span>
                      <input
                        type="time"
                        step={900}
                        value={selectedEnd}
                        onChange={(e) => {
                          const nextEnd = e.target.value;
                          const nextEndMinutes = timeToMinutes(nextEnd);
                          const startMinutes = selectedStartMinutes;
                          if (nextEndMinutes === null || startMinutes === null)
                            return;
                          if (
                            nextEndMinutes - startMinutes <
                            minimumDurationMinutes
                          )
                            return;
                          if (
                            !isRangeOpen(
                              startMinutes,
                              nextEndMinutes,
                              selectedDate || currentDate,
                            )
                          )
                            return;
                          setSelectedEnd(nextEnd);
                        }}
                      />
                    </label>
                    <label className="input-group">
                      <span>Location (Eircode)</span>
                      <input value={clientEircode} readOnly />
                    </label>
                    <label className="input-group full">
                      <span>Description</span>
                      <textarea
                        rows={6}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Booking notes"
                      />
                    </label>
                  </div>
                )}

                {composerTab === "pets" && (
                  <div className="stack">
                    <div className="pets-header-row">
                      <h4>Saved pets</h4>
                      <p className="muted subtle">
                        {selectedPetCount} pet{selectedPetCount === 1 ? "" : "s"} selected
                      </p>
                    </div>
                    {petsLoading ? (
                      <p className="muted">Loading pets...</p>
                    ) : savedPets.length ? (
                      <div className="pets-card-grid">
                        {savedPets.map((pet) => {
                          const isSelected = selectedPetIds.includes(pet.id);
                          return (
                            <button
                              key={pet.id}
                              type="button"
                              className={`pet-card ${isSelected ? "selected" : ""}`}
                              onClick={() => {
                                setSelectedPetIds((prev) => {
                                  const next = prev.includes(pet.id)
                                    ? prev.filter((id) => id !== pet.id)
                                    : [...prev, pet.id];
                                  const selectedNames = savedPets
                                    .filter((candidate) => next.includes(candidate.id))
                                    .map((candidate) => candidate.name)
                                    .filter(Boolean)
                                    .join(", ");
                                  if (selectedNames) {
                                    setPetNames(selectedNames);
                                  }
                                  return next;
                                });
                              }}
                              aria-pressed={isSelected}
                            >
                              <strong>{pet.name || "Your dog"}</strong>
                              <p className="muted subtle">
                                {pet.breed || "Breed not set"}
                              </p>
                              {isSelected && <span className="pet-card-badge">Selected</span>}
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="muted">
                        No pets yet. Create one below.
                      </p>
                    )}
                    <label className="input-group full">
                      <span>Dog name(s)</span>
                      <input
                        value={petNames}
                        onChange={(e) => setPetNames(e.target.value)}
                        placeholder="Compass, Luna"
                      />
                    </label>
                    <div className="new-pet-inline">
                      <h5>Create new pet</h5>
                      <div className="grid-2">
                        <label className="input-group">
                          <span>Name</span>
                          <input
                            value={newPetName}
                            onChange={(e) => setNewPetName(e.target.value)}
                            placeholder="Milo"
                          />
                        </label>
                        <label className="input-group">
                          <span>Breed</span>
                          <input
                            value={newPetBreed}
                            onChange={(e) => setNewPetBreed(e.target.value)}
                            placeholder="Labrador"
                          />
                        </label>
                        <label className="input-group full">
                          <span>Notes</span>
                          <textarea
                            rows={3}
                            value={newPetNotes}
                            onChange={(e) => setNewPetNotes(e.target.value)}
                            placeholder="Anything we should know?"
                          />
                        </label>
                      </div>
                      <div className="actions-row">
                        <button
                          type="button"
                          className="button"
                          onClick={savePetInline}
                          disabled={savingPet || !newPetName.trim()}
                        >
                          {savingPet ? "Saving..." : "Save pet"}
                        </button>
                      </div>
                      {petFormMessage && (
                        <p className="muted subtle">{petFormMessage}</p>
                      )}
                    </div>
                  </div>
                )}

                {composerTab === "additional" && (
                  <div className="stack">
                    {addonsLoading ? (
                      <p className="muted">Loading add-ons...</p>
                    ) : (
                      availableAddons.map((addon) => {
                        const addonKey = addon.value || addon.id;
                        return (
                          <label
                            className={`checkbox-row addon-row ${
                              additionalCare.includes(addonKey) ? "checked" : ""
                            }`}
                            key={addonKey}
                          >
                            <input
                              type="checkbox"
                              checked={additionalCare.includes(addonKey)}
                              onChange={(event) => {
                                setAdditionalCare((prev) =>
                                  event.target.checked
                                    ? [...prev, addonKey]
                                    : prev.filter((it) => it !== addonKey),
                                );
                              }}
                            />
                            <span>
                              <strong>{addon.label}</strong>
                              {addon.description && (
                                <small className="muted subtle addon-desc">
                                  {addon.description}
                                </small>
                              )}
                            </span>
                            <em>
                              {Number(addon.price || 0) > 0
                                ? formatCurrency(addon.price)
                                : "Included"}
                            </em>
                          </label>
                        );
                      })
                    )}
                  </div>
                )}

                {composerTab === "confirm" && (
                  <div className="stack premium-summary">
                    <h4>{bookingTitle}</h4>
                    <p className="muted">
                      {formatDisplayDate(selectedDate)} · {selectedStart} -{" "}
                      {selectedEnd}
                    </p>
                    <p className="muted">
                      Location: {clientEircode || "Missing Eircode"}
                    </p>
                    <div className="cost-breakdown">
                      <div>
                        <span>
                          Service ({selectedDurationMinutes} min × {selectedPetCount} pet
                          {selectedPetCount === 1 ? "" : "s"})
                        </span>
                        <strong>{formatCurrency(servicePrice)}</strong>
                      </div>
                      {selectedPetCount > 1 && (
                        <div>
                          <span>Multi-pet discount (50% from 2nd pet)</span>
                          <strong>× {petPriceMultiplier.toFixed(2)}</strong>
                        </div>
                      )}
                      <div>
                        <span>Add-ons</span>
                        <strong>{formatCurrency(addonsPrice)}</strong>
                      </div>
                      <div className="grand-total">
                        <span>Total</span>
                        <strong>{formatCurrency(totalPrice)}</strong>
                      </div>
                    </div>
                    {selectedAddonDetails.length > 0 && (
                      <p className="muted subtle">
                        {selectedAddonDetails
                          .map((addon) => addon.label)
                          .join(", ")}
                      </p>
                    )}
                    <button
                      type="button"
                      className="button"
                      disabled={submitting}
                      onClick={submitBooking}
                    >
                      {submitting
                        ? "Submitting..."
                        : `Submit booking · ${formatCurrency(totalPrice)}`}
                    </button>
                    {submitMessage && (
                      <p className="muted subtle">{submitMessage}</p>
                    )}
                  </div>
                )}
              </div>

              <aside className="composer-rail">
                <h5>Day calendar</h5>
                <p className="muted subtle">
                  Outlook-like event cards: green=open, blue=busy, amber=travel buffer.
                  Drag purple handles to change duration.
                </p>
                <div className="rail-grid-wrapper">
                  <div
                    className="rail-grid outlook-day"
                    id="booking-day-rail-grid"
                  >
                    <div className="planner-grid-lines">
                      {currentDaySlots.map((slot) => (
                        <div
                          key={`rail-line-${slot.time}`}
                          className="planner-line"
                        />
                      ))}
                    </div>
                    {dayBlocks(currentDate).map((block) => {
                      const startMinutes = timeToMinutes(block.start) || 0;
                      const endMinutes = timeToMinutes(block.end) || 0;
                      const top =
                        ((startMinutes - SLOT_START_HOUR * 60) /
                          (maxDayMinutes - SLOT_START_HOUR * 60)) *
                        100;
                      const height =
                        ((endMinutes - startMinutes) /
                          (maxDayMinutes - SLOT_START_HOUR * 60)) *
                        100;

                      return (
                        <button
                          key={`rail-${block.start}-${block.end}-${block.state}`}
                          type="button"
                          className={`outlook-slot ${block.state}`}
                          style={{ top: `${top}%`, height: `${height}%` }}
                          disabled={block.state !== "open"}
                          onClick={() => pickSlot(currentDate, block.start)}
                        >
                          <span className="event-meta">
                            {block.start} - {block.end}
                          </span>
                          <strong className="event-title">
                            {block.state === "open"
                              ? service?.name || "Booking"
                              : block.state === "travel"
                                ? "Travel buffer"
                                : "Busy"}
                          </strong>
                        </button>
                      );
                    })}
                    {selectedStartMinutes !== null &&
                      selectedEndMinutes !== null && (
                        <div
                          className="selection-overlay"
                          style={{
                            top: `${selectionTopPercent}%`,
                            height: `${selectionHeightPercent}%`,
                          }}
                          onPointerDown={(event) => {
                            if (event.target.closest(".drag-handle")) return;
                            event.preventDefault();
                            setDragHandle("move");
                          }}
                        >
                          <div className="selection-label">
                            {selectedStart} - {selectedEnd}
                          </div>
                          <button
                            type="button"
                            className="drag-handle top"
                            onPointerDown={(event) => {
                              event.preventDefault();
                              event.stopPropagation();
                              event.currentTarget.setPointerCapture?.(event.pointerId);
                              setDragHandle("start");
                            }}
                            aria-label="Adjust start"
                          >
                            •
                          </button>
                          <button
                            type="button"
                            className="drag-handle bottom"
                            onPointerDown={(event) => {
                              event.preventDefault();
                              event.stopPropagation();
                              event.currentTarget.setPointerCapture?.(event.pointerId);
                              setDragHandle("end");
                            }}
                            aria-label="Adjust end"
                          >
                            •
                          </button>
                        </div>
                      )}
                  </div>
                </div>
              </aside>
            </div>
          </section>
        )}
      </div>

      <style jsx global>{`
        .booking-overlay {
          position: fixed;
          inset: 0;
          background: rgba(8, 5, 20, 0.82);
          z-index: 9999;
          padding: 24px;
          overflow: auto;
        }
        .booking-shell {
          max-width: 1240px;
          margin: 0 auto;
          background: linear-gradient(145deg, #1a1132, #1f0f3a);
          border-radius: 18px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #f3eefe;
          box-shadow: 0 30px 70px rgba(0, 0, 0, 0.45);
        }
        .booking-shell__header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 20px 24px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }
        .booking-shell__header h3 {
          margin: 6px 0;
        }
        .eyebrow {
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          opacity: 0.8;
          margin: 0;
        }
        .card {
          padding: 18px 24px 24px;
          display: grid;
          gap: 14px;
        }
        .muted {
          color: #c8bddf;
          margin: 0;
        }
        .muted.subtle {
          font-size: 13px;
        }
        .grid-2 {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
        }
        .input-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
          font-weight: 600;
        }
        .input-group input,
        .input-group textarea {
          background: rgba(0, 0, 0, 0.18);
          color: #f8f3ff;
          border: 1px solid rgba(255, 255, 255, 0.18);
          border-radius: 10px;
          padding: 10px 12px;
        }
        .input-group textarea {
          resize: vertical;
        }
        .input-group.full {
          grid-column: 1 / -1;
        }
        .actions-row {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
        }
        .button {
          border: none;
          border-radius: 12px;
          padding: 10px 14px;
          background: linear-gradient(145deg, #6e4bd8, #7c5df2);
          color: #fff;
          font-weight: 700;
          cursor: pointer;
        }
        .button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .ghost-button {
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 12px;
          background: transparent;
          color: #f3eefe;
          padding: 9px 12px;
          cursor: pointer;
        }
        .ghost-button.tiny {
          font-size: 12px;
          padding: 7px 10px;
        }
        .ghost-button.is-active {
          background: rgba(124, 93, 242, 0.3);
          border-color: rgba(124, 93, 242, 0.75);
        }
        .close-button {
          border: 1px solid rgba(255, 255, 255, 0.2);
          background: rgba(255, 255, 255, 0.08);
          color: #fff;
          width: 36px;
          height: 36px;
          border-radius: 999px;
          font-size: 22px;
          cursor: pointer;
        }
        .calendar-topbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }
        .toggle-group {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .planner-nav {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .planner-table {
          display: grid;
          gap: 0;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.16);
          border-radius: 8px;
          background: #222326;
        }
        .planner-header {
          display: grid;
          grid-template-columns: 72px repeat(
              var(--planner-cols, 7),
              minmax(110px, 1fr)
            );
          gap: 0;
          align-items: stretch;
          border-bottom: 1px solid rgba(255, 255, 255, 0.16);
          background: #2a2b2f;
        }
        .planner-body-wrapper {
          max-height: ${CALENDAR_SCROLL_HEIGHT}px;
          overflow-y: auto;
          overflow-x: hidden;
        }
        .planner-body {
          display: grid;
          grid-template-columns: 72px repeat(
              var(--planner-cols, 7),
              minmax(110px, 1fr)
            );
          gap: 0;
          min-height: calc(var(--planner-scroll-height, 520px) * 1.6);
          background: #1f2023;
        }
        .planner-time-column {
          display: grid;
          grid-template-rows: repeat(12, 1fr);
          align-items: start;
          border-right: 1px solid rgba(255, 255, 255, 0.15);
          padding-top: 6px;
          background: #2a2b2f;
        }
        .planner-day {
          border: 0;
          border-left: 1px solid rgba(255, 255, 255, 0.12);
          background: transparent;
          color: #f5f5f5;
          border-radius: 0;
          padding: 10px 10px 8px;
          text-align: left;
          display: grid;
          justify-items: start;
          align-content: center;
          gap: 2px;
        }
        .planner-day-number {
          font-size: 30px;
          line-height: 1;
          color: #b88bff;
          font-weight: 500;
        }
        .planner-day-week,
        .planner-day-month {
          font-size: 13px;
          color: #d8d8da;
        }
        .planner-day.active {
          box-shadow: inset 0 2px 0 #b88bff;
          background: rgba(184, 139, 255, 0.08);
        }
        .planner-time {
          text-align: right;
          color: #aeb0b5;
          font-size: 12px;
          padding-right: 8px;
        }
        .planner-column {
          position: relative;
          border-left: 1px solid rgba(255, 255, 255, 0.12);
          background: #1f2023;
          min-height: 620px;
        }
        .planner-grid-lines {
          position: absolute;
          inset: 0;
          display: grid;
          grid-template-rows: repeat(24, 1fr);
          pointer-events: none;
        }
        .planner-line {
          border-top: 1px dashed rgba(255, 255, 255, 0.11);
        }
        .planner-line:nth-child(2n) {
          border-top-style: solid;
          border-top-color: rgba(255, 255, 255, 0.18);
        }
        .planner-block {
          position: absolute;
          left: 4px;
          right: 4px;
          border-radius: 3px;
          padding: 5px 7px;
          font-size: 12px;
          font-weight: 600;
          color: #f4f6f8;
          z-index: 2;
          display: grid;
          gap: 2px;
          align-content: start;
          text-align: left;
        }
        .event-meta {
          font-size: 10px;
          opacity: 0.9;
          line-height: 1.2;
        }
        .event-title {
          font-size: 12px;
          line-height: 1.2;
          font-weight: 700;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .planner-block.open {
          background: rgba(0, 95, 0, 0.9);
          border: 1px solid rgba(80, 191, 80, 0.65);
          cursor: pointer;
        }
        .planner-block.booked {
          background: rgba(0, 62, 109, 0.88);
          border: 1px solid rgba(54, 138, 196, 0.68);
        }
        .planner-block.travel {
          background: rgba(80, 58, 0, 0.9);
          border: 1px solid rgba(184, 144, 54, 0.7);
          color: #f7efd8;
        }
        .planner-block.held,
        .outlook-slot.held {
          background: rgba(94, 63, 188, 0.82);
          border-color: rgba(194, 171, 255, 0.92);
          color: #f7f1ff;
          cursor: not-allowed;
        }
        .planner-selected {
          position: absolute;
          left: 8px;
          right: 8px;
          border: 1px solid rgba(188, 151, 255, 0.95);
          background: rgba(120, 88, 224, 0.82);
          border-radius: 4px;
          font-size: 11px;
          padding: 3px 6px;
          font-weight: 700;
          z-index: 3;
        }

        .month-grid {
          display: grid;
          grid-template-columns: repeat(7, minmax(90px, 1fr));
          gap: 8px;
        }
        .month-cell {
          text-align: left;
          border: 1px solid rgba(255, 255, 255, 0.14);
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.04);
          color: #f2ecff;
          padding: 10px;
          display: grid;
          gap: 6px;
        }
        .month-cell.active {
          border-color: rgba(124, 93, 242, 0.8);
          background: rgba(124, 93, 242, 0.26);
        }

        .composer-shell {
          gap: 12px;
        }
        .composer-toolbar {
          display: flex;
          justify-content: space-between;
          gap: 8px;
          flex-wrap: wrap;
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 12px;
          padding: 10px;
        }
        .toolbar-meta {
          display: flex;
          gap: 10px;
          align-items: center;
        }
        .price-pill {
          border: 1px solid rgba(171, 130, 255, 0.8);
          background: rgba(124, 93, 242, 0.2);
          color: #e8dcff;
          border-radius: 999px;
          padding: 6px 10px;
          font-size: 12px;
          font-weight: 700;
        }
        .composer-layout {
          display: grid;
          grid-template-columns: minmax(0, 1.6fr) minmax(280px, 1fr);
          gap: 14px;
        }
        .composer-main,
        .composer-rail {
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 12px;
          padding: 12px;
          background: rgba(255, 255, 255, 0.04);
        }
        .stack {
          display: grid;
          gap: 10px;
        }
        .pets-header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
        }
        .pets-card-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 10px;
        }
        .pet-card {
          border: 1px solid rgba(171, 130, 255, 0.45);
          border-radius: 12px;
          padding: 10px;
          background: rgba(90, 62, 170, 0.18);
          color: inherit;
          text-align: left;
          display: grid;
          gap: 4px;
        }
        button.pet-card {
          width: 100%;
          cursor: pointer;
        }
        .pet-card.selected {
          border-color: #b88bff;
          background: rgba(124, 93, 242, 0.35);
          box-shadow: inset 0 0 0 1px rgba(217, 197, 255, 0.55);
        }
        .pet-card-badge {
          justify-self: start;
          background: #7c5df2;
          color: #fff;
          border-radius: 999px;
          font-size: 11px;
          padding: 2px 8px;
        }
        .checkbox-row {
          display: flex;
          gap: 10px;
          align-items: center;
        }
        .checkbox-row input[type="checkbox"] {
          accent-color: #8c61ff;
          width: 18px;
          height: 18px;
        }
        .addon-row.checked {
          border-color: rgba(140, 97, 255, 0.8);
          background: rgba(124, 93, 242, 0.22);
        }
        .new-pet-inline {
          border: 1px solid rgba(171, 130, 255, 0.4);
          border-radius: 12px;
          padding: 12px;
          background: rgba(87, 58, 160, 0.12);
        }
        .new-pet-inline h5 {
          margin: 0 0 8px;
        }
        .rail-grid-wrapper {
          max-height: ${CALENDAR_SCROLL_HEIGHT}px;
          overflow-y: auto;
          overflow-x: hidden;
        }
        .rail-grid {
          position: relative;
          min-height: calc(${CALENDAR_SCROLL_HEIGHT}px * 1.6);
          border-left: 1px solid rgba(255, 255, 255, 0.18);
          border-right: 1px solid rgba(255, 255, 255, 0.1);
        }
        .outlook-slot {
          position: absolute;
          left: 6px;
          right: 6px;
          border: 1px solid rgba(255, 255, 255, 0.24);
          border-radius: 3px;
          min-height: 26px;
          background: rgba(0, 62, 109, 0.88);
          color: #f4f6f8;
          padding: 5px 8px;
          display: grid;
          gap: 2px;
          align-content: start;
          font-weight: 600;
          text-align: left;
          z-index: 2;
        }
        .outlook-slot.open {
          border-color: rgba(80, 191, 80, 0.65);
          background: rgba(0, 95, 0, 0.9);
          cursor: pointer;
        }
        .outlook-slot.booked {
          background: rgba(0, 62, 109, 0.88);
          border-color: rgba(54, 138, 196, 0.68);
          color: #f4f6f8;
          cursor: not-allowed;
        }
        .outlook-slot.travel {
          background: rgba(80, 58, 0, 0.9);
          border-color: rgba(184, 144, 54, 0.7);
          color: #f7efd8;
          cursor: not-allowed;
        }
        .selection-overlay {
          position: absolute;
          left: 4px;
          right: 4px;
          border-radius: 10px;
          border: 1px solid rgba(124, 93, 242, 0.95);
          background: rgba(112, 84, 232, 0.7);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
          min-height: 32px;
          z-index: 4;
          pointer-events: auto;
          cursor: grab;
          touch-action: none;
          user-select: none;
        }
        .selection-label {
          position: absolute;
          left: 12px;
          top: 8px;
          font-size: 12px;
          font-weight: 700;
          color: #fff;
        }
        .selection-overlay:active {
          cursor: grabbing;
        }
        .drag-handle {
          position: absolute;
          width: 18px;
          height: 18px;
          border-radius: 999px;
          border: 2px solid #130a29;
          background: #bfa9ff;
          left: 50%;
          transform: translateX(-50%);
          cursor: ns-resize;
          pointer-events: auto;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: 700;
          color: #2a145c;
          padding: 0;
          touch-action: none;
          user-select: none;
        }
        .drag-handle.top {
          top: -8px;
        }
        .drag-handle.bottom {
          bottom: -8px;
        }

        .addon-row {
          justify-content: space-between;
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 10px;
          padding: 8px 10px;
          transition: background 0.2s ease, border-color 0.2s ease;
        }
        .addon-row span {
          display: grid;
        }
        .addon-desc {
          display: block;
        }
        .premium-summary {
          border: 1px solid rgba(171, 130, 255, 0.4);
          border-radius: 14px;
          padding: 14px;
          background: radial-gradient(
            circle at top right,
            rgba(145, 103, 255, 0.24),
            rgba(20, 13, 38, 0.7)
          );
        }
        .cost-breakdown {
          display: grid;
          gap: 8px;
        }
        .cost-breakdown > div {
          display: flex;
          justify-content: space-between;
        }
        .cost-breakdown .grand-total {
          border-top: 1px solid rgba(255, 255, 255, 0.2);
          padding-top: 8px;
          font-size: 16px;
        }
        .planner-body-wrapper,
        .rail-grid-wrapper {
          scrollbar-color: #7c5df2 rgba(255, 255, 255, 0.08);
          scrollbar-width: thin;
        }
        .planner-body-wrapper::-webkit-scrollbar,
        .rail-grid-wrapper::-webkit-scrollbar {
          width: 10px;
        }
        .planner-body-wrapper::-webkit-scrollbar-track,
        .rail-grid-wrapper::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.08);
          border-radius: 999px;
        }
        .planner-body-wrapper::-webkit-scrollbar-thumb,
        .rail-grid-wrapper::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #8d6aff, #5e3fc9);
          border-radius: 999px;
        }
        @media (max-width: 1024px) {
          .grid-2 {
            grid-template-columns: 1fr;
          }
          .composer-layout {
            grid-template-columns: 1fr;
          }
          .planner-header,
          .planner-body {
            grid-template-columns: 64px repeat(
                var(--planner-cols, 7),
                minmax(95px, 1fr)
              );
          }
        }
      `}</style>
    </div>
  );
};

export default BookingModal;
