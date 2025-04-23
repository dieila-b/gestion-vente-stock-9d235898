
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
        
        // Utiliser la fonction RPC get_purchase_order_by_id pour récupérer les données
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
        
        // S'assurer que le statut est valide
        const validStatus = isValidStatus(data.status) ? data.status : 'pending';
        const validPaymentStatus = isValidPaymentStatus(data.payment_status) ? data.payment_status : 'pending';
        
        // Traiter les articles s'ils existent
        if (data.items && Array.isArray(data.items)) {
          const processedItems = data.items.map(item => ({
            id: String(item.id),
            product_id: String(item.product_id),
            purchase_order_id: orderId,
            quantity: Number(item.quantity || 0),
            unit_price: Number(item.unit_price || 0),
            selling_price: Number(item.selling_price || 0),
            total_price: Number(item.total_price || 0),
            product: item.product ? {
              id: String(item.product.id),
              name: String(item.product.name || ''),
              reference: item.product.reference ? String(item.product.reference) : undefined
            } : undefined
          }));
          
          console.log(`Processed ${processedItems.length} items from order data`);
          setOrderItems(processedItems);
        } else {
          console.warn("No items array in order data, or invalid format");
        }
        
        return {
          ...data,
          status: validStatus,
          payment_status: validPaymentStatus,
          items: data.items || []
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
