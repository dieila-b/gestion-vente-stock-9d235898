
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Hook to fetch and manage purchase order data
 */
export function usePurchaseData(orderId?: string) {
  const [formData, setFormData] = useState<any>({});
  const [orderItems, setOrderItems] = useState<any[]>([]);

  // Fetch the purchase order 
  const { data: purchase, isLoading: isPurchaseLoading, refetch } = useQuery({
    queryKey: ['purchase', orderId],
    queryFn: async () => {
      if (!orderId) return null;

      const { data, error } = await supabase
        .from('purchase_orders')
        .select(`
          *,
          supplier:suppliers(*),
          items:purchase_order_items(
            id,
            product_id,
            quantity,
            unit_price,
            selling_price,
            total_price,
            product:product_id(id, name, reference)
          ),
          warehouse:warehouses(id, name)
        `)
        .eq('id', orderId)
        .single();

      if (error) {
        console.error("Error fetching purchase order:", error);
        toast.error(`Erreur: ${error.message}`);
        throw new Error(error.message);
      }

      // Ensure the purchase has a deleted property
      const processedData = {
        ...data,
        deleted: typeof data.deleted === 'boolean' ? data.deleted : false
      };

      console.log("Fetched purchase order:", processedData);
      return processedData;
    },
    enabled: !!orderId
  });

  // Set states when data is loaded
  useEffect(() => {
    if (purchase) {
      setFormData({
        order_number: purchase.order_number,
        supplier_id: purchase.supplier_id,
        expected_delivery_date: purchase.expected_delivery_date,
        warehouse_id: purchase.warehouse_id,
        notes: purchase.notes,
        status: purchase.status,
        payment_status: purchase.payment_status,
        discount: purchase.discount,
        shipping_cost: purchase.shipping_cost,
        transit_cost: purchase.transit_cost,
        logistics_cost: purchase.logistics_cost,
        tax_rate: purchase.tax_rate,
        deleted: purchase.deleted
      });
      
      // Set order items
      if (purchase.items) {
        setOrderItems(purchase.items);
      }
    }
  }, [purchase]);

  // Handle form data changes
  const updateFormField = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return {
    purchase,
    formData,
    orderItems,
    setOrderItems,
    updateFormField,
    isPurchaseLoading,
    refetch
  };
}
