
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useCategoryDistribution = () => {
  return useQuery({
    queryKey: ['category-distribution'],
    queryFn: async () => {
      // Récupérer la somme des quantités par catégorie
      const { data: catalogData, error: catalogError } = await supabase
        .from('catalog')
        .select(`
          category,
          stock
        `)
        .not('stock', 'eq', 0);

      if (catalogError) {
        console.error('Error fetching category distribution:', catalogError);
        throw catalogError;
      }

      // Regrouper par catégorie et calculer le total
      const distribution = catalogData.reduce((acc, item) => {
        const category = item.category || 'Non catégorisé';
        if (!acc[category]) {
          acc[category] = 0;
        }
        acc[category] += item.stock;
        return acc;
      }, {} as Record<string, number>);

      // Convertir en format pour le graphique
      return Object.entries(distribution).map(([name, value]) => ({
        name,
        value
      }));
    }
  });
};
