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
    if (typeof window === "undefined") return;
    if (autoOpenedRef.current) return;

    const params = new URLSearchParams(window.location.search);
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
