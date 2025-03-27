
import { useState } from "react";

export function usePaymentCompletion() {
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [generatedInvoiceNumber, setGeneratedInvoiceNumber] = useState("");

  const completePayment = () => {
    // Generate a random invoice number for demo purposes
    const randomId = Math.random().toString(36).substring(2, 10).toUpperCase();
    setGeneratedInvoiceNumber(`INV-${randomId}`);
    setPaymentComplete(true);
  };

  const resetPaymentCompletion = () => {
    setPaymentComplete(false);
    setGeneratedInvoiceNumber("");
  };

  return {
    paymentComplete,
    generatedInvoiceNumber,
    completePayment,
    resetPaymentCompletion
  };
}
