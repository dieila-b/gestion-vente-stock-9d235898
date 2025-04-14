
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { db } from "@/utils/db-adapter";

export function useApprovePurchaseOrder() {
  const queryClient = useQueryClient();

  const approvePurchaseOrderMutation = useMutation({
    mutationFn: async (orderId: string) => {
      try {
        console.log("Starting approval process for order:", orderId);
        
        // Get the purchase order details
        const orderResults = await db.query(
          'purchase_orders',
          query => query
            .select('id, status, supplier_id, total_amount')
            .eq('id', orderId)
        );

        if (!orderResults || orderResults.length === 0) {
          throw new Error('Commande non trouvée');
        }

        const order = orderResults[0];
        console.log("Found order:", order);

        // Find an active warehouse
        const warehouseResults = await db.query(
          'warehouses',
          query => query
            .select('id')
            .eq('status', 'Actif')
            .limit(1)
        );

        if (!warehouseResults || warehouseResults.length === 0) {
          throw new Error('Aucun entrepôt actif trouvé');
        }

        const warehouseData = warehouseResults[0];
        console.log("Using warehouse:", warehouseData);

        // Create delivery note
        const deliveryNumber = `BL-${new Date().toISOString().slice(0, 10)}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
        console.log("Generated delivery number:", deliveryNumber);

        const deliveryNote = await db.insert('delivery_notes', {
          delivery_number: deliveryNumber,
          purchase_order_id: orderId,
          supplier_id: order.supplier_id,
          status: 'pending',
          warehouse_id: warehouseData.id,
          deleted: false
        });

        if (!deliveryNote) {
          throw new Error('Erreur lors de la création du bon de livraison');
        }
        
        console.log("Created delivery note:", deliveryNote);

        // Get order items
        const orderItems = await db.query(
          'purchase_order_items',
          query => query
            .select('id, product_id, quantity, unit_price')
            .eq('purchase_order_id', orderId)
        );

        if (!orderItems || orderItems.length === 0) {
          throw new Error('Impossible de récupérer les articles de la commande');
        }
        
        console.log("Found order items:", orderItems);

        // Create delivery note items
        for (const item of orderItems) {
          await db.insert('delivery_note_items', {
            delivery_note_id: deliveryNote.id,
            product_id: item.product_id,
            quantity_ordered: item.quantity,
            quantity_received: 0,
            unit_price: item.unit_price
          });
        }
        
        console.log("Created delivery note items");

        // Update purchase order status
        await db.update(
          'purchase_orders',
          { status: 'approved' },
          'id',
          orderId
        );
        
        console.log("Updated purchase order status to approved");

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
