
import { useQuery } from "@tanstack/react-query";
import { db } from "@/utils/db-core";
import { safeArray, safeNumber } from "@/utils/data-safe/safe-access";

export function useDashboardStatsUpdated() {
  console.log("useDashboardStatsUpdated: Démarrage avec gestion d'erreur renforcée");

  // Orders d'aujourd'hui avec gestion d'erreur robuste
  const { data: todayOrderData = [] } = useQuery({
    queryKey: ['dashboard-today-orders-safe'],
    queryFn: async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        return await db.query(
          'orders',
          q => q.select(`
            *,
            order_items (
              *,
              product_id
            )
          `)
          .gte('created_at', `${today}T00:00:00`)
          .lte('created_at', `${today}T23:59:59`),
          []
        );
      } catch (error) {
        console.error("Erreur dans todayOrderData:", error);
        return [];
      }
    },
    retry: 1,
    staleTime: 30000
  });

  // Produits du catalogue avec fallback
  const { data: catalogProducts = [] } = useQuery({
    queryKey: ['dashboard-catalog-products-safe'],
    queryFn: async () => {
      try {
        return await db.query('catalog', q => q.select('*'), []);
      } catch (error) {
        console.error("Erreur dans catalogProducts:", error);
        return [];
      }
    },
    retry: 1,
    staleTime: 30000
  });

  // Factures impayées avec gestion d'erreur
  const { data: unpaidInvoices = [] } = useQuery({
    queryKey: ['dashboard-unpaid-invoices-safe'],
    queryFn: async () => {
      try {
        return await db.query(
          'orders',
          q => q.select('*').in('payment_status', ['pending', 'partial']),
          []
        );
      } catch (error) {
        console.error("Erreur dans unpaidInvoices:", error);
        return [];
      }
    },
    retry: 1,
    staleTime: 30000
  });

  // Dépenses du mois avec gestion d'erreur
  const { data: monthlyExpenses = [] } = useQuery({
    queryKey: ['dashboard-monthly-expenses-safe'],
    queryFn: async () => {
      try {
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        
        return await db.query(
          'expense_entries',
          q => q.select('*').gte('created_at', startOfMonth.toISOString()),
          []
        );
      } catch (error) {
        console.error("Erreur dans monthlyExpenses:", error);
        return [];
      }
    },
    retry: 1,
    staleTime: 30000
  });

  // Transformation sécurisée des données
  const safeOrderData = safeArray(todayOrderData);
  const safeCatalogProducts = safeArray(catalogProducts);
  const safeUnpaidInvoices = safeArray(unpaidInvoices);
  const safeMonthlyExpenses = safeArray(monthlyExpenses);

  console.log("useDashboardStatsUpdated: Données transformées", {
    todayOrderData: safeOrderData.length,
    catalogProducts: safeCatalogProducts.length,
    unpaidInvoices: safeUnpaidInvoices.length,
    monthlyExpenses: safeMonthlyExpenses.length
  });

  return {
    todayOrderData: safeOrderData,
    catalogProducts: safeCatalogProducts,
    unpaidInvoices: safeUnpaidInvoices,
    monthlyExpenses: safeMonthlyExpenses
  };
}
