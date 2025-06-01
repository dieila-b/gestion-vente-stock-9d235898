
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

// Type definition for the approve_purchase_order RPC result
type ApprovalResult = {
  success: boolean;
  already_approved?: boolean;
  delivery_note_created?: boolean;
  delivery_number?: string;
  message?: string;
};

export function useApprovePurchaseOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderId: string) => {
      console.log("[useApprovePurchaseOrder] Starting approval for order:", orderId);
      
      try {
        // Utiliser la fonction RPC qui gère déjà la création du bon de livraison
        // pour éviter la duplication
        const { data: result, error } = await supabase.rpc(
          'approve_purchase_order',
          { order_id: orderId }
        );

        if (error) {
          console.error("[useApprovePurchaseOrder] RPC error:", error);
          throw error;
        }

        console.log("[useApprovePurchaseOrder] RPC result:", result);
        
        // Type assertion to properly handle the result
        const typedResult = result as ApprovalResult;
        
        if (!typedResult?.success) {
          throw new Error(typedResult?.message || 'Échec de l\'approbation');
        }

        return typedResult;
      } catch (error: any) {
        console.error("[useApprovePurchaseOrder] Error:", error);
        throw error;
      }
    },
    onSuccess: (result: ApprovalResult) => {
      console.log("[useApprovePurchaseOrder] Success:", result);
      
      if (result.already_approved) {
        toast.info("Ce bon de commande était déjà approuvé");
      } else if (result.delivery_note_created) {
        toast.success(`Bon de commande approuvé avec succès. Bon de livraison ${result.delivery_number} créé automatiquement.`);
      } else {
        toast.success("Bon de commande approuvé avec succès");
      }
      
      // Invalider les caches pour rafraîchir les données
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      queryClient.invalidateQueries({ queryKey: ['delivery-notes'] });
    },
    onError: (error: any) => {
      console.error("[useApprovePurchaseOrder] Mutation error:", error);
      toast.error(`Erreur lors de l'approbation: ${error.message || 'Erreur inconnue'}`);
    },
  });
}
