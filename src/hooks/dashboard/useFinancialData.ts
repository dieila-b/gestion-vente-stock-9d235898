
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { safeArray, safeNumber } from "@/utils/data-safe/safe-access";

export function useFinancialData() {
  const { data: financialData, error: financialError, isLoading: financialLoading } = useQuery({
    queryKey: ['financial-situation-ultra-safe'],
    queryFn: async () => {
      try {
        console.log("Dashboard: Récupération des données financières ultra-sécurisées");
        
        // Test de connectivité avec Supabase
        const { data: testConnection, error: testError } = await supabase
          .from('orders')
          .select('count')
          .limit(1);

        if (testError) {
          console.error("Erreur de connectivité Supabase:", testError);
          throw new Error(`Problème de connectivité: ${testError.message}`);
        }
        
        // Récupération des commandes payées
        const { data: paidOrders, error: paidError } = await supabase
          .from('orders')
          .select('paid_amount')
          .eq('payment_status', 'paid');

        if (paidError) {
          console.error("Erreur lors de la récupération des commandes payées:", paidError);
        }

        // Récupération des commandes impayées
        const { data: unpaidOrders, error: unpaidError } = await supabase
          .from('orders')
          .select('remaining_amount')
          .in('payment_status', ['pending', 'partial']);

        if (unpaidError) {
          console.error("Erreur lors de la récupération des commandes impayées:", unpaidError);
        }

        // Calculs sécurisés avec fallback
        const creditBalance = safeArray(paidOrders || []).reduce((sum: number, item) => {
          const paidAmount = safeNumber((item as any)?.paid_amount || 0);
          return sum + paidAmount;
        }, 0);
          
        const debitBalance = safeArray(unpaidOrders || []).reduce((sum: number, item) => {
          const remainingAmount = safeNumber((item as any)?.remaining_amount || 0);
          return sum + remainingAmount;
        }, 0);
          
        const netBalance = safeNumber(creditBalance) - safeNumber(debitBalance);

        console.log("Dashboard: Données financières calculées en sécurité", {
          creditBalance,
          debitBalance,
          netBalance
        });

        return {
          creditBalance,
          debitBalance,
          netBalance
        };
      } catch (error) {
        console.error("Erreur dans la requête financière:", error);
        // Retourner des valeurs par défaut plutôt que de faire échouer complètement
        return {
          creditBalance: 0,
          debitBalance: 0,
          netBalance: 0
        };
      }
    },
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 30000
  });

  return { financialData, financialError, financialLoading };
}
