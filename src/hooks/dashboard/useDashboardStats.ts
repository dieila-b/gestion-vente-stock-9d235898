
import { useQuery } from "@tanstack/react-query";
import { db } from "@/utils/db-adapter";

export const useDashboardStats = () => {
  // Fetch orders and order items for today's sales and margin
  const { data: todayOrderData = [], error: ordersError } = useQuery({
    queryKey: ['orders-with-items', 'today'],
    queryFn: async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      try {
        console.log("useDashboardStats: Récupération des commandes du jour");
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
        
        console.log("useDashboardStats: Commandes récupérées:", orders?.length || 0);
        return Array.isArray(orders) ? orders : [];
      } catch (error) {
        console.error("Erreur lors de la récupération des commandes du jour:", error);
        return [];
      }
    },
    retry: 1
  });

  // Fetch catalog for product purchase prices
  const { data: catalogProducts = [], error: catalogError } = useQuery({
    queryKey: ['catalog-products'],
    queryFn: async () => {
      try {
        console.log("useDashboardStats: Récupération du catalogue");
        const products = await db.query(
          'catalog',
          query => query.select('id, purchase_price, price')
        );
        
        console.log("useDashboardStats: Produits catalogue récupérés:", products?.length || 0);
        return Array.isArray(products) ? products : [];
      } catch (error) {
        console.error("Erreur lors de la récupération du catalogue:", error);
        return [];
      }
    },
    retry: 1
  });

  // Fetch unpaid invoices 
  const { data: unpaidInvoices = [], error: invoicesError } = useQuery({
    queryKey: ['invoices', 'unpaid'],
    queryFn: async () => {
      try {
        console.log("useDashboardStats: Récupération des factures impayées");
        const invoices = await db.query(
          'orders',
          query => query.select('*').in('payment_status', ['pending', 'partial'])
        );
        
        console.log("useDashboardStats: Factures impayées récupérées:", invoices?.length || 0);
        return Array.isArray(invoices) ? invoices : [];
      } catch (error) {
        console.error("Erreur lors de la récupération des factures impayées:", error);
        return [];
      }
    },
    retry: 1
  });

  // Fetch monthly outcome entries
  const { data: monthlyExpenses = [], error: expensesError } = useQuery({
    queryKey: ['expenses', 'monthly'],
    queryFn: async () => {
      const firstDayOfMonth = new Date();
      firstDayOfMonth.setDate(1);
      firstDayOfMonth.setHours(0, 0, 0, 0);
      
      try {
        console.log("useDashboardStats: Récupération des dépenses mensuelles");
        const expenses = await db.query(
          'expense_entries',
          query => query.select('*').gte('created_at', firstDayOfMonth.toISOString())
        );
        
        console.log("useDashboardStats: Dépenses mensuelles récupérées:", expenses?.length || 0);
        return Array.isArray(expenses) ? expenses : [];
      } catch (error) {
        console.error("Erreur lors de la récupération des dépenses mensuelles:", error);
        return [];
      }
    },
    retry: 1
  });

  // Log des erreurs s'il y en a
  if (ordersError) console.error("Erreur commandes:", ordersError);
  if (catalogError) console.error("Erreur catalogue:", catalogError);
  if (invoicesError) console.error("Erreur factures:", invoicesError);
  if (expensesError) console.error("Erreur dépenses:", expensesError);

  return {
    todayOrderData,
    catalogProducts,
    unpaidInvoices,
    monthlyExpenses
  };
};
