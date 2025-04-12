
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useDeliveryNotes() {
  const queryClient = useQueryClient();

  // Query to fetch delivery notes
  const fetchDeliveryNotes = useQuery({
    queryKey: ['delivery-notes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('delivery_notes')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  // Add implementation for the missing handlers
  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('delivery_notes')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast.success("Note de livraison supprimée avec succès");
      queryClient.invalidateQueries({ queryKey: ['delivery-notes'] });
    } catch (error) {
      console.error("Error deleting delivery note:", error);
      toast.error("Erreur lors de la suppression de la note de livraison");
    }
  };

  const handleApprove = async (id: string) => {
    try {
      // Assuming there is a status field that can be updated
      const { error } = await supabase
        .from('delivery_notes')
        .update({ notes: 'Approved' }) // Use 'notes' field instead of 'status'
        .eq('id', id);
      
      if (error) throw error;
      
      toast.success("Note de livraison approuvée avec succès");
      queryClient.invalidateQueries({ queryKey: ['delivery-notes'] });
    } catch (error) {
      console.error("Error approving delivery note:", error);
      toast.error("Erreur lors de l'approbation de la note de livraison");
    }
  };

  const handleEdit = async (id: string, data: any) => {
    try {
      const { error } = await supabase
        .from('delivery_notes')
        .update(data)
        .eq('id', id);
      
      if (error) throw error;
      
      toast.success("Note de livraison modifiée avec succès");
      queryClient.invalidateQueries({ queryKey: ['delivery-notes'] });
    } catch (error) {
      console.error("Error editing delivery note:", error);
      toast.error("Erreur lors de la modification de la note de livraison");
    }
  };

  // Create delivery note
  const createDeliveryNote = useMutation({
    mutationFn: async (data: any) => {
      const { data: result, error } = await supabase
        .from('delivery_notes')
        .insert([data])
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      toast.success("Note de livraison créée avec succès");
      queryClient.invalidateQueries({ queryKey: ['delivery-notes'] });
    },
    onError: (error: any) => {
      toast.error("Erreur lors de la création de la note de livraison");
      console.error("Create error:", error);
    }
  });

  // Update delivery note
  const updateDeliveryNote = useMutation({
    mutationFn: async ({ id, ...data }: { id: string; [key: string]: any }) => {
      const { data: result, error } = await supabase
        .from('delivery_notes')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      toast.success("Note de livraison mise à jour avec succès");
      queryClient.invalidateQueries({ queryKey: ['delivery-notes'] });
    },
    onError: (error: any) => {
      toast.error("Erreur lors de la mise à jour de la note de livraison");
      console.error("Update error:", error);
    }
  });

  // Delete delivery note
  const deleteDeliveryNote = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('delivery_notes')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      toast.success("Note de livraison supprimée avec succès");
      queryClient.invalidateQueries({ queryKey: ['delivery-notes'] });
    },
    onError: (error: any) => {
      toast.error("Erreur lors de la suppression de la note de livraison");
      console.error("Delete error:", error);
    }
  });

  return {
    createDeliveryNote,
    updateDeliveryNote,
    deleteDeliveryNote,
    handleDelete,
    handleApprove,
    handleEdit,
    deliveryNotes: fetchDeliveryNotes.data || [],
    isLoading: fetchDeliveryNotes.isLoading
  };
}
