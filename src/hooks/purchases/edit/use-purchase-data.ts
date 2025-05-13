
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
        
        // Use the get_purchase_order_by_id database function
        const { data, error } = await supabase
          .rpc('get_purchase_order_by_id', { order_id: orderId });

        if (error) {
          console.error('Error fetching purchase order:', error);
          throw error;
        }

        if (!data) {
          console.log('No purchase order found with ID:', orderId);
          return null;
        }

        // Cast data to a PurchaseOrder object to handle the JSON response properly
        const purchaseData = data as unknown as PurchaseOrder;
        console.log('Full response from get_purchase_order_by_id:', purchaseData);
        
        // Initialize form data from purchase data
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
          status: purchaseData.status,
          payment_status: purchaseData.payment_status,
          warehouse_id: purchaseData.warehouse_id,
        });
        
        // Check if items array exists and is populated
        if (purchaseData.items && Array.isArray(purchaseData.items) && purchaseData.items.length > 0) {
          console.log('Items from RPC response:', purchaseData.items);
          console.log('First item details:', purchaseData.items[0]);
          setOrderItems(purchaseData.items as PurchaseOrderItem[]);
        } else {
          // Fallback to fetch items separately if needed
          console.log('No items in RPC response or empty array, fetching separately');
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

          console.log('Items fetched separately:', items);
          if (items && items.length > 0) {
            setOrderItems(items);
          }
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
