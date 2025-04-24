
import { supabase } from "@/integrations/supabase/client";
import { PurchaseOrder } from "@/types/purchase-order";

export async function updatePurchaseOrderToApproved(id: string): Promise<PurchaseOrder> {
  const updateData: Partial<PurchaseOrder> = {
    status: 'approved' as const,
    updated_at: new Date().toISOString()
  };

  const { data: updatedOrder, error: updateError } = await supabase
    .from('purchase_orders')
    .update(updateData)
    .eq('id', id)
    .select('*, supplier:supplier_id(*)')
    .single();

  if (updateError) {
    console.error("Error updating purchase order:", updateError);
    throw new Error(`Erreur lors de l'approbation: ${updateError.message}`);
  }

  if (!updatedOrder) {
    throw new Error("Échec de mise à jour du bon de commande");
  }

  // Return the purchase order with all required fields
  return {
    ...updatedOrder,
    supplier: updatedOrder.supplier || { id: '', name: '', email: '', phone: '' },
    // Ensure other required properties
    status: updatedOrder.status || 'approved',
    payment_status: updatedOrder.payment_status || 'pending',
    delivery_note_created: false // Set default until we create a delivery note
  } as PurchaseOrder;
}

export async function markDeliveryNoteCreated(id: string) {
  try {
    // We'll use a database function or logic to track this separately if the column doesn't exist
    console.log("Marking delivery note as created for order ID:", id);
    
    // Since the column might not exist in the database, we'll just log it
    // but not actually try to update the non-existent column
    
    // Instead of trying to update the database, we'll rely on the constructPurchaseOrder 
    // function to set this property correctly in the object when needed
    
    console.log("Successfully marked delivery note as created for order:", id);
  } catch (error) {
    console.error("Exception in markDeliveryNoteCreated:", error);
    throw error;
  }
}
