import { useState } from "react";
import { useRouter } from "next/router";

const CATEGORY_ROUTE_MAP = {
  "Daily Strolls": "daily-strolls",
  "Group Adventures": "group-adventures",
  "Solo Journeys": "solo-journeys",
  "Overnight Support": "overnight-stays",
  "Daytime Care": "daytime-care",
  "Home Visits": "home-check-ins",
  Training: "training-help",
  "Custom Care": "custom-solutions",
};

const ResumeBookingPage = () => {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus("loading");
    setError("");

    try {
      const response = await fetch("/api/resume-booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload?.message || "Unable to resume booking.");
      }

      const payload = await response.json();
      const serviceSlug = payload?.service?.slug || payload?.service?.id;
      const serviceId = payload?.service?.id || payload?.service?.slug;
      const category = payload?.service?.category;

      if (!serviceSlug || !serviceId) {
        throw new Error("Missing service details for this booking.");
      }

      const params = new URLSearchParams({
        booking: "1",
        service: serviceId,
        resume: payload.resumeToken || token,
      });

      const categoryRoute = category ? CATEGORY_ROUTE_MAP[category] : null;
      const resumePath = categoryRoute
        ? `/services/${categoryRoute}?${params.toString()}`
        : `/services/${serviceSlug}?${params.toString()}`;

      await router.push(resumePath);
    } catch (resumeError) {
      setError(resumeError.message || "Unable to resume booking.");
      setStatus("error");
      return;
    }

    setStatus("success");
  };

  return (
    <section className="section">
      <div className="container">
        <div className="w-layout-grid grid_2-col gap-large">
          <div className="w-form">
            <form onSubmit={handleSubmit}>
              <div className="input">
                <label htmlFor="resume-token" className="input_label">
                  Resume booking token
                </label>
                <input
                  id="resume-token"
                  type="text"
                  className="input_field margin-bottom_xsmall w-input"
                  placeholder="ABCD-1234"
                  value={token}
                  onChange={(event) => setToken(event.target.value)}
                  required
                />
              </div>
              <div className="button-group">
                <button
                  type="submit"
                  className="button w-button"
                  disabled={status === "loading"}
                >
                  {status === "loading" ? "Checking..." : "Resume booking"}
                </button>
              </div>
              {status === "error" && (
                <div className="form_error-message w-form-fail">
                  <div className="form_error-message_content">
                    <div className="display_inline-block">{error}</div>
                  </div>
                </div>
              )}
            </form>
          </div>
          <div>
            <h2 className="heading_h2">Pick up where you left off</h2>
            <p className="subheading">
              Enter the resume token you received during booking to reopen and
              update your booking details. Tokens expire after 24 hours.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ResumeBookingPage;