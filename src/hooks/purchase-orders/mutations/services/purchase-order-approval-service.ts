
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { QueryClient } from "@tanstack/react-query";

// Interface pour le résultat de la fonction RPC approve_purchase_order
interface ApprovalResult {
  success: boolean;
  already_approved: boolean;
  delivery_note_created?: boolean;
  delivery_note_id?: string;
  delivery_number?: string;
  has_warehouse?: boolean;
  message: string;
}

/**
 * Service for approving purchase orders using RPC function
 * @param id Purchase order ID
 * @param queryClient Query client for cache invalidation
 * @returns Result of the approval operation
 */
export async function approvePurchaseOrderService(id: string, queryClient: QueryClient) {
  console.log("[approvePurchaseOrderService] Starting approval for order:", id);
  
  try {
    // Use RPC function to securely approve the purchase order
    console.log("[approvePurchaseOrderService] Calling RPC function approve_purchase_order");
    const { data: result, error } = await supabase.rpc('approve_purchase_order', { 
      order_id: id 
    });
      
    console.log("[approvePurchaseOrderService] RPC raw response:", { data: result, error });
    
    if (error) {
      console.error("[approvePurchaseOrderService] RPC error:", error);
      throw new Error(`Erreur lors de l'approbation: ${error.message}`);
    }
    
    if (!result) {
      console.error("[approvePurchaseOrderService] No result returned from RPC");
      throw new Error("Aucun résultat retourné par la fonction d'approbation");
    }
    
    console.log("[approvePurchaseOrderService] RPC result:", result);
    
    // Type assertion to convert Json type to our ApprovalResult interface
    // First cast to unknown, then to our interface to satisfy TypeScript
    const approvalResult = result as unknown as ApprovalResult;
    
    // Check if order was already approved
    if (approvalResult.already_approved) {
      console.log("[approvePurchaseOrderService] Order already approved:", id);
      toast.info("Ce bon de commande est déjà approuvé");
      return { id, alreadyApproved: true, success: true };
    }
    
    // Show success message based on result
    if (approvalResult.delivery_note_created) {
      toast.success(`Bon de commande approuvé et bon de livraison ${approvalResult.delivery_number} créé automatiquement`);
    } else {
      toast.success("Bon de commande approuvé");
      if (!approvalResult.has_warehouse) {
        toast.warning("Aucun bon de livraison créé - entrepôt manquant");
      }
    }
    
    // Force refresh queries to get latest data
    try {
      console.log("[approvePurchaseOrderService] Invalidating and refetching queries");
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
      deliveryNoteCreated: approvalResult.delivery_note_created || false,
      deliveryNumber: approvalResult.delivery_number
    };
    
  } catch (error: any) {
    console.error("[approvePurchaseOrderService] Service error:", error);
    throw new Error(error.message || "Erreur lors de l'approbation du bon de commande");
  }
}
