
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function usePOSLocations() {
  const [selectedPDV, setSelectedPDV] = useState<string>("_all");

  console.log("usePOSLocations: Hook initialization");

  // Fetch POS locations
  const { data: posLocations = [], isLoading: isLoadingLocations } = useQuery({
    queryKey: ['pos-locations'],
    queryFn: async () => {
      console.log("usePOSLocations: Fetching POS locations");
      
      const { data, error } = await supabase
        .from('pos_locations')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) {
        console.error("usePOSLocations: Error fetching locations:", error);
        // Ne pas throw l'erreur, juste retourner un tableau vide
        return [];
      }
      
      console.log("usePOSLocations: Locations fetched successfully:", data?.length || 0);
      return data || [];
    },
    // Désactiver le retry automatique pour éviter les boucles
    retry: false,
    // Délai d'attente plus court
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch active cash register
  const { data: activeRegister } = useQuery({
    queryKey: ['active-cash-register', selectedPDV],
    queryFn: async () => {
      if (selectedPDV === "_all") return null;
      
      console.log("usePOSLocations: Fetching active register for PDV:", selectedPDV);
      
      const { data, error } = await supabase
        .from('cash_registers')
        .select('*')
        .eq('status', 'active')
        .limit(1)
        .maybeSingle(); // Utiliser maybeSingle au lieu de single
      
      if (error) {
        console.error("usePOSLocations: Error fetching cash register:", error);
        return null;
      }
      
      return data;
    },
    enabled: selectedPDV !== "_all",
    retry: false,
  });

  // Auto-select first location if available and none selected
  useEffect(() => {
    if (posLocations && posLocations.length > 0 && selectedPDV === "_all") {
      setSelectedPDV(posLocations[0].id);
      console.log("usePOSLocations: Auto-selected first location:", posLocations[0].name);
    }
  }, [posLocations, selectedPDV]);

  console.log("usePOSLocations: State summary", {
    posLocationsCount: posLocations?.length || 0,
    selectedPDV,
    hasActiveRegister: !!activeRegister,
    isLoadingLocations
  });

  return {
    posLocations: posLocations || [],
    selectedPDV,
    setSelectedPDV,
    activeRegister,
    isLoading: isLoadingLocations
  };
}
