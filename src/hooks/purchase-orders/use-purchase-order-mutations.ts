
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
    
    // Invalider d'abord toutes les requêtes associées aux bons de commande
    await queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
    
    // Invalider aussi les requêtes de bons de livraison qui peuvent avoir été créés
    await queryClient.invalidateQueries({ queryKey: ['delivery-notes'] });
    
    // Forcer un rafraîchissement complet
    const purchaseOrdersResult = await queryClient.refetchQueries({ 
      queryKey: ['purchase-orders'],
      exact: false
    });
    
    // Forcer aussi le rafraîchissement des bons de livraison
    const deliveryNotesResult = await queryClient.refetchQueries({
      queryKey: ['delivery-notes'],
      exact: false
    });
    
    console.log("[usePurchaseOrderMutations] Refresh results:", {
      purchaseOrders: purchaseOrdersResult,
      deliveryNotes: deliveryNotesResult
    });
    
    return purchaseOrdersResult;
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
