
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSearchParams } from "react-router-dom";
import { CartItem } from "@/types/CartState";
import { Client } from "@/types/client_unified";

export default function useEditOrder() {
  const [searchParams] = useSearchParams();
  const editOrderId = searchParams.get('editOrder');
  
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { data: orderData } = useQuery({
    queryKey: ['edit-order', editOrderId],
    queryFn: async () => {
      if (!editOrderId) return null;
      
      setIsLoading(true);
      try {
        // Fetch the order with its items and client
        const { data: order, error: orderError } = await supabase
          .from('preorders')
          .select(`
            *,
            client:clients(*),
            items:preorder_items(
              id, 
              product_id, 
              quantity, 
              unit_price, 
              discount,
              total_price,
              product:catalog(*)
            )
          `)
          .eq('id', editOrderId)
          .single();
        
        if (orderError) throw orderError;
        return order;
      } catch (error) {
        console.error("Error fetching order for edit:", error);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    enabled: !!editOrderId
  });

  useEffect(() => {
    if (orderData) {
      // Set the client
      if (orderData.client) {
        // Create a client that matches the expected Client type, handling potentially missing properties
        const clientData = {
          id: orderData.client.id,
          company_name: orderData.client.company_name || '',
          contact_name: orderData.client.contact_name || '',
          email: orderData.client.email || '',
          phone: orderData.client.phone || '',
          address: orderData.client.address || '',
          city: orderData.client.city || '',
          postal_code: orderData.client.postal_code || '',
          country: orderData.client.country || '',
          balance: orderData.client.balance || 0,
          client_code: orderData.client.client_code || '',
          client_type: orderData.client.client_type || '',
          notes: orderData.client.notes || '',
          created_at: orderData.client.created_at,
          updated_at: orderData.client.updated_at,
          // Set optional fields only if they exist
          ...(orderData.client.mobile_1 !== undefined && { mobile_1: orderData.client.mobile_1 }),
          ...(orderData.client.mobile_2 !== undefined && { mobile_2: orderData.client.mobile_2 }),
          ...(orderData.client.whatsapp !== undefined && { whatsapp: orderData.client.whatsapp }),
          ...(orderData.client.credit_limit !== undefined && { credit_limit: orderData.client.credit_limit }),
          ...(orderData.client.rc_number !== undefined && { rc_number: orderData.client.rc_number }),
          ...(orderData.client.cc_number !== undefined && { cc_number: orderData.client.cc_number }),
          ...(orderData.client.status !== undefined && { status: orderData.client.status })
        };
        
        setSelectedClient(clientData as Client);
      }
      
      // Set the cart items
      if (orderData.items && Array.isArray(orderData.items)) {
        const cartItems = orderData.items.map(item => ({
          id: item.id,
          product_id: item.product_id,
          name: item.product?.name || `Unknown Product #${item.product_id}`,
          price: item.unit_price || 0,
          quantity: item.quantity || 1,
          discount: item.discount || 0,
          category: item.product?.category || '',
          subtotal: (item.unit_price * item.quantity) - (item.discount || 0),
          stock: item.product?.stock,
          image_url: item.product?.image_url,
          reference: item.product?.reference,
        }));
        
        setCart(cartItems);
      }
    }
  }, [orderData]);

  return {
    editOrderId,
    selectedClient,
    cart,
    isLoading
  };
}
