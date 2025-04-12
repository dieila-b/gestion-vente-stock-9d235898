
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Client } from "@/types/client";
import { CartItem } from "@/types/pos";
import { safeClient } from "@/utils/supabase-safe-query";

export default function useEditOrder(
  setSelectedClientFn?: React.Dispatch<React.SetStateAction<Client | null>>,
  setCartFn?: React.Dispatch<React.SetStateAction<CartItem[]>>
) {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Fetch the order details using the ID from params
  const { data: orderData, isLoading: isOrderLoading } = useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      if (!orderId) return null;
      try {
        const { data, error } = await supabase
          .from('orders')
          .select(`
            *,
            client:clients(*),
            items:order_items(
              id,
              product_id,
              quantity,
              price,
              discount,
              total,
              product:catalog(*)
            )
          `)
          .eq('id', orderId)
          .single();

        if (error) throw error;
        return data;
      } catch (error: any) {
        console.error('Error fetching order:', error);
        setError(error.message || 'Error fetching order');
        return null;
      }
    },
    enabled: !!orderId,
  });

  useEffect(() => {
    if (!isOrderLoading && orderData) {
      // Set the client from the order
      if (orderData.client) {
        // Use safeClient to ensure the client has all necessary properties
        const client = safeClient(orderData.client);
        setSelectedClient(client);
        if (setSelectedClientFn) {
          setSelectedClientFn(client);
        }
      }

      // Transform order items to cart items
      if (orderData.items && Array.isArray(orderData.items)) {
        const cartItems: CartItem[] = orderData.items.map((item: any) => ({
          id: item.product_id,
          name: item.product?.name || 'Unknown Product',
          price: item.price,
          quantity: item.quantity,
          discount: item.discount || 0,
          stock: item.product?.stock || 0,
          category: item.product?.category || '',
          image: item.product?.image_url || '',
        }));
        setCart(cartItems);
        if (setCartFn) {
          setCartFn(cartItems);
        }
      }

      setIsLoading(false);
    }
  }, [isOrderLoading, orderData, setSelectedClientFn, setCartFn]);

  return {
    orderId,
    isLoading: isLoading || isOrderLoading,
    selectedClient,
    setSelectedClient,
    cart,
    setCart,
    error,
    orderData,
    navigate,
  };
}
