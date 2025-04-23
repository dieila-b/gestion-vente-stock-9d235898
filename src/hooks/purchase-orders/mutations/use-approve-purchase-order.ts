
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
        
        // Update the purchase order status
        const { data, error } = await supabase
          .from('purchase_orders')
          .update({ status: 'approved' })
          .eq('id', id)
          .select()
          .single();

        if (error) {
          console.error("Error updating purchase order status:", error);
          throw error;
        }

        console.log("Purchase order approved successfully:", data);
        
        // Trigger synchronization to create delivery notes
        const syncResult = await syncApprovedPurchaseOrders();
        console.log("Sync result after approval:", syncResult);
        
        return data;
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
      toast.success("Commande approuvée avec succès");
    },
    onError: (error: any) => {
      console.error("Approval mutation failed:", error);
      toast.error(`Erreur lors de l'approbation: ${error.message}`);
    }
  });

  // Return a wrapped function that handles the Promise correctly
  return (id: string) => {
    console.log("useApprovePurchaseOrder called with id:", id);
    return mutation.mutateAsync(id);
  };
}
