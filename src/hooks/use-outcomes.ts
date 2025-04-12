
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Outcome } from "@/types/outcome";

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
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Outcome[];
    }
  });

  const createOutcome = useMutation({
    mutationFn: async (outcomeData: Partial<Outcome>) => {
      const { data, error } = await supabase
        .from('outcome_entries')
        .insert(outcomeData)
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
