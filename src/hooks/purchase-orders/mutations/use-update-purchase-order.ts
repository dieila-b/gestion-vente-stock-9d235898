
import { supabase } from "@/integrations/supabase/client";
import type { PurchaseOrder } from "@/types/purchaseOrder";

// Type guard functions
function isValidOrderStatus(status: string): status is PurchaseOrder['status'] {
  return ['pending', 'draft', 'delivered', 'approved'].includes(status);
}

function isValidPaymentStatus(status: string): status is PurchaseOrder['payment_status'] {
  return ['pending', 'partial', 'paid'].includes(status);
}

export function useUpdatePurchaseOrder() {
  return async (id: string, orderData: Partial<PurchaseOrder>) => {
    // Validate status and payment_status if present
    const validatedData = {
      ...orderData
    };

    if (orderData.status && !isValidOrderStatus(orderData.status)) {
      validatedData.status = 'draft';
    }

    if (orderData.payment_status && !isValidPaymentStatus(orderData.payment_status)) {
      validatedData.payment_status = 'pending';
    }

    const { data, error } = await supabase
      .from('purchase_orders')
      .update(validatedData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  };
}
