
import { usePurchaseOrdersQuery } from "./purchase-orders/queries/use-purchase-orders-query";
import { usePurchaseOrderMutations } from "./purchase-orders/mutations/use-purchase-order-mutations";
import { useEditPurchaseOrder } from "./purchase-orders/mutations/use-edit-purchase-order";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useApprovePurchaseOrder } from "./purchase-orders/mutations/use-approve-purchase-order";

export function usePurchaseOrders() {
  const { data: orders = [], isLoading, error, refetch } = usePurchaseOrdersQuery();
  const { handleDelete, handleCreate } = usePurchaseOrderMutations();
  const approveOrderFn = useApprovePurchaseOrder();
  const { handleEdit, EditDialog, isDialogOpen } = useEditPurchaseOrder();
  const queryClient = useQueryClient();

  // Log if errors occur
  if (error) {
    console.error("Error in usePurchaseOrders:", error);
  }

  // Force refresh the data with minimal stale time
  const refreshOrders = async () => {
    console.log("Refreshing purchase orders...");
    
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
  };

  // Handle the approve function properly with improved error handling
  const handleApprove = async (id: string) => {
    try {
      console.log("Starting approval process for:", id);
      
      // Call the approve function from the hook and await it properly
      await approveOrderFn(id);
      
      console.log("Approval completed for:", id);
      
      // Refresh the orders list
      await refreshOrders();
      
      // Also refresh delivery notes to show newly created ones
      await queryClient.invalidateQueries({ queryKey: ['delivery-notes'] });
      
      return true;
    } catch (error) {
      console.error("Error in handleApprove:", error);
      toast.error("Erreur lors de l'approbation de la commande");
      return false;
    }
  };

  // Create wrapper functions with correct signature for Promise<void>
  const handleEditWrapper = async (id: string): Promise<void> => {
    try {
      console.log("Wrapping edit for order ID:", id);
      await handleEdit(id);
    } catch (error) {
      console.error("Error in handleEditWrapper:", error);
      toast.error("Erreur lors de l'ouverture du formulaire d'édition");
    }
  };

  const handleDeleteWrapper = async (id: string): Promise<void> => {
    try {
      await handleDelete(id);
      await refreshOrders();
    } catch (error) {
      console.error("Error in handleDeleteWrapper:", error);
      toast.error("Erreur lors de la suppression");
    }
  };

  return {
    orders,
    isLoading,
    error,
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
