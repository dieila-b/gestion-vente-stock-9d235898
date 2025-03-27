
import { useState, useEffect } from "react";
import { usePaymentForm } from "./payment-dialog/usePaymentForm";
import { useDeliveryItems } from "./payment-dialog/useDeliveryItems";
import { useDeliveryStatus } from "./payment-dialog/useDeliveryStatus";
import { usePaymentCompletion } from "./payment-dialog/usePaymentCompletion";
import { toast } from "sonner";

interface UsePaymentDialogOptions {
  totalAmount: number;
  onSubmitPayment: (
    amount: number, 
    method: string, 
    notes?: string, 
    delivered?: boolean, 
    partiallyDelivered?: boolean,
    deliveredItems?: Record<string, { delivered: boolean, quantity: number }>
  ) => void;
  items: any[];
  isAlreadyPaid?: boolean;
  fullyDeliveredByDefault?: boolean;
}

export function usePaymentDialog({
  totalAmount,
  onSubmitPayment,
  items = [],
  isAlreadyPaid = false,
  fullyDeliveredByDefault = false
}: UsePaymentDialogOptions) {
  // Payment form state
  const {
    amount,
    remainingAmount,
    paymentMethod,
    notes,
    paymentComplete,
    generatedInvoiceNumber,
    handleAmountChange,
    setPaymentMethod,
    setNotes,
    validatePayment,
    completePayment,
    resetPaymentForm
  } = usePaymentForm(totalAmount, isAlreadyPaid);

  // Delivery status state - now passing the fullyDeliveredByDefault parameter correctly
  const {
    fullyDelivered,
    partiallyDelivered,
    handleFullyDeliveredChange,
    handlePartiallyDeliveredChange
  } = useDeliveryStatus(fullyDeliveredByDefault);

  // Delivery items state
  const {
    deliveryItems,
    handleDeliveredChange,
    handleQuantityChange,
    initializeDeliveryItems,
    resetDeliveryItems
  } = useDeliveryItems();

  // UI state
  const [showDeliveryOptions, setShowDeliveryOptions] = useState(false);

  // Initialize delivery items when items change
  useEffect(() => {
    if (items && items.length > 0) {
      initializeDeliveryItems(items, fullyDeliveredByDefault);
    }
  }, [items, initializeDeliveryItems, fullyDeliveredByDefault]);

  const resetForm = () => {
    resetPaymentForm();
    resetDeliveryItems();
    setShowDeliveryOptions(false);
  };

  const handleSubmit = () => {
    // For payment tab
    if (!showDeliveryOptions) {
      if (!validatePayment()) return;
    }

    try {
      onSubmitPayment(
        amount,
        paymentMethod,
        notes,
        fullyDelivered,
        partiallyDelivered,
        deliveryItems
      );
      completePayment();
    } catch (error) {
      console.error('Error submitting payment:', error);
      toast.error("Une erreur est survenue lors de la validation");
    }
  };

  return {
    amount,
    remainingAmount,
    paymentMethod,
    notes,
    showDeliveryOptions,
    fullyDelivered,
    partiallyDelivered,
    deliveryItems,
    paymentComplete,
    generatedInvoiceNumber,
    handleAmountChange,
    handleDeliveredChange,
    handleQuantityChange,
    handleFullyDeliveredChange,
    handlePartiallyDeliveredChange,
    setPaymentMethod,
    setNotes,
    setShowDeliveryOptions,
    handleSubmit,
    resetForm
  };
}
