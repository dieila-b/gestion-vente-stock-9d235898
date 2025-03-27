
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CartItem } from "@/types/pos";
import { toast } from "sonner";

export function useOrders() {
  const queryClient = useQueryClient();

  const createOrderMutation = useMutation({
    mutationFn: async ({ 
      orderId,
      cart, 
      subtotal, 
      discount, 
      final_total,
      client_id,
      depot,
      comment,
      paidAmount,
      paymentMethod,
      paymentNotes,
      payment_status,
      remaining_amount
    }: { 
      orderId?: string,
      cart: CartItem[],
      subtotal: number,
      discount: number,
      final_total: number,
      client_id?: string,
      depot?: string,
      comment?: string,
      paidAmount?: number,
      paymentMethod?: string,
      paymentNotes?: string,
      payment_status?: string,
      remaining_amount?: number
    }) => {
      let order;
      
      if (orderId) {
        const { data: updatedOrder, error: updateError } = await supabase
          .from('orders')
          .update({
            total: subtotal,
            discount,
            final_total,
            client_id,
            depot,
            comment,
            paid_amount: paidAmount || 0,
            remaining_amount: remaining_amount || 0,
            payment_status
          })
          .eq('id', orderId)
          .select()
          .single();

        if (updateError) throw updateError;
        order = updatedOrder;
      } else {
        const { data: newOrder, error: orderError } = await supabase
          .from('orders')
          .insert([{
            total: subtotal,
            discount,
            final_total,
            status: 'completed',
            client_id,
            depot,
            comment,
            paid_amount: paidAmount || 0,
            remaining_amount: remaining_amount || 0,
            payment_status: payment_status || 'pending'
          }])
          .select()
          .single();

        if (orderError) throw orderError;
        order = newOrder;
      }

      const orderItems = cart.map(item => ({
        order_id: order.id,
        product_id: item.id,
        quantity: item.quantity,
        price: item.price,
        total: item.price * item.quantity,
        discount: item.discount || 0
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Mise à jour du stock
      for (const item of cart) {
        const { data: stockData, error: stockError } = await supabase
          .from('warehouse_stock')
          .select('quantity')
          .eq('pos_location_id', depot)
          .eq('product_id', item.id)
          .single();

        if (stockError) throw stockError;

        if (stockData) {
          const newQuantity = stockData.quantity - item.quantity;
          const { error: updateError } = await supabase
            .from('warehouse_stock')
            .update({ 
              quantity: newQuantity,
              total_value: newQuantity * item.price
            })
            .eq('pos_location_id', depot)
            .eq('product_id', item.id);

          if (updateError) throw updateError;
        }
      }

      if (paidAmount && paidAmount > 0) {
        const { error: paymentError } = await supabase
          .from('order_payments')
          .insert([{
            order_id: order.id,
            amount: paidAmount,
            payment_method: paymentMethod || 'cash',
            notes: paymentNotes
          }]);

        if (paymentError) throw paymentError;
      }

      return order;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['warehouse-stock'] });
    },
    onError: (error) => {
      console.error('Error creating order:', error);
    }
  });

  const updateOrderMutation = useMutation({
    mutationFn: async ({ 
      id, 
      discount, 
      status 
    }: { 
      id: string,
      discount?: number,
      status?: string 
    }) => {
      const { data, error } = await supabase
        .from('orders')
        .update({ discount, status })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast.success("Transaction mise à jour avec succès");
    },
    onError: (error) => {
      console.error('Error updating order:', error);
      toast.error("Erreur lors de la mise à jour de la transaction");
    }
  });

  const deleteOrderMutation = useMutation({
    mutationFn: async (id: string) => {
      // D'abord supprimer les order_items associés
      const { error: itemsError } = await supabase
        .from('order_items')
        .delete()
        .eq('order_id', id);

      if (itemsError) throw itemsError;

      // Ensuite supprimer la commande
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast.success("Transaction supprimée avec succès");
    },
    onError: (error) => {
      console.error('Error deleting order:', error);
      toast.error("Erreur lors de la suppression de la transaction");
    }
  });

  return { 
    createOrderMutation,
    updateOrderMutation,
    deleteOrderMutation
  };
}
