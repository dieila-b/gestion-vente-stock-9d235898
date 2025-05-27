
import { usePurchaseOrdersQuery } from "./purchase-orders/queries/use-purchase-orders-query";
import { usePurchaseOrderMutations } from "./purchase-orders/use-purchase-order-mutations";
import { useEditPurchaseOrder } from "./purchase-orders/mutations/use-edit-purchase-order";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useState } from "react";

export function usePurchaseOrders() {
  const [processingOrderId, setProcessingOrderId] = useState<string | null>(null);
  const { data: orders = [], isLoading, error, refetch } = usePurchaseOrdersQuery();
  const { handleDelete, handleCreate, refreshPurchaseOrders } = usePurchaseOrderMutations();
  const { handleEdit, EditDialog, isDialogOpen } = useEditPurchaseOrder();
  const approveOrderMutation = usePurchaseOrderMutations().handleApprove;
  const queryClient = useQueryClient();

  // Log if errors occur
  if (error) {
    console.error("[usePurchaseOrders] Error:", error);
  }

  // Force refresh the data
  const refreshOrders = async () => {
    console.log("[usePurchaseOrders] Refreshing purchase orders...");
    
    try {
      // Force a refetch with our specialized function
      const result = await refreshPurchaseOrders();
      console.log("[usePurchaseOrders] Refresh result:", result);
      
      // Also refresh delivery notes
      await queryClient.invalidateQueries({ queryKey: ['delivery-notes'] });
      await queryClient.refetchQueries({ queryKey: ['delivery-notes'] });
      
      return result;
    } catch (refreshError: any) {
      console.error("[usePurchaseOrders] Exception during refresh:", refreshError);
      toast.error(`Erreur pendant le rafraîchissement: ${refreshError.message || "Erreur inconnue"}`);
      return { isSuccess: false, isError: true, error: refreshError };
    }
  };

  // Handle the approve function with better error handling
  const handleApprove = async (id: string): Promise<void> => {
    if (!id) {
      console.error("[usePurchaseOrders] No order ID provided");
      toast.error("ID du bon de commande manquant");
      return;
    }

    try {
      console.log("[usePurchaseOrders] Starting approval for order:", id);
      setProcessingOrderId(id);
      
      // Check if order exists in current list
      const orderToApprove = orders.find(order => order.id === id);
      if (!orderToApprove) {
        console.error("[usePurchaseOrders] Order not found in current list:", id);
        toast.error("Bon de commande introuvable");
        return;
      }

      console.log("[usePurchaseOrders] Order found, proceeding with approval:", orderToApprove.order_number);
      
      // Use the mutation directly
      const result = await approveOrderMutation.mutateAsync(id);
      console.log("[usePurchaseOrders] Approval completed:", result);
      
      // Force refresh the data after successful approval
      await refreshOrders();
        
    } catch (error: any) {
      console.error("[usePurchaseOrders] Error in handleApprove:", error);
      
      // Don't show toast here as the mutation already handles it
      // Just log the error for debugging
    } finally {
      setProcessingOrderId(null);
    }
  };

  // Create wrapper functions
  const handleEditWrapper = async (id: string): Promise<void> => {
    try {
      setProcessingOrderId(id);
      console.log("[usePurchaseOrders] Opening edit for order ID:", id);
      await handleEdit(id);
    } catch (error: any) {
      console.error("[usePurchaseOrders] Error in handleEditWrapper:", error);
      toast.error(`Erreur lors de l'ouverture du formulaire d'édition: ${error.message || 'Erreur inconnue'}`);
    } finally {
      setProcessingOrderId(null);
    }
  };

  const handleDeleteWrapper = async (id: string): Promise<void> => {
    try {
      setProcessingOrderId(id);
      await handleDelete(id);
      await refreshOrders();
    } catch (error: any) {
      console.error("[usePurchaseOrders] Error in handleDeleteWrapper:", error);
      toast.error(`Erreur lors de la suppression: ${error.message || 'Erreur inconnue'}`);
    } finally {
      setProcessingOrderId(null);
    }
  };

  return {
    orders,
    isLoading,
    error,
    processingOrderId,
    handleApprove,
    handleDelete: handleDeleteWrapper,
    handleEdit: handleEditWrapper,
    EditDialog,
    isDialogOpen,
    handleCreate,
    refreshOrders,
    refetch
  };
}
