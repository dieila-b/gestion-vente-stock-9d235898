import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { DeliveryNote } from "@/types/delivery-note";

export function useDeliveryNotes() {
  const queryClient = useQueryClient();
  
  // Fetch all delivery notes
  const { data: deliveryNotes = [], isLoading } = useQuery({
    queryKey: ['delivery-notes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('delivery_notes')
        .select(`
          *,
          supplier:suppliers(*),
          purchase_order:purchase_orders(*),
          items:delivery_note_items(*)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Add status property if it doesn't exist in the DB
      return data.map((note) => ({
        ...note,
        status: note.status || 'pending'
      }));
    }
  });

  // Create delivery note
  const createDeliveryNote = useMutation({
    mutationFn: async (deliveryNote: Partial<DeliveryNote>) => {
      const { data, error } = await supabase
        .from('delivery_notes')
        .insert({
          delivery_number: deliveryNote.delivery_number,
          notes: deliveryNote.notes,
          status: deliveryNote.status || 'pending'
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Bon de livraison créé avec succès");
      queryClient.invalidateQueries({ queryKey: ['delivery-notes'] });
    },
    onError: (error) => {
      toast.error(`Erreur: ${error.message}`);
    }
  });

  // Update delivery note
  const updateDeliveryNote = useMutation({
    mutationFn: async ({ id, ...deliveryNote }: Partial<DeliveryNote> & { id: string }) => {
      const { data, error } = await supabase
        .from('delivery_notes')
        .update({
          delivery_number: deliveryNote.delivery_number,
          notes: deliveryNote.notes,
          status: deliveryNote.status || 'pending'
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Bon de livraison mis à jour avec succès");
      queryClient.invalidateQueries({ queryKey: ['delivery-notes'] });
    },
    onError: (error) => {
      toast.error(`Erreur: ${error.message}`);
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
      toast.success("Bon de livraison supprimé avec succès");
      queryClient.invalidateQueries({ queryKey: ['delivery-notes'] });
    },
    onError: (error) => {
      toast.error(`Erreur: ${error.message}`);
    }
  });

  // Fetch a single delivery note by ID
  const fetchDeliveryNoteById = async (id: string) => {
    const { data, error } = await supabase
      .from('delivery_notes')
      .select(`
        *,
        supplier:suppliers(*),
        purchase_order:purchase_orders(*),
        items:delivery_note_items(
          *,
          product:product_id(*)
        )
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return {
      ...data,
      status: data.status || 'pending'
    };
  };

  // Add items to a delivery note
  const addDeliveryNoteItems = async (deliveryNoteId: string, items: any[]) => {
    const formattedItems = items.map(item => ({
      delivery_note_id: deliveryNoteId,
      product_id: item.product_id,
      quantity_ordered: item.quantity_ordered,
      quantity_received: item.quantity_received,
      unit_price: item.unit_price
    }));

    const { data, error } = await supabase
      .from('delivery_note_items')
      .insert(formattedItems)
      .select();
    
    if (error) throw error;
    return data;
  };

  // Update delivery note items
  const updateDeliveryNoteItems = async (items: any[]) => {
    // Process each item individually to handle updates
    const updatePromises = items.map(item => {
      if (item.id) {
        // Update existing item
        return supabase
          .from('delivery_note_items')
          .update({
            quantity_ordered: item.quantity_ordered,
            quantity_received: item.quantity_received,
            unit_price: item.unit_price
          })
          .eq('id', item.id);
      } else {
        // Insert new item
        return supabase
          .from('delivery_note_items')
          .insert({
            delivery_note_id: item.delivery_note_id,
            product_id: item.product_id,
            quantity_ordered: item.quantity_ordered,
            quantity_received: item.quantity_received,
            unit_price: item.unit_price
          });
      }
    });

    try {
      await Promise.all(updatePromises);
      return true;
    } catch (error) {
      console.error("Error updating delivery note items:", error);
      throw error;
    }
  };

  // Delete delivery note item
  const deleteDeliveryNoteItem = async (itemId: string) => {
    const { error } = await supabase
      .from('delivery_note_items')
      .delete()
      .eq('id', itemId);
    
    if (error) throw error;
    return itemId;
  };

  return {
    deliveryNotes,
    isLoading,
    createDeliveryNote,
    updateDeliveryNote,
    deleteDeliveryNote,
    fetchDeliveryNoteById,
    addDeliveryNoteItems,
    updateDeliveryNoteItems,
    deleteDeliveryNoteItem
  };
}
