
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
      console.log("[useApprovePurchaseOrder] Starting approval process for order:", id);
      
      try {
        // Process approval using the service
        const result = await approvePurchaseOrderService(id, queryClient);
        
        console.log("[useApprovePurchaseOrder] Approval process completed:", result);
        return result;
      } catch (error: any) {
        console.error("[useApprovePurchaseOrder] Error in approval process:", error);
        toast.error(`Erreur lors de l'approbation: ${error.message || 'Erreur inconnue'}`);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log("[useApprovePurchaseOrder] Approval successful:", data);
      if (!data?.alreadyApproved) {
        toast.success("Bon de commande approuvé avec succès");
      }
    },
    onError: (error: any) => {
      console.error("[useApprovePurchaseOrder] Mutation error:", error);
      toast.error(`Erreur lors de l'approbation: ${error.message || 'Erreur inconnue'}`);
    }
  });
}
