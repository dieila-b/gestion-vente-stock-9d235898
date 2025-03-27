
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/types/pos";

export function usePOSRealtime(currentProducts: Product[] = []) {
  // Handle real-time updates
  useEffect(() => {
    const channel = supabase
      .channel("products")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "warehouse_stock",
        },
        () => {
          // This empty callback is kept to maintain the subscription
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return currentProducts;
}
