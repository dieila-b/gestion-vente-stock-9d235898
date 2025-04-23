
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Synchronizes approved purchase orders by creating delivery notes for them
 * if they don't already exist
 */
export async function syncApprovedPurchaseOrders() {
  try {
    console.log("Synchronizing approved purchase orders to delivery notes");
    
    // Get all approved purchase orders that don't have delivery notes yet
    const { data: approvedOrders, error: fetchError } = await supabase
      .from('purchase_orders')
      .select(`
        id,
        supplier_id,
        order_number,
        status,
        items:purchase_order_items(*)
      `)
      .eq('status', 'approved')
      .not('id', 'in', 
        supabase
          .from('delivery_notes')
          .select('purchase_order_id')
      );
    
    if (fetchError) {
      console.error("Error fetching approved purchase orders:", fetchError);
      toast.error("Erreur lors de la synchronisation des commandes approuvées");
      return false;
    }
    
    console.log(`Found ${approvedOrders?.length || 0} approved orders without delivery notes:`, approvedOrders);
    
    // Create delivery notes for each approved order
    if (approvedOrders && approvedOrders.length > 0) {
      for (const order of approvedOrders) {
        try {
          const deliveryNumber = `BL-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
          
          console.log(`Creating delivery note for order ${order.id} with number ${deliveryNumber}`);
          
          const { data: newNote, error: createError } = await supabase
            .from('delivery_notes')
            .insert({
              purchase_order_id: order.id,
              supplier_id: order.supplier_id,
              delivery_number: deliveryNumber,
              status: 'pending',
              deleted: false,
              notes: `Bon de livraison créé automatiquement depuis la commande ${order.order_number || ''}`
            })
            .select()
            .single();
            
          if (createError) {
            console.error(`Error creating delivery note for order ${order.id}:`, createError);
            continue;
          }
          
          console.log(`Created delivery note for order ${order.id}:`, newNote);
          
          // Create delivery note items based on purchase order items
          if (order.items && order.items.length > 0 && newNote) {
            const itemsData = order.items.map((item: any) => ({
              delivery_note_id: newNote.id,
              product_id: item.product_id,
              quantity_ordered: item.quantity,
              quantity_received: 0,
              unit_price: item.unit_price
            }));
            
            const { error: itemsError } = await supabase
              .from('delivery_note_items')
              .insert(itemsData);
              
            if (itemsError) {
              console.error(`Error creating delivery note items for note ${newNote.id}:`, itemsError);
            } else {
              console.log(`Created ${itemsData.length} items for delivery note ${newNote.id}`);
            }
          } else {
            console.warn(`No items found for order ${order.id} or delivery note not created`);
          }
        } catch (innerError) {
          console.error(`Error processing order ${order.id}:`, innerError);
        }
      }
      
      toast.success(`${approvedOrders.length} bon(s) de livraison créé(s) avec succès`);
      return true;
    } else {
      console.log("No approved orders without delivery notes found");
    }
    
    return false;
  } catch (error: any) {
    console.error("Error in syncApprovedPurchaseOrders:", error);
    toast.error(`Erreur: ${error.message}`);
    return false;
  }
}
