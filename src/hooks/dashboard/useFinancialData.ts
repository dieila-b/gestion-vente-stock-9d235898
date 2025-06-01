
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { safeArray, safeNumber } from "@/utils/data-safe/safe-access";

export function useFinancialData() {
  const { data: financialData, error: financialError, isLoading: financialLoading } = useQuery({
    queryKey: ['financial-situation-ultra-safe'],
    queryFn: async () => {
      try {
        console.log("Dashboard: Récupération des données financières ultra-sécurisées");
        
        // Récupération des commandes payées
        const { data: paidOrders, error: paidError } = await supabase
          .from('orders')
          .select('paid_amount')
          .eq('payment_status', 'paid');

        // Récupération des commandes impayées
        const { data: unpaidOrders, error: unpaidError } = await supabase
          .from('orders')
          .select('remaining_amount')
          .in('payment_status', ['pending', 'partial']);

        // Calculs sécurisés
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
        return {
          creditBalance: 0,
          debitBalance: 0,
          netBalance: 0
        };
      }
    },
    retry: 2,
    staleTime: 30000
  });

  return { financialData, financialError, financialLoading };
}
