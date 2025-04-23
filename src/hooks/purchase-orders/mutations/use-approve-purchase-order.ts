
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
        
        // 1. Verify the purchase order exists
        const { data: orders, error: checkError } = await supabase
          .from('purchase_orders')
          .select('id, status')
          .eq('id', id)
          .limit(1);
          
        if (checkError) {
          console.error("Error checking purchase order:", checkError);
          throw new Error(`Erreur lors de la vérification: ${checkError.message}`);
        }
        
        if (!orders || orders.length === 0) {
          console.error("Purchase order not found:", id);
          throw new Error("Bon de commande introuvable");
        }
        
        const checkOrder = orders[0];
        console.log("Found purchase order:", checkOrder);
        
        if (checkOrder.status === 'approved') {
          console.log("Order already approved:", id);
          toast.info("Ce bon de commande est déjà approuvé");
          return { id, alreadyApproved: true };
        }
        
        // 2. Update the purchase order status
        const { data: updatedData, error: updateError } = await supabase
          .from('purchase_orders')
          .update({ status: 'approved' })
          .eq('id', id)
          .select();

        if (updateError) {
          console.error("Error updating purchase order status:", updateError);
          throw new Error(`Erreur lors de la mise à jour: ${updateError.message}`);
        }
        
        if (!updatedData || updatedData.length === 0) {
          throw new Error("La mise à jour a échoué, aucune donnée retournée");
        }

        console.log("Purchase order approved successfully:", updatedData);
        
        // 3. Sync with delivery notes after a delay to allow the database to update
        try {
          const syncResult = await syncApprovedPurchaseOrders();
          console.log("Sync result after approval:", syncResult);
        } catch (syncError) {
          console.error("Error in sync after approval:", syncError);
          // Don't throw here, we still want to consider the approval successful
        }
        
        return { id, success: true };
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
      
      // Display success message only if not already approved
      if (!data.alreadyApproved) {
        toast.success("Commande approuvée avec succès");
      }
    },
    onError: (error: any) => {
      console.error("Approval mutation failed:", error);
      toast.error(`Erreur lors de l'approbation: ${error.message}`);
    }
  });

  // Return a function that directly calls mutateAsync to ensure proper Promise handling
  return (id: string) => {
    console.log("useApprovePurchaseOrder called with id:", id);
    return mutation.mutateAsync(id);
  };
}
