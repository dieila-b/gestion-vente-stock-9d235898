
import { useState, useEffect } from "react";
import { usePaymentDialog } from "@/hooks/pos/use-payment-dialog";
import { PaymentDialogHeader } from "./components/PaymentDialogHeader";
import { PaymentDialogFooter } from "./components/PaymentDialogFooter";
import { PaymentDialogTabs } from "./components/PaymentDialogTabs";
import { InvoiceCompletionStatus } from "./components/InvoiceCompletionStatus";

interface CartItemInfo {
  id: string;
  name: string;
  quantity: number;
}

interface PaymentDialogContentProps {
  totalAmount: number;
  onClose: () => void;
  onSubmitPayment: (
    amount: number, 
    method: string, 
    notes?: string, 
    delivered?: boolean, 
    partiallyDelivered?: boolean,
    deliveredItems?: Record<string, { delivered: boolean, quantity: number }>
  ) => void;
  items: CartItemInfo[];
  client?: any;
  isAlreadyPaid?: boolean;
  showDeliveryTabByDefault?: boolean;
  showPaymentTabByDefault?: boolean;
  fullyDeliveredByDefault?: boolean;
}

export function PaymentDialogContent({ 
  totalAmount, 
  onClose, 
  onSubmitPayment,
  items = [],
  client,
  isAlreadyPaid = false,
  showDeliveryTabByDefault = false,
  showPaymentTabByDefault = false,
  fullyDeliveredByDefault = false
}: PaymentDialogContentProps) {
  // Track active tab to determine which submit action to perform
  const [activeTab, setActiveTab] = useState<string>(
    showDeliveryTabByDefault ? "delivery" : "payment"
  );

  const {
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
  } = usePaymentDialog({
    totalAmount,
    onSubmitPayment,
    items,
    isAlreadyPaid,
    fullyDeliveredByDefault
  });

  // Update showDeliveryOptions when activeTab changes
  useEffect(() => {
    setShowDeliveryOptions(activeTab === "delivery");
  }, [activeTab, setShowDeliveryOptions]);

  // Combine the reset function with the onClose prop
  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Calculate statuses entirely separately - each only depends on its own parameters
  // Payment status has no impact on delivery status and vice versa
  const paymentStatus = amount >= totalAmount ? 'paid' : amount > 0 ? 'partial' : 'pending';
  const deliveryStatus = fullyDelivered ? 'delivered' : partiallyDelivered ? 'partial' : 'awaiting';

  // Show invoice completion status if payment is complete
  const showInvoiceCompletionStatus = paymentComplete && !isAlreadyPaid;
  if (showInvoiceCompletionStatus) {
    return (
      <InvoiceCompletionStatus
        paymentComplete={paymentComplete}
        isAlreadyPaid={isAlreadyPaid}
        generatedInvoiceNumber={generatedInvoiceNumber}
        items={items}
        totalAmount={totalAmount}
        amount={amount}
        client={client}
        onClose={handleClose}
        paymentStatus={paymentStatus}
        deliveryStatus={deliveryStatus}
        remainingAmount={remainingAmount}
      />
    );
  }

  // Determine default tab based on props
  let defaultTab = "payment";
  
  if (showDeliveryTabByDefault) {
    defaultTab = "delivery";
  } else if (showPaymentTabByDefault) {
    defaultTab = "payment";
  } else if (isAlreadyPaid) {
    defaultTab = "delivery";
  }

  // Modify tab disabling logic to prevent switching between tabs
  // If showPaymentTabByDefault is true, disable delivery tab
  const isDeliveryTabDisabled = showPaymentTabByDefault;
  // If showDeliveryTabByDefault is true, disable payment tab
  const isPaymentTabDisabled = showDeliveryTabByDefault;

  return (
    <>
      <PaymentDialogHeader activeTab={activeTab} />
      
      <PaymentDialogTabs
        defaultTab={defaultTab}
        onTabChange={setActiveTab}
        totalAmount={totalAmount}
        amount={amount}
        remainingAmount={remainingAmount}
        paymentMethod={paymentMethod}
        notes={notes}
        onAmountChange={handleAmountChange}
        onPaymentMethodChange={setPaymentMethod}
        onNotesChange={(e) => setNotes(e.target.value)}
        items={items}
        fullyDelivered={fullyDelivered}
        partiallyDelivered={partiallyDelivered}
        deliveryItems={deliveryItems}
        onFullyDeliveredChange={handleFullyDeliveredChange}
        onPartiallyDeliveredChange={handlePartiallyDeliveredChange}
        onDeliveredChange={handleDeliveredChange}
        onQuantityChange={handleQuantityChange}
        isPaymentTabDisabled={isPaymentTabDisabled}
        isDeliveryTabDisabled={isDeliveryTabDisabled}
      />
      
      <PaymentDialogFooter 
        onClose={handleClose} 
        onSubmit={handleSubmit} 
        activeTab={activeTab} 
      />
    </>
  );
}
