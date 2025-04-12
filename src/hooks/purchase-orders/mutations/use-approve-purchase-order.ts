
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { db } from "@/utils/db-adapter";

export function useApprovePurchaseOrder() {
  const queryClient = useQueryClient();

  const approvePurchaseOrderMutation = useMutation({
    mutationFn: async (orderId: string) => {
      try {
        // Get the purchase order details
        const order = await db.query(
          'purchase_orders',
          query => query
            .select('id, status, supplier_id, total_amount, deleted')
            .eq('id', orderId)
            .single()
        );

        if (!order || order.deleted) {
          throw new Error('Commande non trouvée ou supprimée');
        }

        // Use RPC function or update directly
        try {
          // Try to use RPC if available
          const result = await db.table('rpc').select('approve_purchase_order').call({
            order_id: orderId,
            new_status: 'approved'
          });
          
          if (!result) {
            throw new Error('RPC not available');
          }
        } catch (rpcError) {
          // Fallback to direct update if RPC fails
          console.log('RPC failed, using direct update:', rpcError);
          await db.update(
            'purchase_orders',
            { status: 'approved' },
            'id',
            orderId
          );
        }

        // Get updated order
        const updatedOrder = await db.query(
          'purchase_orders',
          query => query
            .select('*')
            .eq('id', orderId)
            .single()
        );

        if (!updatedOrder) {
          throw new Error('Impossible de récupérer la commande mise à jour');
        }

        // Find an active warehouse
        const warehouseData = await db.query(
          'warehouses',
          query => query
            .select('id')
            .eq('status', 'Actif')
            .limit(1)
            .single()
        );

        if (!warehouseData || !warehouseData.id) {
          throw new Error('Aucun entrepôt actif trouvé');
        }

        // Create delivery note
        const deliveryNumber = `BL-${new Date().toISOString().slice(0, 10)}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;

        const deliveryNote = await db.insert('delivery_notes', {
          delivery_number: deliveryNumber,
          purchase_order_id: orderId,
          supplier_id: order.supplier_id,
          status: 'pending',
          warehouse_id: warehouseData.id
        });

        if (!deliveryNote) {
          throw new Error('Erreur lors de la création du bon de livraison');
        }

        // Get order items
        const orderItems = await db.query(
          'purchase_order_items',
          query => query
            .select('id, product_id, quantity, unit_price')
            .eq('purchase_order_id', orderId)
        );

        if (!Array.isArray(orderItems) || orderItems.length === 0) {
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

        await db.insert('delivery_note_items', deliveryItems);

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
