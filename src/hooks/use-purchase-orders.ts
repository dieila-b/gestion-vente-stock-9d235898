
import { usePurchaseOrdersQuery } from "./purchase-orders/queries/use-purchase-orders-query";
import { usePurchaseOrderMutations } from "./purchase-orders/mutations/use-purchase-order-mutations";
import { useEditPurchaseOrder } from "./purchase-orders/mutations/use-edit-purchase-order";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function usePurchaseOrders() {
  const { data: orders = [], isLoading, error, refetch } = usePurchaseOrdersQuery();
  const { handleApprove, handleDelete, handleCreate } = usePurchaseOrderMutations();
  const { handleEdit, EditDialog, isDialogOpen } = useEditPurchaseOrder();
  const queryClient = useQueryClient();

  // Log si des erreurs surviennent
  if (error) {
    console.error("Erreur dans usePurchaseOrders:", error);
  }

  // Log des données pour déboguer
  console.log("Use Purchase Orders - Nombre de commandes:", orders?.length || 0);
  if (orders?.length > 0) {
    console.log("Articles du premier bon de commande:", orders[0]?.items?.length || 0);
  }

  // Forcer le rafraîchissement des données avec un temps de mise en cache minimal
  const refreshOrders = async () => {
    console.log("Rafraîchissement des bons de commande...");
    
    // D'abord invalider la requête
    await queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
    
    // Puis déclencher une nouvelle récupération
    const result = await refetch();
    
    console.log("Résultat du rafraîchissement:", result);
    
    if (result.isSuccess) {
      toast.success("Liste des bons de commande rafraîchie");
    } else if (result.isError) {
      console.error("Erreur lors du rafraîchissement des commandes:", result.error);
      toast.error("Erreur lors du rafraîchissement");
    }
    
    return result;
  };

  return {
    orders,
    isLoading,
    error,
    handleApprove,
    handleDelete,
    handleEdit,
    EditDialog,
    isDialogOpen,
    handleCreate,
    refreshOrders,
    refetch
  };
}
