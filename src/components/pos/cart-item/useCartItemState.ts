
import { useState, useEffect } from "react";
import { CartItem as CartItemType } from "@/types/pos";

export function useCartItemState(item: CartItemType) {
  const [discountValue, setDiscountValue] = useState<string>(
    item.discount ? item.discount.toString() : "0"
  );
  const [quantityInput, setQuantityInput] = useState<string>(item.quantity.toString());
  const [isEditing, setIsEditing] = useState(false);

  // Synchroniser l'input avec la quantité de l'item uniquement si on n'est pas en train d'éditer
  useEffect(() => {
    if (!isEditing) {
      setQuantityInput(item.quantity.toString());
    }
  }, [item.quantity, isEditing]);

  return {
    discountValue,
    setDiscountValue,
    quantityInput,
    setQuantityInput,
    isEditing,
    setIsEditing,
  };
}
