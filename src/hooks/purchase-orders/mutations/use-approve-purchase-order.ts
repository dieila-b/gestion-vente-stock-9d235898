
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
        
        // 1. Vérifier d'abord l'existence du bon de commande - utilisons get() au lieu de maybeSingle()
        const { data: orders, error: checkError } = await supabase
          .from('purchase_orders')
          .select('id, status')
          .eq('id', id);
          
        if (checkError) {
          console.error("Error checking purchase order:", checkError);
          throw new Error(`Erreur lors de la vérification: ${checkError.message}`);
        }
        
        // Vérifier si nous avons récupéré des données
        if (!orders || orders.length === 0) {
          console.error("Purchase order not found:", id);
          throw new Error("Bon de commande introuvable");
        }
        
        const checkOrder = orders[0];
        
        console.log("Found purchase order:", checkOrder);
        
        if (checkOrder.status === 'approved') {
          console.log("Order already approved:", id);
          toast.info("Ce bon de commande est déjà approuvé");
          return { id, alreadyApproved: true };
        }
        
        // 2. Mettre à jour le statut du bon de commande
        const { data: updatedData, error } = await supabase
          .from('purchase_orders')
          .update({ status: 'approved' })
          .eq('id', id)
          .select();

        if (error) {
          console.error("Error updating purchase order status:", error);
          throw new Error(`Erreur lors de la mise à jour: ${error.message}`);
        }
        
        if (!updatedData || updatedData.length === 0) {
          throw new Error("La mise à jour a échoué, aucune donnée retournée");
        }

        console.log("Purchase order approved successfully:", updatedData);
        
        // 3. Synchroniser avec les bons de livraison après un délai pour permettre à la base de données de s'actualiser
        setTimeout(async () => {
          try {
            const syncResult = await syncApprovedPurchaseOrders();
            console.log("Sync result after approval:", syncResult);
          } catch (syncError) {
            console.error("Error in sync after approval:", syncError);
          }
        }, 500);
        
        return { id, success: true };
      } catch (error: any) {
        console.error("Error in useApprovePurchaseOrder:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log("Approval mutation succeeded:", data);
      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      queryClient.invalidateQueries({ queryKey: ['delivery-notes'] });
      
      // Afficher le message de succès uniquement si ce n'était pas déjà approuvé
      if (!data.alreadyApproved) {
        toast.success("Commande approuvée avec succès");
      }
    },
    onError: (error: any) => {
      console.error("Approval mutation failed:", error);
      toast.error(`Erreur lors de l'approbation: ${error.message}`);
    }
  });

  return (id: string) => {
    console.log("useApprovePurchaseOrder called with id:", id);
    return mutation.mutateAsync(id);
  };
}
