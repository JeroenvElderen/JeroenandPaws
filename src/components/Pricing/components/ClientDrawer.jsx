import React, { useEffect } from "react";

const ClientDrawer = ({
  isOpen,
  onClose,

  name,
  setName,
  email,
  setEmail,
  phone,
  setPhone,
  address,
  setAddress,
  notes,
  setNotes,

  canConfirm,
  onSave,

  login,
  isAuthenticated,
  user
}) => {

  // Autofill when logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.name) setName(user.name);
      if (user.email) setEmail(user.email);
      if (user.phone) setPhone(user.phone);
      if (user.address) setAddress(user.address);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
  }, [isOpen]);

  return (
    <>
      <div
        className={`drawer-overlay ${isOpen ? "open" : ""}`}
        onClick={onClose}
      />

      <div className={`drawer client-drawer ${isOpen ? "open" : ""}`}>
        {/* HEADER */}
        <header className="drawer-header client-header">
          <h4>Your details</h4>

          {!isAuthenticated && (
            <button className="button small outline" onClick={login}>
              Sign in to autofill
            </button>
          )}

          <button className="close-button" onClick={onClose}>×</button>
        </header>

        {/* BODY */}
        <div className="drawer-body client-body">

          <div className="field">
            <label>Your name</label>
            <input
              type="text"
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="off"
            />
          </div>

          <div className="field">
            <label>Email</label>
            <input
              type="email"
              placeholder="name@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="off"
            />
          </div>

          <div className="field">
            <label>Phone</label>
            <input
              type="tel"
              placeholder="Best contact number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              autoComplete="off"
            />
          </div>

          <div className="field">
            <label>Address</label>
            <input
              type="text"
              placeholder="Street, city, entrance instructions"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              autoComplete="off"
            />
          </div>

          <div className="field">
            <label>Notes (optional)</label>
            <textarea
              rows={3}
              placeholder="Gate codes, behavior notes…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

        </div>

        {/* FOOTER */}
        <footer className="drawer-footer client-footer">
          <button
            className="button w-button primary big"
            disabled={!canConfirm}
            onClick={onSave}
          >
            Save & Continue →
          </button>
        </footer>
      </div>
    </>
  );
};

export default ClientDrawer;
