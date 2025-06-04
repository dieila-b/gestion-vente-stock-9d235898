
import { CartItem as CartItemType } from "@/types/pos";

export interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (delta: number) => void;
  onUpdateDiscount?: (productId: string, discount: number) => void;
  onRemove: () => void;
  onSetQuantity?: (quantity: number) => void;
  availableStock?: number;
  onValidationError?: (hasError: boolean) => void;
}

export interface QuantityControlsProps {
  quantity: number;
  quantityInput: string;
  isEditing: boolean;
  availableStock: number;
  onQuantityFocus: () => void;
  onQuantityChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onQuantityBlur: () => void;
  onQuantityKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onQuantityIncrease: () => void;
  onQuantityDecrease: () => void;
}

export interface DiscountInputProps {
  discountValue: string;
  onDiscountChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export interface CartItemDisplayProps {
  item: CartItemType;
  unitPriceAfterDiscount: number;
  itemTotal: number;
  onRemove: () => void;
}
