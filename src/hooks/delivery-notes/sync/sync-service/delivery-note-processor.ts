
import { toast } from "sonner";
import { createDeliveryNote, createDeliveryNoteItems, markOrderHasDeliveryNote } from "../utils/delivery-note-generator";
import { validateOrderForDeliveryNote } from "./order-filter";

/**
 * Process a single order to create a delivery note
 * @param order The purchase order to process
 * @returns True if delivery note was created successfully, false otherwise
 */
export async function processOrderForDeliveryNote(order: any): Promise<boolean> {
  try {
    console.log("[processOrderForDeliveryNote] Processing order:", order.id, order.order_number);
    console.log("[processOrderForDeliveryNote] Order items count:", order.items?.length || 0);
    
    // Validate the order first
    if (!validateOrderForDeliveryNote(order)) {
      return false;
    }
    
    // Ensure the order has items
    if (!order.items || order.items.length === 0) {
      console.error(`[processOrderForDeliveryNote] Order ${order.order_number} has no items, cannot create delivery note`);
      toast.error(`Impossible de créer un bon de livraison pour la commande ${order.order_number} : aucun article trouvé`);
      return false;
    }
    
    // Create the delivery note
    const deliveryNoteId = await createDeliveryNote(order);
    if (!deliveryNoteId) {
      return false;
    }
    
    // Create delivery note items with proper error handling
    const itemsCreated = await createDeliveryNoteItems(deliveryNoteId, order.items);
    if (!itemsCreated) {
      console.error(`[processOrderForDeliveryNote] Failed to create items for delivery note ${deliveryNoteId}`);
      // Try to clean up the delivery note if items creation failed
      await cleanupFailedDeliveryNote(deliveryNoteId);
      return false;
    }
    
    // Mark the order as having a delivery note
    const updated = await markOrderHasDeliveryNote(order.id);
    
    if (updated) {
      console.log(`[processOrderForDeliveryNote] Successfully processed order ${order.order_number} with ${order.items.length} items`);
    }
    
    return updated;
    
  } catch (innerError: any) {
    console.error(`[processOrderForDeliveryNote] Error processing order ${order.id}:`, innerError);
    toast.error(`Erreur lors du traitement de la commande ${order.order_number}: ${innerError.message || 'Erreur inconnue'}`);
    return false;
  }
}

/**
 * Clean up a delivery note that failed during item creation
 * @param deliveryNoteId The ID of the delivery note to clean up
 */
async function cleanupFailedDeliveryNote(deliveryNoteId: string): Promise<void> {
  try {
    console.log(`[cleanupFailedDeliveryNote] Cleaning up delivery note ${deliveryNoteId}`);
    
    const { error } = await supabase
      .from('delivery_notes')
      .update({ deleted: true })
      .eq('id', deliveryNoteId);
    
    if (error) {
      console.error(`[cleanupFailedDeliveryNote] Error cleaning up delivery note:`, error);
    }
  } catch (error) {
    console.error(`[cleanupFailedDeliveryNote] Exception during cleanup:`, error);
  }
}

/**
 * Process multiple orders to create delivery notes
 * @param ordersWithoutNotes Array of orders without delivery notes
 * @returns The number of successfully created delivery notes
 */
export async function processMultipleOrdersForDeliveryNotes(ordersWithoutNotes: any[]): Promise<number> {
  let createdCount = 0;
  
  if (!ordersWithoutNotes || ordersWithoutNotes.length === 0) {
    return 0;
  }
  
  console.log(`[processMultipleOrdersForDeliveryNotes] Processing ${ordersWithoutNotes.length} orders`);
  
  for (const order of ordersWithoutNotes) {
    const success = await processOrderForDeliveryNote(order);
    if (success) {
      createdCount++;
    }
  }
  
  console.log(`[processMultipleOrdersForDeliveryNotes] Successfully created ${createdCount} delivery notes`);
  return createdCount;
}
