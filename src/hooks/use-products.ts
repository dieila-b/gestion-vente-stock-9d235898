
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CatalogProduct } from "@/types/catalog";

export function useProducts(locationId?: string) {
  const { data: products = [], isLoading, error } = useQuery({
    queryKey: ['catalog-products', locationId],
    queryFn: async () => {
      console.log('Fetching products from catalog table...');
      
      try {
        // Requête simple pour récupérer tous les produits du catalogue
        let query = supabase
          .from('catalog')
          .select('*')
          .order('name');

        const { data: catalogData, error: catalogError } = await query;

        if (catalogError) {
          console.error('Erreur catalogue:', catalogError);
          throw catalogError;
        }

        console.log('Données brutes du catalogue:', catalogData);
        console.log('Nombre de produits trouvés:', catalogData?.length || 0);
        
        if (!catalogData || catalogData.length === 0) {
          console.log('Aucune donnée retournée du catalogue');
          return [];
        }

        // Vérifier la structure des données
        console.log('Premier produit:', catalogData[0]);
        
        // Transformer les données pour correspondre au type CatalogProduct
        const transformedProducts = catalogData.map(item => ({
          id: item.id,
          name: item.name || 'Produit sans nom',
          description: item.description || '',
          price: item.price || 0,
          purchase_price: item.purchase_price || 0,
          category: item.category || '',
          stock: item.stock || 0,
          reference: item.reference || '',
          created_at: item.created_at,
          image_url: item.image_url || undefined
        })) as CatalogProduct[];

        console.log('Produits transformés:', transformedProducts);
        return transformedProducts;
      } catch (error) {
        console.error('Erreur dans useProducts:', error);
        throw error;
      }
    },
    enabled: true,
    retry: 1,
    retryDelay: 1000,
    staleTime: 1 * 60 * 1000, // 1 minute
  });

  console.log('useProducts hook - État final:');
  console.log('- Nombre de produits:', products?.length || 0);
  console.log('- Chargement:', isLoading);
  console.log('- Erreur:', error?.message);

  return { products, isLoading, error };
}
