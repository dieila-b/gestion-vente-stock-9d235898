
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

  // Fetch the purchase order with items included
  const { data: purchase, isLoading: isPurchaseLoading, refetch } = useQuery<PurchaseOrder | null>({
    queryKey: ['purchase', orderId],
    queryFn: async () => {
      if (!orderId) {
        console.log("No order ID provided");
        return null;
      }

      try {
        console.log(`Fetching purchase order with ID: ${orderId}`);
        
        // Use the RPC get_purchase_order_by_id to retrieve the data
        const { data, error } = await supabase
          .rpc('get_purchase_order_by_id', { order_id: orderId });
        
        if (error) {
          console.error("Error fetching purchase order:", error);
          throw error;
        }
        
        if (!data) {
          console.error("No purchase order found with ID:", orderId);
          return null;
        }

        // Ensure data is an object before proceeding
        if (!isPlainObject(data)) {
          console.error("Invalid data format received:", data);
          return null;
        }
        
        // Process the data with proper type checking
        const typedData = data as Record<string, any>;
        
        // Ensure the status is valid
        const validStatus: PurchaseOrder['status'] = typedData.status && isValidStatus(String(typedData.status)) 
          ? String(typedData.status) as PurchaseOrder['status']
          : 'pending';
          
        const validPaymentStatus: PurchaseOrder['payment_status'] = typedData.payment_status && isValidPaymentStatus(String(typedData.payment_status)) 
          ? String(typedData.payment_status) as PurchaseOrder['payment_status']
          : 'pending';
        
        // Process the items with proper type checking
        let processedItems: PurchaseOrderItem[] = [];
        
        if (typedData.items && Array.isArray(typedData.items)) {
          processedItems = typedData.items.map(item => ({
            id: String(item.id || ''),
            product_id: String(item.product_id || ''),
            purchase_order_id: orderId,
            quantity: Number(item.quantity || 0),
            unit_price: Number(item.unit_price || 0),
            selling_price: Number(item.selling_price || 0),
            total_price: Number(item.total_price || 0),
            product: item.product ? {
              id: String(item.product.id || ''),
              name: String(item.product.name || ''),
              reference: item.product.reference ? String(item.product.reference) : undefined
            } : undefined
          }));
          
          console.log(`Processed ${processedItems.length} items from order data`);
          setOrderItems(processedItems);
        } else {
          console.warn("No items array in order data, or invalid format");
        }
        
        // Create a properly typed PurchaseOrder object
        const purchaseOrder: PurchaseOrder = {
          id: String(typedData.id || ''),
          order_number: String(typedData.order_number || ''),
          created_at: String(typedData.created_at || ''),
          updated_at: typedData.updated_at ? String(typedData.updated_at) : undefined,
          status: validStatus,
          supplier_id: String(typedData.supplier_id || ''),
          discount: Number(typedData.discount || 0),
          expected_delivery_date: String(typedData.expected_delivery_date || ''),
          notes: String(typedData.notes || ''),
          logistics_cost: Number(typedData.logistics_cost || 0),
          transit_cost: Number(typedData.transit_cost || 0),
          tax_rate: Number(typedData.tax_rate || 0),
          shipping_cost: Number(typedData.shipping_cost || 0),
          subtotal: Number(typedData.subtotal || 0),
          tax_amount: Number(typedData.tax_amount || 0),
          total_ttc: Number(typedData.total_ttc || 0),
          total_amount: Number(typedData.total_amount || 0),
          paid_amount: Number(typedData.paid_amount || 0),
          payment_status: validPaymentStatus,
          warehouse_id: typedData.warehouse_id ? String(typedData.warehouse_id) : undefined,
          supplier: typedData.supplier ? {
            id: String(typedData.supplier.id || ''),
            name: String(typedData.supplier.name || ''),
            email: typedData.supplier.email ? String(typedData.supplier.email) : '',
            phone: typedData.supplier.phone ? String(typedData.supplier.phone) : '',
            address: typedData.supplier.address ? String(typedData.supplier.address) : '',
            contact: typedData.supplier.contact ? String(typedData.supplier.contact) : ''
          } : {
            id: '',
            name: '',
            email: '',
            phone: '',
            address: '',
            contact: ''
          },
          warehouse: typedData.warehouse ? {
            id: String(typedData.warehouse.id || ''),
            name: String(typedData.warehouse.name || '')
          } : undefined,
          items: processedItems
        };
        
        return purchaseOrder;
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
    refetch
  };
}
