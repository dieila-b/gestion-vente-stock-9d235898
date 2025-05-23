
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { syncApprovedPurchaseOrders } from "@/hooks/delivery-notes/sync/sync-approved-purchase-orders";
import { db } from "@/utils/db-core";
import { v4 as uuidv4 } from "uuid"; // Import the UUID v4 function

export function useApprovePurchaseOrder() {
  const queryClient = useQueryClient();
  
  const mutation = useMutation({
    mutationFn: async (id: string) => {
      try {
        console.log("[useApprovePurchaseOrder] Starting approval process for order:", id);
        
        // 1. Vérifier que le bon de commande existe et qu'il a un entrepôt spécifié
        const { data: order, error: orderError } = await supabase
          .from('purchase_orders')
          .select('id, status, warehouse_id, order_number')
          .eq('id', id)
          .single();
          
        if (orderError || !order) {
          console.error("[useApprovePurchaseOrder] Purchase order not found:", orderError || "No data returned");
          throw new Error("Bon de commande introuvable");
        }
        
        console.log("[useApprovePurchaseOrder] Found purchase order:", order);
        
        if (order.status === 'approved') {
          console.log("[useApprovePurchaseOrder] Order already approved:", id);
          toast.info("Ce bon de commande est déjà approuvé");
          return { id, alreadyApproved: true };
        }
        
        if (!order.warehouse_id) {
          console.error("[useApprovePurchaseOrder] Order has no warehouse_id:", id);
          throw new Error("Entrepôt non spécifié pour cette commande");
        }
        
        // 2. Mettre à jour le statut du bon de commande avec un timestamp précis
        const now = new Date().toISOString();
        const { data: updatedData, error: updateError } = await supabase
          .from('purchase_orders')
          .update({ 
            status: 'approved',
            updated_at: now
          })
          .eq('id', id)
          .select();

        if (updateError || !updatedData || updatedData.length === 0) {
          console.error("[useApprovePurchaseOrder] Error updating purchase order status:", updateError || "No data returned");
          throw new Error(`Erreur lors de la mise à jour: ${updateError?.message || "Aucune donnée retournée"}`);
        }

        console.log("[useApprovePurchaseOrder] Purchase order approved successfully:", updatedData);
        
        // 3. Forcer l'invalidation des requêtes pour assurer un rafraichissement immédiat
        await queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
        
        // 4. Synchroniser avec les bons de livraison de manière forcée
        try {
          console.log("[useApprovePurchaseOrder] Starting sync after approval");
          const syncResult = await syncApprovedPurchaseOrders(id);
          console.log("[useApprovePurchaseOrder] Sync result after approval:", syncResult);
          
          // Invalider à nouveau pour prendre en compte les changements
          await queryClient.invalidateQueries({ queryKey: ['delivery-notes'] });
          
          if (syncResult) {
            toast.success("Bon de livraison créé avec succès");
          } else {
            console.log("[useApprovePurchaseOrder] No delivery note created, checking why...");
            
            // Vérifier si un bon de livraison existe déjà
            const { data: existingNote } = await supabase
              .from('delivery_notes')
              .select('id')
              .eq('purchase_order_id', id)
              .maybeSingle();
            
            if (existingNote) {
              toast.info("Un bon de livraison existe déjà pour cette commande");
            } else {
              // Tentative de création forcée
              console.log("[useApprovePurchaseOrder] Attempting forced creation of delivery note");
              await createDeliveryNoteDirectly(id, order);
            }
          }
        } catch (syncError: any) {
          console.error("[useApprovePurchaseOrder] Error in sync after approval:", syncError);
          toast.error(`Erreur pendant la synchronisation: ${syncError.message || 'Erreur inconnue'}`);
          
          // Tentative de secours pour créer le bon de livraison directement
          try {
            console.log("[useApprovePurchaseOrder] Attempting fallback creation of delivery note");
            await createDeliveryNoteDirectly(id, order);
          } catch (fallbackError: any) {
            console.error("[useApprovePurchaseOrder] Fallback creation failed:", fallbackError);
          }
        }
        
        toast.success("Commande approuvée avec succès");
        return { id, success: true };
      } catch (error: any) {
        console.error("[useApprovePurchaseOrder] Error in approval process:", error);
        toast.error(`Erreur lors de l'approbation: ${error.message || 'Erreur inconnue'}`);
        throw error;
      }
    }
  });

  // Fonction de secours pour créer directement un bon de livraison
  async function createDeliveryNoteDirectly(orderId: string, order: any) {
    try {
      console.log("[createDeliveryNoteDirectly] Creating delivery note directly for order:", orderId);
      
      // Récupérer les détails nécessaires de la commande
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
      
      // Générer un numéro de bon de livraison
      const date = new Date();
      const dateStr = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
      const randomId = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      const deliveryNumber = `BL-${dateStr}-${randomId}`;
      
      // Créer le bon de livraison
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
      
      // Créer les articles
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
        } else {
          console.log(`[createDeliveryNoteDirectly] Created ${itemsData.length} items`);
          
          // Mettre à jour le flag sur le bon de commande
          await supabase
            .from('purchase_orders')
            .update({ delivery_note_created: true })
            .eq('id', orderId);
            
          toast.success("Bon de livraison créé avec succès (méthode directe)");
        }
      }
      
      return true;
    } catch (error: any) {
      console.error("[createDeliveryNoteDirectly] Error:", error);
      toast.error(`Échec de la création directe: ${error.message}`);
      throw error;
    }
  }

  // Retourner une fonction qui appelle directement mutateAsync
  return async (id: string) => {
    console.log("[useApprovePurchaseOrder] Called with id:", id);
    try {
      return await mutation.mutateAsync(id);
    } catch (error) {
      console.error("[useApprovePurchaseOrder] Error in wrapper:", error);
      throw error;
    }
  };
}
