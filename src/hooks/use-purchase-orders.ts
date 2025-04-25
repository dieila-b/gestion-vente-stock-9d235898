
import { usePurchaseOrdersQuery } from "./purchase-orders/queries/use-purchase-orders-query";
import { usePurchaseOrderMutations } from "./purchase-orders/mutations/use-purchase-order-mutations";
import { useEditPurchaseOrder } from "./purchase-orders/mutations/use-edit-purchase-order";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useApprovePurchaseOrder } from "./purchase-orders/mutations/use-approve-purchase-order";
import { useState } from "react";

export function usePurchaseOrders() {
  const [processingOrderId, setProcessingOrderId] = useState<string | null>(null);
  const { data: orders = [], isLoading, error, refetch } = usePurchaseOrdersQuery();
  const { handleDelete, handleCreate, refreshPurchaseOrders } = usePurchaseOrderMutations();
  const approveOrderFn = useApprovePurchaseOrder();
  const { handleEdit, EditDialog, isDialogOpen } = useEditPurchaseOrder();
  const queryClient = useQueryClient();

  if (error) {
    console.error("Error in usePurchaseOrders:", error);
  }

  const refreshOrders = async () => {
    console.log("Refreshing purchase orders...");
    
    try {
      await queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      
      const result = await refetch();
      
      console.log("Refresh result:", result);
      
      if (result.isSuccess) {
        toast.success("Liste des bons de commande rafraîchie");
      } else if (result.isError) {
        console.error("Error refreshing orders:", result.error);
        toast.error("Erreur lors du rafraîchissement");
      }
      
      return result;
    } catch (refreshError) {
      console.error("Exception during refresh:", refreshError);
      toast.error("Erreur pendant le rafraîchissement des données");
      return { isSuccess: false, isError: true, error: refreshError };
    }
  };

  const handleApprove = async (id: string): Promise<void> => {
    if (!id) {
      console.error("Invalid order ID received for approval");
      toast.error("ID du bon de commande invalide");
      return;
    }
    
    try {
      console.log("Starting approval process for:", id);
      setProcessingOrderId(id);
      
      await approveOrderFn(id);
      
      console.log("Approval completed successfully for:", id);
      await refreshOrders();
      await queryClient.invalidateQueries({ queryKey: ['delivery-notes'] });
    } catch (error: any) {
      console.error("Error in handleApprove:", error);
      toast.error(`Erreur lors de l'approbation: ${error?.message || "Erreur inconnue"}`);
      throw error; // Rethrow to be handled by the component
    } finally {
      setProcessingOrderId(null);
    }
  };

  const handleEditWrapper = async (id: string): Promise<void> => {
    try {
      setProcessingOrderId(id);
      await handleEdit(id);
    } catch (error) {
      console.error("Error in handleEditWrapper:", error);
      toast.error("Erreur lors de l'ouverture du formulaire d'édition");
      throw error; // Rethrow to be handled by the component
    } finally {
      setProcessingOrderId(null);
    }
  };

  const handleDeleteWrapper = async (id: string): Promise<void> => {
    if (!id) {
      toast.error("ID du bon de commande invalide");
      return;
    }
    
    try {
      console.log("Starting delete process for order:", id);
      setProcessingOrderId(id);
      
      await handleDelete(id);
      console.log("Delete completed successfully for:", id);
      
      // Refresh the order list after successful deletion
      await refreshOrders();
      
    } catch (error: any) {
      console.error("Error in handleDeleteWrapper:", error);
      toast.error(`Erreur lors de la suppression: ${error?.message || "Erreur inconnue"}`);
      throw error; // Rethrow to be handled by the component
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
