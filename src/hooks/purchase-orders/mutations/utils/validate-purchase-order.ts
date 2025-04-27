
import { supabase } from "@/integrations/supabase/client";
import { PurchaseOrder } from "@/types/purchase-order";

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
  
  // Ensure we return a proper PurchaseOrder object with all required fields
  return {
    ...orderCheck,
    supplier: orderCheck.supplier || { 
      id: '', 
      name: 'Fournisseur inconnu',
      phone: '',
      email: ''
    },
    delivery_note_created: !!orderCheck.delivery_note_created
  } as PurchaseOrder;
}
