
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { db } from "@/utils/db-adapter";
import { supabase } from "@/integrations/supabase/client";

export function useDeletePurchaseOrder() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (id: string) => {
      try {
        console.log("Deleting purchase order:", id);
        
        // First try to use the db adapter
        const result = await db.update(
          'purchase_orders',
          { deleted: true },
          'id',
          id
        );
        
        // If db adapter fails, use supabase directly
        if (!result) {
          const { error } = await supabase
            .from('purchase_orders')
            .delete()
            .eq('id', id);
            
          if (error) throw error;
        }
        
        return true;
      } catch (error: any) {
        console.error("Delete error:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      toast.success('Commande supprimée avec succès');
    },
    onError: (error: Error) => {
      console.error('Delete error:', error);
      toast.error("Erreur lors de la suppression: " + error.message);
    }
  });

  // Return a function with the proper signature
  return async (id: string): Promise<void> => {
    await mutation.mutateAsync(id);
  };
}
