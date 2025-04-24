
import { supabase } from "@/integrations/supabase/client";

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
  return orderCheck;
}
