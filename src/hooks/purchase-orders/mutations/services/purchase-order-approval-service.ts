
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { QueryClient } from "@tanstack/react-query";

/**
 * Service for approving purchase orders
 * Uses Supabase trigger for automatic delivery note creation
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
      .select('id, status, order_number, warehouse_id')
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

    // 2. Check if order has warehouse_id (required for delivery note creation)
    if (!order.warehouse_id) {
      console.warn("[approvePurchaseOrderService] Order has no warehouse_id:", id);
      toast.warning("Ce bon de commande n'a pas d'entrepôt assigné. Le bon de livraison ne pourra pas être créé automatiquement.");
    }
    
    // 3. Update purchase order status to approved
    // The Supabase trigger will automatically create the delivery note
    const { data: updatedOrder, error: updateError } = await supabase
      .from('purchase_orders')
      .update({ 
        status: 'approved',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select('id, status, order_number')
      .single();

    if (updateError) {
      console.error("[approvePurchaseOrderService] Error updating status:", updateError);
      throw new Error(`Erreur lors de la mise à jour du statut: ${updateError.message}`);
    }
    
    if (!updatedOrder) {
      throw new Error("Erreur lors de la mise à jour du bon de commande");
    }
    
    console.log("[approvePurchaseOrderService] Purchase order approved successfully:", updatedOrder);
    
    // 4. Wait a moment for the trigger to complete
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // 5. Verify if delivery note was created by the trigger
    if (order.warehouse_id) {
      const { data: deliveryNote, error: deliveryError } = await supabase
        .from('delivery_notes')
        .select('id, delivery_number')
        .eq('purchase_order_id', id)
        .eq('deleted', false)
        .maybeSingle();
        
      if (deliveryError) {
        console.warn("[approvePurchaseOrderService] Error checking delivery note:", deliveryError);
      } else if (deliveryNote) {
        console.log("[approvePurchaseOrderService] Delivery note created:", deliveryNote);
        toast.success(`Bon de commande approuvé et bon de livraison ${deliveryNote.delivery_number} créé automatiquement`);
      } else {
        console.warn("[approvePurchaseOrderService] No delivery note found after approval");
        toast.success("Bon de commande approuvé");
      }
    } else {
      toast.success("Bon de commande approuvé (aucun bon de livraison créé - entrepôt manquant)");
    }
    
    // 6. Force refresh queries to get latest data
    try {
      await queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      await queryClient.invalidateQueries({ queryKey: ['delivery-notes'] });
      
      // Force immediate refetch to update the UI
      await queryClient.refetchQueries({ queryKey: ['purchase-orders'] });
      await queryClient.refetchQueries({ queryKey: ['delivery-notes'] });
      
      console.log("[approvePurchaseOrderService] Queries refreshed successfully");
    } catch (queryError) {
      console.error("[approvePurchaseOrderService] Error refreshing queries:", queryError);
    }
    
    return { 
      id, 
      success: true, 
      status: 'approved',
      deliveryNoteCreated: !!order.warehouse_id
    };
    
  } catch (error: any) {
    console.error("[approvePurchaseOrderService] Service error:", error);
    throw new Error(error.message || "Erreur lors de l'approbation du bon de commande");
  }
}
