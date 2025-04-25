
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deletePurchaseOrder } from "./utils/delete-purchase-order";

export function useDeletePurchaseOrder() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: deletePurchaseOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
    }
  });

  return mutation.mutateAsync;
}
