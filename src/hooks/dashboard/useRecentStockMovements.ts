
import { useQuery } from "@tanstack/react-query";
import { db } from "@/utils/db-adapter";
import { supabase } from "@/integrations/supabase/client";

export interface StockMovement {
  id: string;
  type: "in" | "out";
  quantity: number;
  reason?: string;
  created_at: string;
  product: {
    id: string;
    name: string;
    reference?: string;
  } | null;
  warehouse: {
    id: string;
    name: string;
  } | null;
  pos_location?: {
    id: string;
    name: string;
  } | null;
  created_by?: string;
}

export function useRecentStockMovements() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['recent-stock-movements'],
    queryFn: async () => {
      try {
        const { data: movements, error } = await supabase
          .from('warehouse_stock_movements')
          .select(`
            id,
            type,
            quantity,
            reason,
            created_at,
            product:product_id(id, name, reference),
            warehouse:warehouse_id(id, name)
          `)
          .order('created_at', { ascending: false })
          .limit(10);

        if (error) throw new Error(error.message);
        
        // Ensure we return an array even if the response is null or undefined
        return movements || [];
      } catch (error) {
        console.error("Error fetching recent stock movements:", error);
        return [];
      }
    }
  });

  // Transform data to match the StockMovement interface
  const transformedMovements: StockMovement[] = Array.isArray(data) 
    ? data.map((movement) => ({
        id: movement.id || "",
        type: (movement.type === "in" || movement.type === "out") ? movement.type : "in",
        quantity: movement.quantity || 0,
        reason: movement.reason,
        created_at: movement.created_at || "",
        product: movement.product ? {
          id: movement.product.id || "",
          name: movement.product.name || "Unknown Product",
          reference: movement.product.reference
        } : null,
        warehouse: movement.warehouse ? {
          id: movement.warehouse.id || "",
          name: movement.warehouse.name || "Unknown Warehouse"
        } : null
      }))
    : [];

  return {
    movements: transformedMovements,
    isLoading,
    error
  };
}
