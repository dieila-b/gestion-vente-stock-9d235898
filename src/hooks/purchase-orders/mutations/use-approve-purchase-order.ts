
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { PurchaseOrder } from "@/types/purchase-order";

export function useApprovePurchaseOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      try {
        console.log("Approving purchase order:", id);
        
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
        
        // We'll handle the delivery note creation elsewhere to avoid RLS issues
        return data;
      } catch (error: any) {
        console.error("Error approving purchase order:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      // Also invalidate delivery notes to trigger a refresh that will check for approved orders
      queryClient.invalidateQueries({ queryKey: ['delivery-notes'] });
      toast.success("Commande approuvée avec succès");
    },
    onError: (error: any) => {
      toast.error(`Erreur lors de l'approbation: ${error.message}`);
    }
  });
}
