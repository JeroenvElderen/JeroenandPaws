import React, { useMemo, useState } from "react";
import ChatOrFormModal from "./ChatOrFormModal";

const useServiceCtaModal = (serviceConfig) => {
  const [isOpen, setIsOpen] = useState(false);

  const service = useMemo(
    () => ({
      id: serviceConfig?.id || "custom-request",
      title: serviceConfig?.title || "Custom request",
      ctaOptions: {
        formUrl: serviceConfig?.formUrl || "/contact",
        heading: serviceConfig?.heading,
        description: serviceConfig?.description,
      },
    }),
    [serviceConfig]
  );

  return {
    openCtaModal: () => setIsOpen(true),
    ctaModal: isOpen ? <ChatOrFormModal service={service} onClose={() => setIsOpen(false)} /> : null,
  };
};

export default useServiceCtaModal;
