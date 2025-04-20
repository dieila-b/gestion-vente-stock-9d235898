
import { usePurchaseOrdersQuery } from "./purchase-orders/queries/use-purchase-orders-query";
import { usePurchaseOrderMutations } from "./purchase-orders/mutations/use-purchase-order-mutations";
import { useEditPurchaseOrder } from "./purchase-orders/mutations/use-edit-purchase-order";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function usePurchaseOrders() {
  const { data: orders = [], isLoading, error, refetch } = usePurchaseOrdersQuery();
  const { handleApprove, handleDelete, handleCreate } = usePurchaseOrderMutations();
  const handleEdit = useEditPurchaseOrder();
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
    const result = await refetch({ stale: true });
    
    console.log("Refresh result:", result);
    
    if (result.isSuccess) {
      toast.success("Liste des bons de commande rafraîchie");
    } else if (result.isError) {
      console.error("Error refreshing orders:", result.error);
      toast.error("Erreur lors du rafraîchissement");
    }
    
    return result;
  };

  return {
    orders,
    isLoading,
    error,
    handleApprove,
    handleDelete,
    handleEdit,
    handleCreate,
    refreshOrders,
    refetch
  };
}
