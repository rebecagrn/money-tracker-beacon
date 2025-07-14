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

function parseCurrencyInput(inputValue: string): string {
  if (!inputValue) return "";
  // Remove currency symbols and spaces
  let cleaned = inputValue.replace(/[^\d.,]/g, "");
  if (!cleaned) return "";

  // If both ',' and '.' are present, last one is decimal
  const lastComma = cleaned.lastIndexOf(",");
  const lastDot = cleaned.lastIndexOf(".");
  let decimalSep = "";
  let intPart = cleaned;
  let fracPart = "";

  if (lastComma !== -1 && lastDot !== -1) {
    if (lastComma > lastDot) {
      // ',' is decimal
      decimalSep = ",";
    } else {
      // '.' is decimal
      decimalSep = ".";
    }
  } else if (lastComma !== -1) {
    decimalSep = ",";
  } else if (lastDot !== -1) {
    decimalSep = ".";
  }

  if (decimalSep) {
    const lastSep = cleaned.lastIndexOf(decimalSep);
    intPart = cleaned.slice(0, lastSep).replace(/[^\d]/g, "");
    fracPart = cleaned.slice(lastSep + 1).replace(/[^\d]/g, "");
    cleaned = intPart + "." + fracPart;
  } else {
    cleaned = cleaned.replace(/[^\d]/g, "");
  }

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

    // Format number for display
    const formatNumber = (num: string): string => {
      if (!num) return "";
      const numericValue = parseFloat(num);
      if (isNaN(numericValue)) return "";
      return new Intl.NumberFormat(locale, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(numericValue);
    };

    // Update display value when value prop changes
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
      const rawValue = parseCurrencyInput(inputValue);
      onChange(rawValue);
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault();
      const pastedText = e.clipboardData.getData("text");
      const rawValue = parseCurrencyInput(pastedText);
      if (rawValue) {
        setDisplayValue(rawValue);
        onChange(rawValue);
      }
    };

    const handleBlur = () => {
      if (displayValue) {
        const rawValue = parseCurrencyInput(displayValue);
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

    const handleFocus = () => {
      if (value) {
        setDisplayValue(value);
      }
    };

    return (
      <Input
        {...props}
        ref={ref}
        type="text"
        value={displayValue}
        onChange={handleInputChange}
        onPaste={handlePaste}
        onBlur={handleBlur}
        onFocus={handleFocus}
        placeholder="0,00"
        className={cn("text-right", className)}
      />
    );
  }
);

CurrencyInput.displayName = "CurrencyInput";
