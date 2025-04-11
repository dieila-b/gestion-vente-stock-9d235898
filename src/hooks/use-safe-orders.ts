
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { safeMap, isSelectQueryError, safeGetProperty } from "@/utils/supabase-helpers";

/**
 * Hook for safely handling order data with proper error handling for SelectQueryErrors
 */
export function useSafeOrders() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Safely load order items with product details
   */
  const loadOrderWithItems = async (orderId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
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
            total,
            product_id,
            product:catalog(*)
          )
        `)
        .eq('id', orderId)
        .single();
        
      if (error) throw error;
      
      // Handle SelectQueryError for client property
      const clientData = !isSelectQueryError(data.client) ? data.client : null;
      
      // Handle SelectQueryError for items property
      const itemsData = !isSelectQueryError(data.items) 
        ? safeMap(data.items, (item: any) => {
            // Handle SelectQueryError for product property within items
            const productData = !isSelectQueryError(item.product) ? item.product : null;
            
            return {
              id: item.id,
              quantity: item.quantity,
              price: item.price,
              discount: item.discount,
              total: item.total,
              product_id: item.product_id,
              product: productData
            };
          })
        : [];
        
      return {
        ...data,
        client: clientData,
        items: itemsData
      };
    } catch (err) {
      const error = err as Error;
      setError(error);
      console.error("Error loading order:", error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Safely extract client information from an order
   */
  const extractClientData = (order: any) => {
    if (!order || !order.client || isSelectQueryError(order.client)) {
      return {
        id: "",
        company_name: "Client inconnu",
        contact_name: "",
        email: "",
        phone: "",
        status: "particulier" as const
      };
    }
    
    return {
      id: order.client.id || "",
      company_name: order.client.company_name || "Client inconnu",
      contact_name: order.client.contact_name || "",
      email: order.client.email || "",
      phone: order.client.phone || "",
      status: (order.client.status === "entreprise" ? "entreprise" : "particulier") as "entreprise" | "particulier"
    };
  };

  return {
    isLoading,
    error,
    loadOrderWithItems,
    extractClientData
  };
}
