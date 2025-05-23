
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Fetches approved purchase orders that don't have delivery notes yet
 * @param specificOrderId Optional ID of a specific purchase order to fetch
 * @returns Array of purchase orders or empty array if none found
 */
export async function fetchApprovedPurchaseOrders(specificOrderId?: string) {
  try {
    console.log(`[fetchApprovedPurchaseOrders] Starting fetch${specificOrderId ? ' for order: ' + specificOrderId : ''}`);
    
    // Build the base query
    let query = supabase
      .from('purchase_orders')
      .select(`
        id,
        supplier_id,
        order_number,
        status,
        warehouse_id,
        items:purchase_order_items(*)
      `)
      .eq('status', 'approved');
    
    // Filter by ID if specified
    if (specificOrderId) {
      query = query.eq('id', specificOrderId);
    }
    
    // Execute the query
    const { data: approvedOrders, error: fetchError } = await query;
    
    if (fetchError) {
      console.error("[fetchApprovedPurchaseOrders] Error fetching approved orders:", fetchError);
      toast.error("Erreur lors de la récupération des commandes approuvées");
      return [];
    }
    
    if (!approvedOrders || approvedOrders.length === 0) {
      console.log("[fetchApprovedPurchaseOrders] No approved orders found");
      return [];
    }
    
    console.log(`[fetchApprovedPurchaseOrders] Found ${approvedOrders?.length || 0} approved orders:`, 
      approvedOrders.map(o => ({ id: o.id, order_number: o.order_number, warehouse_id: o.warehouse_id })));
    
    return approvedOrders;
  } catch (error: any) {
    console.error("[fetchApprovedPurchaseOrders] Error:", error);
    toast.error(`Erreur lors de la récupération des commandes: ${error.message || 'Erreur inconnue'}`);
    return [];
  }
}

/**
 * Fetches existing delivery notes to check which purchase orders already have them
 * @returns Array of delivery note records with purchase order IDs
 */
export async function fetchExistingDeliveryNotes() {
  try {
    const { data, error } = await supabase
      .from('delivery_notes')
      .select('purchase_order_id');
      
    if (error) {
      console.error("[fetchExistingDeliveryNotes] Error fetching existing delivery notes:", error);
      toast.error("Erreur lors de la vérification des bons de livraison existants");
      return [];
    }
    
    return data || [];
  } catch (error: any) {
    console.error("[fetchExistingDeliveryNotes] Error:", error);
    toast.error(`Erreur lors de la vérification des bons de livraison: ${error.message || 'Erreur inconnue'}`);
    return [];
  }
}

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
