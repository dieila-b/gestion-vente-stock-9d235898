
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { db } from "@/utils/db-adapter";

export function useDeliveryNoteMutations() {
  const queryClient = useQueryClient();

  const createDeliveryNote = useMutation({
    mutationFn: async (data: any) => {
      try {
        // Create the delivery note first
        const { data: deliveryNote, error } = await supabase
          .from('delivery_notes')
          .insert(data)
          .select('id')
          .single();

        if (error) throw error;
        return deliveryNote;
      } catch (error: any) {
        console.error('Error creating delivery note:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delivery-notes'] });
      toast.success('Bon de livraison créé avec succès');
    },
    onError: (error: any) => {
      toast.error(`Erreur lors de la création: ${error.message}`);
    }
  });

  const updateDeliveryNote = useMutation({
    mutationFn: async ({ id, ...data }: { id: string; [key: string]: any }) => {
      try {
        const { data: updatedNote, error } = await supabase
          .from('delivery_notes')
          .update(data)
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        return updatedNote;
      } catch (error: any) {
        console.error('Error updating delivery note:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delivery-notes'] });
      toast.success('Bon de livraison mis à jour avec succès');
    },
    onError: (error: any) => {
      toast.error(`Erreur lors de la mise à jour: ${error.message}`);
    }
  });

  const deleteDeliveryNote = useMutation({
    mutationFn: async (id: string) => {
      try {
        const { error } = await supabase
          .from('delivery_notes')
          .delete()
          .eq('id', id);

        if (error) throw error;
        return id;
      } catch (error: any) {
        console.error('Error deleting delivery note:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delivery-notes'] });
      toast.success('Bon de livraison supprimé avec succès');
    },
    onError: (error: any) => {
      toast.error(`Erreur lors de la suppression: ${error.message}`);
    }
  });

  return {
    createDeliveryNote,
    updateDeliveryNote,
    deleteDeliveryNote
  };
}
