
import { useState } from "react";
import { toast } from "sonner";

export function usePaymentForm(totalAmount: number, isAlreadyPaid: boolean = false) {
  // Initialize amount with totalAmount when not already paid, otherwise 0
  const [amount, setAmount] = useState(totalAmount);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [notes, setNotes] = useState("");
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [generatedInvoiceNumber, setGeneratedInvoiceNumber] = useState("");

  // Calculate remaining amount
  const remainingAmount = Math.max(0, totalAmount - amount);

  const handleAmountChange = (value: number) => {
    setAmount(value);
  };

  const validatePayment = () => {
    if (!isAlreadyPaid && amount <= 0) {
      toast.warning("Veuillez saisir un montant valide");
      return false;
    }
    return true;
  };

  const completePayment = () => {
    // Generate a random invoice number for display purposes
    const invoiceId = Math.random().toString(36).substring(2, 10).toUpperCase();
    setGeneratedInvoiceNumber(invoiceId);
    setPaymentComplete(true);
  };

  const resetPaymentForm = () => {
    setAmount(isAlreadyPaid ? 0 : totalAmount);
    setPaymentMethod("cash");
    setNotes("");
    setPaymentComplete(false);
    setGeneratedInvoiceNumber("");
  };

  return {
    amount,
    remainingAmount,
    paymentMethod,
    notes,
    paymentComplete,
    generatedInvoiceNumber,
    handleAmountChange,
    setAmount, // Expose setAmount method
    setPaymentMethod,
    setNotes,
    validatePayment,
    completePayment,
    resetPaymentForm
  };
}
