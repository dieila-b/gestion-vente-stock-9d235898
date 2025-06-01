
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
      
      if (!orderId) {
        throw new Error('ID du bon de commande manquant');
      }

      try {
        // Utiliser la fonction RPC qui gère déjà la création du bon de livraison
        console.log("[useApprovePurchaseOrder] Calling RPC approve_purchase_order with order_id:", orderId);
        
        const { data: result, error } = await supabase.rpc(
          'approve_purchase_order',
          { order_id: orderId }
        );

        console.log("[useApprovePurchaseOrder] RPC response:", { data: result, error });

        if (error) {
          console.error("[useApprovePurchaseOrder] RPC error:", error);
          throw new Error(`Erreur RPC: ${error.message}`);
        }

        if (!result) {
          console.error("[useApprovePurchaseOrder] No result returned from RPC");
          throw new Error('Aucun résultat retourné par la fonction d\'approbation');
        }

        console.log("[useApprovePurchaseOrder] RPC result:", result);
        
        // Type assertion to properly handle the result
        const typedResult = result as ApprovalResult;
        
        if (!typedResult?.success) {
          const errorMessage = typedResult?.message || 'Échec de l\'approbation';
          console.error("[useApprovePurchaseOrder] Approval failed:", errorMessage);
          throw new Error(errorMessage);
        }

        console.log("[useApprovePurchaseOrder] Approval successful:", typedResult);
        return typedResult;
      } catch (error: any) {
        console.error("[useApprovePurchaseOrder] Error during approval:", error);
        throw error;
      }
    },
    onSuccess: (result: ApprovalResult) => {
      console.log("[useApprovePurchaseOrder] Success callback:", result);
      
      if (result.already_approved) {
        toast.info("Ce bon de commande était déjà approuvé");
      } else if (result.delivery_note_created) {
        toast.success(`Bon de commande approuvé avec succès. Bon de livraison ${result.delivery_number} créé automatiquement.`);
      } else {
        toast.success("Bon de commande approuvé avec succès");
      }
      
      // Invalider les caches pour rafraîchir les données
      console.log("[useApprovePurchaseOrder] Invalidating queries...");
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      queryClient.invalidateQueries({ queryKey: ['delivery-notes'] });
    },
    onError: (error: any) => {
      console.error("[useApprovePurchaseOrder] Mutation error:", error);
      const errorMessage = error.message || 'Erreur inconnue lors de l\'approbation';
      toast.error(`Erreur lors de l'approbation: ${errorMessage}`);
    },
  });
}
