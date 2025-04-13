
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { POSLocation } from "@/types/pos-locations";

export function usePOSLocationsQuery() {
  // Fetch all POS locations
  const { data: locations = [], isLoading, isError } = useQuery({
    queryKey: ["pos-locations"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("pos_locations")
          .select("*")
          .order("created_at", { ascending: false });
        
        if (error) {
          console.error("Error fetching POS locations:", error);
          throw error;
        }
        return data as POSLocation[];
      } catch (error) {
        console.error("Failed to fetch POS locations:", error);
        throw error;
      }
    }
  });

  return {
    locations,
    isLoading,
    isError
  };
}
