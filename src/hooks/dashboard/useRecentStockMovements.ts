
import { useQuery } from "@tanstack/react-query";
import { db } from "@/utils/db-adapter";
import { supabase } from "@/integrations/supabase/client";
import { isSelectQueryError } from "@/utils/supabase-safe-query";

export interface StockMovement {
  id: string;
  type: "in" | "out";
  quantity: number;
  reason?: string;
  created_at: string;
  created_by?: string;
  unit_price?: number;
  total_value?: number;
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
}

interface RawStockMovement {
  id: string;
  type: "in" | "out";
  quantity: number;
  reason?: string;
  created_at: string;
  created_by?: string;
  unit_price?: number;
  total_value?: number;
  product?: {
    id: string;
    name: string;
    reference?: string;
  } | null;
  warehouse?: {
    id: string;
    name: string;
  } | null;
  pos_location?: {
    id: string;
    name: string;
  } | null;
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
            unit_price,
            total_value,
            created_at,
            product:product_id(id, name, reference),
            warehouse:warehouse_id(id, name),
            pos_location:pos_location_id(id, name)
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

  // Transform data to match the StockMovement interface, ensuring type safety
  const transformedMovements: StockMovement[] = Array.isArray(data) 
    ? data.map((movement: any): StockMovement => {
        // Handle null, undefined, or malformed record
        if (!movement) {
          return {
            id: "",
            type: "in",
            quantity: 0,
            created_at: "",
            product: null,
            warehouse: null
          };
        }
        
        // Create a properly typed object
        return {
          id: movement.id || "",
          type: (movement.type === "in" || movement.type === "out") ? movement.type : "in",
          quantity: movement.quantity || 0,
          reason: movement.reason,
          created_at: movement.created_at || "",
          unit_price: movement.unit_price,
          total_value: movement.total_value,
          product: movement.product ? {
            id: movement.product.id || "",
            name: movement.product.name || "Unknown Product",
            reference: movement.product.reference
          } : null,
          warehouse: movement.warehouse ? {
            id: movement.warehouse.id || "",
            name: movement.warehouse.name || "Unknown Warehouse"
          } : null,
          pos_location: movement.pos_location ? {
            id: movement.pos_location.id || "",
            name: movement.pos_location.name || "Unknown Location"
          } : undefined
        };
      })
    : [];

  return {
    movements: transformedMovements,
    isLoading,
    error
  };
}
