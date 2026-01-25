import { useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/router";

const DEFAULT_IDLE_TIMEOUT = 2000;
const DEFAULT_FALLBACK_DELAY = 1500;

const getPrefetchableHref = (href) => {
  if (!href) {
    return null;
  }

  if (typeof href === "string") {
    return href;
  }

  if (typeof href === "object" && href.pathname) {
    return href.pathname;
  }

  return null;
};

export const usePrefetchOnIntent = (prefetchTargets = []) => {
  const router = useRouter();
  const prefetchedRoutes = useRef(new Set());

  const prefetchRoute = useCallback(
    (href) => {
      const route = getPrefetchableHref(href);
      if (!route || prefetchedRoutes.current.has(route)) {
        return;
      }

      prefetchedRoutes.current.add(route);
      router.prefetch(route);
    },
    [router]
  );

  const getLinkProps = useCallback(
    (href) => ({
      onMouseEnter: () => prefetchRoute(href),
      onFocus: () => prefetchRoute(href),
      onTouchStart: () => prefetchRoute(href),
    }),
    [prefetchRoute]
  );

  useEffect(() => {
    if (typeof window === "undefined" || prefetchTargets.length === 0) {
      return;
    }

    const runPrefetch = () => {
      prefetchTargets.forEach((href) => prefetchRoute(href));
    };

    if ("requestIdleCallback" in window) {
      const handle = window.requestIdleCallback(runPrefetch, {
        timeout: DEFAULT_IDLE_TIMEOUT,
      });

      return () => {
        if ("cancelIdleCallback" in window) {
          window.cancelIdleCallback(handle);
        }
      };
    }

    const timeout = window.setTimeout(runPrefetch, DEFAULT_FALLBACK_DELAY);
    return () => window.clearTimeout(timeout);
  }, [prefetchRoute, prefetchTargets]);

  return { getLinkProps, prefetchRoute };
};