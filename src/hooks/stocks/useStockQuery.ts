
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { StockMovement } from "./useStockMovementTypes";
import { isSelectQueryError } from "@/utils/type-utils";
import { safePOSLocation } from "@/utils/data-safe/entities/pos-location";

export function useStockQuery(type: 'in' | 'out') {
  const { data: movements = [], isLoading } = useQuery({
    queryKey: ['stock-movements', type],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('warehouse_stock_movements')
          .select(`
            id,
            quantity,
            unit_price,
            total_value,
            reason,
            type,
            created_at,
            product:product_id (
              id,
              name,
              reference
            ),
            warehouse:warehouse_id (
              id,
              name
            ),
            pos_location:pos_location_id (
              id,
              name
            )
          `)
          .eq('type', type)
          .order('created_at', { ascending: false });

        if (error) {
          console.error(`Erreur lors du chargement des mouvements de type ${type}:`, error);
          throw error;
        }

        // Process the data to ensure it matches our type expectations
        return (data || []).map(item => {
          // Handle possible SelectQueryError in pos_location
          let processedItem = {
            ...item,
            // Ensure type is strictly "in" or "out"
            type: item.type === 'in' ? 'in' : 'out' as const,
            // Handle pos_location which might be a SelectQueryError
            pos_location: item.pos_location ? 
              (isSelectQueryError(item.pos_location) ? 
                safePOSLocation(item.pos_location) : 
                item.pos_location) : 
              null
          };

          return processedItem as StockMovement;
        });
      } catch (error) {
        console.error(`Exception non gérée lors du chargement des mouvements de type ${type}:`, error);
        return [] as StockMovement[];
      }
    }
  });

  const { data: warehouses = [] } = useQuery({
    queryKey: ['warehouses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('warehouses')
        .select('*')
        .eq('status', 'Actif');

      if (error) throw error;
      return data;
    }
  });

  const { data: products = [] } = useQuery({
    queryKey: ['catalog-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('catalog')
        .select('id, name, reference')
        .order('name');

      if (error) throw error;
      return data;
    }
  });

  return {
    movements,
    isLoading,
    warehouses,
    products
  };
}
