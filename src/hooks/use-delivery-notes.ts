
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { DeliveryNote } from '@/types/delivery-note';
import { safeSupplier, safeProduct, safePurchaseOrder } from '@/utils/type-utils';

export function useDeliveryNotes() {
  const queryClient = useQueryClient();

  // Fetch delivery notes
  const { data: deliveryNotesData, isLoading } = useQuery({
    queryKey: ['delivery-notes'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('delivery_notes')
          .select(`
            *,
            supplier:supplier_id(*),
            purchase_order:purchase_order_id(*),
            items:delivery_note_items(*)
          `)
          .order('created_at', { ascending: false });

        if (error) throw error;

        // The API returns data with status field but our type may not reflect that
        // Transform the data to include status explicitly
        return data.map(note => ({
          ...note,
          status: note.status || 'pending',
          supplier: safeSupplier(note.supplier),
          purchase_order: safePurchaseOrder(note.purchase_order),
          items: Array.isArray(note.items) ? note.items : []
        })) as DeliveryNote[];
      } catch (error: any) {
        console.error('Error fetching delivery notes:', error);
        throw error;
      }
    }
  });

  // Fetch warehouses for delivery note handling
  const { data: warehouses = [] } = useQuery({
    queryKey: ['warehouses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('warehouses')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;
      return data;
    }
  });

  // Create a new delivery note
  const createDeliveryNote = useMutation({
    mutationFn: async (data: Partial<DeliveryNote>) => {
      const { data: newNote, error } = await supabase
        .from('delivery_notes')
        .insert([{
          ...data,
          status: data.status || 'pending', // Ensure status is set
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      return newNote;
    },
    onSuccess: () => {
      toast.success("Delivery note created successfully");
      queryClient.invalidateQueries({ queryKey: ['delivery-notes'] });
    },
    onError: (error: any) => {
      toast.error(`Error creating delivery note: ${error.message}`);
    }
  });

  // Update a delivery note
  const updateDeliveryNote = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<DeliveryNote> }) => {
      const { data: updatedNote, error } = await supabase
        .from('delivery_notes')
        .update({
          ...data,
          status: data.status || 'pending', // Ensure status is set
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return updatedNote;
    },
    onSuccess: () => {
      toast.success("Delivery note updated successfully");
      queryClient.invalidateQueries({ queryKey: ['delivery-notes'] });
    },
    onError: (error: any) => {
      toast.error(`Error updating delivery note: ${error.message}`);
    }
  });

  // Delete a delivery note
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
      toast.success("Delivery note deleted successfully");
      queryClient.invalidateQueries({ queryKey: ['delivery-notes'] });
    },
    onError: (error: any) => {
      toast.error(`Error deleting delivery note: ${error.message}`);
    }
  });

  // Handle approving a delivery note (implementation simplified for now)
  const handleApprove = async (id: string, warehouseId: string, items: Array<{ id: string; quantity_received: number }>) => {
    try {
      const { error } = await supabase
        .from('delivery_notes')
        .update({ 
          status: 'approved',
          updated_at: new Date().toISOString() 
        })
        .eq('id', id);
      
      if (error) throw error;
      
      // Additional logic for updating items and warehouse stock would go here
      
      toast.success("Delivery note approved successfully");
      queryClient.invalidateQueries({ queryKey: ['delivery-notes'] });
      return true;
    } catch (error: any) {
      toast.error(`Error approving delivery note: ${error.message}`);
      return false;
    }
  };

  // Edit a delivery note (for compatibility with existing code)
  const handleEdit = (id: string, data = {}) => {
    return updateDeliveryNote.mutateAsync({ id, data });
  };

  // Simplified handler for deletion to match expected signature
  const handleDelete = (id: string) => {
    return deleteDeliveryNote.mutateAsync(id);
  };

  return {
    deliveryNotes: deliveryNotesData || [],
    isLoading,
    createDeliveryNote,
    updateDeliveryNote,
    deleteDeliveryNote,
    handleApprove,
    handleEdit,
    handleDelete,
    warehouses
  };
}
