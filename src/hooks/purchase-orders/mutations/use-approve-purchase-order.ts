
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export function useApprovePurchaseOrder() {
  const queryClient = useQueryClient();

  const approvePurchaseOrderMutation = useMutation({
    mutationFn: async (orderId: string) => {
      try {
        const { data: order } = await supabase
          .from('purchase_orders')
          .select('id, status, supplier_id, total_amount, deleted')
          .eq('id', orderId)
          .single();

        if (!order || order.deleted) {
          throw new Error('Commande non trouvée ou supprimée');
        }

        const { data: result } = await supabase
          .rpc('approve_purchase_order', {
            order_id: orderId,
            new_status: 'approved'
          });

        if (!result) {
          throw new Error('Erreur lors de l\'approbation de la commande');
        }

        const { data: updatedOrder } = await supabase
          .from('purchase_orders')
          .select('*')
          .eq('id', orderId)
          .single();

        if (!updatedOrder) {
          throw new Error('Impossible de récupérer la commande mise à jour');
        }

        // Create delivery note
        const { data: warehouseData } = await supabase
          .from('warehouses')
          .select('id')
          .eq('status', 'Actif')
          .limit(1)
          .single();

        if (!warehouseData) {
          throw new Error('Aucun entrepôt actif trouvé');
        }

        const deliveryNumber = `BL-${new Date().toISOString().slice(0, 10)}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;

        const { data: deliveryNote } = await supabase
          .from('delivery_notes')
          .insert({
            delivery_number: deliveryNumber,
            purchase_order_id: orderId,
            supplier_id: order.supplier_id,
            status: 'pending',
            warehouse_id: warehouseData.id
          })
          .select('id')
          .single();

        if (!deliveryNote) {
          throw new Error('Erreur lors de la création du bon de livraison');
        }

        // Get order items
        const { data: orderItems } = await supabase
          .from('purchase_order_items')
          .select('id, product_id, quantity, unit_price')
          .eq('purchase_order_id', orderId);

        if (!orderItems) {
          throw new Error('Impossible de récupérer les articles de la commande');
        }

        // Create delivery note items
        const deliveryItems = orderItems.map(item => ({
          delivery_note_id: deliveryNote.id,
          product_id: item.product_id,
          quantity_ordered: item.quantity,
          quantity_received: 0,
          unit_price: item.unit_price
        }));

        await supabase
          .from('delivery_note_items')
          .insert(deliveryItems);

        return updatedOrder;
      } catch (error) {
        console.error('Error in approvePurchaseOrder:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      toast.success('Commande approuvée avec succès');
    },
    onError: (error: Error) => {
      console.error('Mutation error:', error);
      toast.error("Erreur lors de l'approbation: " + error.message);
    }
  });

  return (id: string) => {
    approvePurchaseOrderMutation.mutate(id);
  };
}
