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

// Utilitário simples para formatar número como moeda
function formatCurrency(value: number, currency: string, locale: string) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
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
    const [isFocused, setIsFocused] = useState(false);

    useEffect(() => {
      if (!value) {
        setDisplayValue("");
        return;
      }

      if (isFocused) {
        // Durante edição, mostrar valor "cru"
        setDisplayValue(value.replace(".", locale === "pt-BR" ? "," : "."));
      } else {
        // Fora do foco, mostrar formatado
        const num = parseFloat(value);
        setDisplayValue(
          isNaN(num) ? "" : formatCurrency(num, currency, locale)
        );
      }
    }, [value, locale, currency, isFocused]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;

      // Apenas números e 1 separador decimal
      const decimalSep = locale === "pt-BR" ? "," : ".";
      const cleaned = raw.replace(new RegExp(`[^\\d${decimalSep}]`, "g"), "");
      const parts = cleaned.split(decimalSep);
      const normalized =
        parts.length === 2 ? `${parts[0]}.${parts[1]}` : parts[0];

      setDisplayValue(raw);
      onChange(normalized);
    };

    const handleBlur = () => {
      setIsFocused(false);
    };

    const handleFocus = () => {
      setIsFocused(true);
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault();
      const pasted = e.clipboardData.getData("text");
      const numeric = pasted.replace(/[^\d.,]/g, "");
      const decimalSep = locale === "pt-BR" ? "," : ".";
      const parts = numeric.split(decimalSep);
      const normalized =
        parts.length === 2 ? `${parts[0]}.${parts[1]}` : parts[0];
      onChange(normalized);
      setDisplayValue(pasted);
    };

    return (
      <Input
        {...props}
        ref={ref}
        type="text"
        value={displayValue}
        onChange={handleChange}
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
