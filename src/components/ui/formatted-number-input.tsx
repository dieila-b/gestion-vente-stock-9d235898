
import React, { useState, useEffect, forwardRef } from "react";
import { Input } from "./input";
import { formatGNFNumber } from "@/lib/currency";

interface FormattedNumberInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> {
  value: number;
  onChange: (value: number) => void;
  formatDisplay?: boolean;
}

export const FormattedNumberInput = forwardRef<HTMLInputElement, FormattedNumberInputProps>(
  ({ value, onChange, formatDisplay = true, className, ...props }, ref) => {
    const [displayValue, setDisplayValue] = useState("");

    // Update display value when actual value changes
    useEffect(() => {
      if (formatDisplay) {
        setDisplayValue(value ? formatGNFNumber(value) : "");
      } else {
        setDisplayValue(value ? value.toString() : "");
      }
    }, [value, formatDisplay]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      // Remove all non-numeric characters
      const numericValue = e.target.value.replace(/\D/g, "");
      
      // Convert to number
      const newValue = numericValue ? parseFloat(numericValue) : 0;
      
      // Call the original onChange with the numeric value
      onChange(newValue);
    };

    // Handle focus to show the raw number for editing
    const handleFocus = () => {
      setDisplayValue(value ? value.toString() : "");
    };

    // Handle blur to reformat the number
    const handleBlur = () => {
      if (formatDisplay && value) {
        setDisplayValue(formatGNFNumber(value));
      }
    };

    return (
      <Input
        {...props}
        ref={ref}
        value={displayValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className={className}
      />
    );
  }
);

FormattedNumberInput.displayName = "FormattedNumberInput";

