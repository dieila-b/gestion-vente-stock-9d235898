
import { supabase } from "@/integrations/supabase/client";
import { constructPurchaseOrder } from "./construct-purchase-order";

export async function validatePurchaseOrder(id: string) {
  console.log("Validating purchase order:", id);
  
  const { data: orderCheck, error: checkError } = await supabase
    .from('purchase_orders')
    .select('id, status')
    .eq('id', id)
    .single();
    
  if (checkError) {
    console.error("Failed to check purchase order:", checkError);
    throw new Error(`Erreur de vérification: ${checkError.message}`);
  }
  
  if (!orderCheck) {
    throw new Error("Bon de commande introuvable");
  }

  console.log("Validation successful, order status:", orderCheck.status);
  return constructPurchaseOrder({
    id: orderCheck.id,
    status: orderCheck.status as "draft" | "pending" | "delivered" | "approved",
    delivery_note_created: false // Default value since column might not exist
  });
}
