import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DeliveryNote } from "@/types/delivery-note";
import { useState } from "react";
import { toast } from "sonner";
import { isSelectQueryError, safeSupplier, safePurchaseOrder, safeProduct } from "@/utils/type-utils";

export const useDeliveryNotes = () => {
  const queryClient = useQueryClient();
  const [selectedDeliveryNote, setSelectedDeliveryNote] = useState<DeliveryNote | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: deliveryNotes = [], isLoading } = useQuery({
    queryKey: ['delivery-notes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('delivery_notes')
        .select(`
          *,
          supplier:supplier_id(*),
          purchase_order:purchase_order_id(*),
          items:delivery_note_items(
            id,
            product_id,
            quantity_ordered,
            quantity_received,
            unit_price,
            product:product_id(*)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform the data to match DeliveryNote interface and handle SelectQueryError
      return (data || []).map(item => {
        const safeItem = {
          id: item.id,
          delivery_number: item.delivery_number,
          created_at: item.created_at,
          updated_at: item.updated_at,
          notes: item.notes,
          status: item.status || 'pending', // Provide default status if not present
          supplier: safeSupplier(item.supplier),
          purchase_order: safePurchaseOrder(item.purchase_order),
          items: (item.items || []).map((lineItem: any) => ({
            id: lineItem.id,
            product_id: lineItem.product_id,
            quantity_ordered: lineItem.quantity_ordered || 0,
            quantity_received: lineItem.quantity_received || 0,
            unit_price: lineItem.unit_price || 0,
            product: safeProduct(lineItem.product)
          }))
        };
        return safeItem as DeliveryNote;
      });
    }
  });

  const createDeliveryNote = useMutation({
    mutationFn: async (deliveryNote: Partial<DeliveryNote>) => {
      // First create the delivery note
      const { data: noteData, error: noteError } = await supabase
        .from('delivery_notes')
        .insert({
          delivery_number: deliveryNote.delivery_number,
          notes: deliveryNote.notes,
          status: deliveryNote.status || 'pending', // Include status in insert
          supplier_id: deliveryNote.supplier?.id,
          purchase_order_id: deliveryNote.purchase_order?.id
        })
        .select();

      if (noteError) throw noteError;
      
      // Then, create the items if provided
      if (deliveryNote.items && deliveryNote.items.length > 0) {
        const itemsToInsert = deliveryNote.items.map(item => ({
          delivery_note_id: noteData.id,
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
      return noteData;
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Delivery note created successfully',
      });

      queryClient.invalidateQueries({ queryKey: ['delivery-notes'] });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Error creating delivery note',
        description: error.message,
      });
    }
  });

  const updateDeliveryNote = useMutation({
    mutationFn: async (id: string, data: any) => {
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
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Delivery note updated successfully',
      });

      queryClient.invalidateQueries({ queryKey: ['delivery-notes'] });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Error updating delivery note',
        description: error.message,
      });
    }
  });

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

  const handleEdit = (id: string, data: any = {}) => {
    // This function would typically navigate to an edit page
    console.log(`Editing delivery note ${id}`, data);
  };

  return {
    deliveryNotes,
    isLoading,
    selectedDeliveryNote,
    setSelectedDeliveryNote,
    isDialogOpen,
    setIsDialogOpen,
    createDeliveryNote,
    updateDeliveryNote,
    handleDelete,
    handleApprove,
    handleEdit
  };
};
