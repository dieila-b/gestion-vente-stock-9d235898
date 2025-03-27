
import { useDeletePurchaseOrder } from "./mutations/use-delete-purchase-order";
import { useEditPurchaseOrder } from "./mutations/use-edit-purchase-order";
import { useUpdatePurchaseOrder } from "./mutations/use-update-purchase-order";
import { useApprovePurchaseOrder } from "./mutations/use-approve-purchase-order";
import { useCreatePurchaseOrder } from "./mutations/use-create-purchase-order";

export const usePurchaseOrderMutations = () => {
  const handleDelete = useDeletePurchaseOrder();
  const handleEdit = useEditPurchaseOrder();
  const handleUpdate = useUpdatePurchaseOrder();
  const handleApprove = useApprovePurchaseOrder();
  const handleCreate = useCreatePurchaseOrder();

  return {
    handleApprove,
    handleDelete,
    handleEdit,
    handleUpdate,
    handleCreate
  };
};
