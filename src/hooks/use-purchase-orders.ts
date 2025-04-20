
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

  // Function to force refresh the data
  const refreshOrders = async () => {
    console.log("Refreshing purchase orders...");
    await queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
    const result = await refetch();
    if (result.isSuccess) {
      toast.success("Liste des bons de commande rafraîchie");
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
