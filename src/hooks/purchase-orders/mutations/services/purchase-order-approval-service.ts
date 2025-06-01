
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
  
  if (!id) {
    throw new Error("ID du bon de commande manquant");
  }

  try {
    // First, get the order details to check if it has items
    console.log("[approvePurchaseOrderService] Loading order details first...");
    const { data: orderData, error: orderError } = await supabase
      .from('purchase_orders')
      .select(`
        id, 
        order_number, 
        status, 
        warehouse_id,
        items:purchase_order_items(
          id,
          product_id,
          quantity,
          unit_price
        )
      `)
      .eq('id', id)
      .single();
    
    if (orderError) {
      console.error("[approvePurchaseOrderService] Error loading order:", orderError);
      throw new Error(`Erreur lors du chargement de la commande: ${orderError.message}`);
    }
    
    if (!orderData) {
      throw new Error("Commande introuvable");
    }
    
    console.log("[approvePurchaseOrderService] Order loaded:", {
      id: orderData.id,
      order_number: orderData.order_number,
      status: orderData.status,
      warehouse_id: orderData.warehouse_id,
      items_count: orderData.items?.length || 0
    });
    
    // Check if order has items
    if (!orderData.items || orderData.items.length === 0) {
      console.warn("[approvePurchaseOrderService] Order has no items, but proceeding with approval");
      toast.warning(`La commande ${orderData.order_number} n'a pas d'articles, mais l'approbation va continuer`);
    }
    
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
    const approvalResult = result as unknown as ApprovalResult;
    
    // Check if order was already approved
    if (approvalResult.already_approved) {
      console.log("[approvePurchaseOrderService] Order already approved:", id);
      toast.info("Ce bon de commande est déjà approuvé");
      return { id, alreadyApproved: true, success: true };
    }
    
    // If a delivery note was created but has no items, we need to create them manually
    if (approvalResult.delivery_note_created && approvalResult.delivery_note_id && orderData.items && orderData.items.length > 0) {
      console.log("[approvePurchaseOrderService] Checking if delivery note items were created...");
      
      const { data: existingItems, error: itemsCheckError } = await supabase
        .from('delivery_note_items')
        .select('id')
        .eq('delivery_note_id', approvalResult.delivery_note_id);
      
      if (itemsCheckError) {
        console.error("[approvePurchaseOrderService] Error checking delivery note items:", itemsCheckError);
      } else if (!existingItems || existingItems.length === 0) {
        console.log("[approvePurchaseOrderService] No items found for delivery note, creating them...");
        
        // Create the delivery note items manually
        const itemsData = orderData.items.map((item: any) => ({
          delivery_note_id: approvalResult.delivery_note_id,
          product_id: item.product_id,
          quantity_ordered: item.quantity,
          quantity_received: 0,
          unit_price: item.unit_price
        }));
        
        const { error: createItemsError } = await supabase
          .from('delivery_note_items')
          .insert(itemsData);
        
        if (createItemsError) {
          console.error("[approvePurchaseOrderService] Error creating delivery note items:", createItemsError);
          toast.warning(`Bon de commande approuvé mais erreur lors de la création des articles du bon de livraison: ${createItemsError.message}`);
        } else {
          console.log(`[approvePurchaseOrderService] Successfully created ${itemsData.length} delivery note items`);
          toast.success(`Bon de commande approuvé et bon de livraison ${approvalResult.delivery_number} créé avec ${itemsData.length} articles`);
        }
      } else {
        console.log(`[approvePurchaseOrderService] Delivery note already has ${existingItems.length} items`);
      }
    }
    
    // Show success message based on result
    if (approvalResult.delivery_note_created && !approvalResult.delivery_note_id) {
      toast.success(`Bon de commande approuvé et bon de livraison ${approvalResult.delivery_number} créé automatiquement`);
    } else if (!approvalResult.delivery_note_created) {
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
