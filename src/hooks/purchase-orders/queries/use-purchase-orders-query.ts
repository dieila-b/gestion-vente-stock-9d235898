
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PurchaseOrder, Supplier } from "@/types/purchase-order";
import { toast } from "sonner";
import { isSelectQueryError } from "@/utils/type-utils";
import { db } from "@/utils/db-core";

export function usePurchaseOrdersQuery() {
  return useQuery({
    queryKey: ['purchase-orders'],
    queryFn: async () => {
      try {
        console.log("Fetching purchase orders...");
        
        // Try using our db utility first
        try {
          const data = await db.query(
            'purchase_orders',
            (qb) => qb
              .select(`
                *,
                supplier:supplier_id(id, name, email, phone)
              `)
              .order('created_at', { ascending: false })
          );
          
          console.log("Purchase orders fetched via db utility:", data);
          
          if (data && data.length > 0) {
            // Process the data
            const processedData = processOrdersData(data);
            return processedData;
          }
        } catch (dbError) {
          console.error("Error using db utility, falling back to direct Supabase query:", dbError);
        }
        
        // Fallback to direct Supabase query
        const { data, error } = await supabase
          .from('purchase_orders')
          .select(`
            *,
            supplier:supplier_id(id, name, email, phone)
          `)
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error("Error fetching purchase orders with Supabase:", error);
          throw error;
        }
        
        console.log("Raw purchase order data from Supabase:", data);
        
        if (!data || data.length === 0) {
          console.log("No purchase orders found in database");
          return [];
        }
        
        const processedData = processOrdersData(data);
        console.log("Processed purchase orders:", processedData);
        
        return processedData;
      } catch (error) {
        console.error("Error fetching purchase orders:", error);
        toast.error("Erreur lors du chargement des bons de commande");
        return [];
      }
    },
    retry: 2,
    refetchOnWindowFocus: true,
    staleTime: 30000 // Refresh more frequently
  });
}

function processOrdersData(data: any[]): PurchaseOrder[] {
  return data.map(order => {
    // Create a default supplier object for type safety
    let supplierData: Partial<Supplier> = {};
    
    // Check if supplier exists and is not a query error
    if (order.supplier && !isSelectQueryError(order.supplier)) {
      supplierData = order.supplier;
    } else {
      console.log("Supplier data missing or invalid for order:", order.id);
    }
    
    // Construct a valid supplier object with safe fallbacks
    const formattedSupplier: Supplier = {
      id: (supplierData.id || order.supplier_id || '').toString(),
      name: supplierData.name || 'Fournisseur inconnu',
      phone: supplierData.phone || '',
      email: supplierData.email || ''
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
    
    // Create a properly typed PurchaseOrder object with all required fields
    const purchaseOrder: PurchaseOrder = {
      id: order.id,
      order_number: order.order_number || `PO-${order.id.slice(0, 8)}`,
      created_at: order.created_at,
      updated_at: order.updated_at,
      status: safeStatus(order.status),
      supplier_id: order.supplier_id,
      discount: order.discount || 0,
      expected_delivery_date: order.expected_delivery_date || new Date().toISOString(),
      notes: order.notes || '',
      logistics_cost: order.logistics_cost || 0,
      transit_cost: order.transit_cost || 0,
      tax_rate: order.tax_rate || 0,
      shipping_cost: order.shipping_cost || 0,
      subtotal: order.subtotal || 0,
      tax_amount: order.tax_amount || 0,
      total_ttc: order.total_ttc || 0,
      total_amount: order.total_amount || 0,
      paid_amount: order.paid_amount || 0,
      payment_status: safePaymentStatus(order.payment_status),
      warehouse_id: order.warehouse_id,
      supplier: formattedSupplier,
      items: [] // Will be populated separately if needed
    };
    
    return purchaseOrder;
  });
}
