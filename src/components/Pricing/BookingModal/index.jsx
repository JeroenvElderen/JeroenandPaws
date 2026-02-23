import React, { useCallback, useEffect, useMemo, useState } from "react";
import ChatOrFormModal from "../ChatOrFormModal";

const BookingModal = ({ service, onClose }) => {
  const [outlookBookingUrl, setOutlookBookingUrl] = useState("");
  const [isLoadingLink, setIsLoadingLink] = useState(true);
  const [linkError, setLinkError] = useState("");
  const [showSupport, setShowSupport] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadBookingLink = async () => {
      setIsLoadingLink(true);
      setLinkError("");

      try {
        const response = await fetch("/api/outlook-booking-link");
        const payload = await response.json().catch(() => null);
        const nextUrl = (payload?.url || "").trim();

        if (!response.ok) {
          throw new Error(
            "We couldn't load the Outlook booking link right now.",
          );
        }

        if (isMounted) {
          setOutlookBookingUrl(nextUrl);
          if (!nextUrl) {
            setLinkError(
              "Outlook booking is not configured yet. Please contact support and we'll set it up.",
            );
          }
        }
      } catch (error) {
        if (isMounted) {
          setLinkError(
            error?.message ||
              "Unable to connect to Outlook booking right now. Please try again.",
          );
        }
      } finally {
        if (isMounted) {
          setIsLoadingLink(false);
        }
      }
    };

    loadBookingLink();

    return () => {
      isMounted = false;
    };
  }, []);

  const label = service?.label || service?.duration || "Outlook booking";
  const title = service?.title || "Book your visit";

  const canOpenOutlook = Boolean(outlookBookingUrl);

  const openOutlookBooking = useCallback(() => {
    if (!canOpenOutlook || typeof window === "undefined") {
      return;
    }

    window.open(outlookBookingUrl, "_blank", "noopener,noreferrer");
    onClose?.();
  }, [canOpenOutlook, onClose, outlookBookingUrl]);

  const primaryLabel = useMemo(() => {
    if (isLoadingLink) return "Loading Outlook…";
    return canOpenOutlook ? "Book in Outlook" : "Contact support";
  }, [canOpenOutlook, isLoadingLink]);

  return (
    <>
      <div className="booking-overlay" role="dialog" aria-modal="true">
        <div className="booking-modal outlook-only-modal">
          <header className="booking-hero">
            <div>
              <p className="eyebrow">{label}</p>
              <h3>{title}</h3>
              <p className="muted">Outlook-only booking flow</p>
            </div>
            <button
              className="close-button"
              type="button"
              onClick={onClose}
              aria-label="Close booking"
            >
              ×
            </button>
          </header>

          <div className="booking-body">
            <div className="step-card outlook-only-card">
              <h4>Continue in Outlook Calendar</h4>
              <p className="muted subtle">
                We removed the old booking system. All new bookings now happen
                directly in Outlook so availability, timeslots and confirmations
                stay in one place.
              </p>

              {linkError && <p className="error-banner">{linkError}</p>}

              <div className="actions-row">
                <button
                  type="button"
                  className="button w-button"
                  onClick={
                    canOpenOutlook
                      ? openOutlookBooking
                      : () => setShowSupport(true)
                  }
                  disabled={isLoadingLink}
                >
                  {primaryLabel}
                </button>
                <button
                  type="button"
                  className="ghost-button"
                  onClick={() => setShowSupport(true)}
                >
                  Need help?
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showSupport && (
        <ChatOrFormModal
          service={service}
          onClose={() => setShowSupport(false)}
        />
      )}
    </>
  );
};

export default BookingModal;
