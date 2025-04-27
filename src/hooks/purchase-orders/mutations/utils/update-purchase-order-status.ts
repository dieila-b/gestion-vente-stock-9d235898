
import { supabase } from "@/integrations/supabase/client";
import { PurchaseOrder } from "@/types/purchase-order";

export async function updatePurchaseOrderToApproved(id: string): Promise<PurchaseOrder> {
  console.log("Updating purchase order status to approved:", id);
  
  const { data: updated, error: updateError } = await supabase
    .from("purchase_orders")
    .update({ status: "approved" })
    .eq("id", id)
    .select('*, supplier:supplier_id(*)')
    .single();
  
  if (updateError) {
    console.error("Error updating purchase order status:", updateError);
    throw new Error(`Erreur de mise à jour du statut: ${updateError.message}`);
  }
  
  if (!updated) {
    throw new Error("Impossible de mettre à jour le bon de commande");
  }
  
  console.log("Successfully updated purchase order status to approved");
  
  // Return a proper PurchaseOrder object
  return {
    ...updated,
    supplier: updated.supplier || {
      id: '',
      name: 'Fournisseur inconnu',
      phone: '',
      email: ''
    },
    delivery_note_created: !!updated.delivery_note_created
  } as PurchaseOrder;
}
