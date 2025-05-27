
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { QueryClient } from "@tanstack/react-query";

/**
 * Service for approving purchase orders
 * Simplified version that relies on Supabase triggers for delivery note creation
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
      .select('id, status, order_number')
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
    
    // 2. Update purchase order status to approved
    // The Supabase trigger will automatically create the delivery note
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
    
    // 3. Wait a moment for the trigger to complete and then refresh data
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 4. Force refresh queries to get latest data including new delivery note
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
    
    // Show success message
    toast.success("Bon de commande approuvé et bon de livraison créé automatiquement");
    
    return { 
      id, 
      success: true, 
      status: 'approved',
      deliveryNoteCreated: true // Le trigger l'a créé automatiquement
    };
    
  } catch (error: any) {
    console.error("[approvePurchaseOrderService] Service error:", error);
    throw new Error(error.message || "Erreur lors de l'approbation du bon de commande");
  }
}
