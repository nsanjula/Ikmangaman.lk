import { useEffect, useMemo, useState } from "react";
import { SupportedCurrency, getSelectedCurrency, formatAmount, onCurrencyChanged, ensureRatesLoaded } from "../utils/currency";

export function useCurrency() {
  const [currency, setCurrency] = useState<SupportedCurrency>(() => getSelectedCurrency());

  const [version, setVersion] = useState(0);

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    const onRates = () => setVersion((v) => v + 1);
    try {
      ensureRatesLoaded();
      unsubscribe = onCurrencyChanged((cur) => setCurrency(cur));
      window.addEventListener("rates-updated", onRates);
    } catch {}
    return () => {
      if (unsubscribe) unsubscribe();
      window.removeEventListener("rates-updated", onRates);
    };
  }, []);

  // Helper bound to current currency for convenient formatting
  const formatter = useMemo(() => {
    return (amountLKR: number) => formatAmount(amountLKR, currency);
  }, [currency, version]);

  return { currency, format: formatter } as const;
}

export default useCurrency;
