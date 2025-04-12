
import { useQuery } from "@tanstack/react-query";
import { db } from "@/utils/db-adapter";

export const useDashboardStats = () => {
  // Fetch orders and order items for today's sales and margin
  const { data: todayOrderData } = useQuery({
    queryKey: ['orders-with-items', 'today'],
    queryFn: async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      try {
        const orders = await db.query(
          'orders',
          query => query
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
            .order('created_at', { ascending: false })
        );
        
        return orders || [];
      } catch (error) {
        console.error("Error fetching today's orders:", error);
        return [];
      }
    }
  });

  // Fetch catalog for product purchase prices
  const { data: catalogProducts } = useQuery({
    queryKey: ['catalog-products'],
    queryFn: async () => {
      try {
        const products = await db.query(
          'catalog',
          query => query.select('id, purchase_price, price')
        );
        
        return products || [];
      } catch (error) {
        console.error("Error fetching catalog products:", error);
        return [];
      }
    }
  });

  // Fetch unpaid invoices 
  const { data: unpaidInvoices } = useQuery({
    queryKey: ['invoices', 'unpaid'],
    queryFn: async () => {
      try {
        const invoices = await db.query(
          'orders',
          query => query.select('*').in('payment_status', ['pending', 'partial'])
        );
        
        return invoices || [];
      } catch (error) {
        console.error("Error fetching unpaid invoices:", error);
        return [];
      }
    }
  });

  // Fetch monthly outcome entries
  const { data: monthlyExpenses } = useQuery({
    queryKey: ['expenses', 'monthly'],
    queryFn: async () => {
      const firstDayOfMonth = new Date();
      firstDayOfMonth.setDate(1);
      firstDayOfMonth.setHours(0, 0, 0, 0);
      
      try {
        const expenses = await db.query(
          'expense_entries',
          query => query.select('*').gte('created_at', firstDayOfMonth.toISOString())
        );
        
        return expenses || [];
      } catch (error) {
        console.error("Error fetching monthly expenses:", error);
        return [];
      }
    }
  });

  return {
    todayOrderData,
    catalogProducts,
    unpaidInvoices,
    monthlyExpenses
  };
};
