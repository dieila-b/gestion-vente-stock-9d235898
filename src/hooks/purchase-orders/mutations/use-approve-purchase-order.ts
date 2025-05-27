
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { approvePurchaseOrderService } from "./services/purchase-order-approval-service";

/**
 * Hook for approving purchase orders with improved error handling
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
        // Force immediate UI update
        queryClient.setQueryData(['purchase-orders'], (oldData: any) => {
          if (!oldData) return oldData;
          
          return oldData.map((order: any) => {
            if (order.id === variables) {
              return { ...order, status: 'approved' };
            }
            return order;
          });
        });
        
        // Force refresh to get latest data from server after a short delay
        setTimeout(() => {
          queryClient.refetchQueries({ queryKey: ['purchase-orders'] });
          queryClient.refetchQueries({ queryKey: ['delivery-notes'] });
        }, 500);
      }
    },
    onError: (error: any, variables) => {
      console.error("[useApprovePurchaseOrder] Mutation failed:", error);
      const errorMessage = error?.message || 'Erreur inconnue lors de l\'approbation';
      toast.error(`Erreur: ${errorMessage}`);
      
      // Force refresh to ensure UI state is correct
      queryClient.refetchQueries({ queryKey: ['purchase-orders'] });
    }
  });
}
