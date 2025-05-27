
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
  const [quantityValue, setQuantityValue] = useState<string>(
    item.quantity.toString()
  );
  const [hasQuantityError, setHasQuantityError] = useState(false);
  const [isUserTyping, setIsUserTyping] = useState(false);

  // Only update quantityValue when item.quantity changes AND user is not actively typing
  useEffect(() => {
    if (!isUserTyping) {
      setQuantityValue(item.quantity.toString());
    }
  }, [item.quantity, isUserTyping]);

  useEffect(() => {
    setDiscountValue(item.discount ? item.discount.toString() : "0");
  }, [item.discount]);

  // Notify parent component about validation errors
  useEffect(() => {
    if (onValidationError) {
      onValidationError(hasQuantityError);
    }
  }, [hasQuantityError, onValidationError]);

  const handleDiscountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setDiscountValue(newValue);
    
    if (onUpdateDiscount) {
      const numericValue = newValue === "" ? 0 : parseFloat(newValue);
      onUpdateDiscount(item.id, numericValue);
    }
  };

  const validateQuantity = (value: string) => {
    const numericValue = value === "" ? 1 : Math.max(1, parseInt(value, 10));
    
    if (numericValue > availableStock) {
      setHasQuantityError(true);
      toast.error("La quantité saisie dépasse le stock disponible.");
      return false;
    }
    
    setHasQuantityError(false);
    return true;
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setIsUserTyping(true);
    setQuantityValue(newValue);
    
    // Immediate validation feedback without blocking input
    if (newValue !== "") {
      const numericValue = parseInt(newValue, 10);
      if (!isNaN(numericValue) && numericValue > availableStock) {
        setHasQuantityError(true);
      } else {
        setHasQuantityError(false);
      }
    }
  };

  const handleQuantityBlur = () => {
    setIsUserTyping(false);
    const numericValue = quantityValue === "" ? 1 : Math.max(1, parseInt(quantityValue, 10));
    
    if (validateQuantity(quantityValue)) {
      // Only update if the value is valid and different from current
      if (numericValue !== item.quantity && onSetQuantity) {
        onSetQuantity(numericValue);
      }
    } else {
      // Reset to current valid quantity if invalid
      setQuantityValue(item.quantity.toString());
    }
  };

  const handleQuantityKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setIsUserTyping(false);
      const numericValue = quantityValue === "" ? 1 : Math.max(1, parseInt(quantityValue, 10));
      
      if (validateQuantity(quantityValue)) {
        if (numericValue !== item.quantity && onSetQuantity) {
          onSetQuantity(numericValue);
        }
      } else {
        setQuantityValue(item.quantity.toString());
      }
      e.currentTarget.blur();
    }
  };

  const handleQuantityIncrease = () => {
    if (item.quantity >= availableStock) {
      toast.error("La quantité demandée dépasse le stock disponible pour cet article.");
      return;
    }
    onUpdateQuantity(1);
  };

  const handleQuantityDecrease = () => {
    if (item.quantity <= 1) return;
    onUpdateQuantity(-1);
    setHasQuantityError(false); // Clear error when decreasing
  };

  const unitPriceAfterDiscount = Math.max(0, item.price - (item.discount || 0));
  const itemTotal = unitPriceAfterDiscount * item.quantity;

  return (
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
            type="number"
            min="1"
            max={availableStock}
            className={`h-7 w-16 text-center text-sm ${
              hasQuantityError ? 'border-red-500 bg-red-50' : ''
            }`}
            value={quantityValue}
            onChange={handleQuantityChange}
            onBlur={handleQuantityBlur}
            onKeyDown={handleQuantityKeyDown}
            onFocus={() => setIsUserTyping(true)}
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
      {hasQuantityError && (
        <div className="col-span-12 text-red-500 text-xs mt-1">
          Stock disponible: {availableStock}
        </div>
      )}
    </div>
  );
}
