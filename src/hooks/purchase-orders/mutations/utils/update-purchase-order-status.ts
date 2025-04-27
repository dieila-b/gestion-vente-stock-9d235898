
import { supabase } from "@/integrations/supabase/client";
import { PurchaseOrder } from "@/types/purchase-order";

export async function updatePurchaseOrderToApproved(id: string): Promise<PurchaseOrder> {
  console.log("Updating purchase order status to approved:", id);
  
  const updateData = {
    status: "approved" as const,
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

  // Ensure supplier is properly structured
  const supplier = updatedOrder.supplier || { id: '', name: '', email: '', phone: '' };
  
  // Explicitly validate status as a valid PurchaseOrder status
  const validStatuses: PurchaseOrder['status'][] = ['approved', 'draft', 'pending', 'delivered'];
  const status: PurchaseOrder['status'] = validStatuses.includes(updatedOrder.status as any) 
    ? updatedOrder.status as PurchaseOrder['status']
    : 'approved';
  
  // Explicitly validate payment_status as a valid PurchaseOrder payment status
  const validPaymentStatuses: PurchaseOrder['payment_status'][] = ['pending', 'partial', 'paid'];
  const payment_status: PurchaseOrder['payment_status'] = validPaymentStatuses.includes(updatedOrder.payment_status as any)
    ? updatedOrder.payment_status as PurchaseOrder['payment_status']
    : 'pending';

  // Return a properly typed PurchaseOrder object
  const result: PurchaseOrder = {
    ...updatedOrder,
    supplier,
    status,
    payment_status,
    // Explicitly set as boolean
    delivery_note_created: false
  };
  
  console.log("Processed updated order result:", {
    id: result.id,
    status: result.status,
    delivery_note_created: result.delivery_note_created
  });
  
  return result;
}
