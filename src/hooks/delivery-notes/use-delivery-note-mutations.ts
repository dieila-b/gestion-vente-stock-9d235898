
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
      toast.success('Delivery note created successfully');
    },
    onError: (error: any) => {
      toast.error(`Error creating delivery note: ${error.message}`);
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
      toast.success('Delivery note updated successfully');
    },
    onError: (error: any) => {
      toast.error(`Error updating delivery note: ${error.message}`);
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
      toast.success('Delivery note deleted successfully');
    },
    onError: (error: any) => {
      toast.error(`Error deleting delivery note: ${error.message}`);
    }
  });

  return {
    createDeliveryNote,
    updateDeliveryNote,
    deleteDeliveryNote
  };
}
