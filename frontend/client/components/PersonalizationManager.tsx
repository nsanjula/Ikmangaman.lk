import { useEffect, useRef } from "react";
import { applyCurrencyFromCookie, applyThemeFromCookie, getCookie, setCookie, hasPersonalizationConsent } from "../utils/cookies";
import { ensureRatesLoaded } from "../utils/currency";

const PersonalizationManager = () => {
  const appliedRef = useRef(false);

  useEffect(() => {
    if (appliedRef.current) return;
    appliedRef.current = true;

    const apply = () => {
      applyThemeFromCookie();
      if (hasPersonalizationConsent()) {
        const currency = getCookie("pref_currency");
        if (!currency) setCookie("pref_currency", "LKR", 365);
        const theme = getCookie("pref_theme");
        if (!theme) setCookie("pref_theme", document.documentElement.classList.contains('dark') ? 'dark' : 'light', 365);
      }
      const el = document.querySelector<HTMLSelectElement>('select[data-currency-select="true"]');
      if (el) applyCurrencyFromCookie(el);
    };

    apply();
    try { ensureRatesLoaded(); } catch {}

    // React to consent changes immediately
    const onConsent = () => apply();
    window.addEventListener("cookie-consent-changed", onConsent as EventListener);
    return () => window.removeEventListener("cookie-consent-changed", onConsent as EventListener);
  }, []);

  return null;
};

export default PersonalizationManager;
