
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { QueryClient } from "@tanstack/react-query";

/**
 * Service for approving purchase orders
 * @param id Purchase order ID
 * @param queryClient Query client for cache invalidation
 * @returns Result of the approval operation
 */
export async function approvePurchaseOrderService(id: string, queryClient: QueryClient) {
  console.log("[approvePurchaseOrderService] Starting approval for order:", id);
  
  try {
    // 1. Verify that the purchase order exists and get current data
    const { data: order, error: orderError } = await supabase
      .from('purchase_orders')
      .select('id, status, warehouse_id, order_number, supplier_id, items:purchase_order_items(*)')
      .eq('id', id)
      .single();
      
    if (orderError) {
      console.error("[approvePurchaseOrderService] Database error:", orderError);
      throw new Error(`Erreur lors de la récupération du bon de commande: ${orderError.message}`);
    }
    
    if (!order) {
      throw new Error("Bon de commande introuvable");
    }
    
    console.log("[approvePurchaseOrderService] Found purchase order:", order);
    
    if (order.status === 'approved') {
      console.log("[approvePurchaseOrderService] Order already approved:", id);
      toast.info("Ce bon de commande est déjà approuvé");
      return { id, alreadyApproved: true, success: true };
    }
    
    // 2. Update purchase order status to approved using direct Supabase query
    const { data: updatedOrder, error: updateError } = await supabase
      .from('purchase_orders')
      .update({ 
        status: 'approved',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error("[approvePurchaseOrderService] Error updating status:", updateError);
      throw new Error(`Erreur lors de la mise à jour du statut: ${updateError.message}`);
    }
    
    console.log("[approvePurchaseOrderService] Purchase order approved successfully:", updatedOrder);
    
    // 3. Create delivery note
    let deliveryNoteCreated = false;
    try {
      // Generate delivery number
      const deliveryNumber = 'BL-' + (order.order_number?.replace('BC-', '') || `${Date.now()}`);
      
      // Create delivery note data object
      const deliveryNoteData: any = {
        supplier_id: order.supplier_id,
        purchase_order_id: id,
        delivery_number: deliveryNumber,
        status: 'pending',
        notes: `Généré automatiquement depuis le bon de commande #${order.order_number}`,
        deleted: false
      };
      
      // Add warehouse_id only if it exists
      if (order.warehouse_id) {
        deliveryNoteData.warehouse_id = order.warehouse_id;
      }
      
      const { data: deliveryNote, error: deliveryError } = await supabase
        .from('delivery_notes')
        .insert(deliveryNoteData)
        .select()
        .single();
        
      if (deliveryError) {
        console.error("[approvePurchaseOrderService] Error creating delivery note:", deliveryError);
        toast.warning("Bon de commande approuvé mais erreur lors de la création du bon de livraison");
      } else {
        console.log("[approvePurchaseOrderService] Delivery note created:", deliveryNote);
        
        // Create delivery note items if purchase order has items
        if (order.items && order.items.length > 0) {
          const itemsData = order.items.map((item) => ({
            delivery_note_id: deliveryNote.id,
            product_id: item.product_id,
            quantity_ordered: item.quantity,
            quantity_received: 0,
            unit_price: item.unit_price
          }));
          
          const { error: itemsError } = await supabase
            .from('delivery_note_items')
            .insert(itemsData);
            
          if (itemsError) {
            console.error("[approvePurchaseOrderService] Error creating delivery note items:", itemsError);
          } else {
            console.log("[approvePurchaseOrderService] Delivery note items created successfully");
          }
        }
        
        deliveryNoteCreated = true;
      }
    } catch (deliveryCreationError) {
      console.error("[approvePurchaseOrderService] Exception creating delivery note:", deliveryCreationError);
      toast.warning("Bon de commande approuvé mais erreur lors de la création du bon de livraison");
    }
    
    // 4. Force refresh queries - ensure data consistency
    try {
      await queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      await queryClient.invalidateQueries({ queryKey: ['delivery-notes'] });
      
      // Force immediate refetch to update the UI
      await queryClient.refetchQueries({ queryKey: ['purchase-orders'] });
      
      console.log("[approvePurchaseOrderService] Queries refreshed successfully");
    } catch (queryError) {
      console.error("[approvePurchaseOrderService] Error refreshing queries:", queryError);
    }
    
    // Show appropriate success message
    if (deliveryNoteCreated) {
      toast.success("Bon de commande approuvé et bon de livraison créé avec succès");
    } else {
      toast.success("Bon de commande approuvé avec succès");
    }
    
    return { 
      id, 
      success: true, 
      status: 'approved',
      deliveryNoteCreated 
    };
    
  } catch (error: any) {
    console.error("[approvePurchaseOrderService] Service error:", error);
    throw new Error(error.message || "Erreur lors de l'approbation du bon de commande");
  }
}
