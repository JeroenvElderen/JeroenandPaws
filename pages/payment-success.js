import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";

export default function PaymentSuccess() {
  const router = useRouter();
  const { booking } = router.query;
  const [message, setMessage] = useState("Payment received. Thank you!");
  const [isVerifying, setIsVerifying] = useState(false);

  const bookingId = useMemo(
    () => (Array.isArray(booking) ? booking[0] : booking),
    [booking]
  );

  useEffect(() => {
    if (!bookingId) {
      setIsVerifying(false);
      return;
    }

    setIsVerifying(true);
    setMessage("Verifying payment...");

    // Poll booking until payment status is updated
    const interval = setInterval(async () => {
      const res = await fetch(`/api/payment-status?id=${bookingId}`);
      const data = await res.json();

      if (data.payment_status === "paid") {
        setMessage("🎉 Payment received! Your booking is confirmed.");
        setIsVerifying(false);
        clearInterval(interval);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [bookingId]);

  return (
    <div
      style={{
        minHeight: "80vh",
        padding: "72px 24px",
        background:
          "linear-gradient(180deg, #f9fbff 0%, #ffffff 60%)",
      }}
    >
      <div
        style={{
          maxWidth: "760px",
          margin: "0 auto",
          textAlign: "center",
        }}
      >
      <h1 style={{ fontSize: "34px", marginBottom: "12px", color: "#111827" }}>
          Payment successful
        </h1>
        <p
          style={{
            fontSize: "18px",
            color: "#4b5563",
            marginBottom: "32px",
          }}
        >
          {message}
        </p>

        <div
          style={{
            background: "#ffffff",
            borderRadius: "20px",
            border: "1px solid #eef2f7",
            boxShadow: "0 18px 40px rgba(15, 23, 42, 0.08)",
            padding: "28px",
            textAlign: "left",
            marginBottom: "32px",
          }}
        >
          <h2 style={{ fontSize: "20px", marginBottom: "12px" }}>
            What happens next
          </h2>
          <ul style={{ margin: 0, paddingLeft: "20px", color: "#4b5563" }}>
            <li>We&apos;re sending a confirmation email to you and our team.</li>
            <li>Your booking will appear in the Outlook calendar.</li>
            <li>You can keep browsing or return to your profile.</li>
          </ul>
          {isVerifying && (
            <p style={{ marginTop: "16px", color: "#6b7280" }}>
              Still verifying your payment… this can take a few seconds.
            </p>
          )}
        </div>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "12px",
            justifyContent: "center",
          }}
        >
          <Link
            href="/"
            style={{
              padding: "12px 20px",
              borderRadius: "999px",
              background: "#111827",
              color: "#ffffff",
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            Back to home
          </Link>
          <Link
            href="/profile"
            style={{
              padding: "12px 20px",
              borderRadius: "999px",
              background: "#fef6f2",
              border: "1px solid #f1e2d9",
              color: "#111827",
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            View my profile
          </Link>
          <button
            type="button"
            onClick={() => router.push("/contact")}
            style={{
              padding: "12px 20px",
              borderRadius: "999px",
              border: "1px solid #e5e7eb",
              background: "#ffffff",
              color: "#111827",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Contact us
          </button>
        </div>
      </div>
    </div>
  );
}
