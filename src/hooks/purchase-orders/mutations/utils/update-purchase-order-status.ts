
import { supabase } from "@/integrations/supabase/client";
import { PurchaseOrder } from "@/types/purchase-order";

export async function updatePurchaseOrderToApproved(id: string): Promise<PurchaseOrder> {
  const updateData: Partial<PurchaseOrder> = {
    status: 'approved' as const,
    updated_at: new Date().toISOString(),
    delivery_note_created: false
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

  // Ensure the returned object has all required properties for PurchaseOrder type
  // including the delivery_note_created property
  return {
    ...updatedOrder,
    delivery_note_created: false, // Initially set to false until we create a delivery note
    supplier: updatedOrder.supplier || { id: '', name: '', email: '', phone: '' },
    // Ensure other required properties
    status: updatedOrder.status || 'approved',
    payment_status: updatedOrder.payment_status || 'pending',
  } as PurchaseOrder;
}

export async function markDeliveryNoteCreated(id: string) {
  const { error: markError } = await supabase
    .from('purchase_orders')
    .update({ delivery_note_created: true } as Partial<PurchaseOrder>)
    .eq('id', id);

  if (markError) {
    console.error("Error marking delivery note as created:", markError);
    throw new Error(`Erreur lors de la mise à jour: ${markError.message}`);
  }
}
