
import { CartItem as CartItemType } from "@/types/pos";
import { formatGNF } from "@/lib/currency";
import { Input } from "@/components/ui/input";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (delta: number) => void;
  onUpdateDiscount?: (productId: string, discount: number) => void;
  onRemove: () => void;
  onSetQuantity?: (quantity: number) => void;
  availableStock?: number;
  onValidationError?: (hasError: boolean) => void;
}

export function CartItem({
  item,
  onUpdateQuantity,
  onUpdateDiscount,
  onRemove,
  onSetQuantity,
  availableStock = 0,
  onValidationError,
}: CartItemProps) {
  const [discountValue, setDiscountValue] = useState<string>(
    item.discount ? item.discount.toString() : "0"
  );
  // État local pour contrôler complètement l'input pendant la frappe
  const [quantityInput, setQuantityInput] = useState<string>(item.quantity.toString());
  const [isEditing, setIsEditing] = useState(false);

  const handleDiscountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setDiscountValue(newValue);
    
    if (onUpdateDiscount) {
      const numericValue = newValue === "" ? 0 : parseFloat(newValue);
      onUpdateDiscount(item.id, numericValue);
    }
  };

  const handleQuantityFocus = () => {
    setIsEditing(true);
    // Sélectionner tout le texte pour faciliter la saisie
    setTimeout(() => {
      const input = document.activeElement as HTMLInputElement;
      if (input) input.select();
    }, 0);
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Permettre uniquement les chiffres pendant la frappe
    if (value === "" || /^\d+$/.test(value)) {
      setQuantityInput(value);
    }
  };

  const validateAndSetQuantity = () => {
    const value = quantityInput.trim();
    
    // Si vide, restaurer la quantité actuelle
    if (value === "" || value === "0") {
      setQuantityInput(item.quantity.toString());
      setIsEditing(false);
      return;
    }

    const numericValue = parseInt(value, 10);

    // Si invalide, restaurer la quantité actuelle
    if (isNaN(numericValue) || numericValue < 1) {
      setQuantityInput(item.quantity.toString());
      setIsEditing(false);
      return;
    }

    // Vérifier le stock disponible
    if (numericValue > availableStock) {
      toast.error(`Stock insuffisant. Maximum disponible: ${availableStock}`);
      setQuantityInput(item.quantity.toString());
      setIsEditing(false);
      if (onValidationError) onValidationError(true);
      return;
    }

    if (onValidationError) onValidationError(false);

    // Appliquer la nouvelle quantité seulement si elle est différente
    if (numericValue !== item.quantity && onSetQuantity) {
      onSetQuantity(numericValue);
    }
    
    setIsEditing(false);
  };

  const handleQuantityBlur = () => {
    validateAndSetQuantity();
  };

  const handleQuantityKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur();
    }
    if (e.key === 'Escape') {
      setQuantityInput(item.quantity.toString());
      setIsEditing(false);
      e.currentTarget.blur();
    }
  };

  const handleQuantityIncrease = () => {
    if (item.quantity >= availableStock) {
      toast.error("Stock insuffisant pour augmenter la quantité.");
      return;
    }
    onUpdateQuantity(1);
    // Mettre à jour l'input seulement si on n'est pas en train d'éditer
    if (!isEditing) {
      setQuantityInput((item.quantity + 1).toString());
    }
  };

  const handleQuantityDecrease = () => {
    if (item.quantity <= 1) return;
    onUpdateQuantity(-1);
    // Mettre à jour l'input seulement si on n'est pas en train d'éditer
    if (!isEditing) {
      setQuantityInput((item.quantity - 1).toString());
    }
  };

  // Synchroniser l'input avec la quantité réelle SEULEMENT quand on n'édite pas
  if (!isEditing && quantityInput !== item.quantity.toString()) {
    setQuantityInput(item.quantity.toString());
  }

  const unitPriceAfterDiscount = Math.max(0, item.price - (item.discount || 0));
  const itemTotal = unitPriceAfterDiscount * item.quantity;

  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2 p-2 bg-primary/5 rounded-md">
        <div className="grid grid-cols-12 gap-2 w-full items-center">
          <div className="col-span-4 truncate text-left" title={item.name}>
            {item.name}
          </div>
          
          <div className="col-span-2 flex items-center text-left space-x-1">
            <button
              className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center text-sm hover:bg-primary/20 transition-colors"
              onClick={handleQuantityDecrease}
              disabled={item.quantity <= 1}
            >
              -
            </button>
            <Input
              type="text"
              className="h-7 w-16 text-center text-sm"
              value={quantityInput}
              onChange={handleQuantityChange}
              onFocus={handleQuantityFocus}
              onBlur={handleQuantityBlur}
              onKeyDown={handleQuantityKeyDown}
              inputMode="numeric"
            />
            <button
              className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center text-sm hover:bg-primary/20 transition-colors"
              onClick={handleQuantityIncrease}
              disabled={item.quantity >= availableStock}
            >
              +
            </button>
          </div>
          
          <div className="col-span-2 text-left">
            {onUpdateDiscount && (
              <Input
                type="number"
                min="0"
                className="h-7 w-28 text-left"
                value={discountValue}
                onChange={handleDiscountChange}
              />
            )}
          </div>
          
          <div className="col-span-2 text-left">
            {formatGNF(unitPriceAfterDiscount)}
          </div>
          
          <div className="col-span-1 text-left">
            {formatGNF(itemTotal)}
          </div>
          
          <div className="col-span-1 flex justify-end">
            <button
              onClick={onRemove}
              className="text-destructive hover:text-destructive/80"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
