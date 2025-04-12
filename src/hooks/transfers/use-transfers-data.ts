
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { castToTransfers } from "@/utils/select-query-helper";

export function useTransfersData() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: transfers = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["transfers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("transfers")
        .select(`
          *,
          source_warehouse:source_warehouse_id(*),
          destination_warehouse:destination_warehouse_id(*),
          source_pos:source_pos_id(*),
          destination_pos:destination_pos_id(*),
          items:transfer_items(*)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      // Use helper function to handle SelectQueryError
      return castToTransfers(data || []);
    },
  });

  const deleteTransferMutation = useMutation({
    mutationFn: async (id: string) => {
      // First delete the items
      const { error: itemsError } = await supabase
        .from("transfer_items")
        .delete()
        .eq("transfer_id", id);

      if (itemsError) throw itemsError;

      // Then delete the transfer
      const { error } = await supabase.from("transfers").delete().eq("id", id);

      if (error) throw error;
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transfers"] });
      toast({
        title: "Transfert supprimé",
        description: "Le transfert a été supprimé avec succès",
      });
    },
    onError: (error) => {
      console.error("Error deleting transfer:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de supprimer le transfert",
      });
    },
  });

  // Function to fetch a specific transfer by ID
  const fetchTransferById = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from("transfers")
        .select(`
          *,
          source_warehouse:source_warehouse_id(*),
          destination_warehouse:destination_warehouse_id(*),
          source_pos:source_pos_id(*),
          destination_pos:destination_pos_id(*),
          items:transfer_items(
            *,
            product:product_id(*)
          )
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error fetching transfer:", error);
      throw error;
    }
  };

  // Fetch POS locations for dropdowns
  const { data: posLocations = [] } = useQuery({
    queryKey: ["pos-locations-for-dropdown"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pos_locations")
        .select("id, name")
        .eq("is_active", true);

      if (error) throw error;
      return data;
    },
  });

  // Fetch warehouses for dropdowns
  const { data: warehouses = [] } = useQuery({
    queryKey: ["warehouses-for-dropdown"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("warehouses")
        .select("id, name")
        .eq("is_active", true);

      if (error) throw error;
      return data;
    },
  });

  return {
    transfers,
    isLoading,
    isError,
    refetch,
    deleteTransfer: deleteTransferMutation.mutate,
    fetchTransferById,
    posLocations,
    warehouses,
  };
}
