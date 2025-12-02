import React, { useState } from "react";

const LoginModal = ({ isOpen, onClose, onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/client-auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Login failed.");
      } else {
        onLogin(data); // <-- FULL PROFILE RETURNED
        onClose();
      }
    } catch (err) {
      setError("Network error.");
    }

    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="booking-overlay">
      <div className="login-modal">
        <h3>Sign in</h3>

        {error && <p className="error-banner">{error}</p>}

        <div className="login-fields">
          <label>Email</label>
          <input
            type="email"
            value={email}
            placeholder="your@email.com"
            onChange={(e) => setEmail(e.target.value)}
          />

          <label>Password</label>
          <input
            type="password"
            value={password}
            placeholder="••••••••"
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button
          className="button w-button primary"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Signing in…" : "Login"}
        </button>

        <button className="ghost-button" onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
};

export default LoginModal;
