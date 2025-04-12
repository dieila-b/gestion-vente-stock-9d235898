
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { db } from "@/utils/db-adapter"; 
import { castToTransfers } from "@/utils/supabase-safe-query";

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
        const data = await db.query(
          "transfers",
          query => query.select(`
            *,
            source_warehouse:source_warehouse_id(*),
            destination_warehouse:destination_warehouse_id(*),
            source_pos:source_pos_id(*),
            destination_pos:destination_pos_id(*),
            items:transfer_items(*)
          `)
          .order("created_at", { ascending: false })
        );
        
        // Use helper function to handle SelectQueryError
        return castToTransfers(data || []);
      } catch (error) {
        console.error("Error fetching transfers:", error);
        return [];
      }
    },
  });

  const deleteTransferMutation = useMutation({
    mutationFn: async (id: string) => {
      // First delete the items
      const itemsDeleted = await db.delete("transfer_items", "transfer_id", id);

      if (!itemsDeleted) {
        throw new Error("Failed to delete transfer items");
      }

      // Then delete the transfer
      const transferDeleted = await db.delete("transfers", "id", id);

      if (!transferDeleted) {
        throw new Error("Failed to delete transfer");
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
      const data = await db.query(
        "transfers",
        query => query.select(`
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
        .single()
      );

      if (!data) throw new Error("Transfer not found");
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
        const data = await db.query(
          "pos_locations",
          query => query.select("id, name").eq("is_active", true)
        );
        
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
        const data = await db.query(
          "warehouses",
          query => query.select("id, name").eq("is_active", true)
        );
        
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
    deleteTransfer: deleteTransferMutation.mutate,
    fetchTransferById,
    posLocations,
    warehouses,
  };
}
