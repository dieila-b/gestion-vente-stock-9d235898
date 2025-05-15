
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./use-toast";

export function useWarehouseStock(locationId?: string, isPOS: boolean = true) {
  const { toast } = useToast();

  return useQuery({
    queryKey: ['warehouse-stock', locationId, isPOS],
    queryFn: async () => {
      try {
        console.log("Starting warehouse stock fetch:", { locationId, isPOS });

        let query = supabase
          .from('warehouse_stock')
          .select(`
            id,
            quantity,
            unit_price,
            total_value,
            pos_location_id,
            warehouse_id,
            product:product_id(
              id,
              name,
              price,
              category,
              reference
            ),
            warehouse:warehouse_id(id, name),
            pos_location:pos_location_id(id, name)
          `);

        // Construction de la requête en fonction du type (PDV ou entrepôt)
        if (isPOS) {
          console.log("Mode PDV :", locationId || "tous les PDV");
          if (locationId && locationId !== "_all") {
            query = query.eq('pos_location_id', locationId);
          } else {
            query = query.not('pos_location_id', 'is', null);
          }
        } else {
          console.log("Mode entrepôt :", locationId || "tous les entrepôts");
          if (locationId && locationId !== "_all") {
            query = query.eq('warehouse_id', locationId);
          } else {
            query = query.not('warehouse_id', 'is', null);
          }
        }

        console.log("Executing warehouse stock query...");
        const { data, error } = await query;

        if (error) {
          throw error;
        }

        console.log(`Found ${data?.length || 0} warehouse stock records`);
        return data || [];
      } catch (error) {
        console.error("Error fetching warehouse stock:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les données de stock",
          variant: "destructive",
        });
        return [];
      }
    },
    refetchOnWindowFocus: true,
    staleTime: 1000 * 30, // 30 seconds
    retry: 2,
    refetchInterval: 1000 * 60 * 2 // 2 minutes
  });
}
