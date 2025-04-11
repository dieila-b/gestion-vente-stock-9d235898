
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { isSelectQueryError } from "@/utils/supabase-helpers";

export function useClientStats() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["client-stats"],
    queryFn: async () => {
      // Get client count
      const { count: clientCount, error: clientError } = await supabase
        .from("clients")
        .select("*", { count: "exact", head: true });

      if (clientError) throw clientError;

      // Get total sales
      const { data: salesData, error: salesError } = await supabase
        .from("orders")
        .select("total");

      if (salesError) throw salesError;

      // Get total supplier orders
      const { data: supplierData, error: supplierError } = await supabase
        .from("purchase_orders")
        .select("total_amount");

      if (supplierError) throw supplierError;

      // Calculate total sales
      const totalSales = salesData.reduce((sum, item) => sum + (item.total || 0), 0);

      // Calculate total supplier orders
      const totalSupplierOrders = supplierData.reduce((sum, item) => {
        if (isSelectQueryError(item)) return sum;
        return sum + (item.total_amount || 0);
      }, 0);

      return {
        clientCount: clientCount || 0,
        totalSales,
        totalSupplierOrders,
      };
    },
  });

  return {
    clientCount: data?.clientCount || 0,
    totalSales: data?.totalSales || 0,
    totalSupplierOrders: data?.totalSupplierOrders || 0,
    isLoading,
  };
}
