
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { db } from "@/utils/db-core";

/**
 * Synchronise les bons de commande approuvés en créant des bons de livraison 
 * pour ceux qui n'en ont pas encore. Si un ID est fourni, tente de créer spécifiquement
 * pour cet ID.
 * 
 * @param specificOrderId ID optionnel d'une commande spécifique à synchroniser
 * @returns true si au moins un bon de livraison a été créé, false sinon
 */
export async function syncApprovedPurchaseOrders(specificOrderId?: string) {
  try {
    console.log(`[syncApprovedPurchaseOrders] Starting sync${specificOrderId ? ' for order: ' + specificOrderId : ''}`);
    
    // Construction de la requête de base
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
    
    // Si un ID spécifique est fourni, filtrer pour cet ID
    if (specificOrderId) {
      query = query.eq('id', specificOrderId);
    }
    
    // Récupérer tous les bons de commande approuvés
    const { data: approvedOrders, error: fetchError } = await query;
    
    if (fetchError) {
      console.error("[syncApprovedPurchaseOrders] Error fetching approved orders:", fetchError);
      toast.error("Erreur lors de la récupération des commandes approuvées");
      return false;
    }
    
    if (!approvedOrders || approvedOrders.length === 0) {
      console.log("[syncApprovedPurchaseOrders] No approved orders found");
      return false;
    }
    
    console.log(`[syncApprovedPurchaseOrders] Found ${approvedOrders?.length || 0} approved orders:`, 
      approvedOrders.map(o => ({ id: o.id, order_number: o.order_number, warehouse_id: o.warehouse_id })));
    
    // Récupérer tous les bons de livraison existants
    const { data: existingNotes, error: notesError } = await supabase
      .from('delivery_notes')
      .select('purchase_order_id');
      
    if (notesError) {
      console.error("[syncApprovedPurchaseOrders] Error fetching existing delivery notes:", notesError);
      toast.error("Erreur lors de la vérification des bons de livraison existants");
      return false;
    }
    
    // Filtrer pour ne garder que les commandes sans bon de livraison
    const ordersWithoutNotes = approvedOrders.filter(order => 
      !existingNotes?.some(note => note.purchase_order_id === order.id)
    );
    
    console.log(`[syncApprovedPurchaseOrders] Found ${ordersWithoutNotes?.length || 0} approved orders without delivery notes:`, 
      ordersWithoutNotes.map(o => ({ id: o.id, order_number: o.order_number })));
    
    // Créer des bons de livraison pour chaque commande approuvée sans bon existant
    if (ordersWithoutNotes && ordersWithoutNotes.length > 0) {
      let createdCount = 0;
      
      for (const order of ordersWithoutNotes) {
        try {
          console.log("[syncApprovedPurchaseOrders] Processing order:", order.id, order.order_number);
          
          // Vérifier que warehouse_id est bien présent
          if (!order.warehouse_id) {
            console.warn(`[syncApprovedPurchaseOrders] Order ${order.id} has no warehouse_id, skipping.`);
            toast.warning(`La commande ${order.order_number} n'a pas d'entrepôt spécifié. Veuillez l'éditer.`);
            continue;
          }
          
          // Générer un numéro unique pour le bon de livraison avec date et composante aléatoire
          const date = new Date();
          const dateStr = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
          const randomId = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
          const deliveryNumber = `BL-${dateStr}-${randomId}`;
          
          console.log(`[syncApprovedPurchaseOrders] Creating delivery note for order ${order.id} with number ${deliveryNumber}`);
          console.log(`[syncApprovedPurchaseOrders] Order warehouse_id: ${order.warehouse_id}`);
          
          const deliveryNoteData = {
            id: uuidv4(), // Générer un ID explicite
            purchase_order_id: order.id,
            supplier_id: order.supplier_id,
            delivery_number: deliveryNumber,
            status: 'pending',
            warehouse_id: order.warehouse_id,
            deleted: false,
            notes: `Bon de livraison créé automatiquement depuis la commande ${order.order_number || ''}`
          };
          
          console.log("[syncApprovedPurchaseOrders] Inserting delivery note with data:", deliveryNoteData);
          
          // Utiliser l'API db plus fiable pour l'insertion
          const newNote = await db.insert('delivery_notes', deliveryNoteData);
            
          if (!newNote) {
            console.error(`[syncApprovedPurchaseOrders] Failed to create delivery note for order ${order.id}: No data returned`);
            continue;
          }
          
          console.log(`[syncApprovedPurchaseOrders] Created delivery note for order ${order.id}:`, newNote);
          
          // Créer les articles du bon de livraison basés sur les articles de la commande
          if (order.items && order.items.length > 0 && newNote) {
            const itemsData = order.items.map((item: any) => ({
              id: uuidv4(), // Générer un ID explicite pour chaque article
              delivery_note_id: newNote.id,
              product_id: item.product_id,
              quantity_ordered: item.quantity,
              quantity_received: 0,
              unit_price: item.unit_price
            }));
            
            console.log(`[syncApprovedPurchaseOrders] Creating ${itemsData.length} items for delivery note ${newNote.id}`);
            
            // Utiliser l'API db plus fiable pour l'insertion des articles
            const insertPromises = itemsData.map(item => db.insert('delivery_note_items', item));
            const insertResults = await Promise.all(insertPromises);
              
            if (insertResults.some(result => !result)) {
              console.error(`[syncApprovedPurchaseOrders] Some items failed to insert for note ${newNote.id}`);
            } else {
              console.log(`[syncApprovedPurchaseOrders] Created ${itemsData.length} items for delivery note ${newNote.id}`);
              createdCount++;
            }
          } else {
            console.warn(`[syncApprovedPurchaseOrders] No items found for order ${order.id} or delivery note not created`);
          }
        } catch (innerError: any) {
          console.error(`[syncApprovedPurchaseOrders] Error processing order ${order.id}:`, innerError);
          toast.error(`Erreur lors du traitement de la commande ${order.order_number}: ${innerError.message || 'Erreur inconnue'}`);
        }
      }
      
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
