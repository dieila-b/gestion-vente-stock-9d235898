
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { PurchaseOrder, PurchaseOrderItem } from '@/types/purchase-order';

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
        
        // Try direct query first with complete log
        console.log("Attempting direct query to purchase_orders");
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
              product:catalog(id, name, reference)
            ),
            warehouse:warehouses(id, name)
          `)
          .eq('id', orderId)
          .maybeSingle(); // Using maybeSingle instead of single to avoid errors when no data found

        if (error) {
          console.error("Error in direct query:", error);
          throw error;
        }

        if (!data) {
          console.log("No data found with direct query for ID:", orderId);
          
          // Try RPC as fallback
          console.log("Attempting RPC fallback");
          const { data: rpcData, error: rpcError } = await supabase.rpc(
            'get_purchase_order_by_id', 
            { order_id: orderId }
          );
          
          if (rpcError) {
            console.error("RPC error:", rpcError);
            throw new Error(`Erreur lors de la récupération du bon de commande: ${rpcError.message}`);
          }
          
          if (!rpcData) {
            console.error("No data found via RPC");
            throw new Error("Bon de commande non trouvé");
          }
          
          console.log("RPC data found:", rpcData);
          // Explicitly cast as PurchaseOrder after confirming the structure
          return rpcData as unknown as PurchaseOrder;
        }

        console.log("Purchase order found:", data);
        
        // Ensure proper typing for enums and defaults
        const safeStatus = (status: any): PurchaseOrder['status'] => {
          return ['draft', 'pending', 'delivered', 'approved'].includes(status) 
            ? status as PurchaseOrder['status'] 
            : 'draft';
        };

        const safePaymentStatus = (status: any): PurchaseOrder['payment_status'] => {
          return ['pending', 'partial', 'paid'].includes(status) 
            ? status as PurchaseOrder['payment_status'] 
            : 'pending';
        };

        // Ensure we have proper default values for all fields
        const processedData: PurchaseOrder = {
          ...data,
          status: safeStatus(data.status),
          payment_status: safePaymentStatus(data.payment_status),
          items: data.items || [],
          discount: data.discount || 0,
          logistics_cost: data.logistics_cost || 0,
          transit_cost: data.transit_cost || 0,
          tax_rate: data.tax_rate || 0,
          shipping_cost: data.shipping_cost || 0,
          deleted: false
        };

        return processedData;
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

      // Set order items if they exist
      if (purchase.items && Array.isArray(purchase.items)) {
        console.log("Setting order items:", purchase.items);
        setOrderItems(purchase.items);
      } else {
        console.log("No order items found or items is not an array:", purchase.items);
        setOrderItems([]);
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
