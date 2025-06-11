
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function usePOSLocations() {
  const [selectedPDV, setSelectedPDV] = useState<string>("");

  // Get POS locations
  const { data: posLocations = [], isLoading: posLocationsLoading } = useQuery({
    queryKey: ['pos-locations'],
    queryFn: async () => {
      console.log('Fetching POS locations...');
      const { data, error } = await supabase
        .from('pos_locations')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Error fetching POS locations:', error);
        throw error;
      }
      
      console.log('POS locations fetched:', data);
      return data || [];
    }
  });

  // Get active cash register
  const { data: activeRegister, isLoading: registerLoading } = useQuery({
    queryKey: ['activeRegister'],
    queryFn: async () => {
      console.log('Fetching active cash register...');
      const { data, error } = await supabase
        .from('cash_registers')
        .select('*')
        .eq('status', 'active')
        .limit(1);
      
      if (error) {
        console.error('Error fetching cash register:', error);
        throw error;
      }
      
      console.log('Active register fetched:', data);
      return data?.[0] || null;
    }
  });

  // Set default POS location when locations are loaded
  if (posLocations.length > 0 && !selectedPDV) {
    setSelectedPDV(posLocations[0].id);
  }

  return {
    posLocations,
    selectedPDV,
    setSelectedPDV,
    activeRegister,
    isLoading: posLocationsLoading || registerLoading
  };
}
