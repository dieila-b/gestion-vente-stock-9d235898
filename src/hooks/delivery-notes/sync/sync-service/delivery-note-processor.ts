
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
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
    
    // Load order items if not already loaded
    let orderItems = order.items || [];
    if (!orderItems || orderItems.length === 0) {
      console.log("[processOrderForDeliveryNote] Loading items for order:", order.id);
      
      const { data: items, error: itemsError } = await supabase
        .from('purchase_order_items')
        .select('*')
        .eq('purchase_order_id', order.id);
      
      if (itemsError) {
        console.error(`[processOrderForDeliveryNote] Error loading items for order ${order.id}:`, itemsError);
        toast.error(`Erreur lors du chargement des articles pour la commande ${order.order_number}`);
        return false;
      }
      
      orderItems = items || [];
      console.log(`[processOrderForDeliveryNote] Loaded ${orderItems.length} items for order ${order.order_number}`);
    }
    
    // Ensure the order has items
    if (!orderItems || orderItems.length === 0) {
      console.error(`[processOrderForDeliveryNote] Order ${order.order_number} has no items, cannot create delivery note`);
      toast.error(`Impossible de créer un bon de livraison pour la commande ${order.order_number} : aucun article trouvé`);
      return false;
    }
    
    console.log(`[processOrderForDeliveryNote] Order ${order.order_number} has ${orderItems.length} items`);
    
    // Create the delivery note
    const deliveryNoteId = await createDeliveryNote({
      ...order,
      items: orderItems
    });
    
    if (!deliveryNoteId) {
      return false;
    }
    
    // Create delivery note items with proper error handling
    const itemsCreated = await createDeliveryNoteItems(deliveryNoteId, orderItems);
    if (!itemsCreated) {
      console.error(`[processOrderForDeliveryNote] Failed to create items for delivery note ${deliveryNoteId}`);
      // Try to clean up the delivery note if items creation failed
      await cleanupFailedDeliveryNote(deliveryNoteId);
      return false;
    }
    
    // Mark the order as having a delivery note
    const updated = await markOrderHasDeliveryNote(order.id);
    
    if (updated) {
      console.log(`[processOrderForDeliveryNote] Successfully processed order ${order.order_number} with ${orderItems.length} items`);
      toast.success(`Bon de livraison créé pour la commande ${order.order_number} avec ${orderItems.length} articles`);
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
