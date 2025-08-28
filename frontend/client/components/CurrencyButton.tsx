import React from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";

interface Props {
  currency: string;
  onChange: (value: "LKR" | "USD" | "EUR") => void;
  className?: string;
}

const label = (c: string) => (c === "USD" ? "$" : c === "EUR" ? "€" : "Rs");

const CurrencyButton: React.FC<Props> = ({ currency, onChange, className }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Select currency"
          title="Select currency"
          className={`currency-button ${className || ""}`}
        >
          <span className="currency-button__text" aria-hidden>
            {label(currency)}
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="currency-menu min-w-[8rem]">
        <DropdownMenuItem onClick={() => onChange("LKR")}>LKR (Rs)</DropdownMenuItem>
        <DropdownMenuItem onClick={() => onChange("USD")}>USD ($)</DropdownMenuItem>
        <DropdownMenuItem onClick={() => onChange("EUR")}>EUR (€)</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default CurrencyButton;
