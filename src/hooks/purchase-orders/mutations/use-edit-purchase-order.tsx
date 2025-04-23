
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { PurchaseOrderEditForm } from "@/components/purchases/edit/PurchaseOrderEditForm";
import { toast } from "sonner";

export function useEditPurchaseOrder() {
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  
  const handleEdit = async (id: string) => {
    if (!id) {
      console.error("No purchase order ID provided for editing");
      toast.error("ID de bon de commande manquant");
      return;
    }
    
    console.log("Editing purchase order with ID:", id);
    setSelectedOrderId(id);
    setIsDialogOpen(true);
  };
  
  const handleCloseDialog = () => {
    console.log("Closing edit dialog");
    // Ferme d'abord le dialogue pour déclencher l'animation
    setIsDialogOpen(false);
    
    // Réinitialise l'ID de la commande sélectionnée après un court délai
    // pour permettre à l'animation de dialogue de se terminer
    setTimeout(() => {
      setSelectedOrderId(null);
    }, 200);
  };
  
  const EditDialog = () => {
    if (!selectedOrderId) return null;
    
    return (
      <Dialog 
        open={isDialogOpen} 
        onOpenChange={(open) => {
          if (!open) handleCloseDialog();
        }}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogTitle>Modifier Bon de Commande</DialogTitle>
          <PurchaseOrderEditForm 
            orderId={selectedOrderId} 
            onClose={handleCloseDialog}
          />
        </DialogContent>
      </Dialog>
    );
  };
  
  return {
    handleEdit,
    EditDialog,
    isDialogOpen
  };
}
