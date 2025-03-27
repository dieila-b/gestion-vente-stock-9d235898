
import { supabase } from "@/integrations/supabase/client";
import { updateDeliveryStatus } from "./useDeliveryStatusUpdates";
import { toast } from "sonner";

export async function processDelivery(
  selectedInvoice: any,
  delivered?: boolean,
  partiallyDelivered?: boolean,
  deliveredItems?: Record<string, { delivered: boolean, quantity: number }>
) {
  try {
    console.log("=== DELIVERY PROCESS STARTED ===");
    console.log("Invoice ID:", selectedInvoice.id);
    console.log("Current delivery status:", selectedInvoice.delivery_status);
    console.log("Requested delivery status - delivered:", delivered, "partially:", partiallyDelivered);
    console.log("Delivered items data:", deliveredItems);
    
    // Determine delivery status explicitly from the parameters
    let deliveryStatus = selectedInvoice.delivery_status;
    if (delivered === true) {
      deliveryStatus = 'delivered';
    } else if (partiallyDelivered === true) {
      deliveryStatus = 'partial';
    } else if (delivered === false && partiallyDelivered === false) {
      // This is the "awaiting delivery" status
      deliveryStatus = 'awaiting';
    }

    console.log("New delivery status to set:", deliveryStatus);

    // ONLY update the delivery_status field - NOTHING ELSE
    const { data: updatedDelivery, error: deliveryStatusError } = await supabase
      .from('orders')
      .update({
        delivery_status: deliveryStatus
      })
      .eq('id', selectedInvoice.id)
      .select('delivery_status')
      .single();

    if (deliveryStatusError) {
      console.error("Error updating delivery status:", deliveryStatusError);
      throw deliveryStatusError;
    }
    
    console.log("Delivery status updated successfully to:", updatedDelivery.delivery_status);
    
    // Update delivered quantities for items if provided
    let updatedItems = null;
    if (deliveredItems && Object.keys(deliveredItems).length > 0) {
      console.log("Processing delivery items update with data:", deliveredItems);
      updatedItems = await updateDeliveryStatus(selectedInvoice, deliveryStatus, deliveredItems);
      console.log("Updated delivery items:", updatedItems);
    } else if (delivered) {
      // If fully delivered without specific items, update all items
      console.log("Processing full delivery (all items)");
      updatedItems = await updateDeliveryStatus(selectedInvoice, 'delivered');
      console.log("Updated all items to delivered:", updatedItems);
    }
    
    console.log("=== DELIVERY PROCESS COMPLETED ===");
    
    // Return ONLY delivery-related information
    return {
      delivery_status: updatedDelivery.delivery_status,
      items: updatedItems
    };
  } catch (error) {
    console.error('Error in processDelivery function:', error);
    throw error;
  }
}
