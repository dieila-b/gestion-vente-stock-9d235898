
import { supabase } from "@/integrations/supabase/client";

/**
 * Fetches approved purchase orders from the database with their items
 * @param specificOrderId Optional ID to fetch a specific order
 * @returns Array of approved purchase orders with items
 */
export async function fetchApprovedPurchaseOrders(specificOrderId?: string) {
  try {
    console.log(`[fetchApprovedPurchaseOrders] Fetching${specificOrderId ? ' specific order: ' + specificOrderId : ' all approved orders'}`);
    
    let query = supabase
      .from('purchase_orders')
      .select(`
        id,
        order_number,
        supplier_id,
        warehouse_id,
        status,
        delivery_note_created,
        created_at,
        items:purchase_order_items(
          id,
          product_id,
          quantity,
          unit_price,
          product:catalog(
            id,
            name,
            reference
          )
        )
      `)
      .eq('status', 'approved');
    
    if (specificOrderId) {
      query = query.eq('id', specificOrderId);
    }
    
    const { data: orders, error } = await query.order('created_at', { ascending: false });
    
    if (error) {
      console.error("[fetchApprovedPurchaseOrders] Error fetching orders:", error);
      throw error;
    }
    
    console.log(`[fetchApprovedPurchaseOrders] Found ${orders?.length || 0} approved orders`);
    
    // Log details about items for debugging
    orders?.forEach(order => {
      console.log(`[fetchApprovedPurchaseOrders] Order ${order.order_number} has ${order.items?.length || 0} items`);
      if (order.items && order.items.length > 0) {
        order.items.forEach((item: any, index: number) => {
          console.log(`  Item ${index + 1}: product_id=${item.product_id}, quantity=${item.quantity}, unit_price=${item.unit_price}`);
        });
      }
    });
    
    return orders || [];
  } catch (error: any) {
    console.error("[fetchApprovedPurchaseOrders] Error:", error);
    throw error;
  }
}

/**
 * Fetches existing delivery notes to check for duplicates
 * @returns Array of existing delivery notes with purchase order IDs
 */
export async function fetchExistingDeliveryNotes() {
  try {
    console.log("[fetchExistingDeliveryNotes] Fetching existing delivery notes");
    
    const { data: existingNotes, error } = await supabase
      .from('delivery_notes')
      .select('id, purchase_order_id, delivery_number')
      .eq('deleted', false);
    
    if (error) {
      console.error("[fetchExistingDeliveryNotes] Error:", error);
      throw error;
    }
    
    console.log(`[fetchExistingDeliveryNotes] Found ${existingNotes?.length || 0} existing delivery notes`);
    return existingNotes || [];
  } catch (error: any) {
    console.error("[fetchExistingDeliveryNotes] Error:", error);
    throw error;
  }
}
