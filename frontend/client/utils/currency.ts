import { getCookie } from "./cookies";

export type SupportedCurrency = "LKR" | "USD" | "EUR";

interface RatesCache {
  base_code: SupportedCurrency;
  conversion_rates: Record<string, number>;
  time_next_update_unix: number; // seconds since epoch
  fetched_at: number; // ms since epoch
}

const STORAGE_KEY = "exchange_rates_LKR";

// Static hardcoded rates (LKR per 1 unit of foreign currency)
const LKR_PER_USD = 302.14;
const LKR_PER_EUR = 349.99;

// Convert to LKR-base conversion map (value = target currency per 1 LKR)
const STATIC_RATES: Record<string, number> = {
  USD: 1 / LKR_PER_USD,
  EUR: 1 / LKR_PER_EUR,
  LKR: 1,
};

export const getSelectedCurrency = (): SupportedCurrency => {
  const c = getCookie("pref_currency");
  if (c === "USD" || c === "EUR") return c;
  return "LKR";
};

export async function getRates(): Promise<RatesCache | null> {
  try {
    // Always use the static map; also persist once for downstream consumers
    const payload: RatesCache = {
      base_code: "LKR",
      conversion_rates: STATIC_RATES,
      time_next_update_unix: Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60, // refresh far in future
      fetched_at: Date.now(),
    };
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(payload)); } catch {}
    try { window.dispatchEvent(new CustomEvent("rates-updated", { detail: { base: "LKR", at: Date.now() } })); } catch {}
    return payload;
  } catch {
    return null;
  }
}

let refreshTimer: number | null = null;
function scheduleRatesRefresh(delayMs: number) {
  if (refreshTimer) {
    window.clearTimeout(refreshTimer);
  }
  // For static rates, no periodic refresh needed; keep a long interval to retain existing flow
  const delay = Math.max(24 * 60 * 60 * 1000, delayMs || 0); // 24h
  refreshTimer = window.setTimeout(() => {
    // No-op refresh to maintain previous behavior
    getRates();
  }, delay);
}

export function convertFromLKR(amountLKR: number, target: SupportedCurrency, rates?: RatesCache | null): number {
  if (target === "LKR") return Math.round(amountLKR);
  const cache: RatesCache | null =
    rates || (typeof window !== "undefined" ? (JSON.parse(localStorage.getItem(STORAGE_KEY) || "null") as RatesCache | null) : null);
  const rate = cache?.conversion_rates?.[target] ?? STATIC_RATES[target];
  if (!rate || !isFinite(rate)) return Math.round(amountLKR); // fallback to LKR amount
  return Math.round(amountLKR * rate);
}

export function formatAmount(amountLKR: number, target?: SupportedCurrency, rates?: RatesCache | null): string {
  const currency = target || getSelectedCurrency();
  const value = convertFromLKR(amountLKR, currency, rates);
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(value);
  } catch {
    return `${currency} ${value.toLocaleString()}`;
  }
}

export async function ensureRatesLoaded() {
  const cache = await getRates();
  if (cache) {
    const nextMs = cache.time_next_update_unix * 1000 - Date.now();
    scheduleRatesRefresh(nextMs);
    try { window.dispatchEvent(new CustomEvent("rates-updated", { detail: { base: cache.base_code, at: Date.now() } })); } catch {}
  }
}

export function onCurrencyChanged(callback: (currency: SupportedCurrency) => void) {
  const handler = (e: Event) => {
    const detail = (e as CustomEvent).detail as { currency?: SupportedCurrency } | undefined;
    callback((detail?.currency as SupportedCurrency) || getSelectedCurrency());
  };
  window.addEventListener("currency-changed", handler as EventListener);
  return () => window.removeEventListener("currency-changed", handler as EventListener);
}
