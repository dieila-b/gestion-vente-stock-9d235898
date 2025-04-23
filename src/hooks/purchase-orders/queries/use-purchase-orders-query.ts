
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PurchaseOrder } from "@/types/purchase-order";
import { toast } from "sonner";

export function usePurchaseOrdersQuery() {
  return useQuery({
    queryKey: ['purchase-orders'],
    queryFn: async () => {
      try {
        console.log("Fetching purchase orders from database");
        
        // Appel de la fonction RPC pour obtenir les données des bons de commande
        const { data: ordersData, error: ordersError } = await supabase
          .rpc('bypass_select_purchase_orders');
          
        if (ordersError) {
          console.error("Error fetching purchase orders:", ordersError);
          toast.error("Erreur lors du chargement des bons de commande");
          throw ordersError;
        }
        
        if (!ordersData || ordersData.length === 0) {
          console.log("No purchase orders found");
          return [];
        }
        
        console.log(`Found ${ordersData.length} purchase orders`);
        
        // Convertir les données JSON en objets PurchaseOrder
        const formattedOrders = ordersData.map((orderData: any) => {
          // Récupérer les éléments du bon de commande
          return supabase
            .rpc('get_purchase_order_items', { order_id: orderData.id })
            .then(({ data: itemsData, error: itemsError }) => {
              if (itemsError) {
                console.error(`Error fetching items for order ${orderData.id}:`, itemsError);
                return {
                  ...orderData,
                  items: []
                };
              }
              
              return {
                ...orderData,
                items: itemsData || []
              };
            });
        });
        
        // Attendre que toutes les promesses soient résolues
        const ordersWithItems = await Promise.all(formattedOrders);
        
        console.log("Successfully processed purchase orders with items:", ordersWithItems.length);
        
        // Assurer que le résultat est un tableau valide de PurchaseOrder
        return ordersWithItems as PurchaseOrder[];
      } catch (error) {
        console.error("Error in usePurchaseOrdersQuery:", error);
        toast.error("Impossible de charger les bons de commande");
        throw error; // Let the query handle the error state properly
      }
    },
    staleTime: 1000 * 60, // 1 minute
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
}
