
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
  
  // 1. Verify that the purchase order exists and has a warehouse specified
  const { data: order, error: orderError } = await supabase
    .from('purchase_orders')
    .select('id, status, warehouse_id, order_number, supplier_id')
    .eq('id', id)
    .single();
    
  if (orderError || !order) {
    console.error("[approvePurchaseOrderService] Purchase order not found:", orderError || "No data returned");
    throw new Error("Bon de commande introuvable");
  }
  
  console.log("[approvePurchaseOrderService] Found purchase order:", order);
  
  if (order.status === 'approved') {
    console.log("[approvePurchaseOrderService] Order already approved:", id);
    toast.info("Ce bon de commande est déjà approuvé");
    return { id, alreadyApproved: true };
  }
  
  // Allow approval even without warehouse_id for now
  if (!order.warehouse_id) {
    console.warn("[approvePurchaseOrderService] Order has no warehouse_id, but proceeding:", id);
  }
  
  // 2. Update purchase order status with precise timestamp
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
    console.error("[approvePurchaseOrderService] Error updating purchase order status:", 
      updateError || "No data returned");
    throw new Error(`Erreur lors de la mise à jour: ${updateError?.message || "Aucune donnée retournée"}`);
  }

  console.log("[approvePurchaseOrderService] Purchase order approved successfully:", updatedData);
  
  // 3. Create delivery note manually since trigger might not be working
  try {
    const deliveryNumber = 'BL-' + order.order_number?.replace('BC-', '') || `BL-${Date.now()}`;
    
    const { data: deliveryNote, error: deliveryError } = await supabase
      .from('delivery_notes')
      .insert({
        supplier_id: order.supplier_id,
        purchase_order_id: id,
        delivery_number: deliveryNumber,
        status: 'pending',
        notes: `Généré automatiquement depuis le bon de commande #${order.order_number}`,
        warehouse_id: order.warehouse_id
      })
      .select()
      .single();
      
    if (deliveryError) {
      console.error("[approvePurchaseOrderService] Error creating delivery note:", deliveryError);
      // Don't throw error here, approval was successful
      toast.warning("Bon de commande approuvé mais erreur lors de la création du bon de livraison");
    } else {
      console.log("[approvePurchaseOrderService] Delivery note created:", deliveryNote);
      toast.success("Bon de commande approuvé et bon de livraison créé");
    }
  } catch (deliveryCreationError) {
    console.error("[approvePurchaseOrderService] Exception creating delivery note:", deliveryCreationError);
    // Don't throw error here, approval was successful
  }
  
  // 4. Force invalidation of queries for immediate refresh
  await queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
  await queryClient.invalidateQueries({ queryKey: ['delivery-notes'] });
  
  return { id, success: true };
}
