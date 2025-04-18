
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PurchaseOrder, Supplier } from "@/types/purchase-order";
import { toast } from "sonner";
import { isSelectQueryError } from "@/utils/type-utils";

export function usePurchaseOrdersQuery() {
  return useQuery({
    queryKey: ['purchase-orders'],
    queryFn: async () => {
      try {
        console.log("Fetching purchase orders...");
        
        const { data, error } = await supabase
          .from('purchase_orders')
          .select(`
            *,
            supplier:suppliers(*),
            warehouse:warehouses(*),
            items:purchase_order_items(*)
          `)
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error("Error fetching purchase orders with Supabase:", error);
          throw error;
        }
        
        console.log("Raw purchase order data:", data);
        
        if (!data || data.length === 0) {
          console.log("No purchase orders found in database");
          return [];
        }
        
        const processedData = data.map(order => {
          const supplierData: Partial<Supplier> = order.supplier || {};
          
          const formattedSupplier: Supplier = {
            id: (supplierData?.id || order.supplier_id || '').toString(),
            name: supplierData?.name || 'Fournisseur inconnu',
            phone: supplierData?.phone || '',
            email: supplierData?.email || ''
          };
          
          const safeStatus = (status: string): PurchaseOrder['status'] => {
            if (['draft', 'pending', 'delivered', 'approved'].includes(status)) {
              return status as PurchaseOrder['status'];
            }
            return 'draft';
          };
          
          const safePaymentStatus = (status: string): PurchaseOrder['payment_status'] => {
            if (['pending', 'partial', 'paid'].includes(status)) {
              return status as PurchaseOrder['payment_status'];
            }
            return 'pending';
          };
          
          return {
            ...order,
            supplier: formattedSupplier,
            deleted: false,
            items: Array.isArray(order.items) ? order.items : [],
            payment_status: safePaymentStatus(order.payment_status),
            status: safeStatus(order.status),
            total_amount: order.total_amount || 0,
            order_number: order.order_number || `PO-${order.id.slice(0, 8)}`
          };
        });

        return processedData;
      } catch (error) {
        console.error("Error fetching purchase orders:", error);
        toast.error("Erreur lors du chargement des bons de commande");
        return [];
      }
    },
    retry: 2,
    refetchOnWindowFocus: false
  });
}
