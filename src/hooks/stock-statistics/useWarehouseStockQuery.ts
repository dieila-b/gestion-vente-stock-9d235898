
import { useQuery } from "@tanstack/react-query";
import { db } from "@/utils/db-adapter";

export function useWarehouseStockQuery() {
  return useQuery({
    queryKey: ['warehouse-stock-statistics'],
    queryFn: async () => {
      try {
        const data = await db.query(
          'warehouse_stock',
          query => query
            .select(`
              warehouse_id,
              warehouse:warehouse_id(name),
              id,
              quantity,
              unit_price,
              total_value,
              product:product_id(id, name, reference, category)
            `)
        );
        
        return data || []; // Ensure we always return an array
      } catch (error) {
        console.error("Error fetching warehouse stock statistics:", error);
        return [];
      }
    }
  });
}
