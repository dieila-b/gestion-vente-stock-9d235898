
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useIncomes() {
  const queryClient = useQueryClient();

  const { data: incomes = [], isLoading } = useQuery({
    queryKey: ['incomes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('income_entries')
        .select(`
          *,
          category:category_id(id, name)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const createIncome = useMutation({
    mutationFn: async (incomeData: { 
      amount: number;
      description: string;
      category_id: string;
    }) => {
      const { data, error } = await supabase
        .from('income_entries')
        .insert({
          amount: incomeData.amount,
          description: incomeData.description,
          category_id: incomeData.category_id
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Revenu enregistré avec succès");
      queryClient.invalidateQueries({ queryKey: ['incomes'] });
    },
    onError: (error: any) => {
      toast.error(`Erreur: ${error.message}`);
    }
  });

  const deleteIncome = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('income_entries')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      toast.success("Revenu supprimé avec succès");
      queryClient.invalidateQueries({ queryKey: ['incomes'] });
    },
    onError: (error: any) => {
      toast.error(`Erreur: ${error.message}`);
    }
  });

  return {
    incomes,
    isLoading,
    createIncome,
    deleteIncome
  };
}
