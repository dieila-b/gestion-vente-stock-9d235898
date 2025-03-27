
import { useState } from "react";
import { toast } from "sonner";
import { processPayment } from "./invoice-payment/useProcessPayment";
import { processDelivery } from "./invoice-payment/useProcessDelivery";

export function useInvoicePayment(refetch: () => void) {
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [showDeliveryTabByDefault, setShowDeliveryTabByDefault] = useState(false);
  const [showPaymentTabByDefault, setShowPaymentTabByDefault] = useState(false);
  const [fullyDeliveredByDefault, setFullyDeliveredByDefault] = useState(false);

  const handlePayment = (invoice: any) => {
    console.log("Opening payment dialog for invoice:", invoice.id);
    setSelectedInvoice(invoice);
    setIsPaymentDialogOpen(true);
  };

  const handleDeliveryUpdate = (invoice: any) => {
    // Show only delivery tab and hide payment tab
    setShowDeliveryTabByDefault(true);
    setShowPaymentTabByDefault(false);
    // Set fully delivered to false by default for delivery updates
    setFullyDeliveredByDefault(false);
    // Open delivery update dialog
    setSelectedInvoice(invoice);
    setIsPaymentDialogOpen(true);
  };

  // Handle payment only - specific function for payments
  const handlePaymentOnly = (invoice: any) => {
    // Show payment tab by default and hide delivery tab
    setShowDeliveryTabByDefault(false);
    setShowPaymentTabByDefault(true);
    setFullyDeliveredByDefault(false);
    // Call the standard payment function
    handlePayment(invoice);
  };

  const handleSubmitPayment = async (
    amount: number, 
    method: string, 
    notes?: string, 
    delivered?: boolean, 
    partiallyDelivered?: boolean, 
    deliveredItems?: Record<string, { delivered: boolean, quantity: number }>
  ) => {
    try {
      console.log("=== HANDLING SUBMISSION ===");
      console.log("Payment data - Amount:", amount, "Method:", method);
      console.log("Delivery data - Delivered:", delivered, "Partially:", partiallyDelivered);
      console.log("Delivery items:", deliveredItems);
      
      // Track which processes were executed
      let paymentProcessed = false;
      let deliveryProcessed = false;
      
      // PAYMENT PROCESS - Only process if we're in payment tab mode
      // Don't process payment if showDeliveryTabByDefault is true (delivery-only mode)
      let paymentResult = null;
      if (!showDeliveryTabByDefault && amount > 0) {
        console.log("Processing payment...");
        // Create a deep copy of the selected invoice for the payment process
        const paymentCopy = JSON.parse(JSON.stringify(selectedInvoice));
        
        paymentResult = await processPayment(paymentCopy, amount, method, notes);
        
        if (paymentResult) {
          console.log("Payment successful, updating local invoice state");
          setSelectedInvoice(prevInvoice => ({
            ...prevInvoice,
            paid_amount: paymentResult.paid_amount,
            remaining_amount: paymentResult.remaining_amount,
            payment_status: paymentResult.payment_status
          }));
          paymentProcessed = true;
        }
      } else {
        console.log("Delivery-only mode or no payment amount, skipping payment process");
      }

      // DELIVERY PROCESS - Only process if we're in delivery tab mode
      // Don't process delivery if showPaymentTabByDefault is true (payment-only mode)
      let deliveryResult = null;
      if (!showPaymentTabByDefault && 
          (delivered !== undefined || partiallyDelivered !== undefined || deliveredItems !== undefined)) {
        console.log("Processing delivery update...");
        // Create a separate copy for delivery to ensure complete independence
        const deliveryCopy = JSON.parse(JSON.stringify(selectedInvoice));
        
        deliveryResult = await processDelivery(
          deliveryCopy, 
          delivered, 
          partiallyDelivered, 
          deliveredItems
        );
        
        if (deliveryResult) {
          console.log("Delivery update successful, updating local invoice state");
          setSelectedInvoice(prevInvoice => ({
            ...prevInvoice,
            delivery_status: deliveryResult.delivery_status,
            items: deliveryResult.items || prevInvoice.items
          }));
          deliveryProcessed = true;
        }
      } else {
        console.log("Payment-only mode or no delivery data, skipping delivery process");
      }

      // Only refetch if any process was executed
      if (paymentProcessed || deliveryProcessed) {
        console.log("Changes made, refreshing invoice list");
        refetch();
        
        // Show appropriate success message
        if (paymentProcessed && deliveryProcessed) {
          toast.success("Paiement et mise à jour de livraison effectués avec succès");
        } else if (paymentProcessed) {
          toast.success("Paiement effectué avec succès");
        } else if (deliveryProcessed) {
          toast.success("Mise à jour de livraison effectuée avec succès");
        }
      } else {
        console.log("No changes were made");
      }
      
      // Close the dialog
      setIsPaymentDialogOpen(false);
    } catch (error) {
      console.error('Error processing updates:', error);
      toast.error("Erreur lors de la mise à jour");
    }
  };

  return {
    isPaymentDialogOpen,
    setIsPaymentDialogOpen,
    selectedInvoice,
    setSelectedInvoice,
    handlePayment: handlePaymentOnly,
    handleDeliveryUpdate,
    handleSubmitPayment,
    showDeliveryTabByDefault, 
    setShowDeliveryTabByDefault,
    showPaymentTabByDefault,
    setShowPaymentTabByDefault,
    fullyDeliveredByDefault,
    setFullyDeliveredByDefault
  };
}
