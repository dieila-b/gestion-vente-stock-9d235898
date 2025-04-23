
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PurchaseOrder } from "@/types/purchase-order";
import { toast } from "sonner";
import { isObject } from "@/utils/type-utils";

// Type guard to check if an object is a valid PurchaseOrder
function isPurchaseOrder(obj: unknown): obj is PurchaseOrder {
  return isObject(obj) && 
    'id' in obj && 
    'order_number' in obj && 
    'status' in obj;
}

// Helper to safely convert to PurchaseOrder
function toPurchaseOrder(data: unknown): PurchaseOrder {
  if (isPurchaseOrder(data)) {
    return data;
  }
  
  // If it's not a valid PurchaseOrder but has an id, create a minimal valid object
  if (isObject(data) && 'id' in data) {
    console.warn("Incomplete PurchaseOrder data, creating minimal object:", data);
    return {
      id: String(data.id),
      order_number: isObject(data) && 'order_number' in data ? String(data.order_number) : 'Unknown',
      created_at: new Date().toISOString(),
      status: 'unknown',
      supplier_id: '',
      discount: 0,
      expected_delivery_date: '',
      notes: '',
      logistics_cost: 0,
      transit_cost: 0,
      tax_rate: 0,
      shipping_cost: 0,
      subtotal: 0,
      tax_amount: 0,
      total_ttc: 0,
      total_amount: 0,
      paid_amount: 0,
      payment_status: 'unknown',
      supplier: { id: '', name: 'Unknown', email: '', phone: '' },
      items: []
    };
  }
  
  // Last resort, create an empty object with a random ID
  console.error("Invalid PurchaseOrder data:", data);
  return {
    id: `invalid-${Date.now()}`,
    order_number: 'Invalid Order',
    created_at: new Date().toISOString(),
    status: 'error',
    supplier_id: '',
    discount: 0,
    expected_delivery_date: '',
    notes: '',
    logistics_cost: 0,
    transit_cost: 0,
    tax_rate: 0,
    shipping_cost: 0,
    subtotal: 0,
    tax_amount: 0,
    total_ttc: 0,
    total_amount: 0,
    paid_amount: 0,
    payment_status: 'error',
    supplier: { id: '', name: 'Unknown', email: '', phone: '' },
    items: []
  };
}

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
        
        // If direct query fails, try the RPC function
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
                  // Type-safe approach: Check if orderDetails is a valid object with items
                  const hasItems = isObject(orderDetails) && 'items' in orderDetails;
                  
                  console.log(`Items for order ${order.id}:`, 
                    hasItems && Array.isArray(orderDetails.items) 
                      ? orderDetails.items.length 
                      : 'No items or invalid items array');
                  
                  // Safely convert to PurchaseOrder type with proper validation
                  return toPurchaseOrder(orderDetails);
                }
                
                console.log(`No details found for order ${order.id}, error:`, detailsError);
                return toPurchaseOrder(order);
              } catch (err) {
                console.error(`Error fetching details for order ${order.id}:`, err);
                return toPurchaseOrder(order);
              }
            })
          );
          
          return ordersWithItems;
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
