
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deletePurchaseOrder } from "./utils/delete-purchase-order";
import { toast } from "sonner";
import { useState } from "react";

export function useDeletePurchaseOrder() {
  const queryClient = useQueryClient();
  const [isDeleting, setIsDeleting] = useState(false);

  const mutation = useMutation({
    mutationFn: deletePurchaseOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      toast.success("Bon de commande supprimé avec succès");
      setIsDeleting(false);
    },
    onError: (error: Error) => {
      console.error("Delete error:", error);
      toast.error(error.message || "Erreur lors de la suppression");
      setIsDeleting(false);
    }
  });

  const handleDelete = async (id: string): Promise<boolean> => {
    try {
      setIsDeleting(true);
      await mutation.mutateAsync(id);
      return true;
    } catch (error) {
      console.error("Error in handleDelete:", error);
      return false;
    }
  };

  return { handleDelete, isDeleting };
}
