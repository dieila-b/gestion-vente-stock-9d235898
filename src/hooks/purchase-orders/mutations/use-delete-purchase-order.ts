
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { db } from "@/utils/db-adapter";

export function useDeletePurchaseOrder() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (id: string) => {
      const result = await db.update(
        'purchase_orders',
        { deleted: true },
        'id',
        id
      );

      if (!result) {
        throw new Error('Failed to delete purchase order');
      }
      
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
