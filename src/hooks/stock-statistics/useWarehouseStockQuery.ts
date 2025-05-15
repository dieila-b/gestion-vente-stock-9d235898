
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useWarehouseStockQuery() {
  return useQuery({
    queryKey: ['warehouse-stock-statistics'],
    queryFn: async () => {
      try {
        console.log("Fetching warehouse stock statistics data...");
        const { data, error } = await supabase
          .from('warehouse_stock')
          .select(`
            id,
            warehouse_id,
            warehouse:warehouse_id(id, name),
            product_id,
            product:product_id(id, name, reference, category),
            quantity,
            unit_price,
            total_value
          `);
        
        if (error) {
          console.error("Error fetching warehouse stock statistics:", error);
          throw error;
        }
        
        console.log(`Found ${data?.length || 0} warehouse stock statistics records`);
        return data || [];
      } catch (error) {
        console.error("Error in useWarehouseStockQuery:", error);
        return [];
      }
    },
    staleTime: 1000 * 60, // 1 minute
  });
}
