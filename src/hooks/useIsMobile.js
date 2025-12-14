import { useEffect, useState } from "react";

export const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 990px)");
    const listener = () => setIsMobile(media.matches);

    listener(); // set initial value
    media.addEventListener("change", listener);

    return () => media.removeEventListener("change", listener);
  }, []);

  return isMobile;
};
