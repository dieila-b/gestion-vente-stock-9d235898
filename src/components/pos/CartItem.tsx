
import { CartItem as CartItemType } from "@/types/pos";
import { formatGNF } from "@/lib/currency";
import { Trash2 } from "lucide-react";
import { useQuantityValidation } from "./cart-item/useQuantityValidation";
import { useDiscountHandling } from "./cart-item/useDiscountHandling";
import { QuantityControls } from "./cart-item/QuantityControls";
import { DiscountInput } from "./cart-item/DiscountInput";

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
  const {
    quantityValue,
    hasQuantityError,
    handleQuantityChange,
    handleQuantityBlur,
    handleQuantityKeyDown,
    setHasQuantityError,
  } = useQuantityValidation({
    initialQuantity: item.quantity,
    availableStock,
    onSetQuantity,
    onValidationError,
  });

  const {
    discountValue,
    handleDiscountChange,
  } = useDiscountHandling({
    initialDiscount: item.discount,
    productId: item.id,
    onUpdateDiscount,
  });

  const unitPriceAfterDiscount = Math.max(0, item.price - (item.discount || 0));
  const itemTotal = unitPriceAfterDiscount * item.quantity;

  return (
    <div className="flex items-center space-x-2 p-2 bg-primary/5 rounded-md">
      <div className="grid grid-cols-12 gap-2 w-full items-center">
        <div className="col-span-4 truncate text-left" title={item.name}>
          {item.name}
        </div>
        
        <QuantityControls
          quantity={item.quantity}
          quantityValue={quantityValue}
          hasQuantityError={hasQuantityError}
          availableStock={availableStock}
          onUpdateQuantity={onUpdateQuantity}
          onQuantityChange={handleQuantityChange}
          onQuantityBlur={handleQuantityBlur}
          onQuantityKeyDown={handleQuantityKeyDown}
          onSetHasQuantityError={setHasQuantityError}
        />
        
        <DiscountInput
          discountValue={discountValue}
          onDiscountChange={handleDiscountChange}
          onUpdateDiscount={onUpdateDiscount}
        />
        
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
