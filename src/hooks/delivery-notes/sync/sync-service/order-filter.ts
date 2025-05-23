
import { toast } from "sonner";

/**
 * Filters purchase orders to find those without delivery notes
 * @param approvedOrders Array of approved purchase orders
 * @param existingNotes Array of existing delivery notes
 * @returns Array of purchase orders that don't have delivery notes yet
 */
export function filterOrdersWithoutDeliveryNotes(approvedOrders: any[], existingNotes: any[]) {
  const ordersWithoutNotes = approvedOrders.filter(order => 
    !existingNotes?.some(note => note.purchase_order_id === order.id)
  );
  
  console.log(`[filterOrdersWithoutDeliveryNotes] Found ${ordersWithoutNotes?.length || 0} approved orders without delivery notes:`, 
    ordersWithoutNotes.map(o => ({ id: o.id, order_number: o.order_number })));
  
  return ordersWithoutNotes;
}

/**
 * Validates if an order is eligible for delivery note creation
 * @param order The purchase order to validate
 * @returns True if the order is valid, false otherwise
 */
export function validateOrderForDeliveryNote(order: any): boolean {
  if (!order.warehouse_id) {
    console.warn(`[validateOrderForDeliveryNote] Order ${order.id} has no warehouse_id, skipping.`);
    toast.warning(`La commande ${order.order_number} n'a pas d'entrepôt spécifié. Veuillez l'éditer.`);
    return false;
  }
  
  if (!order.items || order.items.length === 0) {
    console.warn(`[validateOrderForDeliveryNote] No items found for order ${order.id}`);
    return false;
  }
  
  return true;
}
