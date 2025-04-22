
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
          console.log("Successfully fetched purchase order using RPC function:", functionData);
          
          // Cast functionData to a Record<string, any> to ensure TypeScript recognizes it as an object
          const dataObject = functionData as Record<string, any>;
          
          // Process items if they exist
          const processedItems: PurchaseOrderItem[] = 
            Array.isArray(dataObject.items) ? 
              dataObject.items.map((item: any) => ({
                id: String(item.id),
                product_id: String(item.product_id),
                purchase_order_id: String(orderId),
                quantity: Number(item.quantity || 0),
                unit_price: Number(item.unit_price || 0),
                selling_price: Number(item.selling_price || 0),
                total_price: Number(item.quantity || 0) * Number(item.unit_price || 0),
                product: item.product
              })) : [];
          
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
            items: processedItems
          };
          
          // Update the orderItems state with the items from the purchase order
          setOrderItems(processedItems);
          console.log("Setting items from purchase RPC:", processedItems.length);
          
          return processedOrder;
        }
        
        console.log("RPC function failed or returned no data, trying direct query");
        
        // Fallback to the original direct query approach
        const { data: orderData, error: orderError } = await supabase
          .from('purchase_orders')
          .select(`
            *,
            supplier:suppliers(*),
            warehouse:warehouses(*)
          `)
          .eq('id', orderId)
          .maybeSingle();
          
        if (orderError) {
          console.error("Error fetching purchase order:", orderError);
          throw new Error(`Erreur lors de la récupération du bon de commande: ${orderError.message}`);
        }
          
        if (!orderData) {
          console.error("No purchase order found");
          throw new Error("Bon de commande non trouvé");
        }

        // Separately fetch items with product information
        const { data: itemsData, error: itemsError } = await supabase
          .from('purchase_order_items')
          .select(`
            *,
            product:catalog(*)
          `)
          .eq('purchase_order_id', orderId);
          
        if (itemsError) {
          console.error("Error fetching items:", itemsError);
        }
          
        console.log("Fetched items:", itemsData?.length || 0);
        
        // Process items
        const processedItems: PurchaseOrderItem[] = itemsData ? itemsData.map(item => ({
          id: String(item.id),
          product_id: String(item.product_id),
          purchase_order_id: String(orderId),
          quantity: Number(item.quantity || 0),
          unit_price: Number(item.unit_price || 0),
          selling_price: Number(item.selling_price || 0),
          total_price: Number(item.quantity || 0) * Number(item.unit_price || 0),
          product: item.product
        })) : [];

        // Ensure status is one of the allowed values, default to 'pending' if not
        const status = isValidStatus(orderData.status) ? orderData.status : 'pending';
        // Ensure payment_status is one of the allowed values, default to 'pending' if not
        const payment_status = isValidPaymentStatus(orderData.payment_status) ? orderData.payment_status : 'pending';

        // Create a properly typed PurchaseOrder object from the data
        const processedOrder: PurchaseOrder = {
          ...orderData,
          status,
          payment_status,
          items: processedItems
        };

        console.log("Processed purchase order:", processedOrder);
        console.log("Processed items:", processedItems.length);
        
        // Update the orderItems state with the items from the purchase order
        setOrderItems(processedItems);
        console.log("Setting items from direct query:", processedItems.length);

        return processedOrder;
      } catch (error) {
        console.error("Failed to fetch purchase order:", error);
        
        if (error instanceof Error) {
          toast.error(`Erreur: ${error.message}`);
        } else {
          toast.error("Erreur lors de la récupération du bon de commande");
        }
        
        throw error;
      }
    },
    retry: 1,
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
        deleted: false
      });

      // If there are items in the purchase, use them
      if (purchase.items && Array.isArray(purchase.items) && purchase.items.length > 0) {
        console.log("Setting order items from purchase:", purchase.items.length);
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
