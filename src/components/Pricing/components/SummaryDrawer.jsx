import React from "react";

const SummaryDrawer = ({
  isOpen,
  onClose,

  pets,
  name,
  email,
  phone,
  address,
  notes,

  dateLabel,
  time,
  formatTime,
  total,

  onPay,
  isBooking,

  // Optional: for the edit buttons
  onEditClient,
  onEditPets,
  onEditDateTime,
}) => {
  return (
    <>
      <div
        className={`drawer-overlay ${isOpen ? "open" : ""}`}
        onClick={onClose}
      />

      <div className={`drawer summary-drawer ${isOpen ? "open" : ""}`}>
        {/* HEADER */}
        <header className="drawer-header">
          <h4>Review & Confirm</h4>
          <button className="close-button" onClick={onClose}>×</button>
        </header>

        {/* BODY */}
        <div className="drawer-body summary-body">

          {/* CLIENT SECTION */}
          <section className="summary-section">
            <div className="summary-section-header">
              <h5>Client Details</h5>
              {onEditClient && (
                <button className="ghost-button tiny" onClick={onEditClient}>
                  Edit
                </button>
              )}
            </div>
            <div className="summary-block">
              <p><strong>{name}</strong></p>
              <p className="muted small">{email}</p>
              <p className="muted small">{phone}</p>
              <p className="muted small">{address}</p>

              {notes && (
                <p className="muted tiny" style={{ marginTop: "6px" }}>
                  Note: {notes}
                </p>
              )}
            </div>
          </section>

          {/* VISIT SECTION */}
          <section className="summary-section">
            <div className="summary-section-header">
              <h5>Visit</h5>
              {onEditDateTime && (
                <button className="ghost-button tiny" onClick={onEditDateTime}>
                  Edit
                </button>
              )}
            </div>
            <div className="summary-block">
              <p>{dateLabel}</p>
              <p className="muted small">{formatTime(time)}</p>
            </div>
          </section>

          {/* PETS SECTION */}
          <section className="summary-section">
            <div className="summary-section-header">
              <h5>Dogs</h5>
              {onEditPets && (
                <button className="ghost-button tiny" onClick={onEditPets}>
                  Edit
                </button>
              )}
            </div>

            <div className="summary-pet-grid">
              {pets.map((dog, i) => {
                const avatar = dog.photoDataUrl ||
                  dog.photo_data_url ||
                  null;
                const initial = dog.name?.charAt(0)?.toUpperCase() || "🐾";

                return (
                  <div key={i} className="summary-pet-card">
                    <div className="summary-pet-avatar">
                      {avatar ? (
                        <img src={avatar} alt={dog.name} />
                      ) : (
                        <div className="summary-pet-placeholder">
                          {initial}
                        </div>
                      )}
                      <div className="summary-avatar-glow"></div>
                    </div>

                    <div className="summary-pet-info">
                      <strong>{dog.name}</strong>
                      {dog.breed && (
                        <p className="muted small">{dog.breed}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* PRICE */}
          <section className="summary-section">
            <div className="summary-section-header">
              <h5>Total Price</h5>
            </div>
            <div className="summary-total-card">
              <p className="muted small">Final amount</p>
              <h3>{total}</h3>
            </div>
          </section>
        </div>

        {/* FOOTER */}
        <footer className="drawer-footer">
          <button
            className="button w-button primary"
            disabled={isBooking}
            onClick={onPay}
          >
            {isBooking ? "Processing…" : "Confirm & Pay →"}
          </button>
        </footer>
      </div>
    </>
  );
};

export default SummaryDrawer;
