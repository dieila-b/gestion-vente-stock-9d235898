
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { addCashRegisterTransaction } from "@/api/cash-register-api";

export function usePaymentDialog(refetch: () => void) {
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);

  const handleSubmitPayment = async (amount: number, method: string, notes?: string) => {
    try {
      const { error: paymentError } = await supabase
        .from('payments')
        .insert({
          client_id: selectedInvoice.client_id,
          amount,
          payment_method: method,
          notes
        });

      if (paymentError) throw paymentError;

      const newPaidAmount = selectedInvoice.paid_amount + amount;
      const newRemainingAmount = selectedInvoice.total_amount - newPaidAmount;
      const newPaymentStatus = newRemainingAmount === 0 ? 'paid' : 'partial';

      const { error: preorderError } = await supabase
        .from('preorders')
        .update({
          paid_amount: newPaidAmount,
          remaining_amount: newRemainingAmount,
          status: newPaymentStatus
        })
        .eq('id', selectedInvoice.id);

      if (preorderError) throw preorderError;

      const { data: cashRegisters, error: cashRegisterError } = await supabase
        .from('cash_registers')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1);

      if (cashRegisterError) throw cashRegisterError;

      if (cashRegisters && cashRegisters.length > 0) {
        const cashRegister = cashRegisters[0];
        
        await addCashRegisterTransaction(
          cashRegister.id,
          'deposit',
          amount,
          `Règlement Précommande (${selectedInvoice.id.slice(0, 8).toUpperCase()})`
        );
      }

      toast.success("Paiement enregistré avec succès");
      refetch();
      setIsPaymentDialogOpen(false);
      setSelectedInvoice(null);
    } catch (error) {
      console.error('Error processing payment:', error);
      toast.error("Erreur lors de l'enregistrement du paiement");
    }
  };

  return {
    isPaymentDialogOpen,
    setIsPaymentDialogOpen,
    selectedInvoice,
    setSelectedInvoice,
    handleSubmitPayment
  };
}
