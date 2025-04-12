
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useCallback } from "react";
import type { Category } from "@/types/category"; // Fixed casing

export function useIncomeCategories() {
  // Fetch income categories
  const { data: categories = [], isLoading, error, refetch } = useQuery({
    queryKey: ['income-categories'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('expense_categories')
          .select('*')
          .eq('type', 'income');

        if (error) throw error;
        return data as Category[];
      } catch (error: any) {
        console.error('Error fetching income categories:', error);
        toast.error(`Failed to load income categories: ${error.message}`);
        return [];
      }
    }
  });

  // Add a new income category
  const addCategory = useCallback(async (name: string) => {
    try {
      const { error } = await supabase
        .from('expense_categories')
        .insert({ name, type: 'income' });

      if (error) throw error;
      
      toast.success('Income category added successfully');
      refetch();
      return true;
    } catch (error: any) {
      console.error('Error adding income category:', error);
      toast.error(`Failed to add income category: ${error.message}`);
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
      
      toast.success('Income category deleted successfully');
      refetch();
      return true;
    } catch (error: any) {
      console.error('Error deleting income category:', error);
      toast.error(`Failed to delete income category: ${error.message}`);
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
