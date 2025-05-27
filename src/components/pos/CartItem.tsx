
import { CartItem as CartItemType } from "@/types/pos";
import { formatGNF } from "@/lib/currency";
import { Input } from "@/components/ui/input";
import { Trash2 } from "lucide-react";
import { useState, useEffect } from "react";

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (delta: number) => void;
  onUpdateDiscount?: (productId: string, discount: number) => void;
  onRemove: () => void;
  onSetQuantity?: (quantity: number) => void;
}

export function CartItem({
  item,
  onUpdateQuantity,
  onUpdateDiscount,
  onRemove,
  onSetQuantity,
}: CartItemProps) {
  const [discountValue, setDiscountValue] = useState<string>(
    item.discount ? item.discount.toString() : "0"
  );
  const [quantityValue, setQuantityValue] = useState<string>(
    item.quantity.toString()
  );

  useEffect(() => {
    setQuantityValue(item.quantity.toString());
  }, [item.quantity]);

  useEffect(() => {
    setDiscountValue(item.discount ? item.discount.toString() : "0");
  }, [item.discount]);

  const handleDiscountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setDiscountValue(newValue);
    
    if (onUpdateDiscount) {
      const numericValue = newValue === "" ? 0 : parseFloat(newValue);
      onUpdateDiscount(item.id, numericValue);
    }
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setQuantityValue(newValue);
  };

  const handleQuantityBlur = () => {
    const numericValue = quantityValue === "" ? 1 : Math.max(1, parseInt(quantityValue, 10));
    setQuantityValue(numericValue.toString());
    if (onSetQuantity) {
      onSetQuantity(numericValue);
    }
  };

  const handleQuantityKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleQuantityBlur();
    }
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
            onClick={() => onUpdateQuantity(-1)}
            disabled={item.quantity <= 1}
          >
            -
          </button>
          <Input
            type="number"
            min="1"
            className="h-7 w-16 text-center text-sm"
            value={quantityValue}
            onChange={handleQuantityChange}
            onBlur={handleQuantityBlur}
            onKeyDown={handleQuantityKeyDown}
          />
          <button
            className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center text-sm hover:bg-primary/20 transition-colors"
            onClick={() => onUpdateQuantity(1)}
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
  );
}
