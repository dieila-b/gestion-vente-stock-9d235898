
import { supabase } from "@/integrations/supabase/client";
import { PurchaseOrder } from "@/types/purchase-order";

export async function createDeliveryNote(purchaseOrder: PurchaseOrder) {
  const { data: deliveryNote, error: deliveryError } = await supabase
    .from("delivery_notes")
    .insert({
      supplier_id: purchaseOrder.supplier_id,
      purchase_order_id: purchaseOrder.id,
      delivery_number: `BL-${purchaseOrder.order_number?.replace(/\D/g, '') || new Date().getTime().toString().slice(-6)}`,
      status: "pending",
      notes: `Généré automatiquement depuis le bon de commande #${purchaseOrder.order_number || purchaseOrder.id.substring(0, 8)}`,
      warehouse_id: purchaseOrder.warehouse_id
    })
    .select()
    .single();

  if (deliveryError) {
    console.error("Error creating delivery note:", deliveryError);
    throw new Error(`Erreur lors de la création du bon de livraison: ${deliveryError.message}`);
  }

  return deliveryNote;
}
