
import { supabase } from "@/integrations/supabase/client";
import { PurchaseOrder } from "@/types/purchase-order";

export async function updatePurchaseOrderToApproved(id: string): Promise<PurchaseOrder> {
  console.log("Updating purchase order status to approved:", id);
  
  // Define status explicitly with the correct type to avoid type errors
  const approvedStatus: PurchaseOrder['status'] = 'approved';
  
  const updateData = {
    status: approvedStatus,
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
  
  // Ensure status and payment_status are properly typed
  const orderStatus: PurchaseOrder['status'] = 
    updatedOrder.status && ['approved', 'draft', 'pending', 'delivered'].includes(updatedOrder.status) 
      ? updatedOrder.status as PurchaseOrder['status'] 
      : approvedStatus;
      
  const paymentStatus: PurchaseOrder['payment_status'] = 
    updatedOrder.payment_status && ['pending', 'partial', 'paid'].includes(updatedOrder.payment_status) 
      ? updatedOrder.payment_status as PurchaseOrder['payment_status'] 
      : 'pending';

  // Retourner l'objet PurchaseOrder complet, avec delivery_note_created comme propriété en mémoire
  const result: PurchaseOrder = {
    ...updatedOrder,
    supplier,
    status: orderStatus,
    payment_status: paymentStatus,
    delivery_note_created: false // Cette propriété est gérée en mémoire, pas en base de données
  };
  
  console.log("Processed updated order result:", result);
  return result;
}
