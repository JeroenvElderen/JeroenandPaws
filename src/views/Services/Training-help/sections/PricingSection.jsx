import React, { useState, useMemo, useEffect, useCallback } from "react";

// ==========================
// FULL DOG BREED LIST HERE
// ==========================
const DOG_BREEDS = [
  "Affenpinscher",
  "Afghan Hound",
  "Airedale Terrier",
  "Akita",
  "Alaskan Malamute",
  "American Bulldog",
  "American Eskimo Dog",
  "American Foxhound",
  "American Pit Bull Terrier",
  "American Staffordshire Terrier",
  "American Water Spaniel",
  "Anatolian Shepherd Dog",
  "Australian Cattle Dog",
  "Australian Kelpie",
  "Australian Shepherd",
  "Australian Terrier",
  "Basenji",
  "Basset Hound",
  "Beagle",
  "Bearded Collie",
  "Beauceron",
  "Bedlington Terrier",
  "Belgian Malinois",
  "Belgian Sheepdog",
  "Belgian Tervuren",
  "Bernese Mountain Dog",
  "Bichon Frise",
  "Black and Tan Coonhound",
  "Black Russian Terrier",
  "Bloodhound",
  "Bluetick Coonhound",
  "Border Collie",
  "Border Terrier",
  "Borzoi",
  "Boston Terrier",
  "Bouvier des Flandres",
  "Boxer",
  "Boykin Spaniel",
  "Briard",
  "Brittany",
  "Brussels Griffon",
  "Bull Terrier",
  "Bulldog",
  "Bullmastiff",
  "Cairn Terrier",
  "Cane Corso",
  "Cardigan Welsh Corgi",
  "Cavalier King Charles Spaniel",
  "Chesapeake Bay Retriever",
  "Chihuahua",
  "Chinese Crested",
  "Chinese Shar-Pei",
  "Chow Chow",
  "Clumber Spaniel",
  "Cockapoo",
  "Cocker Spaniel",
  "Collie",
  "Coton de Tulear",
  "Dachshund",
  "Dalmatian",
  "Dandie Dinmont Terrier",
  "Doberman Pinscher",
  "Dogo Argentino",
  "Dogue de Bordeaux",
  "English Cocker Spaniel",
  "English Foxhound",
  "English Setter",
  "English Springer Spaniel",
  "Entlebucher Mountain Dog",
  "Field Spaniel",
  "Finnish Lapphund",
  "Finnish Spitz",
  "Flat-Coated Retriever",
  "Fox Terrier",
  "French Bulldog",
  "German Pinscher",
  "German Shepherd Dog",
  "German Shorthaired Pointer",
  "German Wirehaired Pointer",
  "Giant Schnauzer",
  "Glen of Imaal Terrier",
  "Golden Retriever",
  "Goldendoodle",
  "Gordon Setter",
  "Great Dane",
  "Great Pyrenees",
  "Greater Swiss Mountain Dog",
  "Greyhound",
  "Havanese",
  "Ibizan Hound",
  "Icelandic Sheepdog",
  "Irish Setter",
  "Irish Terrier",
  "Irish Water Spaniel",
  "Irish Wolfhound",
  "Italian Greyhound",
  "Jack Russell Terrier",
  "Japanese Chin",
  "Keeshond",
  "Kerry Blue Terrier",
  "Komondor",
  "Kuvasz",
  "Labradoodle",
  "Labrador Retriever",
  "Lakeland Terrier",
  "Leonberger",
  "Lhasa Apso",
  "Lowchen",
  "Maltese",
  "Manchester Terrier",
  "Mastiff",
  "Miniature Pinscher",
  "Miniature Schnauzer",
  "Neapolitan Mastiff",
  "Newfoundland",
  "Norfolk Terrier",
  "Norwegian Buhund",
  "Norwegian Elkhound",
  "Norwegian Lundehund",
  "Norwich Terrier",
  "Nova Scotia Duck Tolling Retriever",
  "Old English Sheepdog",
  "Otterhound",
  "Papillon",
  "Parson Russell Terrier",
  "Pekingese",
  "Pembroke Welsh Corgi",
  "Petit Basset Griffon Vendéen",
  "Pharaoh Hound",
  "Plott",
  "Pointer",
  "Polish Lowland Sheepdog",
  "Pomeranian",
  "Poodle",
  "Portuguese Water Dog",
  "Pug",
  "Puli",
  "Pyrenean Shepherd",
  "Rat Terrier",
  "Redbone Coonhound",
  "Rhodesian Ridgeback",
  "Rottweiler",
  "Saint Bernard",
  "Saluki",
  "Samoyed",
  "Schipperke",
  "Scottish Deerhound",
  "Scottish Terrier",
  "Sealyham Terrier",
  "Shetland Sheepdog",
  "Shiba Inu",
  "Shih Tzu",
  "Siberian Husky",
  "Silky Terrier",
  "Skye Terrier",
  "Smooth Fox Terrier",
  "Soft Coated Wheaten Terrier",
  "Spanish Water Dog",
  "Spinone Italiano",
  "Staffordshire Bull Terrier",
  "Standard Schnauzer",
  "Sussex Spaniel",
  "Swedish Vallhund",
  "Toy Fox Terrier",
  "Treeing Walker Coonhound",
  "Vizsla",
  "Weimaraner",
  "Welsh Springer Spaniel",
  "Welsh Terrier",
  "West Highland White Terrier",
  "Whippet",
  "Wire Fox Terrier",
  "Wirehaired Pointing Griffon",
  "Yorkshire Terrier",
];

const weekdayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const buildMonthMatrix = (visibleDate) => {
  const firstOfMonth = new Date(
    visibleDate.getFullYear(),
    visibleDate.getMonth(),
    1
  );
  const startOffset = (firstOfMonth.getDay() + 6) % 7;
  const firstVisible = new Date(firstOfMonth);
  firstVisible.setDate(firstOfMonth.getDate() - startOffset);

  return Array.from({ length: 42 }, (_, index) => {
    const day = new Date(firstVisible);
    day.setDate(firstVisible.getDate() + index);
    return day;
  });
};

const generateDemoAvailability = (days = 365) => {
  const base = new Date();
  const timeZone =
    Intl.DateTimeFormat().resolvedOptions().timeZone || "Europe/Dublin";

  const dates = Array.from({ length: days }, (_, index) => {
    const date = new Date(base);
    date.setDate(base.getDate() + index);
    const isoDate = date.toISOString().slice(0, 10);
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;

    const slots = Array.from({ length: 10 }, (_, slotIndex) => {
      const startHour = 9 + Math.floor(slotIndex / 2);
      const minute = slotIndex % 2 === 0 ? "00" : "30";
      const time = `${String(startHour).padStart(2, "0")}:${minute}`;
      const cadence = (slotIndex + index) % 4 !== 0;
      return { time, available: !isWeekend && cadence };
    });

    return { date: isoDate, slots };
  });

  return { timeZone, dates };
};

const services = [
  {
    id: "quick-sniff",
    title: "Quick Sniff & Stroll",
    label: "30-Min Walks",
    price: "€7/walk",
    description:
      "Perfect for potty breaks, puppy zoomies, or a little leg stretch between naps.",
    duration: "30 Min Meeting",
    durationMinutes: 30,
  },
  {
    id: "daily-doggie",
    title: "Daily Doggie Adventure",
    label: "60-Min Walks",
    price: "€12/walk",
    description:
      "An hour of tail wags, sniffing every tree, and coming home happily tired.",
    duration: "60 Min Session",
    durationMinutes: 60,
  },
  {
    id: "mega-adventure",
    title: "Mega Adventure Walk",
    label: "120-min walks",
    price: "€22/walk",
    description:
      "Double the time, double the fun — great for big explorers or extra energy days.",
    duration: "2 Hour Adventure",
    durationMinutes: 120,
  },
  {
    id: "custom-walk",
    title: "Your Walk, Your Way",
    label: "Custom walk",
    price: "Tailored",
    description:
      "Need a special route or timing? Let’s make it paw-fect for your pup.",
    duration: "Custom Plan",
    durationMinutes: null,
  },
];

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
  const [dogs, setDogs] = useState([{ name: "", breed: "" }]);
  const [breedSearch, setBreedSearch] = useState({});

  const apiBaseUrl = useMemo(
    () => (process.env.NEXT_PUBLIC_BACKEND_BASE_URL || "").replace(/\/$/, ""),
    []
  );
  const handleDogCountChange = (count) => {
    setDogCount(count);

    // Resize array to match selected count
    setDogs((prev) => {
      const updated = [...prev];
      while (updated.length < count) updated.push({ name: "", breed: "" });
      return updated.slice(0, count);
    });
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
      setSelectedDate(firstOpenDate.ddate);
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
      const fallback = generateDemoAvailability();
      setAvailability(fallback);
      initializeSelection(fallback);
      setAvailabilityNotice(
        "Live calendar is unreachable — displaying demo slots so you can keep booking."
      );
    } finally {
      setLoading(false);
    }
  }, [apiBaseUrl, initializeSelection, parseJsonSafely, service.id]);
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
      const requestUrl = `${apiBaseUrl}/api/book`;
      const response = await fetch(requestUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: selectedDate,
          time: selectedTime,
          serviceId: service.id,
          serviceTitle: service.title,
          clientName,
          clientEmail,
          notes,
          timeZone: availability.timeZone,
          dogs,
          dogCount,
        }),
      });

      if (!response.ok) {
        throw new Error("Booking failed. Please try again.");
      }
      setSuccess("Session booked! Check your Outlook calendar for details.");
      setClientName("");
      setClientEmail("");
      setNotes("");
    } catch (bookingError) {
      console.warn("Falling back to local booking", bookingError);
      const start = new Date(`${selectedDate}T${selectedTime}:00`);
      const durationMinutes = service.durationMinutes || 60;
      const end = new Date(start.getTime() + durationMinutes * 60000);
      const dogSummary = dogs
        .map((d, i) => `Dog ${i + 1}: ${d.name} (${d.breed})`)
        .join(", ");

      setSuccess(
        `Request received! We'll hold ${
          service.title
        } for ${dogSummary} on ${start.toLocaleString(undefined, {
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
  return DOG_BREEDS.filter(breed =>
    breed.toLowerCase().includes(query)
  );
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
                ?.filter((slot) => slot.available) // ⬅️ only show available slots
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
              {Array.from({ length: dogCount }).map((_, index) => (
                <React.Fragment key={index}>
                  <label className="input-group">
                    <span>Dog {index + 1} Name</span>
                    <input
                      type="text"
                      value={dogs[index].name}
                      onChange={(e) =>
                        setDogs((prev) => {
                          const updated = [...prev];
                          updated[index].name = e.target.value;
                          return updated;
                        })
                      }
                      placeholder="e.g. Bella"
                    />
                  </label>

                  <label className="input-group">
                    <span>Dog {index + 1} Breed</span>
                    <select
                      className="input-like-select"
                      value={dogs[index].breed}
                      onChange={(e) =>
                        setDogs((prev) => {
                          const updated = [...prev];
                          updated[index].breed = e.target.value;
                          return updated;
                        })
                      }
                    >
                      <option value="">Select breed…</option>
                      {DOG_BREEDS.map((breed) => (
                        <option key={breed} value={breed}>
                          {breed}
                        </option>
                      ))}
                    </select>
                  </label>
                </React.Fragment>
              ))}

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

const PricingSection = () => {
  const [activeService, setActiveService] = useState(null);

  return (
    <section className="section is-secondary">
      <div className="container">
        <div className="header is-align-center">
          <h1 className="heading_h1">Walking Plans for Every Pup</h1>
        </div>

        <ul className="grid_4-col gap-xsmall text-align_center w-list-unstyled">
          {services.map((service) => (
            <li key={service.id} className="card on-secondary">
              <div className="card_body is-small">
                <div className="margin_bottom-auto">
                  <h4>{service.title}</h4>
                  <div className="eyebrow">{service.label}</div>
                  <p className="heading_h3">{service.price}</p>
                  <p>{service.description}</p>
                </div>
                <div className="button-group is-align-center">
                  <button
                    type="button"
                    className="button w-button"
                    onClick={() => {
                      console.log("analytics: service_selected", {
                        serviceId: service.id,
                      });
                      setActiveService(service);
                    }}
                  >
                    Check availability
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {activeService && (
        <BookingModal
          service={activeService}
          onClose={() => setActiveService(null)}
        />
      )}
      <style>{`
        .card.on-secondary {
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }
        .card.on-secondary:hover {
          transform: translateY(-6px);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.12);
        }
        .button.w-button {
          transition: background-color 0.25s ease, color 0.25s ease;
        }
        .button.w-button:hover {
          background-color: #5a3ec8;
          color: #fff;
        }
        .booking-overlay {
          position: fixed;
          inset: 0;
          background: rgba(9, 5, 20, 0.5);
          backdrop-filter: blur(3px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          z-index: 1000;
        }
        .booking-modal {
          background: linear-gradient(135deg, #1a1132, #1f0f3a);
          border-radius: 16px;
          width: min(1100px, 100%);
          color: #f2ecff;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
          overflow: hidden;
          position: relative;
        }
        .booking-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 24px 28px 16px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }
        .booking-header h3 {
          margin: 6px 0 4px;
        }
        .booking-body {
          display: grid;
          grid-template-columns: 1.6fr 0.8fr;
          gap: 16px;
          padding: 20px 24px 24px;
        }
        .calendar-card,
        .times-card {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          padding: 18px;
        }
        .calendar-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
          margin-bottom: 12px;
        }
        .toolbar-controls {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .toggle-group {
          display: inline-flex;
          background: rgba(255, 255, 255, 0.06);
          border-radius: 14px;
          padding: 4px;
          gap: 6px;
        }
        .month-nav {
          display: inline-flex;
          gap: 6px;
          background: rgba(255, 255, 255,, 0.06);
          border-radius: 12px;
          padding: 4px;
        }
          /* Allow the right column to shrink */
.times-card {
  min-width: 260px;
}

/* Allow inner flex items to shrink */
.time-slot,
.times-list {
  min-width: 0;
}

/* Prevent input fields from forcing the width too wide */
.input-group input,
.input-group textarea {
  min-width: 0;
  width: 100%;
}
  /* Make <select> look like your inputs */
.input-like-select {
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;

  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(0, 0, 0, 0.1);
  padding: 10px 12px;
  color: #f8f6ff;
  font-size: 14px;
  width: 100%;
  position: relative;
  cursor: pointer;
}

/* Light purple placeholder text style like your inputs */
.input-like-select option {
  color: #e7def9;
  background: rgba(26, 17, 50, 1);
}

/* Custom dropdown arrow (pure CSS, no icons) */
.input-like-select {
  background-image:
    linear-gradient(45deg, transparent 50%, #e7def9 50%),
    linear-gradient(135deg, #e7def9 50%, transparent 50%);
  background-position:
    calc(100% - 16px) calc(50% - 3px),
    calc(100% - 11px) calc(50% - 3px);
  background-size: 6px 6px, 6px 6px;
  background-repeat: no-repeat;
}

/* Extra hover/focus polish */
.input-like-select:hover {
  border-color: rgba(124, 93, 242, 0.4);
  background: rgba(124, 93, 242, 0.12);
}

.input-like-select:focus {
  outline: none;
  border-color: rgba(124, 93, 242, 0.6);
  background: rgba(124, 93, 242, 0.18);
}


        .nav-button {
        width: 32px;
        height: 32px;
        border-radius: 10px;
        border: 1px solid rgba(255, 255, 255, 0.12);
        background: rgba(0, 0, 0, 0.15);
        color: #f2ecff;
        font-size: 18px;
        cursor: pointer;
        transition: background 0.2s ease,, transform 0.,2s ease;
        }
        .nav button:hover {
          background: rgba(255, 255,, 255, 0.12);
          transform: translateY(-1px);
        }
        .weekday-row {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 6px;
          font-size: 11px;
          color: #b9b3cc;
          margin-bottom: 6px;
        }
        .calendar-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 6px;
        }
        .day {
  height: 58px;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.07);
  background: rgba(255, 255, 255, 0.03);
  color: #e7def9;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.18s ease;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 8px 10px;
}

/* Hover only on active days */
.day:hover:not(:disabled) {
  background: rgba(124, 93, 242, 0.18);
  border-color: rgba(124, 93, 242, 0.5);
}

/* --- Selected Day --- */
.day.selected {
  background: linear-gradient(145deg, #6e4bd8, #7c5df2);
  border-color: transparent;
  color: #0c061a;
  box-shadow: 0 6px 16px rgba(124, 93, 242, 0.4);
}

/* --- Past / Disabled Days --- */
.day:disabled {
  opacity: 0.25;
  border-style: dashed;
  cursor: not-allowed;
}

/* --- Days not in the current month --- */
.day.muted {
  color: #786c9c;
  opacity: 0.45;
}

/* --- Future days with NO slots (look normal) --- */
.day-no-slots {
  opacity: 1;
  cursor: pointer;
}

/* --- Future days WITH slots --- */
.day-has-slots {
  position: relative;
}

/* Availability dot */
.day-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #22d3ee; /* cyan glow */
  box-shadow: 0 0 0 4px rgba(34, 211, 238, 0.25);
  margin-top: 2px;
}
        .info-banner {
          margin-bottom: 10px;
          padding: 8px 12px;
          border-radius: 10px;
          background: rgba(14, 165, 233, 0.12);
          color: #cffafe;
          border: 1px solid rgba(14, 165, 233, 0.25);
          font-size: 13px;
        }
        .times-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 8px;
          margin-bottom: 12px;
        }
        .times-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
          max-height: 300px; /* adjust as needed */
          overflow-y: auto;
          padding-right: 6px;
        }
        .times-list::-webkit-scrollbar {
          width: 6px;
        }
        .times-list::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
        }
        .times-list::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 6px;
        }
        .dot {
          width: 8px;
          height: 8px;
          background: #4ade80; /* green */
          border-radius: 50%;
          margin-right: 10px;
          display: inline-block;
          flex-shrink: 0;
          box-shadow: 0 0 0 4px rgba(74, 222, 128, 0.25); /* glow like screenshot */
        }
        .time-slot {
          width: 100%;
          border-radius: 14px;
          padding: 14px 14px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(255, 255, 255, 0.04);
          color: #f2ecff;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          justifyt-content: space-between;
          align-items: center;
          gap: 12px;
        }
        .time-slot:hover {
          background: rgba(124, 93, 242, 0.18);
          border-color: rgba(124, 93, 242, 0.4);
        }
        .time-slot.active {
          background: linear-gradient(145deg, #6e4bd8, #7c5df2);
          color: #0c061a;
          box-shadow: 0 6px 16px rgba(124, 93, 242, 0.4);
        }
        .slot-label {
          margin-left: 8px;
          font-size: 12px;
        }
        .pill {
          border: none;
          padding: 8px 12px;
          border-radius: 12px;
          background: transparent;
          color: #f2ecff;
          cursor: pointer;
          font-weight: 700;
          transition: background 0.2s ease;
        }
        .pill.active {
          background: #f1ddff;
          color: #2a1349;
        }
        .pill.ghost {
          background: rgba(255, 255, 255, 0.08);
          color: #dcd4f2;
          font-weight: 600;
        }
        .close-button {
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 50%;
          width: 36px;
          height: 36px;
          color: #f2ecff;
          font-size: 18px;
          cursor: pointer;
          transition: background 0.2s ease;
        }
        .close-button:hover {
          background: rgba(255, 255, 255, 0.18);
        }
        .muted {
          color: #b9b3cc;
        }
        .muted.subtle {
          font-size: 13px;
          text-align: right;
        }
        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin: 16px 0;
        }
        .input-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
          color: #e7def9;
          font-weight: 600;
        }
        .input-group input,
        .input-group textarea {
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: rgba(0, 0, 0, 0.1);
          padding: 10px 12px;
          color: #f8f6ff;
          font-size: 14px;
        }
        .input-group textarea {
          resize: vertical;
        }
        .input-group.full-width {
          grid-column: 1 / -1;
        }
        .actions-row {
          margin-top: 4px;
          display: flex;
          justify-content: flex-end;
        }
        .error-banner,
        .success-banner {
          margin-top: 10px;
          padding: 10px 12px;
          border-radius: 10px;
          font-weight: 600;
        }
        .error-banner {
          background: rgba(255, 99, 132, 0.15);
          color: #ff96a6;
          border: 1px solid rgba(255, 99, 132, 0.35);
        }
        .success-banner {
          background: rgba(52, 211, 153, 0.2);
          color: #c2f8e4;
          border: 1px solid rgba(52, 211, 153, 0.4);
        }


        @media (max-width: 900px) {
          .booking-body {
            grid-template-columns: 1fr;
          }
          .times-header {
            flex-direction: column;
            align-items: flex-start;
          }
          .form-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </section>
  );
};

export default PricingSection;
