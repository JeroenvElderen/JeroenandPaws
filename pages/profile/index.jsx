import React, { useState } from "react";

const ProfilePage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/client-auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.message || "Unable to sign in.");
      }

      setProfile(payload);
    } catch (submitError) {
      setError(submitError?.message || "Unable to sign in.");
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ maxWidth: 760, margin: "0 auto", padding: "48px 20px" }}>
      <h1 style={{ marginBottom: 8 }}>Client profile</h1>
      <p style={{ color: "#666", marginBottom: 24 }}>
        Booking tools are being rebuilt. You can still access your account and pets below.
      </p>

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12, marginBottom: 24 }}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>

      {error ? <p style={{ color: "#b42318" }}>{error}</p> : null}

      {profile ? (
        <section>
          <h2 style={{ marginBottom: 8 }}>{profile?.client?.full_name || "Welcome"}</h2>
          <p style={{ marginBottom: 16 }}>{profile?.client?.email}</p>
          <h3>Your pets</h3>
          {profile?.pets?.length ? (
            <ul>
              {profile.pets.map((pet) => (
                <li key={pet.id}>{pet.name}</li>
              ))}
            </ul>
          ) : (
            <p>No pets on file yet.</p>
          )}
        </section>
      ) : null}
    </main>
  );
};

export default ProfilePage;
