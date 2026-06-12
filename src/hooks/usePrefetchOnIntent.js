import { useCallback, useRef } from "react";
import { useRouter } from "next/router";

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

export const usePrefetchOnIntent = () => {
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

  return { getLinkProps, prefetchRoute };
};
