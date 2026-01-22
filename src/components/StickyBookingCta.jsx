import React, { useEffect, useState } from "react";

const StickyBookingCta = ({
  label,
  onClick,
  anchorSelector = '[data-sticky-anchor="true"]',
}) => {
  const [isVisible, setIsVisible] = useState(true);

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

  return (
    <div
      className={`sticky-cta${isVisible ? "" : " is-hidden"}`}
      aria-label="Primary call to action"
    >
      <button
        type="button"
        className="button w-button sticky-cta__button"
        onClick={onClick}
      >
        {label}
      </button>
    </div>
  );
};

export default StickyBookingCta;