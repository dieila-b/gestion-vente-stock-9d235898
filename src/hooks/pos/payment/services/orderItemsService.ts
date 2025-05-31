
import { supabase } from "@/integrations/supabase/client";
import { CartItem } from "@/types/pos";

export const deleteExistingOrderItems = async (orderId: string) => {
  const { error: deleteItemsError } = await supabase
    .from('order_items')
    .delete()
    .eq('order_id', orderId);
    
  if (deleteItemsError) throw deleteItemsError;
};

export const createOrderItems = async (
  orderId: string, 
  cart: CartItem[], 
  deliveryStatus: string,
  deliveredItems?: Record<string, { delivered: boolean, quantity: number }>
) => {
  const delivered = deliveryStatus === 'delivered';
  const partiallyDelivered = deliveryStatus === 'partial';

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
