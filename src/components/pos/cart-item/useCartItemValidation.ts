
import { toast } from "sonner";

interface UseCartItemValidationProps {
  quantityInput: string;
  itemQuantity: number;
  availableStock: number;
  onValidationError?: (hasError: boolean) => void;
  onSetQuantity?: (quantity: number) => void;
  setQuantityInput: (value: string) => void;
  setIsEditing: (value: boolean) => void;
}

export function useCartItemValidation({
  quantityInput,
  itemQuantity,
  availableStock,
  onValidationError,
  onSetQuantity,
  setQuantityInput,
  setIsEditing,
}: UseCartItemValidationProps) {
  const validateAndSetQuantity = () => {
    const value = quantityInput.trim();
    
    if (value === "" || value === "0") {
      setQuantityInput(itemQuantity.toString());
      setIsEditing(false);
      return;
    }

    const numericValue = parseInt(value, 10);

    if (isNaN(numericValue) || numericValue < 1) {
      setQuantityInput(itemQuantity.toString());
      setIsEditing(false);
      return;
    }

    if (numericValue > availableStock) {
      toast.error(`Stock insuffisant. Maximum disponible: ${availableStock}`);
      setQuantityInput(itemQuantity.toString());
      setIsEditing(false);
      if (onValidationError) onValidationError(true);
      return;
    }

    if (onValidationError) onValidationError(false);

    // Utiliser setQuantity directement pour remplacer la quantité
    if (numericValue !== itemQuantity && onSetQuantity) {
      onSetQuantity(numericValue);
    }
    
    setIsEditing(false);
  };

  return { validateAndSetQuantity };
}
