
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { db } from "@/utils/db-core";

interface CatalogItem {
  category: string;
  [key: string]: any;
}

export function useCategoriesData() {
  const { data: categories = [], refetch, isLoading } = useQuery({
    queryKey: ['product-categories'],
    queryFn: async () => {
      try {
        const data = await db.query<CatalogItem>('catalog', 
          query => query
            .select('category')
            .not('category', 'is', null)
            .order('category')
        );

        if (!data || !Array.isArray(data)) {
          console.error('Error fetching categories: Invalid data format');
          toast.error("Erreur lors du chargement des catégories");
          return [];
        }

        // Extraire les catégories uniques
        const uniqueCategories = Array.from(new Set(data.map(item => item.category))).filter(Boolean);
        return uniqueCategories;
      } catch (error) {
        console.error('Error fetching categories:', error);
        toast.error("Erreur lors du chargement des catégories");
        return [];
      }
    }
  });

  return {
    categories,
    refetch,
    isLoading
  };
}
