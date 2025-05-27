
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
    // 1. Verify that the purchase order exists
    const { data: order, error: orderError } = await supabase
      .from('purchase_orders')
      .select('id, status, warehouse_id, order_number, supplier_id')
      .eq('id', id)
      .single();
      
    if (orderError) {
      console.error("[approvePurchaseOrderService] Database error:", orderError);
      throw new Error(`Erreur base de données: ${orderError.message}`);
    }
    
    if (!order) {
      console.error("[approvePurchaseOrderService] Purchase order not found");
      throw new Error("Bon de commande introuvable");
    }
    
    console.log("[approvePurchaseOrderService] Found purchase order:", order);
    
    if (order.status === 'approved') {
      console.log("[approvePurchaseOrderService] Order already approved:", id);
      toast.info("Ce bon de commande est déjà approuvé");
      return { id, alreadyApproved: true };
    }
    
    // 2. Update purchase order status to approved
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
      throw new Error(`Erreur lors de la mise à jour: ${updateError.message}`);
    }
    
    if (!updatedOrder) {
      console.error("[approvePurchaseOrderService] No updated data returned");
      throw new Error("Aucune donnée retournée après la mise à jour");
    }

    console.log("[approvePurchaseOrderService] Purchase order approved successfully:", updatedOrder);
    
    // 3. Create delivery note automatically
    try {
      const deliveryNumber = 'BL-' + (order.order_number?.replace('BC-', '') || `${Date.now()}`);
      
      const { data: deliveryNote, error: deliveryError } = await supabase
        .from('delivery_notes')
        .insert({
          supplier_id: order.supplier_id,
          purchase_order_id: id,
          delivery_number: deliveryNumber,
          status: 'pending',
          notes: `Généré automatiquement depuis le bon de commande #${order.order_number}`,
          warehouse_id: order.warehouse_id,
          deleted: false
        })
        .select()
        .single();
        
      if (deliveryError) {
        console.error("[approvePurchaseOrderService] Error creating delivery note:", deliveryError);
        // Don't throw here, approval was successful
        toast.warning("Bon de commande approuvé mais erreur lors de la création du bon de livraison");
      } else {
        console.log("[approvePurchaseOrderService] Delivery note created:", deliveryNote);
        toast.success("Bon de commande approuvé et bon de livraison créé avec succès");
      }
    } catch (deliveryCreationError) {
      console.error("[approvePurchaseOrderService] Exception creating delivery note:", deliveryCreationError);
      toast.warning("Bon de commande approuvé mais erreur lors de la création du bon de livraison");
    }
    
    // 4. Force refresh queries
    try {
      await queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      await queryClient.invalidateQueries({ queryKey: ['delivery-notes'] });
      console.log("[approvePurchaseOrderService] Queries invalidated successfully");
    } catch (queryError) {
      console.error("[approvePurchaseOrderService] Error invalidating queries:", queryError);
    }
    
    return { id, success: true, status: 'approved' };
    
  } catch (error: any) {
    console.error("[approvePurchaseOrderService] Service error:", error);
    throw error;
  }
}
