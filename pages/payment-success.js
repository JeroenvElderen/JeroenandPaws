import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function PaymentSuccess() {
  const router = useRouter();
  const { booking } = router.query;
  const [message, setMessage] = useState("Verifying payment...");

  useEffect(() => {
    if (!booking) return;

    // Poll booking until payment status is updated
    const interval = setInterval(async () => {
      const res = await fetch(`/api/payment-status?id=${booking}`);
      const data = await res.json();

      if (data.payment_status === "paid") {
        setMessage("🎉 Payment received! Your booking is confirmed.");
        clearInterval(interval);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [booking]);

  return (
    <div style={{ padding: "60px", textAlign: "center" }}>
      <h1>Thank you!</h1>
      <p>{message}</p>

      <button
        style={{ marginTop: "30px" }}
        onClick={() => router.push("/")}
      >
        Back to home
      </button>
    </div>
  );
}
