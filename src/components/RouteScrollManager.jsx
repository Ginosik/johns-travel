import { useLayoutEffect, useRef } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

const scrollPositions = new Map();

function RouteScrollManager() {
  const location = useLocation();
  const navigationType = useNavigationType();
  const locationKeyRef = useRef(location.key);

  useLayoutEffect(() => {
    const locationKey = location.key;
    locationKeyRef.current = locationKey;
    const savedPosition = navigationType === "POP" ? scrollPositions.get(locationKey) : 0;
    const frame = window.requestAnimationFrame(() => {
      window.scrollTo(0, savedPosition ?? 0);
    });

    return () => {
      window.cancelAnimationFrame(frame);
      scrollPositions.set(locationKey, window.scrollY);
    };
  }, [location.key, navigationType]);

  return null;
}

export default RouteScrollManager;
