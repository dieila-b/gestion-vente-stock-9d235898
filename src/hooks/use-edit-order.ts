
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Client } from "@/types/client_unified";
import { CartItem } from "@/types/pos";
import { SelectQueryError } from "@/types/db-adapter";

// Define proper Order type to fix 'never' type issues
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
          // Check if order is a valid object and not a SelectQueryError
          if (isSelectQueryError(order)) {
            console.error("Invalid order data structure:", order);
            toast.error("Erreur de récupération des données de la commande");
            setIsLoading(false);
            return;
          }

          // Safe access with additional type checking
          const client = order.client;
          const items = order.items;
          
          // Check if client and items are SelectQueryError objects
          const hasClientError = !client || isSelectQueryError(client);
          const hasItemsError = !items || isSelectQueryError(items);

          // Format client data if available
          const clientData = hasClientError ? null : client;

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
            // Fallbacks for missing properties
            status: clientData.status || 'active',
          } : null;

          setSelectedClient(formattedClient);

          // Format cart items from order items if available
          const formattedCart = hasItemsError ? [] : 
            Array.isArray(items) ? 
              items.map((item: any) => ({
                id: item.product_id,
                product_id: item.product_id,
                name: item.product?.name || 'Unknown Product',
                quantity: item.quantity,
                price: item.product?.price || 0,
                discount: 0, // Default discount
                category: item.product?.category || 'Uncategorized',
                reference: item.product?.reference || '',
                image_url: item.product?.image_url || '',
              })) : [];

          setCart(formattedCart);

          // Create a safe order data object
          const safeOrderData: OrderData = {
            id: order.id || '',
            client_id: order.client_id || '',
            total_amount: order.total_amount || 0,
            paid_amount: order.paid_amount || 0,
            remaining_amount: order.remaining_amount || 0,
            status: order.status || 'pending',
            notes: order.notes || '',
            created_at: order.created_at || new Date().toISOString(),
            updated_at: order.updated_at || new Date().toISOString(),
            client: formattedClient,
            items: formattedCart,
          };

          setOrderData(safeOrderData);
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

  // Helper function to check if a response is a SelectQueryError
  const isSelectQueryError = (data: any): boolean => {
    return typeof data === 'object' && data !== null && 'code' in data && 'details' in data && 'hint' in data && 'message' in data;
  };

  return {
    orderData,
    isLoading,
    selectedClient,
    cart,
  };
};

export default useEditOrder;
