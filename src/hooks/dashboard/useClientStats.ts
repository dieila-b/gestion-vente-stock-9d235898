
import { useQuery } from "@tanstack/react-query";
import { db } from "@/utils/db-core";
import { safeNumber } from "@/utils/data-safe/safe-access";

export function useClientStats() {
  console.log("useClientStats: Démarrage avec gestion d'erreur renforcée");

  const { data: clientsCount = 0 } = useQuery({
    queryKey: ['clients-count-safe'],
    queryFn: async () => {
      try {
        return await db.count('clients');
      } catch (error) {
        console.error("Erreur clients count:", error);
        return 0;
      }
    },
    retry: 1,
    staleTime: 30000
  });

  const { data: supplierPayments = 0 } = useQuery({
    queryKey: ['supplier-payments-safe'],
    queryFn: async () => {
      try {
        const payments = await db.query(
          'purchase_invoice_payments',
          q => q.select('amount'),
          []
        );
        
        return payments.reduce((sum, payment) => {
          return sum + safeNumber(payment?.amount, 0);
        }, 0);
      } catch (error) {
        console.error("Erreur supplier payments:", error);
        return 0;
      }
    },
    retry: 1,
    staleTime: 30000
  });

  console.log("useClientStats: Données récupérées", {
    clientsCount: safeNumber(clientsCount, 0),
    supplierPayments: safeNumber(supplierPayments, 0)
  });

  return {
    clientsCount: safeNumber(clientsCount, 0),
    supplierPayments: safeNumber(supplierPayments, 0)
  };
}
