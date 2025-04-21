
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog } from "@/components/ui/dialog";
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
    
    console.log("Editing purchase order with direct dialog:", id);
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
        <PurchaseOrderEditForm 
          orderId={selectedOrderId || ''} 
          onClose={handleCloseDialog} 
        />
      </Dialog>
    );
  };
  
  return {
    handleEdit,
    EditDialog,
    isDialogOpen
  };
}
