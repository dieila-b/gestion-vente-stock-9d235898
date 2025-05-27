
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { approvePurchaseOrderService } from "./services/purchase-order-approval-service";

/**
 * Hook for approving purchase orders
 * @returns Mutation object with mutateAsync function
 */
export function useApprovePurchaseOrder() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      console.log("[useApprovePurchaseOrder] Starting approval for order:", id);
      
      if (!id) {
        throw new Error("ID du bon de commande manquant");
      }
      
      const result = await approvePurchaseOrderService(id, queryClient);
      console.log("[useApprovePurchaseOrder] Service result:", result);
      
      return result;
    },
    onSuccess: (data, variables) => {
      console.log("[useApprovePurchaseOrder] Mutation successful:", data);
      
      if (!data?.alreadyApproved) {
        // Force refresh of purchase orders list
        queryClient.refetchQueries({ queryKey: ['purchase-orders'] });
        
        // Show success message only if not already approved
        if (data?.success) {
          toast.success("Bon de commande approuvé avec succès");
        }
      }
    },
    onError: (error: any, variables) => {
      console.error("[useApprovePurchaseOrder] Mutation failed:", error);
      const errorMessage = error?.message || 'Erreur inconnue lors de l\'approbation';
      toast.error(`Erreur lors de l'approbation: ${errorMessage}`);
    }
  });
}
