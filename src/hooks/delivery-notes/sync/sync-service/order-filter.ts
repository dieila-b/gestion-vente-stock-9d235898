
import { toast } from "sonner";

/**
 * Validates if an order can have a delivery note created
 * @param order The purchase order to validate
 * @returns True if the order is valid for delivery note creation
 */
export function validateOrderForDeliveryNote(order: any): boolean {
  if (!order) {
    console.error("[validateOrderForDeliveryNote] No order provided");
    return false;
  }
  
  if (!order.id) {
    console.error("[validateOrderForDeliveryNote] Order missing ID");
    return false;
  }
  
  if (order.status !== 'approved') {
    console.error(`[validateOrderForDeliveryNote] Order ${order.id} status is ${order.status}, not approved`);
    return false;
  }
  
  if (!order.supplier_id) {
    console.error(`[validateOrderForDeliveryNote] Order ${order.id} missing supplier_id`);
    return false;
  }
  
  // Warehouse ID is now optional - some orders might not have one
  if (!order.warehouse_id) {
    console.warn(`[validateOrderForDeliveryNote] Order ${order.id} has no warehouse_id - this may be normal`);
  }
  
  return true;
}

/**
 * Filters purchase orders to find those without delivery notes
 * @param approvedOrders Array of approved purchase orders
 * @param existingNotes Array of existing delivery notes
 * @returns Array of orders that don't have delivery notes
 */
export function filterOrdersWithoutDeliveryNotes(approvedOrders: any[], existingNotes: any[]): any[] {
  if (!approvedOrders || approvedOrders.length === 0) {
    console.log("[filterOrdersWithoutDeliveryNotes] No approved orders to filter");
    return [];
  }
  
  if (!Array.isArray(existingNotes)) {
    console.log("[filterOrdersWithoutDeliveryNotes] No existing notes or invalid format, all orders are candidates");
    return approvedOrders.filter(validateOrderForDeliveryNote);
  }
  
  console.log(`[filterOrdersWithoutDeliveryNotes] Filtering ${approvedOrders.length} orders against ${existingNotes.length} existing notes`);
  
  const ordersWithoutNotes = approvedOrders.filter(order => {
    // First validate the order
    if (!validateOrderForDeliveryNote(order)) {
      return false;
    }
    
    // Check if a delivery note already exists for this order
    const hasDeliveryNote = existingNotes.some(note => {
      const matches = note.purchase_order_id === order.id && !note.deleted;
      if (matches) {
        console.log(`[filterOrdersWithoutDeliveryNotes] Order ${order.id} already has delivery note ${note.id}`);
      }
      return matches;
    });
    
    if (hasDeliveryNote) {
      console.log(`[filterOrdersWithoutDeliveryNotes] Skipping order ${order.id} - delivery note already exists`);
      return false;
    }
    
    console.log(`[filterOrdersWithoutDeliveryNotes] Order ${order.id} (${order.order_number}) is a candidate for delivery note creation`);
    return true;
  });
  
  console.log(`[filterOrdersWithoutDeliveryNotes] Found ${ordersWithoutNotes.length} orders without delivery notes`);
  return ordersWithoutNotes;
}
