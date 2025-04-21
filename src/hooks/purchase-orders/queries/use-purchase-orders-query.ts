
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PurchaseOrder } from "@/types/purchase-order";
import { toast } from "sonner";

export function usePurchaseOrdersQuery() {
  return useQuery({
    queryKey: ['purchase-orders'],
    queryFn: async (): Promise<PurchaseOrder[]> => {
      console.log("Fetching purchase orders...");
      
      try {
        // First, try direct query
        const { data: directData, error: directError } = await supabase
          .from('purchase_orders')
          .select(`
            *,
            supplier:suppliers(*)
          `)
          .order('created_at', { ascending: false });
          
        if (!directError && directData) {
          console.log("Purchase orders fetched successfully via direct query:", directData.length);
          return directData as PurchaseOrder[];
        }
        
        // If direct query fails, try RPC function
        if (directError) {
          console.log("Direct query failed, trying RPC function:", directError);
          const { data: rpcData, error: rpcError } = await supabase.rpc('bypass_select_purchase_orders' as any);
          
          if (rpcError) {
            console.error("RPC function also failed:", rpcError);
            throw rpcError;
          }
          
          if (rpcData) {
            console.log("Processed purchase orders:", rpcData);
            return rpcData as unknown as PurchaseOrder[];
          }
          
          return [];
        }
        
        return [];
      } catch (error) {
        console.error("Error fetching purchase orders:", error);
        toast.error("Erreur lors du chargement des bons de commande");
        return [];
      }
    },
    staleTime: 0, // Always refetch on component mount
    refetchOnWindowFocus: true,
  });
}
