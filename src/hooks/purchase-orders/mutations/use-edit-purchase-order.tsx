
import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { PurchaseOrderEditForm } from "@/components/purchases/edit/PurchaseOrderEditForm";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export function useEditPurchaseOrder() {
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const queryClient = useQueryClient();
  
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
  
  const handleCloseDialog = useCallback(() => {
    console.log("Closing edit dialog - setting isDialogOpen to false");
    setIsDialogOpen(false);
    
    // Force a refresh of the purchase orders list to reflect any changes
    queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
  }, [queryClient]);
  
  // Effect to clear order ID after dialog is closed
  useEffect(() => {
    if (!isDialogOpen && selectedOrderId) {
      // Add a slight delay to prevent any potential race conditions with React's state updates
      const timer = setTimeout(() => {
        console.log("Dialog is closed, clearing selectedOrderId");
        setSelectedOrderId(null);
        
        // Force refresh of purchase orders list
        queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      }, 200);
      
      return () => clearTimeout(timer);
    }
  }, [isDialogOpen, selectedOrderId, queryClient]);
  
  const EditDialog = () => {
    if (!selectedOrderId) return null;
    
    console.log("Rendering EditDialog with orderId:", selectedOrderId, "isDialogOpen:", isDialogOpen);
    
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
