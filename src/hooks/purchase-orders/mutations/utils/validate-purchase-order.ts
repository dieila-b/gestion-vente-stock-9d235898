
import { supabase } from "@/integrations/supabase/client";
import { constructPurchaseOrder } from "./construct-purchase-order";

export async function validatePurchaseOrder(id: string) {
  console.log("Validating purchase order:", id);
  
  if (!id) {
    console.error("Invalid purchase order ID");
    throw new Error("ID de bon de commande invalide");
  }
  
  const { data: orderCheck, error: checkError } = await supabase
    .from('purchase_orders')
    .select('id, status, payment_status, delivery_note_created')
    .eq('id', id)
    .maybeSingle();
    
  if (checkError) {
    console.error("Failed to check purchase order:", checkError);
    throw new Error(`Erreur de vérification: ${checkError.message}`);
  }
  
  if (!orderCheck) {
    console.error("Purchase order not found:", id);
    throw new Error("Bon de commande introuvable");
  }

  console.log("Validation successful, order status:", orderCheck.status);
  return constructPurchaseOrder({
    id: orderCheck.id,
    status: orderCheck.status as "draft" | "pending" | "delivered" | "approved",
    payment_status: orderCheck.payment_status as "pending" | "partial" | "paid",
    delivery_note_created: Boolean(orderCheck.delivery_note_created)
  });
}
