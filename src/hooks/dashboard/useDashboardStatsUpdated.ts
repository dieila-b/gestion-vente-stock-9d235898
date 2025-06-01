
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { safeArray } from "@/utils/data-safe/safe-access";

export function useDashboardStatsUpdated() {
  console.log("useDashboardStatsUpdated: Démarrage avec gestion d'erreur renforcée");

  // Requête pour les commandes du jour avec gestion d'erreur robuste
  const { data: todayOrderData = [] } = useQuery({
    queryKey: ['dashboard-today-orders-safe'],
    queryFn: async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        
        const { data, error } = await supabase
          .from('orders')
          .select(`
            *,
            order_items(
              *,
              product:catalog(*)
            )
          `)
          .gte('created_at', `${today}T00:00:00`)
          .lte('created_at', `${today}T23:59:59`)
          .eq('status', 'completed');
        
        if (error) {
          console.error("Erreur dans todayOrderData:", error);
          return [];
        }
        
        return data || [];
      } catch (error) {
        console.error("Exception dans todayOrderData:", error);
        return [];
      }
    },
    retry: 2,
    staleTime: 60000 // 1 minute
  });

  // Requête pour le catalogue avec gestion d'erreur
  const { data: catalogProducts = [] } = useQuery({
    queryKey: ['dashboard-catalog-safe'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('catalog')
          .select('*');
        
        if (error) {
          console.error("Erreur dans catalog:", error);
          return [];
        }
        
        return data || [];
      } catch (error) {
        console.error("Exception dans catalog:", error);
        return [];
      }
    },
    retry: 2,
    staleTime: 300000 // 5 minutes
  });

  // Requête pour les factures impayées
  const { data: unpaidInvoices = [] } = useQuery({
    queryKey: ['dashboard-unpaid-invoices-safe'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('remaining_amount')
          .in('payment_status', ['pending', 'partial'])
          .gt('remaining_amount', 0);
        
        if (error) {
          console.error("Erreur dans unpaidInvoices:", error);
          return [];
        }
        
        return data || [];
      } catch (error) {
        console.error("Exception dans unpaidInvoices:", error);
        return [];
      }
    },
    retry: 2,
    staleTime: 120000 // 2 minutes
  });

  // Requête pour les dépenses mensuelles
  const { data: monthlyExpenses = [] } = useQuery({
    queryKey: ['dashboard-monthly-expenses-safe'],
    queryFn: async () => {
      try {
        const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
        
        const { data, error } = await supabase
          .from('outcome_entries')
          .select('amount')
          .gte('created_at', `${currentMonth}-01T00:00:00`)
          .lt('created_at', `${currentMonth}-32T00:00:00`);
        
        if (error) {
          console.error("Erreur dans monthlyExpenses:", error);
          return [];
        }
        
        return data || [];
      } catch (error) {
        console.error("Exception dans monthlyExpenses:", error);
        return [];
      }
    },
    retry: 2,
    staleTime: 300000 // 5 minutes
  });

  console.log("useDashboardStatsUpdated: Retour des données", {
    todayOrderDataLength: safeArray(todayOrderData).length,
    catalogProductsLength: safeArray(catalogProducts).length,
    unpaidInvoicesLength: safeArray(unpaidInvoices).length,
    monthlyExpensesLength: safeArray(monthlyExpenses).length
  });

  return {
    todayOrderData: safeArray(todayOrderData),
    catalogProducts: safeArray(catalogProducts),
    unpaidInvoices: safeArray(unpaidInvoices),
    monthlyExpenses: safeArray(monthlyExpenses)
  };
}
