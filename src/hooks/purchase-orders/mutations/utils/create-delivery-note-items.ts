
import { supabase } from "@/integrations/supabase/client";

export async function createDeliveryNoteItems(deliveryNoteId: string, purchaseOrderId: string) {
  console.log(`Creating delivery note items for note: ${deliveryNoteId}, order: ${purchaseOrderId}`);
  
  try {
    // 1. Get purchase order items
    const { data: orderItems, error: itemsError } = await supabase
      .from('purchase_order_items')
      .select('*')
      .eq('purchase_order_id', purchaseOrderId);
    
    if (itemsError) {
      console.error("Error fetching purchase order items:", itemsError);
      throw new Error(`Erreur lors de la récupération des articles: ${itemsError.message}`);
    }
    
    if (!orderItems || orderItems.length === 0) {
      console.warn("No purchase order items found for order:", purchaseOrderId);
      return [];
    }
    
    console.log(`Found ${orderItems.length} items to add to delivery note`);
    
    // 2. Create delivery note items
    const deliveryItems = orderItems.map(item => ({
      delivery_note_id: deliveryNoteId,
      product_id: item.product_id,
      quantity_ordered: item.quantity,
      quantity_received: 0, // Initially zero, to be updated when the delivery is received
      unit_price: item.unit_price
    }));
    
    // 3. Insert the items into the database
    const { data: insertedItems, error: insertError } = await supabase
      .from('delivery_note_items')
      .insert(deliveryItems)
      .select();
    
    if (insertError) {
      console.error("Error inserting delivery note items:", insertError);
      throw new Error(`Erreur lors de l'ajout des articles au bon de livraison: ${insertError.message}`);
    }
    
    console.log(`Successfully created ${insertedItems?.length || 0} delivery note items`);
    return insertedItems;
  } catch (error: any) {
    console.error("Error in createDeliveryNoteItems:", error);
    throw error;
  }
}
