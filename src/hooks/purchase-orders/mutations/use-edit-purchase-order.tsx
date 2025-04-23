
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
    setIsDialogOpen(false);
    setSelectedOrderId(null);
  };
  
  // This is the dialog component that will be rendered
  const EditDialog = () => {
    if (!isDialogOpen) return null;
    
    return (
      <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogTitle>Modifier Bon de Commande</DialogTitle>
          {selectedOrderId ? (
            <PurchaseOrderEditForm 
              orderId={selectedOrderId} 
              onClose={handleCloseDialog} 
            />
          ) : (
            <div className="p-4 text-center">Identifiant de bon de commande invalide</div>
          )}
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
