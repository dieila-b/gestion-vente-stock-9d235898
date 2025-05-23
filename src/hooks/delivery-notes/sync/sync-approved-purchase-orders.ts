
import { toast } from "sonner";
import { 
  fetchApprovedPurchaseOrders, 
  fetchExistingDeliveryNotes,
  filterOrdersWithoutDeliveryNotes 
} from "./utils/purchase-order-fetcher";
import {
  createDeliveryNote,
  createDeliveryNoteItems,
  markOrderHasDeliveryNote
} from "./utils/delivery-note-generator";

/**
 * Synchronizes approved purchase orders by creating delivery notes
 * for those that don't have them yet. If a specific order ID is provided,
 * it will attempt to create a delivery note specifically for that order.
 * 
 * @param specificOrderId Optional ID of a specific order to synchronize
 * @returns true if at least one delivery note was created, false otherwise
 */
export async function syncApprovedPurchaseOrders(specificOrderId?: string) {
  try {
    console.log(`[syncApprovedPurchaseOrders] Starting sync${specificOrderId ? ' for order: ' + specificOrderId : ''}`);
    
    // Step 1: Fetch all approved purchase orders
    const approvedOrders = await fetchApprovedPurchaseOrders(specificOrderId);
    if (approvedOrders.length === 0) {
      return false;
    }
    
    // Step 2: Fetch existing delivery notes
    const existingNotes = await fetchExistingDeliveryNotes();
    
    // Step 3: Filter for orders without delivery notes
    const ordersWithoutNotes = filterOrdersWithoutDeliveryNotes(approvedOrders, existingNotes);
    
    // Step 4: Process orders and create delivery notes
    if (ordersWithoutNotes && ordersWithoutNotes.length > 0) {
      let createdCount = 0;
      
      for (const order of ordersWithoutNotes) {
        try {
          console.log("[syncApprovedPurchaseOrders] Processing order:", order.id, order.order_number);
          
          // Skip orders without warehouse
          if (!order.warehouse_id) {
            console.warn(`[syncApprovedPurchaseOrders] Order ${order.id} has no warehouse_id, skipping.`);
            toast.warning(`La commande ${order.order_number} n'a pas d'entrepôt spécifié. Veuillez l'éditer.`);
            continue;
          }
          
          // Create the delivery note
          const deliveryNoteId = await createDeliveryNote(order);
          if (!deliveryNoteId) {
            continue;
          }
          
          // Create delivery note items
          if (order.items && order.items.length > 0) {
            const itemsCreated = await createDeliveryNoteItems(deliveryNoteId, order.items);
            if (itemsCreated) {
              // Mark the order as having a delivery note
              const updated = await markOrderHasDeliveryNote(order.id);
              if (updated) {
                createdCount++;
              }
            }
          } else {
            console.warn(`[syncApprovedPurchaseOrders] No items found for order ${order.id}`);
          }
        } catch (innerError: any) {
          console.error(`[syncApprovedPurchaseOrders] Error processing order ${order.id}:`, innerError);
          toast.error(`Erreur lors du traitement de la commande ${order.order_number}: ${innerError.message || 'Erreur inconnue'}`);
        }
      }
      
      // Show summary toast based on results
      if (createdCount > 0) {
        console.log(`[syncApprovedPurchaseOrders] Created ${createdCount} delivery notes successfully`);
        toast.success(`${createdCount} bon(s) de livraison créé(s) avec succès`);
        return true;
      } else {
        console.warn("[syncApprovedPurchaseOrders] No delivery notes were created despite having orders without notes");
        if (specificOrderId) {
          toast.warning("Impossible de créer un bon de livraison pour cette commande");
        }
      }
    } else {
      console.log("[syncApprovedPurchaseOrders] No approved orders without delivery notes found");
      if (specificOrderId) {
        toast.info("Un bon de livraison existe déjà pour cette commande");
      }
    }
    
    return false;
  } catch (error: any) {
    console.error("[syncApprovedPurchaseOrders] Error:", error);
    toast.error(`Erreur de synchronisation: ${error.message || 'Erreur inconnue'}`);
    return false;
  }
}
