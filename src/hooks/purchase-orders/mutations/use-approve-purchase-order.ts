
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { syncApprovedPurchaseOrders } from "@/hooks/delivery-notes/sync/sync-approved-purchase-orders";

export function useApprovePurchaseOrder() {
  const mutation = useMutation({
    mutationFn: async (id: string) => {
      try {
        console.log("Starting approval process for order:", id);
        
        // 1. Vérifier que le bon de commande existe
        const { data: orders, error: checkError } = await supabase
          .from('purchase_orders')
          .select('id, status')
          .eq('id', id)
          .single();
          
        if (checkError) {
          console.error("Error checking purchase order:", checkError);
          throw new Error(`Erreur lors de la vérification: ${checkError.message}`);
        }
        
        if (!orders) {
          console.error("Purchase order not found:", id);
          throw new Error("Bon de commande introuvable");
        }
        
        console.log("Found purchase order:", orders);
        
        if (orders.status === 'approved') {
          console.log("Order already approved:", id);
          toast.info("Ce bon de commande est déjà approuvé");
          return { id, alreadyApproved: true };
        }
        
        // 2. Mettre à jour le statut du bon de commande
        const { data: updatedData, error: updateError } = await supabase
          .from('purchase_orders')
          .update({ status: 'approved' })
          .eq('id', id)
          .select('id, status');

        if (updateError) {
          console.error("Error updating purchase order status:", updateError);
          throw new Error(`Erreur lors de la mise à jour: ${updateError.message}`);
        }
        
        if (!updatedData || updatedData.length === 0) {
          throw new Error("La mise à jour a échoué, aucune donnée retournée");
        }

        console.log("Purchase order approved successfully:", updatedData);
        
        // 3. Synchroniser avec les bons de livraison
        try {
          const syncResult = await syncApprovedPurchaseOrders();
          console.log("Sync result after approval:", syncResult);
        } catch (syncError) {
          console.error("Error in sync after approval:", syncError);
          // Ne pas échouer ici, nous voulons toujours considérer l'approbation comme réussie
        }
        
        toast.success("Commande approuvée avec succès");
        return { id, success: true };
      } catch (error: any) {
        console.error("Error in useApprovePurchaseOrder:", error);
        toast.error(`Erreur lors de l'approbation: ${error.message || 'Erreur inconnue'}`);
        throw error;
      }
    },
  });

  // Retourner une fonction qui appelle directement mutateAsync pour garantir une gestion correcte des Promesses
  return async (id: string) => {
    console.log("useApprovePurchaseOrder called with id:", id);
    try {
      return await mutation.mutateAsync(id);
    } catch (error) {
      console.error("Mutation failed with error:", error);
      throw error; // Répropager l'erreur pour permettre sa gestion au niveau supérieur
    }
  };
}
