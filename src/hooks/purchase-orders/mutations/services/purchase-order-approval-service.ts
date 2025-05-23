
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
  // 1. Verify that the purchase order exists and has a warehouse specified
  const { data: order, error: orderError } = await supabase
    .from('purchase_orders')
    .select('id, status, warehouse_id, order_number')
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
  
  if (!order.warehouse_id) {
    console.error("[approvePurchaseOrderService] Order has no warehouse_id:", id);
    throw new Error("Entrepôt non spécifié pour cette commande");
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
  
  // 3. Force invalidation of queries for immediate refresh
  await queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
  
  toast.success("Commande approuvée avec succès");
  return { id, success: true };
}
