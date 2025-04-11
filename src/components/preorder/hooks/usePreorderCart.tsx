import { useEffect, useState } from "react";
import { useCart } from "@/hooks/use-cart";
import { Client } from "@/types/client";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Product } from "@/types/pos";
import { safeSpread, safeArrayOperation, isSelectQueryError } from "@/utils/supabase-helpers";
import { useSupabaseErrorHandler } from "@/hooks/use-supabase-error-handler";

export function usePreorderCart(
  editId: string | null,
  setIsEditing: (value: boolean) => void,
  setSelectedClient: (client: Client | null) => void,
  setIsLoading: (value: boolean) => void
) {
  const { 
    cart, 
    updateQuantity, 
    removeFromCart, 
    updateDiscount, 
    clearCart, 
    addToCart, 
    setQuantity 
  } = useCart();

  const { safeMap } = useSupabaseErrorHandler();

  useEffect(() => {
    const loadPreorderForEditing = async () => {
      if (!editId) return;
      
      setIsLoading(true);
      setIsEditing(true);
      
      try {
        const { data: preorder, error } = await supabase
          .from('preorders')
          .select(`
            *,
            client:clients(*),
            items:preorder_items(
              id,
              product_id,
              quantity,
              unit_price,
              total_price,
              discount,
              status
            )
          `)
          .eq('id', editId)
          .single();
          
        if (error) throw error;
        
        if (!preorder) {
          toast.error("Précommande non trouvée");
          return;
        }
        
        if (preorder.client) {
          const clientData = {
            ...preorder.client,
            status: (preorder.client.status === 'entreprise' ? 'entreprise' : 'particulier') as 'particulier' | 'entreprise'
          };
          setSelectedClient(clientData);
        }
        
        const productIds = preorder.items.map((item: any) => item.product_id);
        
        if (productIds.length > 0) {
          const { data: products, error: productsError } = await supabase
            .from('catalog')
            .select('*')
            .in('id', productIds);
            
          if (productsError) throw productsError;
          
          clearCart();
          
          preorder.items.forEach((item: any) => {
            const product = products.find((p: any) => p.id === item.product_id);
            if (product) {
              const cartItem = {
                ...product as Product,
                quantity: item.quantity,
                discount: item.discount
              };
              addToCart(cartItem, undefined);
            }
          });
          
          toast.success("Précommande chargée pour modification");
        }
      } catch (error) {
        console.error('Error loading preorder:', error);
        toast.error("Erreur lors du chargement de la précommande");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadPreorderForEditing();
  }, [editId, addToCart, clearCart, setIsEditing, setIsLoading, setSelectedClient]);

  const setCartItemQuantity = (productId: string, quantity: number) => {
    console.log("Setting exact quantity:", { productId, quantity });
    setQuantity(productId, quantity);
  };

  const validatePreorder = () => {
    console.log("Validating preorder:", { hasClient: !!setSelectedClient, cartLength: cart.length });
    
    if (!setSelectedClient) {
      toast.warning("Veuillez sélectionner un client pour finaliser la précommande");
      return false;
    }
    
    if (cart.length === 0) {
      toast.error("Veuillez ajouter des produits à la précommande");
      return false;
    }
    
    return true;
  };

  const editPreorder = async (preorderId: string) => {
    if (!preorderId) return;
    
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('preorders')
        .select(`
          *,
          client:clients(*),
          items:preorder_items(
            id,
            product_id,
            quantity,
            unit_price,
            total_price,
            discount,
            status
          )
        `)
        .eq('id', preorderId)
        .single();
      
      if (error) throw error;
      
      if (!data) {
        toast.error("Précommande non trouvée");
        return;
      }
      
      if (data.client) {
        const clientData = isSelectQueryError(data.client) 
          ? null 
          : data.client;
          
        const formattedClient = clientData 
          ? {
              ...clientData,
              status: safeGetProperty(clientData, 'status', 'particulier')
            } 
          : null;

        if (formattedClient) {
          setClient(formattedClient);
        }

        const items = isSelectQueryError(data.items) 
          ? [] 
          : (data.items || []);
            
        if (items.length > 0) {
          const cartItems = items.map((item) => ({
            id: item.product_id,
            quantity: item.quantity,
            price: item.unit_price,
            name: safeGetProperty(item.product, 'name', 'Produit inconnu'),
            image: safeGetProperty(item.product, 'image_url', null),
            discount: item.discount || 0,
            status: item.status || 'pending'
          }));
          
          if (cartItems.length > 0) {
            setCart(cartItems);
          }
        }

        setPreorderState({
          id: preorderId,
          status: data.status || 'draft',
          notes: data.notes || '',
          paidAmount: data.paid_amount || 0,
        });
      }
    } catch (error) {
      console.error('Error loading preorder:', error);
      toast.error("Erreur lors du chargement de la précommande");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    cart,
    updateQuantity,
    removeFromCart,
    updateDiscount,
    clearCart,
    addToCart,
    setCartItemQuantity,
    validatePreorder,
    editPreorder
  };
}
