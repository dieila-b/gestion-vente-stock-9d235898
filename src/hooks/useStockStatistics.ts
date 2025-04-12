// Make changes only to fix the specific errors
import { useQuery } from "@tanstack/react-query";
import { db } from "@/utils/db-adapter";
import { safeWarehouse } from "@/utils/supabase-safe-query";

export function useStockStatistics() {
  const { data: warehouseStockData, isLoading: isLoadingWarehouseStock } = useQuery({
    queryKey: ['warehouse-stock-statistics'],
    queryFn: async () => {
      try {
        const data = await db.query(
          'warehouse_stock',
          query => query
            .select(`
              warehouse_id,
              warehouse:warehouse_id(name),
              quantity
            `)
        );
        
        return data;
      } catch (error) {
        console.error("Error fetching warehouse stock statistics:", error);
        return [];
      }
    }
  });
  
  const transformWarehouseData = (data: any[]) => {
    return data.map(item => {
      const warehouse = safeWarehouse(item.warehouse);
      
      return {
        id: item.warehouse_id,
        name: warehouse.name || "Unknown Warehouse",
        quantity: item.quantity
      };
    });
  };
  
  const warehouseStock = transformWarehouseData(warehouseStockData || []);

  return {
    warehouseStock,
    isLoadingWarehouseStock
  };
}
