
import { supabase } from "@/integrations/supabase/client";
import { PurchaseOrder } from "@/types/purchase-order";

export async function updatePurchaseOrderToApproved(id: string): Promise<PurchaseOrder> {
  console.log("Updating purchase order status to approved:", id);
  
  const updateData = {
    status: 'approved' as PurchaseOrder['status'],
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

  // Ajouter un objet supplier par défaut si nécessaire
  const supplier = updatedOrder.supplier || { id: '', name: '', email: '', phone: '' };

  // Retourner l'objet PurchaseOrder complet, avec delivery_note_created comme propriété en mémoire
  const result: PurchaseOrder = {
    ...updatedOrder,
    supplier,
    status: updatedOrder.status as PurchaseOrder['status'] || 'approved',
    payment_status: updatedOrder.payment_status as PurchaseOrder['payment_status'] || 'pending',
    delivery_note_created: false // Cette propriété est gérée en mémoire, pas en base de données
  };
  
  console.log("Processed updated order result:", result);
  return result;
}
