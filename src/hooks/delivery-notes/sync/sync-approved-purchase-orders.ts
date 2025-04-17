
import { supabase } from "@/integrations/supabase/client";

/**
 * Synchronizes approved purchase orders with delivery notes
 * Creates delivery notes for approved purchase orders that don't have one yet
 */
export async function syncApprovedPurchaseOrders() {
  try {
    console.log("Syncing approved purchase orders to create delivery notes...");
    
    // Fetch approved purchase orders
    const { data: approvedOrders, error: fetchError } = await supabase
      .from('purchase_orders')
      .select(`
        id,
        supplier_id,
        order_number,
        status,
        items:purchase_order_items(*)
      `)
      .eq('status', 'approved')
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.error("Error fetching approved purchase orders:", fetchError);
      return;
    }

    console.log("Found approved purchase orders:", approvedOrders);

    if (!approvedOrders || approvedOrders.length === 0) {
      console.log("No approved purchase orders found");
      return;
    }

    // Pour chaque commande approuvée, vérifier si un bon de livraison existe déjà
    for (const order of approvedOrders) {
      const { data: existingDeliveryNote, error: checkError } = await supabase
        .from('delivery_notes')
        .select('id')
        .eq('purchase_order_id', order.id)
        .maybeSingle();

      if (checkError) {
        console.error(`Error checking for delivery note for order ${order.id}:`, checkError);
        continue;
      }

      // Si aucun bon de livraison n'existe pour cette commande, en créer un
      if (!existingDeliveryNote) {
        console.log(`Creating delivery note for purchase order ${order.id}`);
        
        // Générer un numéro de bon de livraison unique
        const deliveryNumber = `BL-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
        
        // Créer le bon de livraison
        const { data: newDeliveryNote, error: createError } = await supabase
          .from('delivery_notes')
          .insert({
            purchase_order_id: order.id,
            supplier_id: order.supplier_id,
            delivery_number: deliveryNumber,
            status: 'pending',
            deleted: false,
            notes: `Bon de livraison créé automatiquement depuis la commande ${order.order_number || ''}`
          })
          .select()
          .single();

        if (createError) {
          console.error("Error creating delivery note:", createError);
          // Si l'erreur est liée à RLS, ajoutez plus de logs pour debug
          if (createError.code === '42501') {
            console.error("RLS policy violation. This is likely a permission issue.");
            // Continuer avec les autres commandes
          }
          continue;
        }

        if (newDeliveryNote) {
          console.log("Successfully created delivery note:", newDeliveryNote);
          
          // Puis créer les éléments du bon de livraison basés sur les articles du bon de commande
          if (order.items && order.items.length > 0) {
            const deliveryItemsData = order.items.map((item: any) => ({
              delivery_note_id: newDeliveryNote.id,
              product_id: item.product_id,
              quantity_ordered: item.quantity,
              quantity_received: 0, // Valeur initiale, à mettre à jour lors de la réception
              unit_price: item.unit_price
            }));

            const { error: itemsError } = await supabase
              .from('delivery_note_items')
              .insert(deliveryItemsData);

            if (itemsError) {
              console.error("Error creating delivery note items:", itemsError);
            } else {
              console.log("Successfully created delivery note items");
            }
          }
        }
      } else {
        console.log(`Delivery note already exists for order ${order.id}:`, existingDeliveryNote);
      }
    }
  } catch (error) {
    console.error("Error in syncApprovedPurchaseOrders:", error);
  }
}
