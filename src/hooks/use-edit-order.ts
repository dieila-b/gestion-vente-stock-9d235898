
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Client } from "@/types/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { isSelectQueryError } from "@/utils/supabase-helpers";

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
      
      // Si la facture est déjà payée ou partiellement payée, empêcher l'édition du panier et rediriger vers la liste des factures
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
      // Handle case where client is a SelectQueryError
      if (isSelectQueryError(editOrder.client)) {
        toast.error("Erreur lors du chargement des données du client");
        return;
      }
      
      const clientData = {
        ...editOrder.client,
        status: editOrder.client.status === 'entreprise' ? 'entreprise' : 'particulier'
      } as Client;
      
      setSelectedClient(clientData);
      
      // Handle case where items is a SelectQueryError
      if (isSelectQueryError(editOrder.items)) {
        toast.error("Erreur lors du chargement des articles de la facture");
        return;
      }
      
      const cartItems = editOrder.items.map((item: any) => {
        // Handle case where product is a SelectQueryError
        const product = isSelectQueryError(item.product) 
          ? { id: item.product_id, name: "Unknown Product", category: "", image_url: "" }
          : item.product;
          
        return {
          id: product.id,
          name: product.name,
          price: item.price,
          quantity: item.quantity,
          discount: item.discount || 0,
          category: product.category,
          image: product.image_url,
          // Include delivered quantity information to preserve it when editing
          deliveredQuantity: item.delivered_quantity || 0
        };
      });
      
      setCart(cartItems);
    }
  }, [editOrder, setCart, setSelectedClient]);

  return { editOrderId, editOrder };
}
