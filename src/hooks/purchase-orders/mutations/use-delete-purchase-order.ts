
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { db } from "@/utils/db-adapter";
import { toast } from "sonner";

// Function that performs the actual deletion
export async function deletePurchaseOrder(id: string): Promise<boolean> {
  console.log("[deletePurchaseOrder] Starting deletion for ID:", id);

  try {
    if (!id) {
      console.error("[deletePurchaseOrder] Invalid purchase order ID:", id);
      throw new Error("ID du bon de commande invalide");
    }

    // Check if the purchase order exists and is not approved
    const { data: order, error: orderError } = await db.table('purchase_orders')
      .select('status')
      .eq('id', id)
      .maybeSingle();
    
    if (orderError) {
      console.error("[deletePurchaseOrder] Error fetching purchase order:", orderError);
      throw new Error("Impossible de trouver le bon de commande");
    }

    if (!order) {
      console.error("[deletePurchaseOrder] Purchase order not found:", id);
      throw new Error("Bon de commande introuvable");
    }

    if (order.status === 'approved') {
      console.error("[deletePurchaseOrder] Cannot delete approved purchase order:", id);
      throw new Error("Impossible de supprimer un bon de commande approuvé");
    }

    // Delete associated items first
    console.log("[deletePurchaseOrder] Deleting purchase order items for order:", id);
    const { error: itemsError } = await db.table('purchase_order_items')
      .delete()
      .eq('purchase_order_id', id);
    
    if (itemsError) {
      console.error("[deletePurchaseOrder] Error deleting purchase order items:", itemsError);
      throw new Error("Échec de la suppression des articles de commande");
    }

    // Then delete the purchase order
    console.log("[deletePurchaseOrder] Deleting purchase order:", id);
    const { error: orderDeleteError } = await db.table('purchase_orders')
      .delete()
      .eq('id', id);
    
    if (orderDeleteError) {
      console.error("[deletePurchaseOrder] Error deleting purchase order:", orderDeleteError);
      throw new Error("Échec de la suppression du bon de commande");
    }
    
    console.log("[deletePurchaseOrder] Successfully deleted purchase order:", id);
    return true;
  } catch (error: any) {
    console.error("[deletePurchaseOrder] Error deleting purchase order:", error);
    throw error;
  }
}

// Hook that provides the mutation functionality
export function useDeletePurchaseOrder() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: deletePurchaseOrder,
    onSuccess: () => {
      console.log("[useDeletePurchaseOrder] Purchase order deletion successful, invalidating queries");
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      toast.success("Bon de commande supprimé avec succès");
    },
    onError: (error: any) => {
      console.error("[useDeletePurchaseOrder] Purchase order deletion error:", error);
      toast.error(`Erreur: ${error?.message || "Échec de la suppression"}`);
    }
  });

  return async (id: string): Promise<boolean> => {
    try {
      console.log(`[useDeletePurchaseOrder] Calling deletePurchaseOrder mutation for ID: ${id}`);
      await mutation.mutateAsync(id);
      return true;
    } catch (error) {
      console.error("[useDeletePurchaseOrder] Error in useDeletePurchaseOrder hook:", error);
      return false;
    }
  };
}
