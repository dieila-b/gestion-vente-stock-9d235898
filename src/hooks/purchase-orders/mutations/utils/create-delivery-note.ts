
import { supabase } from "@/integrations/supabase/client";
import { PurchaseOrder } from "@/types/purchase-order";

export async function createDeliveryNote(purchaseOrder: PurchaseOrder) {
  console.log("Creating delivery note for purchase order:", purchaseOrder.id);
  
  const orderNumber = purchaseOrder.order_number || '';
  const numericPart = orderNumber.replace(/\D/g, '') || new Date().getTime().toString().slice(-6);
  const deliveryNumber = `BL-${numericPart}`;
  
  const { data: deliveryNote, error: deliveryError } = await supabase
    .from("delivery_notes")
    .insert({
      supplier_id: purchaseOrder.supplier_id,
      purchase_order_id: purchaseOrder.id,
      delivery_number: deliveryNumber,
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

  if (!deliveryNote) {
    throw new Error("Aucun bon de livraison n'a été créé");
  }

  console.log("Successfully created delivery note:", deliveryNote.id);
  return deliveryNote;
}
