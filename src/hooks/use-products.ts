
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
        .select('*');  // Sélectionner tous les champs au lieu de spécifier manuellement

      if (catalogError) {
        console.error('Erreur catalogue:', catalogError);
        throw catalogError;
      }

      if (!catalogData) {
        console.log('No catalog data returned');
        return [];
      }

      console.log('Catalog data loaded successfully:', catalogData.length, 'products');
      console.log('Products data details:', catalogData);
      
      // Log individual product details to debug field mapping
      catalogData.forEach((product, index) => {
        console.log(`Product ${index}:`, {
          id: product.id,
          name: product.name,
          reference: product.reference,
          price: product.price,
          purchase_price: product.purchase_price,
          stock: product.stock,
          category: product.category,
          description: product.description
        });
      });
      
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
