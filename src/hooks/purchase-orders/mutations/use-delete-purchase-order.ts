
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deletePurchaseOrder } from "./utils/delete-purchase-order";
import { toast } from "sonner";

export function useDeletePurchaseOrder() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: deletePurchaseOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      toast.success("Bon de commande supprimé avec succès");
    },
    onError: (error: Error) => {
      console.error("Delete error:", error);
      toast.error(error.message || "Erreur lors de la suppression");
    }
  });

  const handleDelete = async (id: string): Promise<boolean> => {
    try {
      await mutation.mutateAsync(id);
      return true;
    } catch (error) {
      console.error("Error in handleDelete:", error);
      return false;
    }
  };

  return handleDelete;
}
