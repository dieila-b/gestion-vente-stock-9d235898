
import { useState, useEffect } from "react";

interface UseDiscountHandlingProps {
  initialDiscount?: number;
  productId: string;
  onUpdateDiscount?: (productId: string, discount: number) => void;
}

export function useDiscountHandling({
  initialDiscount,
  productId,
  onUpdateDiscount,
}: UseDiscountHandlingProps) {
  const [discountValue, setDiscountValue] = useState<string>(
    initialDiscount ? initialDiscount.toString() : "0"
  );

  useEffect(() => {
    setDiscountValue(initialDiscount ? initialDiscount.toString() : "0");
  }, [initialDiscount]);

  const handleDiscountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setDiscountValue(newValue);
    
    if (onUpdateDiscount) {
      const numericValue = newValue === "" ? 0 : parseFloat(newValue);
      onUpdateDiscount(productId, numericValue);
    }
  };

  return {
    discountValue,
    handleDiscountChange,
  };
}
