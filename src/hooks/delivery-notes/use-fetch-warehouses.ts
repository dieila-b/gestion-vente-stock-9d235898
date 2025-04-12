
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useFetchWarehouses() {
  const fetchWarehouses = async () => {
    const { data, error } = await supabase
      .from("warehouses")
      .select("*")
      .order("name");

    if (error) throw error;
    return data;
  };

  return useQuery({
    queryKey: ["warehouses"],
    queryFn: fetchWarehouses,
  });
}
