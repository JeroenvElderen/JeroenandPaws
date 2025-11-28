import React, { useEffect, useMemo, useState } from "react";

const adminEmail =
  process.env.NEXT_PUBLIC_ADMIN_EMAIL || "jeroen@jeroenandpaws.com";

const emptyServiceDraft = {
  id: null,
  title: "",
  slug: "",
  description: "",
  price: "",
  duration_minutes: 60,
  sort_order: 0,
  is_active: true,
  category: "General",
};

const BackendDashboard = () => {
  const [services, setServices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [addons, setAddons] = useState([]);
  const [loadingAddons, setLoadingAddons] = useState(false);
  const [addonDraft, setAddonDraft] = useState({
    id: null,
    value: "",
    label: "",
    description: "",
    price: "",
    sort_order: 0,
    is_active: true,
  });
  const [isAddonEditorOpen, setIsAddonEditorOpen] = useState(false);
  const [loadingServices, setLoadingServices] = useState(false);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [serviceDraft, setServiceDraft] = useState(emptyServiceDraft);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  /** ⬇️ NEW — Which category is open? */
  const [openCategory, setOpenCategory] = useState(null);

  /** 🎨 Persistent pastel color generator */
  const getCategoryColor = (category) => {
    const colors = [
      "#FFB1C1", // pink
      "#C5B3FF", // purple
      "#A7E8FF", // light blue
      "#FFE3A3", // yellow
      "#B9FFCC", // mint
      "#FFCE9E", // peach
      "#E6B9FF", // lavender
    ];
    let hash = 0;
    for (let i = 0; i < category.length; i++) {
      hash = category.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const fetchServices = async () => {
    setLoadingServices(true);
    setError("");
    try {
      const res = await fetch("/api/services");
      const data = await res.json();
      setServices(
        (data.services || []).sort((a, b) =>
          a.title.localeCompare(b.title, undefined, { sensitivity: "base" })
        )
      );
    } catch {
      setError("Could not load services");
    } finally {
      setLoadingServices(false);
    }
  };

  const fetchAddons = async () => {
    setLoadingAddons(true);
    const res = await fetch("/api/addons");
    const data = await res.json();
    setAddons(data.addons || []);
    setLoadingAddons(false);
  };

  const fetchBookings = async () => {
    setLoadingBookings(true);
    try {
      const res = await fetch("/api/bookings", {
        headers: { "x-admin-email": adminEmail },
      });
      const data = await res.json();
      setBookings(data.bookings || []);
    } catch {
      setError("Could not load bookings");
    } finally {
      setLoadingBookings(false);
    }
  };

  const updateBookingStatus = async (id, status) => {
    try {
      const res = await fetch("/api/bookings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-email": adminEmail,
        },
        body: JSON.stringify({ id, status }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error();
      setBookings((cur) =>
        cur.map((b) => (b.id === id ? payload.booking || b : b))
      );
    } catch {
      setError("Could not update booking status");
    }
  };

  /** Draft handlers */
  const handleDraftChange = (field, value) =>
    setServiceDraft((c) => ({ ...c, [field]: value }));

  const startEditingService = (service) => {
    setServiceDraft({
      id: service.id || null,
      title: service.title || "",
      slug: service.slug || "",
      description: service.description || "",
      price: service.price || "",
      duration_minutes: service.duration_minutes || 60,
      sort_order: service.sort_order ?? 0,
      is_active: service.is_active ?? true,
      category: service.category || "General",
    });
    setStatus("");
  };

  const resetDraft = () => setServiceDraft(emptyServiceDraft);

  const openNewService = () => {
    resetDraft();
    setIsEditorOpen(true);
  };

  const openServiceEditor = (service) => {
    startEditingService(service);
    setIsEditorOpen(true);
  };

  const saveService = async (service) => {
    setStatus("saving");
    try {
      const res = await fetch("/api/services", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-email": adminEmail,
        },
        body: JSON.stringify({
          service: {
            ...service,
            category: service.category || "General",
            duration_minutes: Number(service.duration_minutes),
            sort_order: Number(service.sort_order),
          },
        }),
      });

      if (!res.ok) throw new Error();

      await fetchServices();
      resetDraft();
      setIsEditorOpen(false);
      setStatus("saved");
    } catch {
      setError("Could not save service");
      setStatus("error");
    }
  };

  useEffect(() => {
    fetchServices();
    fetchBookings();
    fetchAddons();
  }, []);

  const servicesEmpty = useMemo(
    () => !loadingServices && services.length === 0,
    [loadingServices, services]
  );

  const bookingStatusLabel = (status = "") => {
    const s = status.toLowerCase();
    if (!s || s === "pending") return "Waiting confirmation";
    if (["scheduled", "confirmed"].includes(s)) return "Scheduled";
    if (s === "cancelled" || s === "canceled") return "Cancelled";
    return status;
  };

  return (
    <main>
      <section className="section is-secondary backend-section">
        <div className="container backend-shell">
          <div className="header margin-bottom_medium">
            <div className="pill">Backend</div>
            <h1 className="heading_h2 margin-bottom_xsmall">Admin dashboard</h1>
            <p className="subheading">
              Signed in as <strong>{adminEmail}</strong>.
            </p>
          </div>

          {/* SERVICES PANEL */}
          <div className="glass-panel margin-bottom_large">
            <div className="flex_horizontal is-x-between margin-bottom_small">
              <div>
                <p className="eyebrow">Services</p>
              </div>
            </div>

            {servicesEmpty && (
              <p className="paragraph_small">No services found yet.</p>
            )}

            {Object.entries(
              services.reduce((acc, s) => {
                const c = s.category || "General";
                if (!acc[c]) acc[c] = [];
                acc[c].push(s);
                return acc;
              }, {})
            )
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([category, items]) => {
                const isOpen = openCategory === category;
                const color = getCategoryColor(category);

                return (
                  <div key={category} className="margin-bottom_small">
                    {/* CATEGORY HEADER */}
                    <button
                      className="w-inline-block flex_horizontal is-x-between padding-small"
                      style={{
                        width: "100%",
                        borderRadius: "10px",
                        background: isOpen
                          ? "rgba(255,255,255,0)"
                          : "rgba(255,255,255,0)",
                      }}
                      onClick={() => setOpenCategory(isOpen ? null : category)}
                    >
                      <span
                        className="pill"
                        style={{
                          background: color,
                          color: "#0f0a20",
                          borderColor: "transparent",
                          fontWeight: 600,
                        }}
                      >
                        {category}
                      </span>
                    </button>

                    {/* ACCORDION CONTENT */}
                    {isOpen && (
                      <div className="margin-top_small w-layout-grid grid_1-col gap-xsmall">
                        {items
                          .sort(
                            (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
                          )
                          .map((service) => (
                            <button
                              key={service.id}
                              type="button"
                              className="card service-card w-inline-block"
                              onClick={() => openServiceEditor(service)}
                            >
                              <div className="card_inner">
                                <div className="service-card__meta">
                                  <span
                                    className="pill"
                                    style={{
                                      background: color,
                                      color: "#0f0a20",
                                    }}
                                  >
                                    {category}
                                  </span>
                                  {service.is_active ? (
                                    <span className="pill is-glow">Active</span>
                                  ) : (
                                    <span className="pill is-muted">
                                      Hidden
                                    </span>
                                  )}
                                </div>

                                <div className="service-card__content">
                                  <h3 className="heading_h4">
                                    {service.title}
                                  </h3>
                                </div>

                                <div className="service-card__stats">
                                  <div className="stat-chip">
                                    <span className="stat-label">Price</span>
                                    <span className="stat-value">
                                      {service.price || "—"}
                                    </span>
                                  </div>
                                  <div className="stat-chip">
                                    <span className="stat-label">Duration</span>
                                    <span className="stat-value">
                                      {service.duration_minutes} min
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </button>
                          ))}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      </section>

      {/* EDITOR MODAL */}
      {isEditorOpen && (
        <div className="form-popup-overlay">
          <div className="backend-modal form-popup">
            <div className="popup-header">
              <div>
                <p className="eyebrow margin-bottom_xxsmall">
                  {serviceDraft.id ? "Update service" : "Create a service"}
                </p>
                <h2 className="heading_h4 margin-bottom_none">
                  {serviceDraft.title || "Untitled service"}
                </h2>
              </div>
              <button
                className="text-button is-secondary is-small w-inline-block"
                onClick={() => setIsEditorOpen(false)}
                disabled={status === "saving"}
              >
                Close
              </button>
            </div>

            <div className="popup-body">
              <form className="flex_vertical gap-small">
                <div className="w-layout-grid grid_2-col gap-small">
                  <div className="input">
                    <label className="input_label">Title</label>
                    <input
                      className="input_field w-input"
                      value={serviceDraft.title}
                      onChange={(e) =>
                        handleDraftChange("title", e.target.value)
                      }
                      placeholder="Service title"
                    />
                  </div>

                  <div className="input">
                    <label className="input_label">Slug</label>
                    <input
                      className="input_field w-input"
                      value={serviceDraft.slug}
                      onChange={(e) =>
                        handleDraftChange("slug", e.target.value)
                      }
                      placeholder="unique-slug"
                    />
                  </div>
                </div>

                <div className="w-layout-grid grid_3-col tablet-2-col gap-small">
                  <div className="input">
                    <label className="input_label">Price</label>
                    <input
                      className="input_field"
                      value={serviceDraft.price}
                      onChange={(e) =>
                        handleDraftChange("price", e.target.value)
                      }
                      placeholder="€60"
                    />
                  </div>

                  <div className="input">
                    <label className="input_label">Duration (minutes)</label>
                    <input
                      type="number"
                      className="input_field"
                      value={serviceDraft.duration_minutes}
                      onChange={(e) =>
                        handleDraftChange("duration_minutes", e.target.value)
                      }
                      placeholder="60"
                    />
                  </div>

                  <div className="input">
                    <label className="input_label">Sort order</label>
                    <input
                      type="number"
                      className="input_field"
                      value={serviceDraft.sort_order}
                      onChange={(e) =>
                        handleDraftChange("sort_order", e.target.value)
                      }
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="input">
                  <label className="input_label">Category</label>
                  <input
                    className="input_field"
                    value={serviceDraft.category}
                    onChange={(e) =>
                      handleDraftChange("category", e.target.value)
                    }
                    placeholder="Group Adventures, Custom Care..."
                  />
                </div>

                <div className="input">
                  <label className="input_label">Description</label>
                  <textarea
                    className="input_field input_text-area"
                    value={serviceDraft.description}
                    onChange={(e) =>
                      handleDraftChange("description", e.target.value)
                    }
                    placeholder="What clients can expect"
                  />
                </div>

                <label className="flex_horizontal gap-xsmall">
                  <input
                    type="checkbox"
                    checked={serviceDraft.is_active}
                    onChange={(e) =>
                      handleDraftChange("is_active", e.target.checked)
                    }
                  />
                  <span className="paragraph_small">
                    Show this service on the site
                  </span>
                </label>

                <div className="divider margin-top_small margin-bottom_small"></div>
                <div className="flex_horizontal gap-xsmall">
                  <button
                    type="button"
                    disabled={status === "saving"}
                    className="button w-button"
                    onClick={() => saveService(serviceDraft)}
                  >
                    {status === "saving" ? "Saving…" : "Save service"}
                  </button>

                  <button
                    type="button"
                    className="button is-secondary w-button"
                    disabled={status === "saving"}
                    onClick={resetDraft}
                  >
                    Clear form
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default BackendDashboard;
