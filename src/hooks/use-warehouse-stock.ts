
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./use-toast";

export function useWarehouseStock(locationId?: string, isPOS: boolean = true) {
  const { toast } = useToast();

  return useQuery({
    queryKey: ['warehouse-stock', locationId, isPOS],
    queryFn: async () => {
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
          product:catalog(
            id,
            name,
            price,
            category,
            reference
          ),
          warehouse:warehouses!warehouse_stock_warehouse_id_fkey(id, name),
          pos_location:pos_locations(id, name)
        `);

      // Construction de la requête en fonction du type (PDV ou entrepôt)
      if (isPOS) {
        console.log("Mode PDV :", locationId || "tous les PDV");
        query = locationId && locationId !== "_all" 
          ? query.eq('pos_location_id', locationId)
          : query.not('pos_location_id', 'is', null);
      } else {
        console.log("Mode entrepôt :", locationId || "tous les entrepôts");
        query = locationId && locationId !== "_all"
          ? query.eq('warehouse_id', locationId)
          : query.not('warehouse_id', 'is', null);
      }

      console.log("Executing warehouse stock query...");
      const { data, error } = await query;

      if (error) {
        console.error("Error fetching warehouse stock:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les données de stock",
          variant: "destructive",
        });
        throw error;
      }

      if (!data) {
        console.log("No warehouse stock data returned");
        return [];
      }

      console.log(`Found ${data.length} warehouse stock records:`, data);
      return data;
    },
    refetchOnWindowFocus: true,
    staleTime: 1000 * 30, // 30 seconds
    refetchInterval: 1000 * 60 * 5 // 5 minutes
  });
}
