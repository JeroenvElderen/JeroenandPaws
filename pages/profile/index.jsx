import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../../src/context/AuthContext";
import CalendarSection from "../../src/components/Pricing/components/CalendarSection";
import TimesSection from "../../src/components/Pricing/components/TimesSection";
import { buildMonthMatrix } from "../../src/components/Pricing/utils";
import { weekdayLabels } from "../../src/components/Pricing/constants";

const brand = {
  primary: "#7c45f3",
  primarySoft: "#7c45f31a",
  neutral: "#0c081f",
  ink: "#f4f2ff",
  muted: "#c9c5d8",
  background:
    "radial-gradient(circle at 12% 18%, rgba(124, 69, 243, 0.08), transparent 28%), \n radial-gradient(circle at 88% 6%, rgba(255, 214, 150, 0.08), transparent 30%), \n #0c081f",
  cardBorder: "rgba(255,255,255,0.08)",
  cardShadow: "0 24px 80px rgba(0, 0, 0, 0.55)",
  subtleText: "#c9c5d8",
  surface: "linear-gradient(150deg, #1f1535, #120d23)",
  surfaceHighlight: "linear-gradient(150deg, #251a3f, #150f28)",
};

const SectionCard = ({ title, description, children, className = "" }) => (
  <section className={`jp-section-card ${className}`.trim()}>
    <div className="jp-section-card__header">
      <div>
        <h2 className="jp-section-card__title">{title}</h2>
        {description && (
          <p className="jp-section-card__description">{description}</p>
        )}
      </div>
    </div>
    {children}
  </section>
);

const emptyStateStyle = {
  background: "rgba(124, 69, 243, 0.08)",
  border: `1px dashed ${brand.cardBorder}`,
  borderRadius: "16px",
  padding: "16px",
  color: brand.subtleText,
  textAlign: "center",
};

const mockProfile = {
  client: {
    id: "demo-client",
    full_name: "Jeroen & Paws Guest",
    email: "demo@jeroenandpaws.com",
    phone_number: "+1 (555) 123-4567",
  },
  pets: [
    {
      id: "pet-1",
      name: "Luna",
      breed: "Golden Retriever",
      notes: "Loves long walks and peanut butter treats.",
    },
    {
      id: "pet-2",
      name: "Milo",
      breed: "Corgi",
      notes: "Keep an eye on the zoomies after lunch.",
    },
  ],
  bookings: [
    {
      id: "booking-1",
      service_title: "Training Session",
      start_at: new Date(Date.now() + 86400000).toISOString(),
      end_at: new Date(Date.now() + 9000000).toISOString(),
      status: "confirmed",
      notes: "Focus on loose leash walking.",
    },
    {
      id: "booking-2",
      service_title: "Daycare",
      start_at: new Date(Date.now() + 172800000).toISOString(),
      end_at: new Date(Date.now() + 180000000).toISOString(),
      status: "confirmed",
      notes: "Please offer a frozen Kong at nap time.",
    },
  ],
};

const useMockProfile =
  typeof process !== "undefined" &&
  process.env.NEXT_PUBLIC_MOCK_PROFILE === "true";
const RESCHEDULE_WINDOW_DAYS = 60;

const formatDateRange = (booking) => {
  if (!booking?.start_at || !booking?.end_at) return "Scheduled time pending";

  const start = new Date(booking.start_at);
  const end = new Date(booking.end_at);
  return `${start.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  })} • ${start.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })} — ${end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
};

const formatBookingDateKey = (dateValue) => {
  if (!dateValue) return "";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-CA");
};

const bookingStatusLabel = (status = "") => {
  const normalized = status.toLowerCase();

  if (!normalized || normalized === "pending") return "Waiting confirmation";
  if (["scheduled", "confirmed"].includes(normalized)) return "Scheduled";
  if (["cancelled", "canceled"].includes(normalized)) return "Cancelled";
  return status;
};

const ProfilePage = () => {
  const {
    profile: authProfile,
    setProfile: setAuthProfile,
    logout: clearAuth,
  } = useAuth();
  const initialProfile = useMockProfile ? mockProfile : authProfile;
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

  const [email, setEmail] = useState(initialProfile?.client?.email || "");
  const [password, setPassword] = useState("");
  const [profile, setProfile] = useState(initialProfile);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [contactForm, setContactForm] = useState({
    fullName: initialProfile?.client?.full_name || "",
    phone: initialProfile?.client?.phone_number || "",
    email: initialProfile?.client?.email || "",
    address: initialProfile?.client?.address || "",
  });
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPasswordInput, setCurrentPasswordInput] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingContact, setSavingContact] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [showInlineReset, setShowInlineReset] = useState(false);
  const [newPet, setNewPet] = useState({
    name: "",
    breed: "",
    notes: "",
    photoDataUrl: null,
    photoName: "",
  });
  const [editingPets, setEditingPets] = useState({});
  const [resetEmail, setResetEmail] = useState(
    initialProfile?.client?.email || ""
  );
  const [resetStatus, setResetStatus] = useState({
    state: "idle",
    message: "",
  });
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [activeTab, setActiveTab] = useState("All");
  const [selectedDate, setSelectedDate] = useState("");
  const [visibleMonth, setVisibleMonth] = useState(() => new Date());
  const landingRef = useRef(null);
  const landingBgRef = useRef(null);
  const contentRef = useRef(null);
  const avatarRef = useRef(null);
  const tabs = useMemo(() => ["All", "Pets", "Bookings", "Details"], []);
  const coverImage = useMemo(
    () => profile?.client?.cover_url || "/images/background/bg3.jpg",
    [profile]
  );
  const avatarImage = useMemo(
    () =>
      profile?.client?.avatar_url ||
      profile?.pets?.find((pet) => pet.photo_data_url)?.photo_data_url ||
      "/images/Jeroen.jpg",
    [profile]
  );
  const displayName = useMemo(
    () =>
      contactForm.fullName ||
      profile?.client?.full_name ||
      "Jeroen & Paws Client",
    [contactForm.fullName, profile]
  );
  const subtitleText = useMemo(() => {
    const subtitleParts = [
      profile?.client?.email ? "Client" : "Guest",
      profile?.pets?.length
        ? `${profile.pets.length} pet${profile.pets.length > 1 ? "s" : ""}`
        : "Pet parent",
    ];
    return subtitleParts.filter(Boolean).join(" · ");
  }, [profile]);
  const [bookingAction, setBookingAction] = useState({
    cancelling: false,
    error: "",
  });
  const [rescheduleBooking, setRescheduleBooking] = useState(null);
  const [rescheduleAvailability, setRescheduleAvailability] = useState({
    dates: [],
    timeZone: "Europe/Dublin",
  });
  const [rescheduleSelectedDate, setRescheduleSelectedDate] = useState("");
  const [rescheduleSelectedTime, setRescheduleSelectedTime] = useState("");
  const [rescheduleVisibleMonth, setRescheduleVisibleMonth] = useState(
    () => new Date()
  );
  const [rescheduleLoading, setRescheduleLoading] = useState(false);
  const [rescheduleSubmitting, setRescheduleSubmitting] = useState(false);
  const [rescheduleError, setRescheduleError] = useState("");
  const [rescheduleSuccess, setRescheduleSuccess] = useState("");
  const isAllTab = activeTab === "All";
  const showDetails = isAllTab || activeTab === "Details";
  const showPets = isAllTab || activeTab === "Pets";
  const showBookings = isAllTab || activeTab === "Bookings";
  
  const rescheduleMinNoticeHours = useMemo(() => {
    const parsed = Number.parseInt(
      process.env.NEXT_PUBLIC_RESCHEDULE_MIN_NOTICE_HOURS || "24",
      10
    );
    return Number.isNaN(parsed) ? 24 : Math.max(parsed, 1);
  }, []);

  const showSidebar = true;
  const showSidebarDetails = true;

  const activeBookings = useMemo(() => {
    const clean = (status = "") => status?.toLowerCase();
    return (profile?.bookings || []).filter(
      (booking) => !["cancelled", "canceled"].includes(clean(booking.status))
    );
  }, [profile]);

  const hasPets = useMemo(() => profile?.pets?.length > 0, [profile]);
  const hasBookings = useMemo(
    () => activeBookings.length > 0,
    [activeBookings]
  );

  const bookingCalendarMap = useMemo(() => {
    return activeBookings.reduce((acc, booking) => {
      const dateKey = formatBookingDateKey(booking.start_at);
      if (!dateKey) return acc;
      if (!acc[dateKey]) {
        acc[dateKey] = { date: dateKey, bookings: [] };
      }
      acc[dateKey].bookings.push(booking);
      return acc;
    }, {});
  }, [activeBookings]);

  const bookedDateSlots = useMemo(() => {
    return Object.keys(bookingCalendarMap).reduce((acc, dateKey) => {
      acc[dateKey] = "booked";
      return acc;
    }, {});
  }, [bookingCalendarMap]);

  const selectedDateBookings = useMemo(() => {
    if (!selectedDate) return [];
    return (bookingCalendarMap[selectedDate]?.bookings || []).slice().sort(
      (a, b) => new Date(a.start_at) - new Date(b.start_at)
    );
  }, [bookingCalendarMap, selectedDate]);

  const monthMatrix = useMemo(
    () => buildMonthMatrix(visibleMonth),
    [visibleMonth]
  );

  const monthLabel = useMemo(
    () =>
      visibleMonth.toLocaleDateString(undefined, {
        month: "long",
        year: "numeric",
      }),
    [visibleMonth]
  );

  const handleDaySelection = useCallback((iso) => {
    setSelectedDate(iso);
  }, []);

  const handlePreviousMonth = useCallback(() => {
    setVisibleMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  }, []);

  const handleNextMonth = useCallback(() => {
    setVisibleMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  }, []);

  const isBookingDayAvailable = useCallback(
    (dayData) => Boolean(dayData?.bookings?.length),
    []
  );

  const selectedDateLabel = useMemo(() => {
    if (!selectedDate) return "Select a date to see bookings.";
    const date = new Date(`${selectedDate}T00:00:00`);
    if (Number.isNaN(date.getTime())) return "Select a date to see bookings.";
    return date.toLocaleDateString(undefined, {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  }, [selectedDate]);

  const rescheduleAvailabilityMap = useMemo(() => {
    return (rescheduleAvailability?.dates || []).reduce((acc, day) => {
      acc[day.date] = day;
      return acc;
    }, {});
  }, [rescheduleAvailability]);

  const rescheduleSelectedDay = useMemo(
    () => rescheduleAvailabilityMap[rescheduleSelectedDate],
    [rescheduleAvailabilityMap, rescheduleSelectedDate]
  );

  const rescheduleMonthMatrix = useMemo(
    () => buildMonthMatrix(rescheduleVisibleMonth),
    [rescheduleVisibleMonth]
  );

  const rescheduleMonthLabel = useMemo(
    () =>
      rescheduleVisibleMonth.toLocaleDateString(undefined, {
        month: "long",
        year: "numeric",
      }),
    [rescheduleVisibleMonth]
  );

  const isRescheduleDayAvailable = useCallback(
    (dayData) => Boolean(dayData?.slots?.some((slot) => slot.available)),
    []
  );

  const formatRescheduleTime = useCallback((slot) => slot, []);

  const resolveRescheduleDuration = useCallback((booking) => {
    const catalogDuration = booking?.services_catalog?.duration_minutes;
    if (Number.isFinite(catalogDuration)) {
      return catalogDuration;
    }
    if (booking?.start_at && booking?.end_at) {
      const start = new Date(booking.start_at);
      const end = new Date(booking.end_at);
      const diff = (end - start) / 60000;
      if (Number.isFinite(diff) && diff > 0) {
        return Math.round(diff);
      }
    }
    return 60;
  }, []);

  const profileAddress = profile?.client?.address || "";

  const loadRescheduleAvailability = useCallback(
    async (booking) => {
      if (!booking) return;
      setRescheduleLoading(true);
      setRescheduleError("");
      setRescheduleSuccess("");
      setRescheduleSelectedDate("");
      setRescheduleSelectedTime("");

      try {
        const durationMinutes = resolveRescheduleDuration(booking);
        const resolvedAddress = booking?.client_address || profileAddress || "";
        const params = new URLSearchParams({
          durationMinutes: `${durationMinutes}`,
          windowDays: `${RESCHEDULE_WINDOW_DAYS}`,
        });
        if (resolvedAddress) {
          params.set("clientAddress", resolvedAddress);
        }
        const url = `${apiBaseUrl}/api/availability?${params.toString()}`;
        const response = await fetch(url, {
          headers: { Accept: "application/json" },
        });
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload?.message || "Unable to load availability.");
        }

        const now = new Date();
        const minNoticeTime = new Date(
          now.getTime() + rescheduleMinNoticeHours * 60 * 60 * 1000
        );

        const filteredDates = (payload?.dates || []).filter((day) => {
          const dayDate = new Date(`${day.date}T00:00:00`);
          return dayDate >= new Date(minNoticeTime.toDateString());
        });

        setRescheduleAvailability({
          ...payload,
          dates: filteredDates,
        });

        if (filteredDates.length) {
          const firstAvailable = new Date(`${filteredDates[0].date}T00:00:00`);
          setRescheduleVisibleMonth(
            new Date(firstAvailable.getFullYear(), firstAvailable.getMonth(), 1)
          );
        }
      } catch (err) {
        console.error("Reschedule availability error", err);
        setRescheduleError(
          err?.message || "Unable to load rescheduling availability."
        );
      } finally {
        setRescheduleLoading(false);
      }
    },
    [
      apiBaseUrl,
      profileAddress,
      resolveRescheduleDuration,
      rescheduleMinNoticeHours,
    ]
  );

  const openReschedule = useCallback(
    (booking) => {
      setRescheduleBooking(booking);
      loadRescheduleAvailability(booking);
    },
    [loadRescheduleAvailability]
  );

  const closeReschedule = useCallback(() => {
    setRescheduleBooking(null);
    setRescheduleError("");
    setRescheduleSuccess("");
    setRescheduleSelectedDate("");
    setRescheduleSelectedTime("");
  }, []);

  const handleRescheduleDaySelection = useCallback(
    (iso) => {
      setRescheduleSelectedDate(iso);
      const dayData = rescheduleAvailabilityMap[iso];
      const firstAvailableTime =
        dayData?.slots?.find(
          (slot) =>
            slot.available && (slot.reachable !== false || slot.forceVisible)
        )?.time || "";
      setRescheduleSelectedTime(firstAvailableTime);
    },
    [rescheduleAvailabilityMap]
  );

  const handleReschedulePreviousMonth = useCallback(() => {
    setRescheduleVisibleMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
    );
  }, []);

  const handleRescheduleNextMonth = useCallback(() => {
    setRescheduleVisibleMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
    );
  }, []);

  const submitReschedule = useCallback(async () => {
    if (!rescheduleBooking) return;
    if (!rescheduleSelectedDate || !rescheduleSelectedTime) {
      setRescheduleError("Choose a new date and time to continue.");
      return;
    }

    setRescheduleSubmitting(true);
    setRescheduleError("");
    setRescheduleSuccess("");

    try {
      const durationMinutes = resolveRescheduleDuration(rescheduleBooking);
      const response = await fetch("/api/client-bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reschedule",
          bookingId: rescheduleBooking.id,
          clientEmail: contactForm.email,
          date: rescheduleSelectedDate,
          time: rescheduleSelectedTime,
          timeZone:
            rescheduleAvailability?.timeZone ||
            rescheduleBooking?.time_zone ||
            "UTC",
          durationMinutes,
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.message || "Unable to reschedule booking.");
      }

      setProfile((currentProfile) => {
        const updatedBookings = (currentProfile?.bookings || []).map((booking) =>
          booking.id === payload?.booking?.id ? payload.booking : booking
        );
        return { ...currentProfile, bookings: updatedBookings };
      });

      setRescheduleSuccess("Your booking has been rescheduled.");
    } catch (err) {
      console.error("Reschedule failed", err);
      setRescheduleError(err?.message || "Unable to reschedule booking.");
    } finally {
      setRescheduleSubmitting(false);
    }
  }, [
    contactForm.email,
    rescheduleAvailability?.timeZone,
    rescheduleBooking,
    rescheduleSelectedDate,
    rescheduleSelectedTime,
    resolveRescheduleDuration,
  ]);

  const refreshContactForm = useCallback((payload) => {
    setContactForm({
      fullName: payload?.client?.full_name || "",
      phone: payload?.client?.phone_number || "",
      email: payload?.client?.email || "",
      address: payload?.client?.address || "",
    });
    setResetEmail(payload?.client?.email || "");
  }, []);

  const persistProfileState = (nextProfileOrUpdater) => {
    setProfile((previous) => {
      const nextProfile =
        typeof nextProfileOrUpdater === "function"
          ? nextProfileOrUpdater(previous)
          : nextProfileOrUpdater;

      if (nextProfile === undefined) {
        return previous;
      }

      if (!nextProfile) {
        if (!useMockProfile) {
          setAuthProfile(null);
        }
        refreshContactForm(null);
        setEmail("");
        return null;
      }

      if (!useMockProfile) {
        setAuthProfile(nextProfile);
      }
      refreshContactForm(nextProfile);
      setEmail(nextProfile?.client?.email || "");
      return nextProfile;
    });
  };

  useEffect(() => {
    if (useMockProfile) {
      setProfile(mockProfile);
      refreshContactForm(mockProfile);
      setEmail(mockProfile?.client?.email || "");
      setResetEmail(mockProfile?.client?.email || "");
      return;
    }

    if (authProfile) {
      setProfile(authProfile);
      refreshContactForm(authProfile);
      setEmail(authProfile?.client?.email || "");
      setResetEmail(authProfile?.client?.email || "");
      return;
    }

    setProfile(null);
    setContactForm({ fullName: "", phone: "", email: "", address: "" });
    setEmail("");
    setResetEmail("");
  }, [authProfile, refreshContactForm, useMockProfile]);

  useEffect(() => {
    if (!hasBookings) {
      setSelectedDate("");
      return;
    }

    const bookingDates = Object.keys(bookingCalendarMap).sort();
    const firstDate = bookingDates[0];
    const shouldUpdateSelection =
      !selectedDate || !bookingCalendarMap[selectedDate];

    if (shouldUpdateSelection && firstDate) {
      setSelectedDate(firstDate);
      const firstDateObj = new Date(`${firstDate}T00:00:00`);
      if (!Number.isNaN(firstDateObj.getTime())) {
        setVisibleMonth(
          new Date(firstDateObj.getFullYear(), firstDateObj.getMonth(), 1)
        );
      }
    }
  }, [bookingCalendarMap, hasBookings, selectedDate]);

  const loadProfile = async () => {
    if (!email || !password) {
      setError("Please enter both email and password to view your profile.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/client-auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(payload?.message || "Profile not found");
      }

      persistProfileState(payload);
      setLoginAttempts(0);
      setShowInlineReset(false);
      setResetStatus({ state: "idle", message: "" });
    } catch (err) {
      setError(err.message || "Could not load profile");
      setProfile(null);
      setResetEmail(email || resetEmail);
      setLoginAttempts((previous) => {
        const next = previous + 1;
        if (next >= 3) {
          setShowInlineReset(true);
        }
        return next;
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchBookings = async () => {
      if (useMockProfile || !profile?.client?.email) return;

      try {
        const response = await fetch(
          `/api/client-bookings?email=${encodeURIComponent(
            profile.client.email
          )}`
        );
        const payload = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(payload?.message || "Could not load bookings");
        }

        persistProfileState((currentProfile) => ({
          ...currentProfile,
          bookings: payload.bookings || [],
        }));
      } catch (err) {
        console.error("Failed to refresh bookings", err);
      }
    };

    fetchBookings();
  }, [profile?.client?.email, useMockProfile]);

  useEffect(() => {
    const refreshPetPhotos = async () => {
      if (useMockProfile || !profile?.client?.email) return;

      try {
        const response = await fetch(
          `/api/pets?ownerEmail=${encodeURIComponent(profile.client.email)}`
        );
        const payload = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(payload?.message || "Could not refresh pets");
        }

        persistProfileState((currentProfile) => ({
          ...currentProfile,
          pets: payload.pets || [],
        }));
      } catch (err) {
        console.error("Failed to refresh pet photos", err);
      }
    };

    refreshPetPhotos();
  }, [profile?.client?.email, useMockProfile]);

  const saveContact = async () => {
    if (!contactForm.email) {
      setError("Email is required to save your details.");
      return;
    }
    setSavingContact(true);
    setError("");

    try {
      const response = await fetch("/api/clients", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: profile?.client?.id,
          email: profile?.client?.email,
          newEmail: contactForm.email,
          fullName: contactForm.fullName,
          phone: contactForm.phone,
          address: contactForm.address,
        }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(payload?.message || "Could not save your details");
      }

      persistProfileState((currentProfile) => ({
        ...currentProfile,
        client: payload.client,
      }));
    } catch (err) {
      setError(err.message || "Unable to save details");
    } finally {
      setSavingContact(false);
    }
  };

  const savePassword = async () => {
    if (!contactForm.email) {
      setError("Email is required to save your details.");
      return;
    }

    if (!currentPasswordInput || !newPassword || !confirmPassword) {
      setError("Please complete all password fields to continue.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New password and confirmation must match.");
      return;
    }

    setSavingPassword(true);
    setError("");
    try {
      const response = await fetch("/api/clients", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: contactForm.email,
          password: newPassword,
          currentPassword: currentPasswordInput,
        }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(payload?.message || "Could not update password");
      }

      const nextProfile = { ...profile, client: payload.client };
      persistProfileState(nextProfile);
      setPassword(newPassword);
      setCurrentPasswordInput("");
      setNewPassword("");
      setConfirmPassword("");
      setShowPasswordForm(false);
    } catch (err) {
      setError(err.message || "Unable to update password");
    } finally {
      setSavingPassword(false);
    }
  };

  const fileToDataUrl = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleNewPetPhotoChange = async (file) => {
    if (!file) return;

    const dataUrl = await fileToDataUrl(file);
    setNewPet((prev) => ({
      ...prev,
      photoDataUrl: dataUrl,
      photoName: file.name,
    }));
  };

  const handleExistingPetPhotoChange = async (petId, file) => {
    if (!file) return;

    const dataUrl = await fileToDataUrl(file);
    updatePetField(petId, "photoDataUrl", dataUrl);
    updatePetField(petId, "photoName", file.name);
  };

  const clearExistingPetPhoto = (petId) => {
    updatePetField(petId, "photoDataUrl", null);
    updatePetField(petId, "photo_data_url", null);
    updatePetField(petId, "photoName", "");
  };

  const clearNewPetPhoto = () =>
    setNewPet((prev) => ({ ...prev, photoDataUrl: null, photoName: "" }));

  const createPet = async () => {
    try {
      const response = await fetch("/api/pets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ownerEmail: contactForm.email || email,
          ...newPet,
        }),
      });

      if (!response.ok) {
        throw new Error("Could not save pet");
      }

      setNewPet({
        name: "",
        breed: "",
        notes: "",
        photoDataUrl: null,
        photoName: "",
      });
      await loadProfile();
    } catch (err) {
      setError(err.message || "Unable to save pet");
    }
  };

  const startEditingPet = (pet) => {
    setEditingPets((prev) => ({ ...prev, [pet.id]: { ...pet } }));
  };

  const stopEditingPet = (petId) => {
    setEditingPets((prev) => {
      const next = { ...prev };
      delete next[petId];
      return next;
    });
  };

  const updatePetField = (petId, field, value) => {
    setEditingPets((prev) => ({
      ...prev,
      [petId]: { ...prev[petId], [field]: value },
    }));
  };

  const savePetEdit = async (petId) => {
    const petPayload = editingPets[petId];
    if (!petPayload) return;
    try {
      const response = await fetch("/api/pets", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ownerEmail: contactForm.email || email,
          ...petPayload,
        }),
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(payload?.message || "Could not update pet");
      }

      persistProfileState((currentProfile) => {
        const nextPets = (currentProfile?.pets || []).map((pet) =>
          pet.id === petId ? payload.pet : pet
        );
        return { ...currentProfile, pets: nextPets };
      });
      stopEditingPet(petId);
    } catch (err) {
      setError(err.message || "Unable to update pet");
    }
  };

  const openBooking = (booking) => {
    setSelectedBooking(booking);
    setBookingAction({ cancelling: false, error: "" });
  };

  const cancelBooking = async () => {
    if (!selectedBooking) return;

    setBookingAction({ cancelling: true, error: "" });
    try {
      const response = await fetch("/api/client-bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: selectedBooking.id,
          clientEmail: contactForm.email || email,
          removeFromCalendar: true,
        }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(payload?.message || "Could not cancel booking");
      }

      persistProfileState((currentProfile) => {
        const currentBookings = currentProfile?.bookings || [];
        const nextBookings = payload?.deleted
          ? currentBookings.filter((booking) => booking.id !== selectedBooking.id)
          : currentBookings.map((booking) =>
              booking.id === selectedBooking.id ? payload.booking : booking
            );
        return { ...currentProfile, bookings: nextBookings };
      });
      setSelectedBooking(null);
    } catch (err) {
      setBookingAction({
        cancelling: false,
        error: err.message || "Unable to cancel booking",
      });
    } finally {
      setBookingAction((prev) => ({ ...prev, cancelling: false }));
    }
  };

  const requestPasswordReset = async () => {
    if (!resetEmail) {
      setResetStatus({
        state: "error",
        message: "Please enter your email address.",
      });
      return;
    }

    setResetStatus({ state: "loading", message: "" });
    try {
      const response = await fetch("/api/password-reset-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetEmail }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(payload?.message || "Could not submit your request.");
      }

      setResetStatus({
        state: "success",
        message: "Check your inbox for the next steps to reset your password.",
      });
    } catch (err) {
      setResetStatus({
        state: "error",
        message: err.message || "Unable to process your request right now.",
      });
    }
  };

  const signOut = () => {
    setProfile(null);
    clearAuth?.();
    setContactForm({ fullName: "", phone: "", email: "", address: "" });
    setPassword("");
    setSelectedBooking(null);
    setLoginAttempts(0);
    setShowInlineReset(false);
    setResetStatus({ state: "idle", message: "" });
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    const updateNavOffset = () => {
      const nav = document.querySelector(".nav");
      const offset = nav ? nav.getBoundingClientRect().height : 0;
      document.documentElement.style.setProperty(
        "--jp-nav-offset",
        `${offset}px`
      );
    };

    updateNavOffset();
    window.addEventListener("resize", updateNavOffset);
    return () => window.removeEventListener("resize", updateNavOffset);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let isTicking = false;
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      isTicking = false;
      const scrollPos = window.scrollY;
      const landing = landingRef.current;
      const bg = landingBgRef.current;
      const content = contentRef.current;
      const avatar = avatarRef.current;

      if (!landing || !bg || !content || !avatar) return;

      if (scrollPos === lastScrollY) return;
      lastScrollY = scrollPos;

      if (scrollPos < 300) {
        bg.style.marginTop = `${scrollPos / 2}px`;
      }

      const percentage = Math.max(
        Math.min(((scrollPos - 216) / 84) * 1.05, 1),
        0
      );
      const max = 128;
      const min = 48;
      const diff = max - min;
      const dimensions = max - diff * percentage;

      avatar.style.width = `${dimensions}px`;
      avatar.style.height = `${dimensions}px`;
      avatar.style.transform = `translate(0, -${
        (percentage * 50) * -1 + 50
      }%)`;
      avatar.style.marginTop = `${percentage * 10}px`;
    };

    const onScroll = () => {
      if (isTicking) return;
      isTicking = true;
      window.requestAnimationFrame(handleScroll);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!profile) {
    return (
      <main className="jp-profile-page jp-profile-login">
        <div className="jp-login-shell">
          <div className="jp-login-card">
            <img
              src="/logo192.png"
              alt="Jeroen & Paws"
              className="jp-login-logo"
              loading="lazy"
            />
            <h1>Welcome back</h1>
            <p>
              Log in with the email you used when booking to access your
              profile.
            </p>
            {error && <div className="jp-profile-error">{error}</div>}
            <div className="jp-login-form">
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={loadProfile}
                disabled={loading || !email || !password}
              >
                {loading ? "Loading…" : "View profile"}
              </button>
              <button
                type="button"
                className="jp-login-secondary"
                onClick={() => {
                  setShowInlineReset(true);
                  setResetStatus({ state: "idle", message: "" });
                  setResetEmail(email || resetEmail);
                }}
              >
                Set a new password
              </button>
            </div>
            {showInlineReset && (
              <div className="jp-detail-card__reset">
                <p className="jp-detail-card__reset-title">
                  Reset your password
                </p>
                <p className="jp-detail-card__reset-subtitle">
                  After a few unsuccessful login attempts we’ll help you
                  request a reset link so you can set a new password.
                </p>
                <div className="jp-detail-card__reset-row">
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={requestPasswordReset}
                    disabled={resetStatus.state === "loading"}
                    className="jp-detail-card__primary"
                  >
                    {resetStatus.state === "loading"
                      ? "Sending reset link…"
                      : "Email me a reset link"}
                  </button>
                </div>
                {resetStatus.message && (
                  <p
                    className={`jp-detail-card__reset-message ${
                      resetStatus.state === "success" ? "success" : "error"
                    }`}
                  >
                    {resetStatus.message}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="jp-profile-page">
      <section className="jp-app-landing" ref={landingRef}>
        <div
          className="jp-app-landing-bg"
          ref={landingBgRef}
          style={{ backgroundImage: `url(${coverImage})` }}
        />
      </section>

      <div className="jp-app-content" ref={contentRef}>
        <div className="jp-profile-header">
          <div className="jp-profile-avatar">
            <img
              src={avatarImage}
              alt={`${displayName} avatar`}
              className="jp-avatar"
              ref={avatarRef}
              loading="lazy"
            />
          </div>

          <div className="jp-profile-meta">
            <p className="jp-type-title jp-profile-title-line">
              <span>{displayName}</span>
              <span className="jp-profile-title-divider">·</span>
              <span className="jp-profile-inline-subtitle">
                {subtitleText}
              </span>
            </p>
          </div>
        </div>

        <div className="jp-profile-content">
          <nav className="jp-content-navigation">
            <ul>
              {tabs.map((tab) => (
                <li
                  key={tab}
                  className={tab === activeTab ? "active" : ""}
                  onClick={() => setActiveTab(tab)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") setActiveTab(tab);
                  }}
                >
                  {tab}
                </li>
              ))}
            </ul>
          </nav>

          <div className="jp-profile-main">
            {error && <div className="jp-profile-error">{error}</div>}

            <>
              {showDetails && (
                <SectionCard
                  title="Your details"
                  description="Update your contact information, password, and login email."
                >
                  <div
                    style={{
                      display: "grid",
                      gap: "12px",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(240px, 1fr))",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "6px",
                      }}
                    >
                      <label style={{ color: brand.subtleText, fontWeight: 700 }}>
                        Full name
                      </label>
                      <input
                        type="text"
                        value={contactForm.fullName}
                        onChange={(e) =>
                          setContactForm({
                            ...contactForm,
                            fullName: e.target.value,
                          })
                        }
                        style={{
                          padding: "12px",
                          borderRadius: "12px",
                          border: `1px solid ${brand.cardBorder}`,
                          background: "rgba(255,255,255,0.04)",
                          color: brand.ink,
                        }}
                      />
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "6px",
                      }}
                    >
                      <label style={{ color: brand.subtleText, fontWeight: 700 }}>
                        Phone
                      </label>
                      <input
                        type="tel"
                        value={contactForm.phone}
                        onChange={(e) =>
                          setContactForm({
                            ...contactForm,
                            phone: e.target.value,
                          })
                        }
                        style={{
                          padding: "12px",
                          borderRadius: "12px",
                          border: `1px solid ${brand.cardBorder}`,
                          background: "rgba(255,255,255,0.04)",
                          color: brand.ink,
                        }}
                      />
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "6px",
                      }}
                    >
                      <label style={{ color: brand.subtleText, fontWeight: 700 }}>
                        Service address
                      </label>
                      <input
                        type="text"
                        value={contactForm.address}
                        onChange={(e) =>
                          setContactForm({
                            ...contactForm,
                            address: e.target.value,
                          })
                        }
                        placeholder="Where should we meet you?"
                        style={{
                          padding: "12px",
                          borderRadius: "12px",
                          border: `1px solid ${brand.cardBorder}`,
                          background: "rgba(255,255,255,0.04)",
                          color: brand.ink,
                        }}
                      />
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "6px",
                      }}
                    >
                      <label style={{ color: brand.subtleText, fontWeight: 700 }}>
                        Email
                      </label>
                      <input
                        type="email"
                        value={contactForm.email}
                        onChange={(e) =>
                          setContactForm({
                            ...contactForm,
                            email: e.target.value,
                          })
                        }
                        style={{
                          padding: "12px",
                          borderRadius: "12px",
                          border: `1px solid ${brand.cardBorder}`,
                          background: "rgba(255,255,255,0.04)",
                          color: brand.ink,
                        }}
                      />
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "6px",
                      }}
                    >
                      <label style={{ color: brand.subtleText, fontWeight: 700 }}>
                        Change password
                      </label>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "10px",
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            const next = !showPasswordForm;
                            setShowPasswordForm(next);
                            if (!next) {
                              setCurrentPasswordInput("");
                              setNewPassword("");
                              setConfirmPassword("");
                            } else {
                              setError("");
                            }
                          }}
                          style={{
                            alignSelf: "flex-start",
                            padding: "10px 14px",
                            borderRadius: "12px",
                            border: `1px solid ${brand.cardBorder}`,
                            background: brand.surfaceHighlight,
                            color: brand.ink,
                            fontWeight: 800,
                            cursor: "pointer",
                            boxShadow: brand.cardShadow,
                          }}
                        >
                          {showPasswordForm
                            ? "Close password form"
                            : "Change password"}
                        </button>

                        {showPasswordForm && (
                          <div
                            style={{
                              display: "grid",
                              gap: "10px",
                              borderRadius: "14px",
                              padding: "12px",
                              background: "rgba(255,255,255,0.03)",
                              border: `1px solid ${brand.cardBorder}`,
                            }}
                          >
                            <input
                              type="password"
                              placeholder="Current password"
                              value={currentPasswordInput}
                              onChange={(e) =>
                                setCurrentPasswordInput(e.target.value)
                              }
                              style={{
                                padding: "12px",
                                borderRadius: "12px",
                                border: `1px solid ${brand.cardBorder}`,
                                background: "rgba(255,255,255,0.04)",
                                color: brand.ink,
                              }}
                            />
                            <input
                              type="password"
                              placeholder="New password"
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              style={{
                                padding: "12px",
                                borderRadius: "12px",
                                border: `1px solid ${brand.cardBorder}`,
                                background: "rgba(255,255,255,0.04)",
                                color: brand.ink,
                              }}
                            />
                            <input
                              type="password"
                              placeholder="Confirm new password"
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              style={{
                                padding: "12px",
                                borderRadius: "12px",
                                border: `1px solid ${brand.cardBorder}`,
                                background: "rgba(255,255,255,0.04)",
                                color: brand.ink,
                              }}
                            />
                            <div
                              style={{
                                display: "flex",
                                gap: "8px",
                                justifyContent: "flex-end",
                                flexWrap: "wrap",
                              }}
                            >
                              <button
                                type="button"
                                onClick={() => {
                                  setShowPasswordForm(false);
                                  setCurrentPasswordInput("");
                                  setNewPassword("");
                                  setConfirmPassword("");
                                }}
                                style={{
                                  padding: "10px 14px",
                                  borderRadius: "12px",
                                  border: `1px solid ${brand.cardBorder}`,
                                  background: "transparent",
                                  color: brand.subtleText,
                                  fontWeight: 700,
                                  cursor: "pointer",
                                }}
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={savePassword}
                                disabled={savingPassword}
                                style={{
                                  padding: "12px 16px",
                                  borderRadius: "12px",
                                  border: "none",
                                  background: savingPassword
                                    ? brand.primarySoft
                                    : brand.primary,
                                  color: "white",
                                  fontWeight: 800,
                                  cursor: savingPassword
                                    ? "not-allowed"
                                    : "pointer",
                                  boxShadow: brand.cardShadow,
                                }}
                              >
                                {savingPassword ? "Saving…" : "Update password"}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div
                    style={{
                      marginTop: "12px",
                      display: "flex",
                      justifyContent: "flex-end",
                    }}
                  >
                    <button
                      type="button"
                      onClick={saveContact}
                      disabled={savingContact}
                      style={{
                        padding: "12px 18px",
                        borderRadius: "12px",
                        border: "none",
                        background: savingContact
                          ? brand.primarySoft
                          : brand.primary,
                        color: "white",
                        fontWeight: 800,
                        cursor: savingContact ? "not-allowed" : "pointer",
                        boxShadow: brand.cardShadow,
                      }}
                    >
                      {savingContact ? "Saving…" : "Save details"}
                    </button>
                  </div>
                </SectionCard>
              )}

              {showPets && (
                <SectionCard
                  title="Your pets"
                  description="Open any card to edit names, breeds, or notes."
                >
                  {hasPets ? (
                    <div
                      style={{
                        display: "grid",
                        gap: "12px",
                        gridTemplateColumns:
                          "repeat(auto-fit, minmax(260px, 1fr))",
                      }}
                    >
                      {profile.pets.map((pet) => {
                        const isEditing = Boolean(editingPets[pet.id]);
                        const editing = editingPets[pet.id] || {};
                        const petPhoto =
                        editing.photoDataUrl ||
                        editing.photo_data_url ||
                        pet.photo_data_url;
                      const petInitial = (pet.name || "?")
                        .charAt(0)
                        .toUpperCase();
                      return (
                        <div
                          key={pet.id}
                          style={{
                            border: `1px solid ${brand.cardBorder}`,
                            borderRadius: "16px",
                            padding: "16px",
                            background: brand.surfaceHighlight,
                            boxShadow: brand.cardShadow,
                            display: "grid",
                            gap: "10px",
                            color: brand.ink,
                            position: "relative"
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              gap: "12px",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "12px",
                              }}
                            >
                              {petPhoto ? (
                                <img
                                  src={petPhoto}
                                  alt={`${pet.name} profile`}
                                  style={{
                                    width: "64px",
                                    height: "64px",
                                    borderRadius: "14px",
                                    objectFit: "cover",
                                    border: `1px solid ${brand.cardBorder}`,
                                  }}
                                  loading="lazy"
                                />
                              ) : (
                                <div
                                  style={{
                                    width: "64px",
                                    height: "64px",
                                    borderRadius: "14px",
                                    background: brand.primarySoft,
                                    color: brand.primary,
                                    display: "grid",
                                    placeItems: "center",
                                    fontWeight: 800,
                                    border: `1px solid ${brand.cardBorder}`,
                                  }}
                                >
                                  {petInitial}
                                </div>
                              )}
                              <div>
                                <div
                                  style={{
                                    fontWeight: 800,
                                    fontSize: "1.1rem",
                                    color: brand.ink,
                                  }}
                                >
                                  {pet.name}
                                </div>
                                {pet.breed && (
                                  <span
                                    style={{
                                      display: "inline-block",
                                      marginTop: "6px",
                                      background: brand.primary,
                                      color: brand.ink,
                                      padding: "6px 10px",
                                      borderRadius: "999px",
                                      fontSize: "0.85rem",
                                      fontWeight: 700,
                                      border: `1px solid ${brand.cardBorder}`,
                                    }}
                                  >
                                    {pet.breed}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          {pet.notes ? (
                            <p style={{ margin: 0, color: brand.subtleText }}>
                              {pet.notes}
                            </p>
                          ) : (
                            <p style={{ margin: 0, color: "#9ca3af" }}>
                              No notes added yet.
                            </p>
                          )}
                          <button
                            type="button"
                            onClick={() => startEditingPet(pet)}
                            style={{
                              justifySelf: "flex-start",
                              padding: "10px 14px",
                              borderRadius: "12px",
                              border: `1px solid ${brand.cardBorder}`,
                              background: brand.primary,
                              color: brand.ink,
                              fontWeight: 700,
                              cursor: "pointer",
                            }}
                          >
                            Edit pet
                          </button>
                          {isEditing && (
                            <div
                              style={{
                                position: "fixed",
                                inset: 0,
                                background: "rgba(15, 23, 42, 0.72)",
                                backdropFilter: "blur(6px)",
                                zIndex: 40,
                                display: "grid",
                                placeItems: "center",
                                padding: "32px 20px",
                              }}
                            >
                              <div
                                style={{
                                  background: brand.surface,
                                  border: `1px solid ${brand.cardBorder}`,
                                  borderRadius: "20px",
                                  padding: "24px",
                                  boxShadow: brand.cardShadow,
                                  width: "min(720px, 100%)",
                                  display: "grid",
                                  gap: "16px",
                                  maxHeight: "calc(100vh - 64px)",
                                  overflowY: "auto",
                                }}
                              >
                                <div
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    gap: "8px",
                                  }}
                                >
                                  <strong
                                    style={{ color: brand.ink, fontSize: "1.2rem" }}
                                  >
                                    Edit {pet.name}
                                  </strong>
                                  <button
                                    type="button"
                                    onClick={() => stopEditingPet(pet.id)}
                                    style={{
                                      padding: "8px 12px",
                                      borderRadius: "999px",
                                      border: `1px solid ${brand.cardBorder}`,
                                      background: "rgba(255,255,255,0.06)",
                                      color: brand.ink,
                                      fontWeight: 700,
                                      cursor: "pointer",
                                    }}
                                  >
                                    Close
                                  </button>
                                </div>
                                <div
                                  style={{
                                    display: "grid",
                                    gap: "12px",
                                    gridTemplateColumns:
                                      "repeat(auto-fit, minmax(240px, 1fr))",
                                  }}
                                >
                                  <div style={{ display: "grid", gap: "8px" }}>
                                    <label
                                      style={{
                                        color: brand.subtleText,
                                        fontWeight: 700,
                                      }}
                                    >
                                      Name
                                    </label>
                                    <input
                                      type="text"
                                      value={editing.name || ""}
                                      onChange={(e) =>
                                        updatePetField(
                                          pet.id,
                                          "name",
                                          e.target.value
                                        )
                                      }
                                      placeholder="Name"
                                      style={{
                                        padding: "12px",
                                        borderRadius: "12px",
                                        border: `1px solid ${brand.cardBorder}`,
                                        background: "rgba(255,255,255,0.04)",
                                        color: brand.ink,
                                      }}
                                    />
                                   </div>
                                  <div style={{ display: "grid", gap: "8px" }}>
                                    <label
                                      style={{
                                        color: brand.subtleText,
                                        fontWeight: 700,
                                      }}
                                    >
                                      Breed
                                    </label>
                                    <input
                                      type="text"
                                      value={editing.breed || ""}
                                      onChange={(e) =>
                                        updatePetField(
                                          pet.id,
                                          "breed",
                                          e.target.value
                                        )
                                      }
                                      placeholder="Breed"
                                      style={{
                                        padding: "12px",
                                        borderRadius: "12px",
                                        border: `1px solid ${brand.cardBorder}`,
                                        background: "rgba(255,255,255,0.04)",
                                        color: brand.ink,
                                      }}
                                    />
                                  </div>
                                </div>
                                <div
                                  style={{
                                    display: "flex",
                                    gap: "16px",
                                    alignItems: "center",
                                    flexWrap: "wrap",
                                  }}
                                >
                                  <div
                                    style={{
                                      display: "flex",
                                      flexDirection: "column",
                                      gap: "6px",
                                    }}
                                  >
                                    <label
                                      style={{
                                        color: brand.subtleText,
                                        fontWeight: 700,
                                      }}
                                    >
                                      Profile photo
                                    </label>
                                    <input
                                      type="file"
                                      accept="image/*"
                                      onChange={(e) =>
                                        handleExistingPetPhotoChange(
                                          pet.id,
                                          e.target.files?.[0]
                                        )
                                      }
                                      style={{
                                        padding: "10px",
                                        borderRadius: "10px",
                                        border: `1px solid ${brand.cardBorder}`,
                                        background: "rgba(255,255,255,0.04)",
                                        color: brand.ink,
                                      }}
                                    />
                                  </div>
                                  {(editing.photoDataUrl ||
                                    editing.photo_data_url) && (
                                    <div
                                      style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "12px",
                                      }}
                                    >
                                      <img
                                        src={
                                          editing.photoDataUrl ||
                                          editing.photo_data_url
                                        }
                                        alt={`${
                                          editing.name || pet.name
                                        } preview`}
                                        style={{
                                          width: "84px",
                                          height: "84px",
                                          borderRadius: "16px",
                                          objectFit: "cover",
                                          border: `1px solid ${brand.cardBorder}`,
                                        }}
                                        loading="lazy"
                                      />
                                      <button
                                        type="button"
                                        onClick={() =>
                                          clearExistingPetPhoto(pet.id)
                                        }
                                        style={{
                                          padding: "8px 12px",
                                          borderRadius: "10px",
                                          border: `1px solid ${brand.cardBorder}`,
                                          background: "rgba(255,255,255,0.06)",
                                          color: brand.ink,
                                          fontWeight: 700,
                                          cursor: "pointer",
                                        }}
                                      >
                                        Remove photo
                                      </button>
                                    </div>
                                  )}
                                </div>
                                <div style={{ display: "grid", gap: "8px" }}>
                                  <label
                                    style={{
                                      color: brand.subtleText,
                                      fontWeight: 700,
                                    }}
                                  >
                                    Notes
                                  </label>
                                  <textarea
                                    value={editing.notes || ""}
                                    onChange={(e) =>
                                      updatePetField(
                                        pet.id,
                                        "notes",
                                        e.target.value
                                      )
                                    }
                                    placeholder="Notes"
                                    style={{
                                      padding: "12px",
                                      borderRadius: "12px",
                                      border: `1px solid ${brand.cardBorder}`,
                                      minHeight: "140px",
                                      background: "rgba(255,255,255,0.04)",
                                      color: brand.ink,
                                    }}
                                  />
                                </div>
                                <div
                                  style={{
                                    display: "flex",
                                    gap: "10px",
                                    justifyContent: "flex-end",
                                    flexWrap: "wrap",
                                  }}
                                >
                                  <button
                                    type="button"
                                    onClick={() => stopEditingPet(pet.id)}
                                    style={{
                                      padding: "12px 16px",
                                      borderRadius: "12px",
                                      border: `1px solid ${brand.cardBorder}`,
                                      background: "rgba(255,255,255,0.06)",
                                      color: brand.ink,
                                      fontWeight: 700,
                                      cursor: "pointer",
                                    }}
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => savePetEdit(pet.id)}
                                    style={{
                                      padding: "12px 18px",
                                      borderRadius: "12px",
                                      border: "none",
                                      background: brand.primary,
                                      color: "#fff",
                                      fontWeight: 800,
                                      cursor: "pointer",
                                      boxShadow: brand.cardShadow,
                                    }}
                                  >
                                    Save pet
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                      })}
                    </div>
                  ) : (
                    <div style={emptyStateStyle}>
                      <p style={{ margin: 0 }}>
                        <strong>Ready to add a pet?</strong> Your companions
                        will show here with their favorite details.
                      </p>
                    </div>
                  )}

                  <div
                    style={{
                      marginTop: "18px",
                      padding: "16px",
                      borderRadius: "16px",
                      background: brand.surface,
                      border: `1px solid ${brand.cardBorder}`,
                      color: brand.ink,
                    }}
                  >
                    <h3 style={{ margin: "0 0 10px", color: brand.ink }}>
                      Add a new pet
                    </h3>
                    <div
                      style={{
                        display: "grid",
                        gap: "10px",
                        gridTemplateColumns:
                          "repeat(auto-fit, minmax(220px, 1fr))",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "6px",
                        }}
                      >
                        <label
                          style={{ color: brand.subtleText, fontWeight: 700 }}
                        >
                          Name
                        </label>
                        <input
                          type="text"
                          placeholder="Luna"
                          value={newPet.name}
                          onChange={(e) =>
                            setNewPet({ ...newPet, name: e.target.value })
                          }
                          style={{
                            padding: "12px",
                            borderRadius: "12px",
                            border: `1px solid ${brand.cardBorder}`,
                            background: "rgba(255,255,255,0.04)",
                            color: brand.ink,
                          }}
                        />
                      </div>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "6px",
                        }}
                      >
                        <label
                          style={{ color: brand.subtleText, fontWeight: 700 }}
                        >
                          Profile photo
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            handleNewPetPhotoChange(e.target.files?.[0])
                          }
                          style={{
                            padding: "12px",
                            borderRadius: "12px",
                            border: `1px solid ${brand.cardBorder}`,
                            background: "rgba(255,255,255,0.04)",
                            color: brand.ink,
                          }}
                        />
                        {newPet.photoDataUrl && (
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "10px",
                            }}
                          >
                            <img
                              src={newPet.photoDataUrl}
                              alt={`${newPet.name || "New pet"} preview`}
                              style={{
                                width: "72px",
                                height: "72px",
                                borderRadius: "14px",
                                objectFit: "cover",
                                border: `1px solid ${brand.cardBorder}`,
                              }}
                              loading="lazy"
                            />
                            <button
                              type="button"
                              onClick={clearNewPetPhoto}
                              style={{
                                padding: "8px 12px",
                                borderRadius: "10px",
                                border: `1px solid ${brand.cardBorder}`,
                                background: "rgba(255,255,255,0.06)",
                                color: brand.ink,
                                fontWeight: 700,
                                cursor: "pointer",
                              }}
                            >
                              Remove photo
                            </button>
                          </div>
                        )}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "6px",
                        }}
                      >
                        <label
                          style={{ color: brand.subtleText, fontWeight: 700 }}
                        >
                          Breed
                        </label>
                        <input
                          type="text"
                          placeholder="Golden Retriever"
                          value={newPet.breed}
                          onChange={(e) =>
                            setNewPet({ ...newPet, breed: e.target.value })
                          }
                          style={{
                            padding: "12px",
                            borderRadius: "12px",
                            border: `1px solid ${brand.cardBorder}`,
                            background: "rgba(255,255,255,0.04)",
                            color: brand.ink,
                          }}
                        />
                      </div>
                      <div
                        style={{
                          gridColumn: "1 / -1",
                          display: "flex",
                          flexDirection: "column",
                          gap: "6px",
                        }}
                      >
                        <label
                          style={{ color: brand.subtleText, fontWeight: 700 }}
                        >
                          Notes
                        </label>
                        <textarea
                          placeholder="Feeding instructions, personality notes, medication..."
                          value={newPet.notes}
                          onChange={(e) =>
                            setNewPet({ ...newPet, notes: e.target.value })
                          }
                          style={{
                            padding: "12px",
                            borderRadius: "12px",
                            border: `1px solid ${brand.cardBorder}`,
                            background: "rgba(255,255,255,0.04)",
                            color: brand.ink,
                            minHeight: "90px",
                          }}
                        />
                      </div>
                    </div>
                    <div
                      style={{
                        marginTop: "10px",
                        display: "flex",
                        justifyContent: "flex-end",
                      }}
                    >
                      <button
                        type="button"
                        onClick={createPet}
                        style={{
                          padding: "12px 16px",
                          borderRadius: "12px",
                          border: "none",
                          background: brand.primary,
                          color: "white",
                          fontWeight: 800,
                          cursor: "pointer",
                          boxShadow: brand.cardShadow,
                        }}
                      >
                        Save pet
                      </button>
                    </div>
                  </div>
                </SectionCard>
              )}

              {showBookings && (
                <SectionCard
                  title="Bookings"
                  description="Tap a booking to view details or cancel recurring visits. Cancelling removes the event from your calendar, and cancelled bookings are hidden."
                >
                  {hasBookings ? (
                    <div className="jp-profile-booking-calendar">
                      <CalendarSection
                        monthLabel={monthLabel}
                        weekdayLabels={weekdayLabels}
                        monthMatrix={monthMatrix}
                        visibleMonth={visibleMonth}
                        availabilityMap={bookingCalendarMap}
                        isDayAvailableForService={isBookingDayAvailable}
                        selectedDate={selectedDate}
                        selectedSlots={bookedDateSlots}
                        handleDaySelection={handleDaySelection}
                        onPreviousMonth={handlePreviousMonth}
                        onNextMonth={handleNextMonth}
                        disablePastDates={false}
                      />
                      <div className="jp-booking-day-panel">
                        <div className="jp-booking-day-header">
                          <p className="jp-booking-day-title">
                            {selectedDateLabel}
                          </p>
                          <p className="jp-booking-day-subtitle">
                            Tap a booking to view details or cancel.
                          </p>
                        </div>
                        {selectedDateBookings.length ? (
                          <ul className="jp-booking-day-list">
                            {selectedDateBookings.map((booking) => (
                              <li
                                key={booking.id}
                                onClick={() => openBooking(booking)}
                                className="jp-booking-card"
                              >
                                <div className="jp-booking-card__row">
                                  <div>
                                    <p className="jp-booking-card__service">
                                      {booking.service_title ||
                                        booking?.services_catalog?.title ||
                                        "Service"}
                                    </p>
                                    <p className="jp-booking-card__time">
                                      {formatDateRange(booking)}
                                    </p>
                                  </div>
                                  <span className="jp-booking-card__status">
                                    {bookingStatusLabel(booking.status)}
                                  </span>
                                </div>
                                {booking.notes && (
                                  <p className="jp-booking-card__notes">
                                    {booking.notes}
                                  </p>
                                )}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <div style={emptyStateStyle}>
                            <p style={{ margin: 0 }}>
                              <strong>No bookings on this date.</strong> Pick
                              another day to review upcoming visits.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div style={emptyStateStyle}>
                      <p style={{ margin: 0 }}>
                        <strong>No bookings yet.</strong> Bookings will appear
                        here with times, services, and notes.
                      </p>
                    </div>
                  )}
                </SectionCard>
              )}
            </>
          </div>
        </div>

        <aside
          className={`jp-profile-details${showSidebar ? "" : " is-hidden"}`}
          aria-hidden={!showSidebar}
        >
          {showSidebar && (
            <>
              <div className="jp-detail-card">
                <p className="jp-detail-card__title">Signed in</p>
                <p className="jp-detail-card__subtitle">
                  {contactForm.fullName || "Client"} · {contactForm.email}
                </p>
                <div className="jp-detail-card__actions">
                  <button type="button" onClick={loadProfile}>
                    Refresh data
                  </button>
                  <button type="button" onClick={signOut} className="primary">
                    Sign out
                  </button>
                </div>
              </div>

              {showSidebarDetails && (
                <>
                  <div className="jp-detail-grid detail-section">
                    <div>
                      <p className="jp-type-caption">Pets</p>
                      <p className="jp-type-heading-4">
                        {profile?.pets?.length ?? 0}
                      </p>
                    </div>
                    <div>
                      <p className="jp-type-caption">Bookings</p>
                      <p className="jp-type-heading-4">
                        {profile?.bookings?.length ?? 0}
                      </p>
                    </div>
                    <div>
                      <p className="jp-type-caption">Upcoming</p>
                      <p className="jp-type-heading-4">
                        {activeBookings.length}
                      </p>
                    </div>
                  </div>

                  <div className="detail-section">
                    <p className="jp-type-caption">Contact</p>
                    <ul className="jp-detail-list">
                      <li>{contactForm.email || "hello@jeroenandpaws.com"}</li>
                      <li>{contactForm.phone || "+353 85 123 4567"}</li>
                      <li>{contactForm.address || "Dublin, Ireland"}</li>
                    </ul>
                  </div>
                </>
              )}
            </>
          )}
        </aside>
      </div>
      
      
      {selectedBooking && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.35)",
            display: "grid",
            placeItems: "center",
            padding: "16px",
            zIndex: 20,
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "18px",
              padding: "20px",
              width: "min(520px, 96vw)",
              boxShadow: brand.cardShadow,
              border: `1px solid ${brand.cardBorder}`,
              display: "grid",
              gap: "10px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h3 style={{ margin: 0, color: brand.neutral }}>
                Booking details
              </h3>
              <button
                type="button"
                onClick={() => setSelectedBooking(null)}
                style={{
                  border: "none",
                  background: "transparent",
                  fontSize: "1.2rem",
                  cursor: "pointer",
                  color: brand.subtleText,
                }}
              >
                ✕
              </button>
            </div>
            <p style={{ margin: 0, color: brand.primary, fontWeight: 800 }}>
              {selectedBooking.service_title ||
                selectedBooking?.services_catalog?.title ||
                "Service"}
            </p>
            <p style={{ margin: 0, color: brand.neutral, fontWeight: 600 }}>
              {formatDateRange(selectedBooking)}
            </p>
            <p
              style={{
                margin: 0,
                color: brand.subtleText,
                textTransform: "capitalize",
              }}
            >
              Status: {bookingStatusLabel(selectedBooking.status)}
            </p>
            {selectedBooking.notes && (
              <p style={{ margin: "8px 0 0", color: brand.subtleText }}>
                {selectedBooking.notes}
              </p>
            )}
            <p style={{ margin: "4px 0 0", color: brand.subtleText }}>
              Cancelling will end any recurrence request and remove this visit
              from your calendar.
            </p>
            <div
              style={{
                display: "flex",
                gap: "8px",
                justifyContent: "flex-end",
              }}
            >
              {bookingAction.error && (
                <span
                  style={{
                    color: "#b91c1c",
                    fontWeight: 700,
                    marginRight: "auto",
                  }}
                >
                  {bookingAction.error}
                </span>
              )}
              <button
                type="button"
                onClick={() => {
                  setSelectedBooking(null);
                  openReschedule(selectedBooking);
                }}
                disabled={!contactForm.email}
                style={{
                  padding: "10px 14px",
                  borderRadius: "10px",
                  border: `1px solid ${brand.primary}`,
                  background: "transparent",
                  color: brand.primary,
                  fontWeight: 800,
                  cursor: contactForm.email ? "pointer" : "not-allowed",
                  opacity: contactForm.email ? 1 : 0.6,
                }}
              >
                Reschedule
              </button>
              <button
                type="button"
                onClick={cancelBooking}
                disabled={bookingAction.cancelling}
                style={{
                  padding: "10px 14px",
                  borderRadius: "10px",
                  border: "none",
                  background: bookingAction.cancelling
                    ? brand.primarySoft
                    : "#ef4444",
                  color: "#fff",
                  fontWeight: 800,
                  cursor: bookingAction.cancelling ? "not-allowed" : "pointer",
                }}
              >
                {bookingAction.cancelling ? "Cancelling…" : "Cancel booking"}
              </button>
            </div>
          </div>
        </div>
      )}

      {rescheduleBooking && (
        <div className="jp-reschedule-overlay" role="dialog" aria-modal="true">
          <div className="jp-reschedule-modal">
            <div className="jp-reschedule-header">
              <div>
                <p className="jp-reschedule-kicker">Reschedule booking</p>
                <h3 className="jp-reschedule-title">
                  {rescheduleBooking.service_title ||
                    rescheduleBooking?.services_catalog?.title ||
                    "Service"}
                </h3>
              </div>
              <button
                type="button"
                onClick={closeReschedule}
                className="jp-reschedule-close"
                aria-label="Close reschedule panel"
              >
                ✕
              </button>
            </div>
            <div className="jp-reschedule-content">
              <p className="jp-reschedule-note">
                Choose a new time at least {rescheduleMinNoticeHours} hours in
                advance. We'll re-check availability, travel buffers, and send an
                Outlook update that adds the new visit to your calendar
                automatically.
              </p>
            {rescheduleError && (
                <p className="jp-reschedule-alert jp-reschedule-alert--error">
                  {rescheduleError}
                </p>
              )}
              {rescheduleSuccess && (
                <p className="jp-reschedule-alert jp-reschedule-alert--success">
                  {rescheduleSuccess}
                </p>
              )}
              <div className="jp-reschedule-grid">
                <CalendarSection
                  monthLabel={rescheduleMonthLabel}
                  weekdayLabels={weekdayLabels}
                  monthMatrix={rescheduleMonthMatrix}
                  visibleMonth={rescheduleVisibleMonth}
                  availabilityMap={rescheduleAvailabilityMap}
                  isDayAvailableForService={isRescheduleDayAvailable}
                  selectedDate={rescheduleSelectedDate}
                  selectedSlots={
                    rescheduleSelectedDate && rescheduleSelectedTime
                      ? { [rescheduleSelectedDate]: rescheduleSelectedTime }
                      : {}
                  }
                  handleDaySelection={handleRescheduleDaySelection}
                  onPreviousMonth={handleReschedulePreviousMonth}
                  onNextMonth={handleRescheduleNextMonth}
                  loading={rescheduleLoading}
                  disablePastDates={true}
                />
                <TimesSection
                  selectedDay={rescheduleSelectedDay}
                  isDayAvailableForService={isRescheduleDayAvailable}
                  selectedTime={rescheduleSelectedTime}
                  handleTimeSelection={setRescheduleSelectedTime}
                  formatTime={formatRescheduleTime}
                  onContinue={submitReschedule}
                  onBack={null}
                  canContinue={
                    Boolean(rescheduleSelectedTime) && !rescheduleSubmitting
                  }
                  continueLabel={
                    rescheduleSubmitting ? "Rescheduling…" : "Reschedule"
                  }
                  travelMinutes={0}
                  travelAnchor="home"
                  isTravelValidationPending={false}
                  travelNote=""
                />
              </div>
              <div className="jp-reschedule-footer">
                <button
                  type="button"
                  onClick={closeReschedule}
                  className="jp-reschedule-secondary"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default ProfilePage;
