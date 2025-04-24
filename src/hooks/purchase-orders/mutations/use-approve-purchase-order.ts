
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { syncApprovedPurchaseOrders } from "@/hooks/delivery-notes/sync/sync-approved-purchase-orders";
import { PurchaseOrder } from "@/types/purchase-order";

export function useApprovePurchaseOrder() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (id: string) => {
      try {
        console.log("Starting approval process for order:", id);
        
        // 1. Vérifier que le bon de commande existe
        const { data: orderData, error: checkError } = await supabase
          .from('purchase_orders')
          .select('id, status')
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
          .update({ status: 'approved', updated_at: new Date().toISOString() })
          .eq('id', id)
          .select()
          .single();

        if (updateError) {
          console.error("Error updating purchase order status:", updateError);
          throw new Error(`Erreur lors de la mise à jour: ${updateError.message}`);
        }
        
        console.log("Purchase order approved successfully:", updatedData);
        
        // 3. Synchroniser avec les bons de livraison
        try {
          console.log("Starting sync after approval");
          const syncResult = await syncApprovedPurchaseOrders();
          console.log("Sync result after approval:", syncResult);
        } catch (syncError: any) {
          console.error("Error in sync after approval:", syncError);
          toast.error(`Erreur pendant la synchronisation: ${syncError.message || 'Erreur inconnue'}`);
          // On continue car l'approbation elle-même a réussi
        }
        
        // 4. Rafraîchir les données
        await queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
        await queryClient.invalidateQueries({ queryKey: ['delivery-notes'] });
        
        toast.success("Commande approuvée avec succès");
        return updatedData as PurchaseOrder;
      } catch (error: any) {
        console.error("Error in useApprovePurchaseOrder:", error);
        throw error;
      }
    }
  });

  return mutation.mutateAsync;
}
