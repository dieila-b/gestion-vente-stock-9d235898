
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useOutcomes() {
  const queryClient = useQueryClient();

  const { data: outcomes = [], isLoading } = useQuery({
    queryKey: ['outcomes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('outcome_entries')
        .select(`
          *,
          category:category_id(id, name)
        `)
        .order('date', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const createOutcome = useMutation({
    mutationFn: async (outcomeData: { 
      amount: number;
      description: string;
      category_id: string;
      date?: string;
      payment_method?: string;
      receipt_number?: string;
    }) => {
      const { data, error } = await supabase
        .from('outcome_entries')
        .insert({
          amount: outcomeData.amount,
          description: outcomeData.description,
          category_id: outcomeData.category_id,
          date: outcomeData.date || new Date().toISOString(),
          payment_method: outcomeData.payment_method || 'cash',
          receipt_number: outcomeData.receipt_number
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Dépense enregistrée avec succès");
      queryClient.invalidateQueries({ queryKey: ['outcomes'] });
    },
    onError: (error: any) => {
      toast.error(`Erreur: ${error.message}`);
    }
  });

  const deleteOutcome = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('outcome_entries')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      toast.success("Dépense supprimée avec succès");
      queryClient.invalidateQueries({ queryKey: ['outcomes'] });
    },
    onError: (error: any) => {
      toast.error(`Erreur: ${error.message}`);
    }
  });

  return {
    outcomes,
    isLoading,
    createOutcome,
    deleteOutcome
  };
}
