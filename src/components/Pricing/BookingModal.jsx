import React, { useState, useMemo, useEffect, useCallback } from "react";
import SearchableSelect from "./SearchableSelect";
import { DOG_BREEDS, weekdayLabels } from "./constants";
import {
  buildMonthMatrix,
  createEmptyDogProfile,
  generateDemoAvailability,
} from "./utils";

const BookingModal = ({ service, onClose }) => {
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
  const [clientEmail, setClientEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [isBooking, setIsBooking] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(() => new Date());
  const [availabilityNotice, setAvailabilityNotice] = useState("");
  const [dogCount, setDogCount] = useState(1);
  const [dogs, setDogs] = useState([createEmptyDogProfile()]);
  const [breedSearch, setBreedSearch] = useState({});

  const apiBaseUrl = useMemo(
    () => (process.env.NEXT_PUBLIC_BACKEND_BASE_URL || "").replace(/\/$/, ""),
    []
  );
  const handleDogCountChange = (count) => {
    setDogCount(count);

    setDogs((prevDogs) => {
      const newDogs = [...prevDogs];
      while (newDogs.length < count) {
        newDogs.push(createEmptyDogProfile());
      }
      return newDogs.slice(0, count);
    });
  };

  const updateDogField = (index, field, value) => {
    setDogs((prevDogs) => {
      const newDogs = [...prevDogs];
      newDogs[index] = { ...newDogs[index], [field]: value };
      return newDogs;
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
      day.slots.some((slot) => slot.available)
    );
    if (firstOpenDate) {
      setSelectedDate(firstOpenDate.date);
      const firstSlot = firstOpenDate.slots.find((slot) => slot.available);
      setSelectedTime(firstSlot?.time || "");
      setVisibleMonth(new Date(firstOpenDate.date));
    }
  }, []);

  const loadAvailability = useCallback(async () => {
    setLoading(true);
    setError("");
    setSuccess("");
    setAvailabilityNotice("");
    try {
      const requestUrl = `${apiBaseUrl}/api/availability?serviceId=${service.id}`;
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
  }, [apiBaseUrl, initializeSelection, parseJsonSafely, service.durationMinutes, service.id]);
  useEffect(() => {
    loadAvailability();
  }, [loadAvailability]);

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
    if (!selectedDate || !selectedTime) {
      setError("Please pick a date and time.");
      return;
    }
    setIsBooking(true);
    setError("");
    setSuccess("");

    try {
      const start = new Date(`${selectedDate}T${selectedTime}:00`);
      const end = new Date(start.getTime() + (service.durationMinutes || 60) * 60000);
      const dogSummary = dogs
        .slice(0, dogCount)
        .map((dog, index) => `${index + 1}. ${dog.name || "(no name)"} (${dog.breed || "breed unknown"})`)
        .join(" | ");

      console.log(
        "booking_submission",
        {
          serviceId: service.id,
          date: selectedDate,
          startTime: selectedTime,
          endTime: `${end.getHours().toString().padStart(2, "0")}:${end
            .getMinutes()
            .toString()
            .padStart(2, "0")}`,
          clientName,
          clientEmail,
          notes,
          dogs: dogs.slice(0, dogCount),
        }
      );

      setSuccess(
        `Reserved ${service.title} for ${dogSummary} on ${start.toLocaleString(undefined, {
          weekday: "long",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })} – ${end.toLocaleTimeString(undefined, {
          hour: "2-digit",
          minute: "2-digit",
        })}.`
      );

      setAvailabilityNotice(
        "Your booking is saved locally for now — we'll sync it manually once the live calendar is back."
      );
      setClientName("");
      setClientEmail("");
      setNotes("");
      resetDogProfiles();
      setError("");
    } finally {
      setIsBooking(false);
    }
  };

  useEffect(() => {
    if (selectedDate) {
      setVisibleMonth(new Date(selectedDate));
      const day = availabilityMap[selectedDate];
      if (day) {
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
    }
  }, [availabilityMap, selectedDate, selectedTime]);

  const filteredBreeds = (dogIndex) => {
    const query = breedSearch[dogIndex]?.toLowerCase() || "";
    return DOG_BREEDS.filter((breed) => breed.toLowerCase().includes(query));
  };

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
                    const hasOpenSlot = dayData?.slots?.some(
                      (slot) => slot.available
                    );
                    const isSelected = iso === selectedDate;
                    return (
                      <button
                        key={iso}
                        type="button"
                        className={`day ${isSelected ? "selected" : ""} ${
                          isCurrentMonth ? "" : "muted"
                        } ${hasOpenSlot ? "day-has-slots" : "day-no-slots"}`}
                        onClick={() => setSelectedDate(iso)}
                        aria-pressed={isSelected}
                        disabled={dateObj < new Date().setHours(0, 0, 0, 0)}
                      >
                        <span>{dateObj.getDate()}</span>
                        {hasOpenSlot && <span className="day-dot" />}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
            {error && <p className="error-banner">{error}</p>}
            {success && <p className="success-banner">{success}</p>}
          </div>

          <div className="times-card">
            <div className="times-header">
              <div>
                <p className="muted small">{selectedDateLabel}</p>
                <h4>Available slots</h4>
              </div>
              <span className="pill ghost">{service.duration}</span>
            </div>
            <div className="times-list" aria-label="Time options">
              {!selectedDay && (
                <p className="muted">Select a date to see times.</p>
              )}
              {selectedDay?.slots
                ?.filter((slot) => slot.available)
                .map((slot) => {
                  const isActive = selectedTime === slot.time;
                  return (
                    <button
                      key={`${selectedDay.date}-${slot.time}`}
                      type="button"
                      className={`time-slot ${isActive ? "active" : ""}`}
                      onClick={() => setSelectedTime(slot.time)}
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
                selectedDay.slots.every((slot) => !slot.available) && (
                  <p className="muted">All slots are full for this day.</p>
                )}
            </div>
            <div className="form-grid">
              <label className="input-group full-width">
                <span>How many dogs?</span>
                <select
                  value={dogCount}
                  onChange={(e) => handleDogCountChange(Number(e.target.value))}
                  className="input-like-select"
                >
                  <option value={1}>1 dog</option>
                  <option value={2}>2 dogs</option>
                  <option value={3}>3 dogs</option>
                  <option value={4}>4 dogs</option>
                </select>
              </label>
              {Array.from({ length: dogCount }).map((_, index) => {
                const dogProfile = dogs[index] || createEmptyDogProfile();
                return (
                  <React.Fragment key={index}>
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
                      onChange={(value) =>
                        updateDogField(index, "breed", value)
                      }
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
                  </React.Fragment>
                );
              })}

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
                <span>Your email</span>
                <input
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  placeholder="name@email.com"
                />
              </label>
              <label className="input-group full-width">
                <span>Notes for Jeroen</span>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Tell us about your pup or preferences"
                  rows={3}
                />
              </label>
            </div>
            <div className="actions-row">
              <button
                type="button"
                className="button w-button"
                onClick={handleBook}
                disabled={isBooking || loading}
              >
                {isBooking ? "Booking…" : "Confirm / Book"}
              </button>
            </div>
            <p className="muted subtle">Times shown in your timezone</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;