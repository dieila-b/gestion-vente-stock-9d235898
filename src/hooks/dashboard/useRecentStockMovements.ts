
import { useQuery } from "@tanstack/react-query";
import { db } from "@/utils/db-adapter";
import { safeProduct, safeWarehouse } from "@/utils/supabase-safe-query";

export interface StockMovement {
  id: string;
  type: "in" | "out";
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
  pos_location?: {
    id: string;
    name: string;
  };
}

export function useRecentStockMovements() {
  return useQuery({
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
              warehouse:warehouse_id(*),
              pos_location:pos_location_id(*)
            `)
            .order('created_at', { ascending: false })
            .limit(20)
        );

        // Transform each movement with safe accessors
        return (Array.isArray(result) ? result : []).map(movement => {
          // Use safe accessors to handle potential errors
          const product = safeProduct(movement.product);
          const warehouse = safeWarehouse(movement.warehouse);
          const pos_location = movement.pos_location || null;
          
          // Transform the product_id and warehouse_id relationships
          return {
            id: movement.id || '',
            type: (movement.type || 'unknown') as "in" | "out",
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
            },
            pos_location: pos_location ? {
              id: pos_location.id || '',
              name: pos_location.name || 'Unknown Location'
            } : undefined
          } as StockMovement;
        });
      } catch (error) {
        console.error("Error fetching recent stock movements:", error);
        return [] as StockMovement[];
      }
    }
  });
}
