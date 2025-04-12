
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const usePurchaseOrders = () => {
  const usePurchaseOrdersQuery = () => {
    return useQuery({
      queryKey: ['purchase-orders'],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('purchase_orders')
          .select(`
            *,
            supplier:supplier_id (id, name),
            warehouse:warehouse_id (id, name)
          `)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        return data || [];
      }
    });
  };

  const usePurchaseOrderQuery = (id: string) => {
    return useQuery({
      queryKey: ['purchase-order', id],
      queryFn: async () => {
        if (!id) return null;

        const { data, error } = await supabase
          .from('purchase_orders')
          .select(`
            *,
            supplier:supplier_id (id, name, contact, email, phone),
            warehouse:warehouse_id (id, name)
          `)
          .eq('id', id)
          .single();
        
        if (error) throw error;
        return data;
      },
      enabled: !!id
    });
  };

  const usePurchaseOrdersBySupplierQuery = (supplierId: string) => {
    return useQuery({
      queryKey: ['purchase-orders-by-supplier', supplierId],
      queryFn: async () => {
        if (!supplierId) return [];

        const { data, error } = await supabase
          .from('purchase_orders')
          .select('*')
          .eq('supplier_id', supplierId)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        return data || [];
      },
      enabled: !!supplierId
    });
  };

  const usePurchaseOrderItemsQuery = (orderId: string) => {
    return useQuery({
      queryKey: ['purchase-order-items', orderId],
      queryFn: async () => {
        if (!orderId) return [];

        const { data, error } = await supabase
          .from('purchase_order_items')
          .select(`
            *,
            product:product_id (id, name, reference)
          `)
          .eq('purchase_order_id', orderId);
        
        if (error) throw error;
        return data || [];
      },
      enabled: !!orderId
    });
  };

  return {
    usePurchaseOrdersQuery,
    usePurchaseOrderQuery,
    usePurchaseOrdersBySupplierQuery,
    usePurchaseOrderItemsQuery
  };
};
