
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { DeliveryNote } from "@/types/delivery-note";
import { db } from "@/utils/db-adapter";

export function useDeliveryNotes() {
  const queryClient = useQueryClient();

  // Query to fetch delivery notes
  const { data: deliveryNotes = [], isLoading } = useQuery({
    queryKey: ['delivery-notes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('delivery_notes')
        .select(`
          *,
          supplier:suppliers (name, phone, email),
          purchase_order:purchase_orders!delivery_notes_purchase_order_id_fkey (order_number, total_amount),
          items:delivery_note_items (
            id, product_id, quantity_ordered, quantity_received, unit_price,
            product:catalog!delivery_note_items_product_id_fkey (name, reference, category)
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as DeliveryNote[];
    }
  });

  // Mock warehouse data until we implement the real function
  const warehouses = [
    { id: "1", name: "Main Warehouse" },
    { id: "2", name: "Secondary Warehouse" }
  ];

  // Handle delete
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

  // Handle approve - accepts both id and data for flexibility
  const handleApprove = async (id: string, data?: any) => {
    try {
      // Assuming there is a status field that can be updated
      const { error } = await supabase
        .from('delivery_notes')
        .update({ status: 'approved' })
        .eq('id', id);
      
      if (error) throw error;
      
      toast.success("Note de livraison approuvée avec succès");
      queryClient.invalidateQueries({ queryKey: ['delivery-notes'] });
    } catch (error) {
      console.error("Error approving delivery note:", error);
      toast.error("Erreur lors de l'approbation de la note de livraison");
    }
  };

  // Handle edit
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
    deliveryNotes,
    isLoading,
    warehouses
  };
}
