/**
 * CurrencyInput Component
 *
 * Enhanced currency input that handles:
 * - Currency symbols (R$, $, €, etc.)
 * - Various number formats (1,000.50, 1.000,50, etc.)
 * - Paste operations with currency symbols
 * - Real-time numeric extraction without interfering with typing
 * - Formatting only on blur for better UX
 * - Robust parsing for both US and BR formats
 */
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface CurrencyInputProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "onChange" | "value"
  > {
  value: string;
  onChange: (value: string) => void;
  currency?: string;
  locale?: string;
}

interface CurrencyInputProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "onChange" | "value"
  > {
  value: string;
  onChange: (value: string) => void;
  currency?: string;
  locale?: string;
}

/**
 * Parse currency string input based on locale into a plain number string
 */
function parseCurrencyInput(inputValue: string, locale: string): string {
  if (!inputValue) return "";

  const decimalSep = new Intl.NumberFormat(locale)
    .format(1.1)
    .replace(/\d/g, "")[0];

  const thousandSep = decimalSep === "." ? "," : ".";

  let cleaned = inputValue.replace(/[^\d.,]/g, "");

  // Remove thousands separator
  cleaned = cleaned.split(thousandSep).join("");

  // Replace decimal separator with dot
  cleaned = cleaned.replace(decimalSep, ".");

  const numericValue = parseFloat(cleaned);
  return isNaN(numericValue) ? "" : numericValue.toString();
}

export const CurrencyInput = React.forwardRef<
  HTMLInputElement,
  CurrencyInputProps
>(
  (
    {
      value,
      onChange,
      currency = "BRL",
      locale = "pt-BR",
      className,
      ...props
    },
    ref
  ) => {
    const [displayValue, setDisplayValue] = useState("");

    const formatNumber = (num: string): string => {
      if (!num) return "";
      const numericValue = parseFloat(num);
      if (isNaN(numericValue)) return "";
      return new Intl.NumberFormat(locale, {
        style: "currency",
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(numericValue);
    };

    useEffect(() => {
      if (value) {
        setDisplayValue(formatNumber(value));
      } else {
        setDisplayValue("");
      }
    }, [value, locale]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      if (!inputValue) {
        setDisplayValue("");
        onChange("");
        return;
      }
      setDisplayValue(inputValue);
      const rawValue = parseCurrencyInput(inputValue, locale);
      onChange(rawValue);
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault();
      const pastedText = e.clipboardData.getData("text");
      const rawValue = parseCurrencyInput(pastedText, locale);
      if (rawValue) {
        setDisplayValue(formatNumber(rawValue));
        onChange(rawValue);
      }
    };

    const handleBlur = () => {
      if (displayValue) {
        const rawValue = parseCurrencyInput(displayValue, locale);
        if (rawValue) {
          const formatted = formatNumber(rawValue);
          setDisplayValue(formatted);
          onChange(rawValue);
        } else {
          setDisplayValue("");
          onChange("");
        }
      }
    };

    // const handleFocus = () => {
    //   if (value) {
    //     setDisplayValue(value);
    //   }
    // };

    // const handleFocus = () => {
    //   if (displayValue) {
    //     // Remove a formatação (símbolo de moeda, espaço, separadores)
    //     const unformatted = parseCurrencyInput(displayValue, locale);
    //     setDisplayValue(unformatted);
    //   }
    // };

    return (
      <Input
        {...props}
        ref={ref}
        type="text"
        value={displayValue}
        onChange={handleInputChange}
        onPaste={handlePaste}
        onBlur={handleBlur}
        // onFocus={handleFocus}
        placeholder="0,00"
        className={cn("text-right", className)}
      />
    );
  }
);

CurrencyInput.displayName = "CurrencyInput";
