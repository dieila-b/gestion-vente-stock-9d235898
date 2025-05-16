
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowUpCircle } from "lucide-react";
import { StockEntryDialogContent } from "./StockEntryDialogContent";
import { StockEntryForm as StockEntryFormType } from "@/hooks/stocks/useStockMovementTypes";
import { toast } from "sonner";

interface StockEntryDialogProps {
  warehouses: { id: string; name: string }[];
  products: { id: string; name: string; reference?: string; price: number }[];
  onSubmit: (data: StockEntryFormType) => Promise<boolean>;
}

export function StockEntryDialog({ warehouses, products, onSubmit }: StockEntryDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitSuccess = () => {
    setIsOpen(false);
    toast.success("Entrée de stock créée", {
      description: "L'entrée de stock a été enregistrée avec succès."
    });
  };

  const handleSubmit = async (data: StockEntryFormType) => {
    try {
      setIsSubmitting(true);
      console.log("Soumission des données d'entrée de stock:", data);
      
      if (!data.warehouseId || !data.productId) {
        toast.error("Données incomplètes", {
          description: "Veuillez sélectionner un entrepôt et un produit."
        });
        return false;
      }
      
      const result = await onSubmit(data);
      
      if (result) {
        handleSubmitSuccess();
      } else {
        toast.error("Échec de l'entrée de stock", {
          description: "Une erreur s'est produite lors de l'enregistrement de l'entrée de stock."
        });
      }
      
      return result;
    } catch (error) {
      console.error("Erreur lors de la soumission du formulaire d'entrée de stock:", error);
      toast.error("Erreur", {
        description: `Une erreur s'est produite: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      // Si on ferme le dialogue alors qu'une soumission est en cours, ne rien faire
      if (isSubmitting && !open) return;
      setIsOpen(open);
    }}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <ArrowUpCircle className="h-4 w-4" />
          Nouvelle entrée
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Nouvelle entrée de stock</DialogTitle>
          <DialogDescription>
            Enregistrez une nouvelle entrée de marchandises dans votre stock.
          </DialogDescription>
        </DialogHeader>
        <StockEntryDialogContent 
          warehouses={warehouses} 
          products={products} 
          onSubmit={handleSubmit}
          onSubmitSuccess={handleSubmitSuccess}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
}
