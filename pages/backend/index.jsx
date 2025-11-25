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

  const updateBookingStatus = async (bookingId, status) => {
    try {
      const response = await fetch("/api/bookings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-email": adminEmail,
        },
        body: JSON.stringify({ id: bookingId, status }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.message || "Could not update booking");
      }

      setBookings((current) =>
        current.map((booking) =>
          booking.id === bookingId ? payload.booking || booking : booking
        )
      );
    } catch (statusError) {
      console.error(statusError);
      setError("Could not update booking status");
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

  const bookingStatusLabel = (status = "") => {
    const normalized = status.toLowerCase();
    if (!normalized || normalized === "pending") return "Waiting confirmation";
    if (["scheduled", "confirmed"].includes(normalized)) return "Scheduled";
    if (["cancelled", "canceled"].includes(normalized)) return "Cancelled";
    return status;
  };

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
                <h2 className="heading_h4 margin-bottom_none">Supabase catalog</h2>
                <p className="paragraph_small text-color-muted margin-bottom_none">
                  Curate the services clients see on the site. Click a tile to edit or create a new one from scratch.
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
                  <div className="card_inner">
                    <div className="service-card__meta">
                      <div className="pill is-glow">{service.slug || "service"}</div>
                      {service.is_active === false && <span className="tag is-secondary">Hidden</span>}
                      {service.is_active !== false && <span className="tag is-primary">Live</span>}
                    </div>
                    <div className="service-card__content">
                      <div>
                        <h3 className="heading_h4 margin-bottom_xxsmall">{service.title}</h3>
                        {service.description && (
                          <p className="paragraph_small text-color-muted margin-bottom_small">
                            {service.description}
                          </p>
                        )}
                        <div className="service-card__stats">
                          <div className="stat-chip">
                            <span className="stat-label">Price</span>
                            <span className="stat-value">{service.price || "No price set"}</span>
                          </div>
                          <div className="stat-chip">
                            <span className="stat-label">Duration</span>
                            <span className="stat-value">{service.duration_minutes || 0} min</span>
                          </div>
                          <div className="stat-chip">
                            <span className="stat-label">Sort</span>
                            <span className="stat-value">{service.sort_order ?? 0}</span>
                          </div>
                        </div>
                      </div>
                      <div className="service-card__action">
                        <span className="text-button is-secondary is-small w-inline-block">Edit</span>
                        <p className="paragraph_small text-color-muted margin-bottom_none">Click to open editor</p>
                      </div>
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
                  <div key={booking.id} className="card is-secondary booking-card">
                    <div className="card_body booking-card__body">
                      <div className="booking-card__meta">
                        <div className="pill is-muted">
                          {booking.service_title || booking?.services_catalog?.title || "Service"}
                        </div>
                        <span className="paragraph_small text-color-muted">
                          {booking.phone || "No phone"}
                        </span>
                      </div>
                      <div className="booking-card__details">
                        <div>
                          <h3 className="heading_h4 margin-bottom_xxsmall">
                            {booking.clients?.full_name || "Client"}
                          </h3>
                          {booking.client_address && (
                            <p className="paragraph_small margin-bottom_xxsmall text-color-muted">
                              {booking.client_address}
                            </p>
                          )}
                          {booking.notes && (
                            <p className="paragraph_small margin-bottom_none text-color-muted">
                              {booking.notes}
                            </p>
                          )}
                        </div>
                        <div className="booking-card__time">
                        <p className="paragraph_small margin-bottom_none">
                          {new Date(booking.start_at).toLocaleString()} → {new Date(booking.end_at).toLocaleTimeString()}
                        </p>
                        <div className="flex_horizontal gap-xxsmall is-y-center">
                          <span className="tag is-secondary">
                            {bookingStatusLabel(booking.status)}
                          </span>
                          {(!booking.status || booking.status.toLowerCase() === "pending") && (
                            <button
                              type="button"
                              className="text-button is-secondary is-small w-inline-block"
                              onClick={() => updateBookingStatus(booking.id, "scheduled")}
                            >
                              Mark as scheduled
                            </button>
                          )}
                          {(booking.status || "").toLowerCase() !== "cancelled" && (
                            <button
                              type="button"
                              className="text-button is-secondary is-small w-inline-block"
                              onClick={() => updateBookingStatus(booking.id, "cancelled")}
                              style={{ color: "#ef4444" }}
                            >
                              Cancel & remove calendar
                            </button>
                          )}
                        </div>
                      </div>
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
                {status === "saved" && <span className="tag is-secondary">Saved</span>}
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
                        onChange={(event) => handleDraftChange("title", event.target.value)}
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
                        onChange={(event) => handleDraftChange("slug", event.target.value)}
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
                        onChange={(event) => handleDraftChange("price", event.target.value)}
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
                        onChange={(event) => handleDraftChange("duration_minutes", event.target.value)}
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
                        onChange={(event) => handleDraftChange("sort_order", event.target.value)}
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
                      onChange={(event) => handleDraftChange("description", event.target.value)}
                    />
                  </div>
                  <label className="flex_horizontal is-y-center gap-xxsmall">
                    <input
                      type="checkbox"
                      checked={serviceDraft.is_active}
                      onChange={(event) => handleDraftChange("is_active", event.target.checked)}
                    />
                    <span className="paragraph_small">Show this service on the site</span>
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
          border-radius: 20px;
          padding: 28px;
          box-shadow: 0 22px 60px rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(10px);
          position: relative;
          overflow: hidden;
        }

        .glass-panel::after {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.05), transparent 35%),
            radial-gradient(circle at 80% 0%, rgba(178, 126, 255, 0.1), transparent 30%);
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

        .pill.is-glow {
          background: linear-gradient(120deg, rgba(166, 127, 255, 0.35), rgba(255, 255, 255, 0.12));
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: #f5f1ff;
          box-shadow: 0 10px 24px rgba(0, 0, 0, 0.25);
        }

        .pill.is-muted {
          background: rgba(255, 255, 255, 0.07);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #d8d0f5;
        }

        .service-card {
          border: 1px solid rgba(255, 255, 255, 0.08);
          transition: transform 0.2s ease, border-color 0.2s ease,
            box-shadow 0.2s ease;
          text-align: left;
          background: linear-gradient(145deg, rgba(41, 31, 75, 0.6), rgba(25, 18, 49, 0.8));
          position: relative;
          overflow: hidden;
        }

        .service-card:hover {
          transform: translateY(-6px) scale(1.01);
          border-color: rgba(255, 255, 255, 0.2);
          box-shadow: 0 24px 48px rgba(0, 0, 0, 0.35);
        }

        .service-card::before {
          content: "";
          position: absolute;
          width: 220px;
          height: 220px;
          top: -80px;
          right: -80px;
          background: radial-gradient(circle, rgba(151, 111, 255, 0.35), transparent 60%);
          filter: blur(10px);
        }

        .service-card .card_inner {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          gap: 16px;
          padding: 20px 22px;
        }

        .service-card__meta {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .service-card__content {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 12px;
          align-items: center;
        }

        .service-card__stats {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .stat-chip {
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 8px 10px;
          min-width: 100px;
          display: grid;
          gap: 4px;
        }

        .stat-label {
          color: #bdb5d9;
          font-size: 12px;
          letter-spacing: 0.02em;
          text-transform: uppercase;
        }

        .stat-value {
          color: #fff;
          font-weight: 600;
        }

        .service-card__action {
          text-align: right;
        }

        .booking-card {
          background: linear-gradient(160deg, rgba(255, 255, 255, 0.04), rgba(255, 255, 255, 0.02));
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 18px 36px rgba(0, 0, 0, 0.25);
        }

        .booking-card__body {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .booking-card__meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .booking-card__details {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
        }

        .booking-card__time {
          text-align: right;
        }

        .form-popup-overlay {
          position: fixed;
          inset: 0;
          background: rgba(5, 3, 15, 0.6);
          backdrop-filter: blur(6px);
          display: grid;
          place-items: center;
          padding: 24px;
          z-index: 20;
        }

        .backend-modal {
          background: linear-gradient(145deg, #12092b, #1f0f3a);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 20px;
          box-shadow: 0 30px 70px rgba(0, 0, 0, 0.45);
          max-width: 960px;
          width: min(960px, 100%);
          animation: popIn 0.25s ease;
        }

        .popup-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
          padding: 22px 24px 0;
        }

        .popup-body {
          padding: 0 24px 24px;
        }

        .form-popup .button.is-secondary {
          background: rgba(255, 255, 255, 0.08);
          color: #f5f2ff;
        }

        @keyframes popIn {
          from {
            opacity: 0;
            transform: translateY(12px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @media screen and (max-width: 767px) {
          .glass-panel {
            padding: 18px;
          }

          .service-card .card_body {
            flex-direction: column;
            align-items: flex-start;
          }

          .service-card__content {
            grid-template-columns: 1fr;
          }

          .booking-card__details {
            align-items: flex-start;
          }
        }
      `}</style>
    </main>
  );
};

export default BackendDashboard;
