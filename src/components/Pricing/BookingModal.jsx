// ─────────────────────────────────────────────
// FINAL PREMIUM BOOKING MODAL — Production Build
// Replaces your entire old BookingModal.jsx
// ─────────────────────────────────────────────

import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";

// Premium rebuilt components
import CalendarSection from "./components/CalendarSection";
import TimeSection from "./components/TimeSection";
import ClientDrawer from "./components/ClientDrawer";
import PetDrawer from "./components/PetDrawer";
import SummaryDrawer from "./components/SummaryDrawer";
import LoginModal from "./components/LoginModal";

// Helpers
import { weekdayLabels } from "./constants";
import {
  buildMonthMatrix,
  generateDemoAvailability,
} from "./utils";

import {
  computeApiBaseUrl,
  getCachedAvailability,
  prefetchAvailability,
} from "./availabilityCache";

import { useAuth } from "../../context/AuthContext";

// ─────────────────────────────────────────────
// BOOKING MODAL COMPONENT
// ─────────────────────────────────────────────
const BookingModal = ({ service, onClose }) => {
  // Auth
  const { profile, isAuthenticated, setProfile } = useAuth();
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  // ─────────────────────────────────────────────
  // AVAILABILITY
  // ─────────────────────────────────────────────
  const [loading, setLoading] = useState(false);
  const [is24h, setIs24h] = useState(false);

  const [availability, setAvailability] = useState({
    dates: [],
    timeZone: "UTC",
  });

  const [visibleMonth, setVisibleMonth] = useState(() => new Date());
  const [availabilityNotice, setAvailabilityNotice] = useState("");

  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");

  // ─────────────────────────────────────────────
  // CLIENT DATA
  // ─────────────────────────────────────────────
  const [clientDrawerOpen, setClientDrawerOpen] = useState(false);

  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [notes, setNotes] = useState("");

  // ─────────────────────────────────────────────
  // PETS DATA
  // ─────────────────────────────────────────────
  const [petsDrawerOpen, setPetsDrawerOpen] = useState(false);
  const [existingPets, setExistingPets] = useState([]);
  const [selectedSavedPetIds, setSelectedSavedPetIds] = useState([]);
  const [pets, setPets] = useState([]); // final pets

  // ─────────────────────────────────────────────
  // SUMMARY
  // ─────────────────────────────────────────────
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [isBooking, setIsBooking] = useState(false);

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // Refs
  const calendarRef = useRef(null);
  const timeRef = useRef(null);
  const bookingBodyRef = useRef(null);

  const apiBaseUrl = useMemo(() => computeApiBaseUrl(), []);

  // ─────────────────────────────────────────────
  // FORMAT TIME
  // ─────────────────────────────────────────────
  const formatTime = useCallback(
    (slot) => {
      if (is24h) return slot;
      const [h, m] = slot.split(":");
      const hour = Number(h);
      const suffix = hour >= 12 ? "PM" : "AM";
      const adjusted = hour % 12 === 0 ? 12 : hour % 12;
      return `${adjusted}:${m} ${suffix}`;
    },
    [is24h]
  );

  // ─────────────────────────────────────────────
  // LOAD AVAILABILITY
  // ─────────────────────────────────────────────
  const safeJson = async (res) => {
    const txt = await res.text();
    if (!res.ok) throw new Error(txt || "Failed to load data.");
    return txt ? JSON.parse(txt) : {};
  };

  const loadAvailability = useCallback(async () => {
    setLoading(true);

    try {
      // 1. Check cache
      const cached = getCachedAvailability(service.id);
      if (cached) {
        setAvailability(cached);
        setVisibleMonth(new Date(cached.dates[0]?.date || Date.now()));
        return;
      }

      // 2. Fetch fresh
      const data = await prefetchAvailability(service, apiBaseUrl);
      setAvailability(data);
      setVisibleMonth(new Date(data.dates[0]?.date || Date.now()));
    } catch (err) {
      // 3. Fallback demo
      const demo = generateDemoAvailability(service.durationMinutes);
      setAvailability(demo);
      setAvailabilityNotice("Using demo availability.");
    } finally {
      setLoading(false);
    }
  }, [service, apiBaseUrl]);

  useEffect(() => {
    loadAvailability();
  }, [loadAvailability]);

  // ─────────────────────────────────────────────
  // AVAILABILITY MAP
  // ─────────────────────────────────────────────
  const availabilityMap = useMemo(
    () =>
      availability.dates.reduce((map, d) => {
        map[d.date] = d;
        return map;
      }, {}),
    [availability]
  );

  const scrollToTimeSection = useCallback(() => {
    if (!timeRef.current) return;

    // Prefer scrolling inside the booking body to keep the modal centered
    if (bookingBodyRef.current) {
      const offset = timeRef.current.offsetTop - 12;
      bookingBodyRef.current.scrollTo({ top: Math.max(0, offset), behavior: "smooth" });
      return;
    }

    timeRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const getDayAvailabilityStatus = useCallback((day) => {
    const slots = day?.slots || [];
    const availableCount = slots.filter((s) => s.available).length;

    if (!slots.length || availableCount === 0) return "unavailable";
    if (availableCount <= 2) return "limited";
    return "available";
  }, []);

  const isDayAvailable = (day) =>
    getDayAvailabilityStatus(day) !== "unavailable";

  const handleDaySelect = (iso) => {
    const first = availabilityMap[iso]?.slots.find((s) => s.available)?.time;
    setSelectedDate(iso);
    setSelectedTime(first || "");
    scrollToTimeSection();
  };

  const handleTimeSelect = (time) => setSelectedTime(time);

  const selectedDateLabel =
    selectedDate &&
    new Date(selectedDate).toLocaleDateString(undefined, {
      weekday: "long",
      month: "long",
      day: "numeric",
    });

  // ─────────────────────────────────────────────
  // CONTINUE → GO TO CLIENT DRAWER
  // ─────────────────────────────────────────────
  const canContinue = selectedDate && selectedTime;

  const handleContinue = () => {
    if (!canContinue) return;

    // Autofill data if logged in
    if (isAuthenticated && profile?.client) {
      const client = profile.client;

      if (client.full_name || client.name) {
        setClientName(client.full_name || client.name);
      }

      if (client.email) setClientEmail(client.email);

      if (client.phone_number || client.phone) {
        setClientPhone(client.phone_number || client.phone);
      }

      if (client.address) setClientAddress(client.address);
    }

    setClientDrawerOpen(true);
  };

  // ─────────────────────────────────────────────
  // LOAD EXISTING PETS
  // ─────────────────────────────────────────────
  const fetchExistingPets = useCallback(async () => {
    if (!clientEmail) return;

    try {
      const url = `${apiBaseUrl}/api/pets?ownerEmail=${encodeURIComponent(
        clientEmail
      )}`;
      const res = await fetch(url, { headers: { Accept: "application/json" } });

      const data = await safeJson(res);
      setExistingPets(data.pets || []);
    } catch {
      setExistingPets([]);
    }
  }, [apiBaseUrl, clientEmail]);

  // ─────────────────────────────────────────────
  // CLIENT SAVED → PETS DRAWER
  // ─────────────────────────────────────────────
  const handleClientSaved = async () => {
    const valid =
      clientName.trim() &&
      clientEmail.trim() &&
      clientPhone.trim() &&
      clientAddress.trim();
    if (!valid) return;

    setClientDrawerOpen(false);

    await fetchExistingPets();

    setPetsDrawerOpen(true);
  };

  // ─────────────────────────────────────────────
  // PETS SAVED → SUMMARY
  // ─────────────────────────────────────────────
  const handlePetsSaved = (newPets, savedIds) => {
    const savedProfiles = existingPets.filter((p) =>
      savedIds.includes(p.id)
    );

    setPets([...savedProfiles, ...newPets]);

    setPetsDrawerOpen(false);
    setSummaryOpen(true);
  };

  // ─────────────────────────────────────────────
  // PRICING
  // ─────────────────────────────────────────────
  const parsePrice = (v) => Number(String(v).replace(/[^0-9.]/g, "")) || 0;
  const formatCurrency = (v) => `€${v.toFixed(2)}`;

  const unitPrice = parsePrice(service.price);
  const dogCount = pets.length;
  const visitCount = selectedDate && selectedTime ? 1 : 0;
  const totalPrice = dogCount * unitPrice * visitCount;

  // ─────────────────────────────────────────────
  // PAY & BOOK
  // ─────────────────────────────────────────────
  const handlePay = async () => {
    if (totalPrice <= 0) {
      setError("Add at least one dog to continue.");
      return;
    }

    setIsBooking(true);
    setError("");
    setSuccess("");

    try {
      const payload = {
        date: selectedDate,
        time: selectedTime,
        timeZone: availability.timeZone,
        serviceId: service.id,
        serviceTitle: service.title,

        clientName,
        clientEmail,
        clientPhone,
        clientAddress,
        notes,

        pets,
        dogCount,
        visitCount,
        amount: totalPrice,
      };

      const bookingRes = await fetch(`${apiBaseUrl}/api/book`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!bookingRes.ok) throw new Error("Booking failed");

      const bookingData = await bookingRes.json();
      const bookingId = bookingData?.booking_id;

      if (!bookingId) throw new Error("Could not create booking.");

      const description = `${service.title} — ${dogCount} dog${dogCount === 1 ? "" : "s"}`;
      const successUrl = `${window.location.origin}/payment-success?booking=${bookingId}`;
      const cancelUrl = `${window.location.origin}/payment-cancelled?booking=${bookingId}`;

      const paymentRes = await fetch(`${apiBaseUrl}/api/create-payment-link`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: totalPrice,
          description,
          bookingId,
          redirectUrl: successUrl,
          cancelUrl,
        }),
      });

      const paymentData = await paymentRes.json();

      if (!paymentRes.ok || !paymentData?.url) {
        const errMessage = paymentData?.error || "Payment link creation failed.";
        throw new Error(errMessage);
      }

      window.location.href = paymentData.url;
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setIsBooking(false);
    }
  };

  const handleLoginClick = () => setLoginModalOpen(true);

  const handleLoginSuccess = (newProfile) => {
    setProfile(newProfile);
    setLoginModalOpen(false);
  };

  // ─────────────────────────────────────────────
  // RENDER MODAL
  // ─────────────────────────────────────────────
  return (
    <div className="booking-overlay">
      <div className="booking-modal fade-in">
        {/* HEADER */}
        <header className="booking-header">
          <div>
            <p className="eyebrow">{service.duration}</p>
            <h3>{service.title}</h3>
            <p className="muted">Jeroen & Paws</p>
          </div>

          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </header>

        {/* BODY */}
        <div className="booking-body">
          <div className="premium-booking-layout">
            <CalendarSection
              loading={loading}
              availabilityNotice={availabilityNotice}
              monthLabel={visibleMonth.toLocaleString(undefined, {
                month: "long",
                year: "numeric",
              })}
              weekdayLabels={weekdayLabels}
              monthMatrix={buildMonthMatrix(visibleMonth)}
              visibleMonth={visibleMonth}
              onPrevMonth={() =>
                setVisibleMonth(
                  (p) => new Date(p.getFullYear(), p.getMonth() - 1, 1)
                )
              }
              onNextMonth={() =>
                setVisibleMonth(
                  (p) => new Date(p.getFullYear(), p.getMonth() + 1, 1)
                )
              }
              is24h={is24h}
              onToggleTimeFormat={setIs24h}
              availabilityMap={availabilityMap}
              getDayAvailabilityStatus={getDayAvailabilityStatus}
              selectedDate={selectedDate}
              onDaySelect={handleDaySelect}
              timeZoneLabel={availability.timeZone}
              ref={calendarRef}
            />

            <TimeSection
              selectedDate={selectedDate}
              selectedDateLabel={selectedDateLabel}
              selectedDay={availabilityMap[selectedDate]}
              selectedTime={selectedTime}
              onTimeSelect={handleTimeSelect}
              canContinue={canContinue}
              onContinue={handleContinue}
              formatTime={formatTime}
              ref={timeRef}
            />
          </div>
        </div>

        {/* DRAWERS */}
        <ClientDrawer
          isOpen={clientDrawerOpen}
          onClose={() => setClientDrawerOpen(false)}
          name={clientName}
          setName={setClientName}
          email={clientEmail}
          setEmail={setClientEmail}
          phone={clientPhone}
          setPhone={setClientPhone}
          address={clientAddress}
          setAddress={setClientAddress}
          notes={notes}
          setNotes={setNotes}
          canConfirm={
            clientName.trim() &&
            clientEmail.trim() &&
            clientPhone.trim() &&
            clientAddress.trim()
          }
          onSave={handleClientSaved}
          login={handleLoginClick}
          isAuthenticated={isAuthenticated}
          user={profile?.client}
        />

        <PetDrawer
          isOpen={petsDrawerOpen}
          onClose={() => setPetsDrawerOpen(false)}
          existingPets={existingPets}
          selectedSavedPetIds={selectedSavedPetIds}
          setSelectedSavedPetIds={setSelectedSavedPetIds}
          onSave={handlePetsSaved}
        />

        <SummaryDrawer
          isOpen={summaryOpen}
          onClose={() => setSummaryOpen(false)}
          pets={pets}
          name={clientName}
          email={clientEmail}
          phone={clientPhone}
          address={clientAddress}
          notes={notes}
          dateLabel={selectedDateLabel}
          time={selectedTime}
          formatTime={formatTime}
          total={formatCurrency(totalPrice)}
          onPay={handlePay}
          isBooking={isBooking}
          onEditClient={() => {
            setSummaryOpen(false);
            setClientDrawerOpen(true);
          }}
          onEditPets={() => {
            setSummaryOpen(false);
            setPetsDrawerOpen(true);
          }}
          onEditDateTime={() => {
            setSummaryOpen(false);
            // optional: scroll calendar into view on mobile
          }}
        />

        <LoginModal
          isOpen={loginModalOpen}
          onClose={() => setLoginModalOpen(false)}
          onLogin={handleLoginSuccess}
        />
      </div>
    </div>
  );
};

export default BookingModal;
