
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { POSLocation } from "@/types/pos-location";

interface POSLocationPartial {
  id: string;
  name: string;
}

export function usePOSLocations() {
  const [locations, setLocations] = useState<POSLocationPartial[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useQuery({
    queryKey: ['pos-locations'],
    queryFn: async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('pos_locations')
          .select('id, name, phone, address')
          .order('name');
          
        if (error) throw error;
        
        // Create a simplified list of locations with just id and name
        const locationsList = (data || []).map((location: any) => ({
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
