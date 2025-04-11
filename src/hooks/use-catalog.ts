
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types/pos';

export function useCatalog() {
  const { data: products = [], isLoading, error } = useQuery({
    queryKey: ['catalog'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('catalog')
        .select('*')
        .order('name');
        
      if (error) throw error;
      return data as Product[];
    }
  });

  return {
    products,
    isLoading,
    error
  };
}
