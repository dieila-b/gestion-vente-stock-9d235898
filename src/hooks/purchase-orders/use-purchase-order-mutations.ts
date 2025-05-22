
import { useDeletePurchaseOrder } from "./mutations/use-delete-purchase-order";
import { useEditPurchaseOrder } from "./mutations/use-edit-purchase-order";
import { useUpdatePurchaseOrder } from "./mutations/use-update-purchase-order";
import { useApprovePurchaseOrder } from "./mutations/use-approve-purchase-order";
import { useCreatePurchaseOrder } from "./mutations/use-create-purchase-order";
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
    console.log("[usePurchaseOrderMutations] Forcing refresh of purchase orders data");
    await queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
    const result = await queryClient.refetchQueries({ queryKey: ['purchase-orders'] });
    console.log("[usePurchaseOrderMutations] Refresh result:", result);
    return result;
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
