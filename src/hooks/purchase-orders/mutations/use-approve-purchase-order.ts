
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { db } from "@/utils/db-adapter";

export function useApprovePurchaseOrder() {
  const queryClient = useQueryClient();

  const approvePurchaseOrderMutation = useMutation({
    mutationFn: async (orderId: string) => {
      try {
        // Get the purchase order details
        const orderResult = await db.query(
          'purchase_orders',
          query => query
            .select('id, status, supplier_id, total_amount')
            .eq('id', orderId)
            .single()
        );

        // Check if order exists
        const order = Array.isArray(orderResult) && orderResult.length > 0 
          ? orderResult[0] 
          : orderResult;

        if (!order) {
          throw new Error('Commande non trouvée');
        }

        // Find an active warehouse
        const warehouseDataResult = await db.query(
          'warehouses',
          query => query
            .select('id')
            .eq('status', 'Actif')
            .limit(1)
            .single()
        );

        // Extract warehouse from array if needed
        const warehouseData = Array.isArray(warehouseDataResult) && warehouseDataResult.length > 0 
          ? warehouseDataResult[0] 
          : warehouseDataResult;

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

        // Update purchase order status
        await db.update(
          'purchase_orders',
          { status: 'approved' },
          'id',
          orderId
        );

        return true;
      } catch (error) {
        console.error('Error in approvePurchaseOrder:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      queryClient.invalidateQueries({ queryKey: ['delivery-notes'] });
      toast.success('Commande approuvée et bon de livraison créé avec succès');
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
