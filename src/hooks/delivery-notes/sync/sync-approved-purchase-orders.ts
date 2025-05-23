
import { toast } from "sonner";
import { 
  fetchApprovedPurchaseOrders, 
  fetchExistingDeliveryNotes,
} from "./utils/purchase-order-fetcher";
import { filterOrdersWithoutDeliveryNotes } from "./sync-service/order-filter";
import { processMultipleOrdersForDeliveryNotes, processOrderForDeliveryNote } from "./sync-service/delivery-note-processor";

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
      // If we have a specific order ID, process just that one
      if (specificOrderId) {
        const order = ordersWithoutNotes.find(o => o.id === specificOrderId);
        if (order) {
          const success = await processOrderForDeliveryNote(order);
          if (success) {
            toast.success("Bon de livraison créé avec succès");
            return true;
          } else {
            toast.warning("Impossible de créer un bon de livraison pour cette commande");
            return false;
          }
        } else {
          console.log("[syncApprovedPurchaseOrders] Specific order not found or already has delivery note");
          toast.info("Un bon de livraison existe déjà pour cette commande");
          return false;
        }
      } else {
        // Process all orders without delivery notes
        const createdCount = await processMultipleOrdersForDeliveryNotes(ordersWithoutNotes);
        
        // Show summary toast based on results
        if (createdCount > 0) {
          console.log(`[syncApprovedPurchaseOrders] Created ${createdCount} delivery notes successfully`);
          toast.success(`${createdCount} bon(s) de livraison créé(s) avec succès`);
          return true;
        } else {
          console.warn("[syncApprovedPurchaseOrders] No delivery notes were created despite having orders without notes");
          return false;
        }
      }
    } else {
      console.log("[syncApprovedPurchaseOrders] No approved orders without delivery notes found");
      if (specificOrderId) {
        toast.info("Un bon de livraison existe déjà pour cette commande");
      }
      return false;
    }
  } catch (error: any) {
    console.error("[syncApprovedPurchaseOrders] Error:", error);
    toast.error(`Erreur de synchronisation: ${error.message || 'Erreur inconnue'}`);
    return false;
  }
}
