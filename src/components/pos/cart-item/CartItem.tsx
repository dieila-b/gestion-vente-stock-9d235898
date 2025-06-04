
import { toast } from "sonner";
import { CartItemProps } from "./CartItemTypes";
import { useCartItemState } from "./useCartItemState";
import { useCartItemValidation } from "./useCartItemValidation";
import { CartItemQuantityControls } from "./CartItemQuantityControls";
import { CartItemDiscountInput } from "./CartItemDiscountInput";
import { CartItemDisplay } from "./CartItemDisplay";

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
    discountValue,
    setDiscountValue,
    quantityInput,
    setQuantityInput,
    isEditing,
    setIsEditing,
  } = useCartItemState(item);

  const { validateAndSetQuantity } = useCartItemValidation({
    quantityInput,
    itemQuantity: item.quantity,
    availableStock,
    onValidationError,
    onSetQuantity,
    setQuantityInput,
    setIsEditing,
  });

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
    setTimeout(() => {
      const input = document.activeElement as HTMLInputElement;
      if (input) input.select();
    }, 0);
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    if (value === "" || /^\d+$/.test(value)) {
      setQuantityInput(value);
    }
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
  };

  const handleQuantityDecrease = () => {
    if (item.quantity <= 1) return;
    onUpdateQuantity(-1);
  };

  const unitPriceAfterDiscount = Math.max(0, item.price - (item.discount || 0));
  const itemTotal = unitPriceAfterDiscount * item.quantity;

  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2 p-2 bg-primary/5 rounded-md">
        <div className="grid grid-cols-12 gap-2 w-full items-center">
          <CartItemDisplay
            item={item}
            unitPriceAfterDiscount={unitPriceAfterDiscount}
            itemTotal={itemTotal}
            onRemove={onRemove}
          />
          
          <CartItemQuantityControls
            quantity={item.quantity}
            quantityInput={quantityInput}
            isEditing={isEditing}
            availableStock={availableStock}
            onQuantityFocus={handleQuantityFocus}
            onQuantityChange={handleQuantityChange}
            onQuantityBlur={handleQuantityBlur}
            onQuantityKeyDown={handleQuantityKeyDown}
            onQuantityIncrease={handleQuantityIncrease}
            onQuantityDecrease={handleQuantityDecrease}
          />
          
          {onUpdateDiscount && (
            <CartItemDiscountInput
              discountValue={discountValue}
              onDiscountChange={handleDiscountChange}
            />
          )}
        </div>
      </div>
    </div>
  );
}
