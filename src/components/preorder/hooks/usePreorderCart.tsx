
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Client } from '@/types/client';
import { CartItem, Product } from '@/types/pos';
import { 
  isSelectQueryError, 
  safeGetProperty, 
  safeMap,
  safeForEach,
  safeSpread
} from '@/utils/supabase-helpers';

export function usePreorderCart() {
  const { id } = useParams<{ id: string }>();
  const [client, setClient] = useState<Client | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [preorderState, setPreorderState] = useState<{
    id: string;
    status: string;
    notes: string;
    totalAmount: number;
    paidAmount: number;
    remainingAmount: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch the preorder data when ID is available
  useEffect(() => {
    const fetchPreorder = async () => {
      if (!id) return;
      
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('preorders')
          .select(`
            *,
            client:clients(*),
            items:preorder_items(
              id,
              quantity,
              unit_price,
              total_price,
              product_id,
              product:catalog(*)
            )
          `)
          .eq('id', id)
          .single();
          
        if (error) throw error;
        
        // Create a default client
        const defaultClient: Client = {
          id: "",
          company_name: "Unknown",
          contact_name: "",
          email: "",
          phone: "",
          status: "particulier"
        };

        // Handle potential SelectQueryError for client
        let clientData: Client;
        if (isSelectQueryError(data.client)) {
          clientData = defaultClient;
        } else {
          // If we have client data, cast the status to ensure it's either 'particulier' or 'entreprise'
          const clientStatus = (data.client?.status === 'entreprise') ? 'entreprise' : 'particulier';
          
          // Use a type assertion to access properties safely
          clientData = {
            ...defaultClient,
            id: data.client?.id || defaultClient.id,
            company_name: data.client?.company_name || defaultClient.company_name,
            contact_name: data.client?.contact_name || defaultClient.contact_name,
            email: data.client?.email || defaultClient.email,
            phone: data.client?.phone || defaultClient.phone,
            status: clientStatus
          };
        }
        
        setClient(clientData);
        
        // Convert preorder items to cart items
        const cartItems: CartItem[] = [];
        
        if (Array.isArray(data.items)) {
          data.items.forEach((item: any) => {
            if (isSelectQueryError(item.product)) return;
            
            const product = item.product;
            const cartItem: CartItem = {
              id: product.id,
              name: product.name,
              quantity: item.quantity,
              unit_price: item.unit_price,
              price: item.unit_price,
              total: item.total_price,
              category: product.category || '',
              reference: product.reference || '',
              discount: 0, // Assuming discount is not stored for preorder items
              discounted_price: item.unit_price,
              original_price: product.price || item.unit_price,
              stock: product.stock || 0
            };
            
            cartItems.push(cartItem);
          });
        }
        
        setCart(cartItems);
        
        // Set preorder state
        setPreorderState({
          id: data.id,
          status: data.status || '',
          notes: data.notes || '',
          totalAmount: data.total_amount,
          paidAmount: data.paid_amount,
          remainingAmount: data.remaining_amount
        });
        
      } catch (error) {
        console.error('Error fetching preorder:', error);
        toast.error("Erreur lors du chargement de la précommande");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPreorder();
  }, [id]);

  return {
    client,
    cart,
    preorderState,
    isLoading
  };
}
