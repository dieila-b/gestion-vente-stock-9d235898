
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

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
      try {
        // Utiliser la fonction Supabase pour récupérer les transferts
        const { data, error } = await supabase.rpc('bypass_select_stock_transfers');
        
        if (error) {
          console.error("Error fetching transfers:", error);
          throw error;
        }
        
        console.log("Transfers data fetched:", data);
        return data || [];
      } catch (error) {
        console.error("Error fetching transfers:", error);
        return [];
      }
    },
  });

  const createTransferMutation = useMutation({
    mutationFn: async (transferData: any) => {
      console.log("Creating transfer with data:", transferData);
      
      // Utiliser la fonction Supabase pour insérer le transfert
      const { data, error } = await supabase.rpc('bypass_insert_stock_transfer', {
        transfer_data: transferData
      });

      if (error) {
        console.error("Error creating transfer:", error);
        throw error;
      }

      console.log("Transfer created successfully:", data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transfers"] });
      toast({
        title: "Transfert créé",
        description: "Le transfert a été créé avec succès",
      });
    },
    onError: (error) => {
      console.error("Error creating transfer:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de créer le transfert",
      });
    },
  });

  const deleteTransferMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("stock_transfers")
        .delete()
        .eq("id", id);

      if (error) {
        throw error;
      }

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
        .from("stock_transfers")
        .select(`
          *,
          source_warehouse:source_warehouse_id(*),
          destination_warehouse:destination_warehouse_id(*),
          source_pos:source_pos_id(*),
          destination_pos:destination_pos_id(*),
          product:product_id(*)
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
      try {
        const { data, error } = await supabase
          .from("pos_locations")
          .select("id, name")
          .eq("is_active", true);
        
        if (error) {
          console.error("Error fetching POS locations:", error);
          return [];
        }
        
        return data || [];
      } catch (error) {
        console.error("Error fetching POS locations:", error);
        return [];
      }
    },
  });

  // Fetch warehouses for dropdowns
  const { data: warehouses = [] }  = useQuery({
    queryKey: ["warehouses-for-dropdown"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("warehouses")
          .select("id, name")
          .eq("is_active", true);
        
        if (error) {
          console.error("Error fetching warehouses:", error);
          return [];
        }
        
        return data || [];
      } catch (error) {
        console.error("Error fetching warehouses:", error);
        return [];
      }
    },
  });

  return {
    transfers,
    isLoading,
    isError,
    refetch,
    createTransfer: createTransferMutation.mutate,
    deleteTransfer: deleteTransferMutation.mutate,
    fetchTransferById,
    posLocations,
    warehouses,
  };
}
