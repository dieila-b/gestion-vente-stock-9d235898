
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

          // Type assertion to help TypeScript understand the data structure
          const typedOrder = order as any;
          
          // First check if the client and items properties exist and are not errors
          const clientData = typedOrder.client && !isSelectQueryError(typedOrder.client) 
            ? typedOrder.client 
            : null;
            
          const itemsData = typedOrder.items && !isSelectQueryError(typedOrder.items) 
            ? typedOrder.items 
            : [];

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
          const formattedCart = Array.isArray(itemsData) ? 
            itemsData.map((item: any) => ({
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

          // Create a safe order data object with type assertion
          const safeOrderData: OrderData = {
            id: typedOrder.id || '',
            client_id: typedOrder.client_id || '',
            total_amount: typedOrder.total_amount || 0,
            paid_amount: typedOrder.paid_amount || 0,
            remaining_amount: typedOrder.remaining_amount || 0,
            status: typedOrder.status || 'pending',
            notes: typedOrder.notes || '',
            created_at: typedOrder.created_at || new Date().toISOString(),
            updated_at: typedOrder.updated_at || new Date().toISOString(),
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
  const isSelectQueryError = (data: any): data is SelectQueryError => {
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
