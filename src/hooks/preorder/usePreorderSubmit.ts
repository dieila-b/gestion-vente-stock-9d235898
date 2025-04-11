
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CartItem } from '@/types/pos';
import { Client } from '@/types/client';
import { v4 as uuidv4 } from 'uuid';

export function usePreorderSubmit() {
  const submitPreorderMutation = useMutation({
    mutationFn: async (data: {
      cart: CartItem[];
      client: Client;
      notes: string;
    }) => {
      const { cart, client, notes } = data;
      
      // Calculate total amount
      const totalAmount = cart.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      );
      
      // Create preorder
      const preorderId = uuidv4();
      const { error: preorderError } = await supabase.from('preorders').insert({
        id: preorderId,
        client_id: client.id,
        total_amount: totalAmount,
        notes: notes,
        status: 'pending',
        paid_amount: 0,
        remaining_amount: totalAmount,
      });
      
      if (preorderError) throw preorderError;
      
      // Create preorder items
      const preorderItems = cart.map(item => ({
        preorder_id: preorderId,
        product_id: item.id,
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.price * item.quantity,
        discount: item.discount || 0,
        status: 'pending'
      }));
      
      const { error: itemsError } = await supabase
        .from('preorder_items')
        .insert(preorderItems);
        
      if (itemsError) throw itemsError;
      
      return { preorderId };
    }
  });
  
  const submitPreorder = async (
    cart: CartItem[],
    client: Client,
    notes: string
  ) => {
    return submitPreorderMutation.mutateAsync({ cart, client, notes });
  };
  
  return { submitPreorder };
}
