
import { supabase } from "@/integrations/supabase/client";
import { updateCashRegister } from "./useCashRegisterUpdate";
import { toast } from "sonner";

export async function processPayment(selectedInvoice: any, amount: number, method: string, notes?: string) {
  try {
    console.log("=== PAYMENT PROCESS STARTED ===");
    console.log("Invoice ID:", selectedInvoice.id);
    console.log("Current payment status:", selectedInvoice.payment_status);
    console.log("Payment amount:", amount, "Method:", method);
    
    if (amount <= 0) {
      console.log("Payment amount is zero or negative, skipping payment processing");
      return null;
    }
    
    // Record the payment in order_payments table
    const { error: paymentError } = await supabase
      .from('order_payments')
      .insert({
        order_id: selectedInvoice.id,
        amount,
        payment_method: method,
        notes
      });

    if (paymentError) {
      console.error("Error recording payment:", paymentError);
      throw paymentError;
    }

    console.log("Payment recorded successfully in order_payments");

    // Calculate new payment values
    const newPaidAmount = selectedInvoice.paid_amount + amount;
    const newRemainingAmount = selectedInvoice.final_total - newPaidAmount;
    const newPaymentStatus = newRemainingAmount <= 0 ? 'paid' : 'partial';
    
    console.log("New payment calculations:", {
      newPaidAmount,
      newRemainingAmount,
      newPaymentStatus
    });
    
    // Update ONLY payment-related fields in the orders table
    const { data: updatedOrder, error: updateError } = await supabase
      .from('orders')
      .update({
        paid_amount: newPaidAmount,
        remaining_amount: newRemainingAmount,
        payment_status: newPaymentStatus
      })
      .eq('id', selectedInvoice.id)
      .select('paid_amount, remaining_amount, payment_status')
      .single();
      
    if (updateError) {
      console.error("Error updating payment fields:", updateError);
      throw updateError;
    }
    
    console.log("Payment fields updated successfully:", updatedOrder);
    
    // Update cash register
    await updateCashRegister(selectedInvoice, amount);
    console.log("Cash register updated");
    
    console.log("=== PAYMENT PROCESS COMPLETED ===");
    
    // Return ONLY payment-related information
    return {
      paid_amount: updatedOrder.paid_amount,
      remaining_amount: updatedOrder.remaining_amount,
      payment_status: updatedOrder.payment_status
    };
  } catch (error) {
    console.error('Error in processPayment function:', error);
    throw error;
  }
}
