import { useLayoutEffect, useRef } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

const scrollPositions = new Map();

function createScrollKey(location) {
  return `${location.pathname}${location.search}${location.hash}`;
}

function RouteScrollManager() {
  const location = useLocation();
  const navigationType = useNavigationType();
  const locationKeyRef = useRef(createScrollKey(location));

  useLayoutEffect(() => {
    locationKeyRef.current = createScrollKey(location);
  }, [location]);

  useLayoutEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    function saveScrollPosition() {
      scrollPositions.set(locationKeyRef.current, window.scrollY);
    }

    function saveBeforeNavigation(event) {
      if (!event.target.closest("a[href]")) return;
      saveScrollPosition();
    }

    document.addEventListener("click", saveBeforeNavigation, { capture: true });
    window.addEventListener("scroll", saveScrollPosition, { passive: true });
    window.addEventListener("pagehide", saveScrollPosition);

    return () => {
      saveScrollPosition();
      document.removeEventListener("click", saveBeforeNavigation, { capture: true });
      window.removeEventListener("scroll", saveScrollPosition);
      window.removeEventListener("pagehide", saveScrollPosition);
    };
  }, []);

  useLayoutEffect(() => {
    const locationKey = createScrollKey(location);
    locationKeyRef.current = locationKey;
    const savedPosition = navigationType === "POP" ? scrollPositions.get(locationKey) : 0;
    const frame = window.requestAnimationFrame(() => {
      window.scrollTo(0, savedPosition ?? 0);
    });

    return () => {
      window.cancelAnimationFrame(frame);
      scrollPositions.set(locationKey, window.scrollY);
    };
  }, [location, navigationType]);

  return null;
}

export default RouteScrollManager;
