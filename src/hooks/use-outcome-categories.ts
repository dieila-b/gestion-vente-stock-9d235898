
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useCallback } from "react";
import type { Category } from "@/types/category"; // Fixed casing

export function useOutcomeCategories() {
  // Fetch outcome categories
  const { data: categories = [], isLoading, error, refetch } = useQuery({
    queryKey: ['outcome-categories'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('expense_categories')
          .select('*')
          .eq('type', 'expense');

        if (error) throw error;
        return data as Category[];
      } catch (error: any) {
        console.error('Error fetching outcome categories:', error);
        toast.error(`Failed to load outcome categories: ${error.message}`);
        return [];
      }
    }
  });

  // Add a new outcome category
  const addCategory = useCallback(async (name: string) => {
    try {
      const { error } = await supabase
        .from('expense_categories')
        .insert({ name, type: 'expense' });

      if (error) throw error;
      
      toast.success('Outcome category added successfully');
      refetch();
      return true;
    } catch (error: any) {
      console.error('Error adding outcome category:', error);
      toast.error(`Failed to add outcome category: ${error.message}`);
      return false;
    }
  }, [refetch]);

  // Delete a category
  const deleteCategory = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('expense_categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Outcome category deleted successfully');
      refetch();
      return true;
    } catch (error: any) {
      console.error('Error deleting outcome category:', error);
      toast.error(`Failed to delete outcome category: ${error.message}`);
      return false;
    }
  }, [refetch]);

  return {
    categories,
    isLoading,
    error,
    addCategory,
    deleteCategory,
  };
}
