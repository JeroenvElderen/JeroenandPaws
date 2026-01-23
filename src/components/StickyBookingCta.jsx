import React, { useEffect, useState } from "react";
import { getWhatsappChatUrl } from "../utils/chatLinks";

const StickyBookingCta = ({
  label,
  onClick,
  anchorSelector = '[data-sticky-anchor="true"]',
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  useEffect(() => {
    const anchor = document.querySelector(anchorSelector);
    if (!anchor) {
      setIsVisible(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(!entry.isIntersecting);
      },
      { threshold: 0.2 }
    );

    observer.observe(anchor);

    return () => observer.disconnect();
  }, [anchorSelector]);

  const whatsappUrl = getWhatsappChatUrl();
  const handleClick = onClick || (() => window.open(whatsappUrl, "_blank"));

  return (
    <div
      className={`sticky-cta${isVisible ? "" : " is-hidden"}`}
      aria-label="Primary call to action"
    >
      <button
        type="button"
        className="button w-button sticky-cta__button"
        onClick={handleClick}
      >
        {label}
      </button>
    </div>
  );
};

export default StickyBookingCta;