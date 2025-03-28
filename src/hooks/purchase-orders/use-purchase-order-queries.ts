
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { PurchaseOrder, PurchaseOrderItem } from "@/types/purchaseOrder";

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
              name,
              phone,
              email
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
            supplier: {
              name: order.supplier?.name || '',
              phone: order.supplier?.phone || null,
              email: order.supplier?.email || null
            },
            supplier_id: order.supplier_id,
            created_at: order.created_at,
            status: isValidOrderStatus(order.status) ? order.status : 'draft',
            // Use a default value 'pending' when accessing potentially undefined properties
            payment_status: isValidPaymentStatus(order.payment_status || 'pending') ? (order.payment_status || 'pending') : 'pending',
            total_amount: order.total_amount || 0,
            items: Array.isArray(order.items) ? order.items.map((item: any) => ({
              id: item.id || '',
              product_id: item.product_id || '',
              product_code: item.product_code,
              designation: item.designation,
              quantity: item.quantity || 0,
              unit_price: item.unit_price || 0,
              selling_price: item.selling_price || 0,
              total_price: item.total_price || 0
            })) : [],
            logistics_cost: order.logistics_cost || 0,
            transit_cost: order.transit_cost || 0,
            tax_rate: order.tax_rate || 0,
            subtotal: order.subtotal || 0,
            tax_amount: order.tax_amount || 0,
            total_ttc: order.total_ttc || 0,
            shipping_cost: order.shipping_cost || 0,
            discount: order.discount || 0,
            notes: order.notes || '',
            expected_delivery_date: order.expected_delivery_date || '',
            warehouse_id: order.warehouse_id || '',
            paid_amount: typeof order.paid_amount === 'number' ? order.paid_amount : 0,
            deleted: order.deleted || false
          };
          
          // Add optional properties if they exist in the data
          if ('customs_duty' in order) {
            transformedOrder.customs_duty = order.customs_duty;
          }
          
          if ('delivery_note_id' in order) {
            transformedOrder.delivery_note_id = order.delivery_note_id;
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
              name,
              phone,
              email
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
          supplier: {
            name: order.supplier?.name || '',
            phone: order.supplier?.phone || null,
            email: order.supplier?.email || null
          },
          supplier_id: order.supplier_id,
          created_at: order.created_at,
          status: isValidOrderStatus(order.status) ? order.status : 'draft',
          // Use a default value 'pending' when accessing potentially undefined properties
          payment_status: isValidPaymentStatus(order.payment_status || 'pending') ? (order.payment_status || 'pending') : 'pending',
          total_amount: order.total_amount || 0,
          items: Array.isArray(order.items) ? order.items.map((item: any) => ({
            id: item.id || '',
            product_id: item.product_id || '',
            product_code: item.product_code,
            designation: item.designation,
            quantity: item.quantity || 0,
            unit_price: item.unit_price || 0,
            selling_price: item.selling_price || 0,
            total_price: item.total_price || 0
          })) : [],
          logistics_cost: order.logistics_cost || 0,
          transit_cost: order.transit_cost || 0,
          tax_rate: order.tax_rate || 0,
          subtotal: order.subtotal || 0,
          tax_amount: order.tax_amount || 0,
          total_ttc: order.total_ttc || 0,
          shipping_cost: order.shipping_cost || 0,
          discount: order.discount || 0,
          notes: order.notes || '',
          expected_delivery_date: order.expected_delivery_date || '',
          warehouse_id: order.warehouse_id || '',
          paid_amount: typeof order.paid_amount === 'number' ? order.paid_amount : 0,
          deleted: order.deleted || false
        };
        
        // Add optional properties if they exist in the data
        if ('customs_duty' in order) {
          transformedOrder.customs_duty = order.customs_duty;
        }
        
        if ('delivery_note_id' in order) {
          transformedOrder.delivery_note_id = order.delivery_note_id;
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
