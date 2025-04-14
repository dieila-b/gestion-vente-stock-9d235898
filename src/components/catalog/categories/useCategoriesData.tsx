
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useCategoriesData() {
  const { data: categories = [], refetch, isLoading } = useQuery({
    queryKey: ['product-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('catalog')
        .select('category')
        .not('category', 'is', null)
        .order('category');

      if (error) {
        toast.error("Erreur lors du chargement des catégories");
        throw error;
      }

      const uniqueCategories = Array.from(new Set(data.map(item => item.category))).filter(Boolean);
      return uniqueCategories;
    }
  });

  return {
    categories,
    refetch,
    isLoading
  };
}
