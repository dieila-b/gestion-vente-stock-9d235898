
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { DialogClose, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
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
    if (isSubmitting) return;
    
    console.log("Form submission started with values:", values);
    
    setIsSubmitting(true);
    try {
      // Vérifications de base avant la soumission
      if (!values.warehouseId || !values.productId) {
        console.error("Missing required fields", { warehouseId: values.warehouseId, productId: values.productId });
        toast.error("Données incomplètes", {
          description: "Veuillez sélectionner un entrepôt et un produit."
        });
        return;
      }
      
      if (values.quantity <= 0) {
        toast.error("Quantité invalide", {
          description: "La quantité doit être supérieure à zéro."
        });
        return;
      }
      
      // Log pour le débogage
      console.log("Form is valid, submitting to backend:", values);
      
      const success = await onSubmit(values);
      
      if (success) {
        console.log("Stock entry created successfully");
        toast.success("Entrée stock créée", {
          description: "L'entrée de stock a été enregistrée avec succès."
        });
        form.reset();
        onSubmitSuccess();
      } else {
        console.error("Stock entry creation failed without specific error");
        toast.error("Échec de l'opération", {
          description: "Impossible de créer l'entrée de stock."
        });
      }
    } catch (error) {
      console.error("Exception during stock entry submission:", error);
      toast.error("Erreur", {
        description: `Erreur lors de la création: ${error instanceof Error ? error.message : String(error)}`
      });
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
    if (selectedProduct && selectedProduct.price) {
      console.log(`Updating unit price to ${selectedProduct.price} from product selection`);
      form.setValue('unitPrice', selectedProduct.price);
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
