
import { useFetchDeliveryNotes } from './delivery-notes/use-fetch-delivery-notes';

export function useDeliveryNotes() {
  const { deliveryNotes, isLoading, filter, setFilter, searchTerm, setSearchTerm, refetch } = useFetchDeliveryNotes();
  
  return {
    deliveryNotes,
    isLoading,
    filter,
    setFilter,
    searchTerm,
    setSearchTerm,
    refetch
  };
}
