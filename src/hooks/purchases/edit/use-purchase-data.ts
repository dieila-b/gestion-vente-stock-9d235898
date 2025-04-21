
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { PurchaseOrder } from '@/types/purchase-order';

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

      try {
        // Try direct query first
        console.log("Fetching purchase order with ID:", orderId);
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
          .maybeSingle(); // Using maybeSingle instead of single to avoid errors when no data found

        if (error) {
          console.error("Error fetching purchase order:", error);
          toast.error(`Erreur: ${error.message}`);
          
          // Fallback to RPC if direct query fails
          console.log("Attempting to fetch purchase order via RPC...");
          const { data: rpcData, error: rpcError } = await supabase.rpc(
            'get_purchase_order_by_id',
            { order_id: orderId }
          );
          
          if (rpcError) {
            console.error("RPC fetch error:", rpcError);
            throw new Error(rpcError.message);
          }
          
          if (rpcData) {
            console.log("Purchase order fetched via RPC:", rpcData);
            return rpcData;
          }
          
          throw new Error("Bon de commande non trouvé");
        }

        if (!data) {
          console.log("No purchase order found with ID:", orderId);
          throw new Error("Bon de commande non trouvé");
        }

        // We don't try to access data.deleted directly since it might not exist in the database
        // Instead, we treat all purchase orders as non-deleted by default
        // Also ensure status is one of the valid enum values
        const safeStatus = (status: string): PurchaseOrder['status'] => {
          if (['draft', 'pending', 'delivered', 'approved'].includes(status)) {
            return status as PurchaseOrder['status'];
          }
          return 'draft';
        };
        
        const processedData = {
          ...data,
          deleted: false, // Default value, since column doesn't exist in the database
          status: safeStatus(data.status),
          items: data.items || []
        };

        console.log("Fetched purchase order:", processedData);
        return processedData;
      } catch (error) {
        console.error("Failed to fetch purchase order:", error);
        toast.error(`Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
        throw error;
      }
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
        deleted: false // Set default value, since column doesn't exist in the database
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
