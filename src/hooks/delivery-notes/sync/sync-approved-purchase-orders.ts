
import { supabase } from "@/integrations/supabase/client";
import { db } from "@/utils/db-core";

/**
 * Synchronizes approved purchase orders with delivery notes
 * Creates delivery notes for approved purchase orders that don't have one yet
 */
export async function syncApprovedPurchaseOrders() {
  try {
    console.log("Syncing approved purchase orders to create delivery notes...");
    
    // Fetch approved purchase orders using db utility for more reliable access
    const approvedOrders = await db.query(
      'purchase_orders',
      q => q.select(`
        id,
        supplier_id,
        order_number,
        status,
        items:purchase_order_items(*)
      `)
      .eq('status', 'approved')
      .order('created_at', { ascending: false }),
      []
    );

    console.log("Found approved purchase orders:", approvedOrders);

    if (!approvedOrders || approvedOrders.length === 0) {
      console.log("No approved purchase orders found");
      return;
    }

    // For each approved order, check if a delivery note already exists
    for (const order of approvedOrders) {
      // Check if delivery note exists using db utility
      const existingDeliveryNotes = await db.query(
        'delivery_notes',
        q => q.select('id').eq('purchase_order_id', order.id),
        []
      );

      const existingDeliveryNote = existingDeliveryNotes.length > 0 ? existingDeliveryNotes[0] : null;

      if (!existingDeliveryNote) {
        console.log(`Creating delivery note for purchase order ${order.id}`);
        
        // Generate a unique delivery note number
        const deliveryNumber = `BL-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
        
        // Create the delivery note
        const newDeliveryNote = await db.insert('delivery_notes', {
          purchase_order_id: order.id,
          supplier_id: order.supplier_id,
          delivery_number: deliveryNumber,
          status: 'pending',
          deleted: false,
          notes: `Bon de livraison créé automatiquement depuis la commande ${order.order_number || ''}`
        });

        if (!newDeliveryNote) {
          console.error("Error creating delivery note");
          continue;
        }

        console.log("Successfully created delivery note:", newDeliveryNote);
        
        // Create delivery note items based on purchase order items
        if (order.items && order.items.length > 0) {
          console.log(`Creating ${order.items.length} delivery note items`);
          
          for (const item of order.items) {
            const deliveryItem = await db.insert('delivery_note_items', {
              delivery_note_id: newDeliveryNote.id,
              product_id: item.product_id,
              quantity_ordered: item.quantity,
              quantity_received: 0, // Initial value, to be updated when received
              unit_price: item.unit_price
            });
            
            if (!deliveryItem) {
              console.error(`Error creating delivery note item for product ${item.product_id}`);
            }
          }
          
          console.log("Successfully created delivery note items");
        }
      } else {
        console.log(`Delivery note already exists for order ${order.id}:`, existingDeliveryNote);
      }
    }
    
    console.log("Finished syncing approved purchase orders to delivery notes");
    return true;
  } catch (error) {
    console.error("Error in syncApprovedPurchaseOrders:", error);
    return false;
  }
}
