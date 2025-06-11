
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { StockMovement } from "./useStockMovementTypes";
import { isSelectQueryError } from "@/utils/type-utils";
import { safePOSLocation, safeProduct, safeWarehouse } from "@/utils/supabase-safe-query";

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
            product_id!inner (
              id,
              name,
              reference
            ),
            warehouse_id!left (
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
          const processedItem = {
            ...item,
            type: item.type === 'in' ? 'in' : 'out' as const,
            product: safeProduct(item.product_id),
            warehouse: safeWarehouse(item.warehouse_id),
            pos_location: null // Not available in this query
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
