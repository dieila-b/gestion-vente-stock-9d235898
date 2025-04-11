
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { POSLocation, POSLocationPartial } from "@/types/pos-location";
import { useExtendedTables } from "@/hooks/use-supabase-table-extension";
import { safeMap } from "@/utils/supabase-helpers";

export function usePOSLocations() {
  const [locations, setLocations] = useState<POSLocationPartial[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { posLocations } = useExtendedTables();

  useQuery({
    queryKey: ['pos-locations'],
    queryFn: async () => {
      setIsLoading(true);
      try {
        const { data, error } = await posLocations
          .select('id, name, phone, address, manager, status')
          .order('name');
          
        if (error) throw error;
        
        // Create a simplified list of locations with just id and name
        const locationsList = safeMap(data, (location: any) => ({
          id: location.id,
          name: location.name || 'Unnamed location'
        }));
        
        setLocations(locationsList);
        return locationsList;
      } catch (error) {
        console.error('Error fetching POS locations:', error);
        return [];
      } finally {
        setIsLoading(false);
      }
    }
  });

  return {
    locations,
    isLoading
  };
}
