
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowUpCircle } from "lucide-react";
import { StockEntryDialogContent } from "./StockEntryDialogContent";
import { StockEntryForm as StockEntryFormType } from "@/hooks/stocks/useStockMovementTypes";
import { toast } from "sonner";

interface StockEntryDialogProps {
  warehouses: { id: string; name: string }[];
  posLocations?: { id: string; name: string }[];
  products: { id: string; name: string; reference?: string; price: number }[];
  onSubmit: (data: StockEntryFormType) => Promise<boolean>;
}

export function StockEntryDialog({ warehouses, posLocations = [], products, onSubmit }: StockEntryDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitSuccess = () => {
    console.log("Stock entry submitted successfully, closing dialog");
    setIsOpen(false);
    toast.success("Entrée de stock créée", {
      description: "L'entrée de stock a été enregistrée avec succès."
    });
  };

  const handleSubmit = async (data: StockEntryFormType) => {
    try {
      setIsSubmitting(true);
      console.log("Soumission des données d'entrée de stock:", data);
      
      // Validation côté client
      if (!data.warehouseId || !data.productId) {
        toast.error("Données incomplètes", {
          description: "Veuillez sélectionner un emplacement et un produit."
        });
        return false;
      }
      
      if (data.quantity <= 0) {
        toast.error("Quantité invalide", {
          description: "La quantité doit être supérieure à zéro."
        });
        return false;
      }
      
      if (data.unitPrice <= 0) {
        toast.error("Prix invalide", {
          description: "Le prix unitaire doit être supérieur à zéro."
        });
        return false;
      }
      
      console.log("Validation réussie, envoi des données...");
      const result = await onSubmit(data);
      
      if (result) {
        console.log("Entrée de stock créée avec succès");
        handleSubmitSuccess();
        return true;
      } else {
        console.error("L'entrée de stock a échoué");
        toast.error("Échec de l'entrée de stock", {
          description: "Une erreur s'est produite lors de l'enregistrement de l'entrée de stock."
        });
        return false;
      }
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
      // Empêcher la fermeture pendant la soumission
      if (isSubmitting && !open) {
        console.log("Preventing dialog close during submission");
        return;
      }
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
        </DialogHeader>
        <StockEntryDialogContent 
          warehouses={warehouses} 
          posLocations={posLocations}
          products={products} 
          onSubmit={handleSubmit}
          onSubmitSuccess={handleSubmitSuccess}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
}
