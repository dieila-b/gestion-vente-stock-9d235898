
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { syncApprovedPurchaseOrders } from "@/hooks/delivery-notes/sync/sync-approved-purchase-orders";
import { createDeliveryNoteDirectly } from "./utils/delivery-note-creator";
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
        
        // Handle synchronization with delivery notes
        try {
          console.log("[useApprovePurchaseOrder] Starting sync after approval");
          const syncResult = await syncApprovedPurchaseOrders(id);
          console.log("[useApprovePurchaseOrder] Sync result after approval:", syncResult);
          
          // Invalidate queries to reflect changes
          await queryClient.invalidateQueries({ queryKey: ['delivery-notes'] });
          
          if (!syncResult) {
            console.log("[useApprovePurchaseOrder] No delivery note created, attempting direct creation...");
            await createDeliveryNoteDirectly(id);
          }
        } catch (syncError: any) {
          console.error("[useApprovePurchaseOrder] Error in sync after approval:", syncError);
          toast.error(`Erreur pendant la synchronisation: ${syncError.message || 'Erreur inconnue'}`);
          
          try {
            console.log("[useApprovePurchaseOrder] Attempting fallback creation of delivery note");
            await createDeliveryNoteDirectly(id);
          } catch (fallbackError: any) {
            console.error("[useApprovePurchaseOrder] Fallback creation failed:", fallbackError);
          }
        }
        
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
