
import { useDeletePurchaseOrder } from "./use-delete-purchase-order";
import { useEditPurchaseOrder } from "./use-edit-purchase-order";
import { useUpdatePurchaseOrder } from "./use-update-purchase-order";
import { useApprovePurchaseOrder } from "./use-approve-purchase-order";
import { useCreatePurchaseOrder } from "./use-create-purchase-order";
import { useQueryClient } from "@tanstack/react-query";

export const usePurchaseOrderMutations = () => {
  const queryClient = useQueryClient();
  const handleDelete = useDeletePurchaseOrder();
  const handleEdit = useEditPurchaseOrder();
  const handleUpdate = useUpdatePurchaseOrder();
  const handleApprove = useApprovePurchaseOrder();
  const handleCreate = useCreatePurchaseOrder();
  
  // Function to force refresh purchase orders data
  const refreshPurchaseOrders = async () => {
    await queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
    return queryClient.refetchQueries({ queryKey: ['purchase-orders'] });
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
