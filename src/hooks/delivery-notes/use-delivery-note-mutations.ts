
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useDeliveryNoteMutations() {
  const queryClient = useQueryClient();

  const createDeliveryNote = useMutation({
    mutationFn: async (data: any) => {
      try {
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

  const approveDeliveryNote = useMutation({
    mutationFn: async ({ 
      noteId, 
      warehouseId, 
      items 
    }: { 
      noteId: string; 
      warehouseId: string; 
      items: Array<{ id: string; quantity_received: number }> 
    }) => {
      try {
        // 1. Update delivery note status
        const { error: updateError } = await supabase
          .from('delivery_notes')
          .update({ 
            status: 'received',
            warehouse_id: warehouseId,
            updated_at: new Date().toISOString()
          })
          .eq('id', noteId);

        if (updateError) throw updateError;

        // 2. Update delivery note items with received quantities
        for (const item of items) {
          const { error: itemError } = await supabase
            .from('delivery_note_items')
            .update({ quantity_received: item.quantity_received })
            .eq('id', item.id);

          if (itemError) throw itemError;
        }

        // 3. Get delivery note with purchase order info for invoice creation
        const { data: deliveryNote, error: fetchError } = await supabase
          .from('delivery_notes')
          .select(`
            *,
            purchase_order:purchase_orders(*),
            supplier:suppliers(*),
            items:delivery_note_items(
              *,
              product:catalog(*)
            )
          `)
          .eq('id', noteId)
          .single();

        if (fetchError) throw fetchError;

        // 4. Create purchase invoice
        const invoiceNumber = `FA-${Date.now()}`;
        const totalAmount = deliveryNote.items.reduce((sum: number, item: any) => 
          sum + (item.quantity_received * item.unit_price), 0
        );

        const { data: invoice, error: invoiceError } = await supabase
          .from('purchase_invoices')
          .insert({
            invoice_number: invoiceNumber,
            supplier_id: deliveryNote.supplier_id,
            total_amount: totalAmount,
            status: 'received',
            created_at: new Date().toISOString()
          })
          .select('id')
          .single();

        if (invoiceError) throw invoiceError;

        // 5. Update warehouse stock for each received item
        for (const item of deliveryNote.items) {
          if (item.quantity_received > 0) {
            // Check if stock exists for this product in the warehouse
            const { data: existingStock, error: stockError } = await supabase
              .from('warehouse_stock')
              .select('*')
              .eq('warehouse_id', warehouseId)
              .eq('product_id', item.product_id)
              .single();

            if (stockError && stockError.code !== 'PGRST116') throw stockError;

            if (existingStock) {
              // Update existing stock
              const { error: updateStockError } = await supabase
                .from('warehouse_stock')
                .update({
                  quantity: existingStock.quantity + item.quantity_received,
                  total_value: (existingStock.quantity + item.quantity_received) * item.unit_price,
                  unit_price: item.unit_price,
                  updated_at: new Date().toISOString()
                })
                .eq('id', existingStock.id);

              if (updateStockError) throw updateStockError;
            } else {
              // Create new stock entry
              const { error: createStockError } = await supabase
                .from('warehouse_stock')
                .insert({
                  warehouse_id: warehouseId,
                  product_id: item.product_id,
                  quantity: item.quantity_received,
                  unit_price: item.unit_price,
                  total_value: item.quantity_received * item.unit_price
                });

              if (createStockError) throw createStockError;
            }

            // Record stock movement
            const { error: movementError } = await supabase
              .from('warehouse_stock_movements')
              .insert({
                warehouse_id: warehouseId,
                product_id: item.product_id,
                quantity: item.quantity_received,
                unit_price: item.unit_price,
                total_value: item.quantity_received * item.unit_price,
                type: 'in',
                reason: `Réception bon de livraison ${deliveryNote.delivery_number}`
              });

            if (movementError) throw movementError;
          }
        }

        return { noteId, invoiceId: invoice.id };
      } catch (error: any) {
        console.error('Error approving delivery note:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delivery-notes'] });
      queryClient.invalidateQueries({ queryKey: ['purchase-invoices'] });
      queryClient.invalidateQueries({ queryKey: ['warehouse-stock'] });
      toast.success('Bon de livraison approuvé et facture d\'achat créée avec succès');
    },
    onError: (error: any) => {
      toast.error(`Erreur lors de l'approbation: ${error.message}`);
    }
  });

  return {
    createDeliveryNote,
    updateDeliveryNote,
    deleteDeliveryNote,
    approveDeliveryNote
  };
}
