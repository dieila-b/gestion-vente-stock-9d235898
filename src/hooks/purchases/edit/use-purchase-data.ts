
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PurchaseOrder, PurchaseOrderItem } from '@/types/purchase-order';

export function usePurchaseData(orderId?: string) {
  const [formData, setFormData] = useState<Partial<PurchaseOrder>>({});
  const [orderItems, setOrderItems] = useState<PurchaseOrderItem[]>([]);

  // Fetch purchase order data with items using the database function
  const {
    data: purchaseData,
    isLoading: isPurchaseLoading,
    refetch
  } = useQuery({
    queryKey: ['purchase-with-items', orderId],
    queryFn: async () => {
      if (!orderId) return null;

      try {
        console.log('Fetching purchase order with items for ID:', orderId);
        
        // Use the database function to get complete purchase order data
        const { data, error } = await supabase.rpc('get_purchase_order_by_id', {
          order_id: orderId
        });

        if (error) {
          console.error('Error fetching purchase order:', error);
          throw error;
        }

        if (!data) {
          console.log('No purchase order found with ID:', orderId);
          return null;
        }

        console.log('Purchase order with items fetched:', data);
        return data as unknown as PurchaseOrder;
      } catch (error) {
        console.error('Error in purchase order fetch:', error);
        throw error;
      }
    },
    enabled: !!orderId,
    staleTime: 30000, // 30 seconds
  });

  // Initialize form data when purchase data is loaded
  useEffect(() => {
    if (purchaseData) {
      console.log('Initializing form data with purchase:', purchaseData);
      
      // Helper function to validate status values
      const validateStatus = (status: string): "draft" | "pending" | "delivered" | "approved" => {
        const validStatuses = ["draft", "pending", "delivered", "approved"] as const;
        return validStatuses.includes(status as any) ? status as "draft" | "pending" | "delivered" | "approved" : "pending";
      };

      const validatePaymentStatus = (status: string): "pending" | "partial" | "paid" => {
        const validPaymentStatuses = ["pending", "partial", "paid"] as const;
        return validPaymentStatuses.includes(status as any) ? status as "pending" | "partial" | "paid" : "pending";
      };

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
        supplier: purchaseData.supplier,
        warehouse: purchaseData.warehouse,
      });

      // Initialize order items
      if (purchaseData.items && Array.isArray(purchaseData.items)) {
        console.log('Initializing order items from purchase data:', purchaseData.items);
        
        const formattedItems = purchaseData.items.map((item: any) => ({
          id: item.id,
          purchase_order_id: item.purchase_order_id || purchaseData.id,
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
        
        console.log('Setting formatted order items:', formattedItems);
        setOrderItems(formattedItems);
      } else {
        console.log('No items found in purchase data, setting empty array');
        setOrderItems([]);
      }
    }
  }, [purchaseData]);

  // Function to update form data field
  const updateFormField = (field: keyof PurchaseOrder, value: any) => {
    console.log(`Updating ${String(field)} to:`, value);
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return {
    purchase: purchaseData,
    formData,
    orderItems,
    setOrderItems,
    updateFormField,
    isPurchaseLoading,
    refetch,
    setFormData
  };
}
