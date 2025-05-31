
import { useState, useCallback } from "react";

interface UseDiscountManagementProps {
  itemId: string;
  initialDiscount?: number;
  onUpdateDiscount?: (productId: string, discount: number) => void;
}

export function useDiscountManagement({
  itemId,
  initialDiscount,
  onUpdateDiscount,
}: UseDiscountManagementProps) {
  const [discountValue, setDiscountValue] = useState<string>(
    initialDiscount ? initialDiscount.toString() : "0"
  );

  const handleDiscountChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setDiscountValue(newValue);
    
    if (onUpdateDiscount) {
      const numericValue = newValue === "" ? 0 : parseFloat(newValue);
      onUpdateDiscount(itemId, numericValue);
    }
  }, [itemId, onUpdateDiscount]);

  return {
    discountValue,
    handleDiscountChange,
  };
}
