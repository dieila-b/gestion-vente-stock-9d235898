
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
    <div className="p-3 bg-card/50 rounded-lg border border-border/50 hover:bg-card/70 transition-colors">
      <div className="grid grid-cols-12 gap-3 items-center">
        {/* Nom du produit - 4 colonnes */}
        <div className="col-span-4">
          <div className="font-medium text-sm truncate" title={item.name}>
            {item.name}
          </div>
        </div>

        {/* Contrôles de quantité - 3 colonnes */}
        <div className="col-span-3">
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
        </div>

        {/* Remise - 2 colonnes */}
        {onUpdateDiscount && (
          <div className="col-span-2">
            <CartItemDiscountInput
              discountValue={discountValue}
              onDiscountChange={handleDiscountChange}
            />
          </div>
        )}

        {/* Prix unitaire et total - 2 colonnes */}
        <div className="col-span-2">
          <CartItemDisplay
            item={item}
            unitPriceAfterDiscount={unitPriceAfterDiscount}
            itemTotal={itemTotal}
            onRemove={onRemove}
          />
        </div>

        {/* Bouton supprimer - 1 colonne */}
        <div className="col-span-1 flex justify-center">
          <button
            onClick={onRemove}
            className="text-destructive hover:text-destructive/80 p-1 rounded hover:bg-destructive/10 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
