
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Enhanced hook to fetch warehouse stock data with improved error handling and loading states
 * 
 * @param locationId - ID of the warehouse or POS location
 * @param isPOS - Whether to fetch POS stock (true) or warehouse stock (false)
 */
export function useWarehouseStock(locationId?: string, isPOS: boolean = true) {
  const queryClient = useQueryClient();

  const queryResult = useQuery({
    queryKey: ['warehouse-stock', locationId, isPOS],
    queryFn: async ({ signal }) => {
      try {
        console.log("Starting warehouse stock fetch:", { locationId, isPOS });

        let query = supabase
          .from('warehouse_stock')
          .select(`
            id,
            quantity,
            unit_price,
            total_value,
            pos_location_id,
            warehouse_id,
            product:product_id(
              id,
              name,
              price,
              category,
              reference
            ),
            warehouse:warehouse_id(id, name),
            pos_location:pos_location_id(id, name)
          `);

        // Add AbortController signal to support query cancellation
        if (signal) {
          query.abortSignal(signal);
        }

        // Construction de la requête en fonction du type (PDV ou entrepôt)
        if (isPOS) {
          console.log("Mode PDV :", locationId || "tous les PDV");
          if (locationId && locationId !== "_all") {
            query = query.eq('pos_location_id', locationId);
          } else {
            query = query.not('pos_location_id', 'is', null);
          }
        } else {
          console.log("Mode entrepôt :", locationId || "tous les entrepôts");
          if (locationId && locationId !== "_all") {
            query = query.eq('warehouse_id', locationId);
          } else {
            // Pour obtenir tous les enregistrements d'entrepôt, même si locationId est "_all"
            query = query.not('warehouse_id', 'is', null);
          }
        }

        // Ajouter un filtre pour s'assurer qu'on récupère seulement les stocks avec une quantité > 0
        query = query.gt('quantity', 0);

        console.log("Executing warehouse stock query...");
        const { data, error } = await query;

        if (error) {
          console.error("Supabase query error:", error);
          throw new Error(`Erreur de requête: ${error.message}`);
        }

        // Debug - vérifions les données retournées
        console.log(`Found ${data?.length || 0} warehouse stock records with quantity > 0`);
        console.log("Raw warehouse stock data:", data);
        
        return data || [];
      } catch (error) {
        // Enhanced error logging with more context
        const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
        console.error("Error fetching warehouse stock:", error);
        console.error("Query parameters:", { locationId, isPOS });
        
        // Don't show toast during initial load or if we're retrying
        if (queryResult.fetchStatus !== 'fetching' || queryResult.failureCount > 0) {
          toast.error("Erreur de chargement", {
            description: `Impossible de charger les données de stock: ${errorMessage}`
          });
        }
        
        throw error; // Re-throw to let React Query handle retries
      }
    },
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    staleTime: 1000 * 30, // 30 seconds - More frequent refreshes for stock data
    retry: (failureCount, error) => {
      // More aggressive retry strategy with exponential backoff handled by React Query
      // Don't retry for client-side cancellations or if we've tried too many times
      const maxRetries = 3;
      
      if (error instanceof Error && error.message.includes('aborted')) {
        return false; // Don't retry aborted requests
      }
      
      return failureCount < maxRetries;
    },
    retryDelay: attemptIndex => Math.min(1000 * (2 ** attemptIndex), 30000), // Exponential backoff, max 30 seconds
  });

  // Return enhanced result object with simplified access to common states
  return {
    ...queryResult,
    data: queryResult.data || [],
    isLoading: queryResult.isLoading,
    isError: queryResult.isError,
    error: queryResult.error,
    isLoadingOrFetching: queryResult.isLoading || queryResult.isFetching,
    refetch: queryResult.refetch,
    // Helper function to reload data
    reload: () => {
      toast.info("Actualisation", {
        description: "Rechargement des données de stock..."
      });
      queryClient.invalidateQueries({ queryKey: ['warehouse-stock'] });
      queryClient.invalidateQueries({ queryKey: ['catalog'] }); 
      queryClient.invalidateQueries({ queryKey: ['stock-stats'] });
      queryClient.invalidateQueries({ queryKey: ['stock_principal'] });
      return queryResult.refetch();
    }
  };
}
