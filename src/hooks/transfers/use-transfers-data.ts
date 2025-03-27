
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Transfer } from "@/types/transfer";

export function useTransfersData() {
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: transfers = [], isLoading: isLoadingTransfers } = useQuery({
    queryKey: ['transfers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stock_transfers')
        .select(`
          *,
          source_warehouse:warehouses!stock_transfers_source_warehouse_id_fkey(
            id,
            name
          ),
          destination_warehouse:warehouses!stock_transfers_destination_warehouse_id_fkey(
            id,
            name
          ),
          source_pos:pos_locations!stock_transfers_source_pos_id_fkey(
            id,
            name
          ),
          destination_pos:pos_locations!stock_transfers_destination_pos_id_fkey(
            id,
            name
          ),
          items:stock_transfer_items(
            quantity,
            product:catalog(
              id,
              name
            )
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) {
        toast({
          title: "Erreur",
          description: "Impossible de charger les transferts.",
          variant: "destructive",
        });
        throw error;
      }
      
      return data as Transfer[];
    },
  });

  const { data: warehouses = [], isLoading: isLoadingWarehouses } = useQuery({
    queryKey: ['warehouses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('warehouses')
        .select('*');
      
      if (error) {
        toast({
          title: "Erreur",
          description: "Impossible de charger les entrepôts.",
          variant: "destructive",
        });
        throw error;
      }
      
      return data;
    },
  });

  const { data: products = [], isLoading: isLoadingProducts } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('catalog')
        .select('*');
      
      if (error) {
        toast({
          title: "Erreur",
          description: "Impossible de charger les produits.",
          variant: "destructive",
        });
        throw error;
      }
      
      return data;
    },
  });

  const { data: posLocations = [], isLoading: isLoadingPosLocations } = useQuery({
    queryKey: ['pos_locations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pos_locations')
        .select('*');
      
      if (error) {
        toast({
          title: "Erreur",
          description: "Impossible de charger les points de vente.",
          variant: "destructive",
        });
        throw error;
      }
      
      return data;
    },
  });

  const filteredTransfers = transfers.filter(transfer =>
    transfer.reference?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    transfer.source_warehouse?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    transfer.destination_warehouse?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isLoading = isLoadingTransfers || isLoadingWarehouses || isLoadingProducts || isLoadingPosLocations;

  return {
    transfers,
    filteredTransfers,
    warehouses,
    products,
    posLocations,
    isLoading,
    searchQuery,
    setSearchQuery,
    queryClient
  };
}
