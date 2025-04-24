
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { PurchaseOrder } from "@/types/purchase-order";

export function useApprovePurchaseOrder() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (id: string): Promise<PurchaseOrder> => {
      try {
        console.log("Starting approval process for order:", id);
        
        // 1. Update purchase order status
        const { data: updatedOrder, error: updateError } = await supabase
          .from('purchase_orders')
          .update({ 
            status: 'approved', 
            updated_at: new Date().toISOString() 
          })
          .eq('id', id)
          .select()
          .single();
          
        if (updateError) {
          console.error("Error updating purchase order:", updateError);
          throw new Error(`Erreur lors de l'approbation: ${updateError.message}`);
        }
        
        if (!updatedOrder) {
          throw new Error("Bon de commande introuvable");
        }

        console.log("Purchase order approved:", updatedOrder);
        
        // The delivery note will be created automatically by the database trigger
        
        // 2. Refresh affected queries
        await queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
        await queryClient.invalidateQueries({ queryKey: ['delivery-notes'] });
        
        toast.success("Bon de commande approuvé et bon de livraison créé");
        return updatedOrder;
      } catch (error: any) {
        console.error("Error in useApprovePurchaseOrder:", error);
        throw error;
      }
    }
  });

  return mutation.mutateAsync;
}
