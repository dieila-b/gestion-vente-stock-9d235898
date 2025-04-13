
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Warehouse } from "@/types/warehouse";

export function useWarehousesQuery() {
  // Fetch all warehouses
  const { data: warehouses = [], isLoading, isError } = useQuery({
    queryKey: ["warehouses"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("warehouses")
          .select("*")
          .order("created_at", { ascending: false });
        
        if (error) {
          console.error("Error fetching warehouses:", error);
          throw error;
        }
        return data as Warehouse[];
      } catch (error) {
        console.error("Failed to fetch warehouses:", error);
        throw error;
      }
    }
  });

  return {
    warehouses,
    isLoading,
    isError
  };
}
