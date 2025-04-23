
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PurchaseOrder } from "@/types/purchase-order";
import { toast } from "sonner";

export function usePurchaseOrdersQuery() {
  return useQuery({
    queryKey: ['purchase-orders'],
    queryFn: async (): Promise<PurchaseOrder[]> => {
      console.log("Fetching purchase orders...");
      
      try {
        // First, try direct query with detailed logging
        console.log("Attempting direct query to purchase_orders table...");
        const { data: directData, error: directError } = await supabase
          .from('purchase_orders')
          .select(`
            *,
            supplier:suppliers(
              id,
              name,
              email,
              phone,
              contact
            ),
            items:purchase_order_items(
              *,
              product:catalog(*)
            )
          `)
          .order('created_at', { ascending: false });
          
        if (!directError && directData && directData.length > 0) {
          console.log("Purchase orders fetched successfully via direct query:", directData.length);
          return directData as PurchaseOrder[];
        }
        
        console.log("Direct query result:", directData?.length || 0, "records. Error:", directError);
        
        // Si la requête directe échoue, essayons la fonction RPC
        console.log("Attempting RPC function bypass_select_purchase_orders...");
        const { data: rpcData, error: rpcError } = await supabase.rpc(
          'bypass_select_purchase_orders'
        );
        
        if (rpcError) {
          console.error("RPC function failed:", rpcError);
          throw rpcError;
        }
        
        if (rpcData && rpcData.length > 0) {
          console.log("Processed purchase orders via RPC:", rpcData.length);
          
          // Fetch items for each purchase order
          const ordersWithItems = await Promise.all(
            rpcData.map(async (order: any) => {
              try {
                const { data: orderDetails, error: detailsError } = await supabase.rpc(
                  'get_purchase_order_by_id',
                  { order_id: order.id }
                );
                
                if (!detailsError && orderDetails) {
                  console.log(`Items for order ${order.id}:`, orderDetails.items?.length || 0);
                  return orderDetails as PurchaseOrder;
                }
                
                console.log(`No details found for order ${order.id}, error:`, detailsError);
                return order;
              } catch (err) {
                console.error(`Error fetching details for order ${order.id}:`, err);
                return order;
              }
            })
          );
          
          return ordersWithItems as PurchaseOrder[];
        }
        
        console.log("No purchase orders found in either direct query or RPC.");
        return [];
      } catch (error) {
        console.error("Error fetching purchase orders:", error);
        toast.error("Erreur lors du chargement des bons de commande");
        return [];
      }
    },
    staleTime: 0, // Always refetch on component mount
    refetchOnWindowFocus: true,
  });
}
