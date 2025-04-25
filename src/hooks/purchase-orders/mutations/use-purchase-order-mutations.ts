
import { useDeletePurchaseOrder } from "./use-delete-purchase-order";
import { useEditPurchaseOrder } from "./use-edit-purchase-order";
import { useUpdatePurchaseOrder } from "./use-update-purchase-order";
import { useApprovePurchaseOrder } from "./use-approve-purchase-order";
import { useCreatePurchaseOrder } from "./use-create-purchase-order";
import { useQueryClient } from "@tanstack/react-query";

export const usePurchaseOrderMutations = () => {
  const queryClient = useQueryClient();
  const deleteOrderFn = useDeletePurchaseOrder();
  const handleEdit = useEditPurchaseOrder();
  const handleUpdate = useUpdatePurchaseOrder();
  const handleApprove = useApprovePurchaseOrder();
  const handleCreate = useCreatePurchaseOrder();
  
  // Function to force refresh purchase orders data
  const refreshPurchaseOrders = async () => {
    await queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
    return queryClient.refetchQueries({ queryKey: ['purchase-orders'] });
  };

  // No need to wrap in another promise, just pass through
  const handleDelete = (id: string) => {
    console.log("Delegating delete to mutation for order:", id);
    return deleteOrderFn(id);
  };

  return {
    handleApprove,
    handleDelete,
    handleEdit,
    handleUpdate,
    handleCreate,
    refreshPurchaseOrders
  };
};
