
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
        
        // Requête plus simple pour éviter les erreurs potentielles
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
        
        const processedData = data.map(order => {
          let supplierData = order.supplier || {};
          
          // Vérifier si supplier est une erreur de requête et fournir un objet par défaut
          if (isSelectQueryError(supplierData)) {
            console.log("Supplier query error for order:", order.id);
            supplierData = {};
          }
          
          // Construire un objet fournisseur valide
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
          
          // S'assurer que l'objet renvoyé est conforme au type PurchaseOrder
          return {
            ...order,
            supplier: formattedSupplier,
            deleted: order.deleted || false,
            items: [], // Sera rempli séparément si nécessaire
            payment_status: safePaymentStatus(order.payment_status),
            status: safeStatus(order.status),
            total_amount: order.total_amount || 0,
            order_number: order.order_number || `PO-${order.id.slice(0, 8)}`
          } as PurchaseOrder;
        });

        console.log("Processed purchase orders:", processedData);
        return processedData;
      } catch (error) {
        console.error("Error fetching purchase orders:", error);
        toast.error("Erreur lors du chargement des bons de commande");
        return [];
      }
    },
    retry: 2,
    refetchOnWindowFocus: false,
    staleTime: 60000 // Ajouter un temps d'invalidation pour éviter des requêtes inutiles
  });
}
