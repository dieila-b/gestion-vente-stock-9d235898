
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useIncomeCategories() {
  const queryClient = useQueryClient();

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['income-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('expense_categories')
        .select('*')
        .eq('type', 'income')
        .order('name');
      
      if (error) throw error;
      return data;
    }
  });

  const createCategory = useMutation({
    mutationFn: async (categoryData: { name: string }) => {
      const { data, error } = await supabase
        .from('expense_categories')
        .insert({
          name: categoryData.name,
          type: 'income'
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Catégorie créée avec succès");
      queryClient.invalidateQueries({ queryKey: ['income-categories'] });
    },
    onError: (error: any) => {
      toast.error(`Erreur: ${error.message}`);
    }
  });

  const deleteCategory = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('expense_categories')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      toast.success("Catégorie supprimée avec succès");
      queryClient.invalidateQueries({ queryKey: ['income-categories'] });
    },
    onError: (error: any) => {
      toast.error(`Erreur: ${error.message}`);
    }
  });

  return {
    categories,
    isLoading,
    createCategory,
    deleteCategory
  };
}
