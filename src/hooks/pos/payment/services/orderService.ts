
import { supabase } from "@/integrations/supabase/client";
import { Client } from "@/types/client";

export const createOrder = async (
  selectedClient: Client | null,
  subtotal: number,
  totalDiscount: number,
  total: number,
  deliveryStatus: string,
  paidAmount: number,
  notes?: string
) => {
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
  return newOrder;
};

export const updateOrder = async (
  editOrderId: string,
  selectedClient: Client | null,
  subtotal: number,
  totalDiscount: number,
  total: number,
  deliveryStatus: string,
  paidAmount: number,
  notes?: string
) => {
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
  return updatedOrder;
};
