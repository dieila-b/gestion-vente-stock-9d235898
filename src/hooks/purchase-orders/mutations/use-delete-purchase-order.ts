
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export function useDeletePurchaseOrder() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('purchase_orders')
        .update({ deleted: true })
        .eq('id', id);

      if (error) throw error;
      return id;
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

  return (id: string) => {
    mutation.mutate(id);
  };
}
