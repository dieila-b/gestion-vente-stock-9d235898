
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Client } from "@/types/client_unified";
import { CartItem } from "@/types/CartState";
import { isSelectQueryError } from "@/utils/type-utils";

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
      if (orderData.client && !isSelectQueryError(orderData.client)) {
        const clientData = orderData.client;
        // Create client data with safe defaults for potential missing properties
        const client: Client = {
          id: clientData.id || '',
          company_name: clientData.company_name || '',
          contact_name: clientData.contact_name || '',
          email: clientData.email || '',
          phone: clientData.phone || '',
          mobile_1: clientData.mobile_1 || '',   // Handle potential undefined properties
          mobile_2: clientData.mobile_2 || '',   // Handle potential undefined properties
          whatsapp: clientData.whatsapp || '',   // Handle potential undefined properties
          credit_limit: clientData.credit_limit || 0, // Handle potential undefined properties
          rc_number: clientData.rc_number || '', // Handle potential undefined properties
          cc_number: clientData.cc_number || '', // Handle potential undefined properties
          status: clientData.status || 'active', // Handle potential undefined properties
          address: clientData.address || '',
          city: clientData.city || '',
          state: clientData.state || '',
          country: clientData.country || '',
          postal_code: clientData.postal_code || '',
          balance: clientData.balance || 0,
          client_type: clientData.client_type || '',
          client_code: clientData.client_code || '',
          notes: clientData.notes || '',
          created_at: clientData.created_at || new Date().toISOString(),
          updated_at: clientData.updated_at || new Date().toISOString()
        };
        setSelectedClient(client);
        if (setSelectedClientFn) {
          setSelectedClientFn(client);
        }
      }

      if (orderData.items && Array.isArray(orderData.items)) {
        const cartItems: CartItem[] = orderData.items.map((item: any) => ({
          id: item.product_id,
          product_id: item.product_id,
          name: item.product?.name || 'Unknown Product',
          price: item.price,
          quantity: item.quantity,
          discount: item.discount || 0,
          stock: item.product?.stock || 0,
          category: item.product?.category || '',
          image_url: item.product?.image_url || '',
          reference: item.product?.reference || '',
          created_at: item.product?.created_at || '',
          updated_at: item.product?.updated_at || '',
          subtotal: item.price * item.quantity
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
