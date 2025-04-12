
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { DeliveryNote, DeliveryNoteItem } from '@/types/delivery-note';
import { isSelectQueryError, safeGet } from '@/utils/type-utils';

export function useDeliveryNotes() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch delivery notes with all relational data
  const { data: rawDeliveryNotes = [], isLoading } = useQuery({
    queryKey: ['delivery-notes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('delivery_notes')
        .select(`
          *,
          supplier:supplier_id (*),
          purchase_order:purchase_order_id (*),
          items:delivery_note_items (
            *,
            product:product_id (*)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        toast({
          variant: 'destructive',
          title: 'Error fetching delivery notes',
          description: error.message,
        });
        return [];
      }

      // Map raw data to expected types
      return data.map(note => ({
        ...note,
        status: note.status || 'pending', // Ensure status is always defined
        supplier: isSelectQueryError(note.supplier)
          ? { name: 'Unknown Supplier', phone: '', email: '' } 
          : note.supplier || { name: 'Unknown Supplier', phone: '', email: '' },
        purchase_order: isSelectQueryError(note.purchase_order)
          ? { order_number: '', total_amount: 0 }
          : note.purchase_order || { order_number: '', total_amount: 0 },
        items: (note.items || []).map((item: any) => {
          const safeItem: DeliveryNoteItem = {
            id: item.id || '',
            product_id: item.product_id || '',
            quantity_ordered: item.quantity_ordered || 0,
            quantity_received: item.quantity_received || 0,
            unit_price: item.unit_price || 0,
            product: isSelectQueryError(item.product)
              ? { name: 'Unknown Product', reference: '', category: '' }
              : item.product || { name: 'Unknown Product', reference: '', category: '' }
          };
          return safeItem;
        })
      }));
    }
  });

  // Fetch warehouses for delivery note assignment
  const { data: warehouses = [] } = useQuery({
    queryKey: ['warehouses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('warehouses')
        .select('*')
        .eq('is_active', true);

      if (error) {
        toast({
          variant: 'destructive',
          title: 'Error fetching warehouses',
          description: error.message,
        });
        return [];
      }
      return data;
    }
  });

  // Create delivery note
  const createDeliveryNote = async (data: {
    delivery_number?: string;
    notes?: string;
    status?: string;
    supplier_id?: string;
    purchase_order_id?: string;
    items?: Array<{
      product_id: string;
      quantity_ordered: number;
      quantity_received: number;
      unit_price: number;
    }>;
  }) => {
    try {
      // First, create the delivery note
      const { data: newNote, error } = await supabase
        .from('delivery_notes')
        .insert({
          delivery_number: data.delivery_number,
          notes: data.notes,
          status: data.status, // Now correctly included in the type
          supplier_id: data.supplier_id,
          purchase_order_id: data.purchase_order_id
        })
        .select()
        .single();

      if (error) throw error;

      // Then, create the items if provided
      if (data.items && data.items.length > 0) {
        const itemsToInsert = data.items.map(item => ({
          delivery_note_id: newNote.id,
          product_id: item.product_id,
          quantity_ordered: item.quantity_ordered,
          quantity_received: item.quantity_received,
          unit_price: item.unit_price
        }));

        const { error: itemsError } = await supabase
          .from('delivery_note_items')
          .insert(itemsToInsert);

        if (itemsError) throw itemsError;
      }

      toast({
        title: 'Success',
        description: 'Delivery note created successfully',
      });

      queryClient.invalidateQueries({ queryKey: ['delivery-notes'] });
      return newNote;
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error creating delivery note',
        description: error.message,
      });
      return null;
    }
  };

  // Update delivery note
  const updateDeliveryNote = async (id: string, data: any) => {
    try {
      const { data: updatedNote, error } = await supabase
        .from('delivery_notes')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Delivery note updated successfully',
      });

      queryClient.invalidateQueries({ queryKey: ['delivery-notes'] });
      return updatedNote;
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error updating delivery note',
        description: error.message,
      });
      return null;
    }
  };

  // Delete delivery note
  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('delivery_notes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Delivery note deleted successfully',
      });

      queryClient.invalidateQueries({ queryKey: ['delivery-notes'] });
      return true;
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error deleting delivery note',
        description: error.message,
      });
      return false;
    }
  };

  // Approve delivery note
  const handleApprove = async (id: string) => {
    try {
      const { error } = await supabase
        .from('delivery_notes')
        .update({ status: 'approved' })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Delivery note approved successfully',
      });

      queryClient.invalidateQueries({ queryKey: ['delivery-notes'] });
      return true;
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error approving delivery note',
        description: error.message,
      });
      return false;
    }
  };

  // Edit delivery note (placeholder for navigation)
  const handleEdit = (id: string, data: any = {}) => {
    // This function would typically navigate to an edit page
    console.log(`Editing delivery note ${id}`, data);
  };

  return {
    isLoading,
    createDeliveryNote,
    updateDeliveryNote,
    handleDelete,
    handleApprove,
    handleEdit,
    deliveryNotes: rawDeliveryNotes as DeliveryNote[],
    warehouses
  };
}
