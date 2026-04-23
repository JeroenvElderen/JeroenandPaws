import { useCallback, useEffect, useRef, useState } from "react";
import ChatOrFormModal from "./ChatOrFormModal";
import ServiceChooserModal from "./ServiceChooserModal";

const toKebabCase = (value = "") =>
  String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const createRequestOptions = (service = {}) => {
  const serviceKey = service.id || service.slug || toKebabCase(service.title) || "custom-request";
  const serviceTitle = service.title || "your service";

  return {
    chatUrl: service.ctaOptions?.chatUrl,
    formUrl: service.ctaOptions?.formUrl || `/contact?service=${serviceKey}`,
    heading: service.ctaOptions?.heading || `How would you like to request ${serviceTitle}?`,
    description:
      service.ctaOptions?.description ||
      "Start on WhatsApp for a quick chat, or send a request form and we will follow up.",
  };
};

const useServiceBooking = ({
  services = [],
  defaultCta = "Send request",
  chooserTitle = "Choose a service",
  chooserDescription = "Pick the option that best fits your companion to continue.",
} = {}) => {
  const [ctaChoiceService, setCtaChoiceService] = useState(null);
  const [showChooser, setShowChooser] = useState(false);
  const autoOpenedRef = useRef(false);

  const handleSelect = useCallback((service) => {
    if (!service) return;

    if (service.ctaHref && typeof window !== "undefined") {
      setShowChooser(false);
      window.location.href = service.ctaHref;
      return;
    }

    setCtaChoiceService({
      ...service,
      ctaOptions: createRequestOptions(service),
    });
    setShowChooser(false);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (autoOpenedRef.current) return;

    const params = new URLSearchParams(window.location.search);
    if (params.get("booking") !== "1" && params.get("request") !== "1") return;
    if (services.length === 0) return;

    const requestedServiceId = params.get("service");
    const matchingService = requestedServiceId
      ? services.find((service) => service?.id === requestedServiceId)
      : null;

    autoOpenedRef.current = true;
    if (matchingService) {
      handleSelect(matchingService);
      return;
    }

    if (services.length === 1) {
      handleSelect(services[0]);
      return;
    }

    setShowChooser(true);
  }, [handleSelect, services]);

  const openBooking = useCallback(() => {
    if (services.length === 0) {
      setCtaChoiceService({ ctaOptions: createRequestOptions({}) });
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
