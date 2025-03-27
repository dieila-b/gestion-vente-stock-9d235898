
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Activity } from "../types/activity";
import { useActivityTransforms } from "./useActivityTransforms";
import { startOfMonth } from "date-fns";

export function useInitialActivities() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { 
    transformOrderToActivity, 
    transformCatalogToActivity, 
    transformTransferToActivity,
    transformStockMovementToActivity
  } = useActivityTransforms();

  useEffect(() => {
    const fetchInitialActivities = async () => {
      setIsLoading(true);
      try {
        const startDate = startOfMonth(new Date()).toISOString();

        // Fetch recent orders
        const { data: orders, error: ordersError } = await supabase
          .from('orders')
          .select('*')
          .gte('created_at', startDate)
          .order('created_at', { ascending: false })
          .limit(5);

        if (ordersError) throw ordersError;

        // Fetch recent catalog updates
        const { data: catalogUpdates, error: catalogError } = await supabase
          .from('catalog')
          .select('*')
          .gte('updated_at', startDate)
          .order('updated_at', { ascending: false })
          .limit(5);

        if (catalogError) throw catalogError;

        // Fetch recent transfers
        const { data: transfers, error: transfersError } = await supabase
          .from('stock_transfers')
          .select('*')
          .gte('created_at', startDate)
          .order('created_at', { ascending: false })
          .limit(5);

        if (transfersError) throw transfersError;

        // Fetch recent stock movements
        const { data: stockMovements, error: stockMovementsError } = await supabase
          .from('warehouse_stock_movements')
          .select('*')
          .gte('created_at', startDate)
          .order('created_at', { ascending: false })
          .limit(5);

        if (stockMovementsError) throw stockMovementsError;

        // Transform the data into activities
        const orderActivities = orders?.map(transformOrderToActivity) || [];
        const catalogActivities = catalogUpdates?.map(transformCatalogToActivity) || [];
        const transferActivities = transfers?.map(transformTransferToActivity) || [];
        const stockMovementActivities = stockMovements?.map(transformStockMovementToActivity) || [];

        // Combine all activities and sort by timestamp
        const allActivities = [
          ...orderActivities,
          ...catalogActivities,
          ...transferActivities,
          ...stockMovementActivities
        ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

        setActivities(allActivities);
      } catch (error) {
        console.error("Error fetching initial activities:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialActivities();
  }, [transformOrderToActivity, transformCatalogToActivity, transformTransferToActivity, transformStockMovementToActivity]);

  return { activities, isLoading };
}
