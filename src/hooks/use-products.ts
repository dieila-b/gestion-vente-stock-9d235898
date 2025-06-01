
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CatalogProduct } from "@/types/catalog";

export function useProducts(locationId?: string) {
  const { data: products = [], isLoading, error } = useQuery({
    queryKey: ['catalog-products'],
    queryFn: async () => {
      console.log('Fetching products from catalog table...');
      
      const { data: catalogData, error: catalogError } = await supabase
        .from('catalog')
        .select(`
          id,
          name,
          description,
          price,
          purchase_price,
          category,
          stock,
          reference,
          image_url,
          created_at
        `);

      if (catalogError) {
        console.error('Erreur catalogue:', catalogError);
        throw catalogError;
      }

      if (!catalogData) {
        console.log('No catalog data returned');
        return [];
      }

      console.log('Catalog data loaded successfully:', catalogData.length, 'products');
      console.log('Products data:', catalogData);
      return catalogData as CatalogProduct[];
    },
    enabled: true,
    retry: 3,
    retryDelay: 1000,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  console.log('useProducts hook - products:', products?.length || 0);
  console.log('useProducts hook - isLoading:', isLoading);
  console.log('useProducts hook - error:', error);

  return { products, isLoading, error };
}
