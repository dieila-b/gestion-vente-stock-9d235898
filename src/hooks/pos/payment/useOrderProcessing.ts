import { supabase } from "@/integrations/supabase/client";
import { Client } from "@/types/client";
import { CartItem } from "@/types/pos";

export function useOrderProcessing(stockItems: any[], selectedPDV: string) {
  // Process the order (create or update)
  const processOrder = async (
    selectedClient: Client | null,
    cart: CartItem[],
    subtotal: number,
    totalDiscount: number,
    total: number,
    deliveryStatus: string,
    paidAmount: number,
    notes?: string,
    deliveredItems?: Record<string, { delivered: boolean, quantity: number }>,
    editOrderId?: string | null
  ) => {
    let order;
    
    // If we're editing an existing order, update it
    if (editOrderId) {
      const { data: updatedOrder, error: updateError } = await supabase
        .from('orders')
        .update({
          client_id: selectedClient?.id,
          total: subtotal,
          discount: totalDiscount,
          final_total: total,
          status: 'completed',
          delivery_status: deliveryStatus,
          payment_status: paidAmount >= total ? 'paid' : 'partial',
          paid_amount: paidAmount,
          remaining_amount: total - paidAmount,
          comment: notes
        })
        .eq('id', editOrderId)
        .select()
        .single();

      if (updateError) throw updateError;
      order = updatedOrder;
      
      // Delete existing order items to replace them with new ones
      const { error: deleteItemsError } = await supabase
        .from('order_items')
        .delete()
        .eq('order_id', editOrderId);
        
      if (deleteItemsError) throw deleteItemsError;
    } else {
      // Create a new order
      const { data: newOrder, error: orderError } = await supabase
        .from('orders')
        .insert({
          client_id: selectedClient?.id,
          total: subtotal,
          discount: totalDiscount,
          final_total: total,
          status: 'completed',
          delivery_status: deliveryStatus,
          payment_status: paidAmount >= total ? 'paid' : 'partial',
          paid_amount: paidAmount,
          remaining_amount: total - paidAmount,
          comment: notes
        })
        .select()
        .single();

      if (orderError) throw orderError;
      order = newOrder;
    }

    // Calculate whether items are delivered or partially delivered
    const delivered = deliveryStatus === 'delivered';
    const partiallyDelivered = deliveryStatus === 'partial';

    // Create order items
    await createOrderItems(order.id, cart, deliveryStatus, delivered, partiallyDelivered, deliveredItems);
    
    // Update stock levels
    await updateStockLevels(cart, stockItems, selectedPDV);

    // Return the order object with all necessary information
    return {
      id: order.id,
      client: selectedClient,
      items: cart,
      subtotal,
      total_discount: totalDiscount,
      final_total: total,
      payment_status: order.payment_status,
      delivery_status: deliveryStatus,
      paid_amount: paidAmount,
      remaining_amount: order.remaining_amount,
      // Include any other properties needed for the invoice
    };
  };

  // Helper to create order items
  const createOrderItems = async (
    orderId: string, 
    cart: CartItem[], 
    deliveryStatus: string,
    delivered: boolean,
    partiallyDelivered: boolean,
    deliveredItems?: Record<string, { delivered: boolean, quantity: number }>
  ) => {
    const orderItems = cart.map(item => {
      let deliveredQuantity = 0;
      
      if (delivered) {
        deliveredQuantity = item.quantity;
      } else if (partiallyDelivered && deliveredItems && deliveredItems[item.id]) {
        deliveredQuantity = deliveredItems[item.id].quantity;
      }
        
      return {
        order_id: orderId,
        product_id: item.id,
        quantity: item.quantity,
        price: item.price,
        discount: item.discount || 0,
        total: (item.price * item.quantity) - ((item.discount || 0) * item.quantity),
        delivered_quantity: deliveredQuantity
      };
    });

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) throw itemsError;
  };

  // Helper to update stock levels
  const updateStockLevels = async (cart: CartItem[], stockItems: any[], selectedPDV: string) => {
    for (const item of cart) {
      const stockItem = stockItems.find(stock => stock.product_id === item.id && 
        (selectedPDV === "_all" || stock.pos_location_id === selectedPDV));
      
      if (stockItem) {
        const newQuantity = Math.max(0, stockItem.quantity - item.quantity);
        
        const { error: stockError } = await supabase
          .from('warehouse_stock')
          .update({
            quantity: newQuantity,
            total_value: newQuantity * stockItem.unit_price,
            updated_at: new Date().toISOString()
          })
          .eq('id', stockItem.id);
        
        if (stockError) {
          console.error('Error updating stock:', stockError);
        }
      } else {
        console.warn(`Stock not found for product ${item.id} at POS location ${selectedPDV}`);
      }
    }
  };

  return { processOrder };
}
