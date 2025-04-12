// Fix for deep type instantiation error
// Simplify the type structure

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useCustomReportQueries(startDate: string, endDate: string) {
  // Use more explicit types but avoid excessive nesting
  const { data: salesByDate = [], isLoading: isLoadingSalesByDate } = useQuery({
    queryKey: ['sales-by-date', startDate, endDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('created_at, final_total')
        .gte('created_at', `${startDate}T00:00:00`)
        .lte('created_at', `${endDate}T23:59:59`);
      
      if (error) throw error;
      
      // Process the data to group by date
      const salesByDate = data.reduce((acc: Record<string, number>, curr) => {
        const date = new Date(curr.created_at).toISOString().split('T')[0];
        acc[date] = (acc[date] || 0) + (curr.final_total || 0);
        return acc;
      }, {});
      
      return Object.entries(salesByDate).map(([date, amount]) => ({
        date,
        amount
      }));
    }
  });

  // Use more explicit types but avoid excessive nesting
  const { data: expensesByDate = [], isLoading: isLoadingExpensesByDate } = useQuery({
    queryKey: ['expenses-by-date', startDate, endDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('expenses')
        .select('created_at, amount')
        .gte('created_at', `${startDate}T00:00:00`)
        .lte('created_at', `${endDate}T23:59:59`);
      
      if (error) throw error;
      
      // Process the data to group by date
      const expensesByDate = data.reduce((acc: Record<string, number>, curr) => {
        const date = new Date(curr.created_at).toISOString().split('T')[0];
        acc[date] = (acc[date] || 0) + (curr.amount || 0);
        return acc;
      }, {});
      
      return Object.entries(expensesByDate).map(([date, amount]) => ({
        date,
        amount
      }));
    }
  });

  // Use more explicit types but avoid excessive nesting
  const { data: productsSold = [], isLoading: isLoadingProductsSold } = useQuery({
    queryKey: ['products-sold', startDate, endDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('order_items')
        .select('product_id, quantity, product:catalog(name)')
        .gte('created_at', `${startDate}T00:00:00`)
        .lte('created_at', `${endDate}T23:59:59`);
      
      if (error) throw error;
      
      // Process the data to group by product
      const productsSold = data.reduce((acc: Record<string, { name: string, quantity: number }>, curr) => {
        const productId = curr.product_id;
        if (!acc[productId]) {
          acc[productId] = {
            name: curr.product?.name || 'Unknown Product',
            quantity: 0
          };
        }
        acc[productId].quantity += curr.quantity;
        return acc;
      }, {});
      
      return Object.entries(productsSold).map(([productId, { name, quantity }]) => ({
        productId,
        name,
        quantity
      }));
    }
  });
  
  return {
    salesByDate,
    isLoadingSalesByDate,
    expensesByDate,
    isLoadingExpensesByDate,
    productsSold,
    isLoadingProductsSold
  };
}
