
import { useState } from "react";
import { Client } from "@/types/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { createPreorder } from "./utils/useCreatePreorder";
import { preparePreorderItems, savePreorderItems, determinePreorderStatus } from "./utils/usePreorderItems";
import { updateProductStock } from "./utils/useStockUpdates";
import { processPayment } from "./utils/usePaymentProcessing";
import { setupPreorderSubscription } from "./utils/usePreorderSubscription";

export function usePreorderPayment(
  selectedClient: Client | null,
  cart: any[],
  clearCart: () => void,
  setShowPaymentDialog: (show: boolean) => void,
  setCurrentPreorder: (preorder: any) => void,
  setShowInvoiceDialog: (show: boolean) => void,
  isEditing: boolean,
  editId: string | null,
  setIsLoading: (loading: boolean) => void
) {
  const navigate = useNavigate();

  const handleCheckout = (validatePreorder: () => boolean) => {
    console.log("Preorders: handleCheckout called");
    if (!validatePreorder()) return;
    
    setShowPaymentDialog(true);
  };

  const handlePayment = async (amount: number, paymentMethod: string, notes?: string, delivered?: boolean) => {
    if (!selectedClient) {
      toast.warning("Veuillez sélectionner un client pour finaliser la précommande");
      return;
    }
    
    if (cart.length === 0) {
      toast.error("Veuillez ajouter des produits à la précommande");
      return;
    }
    
    setIsLoading(true);
    try {
      // Calculate totals
      const totalAmount = cart.reduce((acc, item) => {
        const unitPriceAfterDiscount = item.price - (item.discount || 0);
        return acc + (unitPriceAfterDiscount * item.quantity);
      }, 0);
      
      const remainingAmount = totalAmount - amount;

      // Prepare preorder items
      const preorderItems = preparePreorderItems(cart);
      const preorderStatus = determinePreorderStatus(preorderItems);

      // Create preorder
      const preorder = await createPreorder({
        clientId: selectedClient.id,
        totalAmount,
        paidAmount: amount,
        remainingAmount,
        status: preorderStatus,
        notes
      }, isEditing, editId);

      // Save preorder items
      await savePreorderItems(preorderItems, preorder.id);

      // Update product stock
      await updateProductStock(cart);

      // Process payment if amount > 0
      if (amount > 0) {
        await processPayment(selectedClient.id, amount, paymentMethod, preorder.id);
      }

      // Success handling
      toast.success(isEditing ? "Précommande modifiée avec succès" : "Précommande enregistrée avec succès");
      setCurrentPreorder({
        ...preorder,
        client: selectedClient,
        items: cart,
        payment_status: remainingAmount > 0 ? 'partial' : 'paid',
        paid_amount: amount,
        remaining_amount: remainingAmount
      });
      setShowPaymentDialog(false);
      
      if (isEditing) {
        navigate('/preorder-invoices');
      } else {
        setShowInvoiceDialog(true);
      }
      
      // Set up subscription to monitor preorder status changes
      const unsubscribe = setupPreorderSubscription(preorder.id);
      
      // Auto-unsubscribe after 30 minutes
      setTimeout(unsubscribe, 30 * 60 * 1000);
    } catch (error) {
      console.error('Error creating preorder:', error);
      toast.error(isEditing ? "Erreur lors de la modification de la précommande" : "Erreur lors de l'enregistrement de la précommande");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    handleCheckout,
    handlePayment
  };
}
