
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
      
      console.log(`[createDeliveryNoteFromPO] Order ${order.order_number} has ${order.items?.length || 0} items`);
      
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
      
      // Générer un numéro de bon de livraison unique
      const deliveryNumber = `BL-${Date.now().toString().slice(-8)}`;
      
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
