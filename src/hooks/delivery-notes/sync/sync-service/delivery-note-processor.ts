
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
    
    // Validate the order first
    if (!validateOrderForDeliveryNote(order)) {
      return false;
    }
    
    // Create the delivery note
    const deliveryNoteId = await createDeliveryNote(order);
    if (!deliveryNoteId) {
      return false;
    }
    
    // Create delivery note items
    const itemsCreated = await createDeliveryNoteItems(deliveryNoteId, order.items);
    if (!itemsCreated) {
      return false;
    }
    
    // Mark the order as having a delivery note
    const updated = await markOrderHasDeliveryNote(order.id);
    return updated;
    
  } catch (innerError: any) {
    console.error(`[processOrderForDeliveryNote] Error processing order ${order.id}:`, innerError);
    toast.error(`Erreur lors du traitement de la commande ${order.order_number}: ${innerError.message || 'Erreur inconnue'}`);
    return false;
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
  
  for (const order of ordersWithoutNotes) {
    const success = await processOrderForDeliveryNote(order);
    if (success) {
      createdCount++;
    }
  }
  
  return createdCount;
}
