
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function usePOSLocations() {
  const [selectedPDV, setSelectedPDV] = useState<string>("_all");

  // Get POS locations
  const { data: posLocations = [] } = useQuery({
    queryKey: ['pos-locations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pos_locations')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data;
    }
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
    activeRegister
  };
}
