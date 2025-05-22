
import { usePurchaseOrdersQuery } from "./purchase-orders/queries/use-purchase-orders-query";
import { usePurchaseOrderMutations } from "./purchase-orders/use-purchase-order-mutations";
import { useEditPurchaseOrder } from "./purchase-orders/mutations/use-edit-purchase-order";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useState } from "react";

export function usePurchaseOrders() {
  const [processingOrderId, setProcessingOrderId] = useState<string | null>(null);
  const { data: orders = [], isLoading, error, refetch } = usePurchaseOrdersQuery();
  const { handleDelete, handleCreate, handleApprove: approveOrderFn } = usePurchaseOrderMutations();
  const { handleEdit, EditDialog, isDialogOpen } = useEditPurchaseOrder();
  const queryClient = useQueryClient();

  // Log if errors occur
  if (error) {
    console.error("[usePurchaseOrders] Error:", error);
  }

  // Force refresh the data with minimal stale time
  const refreshOrders = async () => {
    console.log("[usePurchaseOrders] Refreshing purchase orders...");
    
    try {
      // First invalidate the query
      await queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      
      // Then trigger a refetch
      const result = await refetch();
      
      console.log("[usePurchaseOrders] Refresh result:", result);
      
      if (result.isSuccess) {
        toast.success("Liste des bons de commande rafraîchie");
      } else if (result.isError) {
        console.error("[usePurchaseOrders] Error refreshing orders:", result.error);
        toast.error("Erreur lors du rafraîchissement");
      }
      
      return result;
    } catch (refreshError) {
      console.error("[usePurchaseOrders] Exception during refresh:", refreshError);
      toast.error("Erreur pendant le rafraîchissement des données");
      return { isSuccess: false, isError: true, error: refreshError };
    }
  };

  // Handle the approve function with improved error handling
  const handleApprove = async (id: string): Promise<void> => {
    try {
      console.log("[usePurchaseOrders] Starting approval process for:", id);
      setProcessingOrderId(id);
      
      // Vérifier que l'order existe bien avant de tenter l'approbation
      const orderToApprove = orders.find(order => order.id === id);
      if (!orderToApprove) {
        console.error("[usePurchaseOrders] Order not found in current list:", id);
        toast.error("Bon de commande introuvable");
        setProcessingOrderId(null);
        return;
      }

      // Vérifier que l'entrepôt est spécifié
      if (!orderToApprove.warehouse_id) {
        console.error("[usePurchaseOrders] Order has no warehouse_id:", id);
        toast.error("Impossible d'approuver: l'entrepôt n'est pas spécifié pour cette commande");
        setProcessingOrderId(null);
        return;
      }
      
      console.log("[usePurchaseOrders] Order validation passed, proceeding with approval");
      const result = await approveOrderFn(id);
      
      console.log("[usePurchaseOrders] Approval completed:", result);
      
      // Rafraîchir systématiquement les données après approbation
      await refreshOrders();
      
      // Aussi rafraîchir les bons de livraison pour afficher ceux nouvellement créés
      await queryClient.invalidateQueries({ queryKey: ['delivery-notes'] });
      await queryClient.refetchQueries({ queryKey: ['delivery-notes'] });
        
    } catch (error: any) {
      console.error("[usePurchaseOrders] Error in handleApprove:", error);
      toast.error(`Erreur lors de l'approbation: ${error.message || 'Erreur inconnue'}`);
    } finally {
      setProcessingOrderId(null);
    }
  };

  // Create wrapper functions with correct signature for Promise<void>
  const handleEditWrapper = async (id: string): Promise<void> => {
    try {
      setProcessingOrderId(id);
      console.log("[usePurchaseOrders] Wrapping edit for order ID:", id);
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
