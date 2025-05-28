
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
        return purchaseData;
      } catch (error) {
        console.error('Error in purchase order fetch:', error);
        throw error;
      }
    },
    enabled: !!orderId,
    staleTime: 30000, // 30 seconds
  });

  // Fetch purchase order items separately
  const {
    data: items,
    isLoading: isItemsLoading
  } = useQuery({
    queryKey: ['purchase-items', orderId],
    queryFn: async () => {
      if (!orderId) return [];

      try {
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
        return items || [];
      } catch (error) {
        console.error('Error fetching items:', error);
        return [];
      }
    },
    enabled: !!orderId,
    staleTime: 30000,
  });

  // Initialize form data when purchase data is loaded
  useEffect(() => {
    if (purchase) {
      console.log('Initializing form data with purchase:', purchase);
      
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
        id: purchase.id,
        order_number: purchase.order_number,
        supplier_id: purchase.supplier_id,
        expected_delivery_date: purchase.expected_delivery_date,
        notes: purchase.notes,
        logistics_cost: purchase.logistics_cost || 0,
        transit_cost: purchase.transit_cost || 0,
        tax_rate: purchase.tax_rate || 0,
        shipping_cost: purchase.shipping_cost || 0,
        discount: purchase.discount || 0,
        subtotal: purchase.subtotal || 0,
        tax_amount: purchase.tax_amount || 0,
        total_ttc: purchase.total_ttc || 0,
        total_amount: purchase.total_amount || 0,
        paid_amount: purchase.paid_amount || 0,
        status: validateStatus(purchase.status || "pending"),
        payment_status: validatePaymentStatus(purchase.payment_status || "pending"),
        warehouse_id: purchase.warehouse_id,
      });
    }
  }, [purchase]);

  // Initialize order items when items data is loaded
  useEffect(() => {
    if (items && items.length >= 0) {
      console.log('Initializing order items:', items);
      
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
      
      console.log('Setting formatted order items:', formattedItems);
      setOrderItems(formattedItems);
    }
  }, [items]);

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
    isPurchaseLoading: isPurchaseLoading || isItemsLoading,
    refetch,
    setFormData
  };
}
