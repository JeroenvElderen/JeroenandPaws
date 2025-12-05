import { useCallback, useEffect, useState } from "react";
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

  useEffect(() => {
    services.forEach((service) => {
      if (!service?.ctaHref) {
        prefetchAvailability(service);
      }
    });
  }, [services]);

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
        <BookingModal service={activeService} onClose={() => setActiveService(null)} />
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