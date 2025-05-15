
import { useStockEntryForm } from "./hooks/useStockEntryForm";
import { Form } from "@/components/ui/form";
import { DialogClose, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { 
  StockEntryForm as StockEntryFormType
} from "@/hooks/stocks/useStockMovementTypes";
import { 
  WarehouseSelect, 
  ProductSelect, 
  QuantityInput, 
  PriceInput, 
  ReasonInput 
} from "./form-fields";

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
  const { form, isSubmitting, handleSubmit } = useStockEntryForm({
    onSubmit: async (values) => {
      try {
        // Vérifications de base avant la soumission
        if (!values.warehouseId || !values.productId) {
          console.error("Missing required fields", { warehouseId: values.warehouseId, productId: values.productId });
          toast.error("Données incomplètes", {
            description: "Veuillez sélectionner un entrepôt et un produit."
          });
          return false;
        }
        
        if (values.quantity <= 0) {
          toast.error("Quantité invalide", {
            description: "La quantité doit être supérieure à zéro."
          });
          return false;
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
          
          // Appel explicite à onSubmitSuccess pour fermer la boîte de dialogue
          console.log("Calling onSubmitSuccess to close dialog");
          onSubmitSuccess();
          return true;
        } else {
          console.error("Stock entry creation failed without specific error");
          toast.error("Échec de l'opération", {
            description: "Impossible de créer l'entrée de stock."
          });
          return false;
        }
      } catch (error) {
        console.error("Exception during stock entry submission:", error);
        toast.error("Erreur", {
          description: `Erreur lors de la création: ${error instanceof Error ? error.message : String(error)}`
        });
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
