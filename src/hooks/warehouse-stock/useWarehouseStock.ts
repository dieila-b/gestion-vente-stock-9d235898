
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "../use-toast";
import { 
  ensureTestProduct, 
  ensureTestWarehouse, 
  createTestStockEntry 
} from "./test-data-utils";

/**
 * Hook to fetch warehouse stock data
 * @param locationId - ID of the warehouse or POS location
 * @param isPOS - Whether to fetch POS stock (true) or warehouse stock (false)
 */
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
            // Pour obtenir tous les enregistrements d'entrepôt, même si locationId est "_all"
            query = query.not('warehouse_id', 'is', null);
          }
        }

        console.log("Executing warehouse stock query...");
        const { data, error } = await query;

        if (error) {
          throw error;
        }

        // Debug - vérifions les données retournées
        console.log(`Found ${data?.length || 0} warehouse stock records`);
        if (data && data.length > 0) {
          console.log("Sample stock record:", data[0]);
        } else {
          console.log("No stock records found. Let's try inserting test data for demonstration");
          
          // On va ajouter quelques entrées de test si aucun enregistrement n'existe
          const testProduct = await ensureTestProduct();
          const testWarehouse = await ensureTestWarehouse();
          
          if (testProduct && testWarehouse) {
            await createTestStockEntry(testProduct.id, testWarehouse.id);
            
            // Réexécuter la requête pour obtenir les données fraîchement créées
            const { data: refreshedData } = await query;
            console.log("After creating test data:", refreshedData);
            return refreshedData || [];
          }
        }
        
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
