
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProductUnit } from "@/types/catalog";
import { toast } from "sonner";

export const useProductUnits = () => {
  const { data: units = [], isLoading } = useQuery({
    queryKey: ['product-units'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_units')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching product units:', error);
        toast.error("Erreur lors du chargement des unités");
        throw error;
      }

      return data as ProductUnit[];
    }
  });

  return { units, isLoading };
};
