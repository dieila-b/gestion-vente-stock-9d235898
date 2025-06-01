
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useDashboardStatsUpdated() {
  console.log("useDashboardStatsUpdated: Démarrage de la récupération des données");

  // Orders d'aujourd'hui
  const { data: todayOrderData = [] } = useQuery({
    queryKey: ['dashboard-today-orders'],
    queryFn: async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        const { data, error } = await supabase
          .from('orders')
          .select(`
            *,
            order_items (
              *,
              product_id
            )
          `)
          .gte('created_at', `${today}T00:00:00`)
          .lte('created_at', `${today}T23:59:59`);
        
        if (error) {
          console.error("Erreur orders:", error);
          return [];
        }
        
        return data || [];
      } catch (err) {
        console.error("Erreur dans todayOrderData:", err);
        return [];
      }
    },
    retry: 1,
    staleTime: 30000
  });

  // Produits du catalogue
  const { data: catalogProducts = [] } = useQuery({
    queryKey: ['dashboard-catalog-products'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('catalog')
          .select('*');
        
        if (error) {
          console.error("Erreur catalog:", error);
          return [];
        }
        
        return data || [];
      } catch (err) {
        console.error("Erreur dans catalogProducts:", err);
        return [];
      }
    },
    retry: 1,
    staleTime: 30000
  });

  // Factures impayées (depuis orders)
  const { data: unpaidInvoices = [] } = useQuery({
    queryKey: ['dashboard-unpaid-invoices'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .in('payment_status', ['pending', 'partial']);
        
        if (error) {
          console.error("Erreur unpaid invoices:", error);
          return [];
        }
        
        return data || [];
      } catch (err) {
        console.error("Erreur dans unpaidInvoices:", err);
        return [];
      }
    },
    retry: 1,
    staleTime: 30000
  });

  // Dépenses du mois
  const { data: monthlyExpenses = [] } = useQuery({
    queryKey: ['dashboard-monthly-expenses'],
    queryFn: async () => {
      try {
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        
        const { data, error } = await supabase
          .from('expense_entries')
          .select('*')
          .gte('created_at', startOfMonth.toISOString());
        
        if (error) {
          console.error("Erreur monthly expenses:", error);
          return [];
        }
        
        return data || [];
      } catch (err) {
        console.error("Erreur dans monthlyExpenses:", err);
        return [];
      }
    },
    retry: 1,
    staleTime: 30000
  });

  console.log("useDashboardStatsUpdated: Données récupérées", {
    todayOrderData: todayOrderData?.length || 0,
    catalogProducts: catalogProducts?.length || 0,
    unpaidInvoices: unpaidInvoices?.length || 0,
    monthlyExpenses: monthlyExpenses?.length || 0
  });

  return {
    todayOrderData,
    catalogProducts,
    unpaidInvoices,
    monthlyExpenses
  };
}
