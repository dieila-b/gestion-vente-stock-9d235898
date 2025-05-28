
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PurchaseOrder, PurchaseOrderItem } from '@/types/purchase-order';

export function usePurchaseData(orderId?: string) {
  const [formData, setFormData] = useState<Partial<PurchaseOrder>>({});
  const [orderItems, setOrderItems] = useState<PurchaseOrderItem[]>([]);

  // Fetch purchase order data
  const {
    data: purchase,
    isLoading: isPurchaseLoading,
    refetch
  } = useQuery({
    queryKey: ['purchase', orderId],
    queryFn: async () => {
      if (!orderId) return null;

      try {
        console.log('Fetching purchase order data for ID:', orderId);
        
        // Get purchase order with supplier and warehouse data
        const { data: purchaseData, error: purchaseError } = await supabase
          .from('purchase_orders')
          .select(`
            *,
            supplier:suppliers(*),
            warehouse:warehouses(*)
          `)
          .eq('id', orderId)
          .single();

        if (purchaseError) {
          console.error('Error fetching purchase order:', purchaseError);
          throw purchaseError;
        }

        if (!purchaseData) {
          console.log('No purchase order found with ID:', orderId);
          return null;
        }

        console.log('Purchase order fetched:', purchaseData);
        
        // Helper function to validate status values
        const validateStatus = (status: string): "draft" | "pending" | "delivered" | "approved" => {
          const validStatuses = ["draft", "pending", "delivered", "approved"] as const;
          return validStatuses.includes(status as any) ? status as "draft" | "pending" | "delivered" | "approved" : "pending";
        };

        const validatePaymentStatus = (status: string): "pending" | "partial" | "paid" => {
          const validPaymentStatuses = ["pending", "partial", "paid"] as const;
          return validPaymentStatuses.includes(status as any) ? status as "pending" | "partial" | "paid" : "pending";
        };

        // Initialize form data from purchase data with proper type validation
        setFormData({
          id: purchaseData.id,
          order_number: purchaseData.order_number,
          supplier_id: purchaseData.supplier_id,
          expected_delivery_date: purchaseData.expected_delivery_date,
          notes: purchaseData.notes,
          logistics_cost: purchaseData.logistics_cost || 0,
          transit_cost: purchaseData.transit_cost || 0,
          tax_rate: purchaseData.tax_rate || 0,
          shipping_cost: purchaseData.shipping_cost || 0,
          discount: purchaseData.discount || 0,
          subtotal: purchaseData.subtotal || 0,
          tax_amount: purchaseData.tax_amount || 0,
          total_ttc: purchaseData.total_ttc || 0,
          total_amount: purchaseData.total_amount || 0,
          paid_amount: purchaseData.paid_amount || 0,
          status: validateStatus(purchaseData.status || "pending"),
          payment_status: validatePaymentStatus(purchaseData.payment_status || "pending"),
          warehouse_id: purchaseData.warehouse_id,
        });
        
        // Get items for this purchase order
        console.log('Fetching items for purchase order:', orderId);
        const { data: items, error: itemsError } = await supabase
          .from('purchase_order_items')
          .select(`
            *,
            product:catalog(id, name, reference)
          `)
          .eq('purchase_order_id', orderId);

        if (itemsError) {
          console.error('Error fetching purchase order items:', itemsError);
          throw itemsError;
        }

        console.log('Items fetched:', items?.length || 0, items);
        
        if (items && items.length > 0) {
          const formattedItems = items.map(item => ({
            id: item.id,
            purchase_order_id: item.purchase_order_id,
            product_id: item.product_id,
            quantity: Number(item.quantity || 0),
            unit_price: Number(item.unit_price || 0),
            selling_price: Number(item.selling_price || 0),
            total_price: Number(item.quantity || 0) * Number(item.unit_price || 0),
            product: item.product ? {
              id: item.product.id,
              name: item.product.name,
              reference: item.product.reference
            } : null
          }));
          
          console.log('Setting order items:', formattedItems);
          setOrderItems(formattedItems);
        } else {
          console.log('No items found, setting empty array');
          setOrderItems([]);
        }

        return purchaseData;
      } catch (error) {
        console.error('Error in purchase order fetch:', error);
        throw error;
      }
    },
    enabled: !!orderId,
    staleTime: 30000, // 30 seconds
  });

  // Function to update form data field
  const updateFormField = (field: keyof PurchaseOrder, value: any) => {
    console.log(`Updating ${String(field)} to:`, value);
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return {
    purchase,
    formData,
    orderItems,
    setOrderItems,
    updateFormField,
    isPurchaseLoading,
    refetch,
    setFormData
  };
}
