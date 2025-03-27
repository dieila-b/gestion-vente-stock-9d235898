
import { ProductUnit } from "@/types/catalog";
import { PostgrestError } from "@supabase/supabase-js";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useProductUnitsMutations = () => {
  const queryClient = useQueryClient();

  const deleteUnitMutation = useMutation({
    mutationFn: async (unit: ProductUnit) => {
      const { error } = await supabase
        .from('product_units')
        .delete()
        .eq('id', unit.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-units'] });
      toast.success("Unité supprimée avec succès");
    },
    onError: (error) => {
      console.error('Error deleting unit:', error);
      toast.error("Erreur lors de la suppression de l'unité");
    }
  });

  return {
    deleteUnitMutation
  };
};
