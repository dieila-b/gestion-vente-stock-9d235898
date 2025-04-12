
// Placeholder implementation with correct type handling for the delivery notes hook

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export interface DeliveryNote {
  id: string;
  delivery_number: string;
  created_at: string;
  updated_at: string;
  notes: string;
  status: string; // Add status property which was missing
  supplier: {
    name: string;
    phone?: string;
    email?: string;
  };
  purchase_order: {
    order_number: string;
    total_amount: number;
  };
  items: DeliveryNoteItem[];
}

export interface DeliveryNoteItem {
  id: string;
  product_id: string;
  quantity_ordered: number;
  quantity_received: number;
  unit_price: number;
  product: {
    name: string;
    reference?: string;
    category?: string;
  };
}

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
        supplier: note.supplier?.error 
          ? { name: 'Unknown Supplier', phone: '', email: '' } 
          : note.supplier || { name: 'Unknown Supplier', phone: '', email: '' },
        purchase_order: note.purchase_order?.error
          ? { order_number: '', total_amount: 0 }
          : note.purchase_order || { order_number: '', total_amount: 0 },
        items: (note.items || []).map(item => ({
          ...item,
          product: item.product?.error
            ? { name: 'Unknown Product', reference: '', category: '' }
            : item.product || { name: 'Unknown Product', reference: '', category: '' }
        }))
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
  const createDeliveryNote = async (data: any) => {
    try {
      const { data: newNote, error } = await supabase
        .from('delivery_notes')
        .insert(data)
        .select()
        .single();

      if (error) throw error;

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
