
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Supplier } from "@/types/supplier";

export function useSuppliers() {
  const { data: suppliers = [], isLoading, error } = useQuery({
    queryKey: ['suppliers'],
    queryFn: async () => {
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
      console.log('Suppliers data:', data);
      return (data || []) as Supplier[];
    },
    enabled: true,
    retry: 3,
    retryDelay: 1000,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  console.log('useSuppliers hook - suppliers:', suppliers?.length || 0);
  console.log('useSuppliers hook - isLoading:', isLoading);
  console.log('useSuppliers hook - error:', error);

  return { suppliers, isLoading, error };
}
