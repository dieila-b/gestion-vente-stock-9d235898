
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
    console.log('=== DÉBUT DU PROCESSUS DE PAIEMENT ===');
    console.log('Cart avant traitement:', cart);
    console.log('Fonction clearCart disponible:', typeof clearCart);
    
    try {
      let deliveryStatus = 'pending';
      if (delivered) {
        deliveryStatus = 'delivered';
      } else if (partiallyDelivered) {
        deliveryStatus = 'partial';
      } else {
        deliveryStatus = 'awaiting';
      }

      console.log('=== TRAITEMENT DE LA COMMANDE ===');
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

      console.log('=== COMMANDE TRAITÉE AVEC SUCCÈS ===');
      console.log('Order ID:', order.id);

      // Record the payment
      await recordPayment(order.id, amount, method, notes, editOrderId);

      console.log('=== PAIEMENT ENREGISTRÉ AVEC SUCCÈS ===');

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
      
      console.log('=== VIDAGE DU PANIER ===');
      console.log('Cart avant vidage:', cart);
      
      // Clear the cart FIRST
      clearCart();
      
      console.log('=== FONCTION clearCart() APPELÉE ===');
      
      // Close the payment dialog AFTER clearing cart
      setIsPaymentDialogOpen(false);
      
      console.log('=== DIALOGUE DE PAIEMENT FERMÉ ===');
      
    } catch (error) {
      console.error('=== ERREUR LORS DU TRAITEMENT DU PAIEMENT ===');
      console.error('Error details:', error);
      console.error('Error message:', (error as Error).message);
      
      // IMPORTANT: Vider le panier même en cas d'erreur pour éviter les problèmes
      console.log('=== VIDAGE DU PANIER EN CAS D\'ERREUR ===');
      clearCart();
      setIsPaymentDialogOpen(false);
      
      toast.error("Erreur lors du traitement du paiement: " + (error as Error).message);
    } finally {
      setIsLoading(false);
      console.log('=== FIN DU PROCESSUS DE PAIEMENT ===');
    }
  };

  return {
    isPaymentDialogOpen,
    setIsPaymentDialogOpen,
    isLoading,
    handlePayment
  };
}
