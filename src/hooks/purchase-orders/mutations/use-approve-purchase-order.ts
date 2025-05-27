
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { approvePurchaseOrderService } from "./services/purchase-order-approval-service";

/**
 * Hook for approving purchase orders
 * @returns Function to approve a purchase order by ID
 */
export function useApprovePurchaseOrder() {
  const queryClient = useQueryClient();
  
  const mutation = useMutation({
    mutationFn: async (id: string) => {
      try {
        console.log("[useApprovePurchaseOrder] Starting approval process for order:", id);
        
        // Process approval using the service
        const result = await approvePurchaseOrderService(id, queryClient);
        
        console.log("[useApprovePurchaseOrder] Approval process completed:", result);
        return result;
      } catch (error: any) {
        console.error("[useApprovePurchaseOrder] Error in approval process:", error);
        toast.error(`Erreur lors de l'approbation: ${error.message || 'Erreur inconnue'}`);
        throw error;
      }
    }
  });

  // Return a function that calls mutateAsync
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
