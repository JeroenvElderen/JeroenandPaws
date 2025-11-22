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
};

const BackendDashboard = () => {
  const [services, setServices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [serviceDraft, setServiceDraft] = useState(emptyServiceDraft);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  const fetchServices = async () => {
    setLoadingServices(true);
    setError("");
    try {
      const response = await fetch("/api/services");
      const data = await response.json();
      setServices(data.services || []);
    } catch (err) {
      setError("Could not load services");
    } finally {
      setLoadingServices(false);
    }
  };

  const fetchBookings = async () => {
    setLoadingBookings(true);
    setError("");
    try {
      const response = await fetch("/api/bookings", {
        headers: { "x-admin-email": adminEmail },
      });
      const data = await response.json();
      setBookings(data.bookings || []);
    } catch (err) {
      setError("Could not load bookings");
    } finally {
      setLoadingBookings(false);
    }
  };

  const handleDraftChange = (field, value) => {
    setServiceDraft((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const startEditingService = (service) => {
    setServiceDraft({
      id: service.id || null,
      title: service.title || "",
      slug: service.slug || "",
      description: service.description || "",
      price: service.price || "",
      duration_minutes:
        service.duration_minutes || service.durationMinutes || 60,
      sort_order: service.sort_order ?? service.sortOrder ?? 0,
      is_active: service.is_active ?? true,
    });
    setStatus("");
  };

  const resetDraft = () => {
    setServiceDraft(emptyServiceDraft);
    setStatus("");
  };

  const openNewService = () => {
    resetDraft();
    setIsEditorOpen(true);
  };

  const openServiceEditor = (service) => {
    startEditingService(service);
    setIsEditorOpen(true);
  };

  const closeServiceEditor = () => {
    setIsEditorOpen(false);
  };

  const saveService = async (service) => {
    setStatus("saving");
    setError("");
    try {
      const response = await fetch("/api/services", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-email": adminEmail,
        },
        body: JSON.stringify({
          service: {
            ...service,
            duration_minutes: Number(service.duration_minutes) || 0,
            sort_order: Number(service.sort_order) || 0,
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Save failed");
      }

      await fetchServices();
      resetDraft();
      setIsEditorOpen(false);
      setStatus("saved");
    } catch (err) {
      setError("Could not save service");
      setStatus("error");
    }
  };

  useEffect(() => {
    fetchServices();
    fetchBookings();
  }, []);

  const servicesEmptyState = useMemo(
    () => !loadingServices && (!services || services.length === 0),
    [loadingServices, services]
  );

  return (
    <main>
      <section className="section is-secondary backend-section">
        <div className="container backend-shell">
          <div className="header margin-bottom_medium">
            <div className="pill">Backend</div>
            <h1 className="heading_h2 margin-bottom_xsmall">Admin dashboard</h1>
            <p className="subheading max-width_large">
              Manage the Supabase data powering your site. Signed in as{" "}
              <strong>{adminEmail}</strong>.
            </p>
          </div>

          {error && (
            <div className="form_error-message w-form-fail margin-bottom_small">
              <div className="form_error-message_content">{error}</div>
            </div>
          )}

          <div className="glass-panel margin-bottom_large">
            <div className="flex_horizontal is-y-center is-x-between gap-small margin-bottom_small">
              <div className="flex_vertical gap-xxsmall">
                <p className="eyebrow margin-bottom_none">Services</p>
                <h2 className="heading_h4 margin-bottom_none">
                  Supabase catalog
                </h2>
                <p className="paragraph_small text-color-muted margin-bottom_none">
                  Curate the services clients see on the site. Click a tile to
                  edit or create a new one from scratch.
                </p>
              </div>
              <div className="flex_horizontal gap-xxsmall">
                <button
                  type="button"
                  className="text-button is-secondary is-small w-inline-block"
                  onClick={fetchServices}
                  disabled={loadingServices}
                >
                  {loadingServices ? "Refreshing…" : "Refresh"}
                </button>
                <button
                  type="button"
                  className="button is-secondary is-small w-button"
                  onClick={openNewService}
                >
                  + New service
                </button>
              </div>
            </div>

            <div className="w-layout-grid grid_1-col gap-xsmall">
              {servicesEmptyState && (
                <p className="paragraph_small">No services found yet.</p>
              )}
              {services.map((service) => (
                <button
                  key={service.id || service.slug}
                  type="button"
                  className="card service-card w-inline-block"
                  onClick={() => openServiceEditor(service)}
                >
                  <div className="card_body flex_horizontal is-y-center is-x-between gap-small">
                    <div className="flex_vertical gap-xxsmall align-start">
                      <div className="flex_horizontal is-y-center gap-xxsmall">
                        <p className="eyebrow margin-bottom_none">
                          {service.slug}
                        </p>
                        {service.is_active === false && (
                          <span className="tag is-secondary">Hidden</span>
                        )}
                        {service.is_active !== false && (
                          <span className="tag is-primary">Live</span>
                        )}
                      </div>
                      <h3 className="heading_h4 margin-bottom_none">
                        {service.title}
                      </h3>
                      {service.description && (
                        <p className="paragraph_small margin-bottom_none text-color-muted">
                          {service.description}
                        </p>
                      )}
                      <div className="flex_horizontal gap-small text-color-muted">
                        <span className="paragraph_small">
                          {service.price || "No price set"}
                        </span>
                        <span className="paragraph_small">
                          • {service.duration_minutes || 0} min
                        </span>
                      </div>
                    </div>
                    <div className="flex_vertical is-y-center gap-xxsmall align-end text-right">
                      <span className="text-button is-secondary is-small w-inline-block">
                        Edit
                      </span>
                      <span className="paragraph_small text-color-muted">
                        Sort {service.sort_order ?? 0}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="card margin-top_large">
            <div className="card_body">
              <div className="flex_horizontal is-y-center is-x-between gap-xsmall margin-bottom_small">
                <div>
                  <p className="eyebrow margin-bottom_xxsmall">Bookings</p>
                  <h2 className="heading_h4 margin-bottom_none">
                    Recent requests
                  </h2>
                </div>
                <button
                  type="button"
                  className="text-button is-secondary is-small w-inline-block"
                  onClick={fetchBookings}
                  disabled={loadingBookings}
                >
                  {loadingBookings ? "Refreshing…" : "Refresh"}
                </button>
              </div>
              <p className="paragraph_small margin-bottom_small">
                Live Supabase data with client details and session times.
              </p>
              <div className="w-layout-grid grid_1-col gap-xsmall">
                {bookings.map((booking) => (
                  <div key={booking.id} className="card is-secondary">
                    <div className="card_body flex_horizontal is-y-center is-x-between gap-small">
                      <div className="flex_vertical gap-xxsmall align-start">
                        <p className="eyebrow margin-bottom_none">
                          {booking.service_title ||
                            booking?.services_catalog?.title ||
                            "Service"}
                        </p>
                        <h3 className="heading_h4 margin-bottom_none">
                          {booking.clients?.full_name || "Client"}
                        </h3>
                        {booking.notes && (
                          <p className="paragraph_small margin-bottom_none text-color-muted">
                            {booking.notes}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="paragraph_small margin-bottom_none">
                          {new Date(booking.start_at).toLocaleString()} →{" "}
                          {new Date(booking.end_at).toLocaleTimeString()}
                        </p>
                        {booking.phone && (
                          <p className="paragraph_small margin-bottom_none text-color-muted">
                            {booking.phone}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {!loadingBookings && bookings.length === 0 && (
                  <p className="paragraph_small">No bookings to show yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {isEditorOpen && (
        <div className="form-popup-overlay" role="dialog" aria-modal="true">
          <div className="form-popup backend-modal">
            <div className="popup-header">
              <div>
                <p className="eyebrow margin-bottom_xxsmall">
                  {serviceDraft.id ? "Update service" : "Create a service"}
                </p>
                <h2 className="heading_h4 margin-bottom_none">
                  {serviceDraft.title || "Untitled service"}
                </h2>
                <p className="paragraph_small text-color-muted margin-bottom_none">
                  Save changes to publish them instantly to the site.
                </p>
              </div>
              <div className="flex_horizontal gap-xxsmall">
                {status === "saved" && (
                  <span className="tag is-secondary">Saved</span>
                )}
                <button
                  type="button"
                  className="text-button is-secondary is-small w-inline-block"
                  onClick={closeServiceEditor}
                  disabled={status === "saving"}
                  aria-label="Close editor"
                >
                  Close
                </button>
              </div>
            </div>
            <div className="popup-body">
              <div className="w-form">
                <form
                  onSubmit={(event) => event.preventDefault()}
                  className="flex_vertical gap-small"
                >
                  <div className="w-layout-grid grid_2-col gap-small">
                    <div className="input">
                      <label htmlFor="title" className="input_label">
                        Title
                      </label>
                      <input
                        id="title"
                        type="text"
                        className="input_field w-input"
                        placeholder="Service title"
                        value={serviceDraft.title}
                        onChange={(event) =>
                          handleDraftChange("title", event.target.value)
                        }
                        required
                      />
                    </div>
                    <div className="input">
                      <label htmlFor="slug" className="input_label">
                        Slug
                      </label>
                      <input
                        id="slug"
                        type="text"
                        className="input_field w-input"
                        placeholder="unique-slug"
                        value={serviceDraft.slug}
                        onChange={(event) =>
                          handleDraftChange("slug", event.target.value)
                        }
                      />
                    </div>
                  </div>
                  <div className="w-layout-grid grid_3-col tablet-2-col gap-small">
                    <div className="input">
                      <label htmlFor="price" className="input_label">
                        Price
                      </label>
                      <input
                        id="price"
                        type="text"
                        className="input_field w-input"
                        placeholder="€60"
                        value={serviceDraft.price}
                        onChange={(event) =>
                          handleDraftChange("price", event.target.value)
                        }
                      />
                    </div>
                    <div className="input">
                      <label htmlFor="duration" className="input_label">
                        Duration (minutes)
                      </label>
                      <input
                        id="duration"
                        type="number"
                        className="input_field w-input"
                        placeholder="60"
                        min="0"
                        value={serviceDraft.duration_minutes}
                        onChange={(event) =>
                          handleDraftChange(
                            "duration_minutes",
                            event.target.value
                          )
                        }
                      />
                    </div>
                    <div className="input">
                      <label htmlFor="sort_order" className="input_label">
                        Sort order
                      </label>
                      <input
                        id="sort_order"
                        type="number"
                        className="input_field w-input"
                        placeholder="0"
                        value={serviceDraft.sort_order}
                        onChange={(event) =>
                          handleDraftChange("sort_order", event.target.value)
                        }
                      />
                    </div>
                  </div>
                  <div className="input">
                    <label htmlFor="description" className="input_label">
                      Description
                    </label>
                    <textarea
                      id="description"
                      className="input_field input_text-area w-input"
                      placeholder="What clients can expect"
                      value={serviceDraft.description}
                      onChange={(event) =>
                        handleDraftChange("description", event.target.value)
                      }
                    />
                  </div>
                  <label className="flex_horizontal is-y-center gap-xxsmall">
                    <input
                      type="checkbox"
                      checked={serviceDraft.is_active}
                      onChange={(event) =>
                        handleDraftChange("is_active", event.target.checked)
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
                      className="button w-button"
                      onClick={() => saveService(serviceDraft)}
                      disabled={status === "saving"}
                    >
                      {status === "saving" ? "Saving…" : "Save service"}
                    </button>
                    <button
                      type="button"
                      className="button is-secondary w-button"
                      onClick={resetDraft}
                      disabled={status === "saving"}
                    >
                      Clear form
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .backend-section {
          background: radial-gradient(
              circle at 10% 20%,
              rgba(129, 110, 255, 0.14),
              transparent 25%
            ),
            radial-gradient(
              circle at 90% 10%,
              rgba(255, 171, 224, 0.18),
              transparent 20%
            ),
            #0f0a20;
        }

        .backend-shell {
          position: relative;
        }

        .glass-panel {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.35);
        }

        .pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 10px;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 999px;
          color: #eae2ff;
          font-size: 12px;
          letter-spacing: 0.02em;
          text-transform: uppercase;
        }

        .service-card {
          border: 1px solid rgba(255, 255, 255, 0.08);
          transition: transform 0.2s ease, border-color 0.2s ease,
            box-shadow 0.2s ease;
          text-align: left;
        }

        .service-card:hover {
          transform: translateY(-4px);
          border-color: rgba(255, 255, 255, 0.16);
          box-shadow: 0 16px 32px rgba(0, 0, 0, 0.3);
        }

        .backend-modal {
          background: linear-gradient(145deg, #12092b, #1f0f3a);
        }

        .form-popup .button.is-secondary {
          background: rgba(255, 255, 255, 0.08);
          color: #f5f2ff;
        }

        @media screen and (max-width: 767px) {
          .glass-panel {
            padding: 18px;
          }

          .service-card .card_body {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>
    </main>
  );
};

export default BackendDashboard;
