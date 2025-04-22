
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { PurchaseOrderEditForm } from "@/components/purchases/edit/PurchaseOrderEditForm";

export function useEditPurchaseOrder() {
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  
  const handleEdit = (id: string) => {
    if (!id) {
      console.error("No purchase order ID provided for editing");
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
