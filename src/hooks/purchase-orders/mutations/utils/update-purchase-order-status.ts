
import { supabase } from "@/integrations/supabase/client";
import { PurchaseOrder } from "@/types/purchase-order";
import { constructPurchaseOrder } from "./construct-purchase-order";

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

  // Process and return the updated order
  return constructPurchaseOrder({
    ...updatedOrder,
    delivery_note_created: false // Initially set to false until the delivery note is created
  });
}
