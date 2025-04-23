
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
        const formattedOrdersPromises = ordersData.map((orderData: any) => {
          // Récupérer les éléments du bon de commande
          // Convert PromiseLike to full Promise to ensure .catch is available
          return Promise.resolve(
            supabase
              .rpc('get_purchase_order_items', { order_id: orderData.id })
          )
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
            })
            .catch(error => {
              // Handle promise rejection
              console.error(`Unexpected error fetching items for order ${orderData.id}:`, error);
              return {
                ...orderData,
                items: []
              };
            });
        });
        
        // Attendre que toutes les promesses soient résolues
        try {
          const ordersWithItems = await Promise.all(formattedOrdersPromises);
          console.log("Successfully processed purchase orders with items:", ordersWithItems.length);
          return ordersWithItems as PurchaseOrder[];
        } catch (error) {
          console.error("Error resolving order items promises:", error);
          // Retourner les commandes sans articles en cas d'erreur
          return ordersData.map((order: any) => ({ ...order, items: [] })) as PurchaseOrder[];
        }
      } catch (error) {
        console.error("Error in usePurchaseOrdersQuery:", error);
        toast.error("Impossible de charger les bons de commande");
        throw error; // Laisser la query gérer l'état d'erreur correctement
      }
    },
    staleTime: 1000 * 30, // 30 secondes
    gcTime: 1000 * 60 * 5, // 5 minutes
  });
}
