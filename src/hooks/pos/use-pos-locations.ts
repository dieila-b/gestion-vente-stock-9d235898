import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { createTableQuery } from "@/hooks/use-supabase-table-extension";

export function usePOSLocations() {
  const [selectedPDV, setSelectedPDV] = useState<string>("_all");

  // Get POS locations with real-time occupation data
  const { data: posLocations = [], refetch: refetchPOSLocations } = useQuery({
    queryKey: ['pos-locations'],
    queryFn: async () => {
      // Use createTableQuery instead of direct access
      const { data, error } = await createTableQuery('pos_locations')
        .select('*')
        .order('name');
      
      if (error) throw error;
      
      console.log("Fetched POS locations in hook:", data);
      return data;
    },
    // Refresh frequently to keep occupation rates current
    refetchInterval: 5000, // refresh every 5 seconds
    staleTime: 2000 // consider data stale after 2 seconds
  });

  // Get active cash register
  const { data: activeRegister } = useQuery({
    queryKey: ['activeRegister'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cash_registers')
        .select('*')
        .eq('status', 'active')
        .limit(1)
        .single();
      
      if (error) throw error;
      return data;
    }
  });

  return {
    posLocations,
    selectedPDV,
    setSelectedPDV,
    activeRegister,
    refetchPOSLocations
  };
}
