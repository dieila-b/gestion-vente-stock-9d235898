
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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

        return data || [];
      } catch (error) {
        console.error(`Exception non gérée lors du chargement des mouvements de type ${type}:`, error);
        return [];
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
