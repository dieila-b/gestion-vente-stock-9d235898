
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export async function syncApprovedPurchaseOrders() {
  try {
    console.log("Starting syncApprovedPurchaseOrders...");
    
    // Fetch approved purchase orders that don't have delivery notes
    const { data: purchaseOrders, error: fetchError } = await supabase
      .from("purchase_orders")
      .select("*")
      .eq("status", "approved")
      .is("delivery_note_created", null);
      
    if (fetchError) {
      console.error("Error fetching approved purchase orders:", fetchError);
      throw new Error(`Erreur lors de la récupération des commandes approuvées: ${fetchError.message}`);
    }
    
    console.log(`Found ${purchaseOrders?.length || 0} purchase orders to sync`);
    
    if (!purchaseOrders || purchaseOrders.length === 0) {
      console.log("No purchase orders to sync");
      return { synced: 0, message: "Aucune commande à synchroniser" };
    }
    
    // Create delivery notes for each purchase order
    let syncedCount = 0;
    
    for (const order of purchaseOrders) {
      try {
        console.log(`Processing purchase order: ${order.id}`);
        
        // Create delivery note
        const { data: deliveryNote, error: createError } = await supabase
          .from("delivery_notes")
          .insert({
            order_id: order.id,
            supplier_id: order.supplier_id,
            reference: `DL-${order.order_number || order.id.substring(0, 8)}`,
            status: "pending",
            expected_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
            notes: `Généré automatiquement à partir du bon de commande #${order.order_number || order.id.substring(0, 8)}`,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();
          
        if (createError) {
          console.error(`Error creating delivery note for order ${order.id}:`, createError);
          continue;
        }
        
        console.log(`Created delivery note: ${deliveryNote.id}`);
        
        // Get purchase order items
        const { data: orderItems, error: itemsError } = await supabase
          .from("purchase_order_items")
          .select("*")
          .eq("purchase_order_id", order.id);
          
        if (itemsError) {
          console.error(`Error fetching items for order ${order.id}:`, itemsError);
          continue;
        }
        
        console.log(`Found ${orderItems?.length || 0} items for purchase order ${order.id}`);
        
        // Create delivery note items
        if (orderItems && orderItems.length > 0) {
          const deliveryItems = orderItems.map(item => ({
            delivery_note_id: deliveryNote.id,
            product_id: item.product_id,
            ordered_quantity: item.quantity,
            expected_quantity: item.quantity,
            received_quantity: 0,
            notes: ""
          }));
          
          const { error: itemsCreateError } = await supabase
            .from("delivery_note_items")
            .insert(deliveryItems);
            
          if (itemsCreateError) {
            console.error(`Error creating delivery note items for order ${order.id}:`, itemsCreateError);
            continue;
          }
          
          console.log(`Created ${deliveryItems.length} delivery note items`);
        }
        
        // Update purchase order to mark delivery note as created
        const { error: updateError } = await supabase
          .from("purchase_orders")
          .update({ 
            delivery_note_created: true,
            updated_at: new Date().toISOString()
          })
          .eq("id", order.id);
          
        if (updateError) {
          console.error(`Error updating purchase order ${order.id}:`, updateError);
          continue;
        }
        
        console.log(`Updated purchase order ${order.id}`);
        
        syncedCount++;
      } catch (orderError: any) {
        console.error(`Error processing order ${order.id}:`, orderError);
      }
    }
    
    console.log(`Sync completed. Synced: ${syncedCount} orders`);
    
    if (syncedCount > 0) {
      toast.success(`${syncedCount} bon(s) de livraison créé(s) avec succès`);
    }
    
    return { synced: syncedCount, message: `${syncedCount} bon(s) de livraison créé(s)` };
  } catch (error: any) {
    console.error("Error in syncApprovedPurchaseOrders:", error);
    toast.error(`Erreur lors de la synchronisation: ${error.message || "Erreur inconnue"}`);
    return { synced: 0, error: error.message, message: "Erreur de synchronisation" };
  }
}
