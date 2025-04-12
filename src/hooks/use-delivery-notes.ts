
import { useFetchDeliveryNotes } from './delivery-notes/use-fetch-delivery-notes';
import { useDeliveryNoteMutations } from './delivery-notes/use-delivery-note-mutations';
import { useFetchWarehouses } from './delivery-notes/use-fetch-warehouses';

export function useDeliveryNotes() {
  const { deliveryNotes, isLoading, filter, setFilter, searchTerm, setSearchTerm, refetch } = useFetchDeliveryNotes();
  const { handleDelete, handleApprove, handleEdit } = useDeliveryNoteMutations();
  const { data: warehouses } = useFetchWarehouses();
  
  return {
    deliveryNotes,
    isLoading,
    filter,
    setFilter,
    searchTerm,
    setSearchTerm,
    refetch,
    warehouses,
    handleDelete,
    handleApprove,
    handleEdit
  };
}
