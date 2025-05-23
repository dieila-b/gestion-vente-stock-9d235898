
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

/**
 * Creates a delivery note directly from a purchase order
 * @param orderId Purchase order ID
 * @returns True if successful, false otherwise
 */
export async function createDeliveryNoteDirectly(orderId: string): Promise<boolean> {
  try {
    console.log("[createDeliveryNoteDirectly] Creating delivery note directly for order:", orderId);
    
    // Retrieve necessary order details
    const { data: orderDetails, error: detailsError } = await supabase
      .from('purchase_orders')
      .select(`
        id,
        supplier_id,
        order_number,
        warehouse_id,
        items:purchase_order_items(*)
      `)
      .eq('id', orderId)
      .single();
      
    if (detailsError || !orderDetails) {
      throw new Error(`Impossible de récupérer les détails de la commande: ${detailsError?.message || "Aucune donnée"}`);
    }
    
    // Check if a delivery note already exists
    const { data: existingNote } = await supabase
      .from('delivery_notes')
      .select('id')
      .eq('purchase_order_id', orderId)
      .maybeSingle();
    
    if (existingNote) {
      console.log("[createDeliveryNoteDirectly] Delivery note already exists:", existingNote.id);
      toast.info("Un bon de livraison existe déjà pour cette commande");
      return false;
    }
    
    // Generate a delivery note number
    const date = new Date();
    const dateStr = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
    const randomId = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const deliveryNumber = `BL-${dateStr}-${randomId}`;
    
    // Create the delivery note
    const deliveryNoteId = uuidv4();
    const { data: newNote, error: insertError } = await supabase
      .from('delivery_notes')
      .insert({
        id: deliveryNoteId,
        purchase_order_id: orderId,
        supplier_id: orderDetails.supplier_id,
        delivery_number: deliveryNumber,
        status: 'pending',
        warehouse_id: orderDetails.warehouse_id,
        deleted: false,
        notes: `Bon de livraison créé directement depuis la commande ${orderDetails.order_number || ''}`
      })
      .select()
      .single();
      
    if (insertError || !newNote) {
      throw new Error(`Erreur lors de la création du bon de livraison: ${insertError?.message || "Échec de l'insertion"}`);
    }
    
    console.log("[createDeliveryNoteDirectly] Created delivery note:", newNote);
    
    // Create the items
    if (orderDetails.items && orderDetails.items.length > 0) {
      const itemsData = orderDetails.items.map((item: any) => ({
        id: uuidv4(),
        delivery_note_id: deliveryNoteId,
        product_id: item.product_id,
        quantity_ordered: item.quantity,
        quantity_received: 0,
        unit_price: item.unit_price
      }));
      
      const { error: itemsError } = await supabase
        .from('delivery_note_items')
        .insert(itemsData);
        
      if (itemsError) {
        console.error("[createDeliveryNoteDirectly] Error creating items:", itemsError);
        toast.error(`Erreur lors de la création des articles: ${itemsError.message}`);
        return false;
      } else {
        console.log(`[createDeliveryNoteDirectly] Created ${itemsData.length} items`);
        
        // Update the flag on the purchase order
        await supabase
          .from('purchase_orders')
          .update({ delivery_note_created: true })
          .eq('id', orderId);
          
        toast.success("Bon de livraison créé avec succès");
        return true;
      }
    } else {
      console.warn("[createDeliveryNoteDirectly] No items found for order");
      toast.warning("Aucun article trouvé dans la commande");
      return false;
    }
  } catch (error: any) {
    console.error("[createDeliveryNoteDirectly] Error:", error);
    toast.error(`Échec de la création: ${error.message}`);
    return false;
  }
}

/**
 * Checks if a delivery note exists for a purchase order
 * @param orderId Purchase order ID
 * @returns True if exists, false otherwise
 */
export async function checkDeliveryNoteExists(orderId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('delivery_notes')
      .select('id')
      .eq('purchase_order_id', orderId)
      .maybeSingle();
    
    if (error) {
      console.error("[checkDeliveryNoteExists] Error checking delivery note:", error);
      return false;
    }
    
    return !!data;
  } catch (error) {
    console.error("[checkDeliveryNoteExists] Unexpected error:", error);
    return false;
  }
}
