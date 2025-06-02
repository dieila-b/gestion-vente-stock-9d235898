
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CatalogProduct } from "@/types/catalog";
import { toast } from "sonner";
import { useCatalogAuth } from "@/hooks/use-catalog-auth";

export function useProducts(locationId?: string) {
  const { isAuthenticated } = useCatalogAuth();

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['catalog-products'],
    queryFn: async () => {
      try {
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
          toast.error("Erreur lors du chargement des produits");
          throw catalogError;
        }

        if (!catalogData) return [];

        console.log('Catalog data from Supabase:', catalogData); // Log pour déboguer
        return catalogData as CatalogProduct[];
      } catch (error) {
        console.error("Error fetching products:", error);
        throw error;
      }
    },
    // Ne pas dépendre de isAuthenticated pour exécuter la requête
    enabled: true,
  });

  return { products, isLoading };
}
