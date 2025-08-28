import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

const AnalyticsTracker = () => {
  const location = useLocation();
  const didInitRef = useRef(false);

  useEffect(() => {
    if (!didInitRef.current) {
      didInitRef.current = true;
      return; // avoid double-counting initial page_view sent by the base gtag config
    }

    const page_path = `${location.pathname}${location.search}`;
    const page_title = document.title;
    const page_location = window.location.href;

    if (typeof window.gtag === "function") {
      window.gtag("event", "page_view", {
        page_path,
        page_title,
        page_location,
      });
    } else if (Array.isArray(window.dataLayer)) {
      window.dataLayer.push({
        event: "page_view",
        page_path,
        page_title,
        page_location,
      });
    }
  }, [location.pathname, location.search]);

  return null;
};

export default AnalyticsTracker;
