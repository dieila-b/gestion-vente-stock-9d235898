
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { syncApprovedPurchaseOrders } from "@/hooks/delivery-notes/sync/sync-approved-purchase-orders";

export function useApprovePurchaseOrder() {
  const queryClient = useQueryClient();
  
  const mutation = useMutation({
    mutationFn: async (id: string) => {
      try {
        console.log("Starting approval process for order:", id);
        
        // 1. Vérifier que le bon de commande existe
        const { data: orderData, error: checkError } = await supabase
          .from('purchase_orders')
          .select('id, status, warehouse_id')
          .eq('id', id)
          .maybeSingle();
          
        if (checkError) {
          console.error("Error checking purchase order:", checkError);
          throw new Error(`Erreur lors de la vérification: ${checkError.message}`);
        }
        
        if (!orderData) {
          console.error("Purchase order not found:", id);
          throw new Error("Bon de commande introuvable");
        }
        
        console.log("Found purchase order:", orderData);
        
        if (orderData.status === 'approved') {
          console.log("Order already approved:", id);
          toast.info("Ce bon de commande est déjà approuvé");
          return { id, alreadyApproved: true };
        }
        
        // 2. Mettre à jour le statut du bon de commande
        const { data: updatedData, error: updateError } = await supabase
          .from('purchase_orders')
          .update({ 
            status: 'approved',
            updated_at: new Date().toISOString()
          })
          .eq('id', id)
          .select('id, status, warehouse_id');

        if (updateError) {
          console.error("Error updating purchase order status:", updateError);
          throw new Error(`Erreur lors de la mise à jour: ${updateError.message}`);
        }
        
        if (!updatedData || updatedData.length === 0) {
          throw new Error("La mise à jour a échoué, aucune donnée retournée");
        }

        console.log("Purchase order approved successfully:", updatedData);
        toast.success("Commande approuvée avec succès");
        
        // 3. Synchroniser avec les bons de livraison
        try {
          console.log("Starting sync after approval");
          const syncResult = await syncApprovedPurchaseOrders();
          console.log("Sync result after approval:", syncResult);
          
          if (syncResult) {
            toast.success("Bon de livraison créé avec succès");
          }
        } catch (syncError: any) {
          console.error("Error in sync after approval:", syncError);
          toast.error(`Erreur pendant la synchronisation: ${syncError.message || 'Erreur inconnue'}`);
          // On continue car l'approbation elle-même a réussi
        }
        
        // Invalider le cache des requêtes pour forcer un rafraîchissement
        queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
        queryClient.invalidateQueries({ queryKey: ['delivery-notes'] });
        
        return { id, success: true };
      } catch (error: any) {
        console.error("Error in useApprovePurchaseOrder:", error);
        toast.error(`Erreur lors de l'approbation: ${error.message || 'Erreur inconnue'}`);
        throw error;
      }
    },
  });

  // Retourner une fonction qui appelle directement mutateAsync
  return async (id: string) => {
    console.log("useApprovePurchaseOrder called with id:", id);
    try {
      return await mutation.mutateAsync(id);
    } catch (error) {
      console.error("Error in useApprovePurchaseOrder wrapper:", error);
      throw error;
    }
  };
}
