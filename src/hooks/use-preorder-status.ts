
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function usePreorderStatus() {
  const [pendingPreorders, setPendingPreorders] = useState<string[]>([]);

  const fetchAndUpdateStatus = async () => {
    try {
      // Find any preorders that should be updated to available
      const { data: preorders, error } = await supabase
        .from('preorders')
        .select(`
          id,
          preorder_items!inner (
            product_id,
            quantity,
            status
          )
        `)
        .eq('status', 'pending');

      if (error) throw error;

      if (!preorders || preorders.length === 0) return;

      // For each preorder, check if all items are available
      for (const preorder of preorders) {
        // Get all product IDs from this preorder to check their stock levels
        const productIds = preorder.preorder_items.map(item => item.product_id);
        
        const { data: products, error: productsError } = await supabase
          .from('catalog')
          .select('id, stock')
          .in('id', productIds);
          
        if (productsError) throw productsError;
        
        // Create a map of product ID to stock
        const stockMap = products.reduce((map, product) => {
          map[product.id] = product.stock;
          return map;
        }, {});
        
        // Check if all items in this preorder are now available
        const allItemsAvailable = preorder.preorder_items.every(item => 
          stockMap[item.product_id] >= item.quantity
        );
        
        if (allItemsAvailable) {
          // If all items are available, update the preorder status
          const { error: updateError } = await supabase
            .from('preorders')
            .update({ status: 'available' })
            .eq('id', preorder.id);
            
          if (updateError) throw updateError;
          
          // Update all preorder items to available
          const { error: itemsUpdateError } = await supabase
            .from('preorder_items')
            .update({ status: 'available' })
            .eq('preorder_id', preorder.id);
            
          if (itemsUpdateError) throw itemsUpdateError;
          
          toast.success(`La précommande ${preorder.id.substring(0, 8).toUpperCase()} est maintenant disponible!`);
        }
      }
    } catch (error) {
      console.error('Error checking preorder status:', error);
    }
  };

  useEffect(() => {
    // Check once when the hook is mounted
    fetchAndUpdateStatus();
    
    // Create a subscription for changes to the catalog table that might affect preorders
    const stockSubscription = supabase
      .channel('catalog-stock-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'catalog',
          filter: 'stock>eq.1'
        },
        (_payload) => {
          // When stock changes, check if any pending preorders can be fulfilled
          fetchAndUpdateStatus();
        }
      )
      .subscribe();
    
    // Also set up a periodic check every 5 minutes just in case
    const interval = setInterval(fetchAndUpdateStatus, 5 * 60 * 1000);
    
    return () => {
      stockSubscription.unsubscribe();
      clearInterval(interval);
    };
  }, []);

  return { pendingPreorders };
}
