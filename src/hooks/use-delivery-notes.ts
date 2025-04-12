
import { useFetchDeliveryNotes } from "./delivery-notes/use-fetch-delivery-notes";
import { useFetchWarehouses } from "./delivery-notes/use-fetch-warehouses";
import { useDeliveryNoteMutations } from "./delivery-notes/use-delivery-note-mutations";

export function useDeliveryNotes() {
  const { data: deliveryNotes, isLoading, refetch } = useFetchDeliveryNotes();
  const { data: warehouses = [] } = useFetchWarehouses();
  const { handleDelete, handleApprove, handleEdit } = useDeliveryNoteMutations();

  return {
    deliveryNotes,
    isLoading,
    warehouses,
    handleDelete,
    handleApprove,
    handleEdit,
    refetch
  };
}
