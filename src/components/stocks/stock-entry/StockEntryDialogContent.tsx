
import { DialogFooter, DialogClose, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { StockEntryForm } from "./StockEntryForm";
import { StockEntryForm as StockEntryFormType } from "@/hooks/stocks/useStockMovementTypes";
import { useState } from "react";

interface StockEntryDialogContentProps {
  warehouses: { id: string; name: string; }[];
  posLocations?: { id: string; name: string; }[];
  products: { id: string; name: string; reference?: string; price: number; }[];
  onSubmit: (data: StockEntryFormType) => Promise<boolean>;
  onSubmitSuccess: () => void;
  isSubmitting?: boolean;
}

export function StockEntryDialogContent({
  warehouses,
  posLocations = [],
  products,
  onSubmit,
  onSubmitSuccess,
  isSubmitting = false
}: StockEntryDialogContentProps) {
  const [localSubmitting, setLocalSubmitting] = useState(false);
  
  const handleSubmit = async (data: StockEntryFormType) => {
    setLocalSubmitting(true);
    try {
      const success = await onSubmit(data);
      if (success) {
        onSubmitSuccess();
      }
      return success;
    } catch (error) {
      console.error("Erreur lors de la soumission du formulaire d'entrée de stock:", error);
      return false;
    } finally {
      setLocalSubmitting(false);
    }
  };
  
  // Combinaison des deux états de chargement
  const isProcessing = isSubmitting || localSubmitting;
  
  return (
    <>
      <DialogDescription className="text-sm text-muted-foreground mb-4">
        Ajoutez de nouveaux articles à votre stock en remplissant ce formulaire.
      </DialogDescription>
      
      <StockEntryForm 
        warehouses={warehouses} 
        posLocations={posLocations}
        products={products} 
        onSubmit={handleSubmit}
        onSuccess={onSubmitSuccess}
      />
      
      <DialogFooter className="mt-4">
        <DialogClose asChild>
          <Button 
            variant="outline" 
            type="button" 
            disabled={isProcessing}
          >
            Annuler
          </Button>
        </DialogClose>
        <Button 
          type="submit" 
          form="stock-entry-form" 
          disabled={isProcessing}
        >
          {isProcessing ? "Traitement..." : "Enregistrer"}
        </Button>
      </DialogFooter>
    </>
  );
}
