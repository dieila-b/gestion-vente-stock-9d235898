
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PurchaseOrder } from "@/types/purchase-order";

export function usePurchaseOrdersQuery() {
  return useQuery({
    queryKey: ['purchase-orders'],
    queryFn: async (): Promise<PurchaseOrder[]> => {
      console.log("Fetching purchase orders with items...");
      
      try {
        // Premier appel pour récupérer les bons de commande avec fournisseurs
        const { data: orders, error } = await supabase
          .from('purchase_orders')
          .select(`
            *,
            supplier:supplier_id(*),
            warehouse:warehouse_id(*)
          `)
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error("Erreur lors de la récupération des bons de commande:", error);
          throw error;
        }
        
        console.log("Bons de commande récupérés:", orders?.length || 0);
        
        if (!orders || orders.length === 0) {
          return [];
        }
        
        // Récupération des articles pour chaque bon de commande
        const ordersWithItems = await Promise.all(
          orders.map(async (order) => {
            const { data: items, error: itemsError } = await supabase
              .from('purchase_order_items')
              .select(`
                *,
                product:product_id(*)
              `)
              .eq('purchase_order_id', order.id);
            
            if (itemsError) {
              console.error(`Erreur lors de la récupération des articles pour la commande ${order.id}:`, itemsError);
              return { 
                ...order, 
                items: [],
                status: (order.status as "draft" | "pending" | "delivered" | "approved"),
                payment_status: (order.payment_status as "pending" | "partial" | "paid")
              };
            }
            
            console.log(`Commande ${order.order_number}: ${items?.length || 0} articles trouvés`);
            
            // Cast explicite pour assurer la compatibilité avec l'interface PurchaseOrder
            const typedOrder: PurchaseOrder = {
              ...order,
              items: items || [],
              status: (order.status as "draft" | "pending" | "delivered" | "approved"),
              payment_status: (order.payment_status as "pending" | "partial" | "paid")
            };
            
            return typedOrder;
          })
        );
        
        // Vérifie si les données sont bien récupérées
        console.log("Bons de commande avec articles:", ordersWithItems?.length || 0);
        
        return ordersWithItems as PurchaseOrder[];
      } catch (error) {
        console.error("Erreur globale dans usePurchaseOrdersQuery:", error);
        return [];
      }
    }
  });
}
