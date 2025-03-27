
import { supabase } from "@/integrations/supabase/client";
import { addCashRegisterTransaction } from "@/api/cash-register-api";

export function usePaymentRecording(activeRegister: any) {
  // Record the payment
  const recordPayment = async (
    orderId: string,
    amount: number,
    method: string,
    notes?: string,
    editOrderId?: string | null
  ) => {
    // Handle payment record - if editing, we may want to update existing payment or add a new one
    if (editOrderId) {
      // For simplicity, we'll add a new payment record even when editing
      // A more complex approach would be to update the existing payment if it matches
      const { error: paymentError } = await supabase
        .from('order_payments')
        .insert({
          order_id: orderId,
          amount: amount,
          payment_method: method,
          notes: notes || `Paiement modifié pour vente #${orderId}`
        });

      if (paymentError) throw paymentError;
    } else {
      // Normal payment process for new orders
      const { error: paymentError } = await supabase
        .from('order_payments')
        .insert({
          order_id: orderId,
          amount: amount,
          payment_method: method,
          notes: notes
        });

      if (paymentError) throw paymentError;
    }

    // Update cash register if payment method is cash and there's an active register
    if (method === 'cash' && activeRegister) {
      await addCashRegisterTransaction(
        activeRegister.id,
        'deposit',
        amount,
        `Encaissement vente #${orderId}`
      );
    }
  };

  return { recordPayment };
}
