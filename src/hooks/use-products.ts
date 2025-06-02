
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CatalogProduct } from "@/types/catalog";

export function useProducts() {
  const { data: products = [], isLoading, error } = useQuery({
    queryKey: ['catalog-products'],
    queryFn: async () => {
      console.log('🔄 Fetching products from catalog...');
      
      const { data: catalogData, error: catalogError } = await supabase
        .from('catalog')
        .select('*')
        .order('name');

      if (catalogError) {
        console.error('❌ Error fetching catalog:', catalogError);
        throw catalogError;
      }

      console.log('✅ Products loaded:', catalogData?.length || 0);
        
      if (!catalogData || catalogData.length === 0) {
        console.log('⚠️ No products found in catalog');
        return [];
      }
        
      const transformedProducts = catalogData.map(item => ({
        id: item.id,
        name: item.name || 'Produit sans nom',
        description: item.description || '',
        price: Number(item.price) || 0,
        purchase_price: Number(item.purchase_price) || 0,
        category: item.category || '',
        stock: Number(item.stock) || 0,
        reference: item.reference || '',
        created_at: item.created_at,
        image_url: item.image_url || undefined
      })) as CatalogProduct[];

      console.log('✅ Products transformed:', transformedProducts.length);
      return transformedProducts;
    },
    enabled: true,
    retry: 2,
    retryDelay: 1000,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

  return { products, isLoading, error };
}
