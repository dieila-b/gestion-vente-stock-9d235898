
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
          "stock_transfers",
          query => query.select(`
            *,
            source_warehouse:from_warehouse_id(*),
            destination_warehouse:to_warehouse_id(*),
            product:product_id(*)
          `)
          .order("created_at", { ascending: false })
        );
        
        console.log("Transfers data fetched:", data);
        
        // Add default values for potentially missing fields
        const enhancedData = data?.map(transfer => ({
          ...transfer,
          reference: transfer.reference || `T-${transfer.id.substring(0, 8)}`,
          transfer_type: transfer.transfer_type || "depot_to_depot",
          status: transfer.status || "pending",
        })) || [];
        
        return enhancedData;
      } catch (error) {
        console.error("Error fetching transfers:", error);
        return [];
      }
    },
  });

  const deleteTransferMutation = useMutation({
    mutationFn: async (id: string) => {
      const transferDeleted = await db.delete("stock_transfers", "id", id);

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
        "stock_transfers",
        query => query.select(`
          *,
          source_warehouse:from_warehouse_id(*),
          destination_warehouse:to_warehouse_id(*),
          product:product_id(*)
        `)
        .eq("id", id)
        .single()
      );

      if (!data) throw new Error("Transfer not found");
      
      // Add default values for potentially missing fields
      const enhancedData = {
        ...data,
        reference: data.reference || `T-${data.id.substring(0, 8)}`,
        transfer_type: data.transfer_type || "depot_to_depot",
        status: data.status || "pending",
      };
      
      return enhancedData;
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
