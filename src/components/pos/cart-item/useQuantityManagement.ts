
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

interface UseQuantityManagementProps {
  itemId: string;
  initialQuantity: number;
  availableStock: number;
  onUpdateQuantity: (delta: number) => void;
  onSetQuantity?: (quantity: number) => void;
  onValidationError?: (hasError: boolean) => void;
}

export function useQuantityManagement({
  itemId,
  initialQuantity,
  availableStock,
  onUpdateQuantity,
  onSetQuantity,
  onValidationError,
}: UseQuantityManagementProps) {
  const [quantityInput, setQuantityInput] = useState<string>(initialQuantity.toString());
  const [isEditing, setIsEditing] = useState(false);

  // Synchroniser SEULEMENT quand on n'est pas en train d'éditer ET que la quantité a changé via les boutons
  useEffect(() => {
    if (!isEditing && quantityInput !== initialQuantity.toString()) {
      setQuantityInput(initialQuantity.toString());
    }
  }, [initialQuantity, isEditing]);

  const handleQuantityFocus = useCallback(() => {
    setIsEditing(true);
    // Sélectionner tout le texte pour faciliter la remplacement
    setTimeout(() => {
      const input = document.activeElement as HTMLInputElement;
      if (input) input.select();
    }, 0);
  }, []);

  const handleQuantityChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Permettre seulement les chiffres ou une chaîne vide
    if (value === "" || /^\d+$/.test(value)) {
      setQuantityInput(value);
    }
  }, []);

  const validateAndSetQuantity = useCallback(() => {
    const value = quantityInput.trim();
    
    // Si vide ou zéro, restaurer la quantité actuelle
    if (value === "" || value === "0") {
      setQuantityInput(initialQuantity.toString());
      setIsEditing(false);
      return;
    }

    const numericValue = parseInt(value, 10);

    // Si invalide, restaurer la quantité actuelle
    if (isNaN(numericValue) || numericValue < 1) {
      setQuantityInput(initialQuantity.toString());
      setIsEditing(false);
      return;
    }

    // Vérifier le stock disponible
    if (numericValue > availableStock) {
      toast.error(`Stock insuffisant. Maximum disponible: ${availableStock}`);
      setQuantityInput(initialQuantity.toString());
      setIsEditing(false);
      if (onValidationError) onValidationError(true);
      return;
    }

    if (onValidationError) onValidationError(false);

    // Appliquer la nouvelle quantité seulement si elle est différente
    if (numericValue !== initialQuantity && onSetQuantity) {
      onSetQuantity(numericValue);
    }
    
    setIsEditing(false);
  }, [quantityInput, initialQuantity, availableStock, onSetQuantity, onValidationError]);

  const handleQuantityBlur = useCallback(() => {
    validateAndSetQuantity();
  }, [validateAndSetQuantity]);

  const handleQuantityKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur();
    }
    if (e.key === 'Escape') {
      setQuantityInput(initialQuantity.toString());
      setIsEditing(false);
      e.currentTarget.blur();
    }
  }, [initialQuantity]);

  const handleQuantityIncrease = useCallback(() => {
    if (initialQuantity >= availableStock) {
      toast.error("Stock insuffisant pour augmenter la quantité.");
      return;
    }
    onUpdateQuantity(1);
  }, [initialQuantity, availableStock, onUpdateQuantity]);

  const handleQuantityDecrease = useCallback(() => {
    if (initialQuantity <= 1) return;
    onUpdateQuantity(-1);
  }, [initialQuantity, onUpdateQuantity]);

  return {
    quantityInput,
    isEditing,
    handleQuantityFocus,
    handleQuantityChange,
    handleQuantityBlur,
    handleQuantityKeyDown,
    handleQuantityIncrease,
    handleQuantityDecrease,
  };
}
