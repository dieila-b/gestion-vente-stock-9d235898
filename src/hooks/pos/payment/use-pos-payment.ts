
import { useState } from "react";
import { CartItem } from "@/types/pos";
import { Client } from "@/types/client";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";

interface PaymentHookProps {
  selectedClient: Client | null;
  cart: CartItem[];
  calculateTotal: () => number;
  calculateSubtotal: () => number;
  calculateTotalDiscount: () => number;
  clearCart: () => void;
  selectedPDV?: string;
  activeRegister?: string | null;
  refetchStock?: () => void;
  editOrderId?: string | null;
}

export function usePOSPayment({
  selectedClient,
  cart,
  calculateTotal,
  calculateSubtotal,
  calculateTotalDiscount,
  clearCart,
  selectedPDV,
  activeRegister,
  refetchStock,
  editOrderId
}: PaymentHookProps) {
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handlePayment = async (
    amount: number,
    paymentMethod: string,
    notes?: string,
    delivered = false
  ) => {
    if (!selectedClient) {
      toast.error("Veuillez sélectionner un client");
      return;
    }

    if (cart.length === 0) {
      toast.error("Le panier est vide");
      return;
    }

    setIsLoading(true);

    try {
      const orderId = editOrderId || uuidv4();
      const orderTotal = calculateTotal();
      const subtotal = calculateSubtotal();
      const discount = calculateTotalDiscount();
      
      // Prepare order data
      const orderData = {
        id: orderId,
        client_id: selectedClient.id,
        total: subtotal,
        discount,
        final_total: orderTotal,
        paid_amount: amount,
        remaining_amount: orderTotal - amount,
        payment_status: amount >= orderTotal ? "paid" : amount > 0 ? "partial" : "pending",
        pos_location_id: selectedPDV || activeRegister,
        cash_register_id: activeRegister,
        comment: notes
      };

      let orderResult;
      
      // If editing an existing order
      if (editOrderId) {
        // Update the existing order
        const { data, error } = await supabase
          .from("orders")
          .update(orderData)
          .eq("id", editOrderId)
          .select()
          .single();

        if (error) throw error;
        orderResult = data;

        // Delete existing order items to replace them
        await supabase.from("order_items").delete().eq("order_id", editOrderId);
      } else {
        // Create a new order
        const { data, error } = await supabase
          .from("orders")
          .insert(orderData)
          .select()
          .single();

        if (error) throw error;
        orderResult = data;
      }

      // Prepare order items
      const orderItems = cart.map((item) => ({
        order_id: orderId,
        product_id: item.id,
        quantity: item.quantity,
        price: item.price,
        discount: item.discount || 0,
        total: (item.price * item.quantity) - (item.discount || 0),
        delivered_quantity: delivered ? item.quantity : item.deliveredQuantity || 0,
        delivery_status: delivered ? "delivered" : "pending"
      }));

      // Insert order items
      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Create payment record if amount > 0
      if (amount > 0) {
        const { error: paymentError } = await supabase
          .from("payments")
          .insert({
            client_id: selectedClient.id,
            amount,
            payment_method: paymentMethod,
            notes: `Payment for order #${orderId}`
          });

        if (paymentError) throw paymentError;
      }

      toast.success(
        editOrderId
          ? "Commande mise à jour avec succès"
          : "Commande créée avec succès"
      );

      // Update inventory if delivered
      if (delivered && selectedPDV !== "_all") {
        for (const item of cart) {
          const { error: stockError } = await supabase
            .from("warehouse_stock")
            .update({
              quantity: supabase.rpc("decrement", {
                x: item.quantity
              })
            })
            .eq("product_id", item.id)
            .eq("pos_location_id", selectedPDV);

          if (stockError) {
            console.error("Error updating stock:", stockError);
            toast.error(`Erreur lors de la mise à jour du stock: ${stockError.message}`);
          }
        }
      }

      // Reset cart and refresh
      clearCart();
      if (refetchStock) {
        refetchStock();
      }

      return orderResult;
    } catch (error) {
      console.error("Error processing payment:", error);
      toast.error("Erreur lors du traitement du paiement");
      return null;
    } finally {
      setIsLoading(false);
      setIsPaymentDialogOpen(false);
    }
  };

  return {
    isPaymentDialogOpen,
    setIsPaymentDialogOpen,
    isLoading,
    handlePayment
  };
}
