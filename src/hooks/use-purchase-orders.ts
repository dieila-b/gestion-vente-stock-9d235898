
import { usePurchaseOrdersQuery } from "./purchase-orders/queries/use-purchase-orders-query";
import { usePurchaseOrderMutations } from "./purchase-orders/mutations/use-purchase-order-mutations";
import { useEditPurchaseOrder } from "./purchase-orders/mutations/use-edit-purchase-order";

export function usePurchaseOrders() {
  const { data: orders = [], isLoading } = usePurchaseOrdersQuery();
  const { handleApprove, handleDelete, handleCreate } = usePurchaseOrderMutations();
  const handleEdit = useEditPurchaseOrder();

  return {
    orders,
    isLoading,
    handleApprove,
    handleDelete,
    handleEdit,
    handleCreate
  };
}
