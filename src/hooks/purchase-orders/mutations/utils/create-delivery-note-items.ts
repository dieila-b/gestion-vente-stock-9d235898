
import { supabase } from "@/integrations/supabase/client";

export async function createDeliveryNoteItems(deliveryNoteId: string, purchaseOrderId: string) {
  console.log("Creating delivery note items for:", { deliveryNoteId, purchaseOrderId });
  
  // Fetch purchase order items
  const { data: orderItems, error: itemsError } = await supabase
    .from('purchase_order_items')
    .select('*, product:product_id(*)')
    .eq('purchase_order_id', purchaseOrderId);
    
  if (itemsError) {
    console.error("Error fetching purchase order items:", itemsError);
    throw new Error(`Erreur lors de la récupération des articles: ${itemsError.message}`);
  }

  if (!orderItems || orderItems.length === 0) {
    console.log("No items found for purchase order:", purchaseOrderId);
    return [];
  }

  console.log(`Found ${orderItems.length} items to transfer to delivery note`);
  
  // Create delivery note items from purchase order items
  const deliveryItems = orderItems.map(item => ({
    delivery_note_id: deliveryNoteId,
    product_id: item.product_id,
    quantity_ordered: item.quantity,
    unit_price: item.unit_price,
    quantity_received: 0 // Initially 0 until received
  }));
  
  const { data: createdItems, error: insertError } = await supabase
    .from('delivery_note_items')
    .insert(deliveryItems)
    .select();
    
  if (insertError) {
    console.error("Error creating delivery note items:", insertError);
    throw new Error(`Erreur lors de la création des articles: ${insertError.message}`);
  }

  console.log("Successfully created delivery note items:", createdItems?.length);
  return createdItems;
}
