
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deletePurchaseOrder } from "./utils/delete-purchase-order";
import { toast } from "sonner";

export function useDeletePurchaseOrder() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (id: string) => {
      // Nous ne faisons pas la confirmation ici, elle sera gérée au niveau supérieur
      return deletePurchaseOrder(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      toast.success("Bon de commande supprimé avec succès");
    },
    onError: (error: Error) => {
      console.error("Delete error:", error);
      toast.error(error.message);
    }
  });

  // Retournons la fonction mutateAsync au lieu de mutate pour pouvoir attendre la réponse
  return mutation.mutateAsync;
}
