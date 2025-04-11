
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { isSelectQueryError } from "@/utils/supabase-helpers";

export function usePreorderStatus(preorderId: string) {
  const { data: preorder, isLoading } = useQuery({
    queryKey: ['preorder-status', preorderId],
    enabled: !!preorderId,
    queryFn: async () => {
      if (!preorderId) return null;
      
      const { data, error } = await supabase
        .from('preorders')
        .select(`
          *,
          items:preorder_items(*)
        `)
        .eq('id', preorderId)
        .single();
      
      if (error) throw error;
      return data;
    }
  });

  // Check if all items are in the status "delivered"
  const isFullyDelivered = () => {
    if (!preorder) return false;
    
    // Handle case where items is a SelectQueryError
    if (isSelectQueryError(preorder.items)) {
      return false; // If we can't access items, then it's not fully delivered
    }
    
    const items = preorder.items || [];
    
    // If no items, it can't be fully delivered
    if (items.length === 0) return false;
    
    // Check each item's status
    return items.every(item => item.status === 'delivered');
  };

  // Check if all items are in the status "canceled"
  const isFullyCanceled = () => {
    if (!preorder) return false;
    
    // Handle case where items is a SelectQueryError
    if (isSelectQueryError(preorder.items)) {
      return false; // If we can't access items, then it's not fully canceled
    }
    
    const items = preorder.items || [];
    
    // If no items, it can't be fully canceled
    if (items.length === 0) return false;
    
    // Check each item's status
    return items.every(item => item.status === 'canceled');
  };

  return {
    preorder,
    isLoading,
    isFullyDelivered,
    isFullyCanceled
  };
}
