
import { supabase } from "@/integrations/supabase/client";
import { PurchaseOrder } from "@/types/purchase-order";
import { constructPurchaseOrder } from "./construct-purchase-order";

export async function validatePurchaseOrder(id: string): Promise<PurchaseOrder> {
  console.log("Validating purchase order:", id);
  
  const { data: orderCheck, error: checkError } = await supabase
    .from('purchase_orders')
    .select('*, supplier:supplier_id(*)')
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
  
  // Use the common constructor to create a properly typed PurchaseOrder object
  return constructPurchaseOrder(orderCheck);
}
