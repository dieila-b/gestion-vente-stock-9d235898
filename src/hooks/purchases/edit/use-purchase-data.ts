
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

/**
 * Hook to fetch and manage purchase order data
 */
export function usePurchaseData(orderId?: string) {
  const [formData, setFormData] = useState<Partial<PurchaseOrder>>({});
  const [orderItems, setOrderItems] = useState<PurchaseOrderItem[]>([]);

  // Fetch the purchase order using the Supabase RPC function
  const { data: purchase, isLoading: isPurchaseLoading, refetch } = useQuery<PurchaseOrder | null>({
    queryKey: ['purchase', orderId],
    queryFn: async () => {
      if (!orderId) {
        console.log("No order ID provided");
        return null;
      }

      try {
        console.log(`Fetching purchase order with ID: ${orderId}`);
        
        // Call the RPC function to get the purchase order by ID
        const { data, error } = await supabase
          .rpc('get_purchase_order_by_id', { order_id: orderId });
        
        if (error) {
          console.error("Error fetching purchase order:", error);
          toast.error(`Erreur: ${error.message}`);
          throw error;
        }
        
        if (!data) {
          console.error("No purchase order found with ID:", orderId);
          toast.error("Bon de commande non trouvé");
          return null;
        }

        console.log("Purchase order data retrieved:", data);
        
        // Process the items with proper type checking
        let processedItems: PurchaseOrderItem[] = [];
        
        if (data.items && Array.isArray(data.items)) {
          processedItems = data.items.map(item => ({
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
          id: String(data.id || ''),
          order_number: String(data.order_number || ''),
          created_at: String(data.created_at || ''),
          updated_at: data.updated_at ? String(data.updated_at) : undefined,
          status: isValidStatus(String(data.status)) ? String(data.status) as PurchaseOrder['status'] : 'pending',
          supplier_id: String(data.supplier_id || ''),
          discount: Number(data.discount || 0),
          expected_delivery_date: String(data.expected_delivery_date || ''),
          notes: String(data.notes || ''),
          logistics_cost: Number(data.logistics_cost || 0),
          transit_cost: Number(data.transit_cost || 0),
          tax_rate: Number(data.tax_rate || 0),
          shipping_cost: Number(data.shipping_cost || 0),
          subtotal: Number(data.subtotal || 0),
          tax_amount: Number(data.tax_amount || 0),
          total_ttc: Number(data.total_ttc || 0),
          total_amount: Number(data.total_amount || 0),
          paid_amount: Number(data.paid_amount || 0),
          payment_status: isValidPaymentStatus(String(data.payment_status)) 
            ? String(data.payment_status) as PurchaseOrder['payment_status'] 
            : 'pending',
          warehouse_id: data.warehouse_id ? String(data.warehouse_id) : undefined,
          supplier: data.supplier ? {
            id: String(data.supplier.id || ''),
            name: String(data.supplier.name || ''),
            email: data.supplier.email ? String(data.supplier.email) : '',
            phone: data.supplier.phone ? String(data.supplier.phone) : '',
            address: data.supplier.address ? String(data.supplier.address) : '',
            contact: data.supplier.contact ? String(data.supplier.contact) : ''
          } : {
            id: '',
            name: '',
            email: '',
            phone: '',
            address: '',
            contact: ''
          },
          warehouse: data.warehouse ? {
            id: String(data.warehouse.id || ''),
            name: String(data.warehouse.name || '')
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
    enabled: !!orderId,
    retry: 1
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
