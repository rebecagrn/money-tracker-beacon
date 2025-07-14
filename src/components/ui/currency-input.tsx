import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface CurrencyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value: string;
  onChange: (value: string) => void;
  currency?: string;
  locale?: string;
}

export const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ value, onChange, currency = 'BRL', locale = 'pt-BR', className, ...props }, ref) => {
    const [displayValue, setDisplayValue] = useState('');

    // Format number for display
    const formatNumber = (num: string): string => {
      if (!num) return '';
      
      // Remove all non-numeric characters except dots and commas
      const cleaned = num.replace(/[^\d.,]/g, '');
      
      // Handle different decimal separators
      let normalizedValue = cleaned;
      
      // If using comma as decimal separator (e.g., 2,50)
      if (normalizedValue.includes(',') && !normalizedValue.includes('.')) {
        normalizedValue = normalizedValue.replace(',', '.');
      }
      // If using comma as thousands separator (e.g., 1,200.50)
      else if (normalizedValue.includes(',') && normalizedValue.includes('.')) {
        const lastCommaIndex = normalizedValue.lastIndexOf(',');
        const lastDotIndex = normalizedValue.lastIndexOf('.');
        
        if (lastDotIndex > lastCommaIndex) {
          // Dot is decimal separator, comma is thousands
          normalizedValue = normalizedValue.replace(/,/g, '');
        } else {
          // Comma is decimal separator, dot might be thousands
          normalizedValue = normalizedValue.replace(/\./g, '').replace(',', '.');
        }
      }
      
      const numericValue = parseFloat(normalizedValue);
      if (isNaN(numericValue)) return '';
      
      return new Intl.NumberFormat(locale, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(numericValue);
    };

    // Get raw numeric value
    const getRawValue = (formattedValue: string): string => {
      if (!formattedValue) return '';
      
      // Remove formatting and get just the number
      const cleaned = formattedValue.replace(/[^\d.,]/g, '');
      let normalizedValue = cleaned;
      
      // Handle different decimal separators
      if (normalizedValue.includes(',') && !normalizedValue.includes('.')) {
        normalizedValue = normalizedValue.replace(',', '.');
      } else if (normalizedValue.includes(',') && normalizedValue.includes('.')) {
        const lastCommaIndex = normalizedValue.lastIndexOf(',');
        const lastDotIndex = normalizedValue.lastIndexOf('.');
        
        if (lastDotIndex > lastCommaIndex) {
          normalizedValue = normalizedValue.replace(/,/g, '');
        } else {
          normalizedValue = normalizedValue.replace(/\./g, '').replace(',', '.');
        }
      }
      
      const numericValue = parseFloat(normalizedValue);
      return isNaN(numericValue) ? '' : numericValue.toString();
    };

    // Update display value when value prop changes
    useEffect(() => {
      if (value) {
        setDisplayValue(formatNumber(value));
      } else {
        setDisplayValue('');
      }
    }, [value, locale]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      
      // Allow empty input
      if (!inputValue) {
        setDisplayValue('');
        onChange('');
        return;
      }
      
      // Get raw numeric value
      const rawValue = getRawValue(inputValue);
      
      // Update display with formatted value
      const formatted = formatNumber(inputValue);
      setDisplayValue(formatted);
      
      // Call onChange with raw numeric value
      onChange(rawValue);
    };

    const handleBlur = () => {
      // Reformat on blur to ensure consistent formatting
      if (displayValue) {
        const rawValue = getRawValue(displayValue);
        const formatted = formatNumber(rawValue);
        setDisplayValue(formatted);
      }
    };

    return (
      <Input
        {...props}
        ref={ref}
        type="text"
        value={displayValue}
        onChange={handleInputChange}
        onBlur={handleBlur}
        placeholder="0,00"
        className={cn("text-right", className)}
      />
    );
  }
);

CurrencyInput.displayName = "CurrencyInput";