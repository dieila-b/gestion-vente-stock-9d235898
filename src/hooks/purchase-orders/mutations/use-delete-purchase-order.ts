
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deletePurchaseOrder } from "./utils/delete-purchase-order";
import { toast } from "sonner";

export function useDeletePurchaseOrder() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (id: string) => {
      if (!confirm("Êtes-vous sûr de vouloir supprimer ce bon de commande ?")) {
        return false;
      }
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

  return mutation.mutate;
}
