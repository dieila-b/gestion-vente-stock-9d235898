
import { usePurchaseOrderQueries } from "./purchase-orders/use-purchase-order-queries";
import { usePurchaseOrderMutations } from "./purchase-orders/use-purchase-order-mutations";
import { useApprovePurchaseOrder } from "./purchase-orders/mutations/use-approve-purchase-order";
import { useCreatePurchaseOrder } from "./purchase-orders/mutations/use-create-purchase-order";
import { useUpdatePurchaseOrder } from "./purchase-orders/mutations/use-update-purchase-order";
import { useDeletePurchaseOrder } from "./purchase-orders/mutations/use-delete-purchase-order";
import { useEditPurchaseOrder } from "./purchase-orders/mutations/use-edit-purchase-order";

export function usePurchaseOrders() {
  // Get all queries
  const { 
    purchaseOrders, 
    isLoading, 
    fetchPurchaseOrder,
    getStatusCounts,
    error
  } = usePurchaseOrderQueries();
  
  // Get all mutations as direct hooks
  const approvePurchaseOrderMutation = useApprovePurchaseOrder();
  const handleCreate = useCreatePurchaseOrder();
  const handleUpdate = useUpdatePurchaseOrder();
  const handleDelete = useDeletePurchaseOrder();
  const handleEdit = useEditPurchaseOrder();
  
  // Handle approve with the mutation function
  const handleApprove = (id: string) => {
    approvePurchaseOrderMutation.mutate(id);
  };

  return {
    orders: purchaseOrders,
    isLoading,
    currentOrder: null, // This is now handled via fetchPurchaseOrder
    isLoadingOrder: false,
    handleCreate,
    handleUpdate,
    handleApprove,
    handleDelete,
    handleEdit,
    approvePurchaseOrderMutation,
    fetchPurchaseOrder,
    getStatusCounts,
    error
  };
}
