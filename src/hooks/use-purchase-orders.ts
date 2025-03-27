
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
    orders, 
    isLoading, 
    currentOrder, 
    isLoadingOrder 
  } = usePurchaseOrderQueries();
  
  // Get all mutations as direct hooks
  const handleApprove = useApprovePurchaseOrder();
  const handleCreate = useCreatePurchaseOrder();
  const handleUpdate = useUpdatePurchaseOrder();
  const handleDelete = useDeletePurchaseOrder();
  const handleEdit = useEditPurchaseOrder();
  
  // Get the approve mutation directly for access to its state
  const approvePurchaseOrderMutation = useApprovePurchaseOrder();

  return {
    orders,
    isLoading,
    currentOrder,
    isLoadingOrder,
    handleCreate,
    handleUpdate,
    handleApprove,
    handleDelete,
    handleEdit,
    approvePurchaseOrderMutation
  };
}
