
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useDeliveryNoteMutations() {
  const queryClient = useQueryClient();

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

  const handleDelete = async (id: string): Promise<boolean> => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce bon de livraison?")) {
      try {
        deleteDeliveryNote(id);
        return true;
      } catch (error) {
        return false;
      }
    }
    return false;
  };

  return {
    handleDelete
  };
}
