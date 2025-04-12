
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
  
  // Fetch warehouses for delivery note validation
  const { data: warehouses = [] } = useQuery({
    queryKey: ['warehouses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('warehouses')
        .select('id, name')
        .eq('is_active', true)
        .order('name');
        
      if (error) throw error;
      return data || [];
    }
  });

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
        // Ensure status has a default value
        const status = item.status || 'pending';
        
        const safeItem = {
          id: item.id,
          delivery_number: item.delivery_number,
          created_at: item.created_at,
          updated_at: item.updated_at,
          notes: item.notes,
          status: status,
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
          status: deliveryNote.status || 'pending',
          supplier_id: deliveryNote.supplier?.id,
          purchase_order_id: deliveryNote.purchase_order?.id
        })
        .select();

      if (noteError) throw noteError;
      
      // Then, create the items if provided
      if (deliveryNote.items && deliveryNote.items.length > 0) {
        const itemsToInsert = deliveryNote.items.map(item => ({
          delivery_note_id: noteData[0].id,
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

      toast.success('Delivery note created successfully');

      queryClient.invalidateQueries({ queryKey: ['delivery-notes'] });
      return noteData[0];
    },
    onError: (error: any) => {
      toast.error(`Error creating delivery note: ${error.message}`);
    }
  });

  const updateDeliveryNote = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      try {
        // Ensure we're sending status field if it exists in the data object
        const updateData = {
          ...data,
          status: data.status || 'pending' // Add status if it doesn't exist
        };
        
        const { data: updatedNote, error } = await supabase
          .from('delivery_notes')
          .update(updateData)
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;

        toast.success('Delivery note updated successfully');

        queryClient.invalidateQueries({ queryKey: ['delivery-notes'] });
        return updatedNote;
      } catch (error: any) {
        toast.error(`Error updating delivery note: ${error.message}`);
        throw error;
      }
    }
  });

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('delivery_notes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Delivery note deleted successfully');

      queryClient.invalidateQueries({ queryKey: ['delivery-notes'] });
      return true;
    } catch (error: any) {
      toast.error(`Error deleting delivery note: ${error.message}`);
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

      toast.success('Delivery note approved successfully');

      queryClient.invalidateQueries({ queryKey: ['delivery-notes'] });
      return true;
    } catch (error: any) {
      toast.error(`Error approving delivery note: ${error.message}`);
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
    handleEdit,
    warehouses
  };
};
