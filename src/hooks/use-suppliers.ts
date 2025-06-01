
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Supplier } from "@/types/supplier";

export function useSuppliers() {
  const { data: suppliers = [], isLoading, error } = useQuery({
    queryKey: ['suppliers'],
    queryFn: async () => {
      try {
        console.log('Fetching suppliers from database...');
        
        const { data, error } = await supabase
          .from('suppliers')
          .select('*')
          .order('name');

        if (error) {
          console.error('Error fetching suppliers:', error);
          throw error;
        }

        console.log('Suppliers loaded successfully:', data?.length || 0, 'suppliers');
        return (data || []) as Supplier[];
      } catch (error) {
        console.error("Error in suppliers query:", error);
        // Retourner un tableau vide au lieu de throw pour éviter de casser l'interface
        return [];
      }
    },
    enabled: true,
    retry: 3,
    retryDelay: 1000,
  });

  // Log des erreurs pour déboguer
  if (error) {
    console.error("Suppliers query error:", error);
  }

  return { suppliers, isLoading, error };
}
