
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Client } from "@/types/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { isSelectQueryError } from "@/utils/supabase-helpers";

// We'll use a simple helper function for safeGetProperty
const safeGetProperty = <T,>(obj: any, propName: string, defaultValue: T): T => {
  if (!obj || typeof obj !== 'object' || isSelectQueryError(obj)) {
    return defaultValue;
  }
  return obj[propName] !== undefined ? obj[propName] : defaultValue;
};

export function useEditOrder(setSelectedClient: (client: Client | null) => void, setCart: (items: any[]) => void) {
  const [searchParams] = useSearchParams();
  const editOrderId = searchParams.get('editOrder');
  const navigate = useNavigate();

  useEffect(() => {
    if (editOrderId) {
      const editDataString = localStorage.getItem('editInvoiceData');
      if (editDataString) {
        try {
          const editData = JSON.parse(editDataString);
          
          if (editData.client) {
            const clientData = {
              ...editData.client,
              status: editData.client.status === 'entreprise' ? 'entreprise' : 'particulier'
            } as Client;
            setSelectedClient(clientData);
          }

          if (editData.items) {
            // Make sure to preserve the deliveredQuantity when setting the cart
            setCart(editData.items);
          }

          localStorage.removeItem('editInvoiceData');
        } catch (error) {
          console.error('Erreur lors du chargement des données de facture:', error);
          toast.error("Erreur lors du chargement de la facture");
        }
      }
    }
  }, [editOrderId, setCart, setSelectedClient]);

  const { data: editOrder } = useQuery({
    queryKey: ['edit-order', editOrderId],
    queryFn: async () => {
      if (!editOrderId) return null;
      
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          client:clients(*),
          items:order_items(
            id,
            quantity,
            price,
            discount,
            delivered_quantity,
            delivery_status,
            product:products(*)
          )
        `)
        .eq('id', editOrderId)
        .single();

      if (error) throw error;
      
      // If the invoice is already paid or partially paid, prevent editing
      if (data && (data.payment_status === 'paid' || data.payment_status === 'partial')) {
        toast.error("Les factures payées ou partiellement payées ne peuvent pas être modifiées");
        navigate("/sales-invoices");
        return null;
      }
      
      return data;
    },
    enabled: !!editOrderId
  });

  useEffect(() => {
    if (editOrder && editOrder.client) {
      // Create a default client object
      const defaultClient: Client = {
        id: "unknown",
        company_name: "Unknown Company",
        contact_name: "Unknown Contact",
        status: "particulier",
        email: "",
        phone: ""
      };
      
      // Check if client is a SelectQueryError
      if (isSelectQueryError(editOrder.client)) {
        setSelectedClient(defaultClient);
      } else {
        // If not an error, safely build client data
        const clientData: Client = {
          id: safeGetProperty(editOrder.client, 'id', defaultClient.id),
          company_name: safeGetProperty(editOrder.client, 'company_name', defaultClient.company_name),
          contact_name: safeGetProperty(editOrder.client, 'contact_name', defaultClient.contact_name),
          status: safeGetProperty(editOrder.client, 'status', 'particulier') === 'entreprise' ? 'entreprise' : 'particulier',
          email: safeGetProperty(editOrder.client, 'email', defaultClient.email),
          phone: safeGetProperty(editOrder.client, 'phone', defaultClient.phone)
        };
        
        setSelectedClient(clientData);
      }
      
      // Safely handle order items
      if (Array.isArray(editOrder.items) && !isSelectQueryError(editOrder.items)) {
        const cartItems = editOrder.items.map((item: any) => {
          // Create default product
          const defaultProduct = { 
            id: item.product_id, 
            name: "Unknown Product", 
            category: "", 
            image_url: "" 
          };
          
          // Safely handle product data
          const product = isSelectQueryError(item.product)
            ? defaultProduct
            : item.product || defaultProduct;
            
          return {
            id: product.id,
            name: product.name,
            price: item.price,
            quantity: item.quantity,
            discount: item.discount || 0,
            category: product.category,
            image: product.image_url,
            deliveredQuantity: item.delivered_quantity || 0
          };
        });
        
        setCart(cartItems);
      }
    }
  }, [editOrder, setCart, setSelectedClient]);

  return { editOrderId, editOrder };
}
