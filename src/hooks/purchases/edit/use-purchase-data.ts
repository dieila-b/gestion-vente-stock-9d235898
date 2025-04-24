
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

        // Cast data to an object to handle the JSON response properly
        const purchaseData = data as unknown as PurchaseOrder;
        
        // Set order items if they exist in the response
        if (purchaseData.items && Array.isArray(purchaseData.items)) {
          console.log('Setting order items from response:', purchaseData.items.length);
          setOrderItems(purchaseData.items as PurchaseOrderItem[]);
        } else {
          // Fallback to fetch items separately if needed
          const { data: items, error: itemsError } = await supabase
            .from('purchase_order_items')
            .select(`
              *,
              product:product_id(id, name, reference)
            `)
            .eq('purchase_order_id', orderId);

          if (itemsError) {
            console.error('Error fetching purchase order items:', itemsError);
          } else if (items) {
            console.log('Fetched items separately:', items.length);
            setOrderItems(items as PurchaseOrderItem[]);
          }
        }
        
        console.log('Fetched purchase order:', purchaseData);
        return purchaseData;
      } catch (err) {
        console.error('Error in purchase order query:', err);
        return null; // Return null instead of throwing to prevent query from failing
      }
    },
    enabled: !!orderId,
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: false
  });

  // Set form data based on purchase
  useEffect(() => {
    if (purchase) {
      console.log('Setting form data from purchase:', purchase);
      setFormData({
        order_number: purchase.order_number,
        supplier_id: purchase.supplier_id,
        warehouse_id: purchase.warehouse_id,
        expected_delivery_date: purchase.expected_delivery_date,
        status: purchase.status,
        payment_status: purchase.payment_status,
        notes: purchase.notes,
        discount: purchase.discount,
        shipping_cost: purchase.shipping_cost,
        transit_cost: purchase.transit_cost,
        logistics_cost: purchase.logistics_cost,
        tax_rate: purchase.tax_rate,
        subtotal: purchase.subtotal,
        tax_amount: purchase.tax_amount,
        total_ttc: purchase.total_ttc,
        total_amount: purchase.total_amount,
        paid_amount: purchase.paid_amount
      });
    }
  }, [purchase]);

  // Handle form field updates
  const updateFormField = (field: keyof PurchaseOrder, value: any) => {
    console.log(`Updating field ${field}:`, value);
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return {
    purchase,
    formData,
    setFormData,
    orderItems,
    setOrderItems,
    updateFormField,
    isPurchaseLoading,
    refetch
  };
}
