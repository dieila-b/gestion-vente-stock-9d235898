
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useDeliveryNoteOperations = () => {
  const queryClient = useQueryClient();

  // Récupérer les bons de livraison avec leurs relations
  const { data: deliveryNotes = [], isLoading } = useQuery({
    queryKey: ['delivery-notes-complete'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('delivery_notes')
        .select(`
          *,
          supplier:suppliers (*),
          purchase_order:purchase_orders (*),
          warehouse:warehouses (*),
          delivery_note_items (
            *,
            product:catalog (*)
          )
        `)
        .eq('deleted', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    }
  });

  // Approuver un bon de livraison et mettre à jour le stock
  const approveDeliveryNoteMutation = useMutation({
    mutationFn: async ({ 
      noteId, 
      warehouseId, 
      items 
    }: { 
      noteId: string; 
      warehouseId: string; 
      items: Array<{ id: string; quantity_received: number }> 
    }) => {
      // Mettre à jour le statut du bon de livraison
      const { error: updateError } = await supabase
        .from('delivery_notes')
        .update({
          status: 'received',
          approved_at: new Date().toISOString(),
          warehouse_id: warehouseId
        })
        .eq('id', noteId);

      if (updateError) throw updateError;

      // Mettre à jour les quantités reçues des articles
      for (const item of items) {
        const { error: itemError } = await supabase
          .from('delivery_note_items')
          .update({ quantity_received: item.quantity_received })
          .eq('id', item.id);

        if (itemError) throw itemError;

        // Récupérer les informations de l'article pour mettre à jour le stock
        const { data: itemData, error: fetchError } = await supabase
          .from('delivery_note_items')
          .select('product_id, unit_price')
          .eq('id', item.id)
          .single();

        if (fetchError) throw fetchError;

        // Mettre à jour ou créer le stock dans l'entrepôt
        const { data: existingStock, error: stockFetchError } = await supabase
          .from('warehouse_stock')
          .select('*')
          .eq('warehouse_id', warehouseId)
          .eq('product_id', itemData.product_id)
          .single();

        if (stockFetchError && stockFetchError.code !== 'PGRST116') {
          throw stockFetchError;
        }

        if (existingStock) {
          // Mettre à jour le stock existant
          const newQuantity = existingStock.quantity + item.quantity_received;
          const { error: updateStockError } = await supabase
            .from('warehouse_stock')
            .update({
              quantity: newQuantity,
              total_value: newQuantity * existingStock.unit_price,
              updated_at: new Date().toISOString()
            })
            .eq('id', existingStock.id);

          if (updateStockError) throw updateStockError;
        } else {
          // Créer un nouveau stock
          const { error: createStockError } = await supabase
            .from('warehouse_stock')
            .insert({
              warehouse_id: warehouseId,
              product_id: itemData.product_id,
              quantity: item.quantity_received,
              unit_price: itemData.unit_price,
              total_value: item.quantity_received * itemData.unit_price
            });

          if (createStockError) throw createStockError;
        }
      }

      return { noteId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delivery-notes-complete'] });
      queryClient.invalidateQueries({ queryKey: ['warehouse-stock'] });
      toast.success("Bon de livraison approuvé et stock mis à jour");
    },
    onError: (error: any) => {
      toast.error(`Erreur lors de l'approbation: ${error.message}`);
    }
  });

  return {
    deliveryNotes,
    isLoading,
    approveDeliveryNote: approveDeliveryNoteMutation.mutate,
    isApproving: approveDeliveryNoteMutation.isPending
  };
};
