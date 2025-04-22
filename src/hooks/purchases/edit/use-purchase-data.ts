
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
        
        // First try to get the purchase order with items
        const { data: rawData, error } = await supabase.rpc(
          'get_purchase_order_by_id', 
          { order_id: orderId }
        );
          
        if (error) {
          console.error("RPC error:", error);
          throw new Error(`Erreur lors de la récupération du bon de commande: ${error.message}`);
        }
          
        if (!rawData) {
          console.error("No data found via RPC");
          throw new Error("Bon de commande non trouvé");
        }
          
        console.log("RPC data found:", rawData);
        
        // Safely cast the raw data to a Record<string, any> to avoid TypeScript errors
        const data = rawData as Record<string, any>;
        
        // Ensure data is an object before proceeding
        if (typeof data !== 'object' || data === null) {
          throw new Error("Format de données invalide");
        }
        
        // Ensure proper typing for enums and defaults
        const safeStatus = (status: any): PurchaseOrder['status'] => {
          return ['draft', 'pending', 'delivered', 'approved'].includes(String(status)) 
            ? status as PurchaseOrder['status'] 
            : 'draft';
        };

        const safePaymentStatus = (status: any): PurchaseOrder['payment_status'] => {
          return ['pending', 'partial', 'paid'].includes(String(status)) 
            ? status as PurchaseOrder['payment_status'] 
            : 'pending';
        };

        // Create a properly typed PurchaseOrder object from the data
        const processedData: PurchaseOrder = {
          id: String(data.id || ''),
          order_number: String(data.order_number || ''),
          created_at: String(data.created_at || ''),
          updated_at: String(data.updated_at || ''),
          status: safeStatus(data.status),
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
          payment_status: safePaymentStatus(data.payment_status),
          warehouse_id: String(data.warehouse_id || ''),
          supplier: data.supplier as PurchaseOrder['supplier'],
          warehouse: data.warehouse as PurchaseOrder['warehouse'],
          items: Array.isArray(data.items) ? data.items : [],
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

      // If there are items in the purchase, use them
      if (purchase.items && Array.isArray(purchase.items)) {
        console.log("Setting order items:", purchase.items);
        setOrderItems(purchase.items);
      } else {
        console.log("No order items found or items is not an array");
        
        // If no items are found, fetch them directly
        const fetchOrderItems = async () => {
          try {
            const { data, error } = await supabase
              .from('purchase_order_items')
              .select(`
                *,
                product:catalog(id, name, reference)
              `)
              .eq('purchase_order_id', purchase.id);
            
            if (error) throw error;
            
            console.log("Fetched items directly:", data);
            if (data && data.length > 0) {
              setOrderItems(data);
            } else {
              setOrderItems([]);
            }
          } catch (err) {
            console.error("Error fetching order items:", err);
            setOrderItems([]);
          }
        };
        
        fetchOrderItems();
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
