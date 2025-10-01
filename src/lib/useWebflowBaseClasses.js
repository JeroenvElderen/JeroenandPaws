import { useEffect } from 'react';

/**
 * Adds the baseline Webflow modifier classes (w-mod-js / w-mod-touch)
 * so that the existing Webflow-generated CSS keeps behaving the same
 * even though we no longer bundle webflow.js.
 */
export function useWebflowBaseClasses() {
  useEffect(() => {
    const root = document.documentElement;
    if (!root.classList.contains('w-mod-js')) {
      root.classList.add('w-mod-js');
    }

    const updateTouchClass = () => {
      const hasTouchSupport =
        'ontouchstart' in window ||
        (typeof window.DocumentTouch !== 'undefined' &&
          document instanceof window.DocumentTouch);

      if (hasTouchSupport) {
        root.classList.add('w-mod-touch');
      } else {
        root.classList.remove('w-mod-touch');
      }
    };

    updateTouchClass();

    window.addEventListener('touchstart', updateTouchClass, { passive: true });

    return () => {
      window.removeEventListener('touchstart', updateTouchClass);
    };
  }, []);
}
