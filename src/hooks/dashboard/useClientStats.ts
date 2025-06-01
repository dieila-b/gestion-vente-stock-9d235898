
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useClientStats() {
  console.log("useClientStats: Démarrage de la récupération");

  const { data: clientsCount = 0 } = useQuery({
    queryKey: ['clients-count'],
    queryFn: async () => {
      try {
        const { count, error } = await supabase
          .from('clients')
          .select('*', { count: 'exact', head: true });
        
        if (error) {
          console.error("Erreur clients count:", error);
          return 0;
        }
        
        return count || 0;
      } catch (err) {
        console.error("Erreur dans clientsCount:", err);
        return 0;
      }
    },
    retry: 1,
    staleTime: 30000
  });

  const { data: supplierPayments = 0 } = useQuery({
    queryKey: ['supplier-payments'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('purchase_invoice_payments')
          .select('amount');
        
        if (error) {
          console.error("Erreur supplier payments:", error);
          return 0;
        }
        
        return (data || []).reduce((sum, payment) => sum + (payment.amount || 0), 0);
      } catch (err) {
        console.error("Erreur dans supplierPayments:", err);
        return 0;
      }
    },
    retry: 1,
    staleTime: 30000
  });

  console.log("useClientStats: Données récupérées", {
    clientsCount,
    supplierPayments
  });

  return {
    clientsCount,
    supplierPayments
  };
}
