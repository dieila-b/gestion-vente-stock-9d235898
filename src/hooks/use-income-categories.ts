import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Category } from "@/types/Category";

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
      return data as Category[];
    }
  });

  const addCategory = async (name: string) => {
    try {
      const { data, error } = await supabase
        .from('expense_categories')
        .insert({ 
          name, 
          type: 'income' 
        })
        .select()
        .single();

      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: ['income-categories'] });
      return data;
    } catch (error) {
      console.error("Error adding income category:", error);
      toast.error("Erreur lors de l'ajout de la catégorie");
      return null;
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      const { error } = await supabase
        .from('expense_categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: ['income-categories'] });
      return true;
    } catch (error) {
      console.error("Error deleting income category:", error);
      toast.error("Erreur lors de la suppression de la catégorie");
      return false;
    }
  };

  return {
    categories,
    isLoading,
    addCategory,
    deleteCategory
  };
}
