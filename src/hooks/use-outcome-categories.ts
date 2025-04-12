
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Define Category type inline to avoid import issues
interface Category {
  id: string;
  name: string;
  type: 'expense' | 'income';
  created_at?: string;
}

export function useOutcomeCategories() {
  const queryClient = useQueryClient();

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['outcome-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('expense_categories')
        .select('*')
        .eq('type', 'expense')
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
          type: 'expense' 
        })
        .select()
        .single();

      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: ['outcome-categories'] });
      return data;
    } catch (error) {
      console.error("Error adding outcome category:", error);
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
      
      queryClient.invalidateQueries({ queryKey: ['outcome-categories'] });
      return true;
    } catch (error) {
      console.error("Error deleting outcome category:", error);
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
