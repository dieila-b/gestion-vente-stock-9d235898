
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useDashboardStatsUpdated = () => {
  // Fetch orders and order items for today's sales and margin
  const { data: todayOrderData = [], error: ordersError } = useQuery({
    queryKey: ['orders-with-items-updated', 'today'],
    queryFn: async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      try {
        console.log("useDashboardStatsUpdated: Récupération des commandes du jour");
        const { data: orders, error } = await supabase
          .from('orders')
          .select(`
            *,
            order_items (
              *,
              product:catalog (
                name,
                price,
                purchase_price
              )
            )
          `)
          .gte('created_at', today.toISOString())
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        console.log("useDashboardStatsUpdated: Commandes récupérées:", orders?.length || 0);
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
    queryKey: ['catalog-products-updated'],
    queryFn: async () => {
      try {
        console.log("useDashboardStatsUpdated: Récupération du catalogue");
        const { data: products, error } = await supabase
          .from('catalog')
          .select('id, purchase_price, price');
        
        if (error) throw error;
        
        console.log("useDashboardStatsUpdated: Produits catalogue récupérés:", products?.length || 0);
        return Array.isArray(products) ? products : [];
      } catch (error) {
        console.error("Erreur lors de la récupération du catalogue:", error);
        return [];
      }
    },
    retry: 1
  });

  // Fetch unpaid invoices using the new structure
  const { data: unpaidInvoices = [], error: invoicesError } = useQuery({
    queryKey: ['invoices-unpaid-updated'],
    queryFn: async () => {
      try {
        console.log("useDashboardStatsUpdated: Récupération des factures impayées");
        
        // Récupérer depuis la table sales_invoices d'abord
        const { data: salesInvoices, error: salesError } = await supabase
          .from('sales_invoices')
          .select('*')
          .in('payment_status', ['pending', 'partial']);

        if (salesError) {
          console.error("Erreur sales_invoices:", salesError);
        }

        // Puis depuis la table orders
        const { data: orders, error: ordersError } = await supabase
          .from('orders')
          .select('*')
          .in('payment_status', ['pending', 'partial']);

        if (ordersError) {
          console.error("Erreur orders:", ordersError);
        }

        // Enfin depuis la table invoices mise à jour
        const { data: invoices, error: invoicesError } = await supabase
          .from('invoices')
          .select('*')
          .in('payment_status', ['pending', 'partial']);

        if (invoicesError) {
          console.error("Erreur invoices:", invoicesError);
        }

        // Combiner toutes les sources
        const allUnpaid = [
          ...(salesInvoices || []),
          ...(orders || []),
          ...(invoices || [])
        ];
        
        console.log("useDashboardStatsUpdated: Factures impayées récupérées:", allUnpaid.length);
        return allUnpaid;
      } catch (error) {
        console.error("Erreur lors de la récupération des factures impayées:", error);
        return [];
      }
    },
    retry: 1
  });

  // Fetch monthly outcome entries
  const { data: monthlyExpenses = [], error: expensesError } = useQuery({
    queryKey: ['expenses-monthly-updated'],
    queryFn: async () => {
      const firstDayOfMonth = new Date();
      firstDayOfMonth.setDate(1);
      firstDayOfMonth.setHours(0, 0, 0, 0);
      
      try {
        console.log("useDashboardStatsUpdated: Récupération des dépenses mensuelles");
        const { data: expenses, error } = await supabase
          .from('expense_entries')
          .select('*')
          .gte('created_at', firstDayOfMonth.toISOString());
        
        if (error) throw error;
        
        console.log("useDashboardStatsUpdated: Dépenses mensuelles récupérées:", expenses?.length || 0);
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
