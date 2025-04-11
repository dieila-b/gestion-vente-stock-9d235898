
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface CatalogItem {
  id: string;
  name: string;
  price: number;
  category?: string;
  reference?: string;
  stock?: number;
  purchase_price?: number;
  image_url?: string;
  description?: string;
}

export function useCatalog() {
  const { data: catalog = [], isLoading, error, refetch } = useQuery({
    queryKey: ['catalog'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('catalog')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      return data as CatalogItem[];
    }
  });

  return {
    catalog,
    isLoading,
    error,
    refetch
  };
}
