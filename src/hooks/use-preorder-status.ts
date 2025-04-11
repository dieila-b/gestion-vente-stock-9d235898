
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { isSelectQueryError } from "@/utils/supabase-helpers";
import { safeMap } from "@/hooks/use-error-handling";

export function usePreorderStatus(preorderId?: string) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["preorder-status", preorderId],
    enabled: !!preorderId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("preorders")
        .select(`
          id,
          client_id,
          notes,
          status,
          total_amount,
          paid_amount,
          remaining_amount,
          created_at,
          updated_at,
          items:preorder_items(*)
        `)
        .eq("id", preorderId!)
        .single();

      if (error) throw error;
      return data;
    }
  });

  const isFullyDelivered = () => {
    if (!data || !data.items || isSelectQueryError(data.items)) {
      return false;
    }
    
    const items = Array.isArray(data.items) ? data.items : [];
    // Check if all items are delivered
    return items.length > 0 && items.every(item => item.status === 'delivered');
  };

  const isPartiallyDelivered = () => {
    if (!data || !data.items || isSelectQueryError(data.items)) {
      return false;
    }
    
    const items = Array.isArray(data.items) ? data.items : [];
    
    // Check if at least one item is delivered
    const hasDeliveredItem = items.some(item => item.status === 'delivered');
    
    // Check if at least one item is not delivered
    const hasNonDeliveredItem = items.some(item => item.status !== 'delivered');

    return items.length > 0 && hasDeliveredItem && hasNonDeliveredItem;
  };

  const markAsDelivered = async () => {
    if (!data) return;

    try {
      // First update each item status
      if (data.items && !isSelectQueryError(data.items)) {
        const items = Array.isArray(data.items) ? data.items : [];
        for (const item of items) {
          await supabase
            .from("preorder_items")
            .update({ status: "delivered" })
            .eq("id", item.id);
        }
      }

      // Then update the preorder status
      await supabase
        .from("preorders")
        .update({ status: "delivered" })
        .eq("id", data.id);

      // Refetch data
      refetch();
      
      return true;
    } catch (err) {
      console.error("Error marking preorder as delivered:", err);
      return false;
    }
  };

  return {
    preorder: data,
    isLoading,
    error,
    isFullyDelivered: isFullyDelivered(),
    isPartiallyDelivered: isPartiallyDelivered(),
    markAsDelivered
  };
}
