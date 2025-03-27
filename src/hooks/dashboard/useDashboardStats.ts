
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useDashboardStats = () => {
  // Fetch orders and order items for today's sales and margin
  const { data: todayOrderData } = useQuery({
    queryKey: ['orders-with-items', 'today'],
    queryFn: async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            product:product_id (
              name,
              price
            )
          )
        `)
        .gte('created_at', today.toISOString())
        .order('created_at', { ascending: false });
      
      if (ordersError) throw ordersError;
      return orders || [];
    }
  });

  // Fetch catalog for product purchase prices
  const { data: catalogProducts } = useQuery({
    queryKey: ['catalog-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('catalog')
        .select('id, purchase_price, price');
      
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch unpaid invoices 
  const { data: unpaidInvoices } = useQuery({
    queryKey: ['invoices', 'unpaid'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .in('payment_status', ['pending', 'partial']);
      
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch monthly outcome entries
  const { data: monthlyExpenses } = useQuery({
    queryKey: ['expenses', 'monthly'],
    queryFn: async () => {
      const firstDayOfMonth = new Date();
      firstDayOfMonth.setDate(1);
      firstDayOfMonth.setHours(0, 0, 0, 0);
      
      const { data, error } = await supabase
        .from('outcome_entries')
        .select('*')
        .gte('date', firstDayOfMonth.toISOString());
      
      if (error) throw error;
      return data || [];
    }
  });

  return {
    todayOrderData,
    catalogProducts,
    unpaidInvoices,
    monthlyExpenses
  };
};
