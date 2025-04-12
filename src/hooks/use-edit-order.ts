import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Client } from "@/types/client_unified";
import { CartItem } from "@/types/pos";

interface OrderData {
  id: string;
  client_id: string;
  total_amount: number;
  paid_amount: number;
  remaining_amount: number;
  status: string;
  notes: string;
  created_at: string;
  updated_at: string;
  client?: Client | null;
  items?: CartItem[];
}

const useEditOrder = () => {
  const [orderId, setOrderId] = useState<string | null>(null);
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const editId = searchParams.get('editOrder');
    setOrderId(editId);
  }, []);

  useEffect(() => {
    const fetchOrderData = async () => {
      if (!orderId) return;

      setIsLoading(true);
      try {
        const { data: order, error: orderError } = await supabase
          .from('orders')
          .select(`
            id,
            client_id,
            total_amount,
            paid_amount,
            remaining_amount,
            status,
            notes,
            created_at,
            updated_at,
            client:clients(*),
            items:order_items(
              id,
              product_id,
              quantity,
              unit_price,
              total_price,
              product:catalog(id, name, price, category, reference, image_url)
            )
          `)
          .eq('id', orderId)
          .single();

        if (orderError) {
          throw orderError;
        }

        if (order) {
          // Format client data
          const clientData = order.client;

          // Handle client data with optional properties
          const formattedClient = clientData ? {
            id: clientData.id || '',
            contact_name: clientData.contact_name || '',
            company_name: clientData.company_name || '',
            email: clientData.email || '',
            phone: clientData.phone || '',
            address: clientData.address || '',
            city: clientData.city || '',
            country: clientData.country || '',
            client_type: clientData.client_type || '',
            client_code: clientData.client_code || '',
            // Handle optional fields safely
            mobile_1: clientData.phone || '', // Fallback to phone if mobile_1 is not available
            mobile_2: clientData.phone || '', // Fallback to phone if mobile_2 is not available
            whatsapp: clientData.phone || '', // Fallback to phone if whatsapp is not available
            credit_limit: clientData.balance || 0, // Fallback to balance if credit_limit is not available
            rc_number: clientData.client_code || '', // Fallback to client_code if rc_number is not available
            cc_number: clientData.client_code || '', // Fallback to client_code if cc_number is not available
            status: clientData.client_type || 'active', // Fallback to client_type if status is not available
          } : null;

          setSelectedClient(formattedClient);

          // Format cart items
          const formattedCart = order.items?.map((item) => ({
            id: item.product_id,
            product_id: item.product_id,
            name: item.product?.name || 'Unknown Product',
            quantity: item.quantity,
            price: item.product?.price || 0,
            discount: 0, // Assuming default discount is 0
            category: item.product?.category || 'Uncategorized',
            reference: item.product?.reference || '',
            image_url: item.product?.image_url || '',
          })) || [];

          setCart(formattedCart);

          setOrderData({
            ...order,
            client: formattedClient,
            items: formattedCart,
          });
        }
      } catch (error: any) {
        console.error("Error fetching order data:", error);
        toast.error(`Failed to fetch order data: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrderData();
  }, [orderId]);

  return {
    orderData,
    isLoading,
    selectedClient,
    cart,
  };
};

export default useEditOrder;
