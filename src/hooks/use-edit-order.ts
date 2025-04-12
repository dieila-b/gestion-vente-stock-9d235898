
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Client } from "@/types/client_unified";
import { CartItem } from "@/types/pos";
import { isSelectQueryError } from "@/utils/type-utils";

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
          // Check if order is a valid object (not a SelectQueryError)
          if (isSelectQueryError(order)) {
            console.error("Order data error:", order);
            toast.error("Erreur de récupération des données de la commande");
            setIsLoading(false);
            return;
          }

          // Format client data
          const clientData = order.client;

          // Handle client data with optional properties
          const formattedClient = clientData && !isSelectQueryError(clientData) ? {
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
            // Provide fallbacks for missing properties
            mobile_1: clientData.phone || '',
            mobile_2: clientData.phone || '',
            whatsapp: clientData.phone || '',
            credit_limit: clientData.balance || 0,
            rc_number: clientData.client_code || '',
            cc_number: clientData.client_code || '',
            status: clientData.client_type || 'active',
          } : null;

          setSelectedClient(formattedClient);

          // Format cart items
          const formattedCart = !isSelectQueryError(order.items) ? 
            (order.items?.map((item) => ({
              id: item.product_id,
              product_id: item.product_id,
              name: item.product?.name || 'Unknown Product',
              quantity: item.quantity,
              price: item.product?.price || 0,
              discount: 0, // Assuming default discount is 0
              category: item.product?.category || 'Uncategorized',
              reference: item.product?.reference || '',
              image_url: item.product?.image_url || '',
            })) || []) : [];

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
