
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CatalogProduct } from "@/types/catalog";
import { toast } from "sonner";
import { useCatalogAuth } from "@/hooks/use-catalog-auth";

export function useProducts(locationId?: string) {
  const { isAuthenticated } = useCatalogAuth();

  const { data: products = [], isLoading, error } = useQuery({
    queryKey: ['catalog-products'],
    queryFn: async () => {
      try {
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
          // Ne pas afficher de toast d'erreur pour éviter de spammer l'utilisateur
          throw catalogError;
        }

        if (!catalogData) {
          console.log('No catalog data returned');
          return [];
        }

        console.log('Catalog data loaded successfully:', catalogData.length, 'products');
        return catalogData as CatalogProduct[];
      } catch (error) {
        console.error("Error fetching products:", error);
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
    console.error("Products query error:", error);
  }

  return { products, isLoading, error };
}
