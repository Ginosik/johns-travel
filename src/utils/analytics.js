export function trackEvent(name, properties = {}) {
  if (typeof window === "undefined") return;

  const cleanProperties = Object.fromEntries(
    Object.entries(properties).filter(([, value]) => (
      value === null || ["string", "number", "boolean"].includes(typeof value)
    ))
  );

  window.dispatchEvent(new CustomEvent("conversante:analytics", {
    detail: { name, properties: cleanProperties }
  }));

  if (typeof window.plausible === "function") {
    window.plausible(name, { props: cleanProperties });
  }

  if (typeof window.gtag === "function") {
    window.gtag("event", name, cleanProperties);
  }

  if (Array.isArray(window.dataLayer)) {
    window.dataLayer.push({ event: name, ...cleanProperties });
  }
}
