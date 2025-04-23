
import { useState, useCallback } from "react";
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
    // Force un delay de 0ms pour s'assurer que l'état est mis à jour
    setTimeout(() => {
      setIsDialogOpen(true);
    }, 0);
  };
  
  const handleCloseDialog = useCallback(() => {
    console.log("Closing edit dialog - setting isDialogOpen to false");
    setIsDialogOpen(false);
    
    // Delay resetting orderId to prevent UI flickering
    setTimeout(() => {
      console.log("Setting selectedOrderId to null");
      setSelectedOrderId(null);
    }, 100);
  }, []);
  
  const EditDialog = () => {
    if (!selectedOrderId) return null;
    
    return (
      <Dialog 
        open={isDialogOpen} 
        onOpenChange={(open) => {
          console.log("Dialog onOpenChange triggered with value:", open);
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
