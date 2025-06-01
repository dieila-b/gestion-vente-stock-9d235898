
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Generates a unique delivery note number with format BL-YYYY-MM-DD-XXX
 * @returns A formatted delivery note number
 */
async function generateDeliveryNoteNumber(): Promise<string> {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const datePrefix = `${year}-${month}-${day}`;
  
  try {
    // Get today's delivery notes count to determine the next counter
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    
    const { data: todayNotes, error } = await supabase
      .from('delivery_notes')
      .select('delivery_number')
      .gte('created_at', startOfDay.toISOString())
      .lt('created_at', endOfDay.toISOString())
      .like('delivery_number', `BL-${datePrefix}-%`)
      .order('delivery_number', { ascending: false });
    
    if (error) {
      console.error('Error fetching today delivery notes:', error);
      // Fallback to random number if query fails
      const randomCounter = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      return `BL-${datePrefix}-${randomCounter}`;
    }
    
    // Extract the highest counter from today's delivery notes
    let nextCounter = 1;
    if (todayNotes && todayNotes.length > 0) {
      for (const note of todayNotes) {
        if (note.delivery_number) {
          const counterMatch = note.delivery_number.match(/BL-\d{4}-\d{2}-\d{2}-(\d{3})$/);
          if (counterMatch) {
            const counter = parseInt(counterMatch[1], 10);
            if (counter >= nextCounter) {
              nextCounter = counter + 1;
            }
          }
        }
      }
    }
    
    const counterStr = nextCounter.toString().padStart(3, '0');
    return `BL-${datePrefix}-${counterStr}`;
    
  } catch (error) {
    console.error('Error generating delivery note number:', error);
    // Fallback to random number
    const randomCounter = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `BL-${datePrefix}-${randomCounter}`;
  }
}

export function useDeliveryNoteCreation() {
  const queryClient = useQueryClient();

  const createDeliveryNoteFromPO = async (purchaseOrderId: string) => {
    try {
      console.log(`[createDeliveryNoteFromPO] Starting creation for order: ${purchaseOrderId}`);
      
      // Récupérer les détails de la commande avec ses articles
      const { data: order, error: orderError } = await supabase
        .from('purchase_orders')
        .select(`
          id, 
          supplier_id, 
          warehouse_id,
          order_number,
          items:purchase_order_items(
            id,
            product_id,
            quantity,
            unit_price,
            product:catalog(
              id,
              name,
              reference
            )
          )
        `)
        .eq('id', purchaseOrderId)
        .single();
        
      if (orderError) {
        console.error("Error fetching purchase order:", orderError);
        toast.error("Erreur lors de la récupération de la commande");
        return false;
      }
      
      console.log(`[createDeliveryNoteFromPO] Order ${order.order_number} loaded with ${order.items?.length || 0} items`);
      
      // Vérifier que la commande a des articles
      if (!order.items || order.items.length === 0) {
        console.error(`[createDeliveryNoteFromPO] Order ${order.order_number} has no items`);
        toast.error("Cette commande ne contient aucun article");
        return false;
      }
      
      // Vérifier si un bon de livraison existe déjà
      const { data: existingNote, error: checkError } = await supabase
        .from('delivery_notes')
        .select('id, delivery_number')
        .eq('purchase_order_id', purchaseOrderId)
        .eq('deleted', false)
        .maybeSingle();
        
      if (checkError) {
        console.error("Error checking existing delivery note:", checkError);
        toast.error("Erreur lors de la vérification des bons de livraison existants");
        return false;
      }
      
      if (existingNote) {
        toast.info(`Un bon de livraison (${existingNote.delivery_number}) existe déjà pour cette commande`);
        return true;
      }
      
      // Générer un numéro de bon de livraison unique avec le nouveau format
      const deliveryNumber = await generateDeliveryNoteNumber();
      
      // Créer le bon de livraison
      const { data: newNote, error: createError } = await supabase
        .from('delivery_notes')
        .insert({
          purchase_order_id: order.id,
          supplier_id: order.supplier_id,
          warehouse_id: order.warehouse_id,
          delivery_number: deliveryNumber,
          status: 'pending',
          deleted: false,
          notes: `Bon de livraison créé manuellement depuis la commande ${order.order_number || ''}`
        })
        .select()
        .single();
        
      if (createError) {
        console.error("Error creating delivery note:", createError);
        toast.error("Erreur lors de la création du bon de livraison");
        return false;
      }
      
      console.log(`[createDeliveryNoteFromPO] Created delivery note: ${newNote.delivery_number}`);
      
      // Créer les articles du bon de livraison
      const itemsData = order.items.map((item: any) => ({
        delivery_note_id: newNote.id,
        product_id: item.product_id,
        quantity_ordered: item.quantity,
        quantity_received: 0,
        unit_price: item.unit_price
      }));
      
      console.log(`[createDeliveryNoteFromPO] Creating ${itemsData.length} delivery note items`);
      
      const { error: itemsError } = await supabase
        .from('delivery_note_items')
        .insert(itemsData);
        
      if (itemsError) {
        console.error("Error creating delivery note items:", itemsError);
        
        // Nettoyer le bon de livraison si la création des articles a échoué
        await supabase
          .from('delivery_notes')
          .update({ deleted: true })
          .eq('id', newNote.id);
          
        toast.error("Erreur lors de la création des articles du bon de livraison");
        return false;
      }
      
      // Marquer la commande comme ayant un bon de livraison
      await supabase
        .from('purchase_orders')
        .update({ delivery_note_created: true })
        .eq('id', purchaseOrderId);
      
      queryClient.invalidateQueries({ queryKey: ['delivery-notes'] });
      toast.success(`Bon de livraison ${deliveryNumber} créé avec succès (${itemsData.length} articles)`);
      return true;
    } catch (error: any) {
      console.error("Error in createDeliveryNoteFromPO:", error);
      toast.error(`Erreur: ${error.message}`);
      return false;
    }
  };

  return {
    createDeliveryNoteFromPO
  };
}
