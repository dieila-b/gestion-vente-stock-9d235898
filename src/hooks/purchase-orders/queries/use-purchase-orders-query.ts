
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PurchaseOrder } from "@/types/purchase-order";

export function usePurchaseOrdersQuery() {
  return useQuery({
    queryKey: ['purchase-orders'],
    queryFn: async (): Promise<PurchaseOrder[]> => {
      console.log("Fetching purchase orders with items...");
      
      // First fetch all purchase orders with suppliers
      const { data: orders, error } = await supabase
        .from('purchase_orders')
        .select(`
          *,
          supplier:supplier_id(*),
          warehouse:warehouse_id(*)
        `)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("Error fetching purchase orders:", error);
        throw error;
      }
      
      // Now fetch items for each order
      const ordersWithItems = await Promise.all(
        orders.map(async (order) => {
          const { data: items, error: itemsError } = await supabase
            .from('purchase_order_items')
            .select(`
              *,
              product:product_id(*)
            `)
            .eq('purchase_order_id', order.id);
          
          if (itemsError) {
            console.error(`Error fetching items for order ${order.id}:`, itemsError);
            return { ...order, items: [] };
          }
          
          console.log(`Order ${order.order_number}: Found ${items.length} items`);
          return { ...order, items };
        })
      );
      
      return ordersWithItems;
    }
  });
}
