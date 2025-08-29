export type CookieCategory = "necessary" | "personalization";

// Map cookie names to categories
const COOKIE_CATEGORY_MAP: Record<string, CookieCategory> = {
  // Authentication/session (necessary)
  auth_username: "necessary",

  // Personalization
  pref_theme: "personalization",
  pref_currency: "personalization",
  cookie_consent: "necessary",
};

export interface CookieConsentState {
  // Necessary is always true and not user-toggleable
  necessary: true;
  personalization: boolean;
  updatedAt: number;
}

export function getCookie(name: string): string | null {
  const nameEQ = name + "=";
  const ca = document.cookie.split("; ");
  for (let i = 0; i < ca.length; i++) {
    const c = ca[i];
    if (c.indexOf(nameEQ) === 0) return decodeURIComponent(c.substring(nameEQ.length));
  }
  return null;
}

export function setCookie(name: string, value: string, days: number): void {
  // Determine category and enforce consent for personalization cookies
  const category: CookieCategory = COOKIE_CATEGORY_MAP[name] || "necessary";
  if (category === "personalization" && !hasPersonalizationConsent()) {
    // Do not set personalization cookies without consent
    return;
  }

  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = "; expires=" + date.toUTCString();
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  const sameSite = "; SameSite=Lax"; // Reasonable default for app usage
  document.cookie = `${name}=${encodeURIComponent(value)}${expires}; path=/${secure}${sameSite}`;
}

export function eraseCookie(name: string): void {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
}

export function clearAllCookies(): void {
  try {
    const names = ["auth_username", "pref_theme", "pref_currency", "cookie_consent"];
    names.forEach(eraseCookie);
    // Best-effort clear for any other cookies on current domain
    document.cookie.split("; ").forEach(c => {
      const eq = c.indexOf("=");
      const n = eq > -1 ? c.substring(0, eq) : c;
      eraseCookie(n);
    });
  } catch {}
}

export function getConsent(): CookieConsentState | null {
  const raw = getCookie("cookie_consent");
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as CookieConsentState;
    if (typeof parsed.personalization === "boolean") {
      return { necessary: true, personalization: parsed.personalization, updatedAt: parsed.updatedAt || Date.now() };
    }
  } catch {}
  return null;
}

export function hasPersonalizationConsent(): boolean {
  const consent = getConsent();
  return !!(consent && consent.personalization);
}

export function saveConsent(personalization: boolean): void {
  const payload: CookieConsentState = { necessary: true, personalization, updatedAt: Date.now() };
  // Store consent for 365 days
  setCookie("cookie_consent", JSON.stringify(payload), 365);

  // If user rejected personalization, remove personalization cookies
  if (!personalization) {
    eraseCookie("pref_theme");
    eraseCookie("pref_currency");
  }

  // Notify listeners that consent changed
  try {
    window.dispatchEvent(new CustomEvent("cookie-consent-changed", { detail: { personalization } }));
  } catch {}
}

export function applyThemeFromCookie(): void {
  const theme = getCookie("pref_theme");
  const root = document.documentElement;
  if (theme === "dark") {
    root.classList.add("dark");
  } else if (theme === "light") {
    root.classList.remove("dark");
  }
}

export function applyCurrencyFromCookie(selectEl?: HTMLSelectElement | null): void {
  const currency = getCookie("pref_currency");
  if (selectEl && currency) {
    selectEl.value = currency;
  }
}
