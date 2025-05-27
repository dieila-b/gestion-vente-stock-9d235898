
import { CartItem as CartItemType } from "@/types/pos";
import { formatGNF } from "@/lib/currency";
import { Input } from "@/components/ui/input";
import { Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
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
  const [quantityInput, setQuantityInput] = useState<string>(item.quantity.toString());
  const [isInputFocused, setIsInputFocused] = useState(false);

  // Sync quantity input only when item changes and input is not focused
  useEffect(() => {
    if (!isInputFocused) {
      setQuantityInput(item.quantity.toString());
    }
  }, [item.quantity, isInputFocused]);

  const handleDiscountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setDiscountValue(newValue);
    
    if (onUpdateDiscount) {
      const numericValue = newValue === "" ? 0 : parseFloat(newValue);
      onUpdateDiscount(item.id, numericValue);
    }
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow any input while typing
    setQuantityInput(value);
  };

  const handleQuantityFocus = () => {
    setIsInputFocused(true);
  };

  const handleQuantityBlur = () => {
    setIsInputFocused(false);
    const value = quantityInput.trim();
    
    // If empty or zero, reset to current quantity
    if (value === "" || value === "0") {
      setQuantityInput(item.quantity.toString());
      return;
    }

    const numericValue = parseInt(value, 10);

    // If invalid number, reset to current quantity
    if (isNaN(numericValue) || numericValue < 1) {
      setQuantityInput(item.quantity.toString());
      return;
    }

    // Check stock availability
    if (numericValue > availableStock) {
      toast.error(`Stock insuffisant. Maximum disponible: ${availableStock}`);
      setQuantityInput(item.quantity.toString());
      if (onValidationError) onValidationError(true);
      return;
    }

    if (onValidationError) onValidationError(false);

    // Only update if the value is different
    if (numericValue !== item.quantity && onSetQuantity) {
      onSetQuantity(numericValue);
    }
  };

  const handleQuantityKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur();
    }
    if (e.key === 'Escape') {
      setQuantityInput(item.quantity.toString());
      e.currentTarget.blur();
    }
  };

  const handleQuantityIncrease = () => {
    if (item.quantity >= availableStock) {
      toast.error("Stock insuffisant pour augmenter la quantité.");
      return;
    }
    onUpdateQuantity(1);
    // Ne pas modifier quantityInput ici - laisser useEffect s'en charger
  };

  const handleQuantityDecrease = () => {
    if (item.quantity <= 1) return;
    onUpdateQuantity(-1);
    // Ne pas modifier quantityInput ici - laisser useEffect s'en charger
  };

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
