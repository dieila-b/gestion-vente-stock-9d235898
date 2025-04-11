
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { isSelectQueryError } from "@/utils/supabase-helpers";

export function useClientStats() {
  // Get total client count
  const { data: clientCount = 0, isLoading: isLoadingClients } = useQuery({
    queryKey: ["client-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("clients")
        .select("*", { count: "exact", head: true });

      if (error) throw error;
      return count || 0;
    },
  });

  // Get total sales amount
  const { data: totalSales = 0, isLoading: isLoadingSales } = useQuery({
    queryKey: ["total-sales"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("total, paid_amount");

      if (error) throw error;
      
      // Calculate total from orders
      return data.reduce((acc, order) => {
        return acc + (order.total || 0);
      }, 0);
    },
  });

  // Get total supplier orders amount
  const { data: totalSupplierOrders = 0, isLoading: isLoadingSupplierOrders } = useQuery({
    queryKey: ["total-supplier-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("purchase_orders")
        .select("total_amount");

      if (error) throw error;
      
      // Calculate total from purchase_orders
      return data.reduce((acc, order) => {
        const amount = typeof order.total_amount === 'number' ? order.total_amount : 0;
        return acc + amount;
      }, 0);
    },
  });

  const isLoading = isLoadingClients || isLoadingSales || isLoadingSupplierOrders;

  return {
    clientCount,
    totalSales,
    totalSupplierOrders,
    isLoading,
  };
}
