
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

/**
 * Generates a unique delivery note number with date and random component
 * @returns A formatted delivery note number (BL-YYYYMMDD-XXX)
 */
export function generateDeliveryNoteNumber(): string {
  const date = new Date();
  const dateStr = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
  const randomId = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `BL-${dateStr}-${randomId}`;
}

/**
 * Creates a delivery note for a specific purchase order
 * @param order The purchase order to create a delivery note for
 * @returns The created delivery note ID or null if creation failed
 */
export async function createDeliveryNote(order: {
  id: string;
  supplier_id?: string;
  warehouse_id?: string;
  order_number?: string;
  items?: any[];
}): Promise<string | null> {
  try {
    if (!order.warehouse_id) {
      console.warn(`[createDeliveryNote] Order ${order.id} has no warehouse_id, cannot create delivery note.`);
      return null;
    }
    
    // Generate a unique delivery number
    const deliveryNumber = generateDeliveryNoteNumber();
    
    console.log(`[createDeliveryNote] Creating delivery note for order ${order.id} with number ${deliveryNumber}`);
    console.log(`[createDeliveryNote] Order warehouse_id: ${order.warehouse_id}`);
    
    // Create a delivery note with a new UUID
    const deliveryNoteId = uuidv4();
    
    // Insert the delivery note record
    const { data: newNote, error: insertError } = await supabase
      .from('delivery_notes')
      .insert({
        id: deliveryNoteId,
        purchase_order_id: order.id,
        supplier_id: order.supplier_id,
        delivery_number: deliveryNumber,
        status: 'pending',
        warehouse_id: order.warehouse_id,
        deleted: false,
        notes: `Bon de livraison créé automatiquement depuis la commande ${order.order_number || ''}`
      })
      .select()
      .single();
    
    if (insertError || !newNote) {
      console.error(`[createDeliveryNote] Failed to create delivery note for order ${order.id}:`, insertError);
      return null;
    }
    
    console.log(`[createDeliveryNote] Created delivery note for order ${order.id}:`, newNote);
    return deliveryNoteId;
  } catch (error: any) {
    console.error(`[createDeliveryNote] Error creating delivery note for order ${order.id}:`, error);
    return null;
  }
}

/**
 * Creates items for a delivery note based on purchase order items
 * @param deliveryNoteId The ID of the delivery note
 * @param orderItems The items from the purchase order
 * @returns True if items were created successfully, false otherwise
 */
export async function createDeliveryNoteItems(deliveryNoteId: string, orderItems: any[]): Promise<boolean> {
  try {
    if (!orderItems || orderItems.length === 0) {
      console.warn(`[createDeliveryNoteItems] No items provided for delivery note ${deliveryNoteId}`);
      return false;
    }
    
    const itemsData = orderItems.map((item: any) => ({
      id: uuidv4(),
      delivery_note_id: deliveryNoteId,
      product_id: item.product_id,
      quantity_ordered: item.quantity,
      quantity_received: 0,
      unit_price: item.unit_price
    }));
    
    console.log(`[createDeliveryNoteItems] Creating ${itemsData.length} items for delivery note ${deliveryNoteId}`);
    
    // Insert the items
    const { error: itemsError } = await supabase
      .from('delivery_note_items')
      .insert(itemsData);
    
    if (itemsError) {
      console.error(`[createDeliveryNoteItems] Error creating items for note ${deliveryNoteId}:`, itemsError);
      return false;
    }
    
    console.log(`[createDeliveryNoteItems] Created ${itemsData.length} items for delivery note ${deliveryNoteId}`);
    return true;
  } catch (error: any) {
    console.error(`[createDeliveryNoteItems] Error creating items:`, error);
    return false;
  }
}

/**
 * Updates the delivery_note_created flag on a purchase order
 * @param orderId The ID of the purchase order
 * @returns True if the update was successful, false otherwise
 */
export async function markOrderHasDeliveryNote(orderId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('purchase_orders')
      .update({ delivery_note_created: true })
      .eq('id', orderId);
    
    if (error) {
      console.error(`[markOrderHasDeliveryNote] Error updating flag:`, error);
      return false;
    }
    
    console.log(`[markOrderHasDeliveryNote] Updated delivery_note_created flag for order ${orderId}`);
    return true;
  } catch (error) {
    console.error(`[markOrderHasDeliveryNote] Exception:`, error);
    return false;
  }
}
