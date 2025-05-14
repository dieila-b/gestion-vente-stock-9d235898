
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { DialogClose, DialogFooter } from "@/components/ui/dialog";
import { 
  StockEntryForm as StockEntryFormType, 
  stockEntrySchema 
} from "@/hooks/stocks/useStockMovementTypes";
import { 
  WarehouseSelect, 
  ProductSelect, 
  QuantityInput, 
  PriceInput, 
  ReasonInput 
} from "./FormFields";

interface StockEntryFormContentProps {
  warehouses: { id: string; name: string; }[];
  products: { id: string; name: string; reference?: string; price: number; }[];
  onSubmit: (data: StockEntryFormType) => Promise<boolean>;
  onSubmitSuccess: () => void;
}

export function StockEntryFormContent({ 
  warehouses, 
  products, 
  onSubmit,
  onSubmitSuccess 
}: StockEntryFormContentProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<StockEntryFormType>({
    resolver: zodResolver(stockEntrySchema),
    defaultValues: {
      warehouseId: "",
      productId: "",
      quantity: 1,
      unitPrice: 0,
      reason: ""
    }
  });
  
  const handleSubmit = async (values: StockEntryFormType) => {
    setIsSubmitting(true);
    try {
      const success = await onSubmit(values);
      if (success) {
        form.reset();
        onSubmitSuccess();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedProductId = form.watch('productId');
  const selectedProduct = selectedProductId 
    ? products.find(p => p.id === selectedProductId)
    : null;
  
  // Update unit price when product selection changes
  useEffect(() => {
    if (selectedProduct && !form.getValues('unitPrice')) {
      form.setValue('unitPrice', selectedProduct.price || 0);
    }
  }, [selectedProduct, form]);
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-4">
        <WarehouseSelect form={form} warehouses={warehouses} />
        <ProductSelect form={form} products={products} />
        
        <div className="grid grid-cols-2 gap-4">
          <QuantityInput form={form} />
          <PriceInput form={form} />
        </div>
        
        <ReasonInput form={form} />
        
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" type="button">Annuler</Button>
          </DialogClose>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Traitement...' : 'Enregistrer'}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
