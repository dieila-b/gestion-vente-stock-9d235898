
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { syncApprovedPurchaseOrders } from "@/hooks/delivery-notes/sync/sync-approved-purchase-orders";
import { db } from "@/utils/db-core";

export function useApprovePurchaseOrder() {
  const queryClient = useQueryClient();
  
  const mutation = useMutation({
    mutationFn: async (id: string) => {
      try {
        console.log("[useApprovePurchaseOrder] Starting approval process for order:", id);
        
        // 1. Vérifier que le bon de commande existe avec une méthode plus fiable
        const orderData = await db.query(
          'purchase_orders',
          q => q.select('id, status, warehouse_id')
            .eq('id', id)
            .single(),
          []
        );
          
        if (!orderData || orderData.length === 0) {
          console.error("[useApprovePurchaseOrder] Purchase order not found:", id);
          throw new Error("Bon de commande introuvable");
        }
        
        const order = orderData[0];
        console.log("[useApprovePurchaseOrder] Found purchase order:", order);
        
        if (order.status === 'approved') {
          console.log("[useApprovePurchaseOrder] Order already approved:", id);
          toast.info("Ce bon de commande est déjà approuvé");
          return { id, alreadyApproved: true };
        }
        
        if (!order.warehouse_id) {
          console.error("[useApprovePurchaseOrder] Order has no warehouse_id:", id);
          throw new Error("Entrepôt non spécifié pour cette commande");
        }
        
        // 2. Mettre à jour le statut du bon de commande avec un timestamp précis
        const now = new Date().toISOString();
        const { data: updatedData, error: updateError } = await supabase
          .from('purchase_orders')
          .update({ 
            status: 'approved',
            updated_at: now
          })
          .eq('id', id)
          .select('id, status, warehouse_id');

        if (updateError) {
          console.error("[useApprovePurchaseOrder] Error updating purchase order status:", updateError);
          throw new Error(`Erreur lors de la mise à jour: ${updateError.message}`);
        }
        
        if (!updatedData || updatedData.length === 0) {
          console.error("[useApprovePurchaseOrder] Update returned no data");
          throw new Error("La mise à jour a échoué, aucune donnée retournée");
        }

        console.log("[useApprovePurchaseOrder] Purchase order approved successfully:", updatedData);
        
        // 3. Forcer l'invalidation des requêtes pour assurer un rafraichissement immédiat
        await queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
        
        // 4. Synchroniser avec les bons de livraison de manière forcée
        try {
          console.log("[useApprovePurchaseOrder] Starting sync after approval");
          const syncResult = await syncApprovedPurchaseOrders(id);
          console.log("[useApprovePurchaseOrder] Sync result after approval:", syncResult);
          
          // Invalider à nouveau pour prendre en compte les changements
          await queryClient.invalidateQueries({ queryKey: ['delivery-notes'] });
          
          if (syncResult) {
            toast.success("Bon de livraison créé avec succès");
          }
        } catch (syncError: any) {
          console.error("[useApprovePurchaseOrder] Error in sync after approval:", syncError);
          toast.error(`Erreur pendant la synchronisation: ${syncError.message || 'Erreur inconnue'}`);
          // On continue car l'approbation elle-même a réussi
        }
        
        toast.success("Commande approuvée avec succès");
        return { id, success: true };
      } catch (error: any) {
        console.error("[useApprovePurchaseOrder] Error in approval process:", error);
        toast.error(`Erreur lors de l'approbation: ${error.message || 'Erreur inconnue'}`);
        throw error;
      }
    },
  });

  // Retourner une fonction qui appelle directement mutateAsync
  return async (id: string) => {
    console.log("[useApprovePurchaseOrder] Called with id:", id);
    try {
      return await mutation.mutateAsync(id);
    } catch (error) {
      console.error("[useApprovePurchaseOrder] Error in wrapper:", error);
      throw error;
    }
  };
}
