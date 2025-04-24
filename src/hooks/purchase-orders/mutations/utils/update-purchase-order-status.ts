
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
    delivery_note_created: false // Always initially false until deliveryNote is created
  } as PurchaseOrder;
}
