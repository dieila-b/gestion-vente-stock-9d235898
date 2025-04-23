
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
        
        // Update the purchase order status - Fixed: Removed .single() which was causing the error
        const { error } = await supabase
          .from('purchase_orders')
          .update({ status: 'approved' })
          .eq('id', id);

        if (error) {
          console.error("Error updating purchase order status:", error);
          throw error;
        }

        // Fetch the updated order to confirm changes
        const { data: updatedOrder, error: fetchError } = await supabase
          .from('purchase_orders')
          .select('*')
          .eq('id', id)
          .maybeSingle();
          
        if (fetchError) {
          console.error("Error fetching updated purchase order:", fetchError);
          // Continue execution - we can still try to sync
        }

        console.log("Purchase order approved successfully:", updatedOrder);
        
        // Trigger synchronization to create delivery notes
        const syncResult = await syncApprovedPurchaseOrders();
        console.log("Sync result after approval:", syncResult);
        
        return updatedOrder || { id };
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
