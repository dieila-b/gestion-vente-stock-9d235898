// Fix for deep type instantiation error
// Instead of using complex recursive types, simplify the types to avoid excessive depth

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useDailyReportQueries(date: string) {
  // Simplify the type by using any for the data
  const { data: dailySales = [], isLoading: isLoadingSales } = useQuery({
    queryKey: ['daily-sales', date],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .gte('created_at', `${date}T00:00:00`)
        .lte('created_at', `${date}T23:59:59`);
      
      if (error) throw error;
      return data;
    }
  });

  const { data: dailyExpenses = [], isLoading: isLoadingExpenses } = useQuery({
    queryKey: ['daily-expenses', date],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .gte('created_at', `${date}T00:00:00`)
        .lte('created_at', `${date}T23:59:59`);
      
      if (error) throw error;
      return data;
    }
  });

  const { data: dailyPayments = [], isLoading: isLoadingPayments } = useQuery({
    queryKey: ['daily-payments', date],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('order_payments')
        .select('*')
        .gte('created_at', `${date}T00:00:00`)
        .lte('created_at', `${date}T23:59:59`);
      
      if (error) throw error;
      return data;
    }
  });
  
  return {
    dailySales,
    isLoadingSales,
    dailyExpenses,
    isLoadingExpenses,
    dailyPayments,
    isLoadingPayments
  };
}
