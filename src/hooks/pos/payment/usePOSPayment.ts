
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

      console.log('=== STARTING PAYMENT PROCESSING ===');
      console.log('Cart items:', cart);
      console.log('Selected client:', selectedClient);
      console.log('Amount:', amount);

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

      console.log('=== ORDER PROCESSED SUCCESSFULLY ===');
      console.log('Order ID:', order.id);

      // Record the payment
      await recordPayment(order.id, amount, method, notes, editOrderId);

      console.log('=== PAYMENT RECORDED SUCCESSFULLY ===');

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
      
      console.log('=== CLEARING CART ===');
      
      // Clear the cart immediately
      clearCart();
      
      console.log('=== CART CLEARED ===');
      
      // Close the payment dialog immediately
      setIsPaymentDialogOpen(false);
      
      console.log('=== PAYMENT DIALOG CLOSED ===');
      
    } catch (error) {
      console.error('=== ERROR PROCESSING PAYMENT ===');
      console.error('Error details:', error);
      console.error('Error message:', (error as Error).message);
      toast.error("Erreur lors du traitement du paiement: " + (error as Error).message);
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
