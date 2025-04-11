
import { useState } from "react";
import { Client } from "@/types/client";
import { CartItem } from "@/types/pos";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { isSelectQueryError } from "@/utils/supabase-helpers";

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
}: {
  selectedClient: Client | null;
  cart: CartItem[];
  calculateTotal: () => number;
  calculateSubtotal: () => number;
  calculateTotalDiscount: () => number;
  clearCart: () => void;
  selectedPDV: string;
  activeRegister: any;
  refetchStock: () => void;
  editOrderId?: string | null;
}) {
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
      // Validate client
      if (!selectedClient) {
        toast.error("Veuillez sélectionner un client");
        setIsLoading(false);
        return;
      }

      // Determine delivery status
      let deliveryStatus = 'pending';
      if (delivered) {
        deliveryStatus = 'delivered';
      } else if (partiallyDelivered) {
        deliveryStatus = 'partial';
      } else {
        // This is the "awaiting delivery" status
        deliveryStatus = 'awaiting';
      }

      // Calculate values
      const subtotal = calculateSubtotal();
      const discount = calculateTotalDiscount();
      const total = calculateTotal();
      const remaining = Math.max(0, total - amount);
      const paymentStatus = amount >= total ? 'paid' : amount > 0 ? 'partial' : 'pending';

      // Create or update order
      const orderData = {
        client_id: selectedClient.id,
        discount,
        total: subtotal,
        final_total: total,
        paid_amount: amount,
        remaining_amount: remaining,
        payment_status: paymentStatus,
        delivery_status: deliveryStatus,
        comment: notes || ''
      };

      // If editing, update existing order; otherwise create new one
      let orderId;
      if (editOrderId) {
        const { data: updatedOrder, error: updateError } = await supabase
          .from('orders')
          .update(orderData)
          .eq('id', editOrderId)
          .select('id')
          .single();
          
        if (updateError) throw updateError;
        orderId = updatedOrder.id;
        
        // Delete existing items to replace them
        const { error: deleteError } = await supabase
          .from('order_items')
          .delete()
          .eq('order_id', orderId);
          
        if (deleteError) throw deleteError;
      } else {
        const { data: newOrder, error: createError } = await supabase
          .from('orders')
          .insert(orderData)
          .select('id')
          .single();
          
        if (createError) throw createError;
        orderId = newOrder.id;
      }

      // Create or update order items
      const orderItems = cart.map(item => {
        // Determine delivered quantity based on deliveredItems parameter or from cart item's deliveredQuantity
        const deliveredQty = deliveredItems?.[item.id]?.quantity || 
                            (item.deliveredQuantity !== undefined ? item.deliveredQuantity : 
                            (delivered ? item.quantity : 0));
        
        return {
          order_id: orderId,
          product_id: item.id,
          quantity: item.quantity,
          price: item.price,
          discount: item.discount || 0,
          delivered_quantity: deliveredQty,
          total: (item.price - (item.discount || 0)) * item.quantity
        };
      });

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);
        
      if (itemsError) throw itemsError;

      // Record payment if amount > 0
      if (amount > 0) {
        const { error: paymentError } = await supabase
          .from('order_payments')
          .insert({
            order_id: orderId,
            amount,
            payment_method: method,
            notes
          });
          
        if (paymentError) throw paymentError;

        // Update cash register for cash payments
        if (method === 'cash' && activeRegister) {
          const { error: cashError } = await supabase
            .from('cash_register_transactions')
            .insert({
              cash_register_id: activeRegister.id,
              type: 'deposit',
              amount,
              description: `Encaissement vente #${orderId}`
            });
            
          if (cashError) throw cashError;
        }
      }

      // Clear cart and refresh stock data
      refetchStock();
      clearCart();
      
      toast.success(editOrderId ? "Facture modifiée avec succès" : "Paiement enregistré avec succès");
    } catch (error) {
      console.error('Error processing payment:', error);
      toast.error("Erreur lors du traitement du paiement");
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
