
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { PurchaseOrder } from '@/types/purchase-order';

/**
 * Hook to fetch and manage purchase order data
 */
export function usePurchaseData(orderId?: string) {
  const [formData, setFormData] = useState<Partial<PurchaseOrder>>({});
  const [orderItems, setOrderItems] = useState<PurchaseOrder['items']>([]);

  // Fetch the purchase order 
  const { data: purchase, isLoading: isPurchaseLoading, refetch } = useQuery<PurchaseOrder | null>({
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
              product:catalog(id, name, reference)
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
          const { data: rpcDataRaw, error: rpcError } = await supabase.rpc(
            'get_purchase_order_by_id',
            { order_id: orderId }
          );

          if (rpcError) {
            console.error("RPC fetch error:", rpcError);
            throw new Error(rpcError.message);
          }

          if (!rpcDataRaw) {
            throw new Error("Bon de commande non trouvé");
          }

          // Parse RPC jsonb data into PurchaseOrder type
          const rpcData = typeof rpcDataRaw === 'string' ? JSON.parse(rpcDataRaw) : rpcDataRaw;

          // Construct full PurchaseOrder with defaults
          const safeStatus = (status: any): PurchaseOrder['status'] => {
            if (['draft', 'pending', 'delivered', 'approved'].includes(status)) {
              return status as PurchaseOrder['status'];
            }
            return 'draft';
          };

          const safePaymentStatus = (status: any): PurchaseOrder['payment_status'] => {
            if (['pending', 'partial', 'paid'].includes(status)) {
              return status as PurchaseOrder['payment_status'];
            }
            return 'pending';
          };

          const processedRpcData: PurchaseOrder = {
            id: rpcData.id,
            order_number: rpcData.order_number,
            created_at: rpcData.created_at,
            updated_at: rpcData.updated_at,
            status: safeStatus(rpcData.status),
            supplier_id: rpcData.supplier_id,
            discount: rpcData.discount || 0,
            expected_delivery_date: rpcData.expected_delivery_date || '',
            notes: rpcData.notes || '',
            logistics_cost: rpcData.logistics_cost || 0,
            transit_cost: rpcData.transit_cost || 0,
            tax_rate: rpcData.tax_rate || 0,
            shipping_cost: rpcData.shipping_cost || 0,
            subtotal: rpcData.subtotal || 0,
            tax_amount: rpcData.tax_amount || 0,
            total_ttc: rpcData.total_ttc || 0,
            total_amount: rpcData.total_amount || 0,
            paid_amount: rpcData.paid_amount || 0,
            payment_status: safePaymentStatus(rpcData.payment_status),
            warehouse_id: rpcData.warehouse_id || undefined,
            supplier: {
              id: rpcData.supplier?.id,
              name: rpcData.supplier?.name,
              email: rpcData.supplier?.email,
              phone: rpcData.supplier?.phone,
              address: rpcData.supplier?.address,
              city: ''
            },
            warehouse: rpcData.warehouse ? {
              id: rpcData.warehouse.id,
              name: rpcData.warehouse.name
            } : undefined,
            items: rpcData.items || [],
            deleted: false
          };

          console.log("Purchase order fetched via RPC:", processedRpcData);
          return processedRpcData;
        }

        if (!data) {
          console.log("No purchase order found with ID:", orderId);
          throw new Error("Bon de commande non trouvé");
        }

        // We don't try to access data.deleted directly since it might not exist in the database
        // Instead, we treat all purchase orders as non-deleted by default
        // Also ensure status is one of the valid enum values
        const safeStatus = (status: any): PurchaseOrder['status'] => {
          if (['draft', 'pending', 'delivered', 'approved'].includes(status)) {
            return status as PurchaseOrder['status'];
          }
          return 'draft';
        };

        const safePaymentStatus = (status: any): PurchaseOrder['payment_status'] => {
          if (['pending', 'partial', 'paid'].includes(status)) {
            return status as PurchaseOrder['payment_status'];
          }
          return 'pending';
        };

        const processedData: PurchaseOrder = {
          ...data,
          deleted: false, // Default value, since column doesn't exist in the database
          status: safeStatus(data.status),
          payment_status: safePaymentStatus(data.payment_status),
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

