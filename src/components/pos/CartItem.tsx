
import { CartItem as CartItemType } from "@/types/pos";
import { useQuantityManagement } from "./cart-item/useQuantityManagement";
import { useDiscountManagement } from "./cart-item/useDiscountManagement";
import { QuantityControls } from "./cart-item/QuantityControls";
import { DiscountInput } from "./cart-item/DiscountInput";
import { ItemDisplay } from "./cart-item/ItemDisplay";

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
  const quantityManagement = useQuantityManagement({
    itemId: item.id,
    initialQuantity: item.quantity,
    availableStock,
    onUpdateQuantity,
    onSetQuantity,
    onValidationError,
  });

  const discountManagement = useDiscountManagement({
    itemId: item.id,
    initialDiscount: item.discount,
    onUpdateDiscount,
  });

  const unitPriceAfterDiscount = Math.max(0, item.price - (item.discount || 0));
  const itemTotal = unitPriceAfterDiscount * item.quantity;

  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2 p-2 bg-primary/5 rounded-md">
        <div className="grid grid-cols-12 gap-2 w-full items-center">
          <ItemDisplay
            name={item.name}
            unitPriceAfterDiscount={unitPriceAfterDiscount}
            itemTotal={itemTotal}
            onRemove={onRemove}
          />
          
          <QuantityControls
            quantity={item.quantity}
            quantityInput={quantityManagement.quantityInput}
            availableStock={availableStock}
            onQuantityFocus={quantityManagement.handleQuantityFocus}
            onQuantityChange={quantityManagement.handleQuantityChange}
            onQuantityBlur={quantityManagement.handleQuantityBlur}
            onQuantityKeyDown={quantityManagement.handleQuantityKeyDown}
            onQuantityIncrease={quantityManagement.handleQuantityIncrease}
            onQuantityDecrease={quantityManagement.handleQuantityDecrease}
          />
          
          <DiscountInput
            discountValue={discountManagement.discountValue}
            onDiscountChange={discountManagement.handleDiscountChange}
            showDiscount={!!onUpdateDiscount}
          />
        </div>
      </div>
    </div>
  );
}
