import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAuth } from "../../src/context/AuthContext";

// ---- MOCK PROFILE SUPPORT (unchanged semantics) ----

const mockProfile = {
  client: {
    id: "demo-client",
    full_name: "Jeroen & Paws Guest",
    email: "demo@jeroenandpaws.com",
    phone_number: "+1 (555) 123-4567",
    address: "123 Park Lane, Toronto",
  },
  pets: [
    {
      id: "pet-1",
      name: "Luna",
      breed: "Golden Retriever",
      notes: "Loves long walks and peanut butter treats.",
      photo_data_url: null,
    },
    {
      id: "pet-2",
      name: "Milo",
      breed: "Corgi",
      notes: "Keep an eye on the zoomies after lunch.",
      photo_data_url: null,
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
  activity: [],
};

const useMockProfile =
  typeof process !== "undefined" &&
  process.env.NEXT_PUBLIC_MOCK_PROFILE === "true";

// ---- UTILITIES ----

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

const bookingStatusLabel = (status = "") => {
  const normalized = status.toLowerCase();

  if (!normalized || normalized === "pending") return "Waiting confirmation";
  if (["scheduled", "confirmed"].includes(normalized)) return "Scheduled";
  if (["cancelled", "canceled"].includes(normalized)) return "Cancelled";
  return status;
};

const fileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

// ---- SMALL PRESENTATIONAL BUILDING BLOCKS ----

const SectionToggle = ({ label, active, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={active}
    aria-label={`${active ? "Hide" : "Show"} ${label} section`}
    className={`rounded-full border px-3 py-1 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple focus-visible:ring-offset-2 focus-visible:ring-offset-white ${
      active
        ? "border-brand-purple bg-brand-purple/10 text-brand-purple shadow-sm"
        : "border-slate-300 text-slate-600 hover:border-brand-purple hover:text-brand-purple"
    }`}
  >
    {active ? "Hide" : "Show"} {label}
  </button>
);

const InfoChip = ({ label }) => (
  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
    {label}
  </span>
);

const SectionCard = ({ title, description, action, children }) => (
  <section
    aria-label={title}
    className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
  >
    <div className="mb-4 flex items-start justify-between gap-4">
      <div>
        <h2 className="text-lg font-bold text-slate-900">{title}</h2>
        {description && (
          <p className="text-sm text-slate-600">{description}</p>
        )}
      </div>
      {action}
    </div>
    <div className="space-y-4">{children}</div>
  </section>
);

// ---- SECTION COMPONENTS ----

const AboutSection = ({
  client,
  heroLocation,
  heroBio,
  stats,
  onEditProfile,
  onChangePassword,
}) => (
  <SectionCard
    title="About"
    description="A quick overview of your details and profile highlights."
    action={
      <div className="flex flex-col items-end gap-2">
        <InfoChip label={client?.memberSince || "Client profile"} />
        <button
          type="button"
          onClick={onEditProfile}
          className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-brand-purple transition hover:border-brand-purple hover:bg-brand-purple/10"
        >
          Edit profile
        </button>
      </div>
    }
  >
    <div className="flex flex-col gap-3 text-sm text-slate-700">
      <p>
        <span className="font-semibold text-slate-900">Name:</span>{" "}
        {client?.full_name || "Add your name"}
      </p>
      <p>
        <span className="font-semibold text-slate-900">Email:</span>{" "}
        {client?.email || "Add your email"}
      </p>
      <p>
        <span className="font-semibold text-slate-900">Phone:</span>{" "}
        {client?.phone_number || "Add phone number"}
      </p>
      <p>
        <span className="font-semibold text-slate-900">Service address:</span>{" "}
        {client?.address || "Add address"}
      </p>
      <p>
        <span className="font-semibold text-slate-900">Location:</span>{" "}
        {heroLocation}
      </p>
      <p className="leading-relaxed">{heroBio}</p>
      <div className="flex flex-wrap gap-2">
        <InfoChip label={`${stats.upcoming} upcoming visits`} />
        <InfoChip label={`${stats.pets} pets`} />
        <InfoChip label={`${stats.bookings} saved bookings`} />
      </div>
      <div>
        <button
          type="button"
          onClick={onChangePassword}
          className="mt-2 rounded-full border border-slate-200 px-4 py-1 text-xs font-semibold text-slate-700 transition hover:border-brand-purple hover:bg-brand-purple/10"
        >
          Change password
        </button>
      </div>
    </div>
  </SectionCard>
);

const PetsSection = ({ pets, onAddPet, onEditPet }) => {
  const hasPets = pets && pets.length > 0;

  return (
    <SectionCard
      title="Pets"
      description="See and manage the pets connected to your profile."
      action={
        <button
          type="button"
          onClick={onAddPet}
          className="rounded-full border border-slate-200 bg-brand-purple/10 px-3 py-1 text-xs font-semibold text-brand-purple transition hover:border-brand-purple hover:bg-brand-purple/15"
        >
          Add pet
        </button>
      }
    >
      {hasPets ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {pets.map((pet) => {
            const petInitial =
              (pet.name || "?").charAt(0).toUpperCase();
            const petPhoto =
              pet.photoDataUrl || pet.photo_data_url || null;

            return (
              <div
                key={pet.id}
                className="rounded-xl border border-slate-200 bg-gradient-to-br from-white to-brand-purple/10 p-4 shadow-sm"
              >
                <div className="mb-3 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    {petPhoto ? (
                      <img
                        src={petPhoto}
                        alt={`${pet.name} profile`}
                        className="h-12 w-12 rounded-xl border border-slate-200 object-cover"
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-brand-purple/10 text-sm font-bold text-brand-purple">
                        {petInitial}
                      </div>
                    )}
                    <div>
                      <p className="text-base font-bold text-slate-900">
                        {pet.name}
                      </p>
                      <p className="text-xs font-semibold text-slate-600">
                        {pet.breed || "Add breed"}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onEditPet(pet)}
                    className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 transition hover:border-brand-purple hover:bg-brand-purple/10"
                  >
                    Edit
                  </button>
                </div>
                <p className="text-sm text-slate-600">
                  {pet.notes || "Add notes about this pet."}
                </p>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-start gap-2 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
          <p className="font-semibold text-slate-900">No pets yet</p>
          <p>
            Add your first pet so we can personalize your bookings and
            updates.
          </p>
          <button
            type="button"
            onClick={onAddPet}
            className="mt-1 rounded-full border border-brand-purple/30 bg-white px-4 py-1 text-xs font-semibold text-brand-purple transition hover:border-brand-purple hover:bg-brand-purple/10"
          >
            Add a pet
          </button>
        </div>
      )}
    </SectionCard>
  );
};

const BookingsSection = ({ bookings, onOpenBooking }) => {
  const hasBookings = bookings && bookings.length > 0;

  return (
    <SectionCard
      title="Bookings"
      description="Upcoming visits and training sessions."
    >
      {hasBookings ? (
        <div className="space-y-3">
          {bookings.map((booking) => (
            <button
              key={booking.id}
              type="button"
              onClick={() => onOpenBooking(booking)}
              className="flex w-full flex-col gap-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-brand-purple hover:shadow"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-brand-purple">
                    {booking.service_title ||
                      booking?.services_catalog?.title ||
                      "Service"}
                  </p>
                  <p className="text-xs text-slate-600">
                    {formatDateRange(booking)}
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                    booking.status &&
                    ["scheduled", "confirmed"].includes(
                      booking.status.toLowerCase()
                    )
                      ? "bg-green-100 text-green-800"
                      : booking.status &&
                        ["cancelled", "canceled"].includes(
                          booking.status.toLowerCase()
                        )
                      ? "bg-rose-100 text-rose-800"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {bookingStatusLabel(booking.status)}
                </span>
              </div>
              {booking.notes && (
                <p className="text-xs text-slate-600">{booking.notes}</p>
              )}
            </button>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-start gap-2 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
          <p className="font-semibold text-slate-900">
            No bookings yet
          </p>
          <p>
            Your upcoming visits will appear here with times, services,
            and trainer notes.
          </p>
        </div>
      )}
    </SectionCard>
  );
};

const ActivitySection = ({
  activity,
  pinnedIds,
  onTogglePin,
}) => {
  const hasActivity = activity && activity.length > 0;

  const orderedActivity = useMemo(() => {
    if (!activity) return [];
    if (!pinnedIds.length) return activity;

    const pinnedSet = new Set(pinnedIds);
    const pinned = activity.filter((a) => pinnedSet.has(a.id));
    const unpinned = activity.filter((a) => !pinnedSet.has(a.id));

    return [...pinned, ...unpinned];
  }, [activity, pinnedIds]);

  return (
    <SectionCard
      title="Latest updates"
      description="Recent notes, badges, and milestones."
    >
      {hasActivity ? (
        orderedActivity.map((item) => {
          const isPinned = pinnedIds.includes(item.id);
          return (
            <div
              key={item.id}
              className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm"
            >
              <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-brand-purple to-brand-purpleDark text-lg font-black text-white">
                {item.type === "badge" ? "★" : "i"}
              </div>
              <div className="flex-1 text-sm text-slate-700">
                <p className="font-bold text-slate-900">
                  {item.label}
                </p>
                <p>{item.detail}</p>
              </div>
              <button
                type="button"
                onClick={() => onTogglePin(item.id)}
                className={`rounded-full border px-3 py-1 text-xs font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple focus-visible:ring-offset-2 focus-visible:ring-offset-white ${
                  isPinned
                    ? "border-brand-purple bg-brand-purple/10 text-brand-purple"
                    : "border-slate-200 text-brand-purple hover:border-brand-purple hover:bg-brand-purple/10"
                }`}
              >
                {isPinned ? "Pinned" : "Pin"}
              </button>
            </div>
          );
        })
      ) : (
        <div className="flex flex-col items-start gap-2 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
          <p className="font-semibold text-slate-900">No updates yet</p>
          <p>
            Trainer notes and badges will appear here after your
            visits.
          </p>
        </div>
      )}
    </SectionCard>
  );
};

const ShortcutsSection = ({
  onAddPet,
  onOpenResetModal,
}) => (
  <SectionCard
    title="Shortcuts"
    description="Jump to the actions you use the most."
  >
    <div className="flex flex-wrap gap-3">
      <button
        type="button"
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-semibold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-purple hover:shadow sm:w-auto"
      >
        Message trainer
        <p className="text-xs font-normal text-slate-600">
          Email client care for help
        </p>
      </button>
      <button
        type="button"
        onClick={onAddPet}
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-semibold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-purple hover:shadow sm:w-auto"
      >
        Add a pet
        <p className="text-xs font-normal text-slate-600">
          Share their details
        </p>
      </button>
      <button
        type="button"
        onClick={onOpenResetModal}
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-semibold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-purple hover:shadow sm:w-auto"
      >
        Reset password
        <p className="text-xs font-normal text-slate-600">
          Get a reset link by email
        </p>
      </button>
    </div>
  </SectionCard>
);

// ---- LOCAL STORAGE KEY FOR TOGGLES ----

const SECTIONS_STORAGE_KEY = "modernProfile.sections";

// ---- MAIN COMPONENT ----

const ModernProfile = () => {
  const {
    profile: authProfile,
    setProfile: setAuthProfile,
    logout: clearAuth,
  } = useAuth();

  const initialProfile = useMockProfile ? mockProfile : authProfile;

  // Core profile state
  const [profile, setProfile] = useState(initialProfile);
  const [email, setEmail] = useState(
    initialProfile?.client?.email || ""
  );
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Contact + account
  const [contactForm, setContactForm] = useState({
    fullName: initialProfile?.client?.full_name || "",
    phone: initialProfile?.client?.phone_number || "",
    email: initialProfile?.client?.email || "",
    address: initialProfile?.client?.address || "",
  });
  const [savingContact, setSavingContact] = useState(false);

  // Password change
  const [currentPasswordInput, setCurrentPasswordInput] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  // Password reset
  const [resetEmail, setResetEmail] = useState(
    initialProfile?.client?.email || ""
  );
  const [resetStatus, setResetStatus] = useState({
    state: "idle",
    message: "",
  });

  // Login attempts (used to decide when to suggest reset)
  const [loginAttempts, setLoginAttempts] = useState(0);

  // Pet modal
  const [isPetModalOpen, setIsPetModalOpen] = useState(false);
  const [petModalMode, setPetModalMode] = useState("new"); // "new" | "edit"
  const [petForm, setPetForm] = useState({
    id: null,
    name: "",
    breed: "",
    notes: "",
    photoDataUrl: null,
    photo_data_url: null,
    photoName: "",
  });

  // Booking modal
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [bookingAction, setBookingAction] = useState({
    cancelling: false,
    error: "",
  });

  // Contact & password modals
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  // Section toggles
  const [sections, setSections] = useState(() => {
    if (typeof window === "undefined") {
      return {
        about: true,
        pets: true,
        bookings: true,
        activity: true,
      };
    }
    try {
      const raw = window.localStorage.getItem(SECTIONS_STORAGE_KEY);
      if (!raw) {
        return {
          about: true,
          pets: true,
          bookings: true,
          activity: true,
        };
      }
      const parsed = JSON.parse(raw);
      return {
        about: parsed.about ?? true,
        pets: parsed.pets ?? true,
        bookings: parsed.bookings ?? true,
        activity: parsed.activity ?? true,
      };
    } catch {
      return {
        about: true,
        pets: true,
        bookings: true,
        activity: true,
      };
    }
  });

  const [pinnedActivityIds, setPinnedActivityIds] = useState([]);

  // ---- Section toggles persistence ----

  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        window.localStorage.setItem(
          SECTIONS_STORAGE_KEY,
          JSON.stringify(sections)
        );
      }
    } catch {
      // ignore
    }
  }, [sections]);

  const toggleSection = (key) =>
    setSections((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));

  // ---- Helper: keep contact form / auth context in sync ----

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

  // ---- Initialize from auth/mocks ----

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
    setContactForm({
      fullName: "",
      phone: "",
      email: "",
      address: "",
    });
    setEmail("");
    setResetEmail("");
  }, [authProfile, refreshContactForm]);

  // ---- Derived values ----

  const activeBookings = useMemo(() => {
    const clean = (status = "") => status?.toLowerCase();
    return (profile?.bookings || []).filter(
      (booking) =>
        !["cancelled", "canceled"].includes(clean(booking.status))
    );
  }, [profile]);

  const hasPets = useMemo(
    () => (profile?.pets || []).length > 0,
    [profile]
  );

  const profileStats = useMemo(
    () => ({
      pets: profile?.pets?.length || 0,
      bookings: profile?.bookings?.length || 0,
      upcoming: activeBookings.length,
    }),
    [activeBookings.length, profile?.bookings?.length, profile?.pets?.length]
  );

  // ---- Load profile (login + refresh) ----

  const loadProfile = async () => {
    if (!email || !password) {
      setError(
        "Please enter both email and password to view your profile."
      );
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
      setResetStatus({ state: "idle", message: "" });
    } catch (err) {
      setError(err.message || "Could not load profile");
      setProfile(null);
      setResetEmail(email || resetEmail);
      setLoginAttempts((previous) => previous + 1);
    } finally {
      setLoading(false);
    }
  };

  // ---- Fetch bookings from backend ----

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
  }, [profile?.client?.email]);

  // ---- Fetch pets from backend ----

  useEffect(() => {
    const refreshPets = async () => {
      if (useMockProfile || !profile?.client?.email) return;

      try {
        const response = await fetch(
          `/api/pets?ownerEmail=${encodeURIComponent(
            profile.client.email
          )}`
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
        console.error("Failed to refresh pets", err);
      }
    };

    refreshPets();
  }, [profile?.client?.email]);

  // ---- Save contact details ----

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
      setIsContactModalOpen(false);
    } catch (err) {
      setError(err.message || "Unable to save details");
    } finally {
      setSavingContact(false);
    }
  };

  // ---- Save password ----

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
      setIsPasswordModalOpen(false);
    } catch (err) {
      setError(err.message || "Unable to update password");
    } finally {
      setSavingPassword(false);
    }
  };

  // ---- Pet modal helpers ----

  const openNewPetModal = () => {
    setPetModalMode("new");
    setPetForm({
      id: null,
      name: "",
      breed: "",
      notes: "",
      photoDataUrl: null,
      photo_data_url: null,
      photoName: "",
    });
    setIsPetModalOpen(true);
  };

  const openEditPetModal = (pet) => {
    setPetModalMode("edit");
    setPetForm({
      id: pet.id,
      name: pet.name || "",
      breed: pet.breed || "",
      notes: pet.notes || "",
      photoDataUrl: pet.photoDataUrl || null,
      photo_data_url: pet.photo_data_url || null,
      photoName: pet.photoName || "",
    });
    setIsPetModalOpen(true);
  };

  const handlePetPhotoChange = async (file) => {
    if (!file) return;
    const dataUrl = await fileToDataUrl(file);
    setPetForm((prev) => ({
      ...prev,
      photoDataUrl: dataUrl,
      photo_data_url: dataUrl,
      photoName: file.name,
    }));
  };

  const clearPetPhoto = () => {
    setPetForm((prev) => ({
      ...prev,
      photoDataUrl: null,
      photo_data_url: null,
      photoName: "",
    }));
  };

  const savePet = async () => {
    if (!contactForm.email && !email) {
      setError("Email is required to manage pets.");
      return;
    }

    try {
      if (petModalMode === "new") {
        const response = await fetch("/api/pets", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ownerEmail: contactForm.email || email,
            name: petForm.name,
            breed: petForm.breed,
            notes: petForm.notes,
            photoDataUrl: petForm.photoDataUrl,
            photoName: petForm.photoName,
          }),
        });

        if (!response.ok) {
          throw new Error("Could not save pet");
        }

        setPetForm({
          id: null,
          name: "",
          breed: "",
          notes: "",
          photoDataUrl: null,
          photo_data_url: null,
          photoName: "",
        });
        setIsPetModalOpen(false);
        await loadProfile();
      } else {
        const response = await fetch("/api/pets", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ownerEmail: contactForm.email || email,
            ...petForm,
          }),
        });

        const payload = await response.json().catch(() => null);
        if (!response.ok) {
          throw new Error(payload?.message || "Could not update pet");
        }

        persistProfileState((currentProfile) => {
          const nextPets = (currentProfile?.pets || []).map((pet) =>
            pet.id === petForm.id ? payload.pet : pet
          );
          return { ...currentProfile, pets: nextPets };
        });
        setIsPetModalOpen(false);
      }
    } catch (err) {
      setError(err.message || "Unable to save pet");
    }
  };

  // ---- Booking helpers ----

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
        const nextBookings = (currentProfile?.bookings || []).map(
          (booking) =>
            booking.id === selectedBooking.id
              ? payload.booking
              : booking
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
      setBookingAction((prev) => ({
        ...prev,
        cancelling: false,
      }));
    }
  };

  // ---- Password reset ----

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
        throw new Error(
          payload?.message || "Could not submit your request."
        );
      }

      setResetStatus({
        state: "success",
        message:
          "Check your inbox for the next steps to reset your password.",
      });
    } catch (err) {
      setResetStatus({
        state: "error",
        message:
          err.message || "Unable to process your request right now.",
      });
    }
  };

  // ---- Sign out ----

  const signOut = () => {
    setProfile(null);
    clearAuth?.();
    setContactForm({
      fullName: "",
      phone: "",
      email: "",
      address: "",
    });
    setPassword("");
    setSelectedBooking(null);
    setLoginAttempts(0);
    setResetStatus({ state: "idle", message: "" });
  };

  // ---- Activity pinning ----

  const handleTogglePin = (activityId) => {
    setPinnedActivityIds((prev) =>
      prev.includes(activityId)
        ? prev.filter((id) => id !== activityId)
        : [...prev, activityId]
    );
  };

  // ---- Hero data ----

  const heroName =
    profile?.client?.full_name ||
    (profile ? "Client" : "Profile & Booking Center");
  const heroLocation =
    profile?.client?.address ||
    profile?.client?.location ||
    "Your favourite neighbourhood";
  const heroBio = profile
    ? "Manage your contact details, pets, and bookings in one place."
    : "Use the email and password you provided when booking with us.";

  const heroInitial =
    profile?.client?.full_name?.[0]?.toUpperCase() ||
    "J";

  const showResetHint = !profile && loginAttempts >= 3;

  // ---- Render ----

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 pb-16">
      {/* Hero */}
      <header className="relative h-52 w-full overflow-hidden rounded-b-3xl bg-gradient-to-r from-brand-purple via-brand-purpleDark to-purple-400 shadow-lg">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.18),transparent_35%),radial-gradient(circle_at_80%_10%,rgba(255,255,255,0.22),transparent_25%)]" />
        <div className="absolute inset-0 flex items-end px-6 pb-6 sm:px-10">
          <div className="flex items-end gap-4">
            <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-white/80 text-3xl font-black text-brand-purple shadow-xl">
              {heroInitial}
            </div>
            <div className="text-white">
              <p className="text-sm uppercase tracking-[0.2em] opacity-70">
                {profile ? "Client hub" : "Sign in to your hub"}
              </p>
              <h1 className="text-3xl font-black drop-shadow-lg sm:text-4xl">
                {heroName}
              </h1>
              <p className="text-sm font-semibold opacity-90">
                {heroLocation}
              </p>
              <p className="max-w-2xl text-sm opacity-90">{heroBio}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto mt-6 max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Error banner */}
        {error && (
          <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            {error}
          </div>
        )}

        {/* If no profile: show login view */}
        {!profile ? (
          <div className="mt-4 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <SectionCard
              title="Access your profile"
              description="Use the email you provided when booking with us."
            >
              <div className="grid gap-4 sm:grid-cols-[1.4fr_1.1fr]">
                <div className="space-y-3">
                  <div className="space-y-1 text-sm">
                    <label className="block text-slate-700">
                      Email
                    </label>
                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/30"
                    />
                  </div>
                  <div className="space-y-1 text-sm">
                    <label className="block text-slate-700">
                      Password
                    </label>
                    <input
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) =>
                        setPassword(e.target.value)
                      }
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/30"
                    />
                  </div>
                  <div className="flex flex-wrap gap-3 pt-1">
                    <button
                      type="button"
                      onClick={loadProfile}
                      disabled={loading || !email || !password}
                      className={`rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-sm transition ${
                        loading || !email || !password
                          ? "cursor-not-allowed bg-brand-purple/20 text-slate-500"
                          : "bg-brand-purple hover:bg-brand-purpleDark"
                      }`}
                    >
                      {loading ? "Loading…" : "View profile"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsResetModalOpen(true);
                        setResetStatus({
                          state: "idle",
                          message: "",
                        });
                        setResetEmail(email || resetEmail);
                      }}
                      className="rounded-xl border border-slate-200 bg-brand-purple/10 px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-brand-purple hover:bg-brand-purple/10"
                    >
                      Set a new password
                    </button>
                  </div>
                  {showResetHint && (
                    <p className="text-xs text-slate-500">
                      Having trouble signing in? Try requesting a reset
                      link so you can set a new password.
                    </p>
                  )}
                </div>
                <div className="space-y-2 rounded-2xl border border-slate-200 bg-brand-purple/12 p-4 text-sm text-slate-700">
                  <p className="font-semibold text-slate-900">
                    What you can do here
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-xs">
                    <li>Update your contact details and address.</li>
                    <li>Manage your pets and their profiles.</li>
                    <li>See and cancel upcoming bookings.</li>
                    <li>Request a password reset if needed.</li>
                  </ul>
                </div>
              </div>
            </SectionCard>
            <ShortcutsSection
              onAddPet={() => {}}
              onOpenResetModal={() => {
                setIsResetModalOpen(true);
                setResetStatus({ state: "idle", message: "" });
                setResetEmail(email || resetEmail);
              }}
            />
          </div>
        ) : (
          <>
            {/* Signed-in info + toggles */}
            <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 shadow-sm">
                <div className="flex-1">
                  <p className="font-semibold">
                    Signed in as {contactForm.fullName || "Client"}
                  </p>
                  <p className="text-xs text-slate-500">
                    {contactForm.email}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={loadProfile}
                    className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:border-brand-purple hover:bg-brand-purple/10"
                  >
                    Refresh
                  </button>
                  <button
                    type="button"
                    onClick={signOut}
                    className="rounded-full bg-brand-purple px-3 py-1 text-xs font-semibold text-white shadow-sm transition hover:bg-brand-purpleDark"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            </div>

            {/* Layout grid */}
            <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              {/* Left column */}
              <div className="space-y-6">
                {sections.about && (
                  <AboutSection
                    client={profile?.client}
                    heroLocation={heroLocation}
                    heroBio={heroBio}
                    stats={profileStats}
                    onEditProfile={() =>
                      setIsContactModalOpen(true)
                    }
                    onChangePassword={() =>
                      setIsPasswordModalOpen(true)
                    }
                  />
                )}

                {sections.pets && (
                  <PetsSection
                    pets={profile?.pets || []}
                    onAddPet={openNewPetModal}
                    onEditPet={openEditPetModal}
                  />
                )}

                {sections.bookings && (
                  <BookingsSection
                    bookings={activeBookings}
                    onOpenBooking={openBooking}
                  />
                )}
              </div>

              {/* Right column */}
              <div className="space-y-6">
                {sections.activity && (
                  <ActivitySection
                    activity={profile?.activity || []}
                    pinnedIds={pinnedActivityIds}
                    onTogglePin={handleTogglePin}
                  />
                )}

                <ShortcutsSection
                  onAddPet={openNewPetModal}
                  onOpenResetModal={() => {
                    setIsResetModalOpen(true);
                    setResetStatus({
                      state: "idle",
                      message: "",
                    });
                    setResetEmail(
                      contactForm.email || resetEmail
                    );
                  }}
                />
              </div>
            </div>
          </>
        )}
      </main>

      {/* ---- MODALS ---- */}

      {/* Contact modal */}
      {isContactModalOpen && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">
                Edit profile details
              </h3>
              <button
                type="button"
                onClick={() => setIsContactModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>
            <div className="grid gap-3 text-sm sm:grid-cols-2">
              <div className="space-y-1 sm:col-span-2">
                <label className="text-slate-700">
                  Full name
                </label>
                <input
                  type="text"
                  value={contactForm.fullName}
                  onChange={(e) =>
                    setContactForm((prev) => ({
                      ...prev,
                      fullName: e.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/30"
                />
              </div>
              <div className="space-y-1">
                <label className="text-slate-700">Phone</label>
                <input
                  type="tel"
                  value={contactForm.phone}
                  onChange={(e) =>
                    setContactForm((prev) => ({
                      ...prev,
                      phone: e.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/30"
                />
              </div>
              <div className="space-y-1">
                <label className="text-slate-700">Email</label>
                <input
                  type="email"
                  value={contactForm.email}
                  onChange={(e) =>
                    setContactForm((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/30"
                />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <label className="text-slate-700">
                  Service address
                </label>
                <textarea
                  value={contactForm.address}
                  onChange={(e) =>
                    setContactForm((prev) => ({
                      ...prev,
                      address: e.target.value,
                    }))
                  }
                  placeholder="Where should we meet you?"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/30"
                  rows={3}
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsContactModalOpen(false)}
                className="rounded-full border border-slate-200 px-4 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveContact}
                disabled={savingContact}
                className={`rounded-full px-4 py-1 text-xs font-semibold shadow-sm ${
                  savingContact
                    ? "cursor-not-allowed bg-brand-purple/15 text-slate-500"
                    : "bg-brand-purple text-white hover:bg-brand-purpleDark"
                }`}
              >
                {savingContact ? "Saving…" : "Save details"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Password modal */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">
                Change password
              </h3>
              <button
                type="button"
                onClick={() => setIsPasswordModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3 text-sm">
              <div className="space-y-1">
                <label className="text-slate-700">
                  Current password
                </label>
                <input
                  type="password"
                  value={currentPasswordInput}
                  onChange={(e) =>
                    setCurrentPasswordInput(e.target.value)
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/30"
                />
              </div>
              <div className="space-y-1">
                <label className="text-slate-700">
                  New password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) =>
                    setNewPassword(e.target.value)
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/30"
                />
              </div>
              <div className="space-y-1">
                <label className="text-slate-700">
                  Confirm new password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(e.target.value)
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/30"
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsPasswordModalOpen(false);
                  setCurrentPasswordInput("");
                  setNewPassword("");
                  setConfirmPassword("");
                }}
                className="rounded-full border border-slate-200 px-4 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={savePassword}
                disabled={savingPassword}
                className={`rounded-full px-4 py-1 text-xs font-semibold shadow-sm ${
                  savingPassword
                    ? "cursor-not-allowed bg-brand-purple/15 text-slate-500"
                    : "bg-brand-purple text-white hover:bg-brand-purpleDark"
                }`}
              >
                {savingPassword ? "Saving…" : "Update password"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pet modal */}
      {isPetModalOpen && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">
                {petModalMode === "new" ? "Add a pet" : "Edit pet"}
              </h3>
              <button
                type="button"
                onClick={() => setIsPetModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>
            <div className="grid gap-3 text-sm sm:grid-cols-2">
              <div className="space-y-1 sm:col-span-2">
                <label className="text-slate-700">Name</label>
                <input
                  type="text"
                  value={petForm.name}
                  onChange={(e) =>
                    setPetForm((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  placeholder="Luna"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/30"
                />
              </div>
              <div className="space-y-1">
                <label className="text-slate-700">Breed</label>
                <input
                  type="text"
                  value={petForm.breed}
                  onChange={(e) =>
                    setPetForm((prev) => ({
                      ...prev,
                      breed: e.target.value,
                    }))
                  }
                  placeholder="Golden Retriever"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/30"
                />
              </div>
              <div className="space-y-1">
                <label className="text-slate-700">
                  Profile photo
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    handlePetPhotoChange(e.target.files?.[0])
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 outline-none file:mr-2 file:rounded-lg file:border-none file:bg-brand-purple/15 file:px-2 file:py-1 file:text-xs file:font-semibold file:text-brand-purple focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/30"
                />
                {(petForm.photoDataUrl ||
                  petForm.photo_data_url) && (
                  <div className="mt-2 flex items-center gap-3">
                    <img
                      src={
                        petForm.photoDataUrl ||
                        petForm.photo_data_url
                      }
                      alt={`${petForm.name || "Pet"} preview`}
                      className="h-16 w-16 rounded-xl border border-slate-200 object-cover"
                    />
                    <button
                      type="button"
                      onClick={clearPetPhoto}
                      className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700 hover:border-brand-purple hover:bg-brand-purple/10"
                    >
                      Remove photo
                    </button>
                  </div>
                )}
              </div>
              <div className="space-y-1 sm:col-span-2">
                <label className="text-slate-700">Notes</label>
                <textarea
                  value={petForm.notes}
                  onChange={(e) =>
                    setPetForm((prev) => ({
                      ...prev,
                      notes: e.target.value,
                    }))
                  }
                  placeholder="Feeding instructions, personality notes, medication..."
                  rows={3}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/30"
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsPetModalOpen(false)}
                className="rounded-full border border-slate-200 px-4 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={savePet}
                className="rounded-full bg-brand-purple px-4 py-1 text-xs font-semibold text-white shadow-sm hover:bg-brand-purpleDark"
              >
                {petModalMode === "new" ? "Save pet" : "Update pet"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Booking modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">
                Booking details
              </h3>
              <button
                type="button"
                onClick={() => setSelectedBooking(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>
            <p className="text-sm font-bold text-brand-purple">
              {selectedBooking.service_title ||
                selectedBooking?.services_catalog?.title ||
                "Service"}
            </p>
            <p className="text-sm text-slate-800">
              {formatDateRange(selectedBooking)}
            </p>
            <p className="mt-1 text-xs text-slate-600">
              Status:{" "}
              <span className="font-semibold">
                {bookingStatusLabel(selectedBooking.status)}
              </span>
            </p>
            {selectedBooking.notes && (
              <p className="mt-2 text-sm text-slate-700">
                {selectedBooking.notes}
              </p>
            )}
            <p className="mt-2 text-xs text-slate-500">
              Cancelling will end any recurrence request and remove this
              visit from your calendar.
            </p>
            <div className="mt-4 flex items-center justify-end gap-3">
              {bookingAction.error && (
                <span className="mr-auto text-xs font-semibold text-rose-700">
                  {bookingAction.error}
                </span>
              )}
              <button
                type="button"
                onClick={cancelBooking}
                disabled={bookingAction.cancelling}
                className={`rounded-full px-4 py-1 text-xs font-semibold text-white shadow-sm ${
                  bookingAction.cancelling
                    ? "cursor-not-allowed bg-rose-200"
                    : "bg-rose-500 hover:bg-rose-600"
                }`}
              >
                {bookingAction.cancelling
                  ? "Cancelling…"
                  : "Cancel booking"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset modal */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">
                Reset your password
              </h3>
              <button
                type="button"
                onClick={() => setIsResetModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>
            <p className="text-sm text-slate-700">
              We will send a link to set a new password to the email
              associated with your profile.
            </p>
            <div className="mt-3 space-y-2 text-sm">
              <label className="text-slate-700">
                Email address
              </label>
              <input
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/30"
              />
            </div>
            <div className="mt-4 flex items-center justify-end gap-3">
              {resetStatus.message && (
                <span
                  className={`mr-auto text-xs font-semibold ${
                    resetStatus.state === "success"
                      ? "text-emerald-700"
                      : resetStatus.state === "error"
                      ? "text-rose-700"
                      : "text-slate-500"
                  }`}
                >
                  {resetStatus.message}
                </span>
              )}
              <button
                type="button"
                onClick={requestPasswordReset}
                disabled={resetStatus.state === "loading"}
                className={`rounded-full px-4 py-1 text-xs font-semibold shadow-sm ${
                  resetStatus.state === "loading"
                    ? "cursor-not-allowed bg-blue-100"
                    : "bg-blue-500 hover:bg-blue-600"
                }`}
              >
                {resetStatus.state === "loading"
                  ? "Sending…"
                  : "Email me a reset link"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModernProfile;
