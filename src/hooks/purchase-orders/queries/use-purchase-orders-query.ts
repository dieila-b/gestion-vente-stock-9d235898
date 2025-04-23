
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PurchaseOrder } from "@/types/purchase-order";

export function usePurchaseOrdersQuery() {
  return useQuery({
    queryKey: ['purchase-orders'],
    queryFn: async () => {
      try {
        console.log("Fetching purchase orders from database");
        
        // First, retrieve the purchase orders directly from the table for better error handling
        const { data: ordersData, error: ordersError } = await supabase
          .from('purchase_orders')
          .select(`
            *,
            supplier:supplier_id(*)
          `)
          .order('created_at', { ascending: false });
          
        if (ordersError) {
          console.error("Error fetching purchase orders:", ordersError);
          throw ordersError;
        }
        
        if (!ordersData || ordersData.length === 0) {
          console.log("No purchase orders found");
          return [];
        }
        
        console.log(`Found ${ordersData.length} purchase orders`);
        
        // Then, retrieve the items for each order
        const ordersWithItems = await Promise.all(
          ordersData.map(async (orderData: any) => {
            try {
              // Retrieve items directly with a join
              const { data: itemsData, error: itemsError } = await supabase
                .from('purchase_order_items')
                .select(`
                  *,
                  product:product_id(*)
                `)
                .eq('purchase_order_id', orderData.id);
                
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
