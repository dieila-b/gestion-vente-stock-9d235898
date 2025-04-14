
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { DeliveryNote } from "@/types/delivery-note";
import { isSelectQueryError, safeSupplier } from "@/utils/type-utils";
import { useFetchDeliveryNotes } from "./delivery-notes/use-fetch-delivery-notes";
import { formatDate } from "@/lib/formatters";

export function useDeliveryNotes() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Query to fetch delivery notes using the updated hook
  const { data: deliveryNotes = [], isLoading } = useFetchDeliveryNotes();

  // Handle view
  const handleView = (id: string) => {
    navigate(`/delivery-notes/${id}`);
  };

  // Handle delete
  const { mutate: deleteDeliveryNote } = useMutation({
    mutationFn: async (id: string) => {
      // Instead of hard-deleting, just mark it as deleted
      const { error } = await supabase
        .from('delivery_notes')
        .update({ deleted: true })
        .eq('id', id);
      
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delivery-notes'] });
      toast.success("Bon de livraison supprimé");
    },
    onError: (error: any) => {
      toast.error(`Erreur lors de la suppression: ${error.message}`);
    }
  });

  const handleDelete = async (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce bon de livraison?")) {
      deleteDeliveryNote(id);
    }
  };

  return {
    deliveryNotes,
    isLoading,
    handleView,
    handleDelete
  };
}
