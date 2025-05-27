
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface UseQuantityValidationProps {
  initialQuantity: number;
  availableStock: number;
  onSetQuantity?: (quantity: number) => void;
  onValidationError?: (hasError: boolean) => void;
}

export function useQuantityValidation({
  initialQuantity,
  availableStock,
  onSetQuantity,
  onValidationError,
}: UseQuantityValidationProps) {
  const [quantityValue, setQuantityValue] = useState<string>(initialQuantity.toString());
  const [hasQuantityError, setHasQuantityError] = useState(false);

  // Sync quantityValue with initialQuantity only when it changes externally
  useEffect(() => {
    setQuantityValue(initialQuantity.toString());
  }, [initialQuantity]);

  // Notify parent component about validation errors
  useEffect(() => {
    if (onValidationError) {
      onValidationError(hasQuantityError);
    }
  }, [hasQuantityError, onValidationError]);

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setQuantityValue(newValue);
    
    // Clear any previous errors when user starts typing
    if (hasQuantityError) {
      setHasQuantityError(false);
    }
  };

  const validateAndApplyQuantity = () => {
    const numericValue = quantityValue === "" ? 1 : Math.max(1, parseInt(quantityValue, 10));
    
    if (numericValue > availableStock) {
      setHasQuantityError(true);
      toast.error("La quantité saisie dépasse le stock disponible.");
      // Reset to current valid quantity
      setQuantityValue(initialQuantity.toString());
      return;
    }
    
    setHasQuantityError(false);
    
    // Only call onSetQuantity if the value actually changed
    if (numericValue !== initialQuantity && onSetQuantity) {
      onSetQuantity(numericValue);
    } else if (numericValue !== parseInt(quantityValue, 10)) {
      // Update display value to the corrected number
      setQuantityValue(numericValue.toString());
    }
  };

  const handleQuantityBlur = () => {
    validateAndApplyQuantity();
  };

  const handleQuantityKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      validateAndApplyQuantity();
      e.currentTarget.blur();
    }
  };

  return {
    quantityValue,
    hasQuantityError,
    handleQuantityChange,
    handleQuantityBlur,
    handleQuantityKeyDown,
    setHasQuantityError,
  };
}
