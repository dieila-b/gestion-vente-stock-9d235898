
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { PurchaseOrder, PurchaseOrderItem } from '@/types/purchase-order';

// Type guard function to check if a string is a valid status
function isValidStatus(status: string): status is PurchaseOrder['status'] {
  return ['draft', 'pending', 'delivered', 'approved'].includes(status);
}

// Type guard function to check if a string is a valid payment status
function isValidPaymentStatus(status: string): status is PurchaseOrder['payment_status'] {
  return ['pending', 'partial', 'paid'].includes(status);
}

// Type guard to check if value is a plain object
function isPlainObject(value: any): value is Record<string, any> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Hook to fetch and manage purchase order data
 */
export function usePurchaseData(orderId?: string) {
  const [formData, setFormData] = useState<Partial<PurchaseOrder>>({});
  const [orderItems, setOrderItems] = useState<PurchaseOrderItem[]>([]);

  // Fetch items using the new RPC function
  const { data: items = [], refetch: refetchItems } = useQuery<PurchaseOrderItem[]>({
    queryKey: ['purchase-order-items', orderId],
    queryFn: async () => {
      if (!orderId) return [];
      
      console.log(`Fetching purchase order items for order ID: ${orderId} using RPC function`);
      try {
        // Use the new SQL function to get items
        const { data, error } = await supabase.rpc(
          'get_purchase_order_items',
          { order_id: orderId }
        );
        
        if (error) {
          console.error("Error fetching items with RPC:", error);
          throw error;
        }
        
        if (!data || !Array.isArray(data)) {
          console.warn("RPC returned non-array data for items:", data);
          
          // Fallback to direct query if RPC doesn't return expected format
          return fetchItemsDirectly(orderId);
        }
        
        console.log(`Successfully fetched ${data.length} items via RPC`);
        return processItems(data);
      } catch (err) {
        console.error("Error in RPC function, falling back to direct query:", err);
        return fetchItemsDirectly(orderId);
      }
    },
    enabled: !!orderId
  });
  
  // Fallback function to fetch items directly from DB
  async function fetchItemsDirectly(purchaseOrderId: string): Promise<PurchaseOrderItem[]> {
    console.log(`Falling back to direct query for items for order ID: ${purchaseOrderId}`);
    const { data, error } = await supabase
      .from('purchase_order_items')
      .select(`
        *,
        product:catalog(*)
      `)
      .eq('purchase_order_id', purchaseOrderId);
      
    if (error) {
      console.error("Error in direct items query:", error);
      throw error;
    }
    
    console.log(`Successfully fetched ${data?.length || 0} items via direct query`);
    return processItems(data || []);
  }
  
  // Process raw items data into consistent format
  function processItems(rawItems: any[]): PurchaseOrderItem[] {
    return rawItems.map(item => ({
      id: String(item.id),
      product_id: String(item.product_id),
      purchase_order_id: String(orderId),
      quantity: Number(item.quantity || 0),
      unit_price: Number(item.unit_price || 0),
      selling_price: Number(item.selling_price || 0),
      total_price: Number(item.total_price || (item.quantity * item.unit_price)),
      product: item.product ? {
        id: String(item.product.id),
        name: String(item.product.name || ''),
        reference: item.product.reference ? String(item.product.reference) : undefined
      } : undefined
    }));
  }

  // Fetch the purchase order 
  const { data: purchase, isLoading: isPurchaseLoading, refetch } = useQuery<PurchaseOrder | null>({
    queryKey: ['purchase', orderId],
    queryFn: async () => {
      if (!orderId) {
        console.log("No order ID provided");
        return null;
      }

      try {
        console.log(`Fetching purchase order with ID: ${orderId}`);
        
        // Try to use the database function first, which is more reliable
        const { data: functionData, error: functionError } = await supabase
          .rpc('get_purchase_order_by_id', { order_id: orderId });
        
        if (functionData && !functionError && isPlainObject(functionData)) {
          console.log("Successfully fetched purchase order using RPC function");
          
          // Cast functionData to a Record<string, any> to ensure TypeScript recognizes it as an object
          const dataObject = functionData as Record<string, any>;
          
          // Ensure status is one of the allowed values
          const status = typeof dataObject.status === 'string' && 
                         isValidStatus(dataObject.status) ? 
                         dataObject.status : 'pending';
                         
          // Ensure payment_status is one of the allowed values
          const payment_status = typeof dataObject.payment_status === 'string' && 
                                isValidPaymentStatus(dataObject.payment_status) ? 
                                dataObject.payment_status : 'pending';
          
          // Create a base object and then add the validated fields
          const baseObject: Partial<PurchaseOrder> = {
            id: String(dataObject.id || ''),
            order_number: String(dataObject.order_number || ''),
            created_at: String(dataObject.created_at || ''),
            updated_at: dataObject.updated_at ? String(dataObject.updated_at) : undefined,
            supplier_id: String(dataObject.supplier_id || ''),
            discount: Number(dataObject.discount || 0),
            expected_delivery_date: String(dataObject.expected_delivery_date || ''),
            notes: String(dataObject.notes || ''),
            logistics_cost: Number(dataObject.logistics_cost || 0),
            transit_cost: Number(dataObject.transit_cost || 0),
            tax_rate: Number(dataObject.tax_rate || 0),
            shipping_cost: Number(dataObject.shipping_cost || 0),
            subtotal: Number(dataObject.subtotal || 0),
            tax_amount: Number(dataObject.tax_amount || 0),
            total_ttc: Number(dataObject.total_ttc || 0),
            total_amount: Number(dataObject.total_amount || 0),
            paid_amount: Number(dataObject.paid_amount || 0),
            warehouse_id: dataObject.warehouse_id ? String(dataObject.warehouse_id) : undefined,
            supplier: dataObject.supplier || {},
            warehouse: dataObject.warehouse || {},
          };
          
          const processedOrder: PurchaseOrder = {
            ...baseObject as PurchaseOrder,
            status,
            payment_status,
            items: []  // Items will be set from the separate query
          };
          
          return processedOrder;
        }
        
        console.warn("RPC function failed or returned invalid data, falling back to direct query");
        
        // Fallback to direct query
        const { data, error } = await supabase
          .from('purchase_orders')
          .select(`
            *,
            supplier:suppliers(*)
          `)
          .eq('id', orderId)
          .single();
          
        if (error) {
          console.error("Error in direct purchase order query:", error);
          throw error;
        }
        
        if (!data) {
          console.error("No purchase order found with ID:", orderId);
          return null;
        }
        
        // Ensure status is valid
        const validStatus = isValidStatus(data.status) ? data.status : 'pending';
        const validPaymentStatus = isValidPaymentStatus(data.payment_status) ? data.payment_status : 'pending';
        
        return {
          ...data,
          status: validStatus,
          payment_status: validPaymentStatus,
          items: [] // Items will be set from the separate query
        } as PurchaseOrder;
      } catch (error) {
        console.error("Error fetching purchase order:", error);
        toast.error("Erreur lors du chargement du bon de commande");
        return null;
      }
    },
    enabled: !!orderId
  });

  // Update form data when purchase data is loaded
  useEffect(() => {
    if (purchase) {
      setFormData({
        supplier_id: purchase.supplier_id,
        order_number: purchase.order_number,
        expected_delivery_date: purchase.expected_delivery_date,
        notes: purchase.notes,
        status: purchase.status,
        payment_status: purchase.payment_status,
        discount: purchase.discount,
        shipping_cost: purchase.shipping_cost,
        logistics_cost: purchase.logistics_cost,
        transit_cost: purchase.transit_cost,
        tax_rate: purchase.tax_rate,
        paid_amount: purchase.paid_amount
      });
    }
  }, [purchase]);
  
  // Update order items when items data is loaded
  useEffect(() => {
    if (items && Array.isArray(items)) {
      console.log(`Setting ${items.length} items to state`);
      setOrderItems(items);
    }
  }, [items]);

  // Update a field in the form data
  const updateFormField = (field: keyof PurchaseOrder, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return {
    purchase,
    formData,
    orderItems,
    setOrderItems,
    updateFormField,
    isPurchaseLoading,
    refetch: async () => {
      await refetch();
      await refetchItems();
    }
  };
}
