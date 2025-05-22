
import { usePurchaseOrdersQuery } from "./purchase-orders/queries/use-purchase-orders-query";
import { usePurchaseOrderMutations } from "./purchase-orders/mutations/use-purchase-order-mutations";
import { useEditPurchaseOrder } from "./purchase-orders/mutations/use-edit-purchase-order";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useState } from "react";

export function usePurchaseOrders() {
  const [processingOrderId, setProcessingOrderId] = useState<string | null>(null);
  const { data: orders = [], isLoading, error, refetch } = usePurchaseOrdersQuery();
  const { handleDelete, handleCreate, handleApprove: approveOrderFn } = usePurchaseOrderMutations();
  const { handleEdit, EditDialog, isDialogOpen } = useEditPurchaseOrder();
  const queryClient = useQueryClient();

  // Log if errors occur
  if (error) {
    console.error("Error in usePurchaseOrders:", error);
  }

  // Force refresh the data with minimal stale time
  const refreshOrders = async () => {
    console.log("Refreshing purchase orders...");
    
    try {
      // First invalidate the query
      await queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      
      // Then trigger a refetch
      const result = await refetch();
      
      console.log("Refresh result:", result);
      
      if (result.isSuccess) {
        toast.success("Liste des bons de commande rafraîchie");
      } else if (result.isError) {
        console.error("Error refreshing orders:", result.error);
        toast.error("Erreur lors du rafraîchissement");
      }
      
      return result;
    } catch (refreshError) {
      console.error("Exception during refresh:", refreshError);
      toast.error("Erreur pendant le rafraîchissement des données");
      return { isSuccess: false, isError: true, error: refreshError };
    }
  };

  // Handle the approve function with improved error handling
  const handleApprove = async (id: string): Promise<void> => {
    try {
      console.log("Starting approval process for:", id);
      setProcessingOrderId(id);
      
      const result = await approveOrderFn(id);
      
      console.log("Approval completed for:", id, "Result:", result);
      
      if (result && result.success) {
        // Refresh the orders list
        await refreshOrders();
        
        // Also refresh delivery notes to show newly created ones
        await queryClient.invalidateQueries({ queryKey: ['delivery-notes'] });
      }
    } catch (error) {
      console.error("Error in handleApprove:", error);
      toast.error("Erreur lors de l'approbation de la commande");
    } finally {
      setProcessingOrderId(null);
    }
  };

  // Create wrapper functions with correct signature for Promise<void>
  const handleEditWrapper = async (id: string): Promise<void> => {
    try {
      setProcessingOrderId(id);
      console.log("Wrapping edit for order ID:", id);
      await handleEdit(id);
    } catch (error) {
      console.error("Error in handleEditWrapper:", error);
      toast.error("Erreur lors de l'ouverture du formulaire d'édition");
    } finally {
      setProcessingOrderId(null);
    }
  };

  const handleDeleteWrapper = async (id: string): Promise<void> => {
    try {
      setProcessingOrderId(id);
      await handleDelete(id);
      await refreshOrders();
    } catch (error) {
      console.error("Error in handleDeleteWrapper:", error);
      toast.error("Erreur lors de la suppression");
    } finally {
      setProcessingOrderId(null);
    }
  };

  return {
    orders,
    isLoading,
    error,
    processingOrderId,
    handleApprove,
    handleDelete: handleDeleteWrapper,
    handleEdit: handleEditWrapper,
    EditDialog,
    isDialogOpen,
    handleCreate,
    refreshOrders,
    refetch
  };
}
