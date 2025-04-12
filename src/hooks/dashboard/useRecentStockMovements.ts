
import { useQuery } from "@tanstack/react-query";
import { db } from "@/utils/db-adapter";
import { safeProduct, safeWarehouse } from "@/utils/supabase-safe-query";

export interface StockMovement {
  id: string;
  type: string;
  quantity: number;
  reason?: string;
  created_at: string;
  product?: {
    id: string;
    name: string;
    reference?: string;
  };
  warehouse?: {
    id: string;
    name: string;
  };
}

export function useRecentStockMovements() {
  const { data: movements = [], isLoading, error } = useQuery({
    queryKey: ['recent-stock-movements'],
    queryFn: async () => {
      try {
        // Get the latest stock movements
        const result = await db.query(
          'warehouse_stock_movements',
          query => query
            .select(`
              *,
              product:product_id(*),
              warehouse:warehouse_id(*)
            `)
            .order('created_at', { ascending: false })
            .limit(20)
        );

        // Transform each movement with safe accessors
        return (Array.isArray(result) ? result : []).map(movement => {
          // Use safe accessors to handle potential errors
          const product = safeProduct(movement.product);
          const warehouse = safeWarehouse(movement.warehouse);
          
          // Transform the product_id and warehouse_id relationships
          return {
            id: movement.id || '',
            type: movement.type || 'unknown',
            quantity: movement.quantity || 0,
            reason: movement.reason || '',
            created_at: movement.created_at || new Date().toISOString(),
            product: {
              id: product.id || '',
              name: product.name || 'Unknown Product',
              reference: product.reference || ''
            },
            warehouse: {
              id: warehouse.id || '',
              name: warehouse.name || 'Unknown Warehouse'
            }
          } as StockMovement;
        });
      } catch (error) {
        console.error("Error fetching recent stock movements:", error);
        return [] as StockMovement[];
      }
    }
  });

  return {
    movements,
    isLoading,
    error
  };
}
