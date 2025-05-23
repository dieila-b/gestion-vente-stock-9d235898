
import { syncApprovedPurchaseOrders } from "@/hooks/delivery-notes/sync/sync-approved-purchase-orders";
import { toast } from "sonner";

/**
 * Creates a delivery note for an approved purchase order
 * @param orderId The ID of the approved purchase order
 * @returns True if delivery note was created successfully, false otherwise
 */
export async function createDeliveryNoteForApprovedOrder(orderId: string): Promise<boolean> {
  try {
    console.log(`[createDeliveryNoteForApprovedOrder] Attempting to create delivery note for order: ${orderId}`);
    
    // Use the syncApprovedPurchaseOrders function with a specific order ID
    const result = await syncApprovedPurchaseOrders(orderId);
    
    console.log(`[createDeliveryNoteForApprovedOrder] Result for order ${orderId}:`, result);
    return result;
  } catch (error: any) {
    console.error(`[createDeliveryNoteForApprovedOrder] Error creating delivery note for order ${orderId}:`, error);
    toast.error(`Erreur lors de la création du bon de livraison: ${error.message || 'Erreur inconnue'}`);
    return false;
  }
}
