
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { PurchaseOrder } from "@/types/purchaseOrder";

// Type guard function to validate order status
function isValidOrderStatus(status: string): status is PurchaseOrder['status'] {
  return ['pending', 'draft', 'delivered', 'approved'].includes(status);
}

// Type guard function to validate payment status
function isValidPaymentStatus(status: string): status is PurchaseOrder['payment_status'] {
  return ['pending', 'partial', 'paid'].includes(status);
}

export const usePurchaseOrderQueries = (id?: string) => {
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['purchase-orders'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('purchase_orders')
          .select(`
            *,
            supplier:suppliers (
              name
            ),
            items:purchase_order_items (
              *
            )
          `)
          .eq('deleted', false)
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        // Transform the data to match the PurchaseOrder type
        return data.map((order: any) => {
          // Create a base order object with default values
          const transformedOrder: PurchaseOrder = {
            id: order.id,
            order_number: order.order_number,
            supplier: order.supplier || { name: '' },
            supplier_id: order.supplier_id,
            created_at: order.created_at,
            status: isValidOrderStatus(order.status) ? order.status : 'draft',
            payment_status: 'pending', // Default value
            total_amount: order.total_amount || 0,
            items: order.items || [],
            logistics_cost: order.logistics_cost || 0,
            transit_cost: order.transit_cost || 0,
            tax_rate: order.tax_rate || 0,
            subtotal: order.subtotal || 0,
            tax_amount: order.tax_amount || 0,
            total_ttc: order.total_ttc || 0,
            shipping_cost: order.shipping_cost || 0,
            customs_duty: order.customs_duty || 0,
            discount: order.discount || 0,
            expected_delivery_date: order.expected_delivery_date,
            notes: order.notes,
            warehouse_id: order.warehouse_id,
            delivery_note_id: order.delivery_note_id,
            deleted: order.deleted || false
          };
          
          // Type assertion to safely check for payment_status
          const rawData = order as any;
          if (rawData.payment_status && isValidPaymentStatus(rawData.payment_status)) {
            transformedOrder.payment_status = rawData.payment_status;
          }
          
          return transformedOrder;
        });
      } catch (error) {
        console.error("Error fetching purchase orders:", error);
        throw error;
      }
    }
  });

  const { data: currentOrder, isLoading: isLoadingOrder } = useQuery({
    queryKey: ['purchase-order', id || window.location.pathname.split('/').pop()],
    queryFn: async () => {
      try {
        const orderId = id || window.location.pathname.split('/').pop();
        if (!orderId) return null;

        const { data: order, error } = await supabase
          .from('purchase_orders')
          .select(`
            *,
            supplier:suppliers (
              name
            ),
            items:purchase_order_items (
              *
            )
          `)
          .eq('id', orderId)
          .single();

        if (error) throw error;
        if (!order) return null;
        
        // Create a base order object with default values
        const transformedOrder: PurchaseOrder = {
          id: order.id,
          order_number: order.order_number,
          supplier: order.supplier || { name: '' },
          supplier_id: order.supplier_id,
          created_at: order.created_at,
          status: isValidOrderStatus(order.status) ? order.status : 'draft',
          payment_status: 'pending', // Default value
          total_amount: order.total_amount || 0,
          items: order.items || [],
          logistics_cost: order.logistics_cost || 0,
          transit_cost: order.transit_cost || 0,
          tax_rate: order.tax_rate || 0,
          subtotal: order.subtotal || 0,
          tax_amount: order.tax_amount || 0,
          total_ttc: order.total_ttc || 0,
          shipping_cost: order.shipping_cost || 0,
          customs_duty: order.customs_duty || 0,
          discount: order.discount || 0,
          expected_delivery_date: order.expected_delivery_date,
          notes: order.notes,
          warehouse_id: order.warehouse_id,
          delivery_note_id: order.delivery_note_id,
          deleted: order.deleted || false
        };
        
        // Type assertion to safely check for payment_status
        const rawOrder = order as any;
        if (rawOrder.payment_status && isValidPaymentStatus(rawOrder.payment_status)) {
          transformedOrder.payment_status = rawOrder.payment_status;
        }
        
        return transformedOrder;
      } catch (error) {
        console.error("Error fetching purchase order:", error);
        throw error;
      }
    },
    enabled: !!id || window.location.pathname.includes('/purchase-orders/'),
  });

  return {
    orders,
    isLoading,
    currentOrder,
    isLoadingOrder
  };
};
