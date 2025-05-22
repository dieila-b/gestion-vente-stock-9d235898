
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

/**
 * Synchronise les bons de commande approuvés en créant des bons de livraison 
 * pour ceux qui n'en ont pas encore
 */
export async function syncApprovedPurchaseOrders() {
  try {
    console.log("Synchronizing approved purchase orders to delivery notes");
    
    // Récupérer tous les bons de commande approuvés avec une implémentation robuste
    const { data: approvedOrders, error: fetchError } = await supabase
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
    
    if (fetchError) {
      console.error("Error fetching approved purchase orders:", fetchError);
      toast.error("Erreur lors de la synchronisation des commandes approuvées");
      return false;
    }
    
    if (!approvedOrders || approvedOrders.length === 0) {
      console.log("No approved orders found");
      return false;
    }
    
    console.log(`Found ${approvedOrders?.length || 0} approved orders total`);
    
    // Récupérer tous les bons de livraison existants
    const { data: existingNotes, error: notesError } = await supabase
      .from('delivery_notes')
      .select('purchase_order_id');
      
    if (notesError) {
      console.error("Error fetching existing delivery notes:", notesError);
      toast.error("Erreur lors de la vérification des bons de livraison existants");
      return false;
    }
    
    // Filtrer pour ne garder que les commandes sans bon de livraison
    const ordersWithoutNotes = approvedOrders.filter(order => 
      !existingNotes?.some(note => note.purchase_order_id === order.id)
    );
    
    console.log(`Found ${ordersWithoutNotes?.length || 0} approved orders without delivery notes:`, ordersWithoutNotes);
    
    // Créer des bons de livraison pour chaque commande approuvée sans bon existant
    if (ordersWithoutNotes && ordersWithoutNotes.length > 0) {
      let createdCount = 0;
      
      for (const order of ordersWithoutNotes) {
        try {
          // Générer un numéro unique pour le bon de livraison avec date et composante aléatoire
          const date = new Date();
          const dateStr = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
          const randomId = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
          const deliveryNumber = `BL-${dateStr}-${randomId}`;
          
          console.log(`Creating delivery note for order ${order.id} with number ${deliveryNumber}`);
          console.log(`Order warehouse_id: ${order.warehouse_id || 'non défini'}`);
          
          const { data: newNote, error: createError } = await supabase
            .from('delivery_notes')
            .insert({
              purchase_order_id: order.id,
              supplier_id: order.supplier_id,
              delivery_number: deliveryNumber,
              status: 'pending',
              warehouse_id: order.warehouse_id,
              deleted: false,
              notes: `Bon de livraison créé automatiquement depuis la commande ${order.order_number || ''}`
            })
            .select();
            
          if (createError) {
            console.error(`Error creating delivery note for order ${order.id}:`, createError);
            continue;
          }
          
          if (!newNote || newNote.length === 0) {
            console.error(`Failed to create delivery note for order ${order.id}: No data returned`);
            continue;
          }
          
          const createdDeliveryNote = newNote[0];
          console.log(`Created delivery note for order ${order.id}:`, createdDeliveryNote);
          
          // Créer les articles du bon de livraison basés sur les articles de la commande
          if (order.items && order.items.length > 0 && createdDeliveryNote) {
            const itemsData = order.items.map((item: any) => ({
              id: uuidv4(), // Générer un ID unique pour chaque article
              delivery_note_id: createdDeliveryNote.id,
              product_id: item.product_id,
              quantity_ordered: item.quantity,
              quantity_received: 0,
              unit_price: item.unit_price
            }));
            
            const { error: itemsError } = await supabase
              .from('delivery_note_items')
              .insert(itemsData);
              
            if (itemsError) {
              console.error(`Error creating delivery note items for note ${createdDeliveryNote.id}:`, itemsError);
            } else {
              console.log(`Created ${itemsData.length} items for delivery note ${createdDeliveryNote.id}`);
              createdCount++;
            }
          } else {
            console.warn(`No items found for order ${order.id} or delivery note not created`);
          }
        } catch (innerError) {
          console.error(`Error processing order ${order.id}:`, innerError);
        }
      }
      
      if (createdCount > 0) {
        toast.success(`${createdCount} bon(s) de livraison créé(s) avec succès`);
      }
      return createdCount > 0;
    } else {
      console.log("No approved orders without delivery notes found");
    }
    
    return false;
  } catch (error: any) {
    console.error("Error in syncApprovedPurchaseOrders:", error);
    toast.error(`Erreur: ${error.message}`);
    return false;
  }
}
