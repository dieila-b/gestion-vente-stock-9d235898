
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { StockEntryForm, stockEntrySchema } from "@/hooks/stocks/useStockMovementTypes";

interface UseStockEntryFormProps {
  onSubmit: (data: StockEntryForm) => Promise<boolean>;
  products: { id: string; name: string; reference?: string; price: number; }[];
}

export function useStockEntryForm({ onSubmit, products }: UseStockEntryFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<StockEntryForm>({
    resolver: zodResolver(stockEntrySchema),
    defaultValues: {
      warehouseId: "",
      productId: "",
      quantity: 1,
      unitPrice: 0,
      reason: ""
    }
  });

  const selectedProductId = form.watch('productId');
  const selectedProduct = selectedProductId 
    ? products.find(p => p.id === selectedProductId)
    : null;
  
  // Update unit price when product selection changes
  if (selectedProduct && selectedProduct.price) {
    form.setValue('unitPrice', selectedProduct.price);
  }
  
  const handleSubmit = async (values: StockEntryForm) => {
    setIsSubmitting(true);
    try {
      const success = await onSubmit(values);
      if (success) {
        form.reset();
        return true;
      }
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    isSubmitting,
    handleSubmit
  };
}
