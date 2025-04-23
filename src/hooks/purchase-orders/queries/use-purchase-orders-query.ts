
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PurchaseOrder } from "@/types/purchase-order";

export function usePurchaseOrdersQuery() {
  return useQuery({
    queryKey: ['purchase-orders'],
    queryFn: async () => {
      try {
        console.log("Fetching purchase orders from database");
        
        // D'abord, récupérer les commandes via la fonction bypass plus sûre
        const { data: ordersData, error: ordersError } = await supabase
          .rpc('bypass_select_purchase_orders');
          
        if (ordersError) {
          console.error("Error fetching purchase orders:", ordersError);
          throw ordersError;
        }
        
        if (!ordersData) {
          console.log("No purchase orders found");
          return [];
        }
        
        console.log(`Found ${ordersData.length} purchase orders`);
        
        // Ensuite, récupérer les articles pour chaque commande
        const ordersWithItems = await Promise.all(
          ordersData.map(async (orderData: any) => {
            try {
              // Récupérer les articles via une fonction RPC
              const { data: itemsData, error: itemsError } = await supabase
                .rpc('get_purchase_order_items', { order_id: orderData.id });
                
              if (itemsError) {
                console.error(`Error fetching items for order ${orderData.id}:`, itemsError);
                return {
                  ...orderData,
                  items: []
                };
              }
              
              return {
                ...orderData,
                items: itemsData || []
              };
            } catch (error) {
              console.error(`Error processing items for order ${orderData.id}:`, error);
              return {
                ...orderData,
                items: []
              };
            }
          })
        );
        
        return ordersWithItems as PurchaseOrder[];
      } catch (error) {
        console.error("Error in usePurchaseOrdersQuery:", error);
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });
}
