
import { useStockEntryForm } from "./hooks/useStockEntryForm";
import { Form } from "@/components/ui/form";
import { StockEntryForm as StockEntryFormType } from "@/hooks/stocks/useStockMovementTypes";
import { 
  WarehouseSelect, 
  ProductSelect, 
  QuantityInput, 
  PriceInput, 
  ReasonInput 
} from "./form-fields";

interface StockEntryFormProps {
  warehouses: { id: string; name: string; }[];
  products: { id: string; name: string; reference?: string; price: number; }[];
  onSubmit: (data: StockEntryFormType) => Promise<boolean>;
  onSuccess?: () => void;
}

export function StockEntryForm({ warehouses, products, onSubmit, onSuccess }: StockEntryFormProps) {
  const { form, isSubmitting, handleSubmit } = useStockEntryForm({
    onSubmit: async (values) => {
      try {
        console.log("Soumission du formulaire avec les valeurs:", values);
        const success = await onSubmit(values);
        if (success && onSuccess) {
          onSuccess();
        }
        return success;
      } catch (error) {
        console.error("Erreur lors de la soumission du formulaire:", error);
        return false;
      }
    },
    products
  });

  return (
    <Form {...form}>
      <form id="stock-entry-form" onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-4">
        <WarehouseSelect form={form} warehouses={warehouses} />
        <ProductSelect form={form} products={products} />
        
        <div className="grid grid-cols-2 gap-4">
          <QuantityInput form={form} />
          <PriceInput form={form} />
        </div>
        
        <ReasonInput form={form} />
      </form>
    </Form>
  );
}
