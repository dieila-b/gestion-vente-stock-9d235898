
import { supabase } from "@/integrations/supabase/client";

export async function createDeliveryNoteItems(deliveryNoteId: string, purchaseOrderId: string) {
  const { data: orderItems, error: itemsError } = await supabase
    .from('purchase_order_items')
    .select('*')
    .eq('purchase_order_id', purchaseOrderId);
    
  if (itemsError) {
    console.error("Error fetching purchase order items:", itemsError);
    throw new Error(`Erreur lors de la récupération des articles: ${itemsError.message}`);
  }

  if (!orderItems || orderItems.length === 0) {
    return [];
  }

  const deliveryItems = orderItems.map(item => ({
    delivery_note_id: deliveryNoteId,
    product_id: item.product_id,
    quantity_ordered: item.quantity,
    unit_price: item.unit_price,
    quantity_received: 0
  }));
  
  const { error: insertError } = await supabase
    .from('delivery_note_items')
    .insert(deliveryItems);
    
  if (insertError) {
    console.error("Error creating delivery note items:", insertError);
    throw new Error(`Erreur lors de la création des articles: ${insertError.message}`);
  }

  return deliveryItems;
}
