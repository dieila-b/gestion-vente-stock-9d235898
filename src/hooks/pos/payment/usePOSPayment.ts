
import { useState } from "react";
import { Client } from "@/types/client";
import { CartItem } from "@/types/pos";
import { toast } from "sonner";
import { useOrderProcessing } from "./useOrderProcessing";
import { usePaymentRecording } from "./usePaymentRecording";
import { useInvoicePrinting } from "./useInvoicePrinting";

interface POSPaymentProps {
  selectedClient: Client | null;
  cart: CartItem[];
  calculateTotal: () => number;
  calculateSubtotal: () => number;
  calculateTotalDiscount: () => number;
  clearCart: () => void;
  stockItems: any[];
  selectedPDV: string;
  activeRegister: any;
  refetchStock: () => void;
  editOrderId?: string | null;
}

export function usePOSPayment({
  selectedClient,
  cart,
  calculateTotal,
  calculateSubtotal,
  calculateTotalDiscount,
  clearCart,
  stockItems,
  selectedPDV,
  activeRegister,
  refetchStock,
  editOrderId
}: POSPaymentProps) {
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Import functions from other hooks
  const { processOrder } = useOrderProcessing(stockItems, selectedPDV);
  const { recordPayment } = usePaymentRecording(activeRegister);
  const { openInvoiceInNewWindow } = useInvoicePrinting();

  // Process payment and save order
  const handlePayment = async (
    amount: number, 
    method: string, 
    notes?: string, 
    delivered?: boolean, 
    partiallyDelivered?: boolean, 
    deliveredItems?: Record<string, { delivered: boolean, quantity: number }>
  ) => {
    setIsLoading(true);
    try {
      let deliveryStatus = 'pending';
      if (delivered) {
        deliveryStatus = 'delivered';
      } else if (partiallyDelivered) {
        deliveryStatus = 'partial';
      } else {
        // This is the new "awaiting delivery" status (both delivered and partiallyDelivered are false)
        deliveryStatus = 'awaiting';
      }

      // Process the order (create or update) - this now also creates the sales invoice
      const order = await processOrder(
        selectedClient,
        cart,
        calculateSubtotal(),
        calculateTotalDiscount(),
        calculateTotal(),
        deliveryStatus,
        amount,
        notes,
        deliveredItems,
        editOrderId
      );

      // Record the payment
      await recordPayment(order.id, amount, method, notes, editOrderId);

      // Refresh stock data
      refetchStock();
      
      // Determine payment status based on total and amount paid
      const total = calculateTotal();
      const paymentStatus = amount >= total ? 'paid' : amount > 0 ? 'partial' : 'pending';
      const remainingAmount = Math.max(0, total - amount);
      
      // Open invoice in a new window with all relevant details
      openInvoiceInNewWindow(
        order.id, 
        cart, 
        selectedClient,
        paymentStatus,
        amount,
        remainingAmount,
        deliveryStatus as any,
        deliveredItems
      );
      
      // Success message
      toast.success(editOrderId ? "Facture modifiée avec succès" : "Paiement enregistré avec succès. Facture de vente créée automatiquement.");
      
      // Clear the cart FIRST before closing dialog to ensure it's emptied
      clearCart();
      
      // Small delay to ensure cart clearing is processed
      setTimeout(() => {
        // Close the payment dialog
        setIsPaymentDialogOpen(false);
      }, 100);
      
    } catch (error) {
      console.error('Error processing payment:', error);
      toast.error("Erreur lors du traitement du paiement");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isPaymentDialogOpen,
    setIsPaymentDialogOpen,
    isLoading,
    handlePayment
  };
}
