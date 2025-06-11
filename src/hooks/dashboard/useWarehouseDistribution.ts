
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { safeWarehouse, safePOSLocation } from "@/utils/supabase-safe-query";

export const useWarehouseDistribution = () => {
  return useQuery({
    queryKey: ['warehouse-distribution'],
    queryFn: async () => {
      // Récupérer la somme des quantités par entrepôt avec des colonnes explicites
      const { data: warehouseData, error: warehouseError } = await supabase
        .from('warehouse_stock')
        .select(`
          warehouse_id,
          warehouse:warehouse_id!warehouse_stock_warehouse_id_fkey (
            id,
            name
          ),
          pos_location_id,
          pos_location:pos_location_id!warehouse_stock_pos_location_id_fkey (
            id,
            name
          ),
          quantity
        `)
        .not('quantity', 'eq', 0);

      if (warehouseError) {
        console.error('Error fetching warehouse distribution:', warehouseError);
        throw warehouseError;
      }

      // Regrouper par entrepôt et calculer le total
      const distribution = warehouseData.reduce((acc, item) => {
        // Si c'est un entrepôt
        if (item.warehouse_id) {
          const warehouse = safeWarehouse(item.warehouse);
          const warehouseName = warehouse.name || 'Entrepôt inconnu';
          if (!acc[warehouseName]) {
            acc[warehouseName] = 0;
          }
          acc[warehouseName] += item.quantity;
        } 
        // Si c'est un point de vente
        else if (item.pos_location_id) {
          const posLocation = safePOSLocation(item.pos_location);
          const posName = posLocation.name || 'PDV inconnu';
          if (!acc[posName]) {
            acc[posName] = 0;
          }
          acc[posName] += item.quantity;
        }
        return acc;
      }, {} as Record<string, number>);

      // Convertir en format pour le graphique
      return Object.entries(distribution).map(([name, value]) => ({
        name,
        value
      }));
    }
  });
};
