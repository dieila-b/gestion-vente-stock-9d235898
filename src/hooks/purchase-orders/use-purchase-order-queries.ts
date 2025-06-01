
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { safeSupplier, safeArray } from "@/utils/data-safe/safe-access";

export function usePurchaseOrderQueries(orderId?: string) {
  const purchaseOrdersQuery = useQuery({
    queryKey: ['purchase-orders'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('purchase_orders')
          .select(`
            *,
            supplier:suppliers(*)
          `)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching purchase orders:', error);
          return [];
        }

        return data || [];
      } catch (error) {
        console.error('Unexpected error fetching purchase orders:', error);
        return [];
      }
    }
  });

  const purchaseOrderQuery = useQuery({
    queryKey: ['purchase-order', orderId],
    queryFn: async () => {
      if (!orderId) return null;
      
      try {
        const { data, error } = await supabase
          .from('purchase_orders')
          .select(`
            *,
            supplier:suppliers(*),
            purchase_order_items(*)
          `)
          .eq('id', orderId)
          .single();

        if (error) {
          console.error('Error fetching purchase order:', error);
          return null;
        }

        return data;
      } catch (error) {
        console.error('Unexpected error fetching purchase order:', error);
        return null;
      }
    },
    enabled: !!orderId
  });

  const transformedOrders = purchaseOrdersQuery.data?.map(order => {
    const supplierData = safeSupplier(order.supplier);
    
    return {
      ...order,
      supplier: supplierData,
      logistics_cost: order.logistics_cost || 0,
      transit_cost: order.transit_cost || 0,
    };
  }) || [];

  return {
    orders: transformedOrders,
    isLoading: purchaseOrdersQuery.isLoading,
    error: purchaseOrdersQuery.error,
    purchaseOrder: purchaseOrderQuery.data,
    isPurchaseOrderLoading: purchaseOrderQuery.isLoading,
    purchaseOrderError: purchaseOrderQuery.error,
    refetch: purchaseOrdersQuery.refetch,
    refetchPurchaseOrder: purchaseOrderQuery.refetch
  };
}
