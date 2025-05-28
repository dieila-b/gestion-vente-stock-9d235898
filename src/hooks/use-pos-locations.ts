
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useFetchPOSLocations() {
  return useQuery({
    queryKey: ['pos-locations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pos_locations')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;
      return data;
    }
  });
}

// Fonction pour compatibilité avec l'ancien nom
export function usePOSLocations() {
  return useFetchPOSLocations();
}
