import { useCallback, useEffect, useRef, useState } from "react";
import BookingModal from "./BookingModal";
import ChatOrFormModal from "./ChatOrFormModal";
import ServiceChooserModal from "./ServiceChooserModal";
import { prefetchAvailability } from "./availabilityCache";

const useServiceBooking = ({
  services = [],
  defaultCta = "Check availability",
  chooserTitle = "Choose a service to book",
  chooserDescription = "Pick the option that best fits your companion to continue to availability.",
} = {}) => {
  const [activeService, setActiveService] = useState(null);
  const [ctaChoiceService, setCtaChoiceService] = useState(null);
  const [showChooser, setShowChooser] = useState(false);
  const [resumeBooking, setResumeBooking] = useState(null);
  const autoOpenedRef = useRef(false);

  const handleSelect = useCallback((service) => {
    if (!service) return;
    if (service.ctaOptions) {
      setCtaChoiceService(service);
      setShowChooser(false);
      return;
    }
    if (service.ctaHref) {
      setShowChooser(false);
      if (typeof window !== "undefined") {
        window.location.href = service.ctaHref;
      }
      return;
    }
    setActiveService(service);
    setShowChooser(false);
  }, []);

  useEffect(() => {
    services.forEach((service) => {
      if (!service?.ctaHref) {
        prefetchAvailability(service);
      }
    });
  }, [services]);

  useEffect(() => {
    if (!activeService || !resumeBooking) return;
    if (resumeBooking.service?.id !== activeService.id) {
      setResumeBooking(null);
    }
  }, [activeService, resumeBooking]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (autoOpenedRef.current) return;

    const params = new URLSearchParams(window.location.search);
    if (params.get("resume")) return;
    if (params.get("booking") !== "1") return;

    if (services.length === 0) return;

    const requestedServiceId = params.get("service");
    const matchingService = requestedServiceId
      ? services.find((service) => service?.id === requestedServiceId)
      : null;

    if (matchingService) {
      autoOpenedRef.current = true;
      handleSelect(matchingService);
      return;
    }

    if (services.length === 1) {
      autoOpenedRef.current = true;
      handleSelect(services[0]);
    }
  }, [handleSelect, services]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (autoOpenedRef.current) return;

    const params = new URLSearchParams(window.location.search);
    const resumeToken = params.get("resume");
    if (!resumeToken) return;

    const fetchResume = async () => {
      try {
        const response = await fetch("/api/resume-booking", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: resumeToken }),
        });

        if (!response.ok) {
          throw new Error("Unable to resume booking.");
        }

        const payload = await response.json();
        const resumeServiceId =
          payload?.service?.slug || payload?.service?.id || null;
        const resumeCategory = payload?.service?.category || null;
        if (!resumeServiceId) return;

        const matchingService = services.find((service) => {
          if (service?.id === resumeServiceId) return true;
          if (!resumeCategory) return false;
          return service?.category === resumeCategory;
        });

        if (matchingService) {
          setResumeBooking(payload);
          autoOpenedRef.current = true;
          handleSelect(matchingService);
        }
      } catch (error) {
        console.error("Resume booking failed", error);
      }
    };

    fetchResume();
  }, [handleSelect, services]);

  const openBooking = useCallback(() => {
    if (services.length === 0) {
      setShowChooser(true);
      return;
    }

    if (services.length === 1) {
      handleSelect(services[0]);
      return;
    }

    setShowChooser(true);
  }, [handleSelect, services]);

  const bookingOverlays = (
    <>
      {showChooser && (
        <ServiceChooserModal
          services={services}
          onSelect={handleSelect}
          onClose={() => setShowChooser(false)}
          title={chooserTitle}
          description={chooserDescription}
          defaultCta={defaultCta}
        />
      )}
      {activeService && !activeService.ctaHref && (
        <BookingModal
          service={activeService}
          resumeBooking={resumeBooking}
          onClose={() => setActiveService(null)}
        />
      )}
      {ctaChoiceService?.ctaOptions && (
        <ChatOrFormModal
          service={ctaChoiceService}
          onClose={() => setCtaChoiceService(null)}
        />
      )}
    </>
  );

  return {
    openBooking,
    selectService: handleSelect,
    bookingOverlays,
  };
};

export default useServiceBooking;