
import { useState } from "react";
import { Client } from "@/types/client";
import { CartItem } from "@/types/pos";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { updateProductStock } from "@/components/preorder/hooks/utils/useStockUpdates";

export function useOrderProcessing(
  stockItems: any[],
  selectedPDV: string
) {
  const [isProcessing, setIsProcessing] = useState(false);

  const processOrder = async (
    selectedClient: Client | null,
    cart: CartItem[],
    subtotal: number,
    totalDiscount: number,
    totalAmount: number,
    deliveryStatus: string = 'pending',
    paidAmount: number = 0,
    notes?: string,
    deliveredItems?: Record<string, { delivered: boolean, quantity: number }>,
    editOrderId?: string | null
  ) => {
    if (!selectedClient) {
      toast.error("Please select a client");
      throw new Error("No client selected");
    }

    setIsProcessing(true);

    try {
      // Process cart items, either creating or updating order items
      const orderItems = cart.map(item => {
        // Check for delivered items
        const isItemDelivered = deliveredItems?.[item.id]?.delivered ?? false;
        const deliveredQuantity = isItemDelivered ? (deliveredItems?.[item.id]?.quantity ?? item.quantity) : 0;

        return {
          product_id: item.id,
          quantity: item.quantity,
          price: item.price,
          discount: item.discount || 0,
          delivered_quantity: deliveredQuantity,
          delivery_status: isItemDelivered ? 'delivered' : 'pending',
          total: (item.price - (item.discount || 0)) * item.quantity
        };
      });

      // Calculate remaining amount
      const remainingAmount = Math.max(0, totalAmount - paidAmount);

      // Determine payment status
      const paymentStatus = paidAmount >= totalAmount 
        ? 'paid' 
        : paidAmount > 0 
          ? 'partial' 
          : 'pending';

      let order;

      if (editOrderId) {
        // Update existing order
        const { data: updatedOrder, error: updateError } = await supabase
          .from("orders")
          .update({
            client_id: selectedClient.id,
            total: subtotal,
            discount: totalDiscount,
            final_total: totalAmount,
            status: 'completed',
            delivery_status: deliveryStatus,
            payment_status: paymentStatus,
            paid_amount: paidAmount,
            remaining_amount: remainingAmount,
            comment: notes || ""
          })
          .eq("id", editOrderId)
          .select()
          .single();

        if (updateError) throw updateError;
        order = updatedOrder;

        // Delete all existing order items
        const { error: deleteError } = await supabase
          .from("order_items")
          .delete()
          .eq("order_id", editOrderId);

        if (deleteError) throw deleteError;

        // Add new order items
        const { error: itemsError } = await supabase
          .from("order_items")
          .insert(orderItems.map(item => ({ ...item, order_id: editOrderId })));

        if (itemsError) throw itemsError;
      } else {
        // Create new order
        const { data: newOrder, error: createError } = await supabase
          .from("orders")
          .insert([{
            client_id: selectedClient.id,
            total: subtotal,
            discount: totalDiscount,
            final_total: totalAmount,
            status: 'completed',
            delivery_status: deliveryStatus,
            payment_status: paymentStatus,
            paid_amount: paidAmount,
            remaining_amount: remainingAmount,
            comment: notes || ""
          }])
          .select()
          .single();

        if (createError) throw createError;
        order = newOrder;

        // Add order items
        const { error: itemsError } = await supabase
          .from("order_items")
          .insert(orderItems.map(item => ({ ...item, order_id: order.id })));

        if (itemsError) throw itemsError;
      }

      // Update stock for delivered items
      if (deliveryStatus === 'delivered' || deliveryStatus === 'partial') {
        await updateStock(cart, deliveredItems);
      }

      return order;
    } catch (error) {
      console.error("Error processing order:", error);
      toast.error("Error processing order");
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  // Helper function to update stock quantities
  const updateStock = async (
    cart: CartItem[],
    deliveredItems?: Record<string, { delivered: boolean, quantity: number }>
  ) => {
    try {
      for (const item of cart) {
        // Skip items that aren't marked as delivered
        const isDelivered = deliveredItems?.[item.id]?.delivered ?? false;
        if (!isDelivered) continue;

        // Find the stock item for this product
        const stockItem = stockItems.find(stock => stock.product_id === item.id);
        if (!stockItem) continue;

        // Calculate how many to subtract from stock
        const deliveredQty = deliveredItems?.[item.id]?.quantity ?? item.quantity;

        // Update the warehouse stock
        const { error } = await supabase
          .from("warehouse_stock")
          .update({ quantity: Math.max(0, stockItem.quantity - deliveredQty) })
          .eq("id", stockItem.id);

        if (error) throw error;
      }
    } catch (error) {
      console.error("Error updating stock:", error);
      throw error;
    }
  };

  return {
    processOrder,
    isProcessing
  };
}
