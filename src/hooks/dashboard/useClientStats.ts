
import { useQuery } from "@tanstack/react-query";
import { db } from "@/utils/db-adapter";

export const useClientStats = () => {
  // Fetch clients count from the clients table
  const { data: clientsCount } = useQuery({
    queryKey: ['clients-count'],
    queryFn: async () => {
      try {
        // Use our safe db-adapter
        const result = await db.query<{ count: number }>(
          'clients',
          query => query.select('id', { count: 'exact', head: true })
        );
        
        return result.count || 0;
      } catch (error) {
        console.error("Error fetching clients count:", error);
        return 0;
      }
    }
  });

  // Fetch supplier payments
  const { data: supplierPayments } = useQuery({
    queryKey: ['supplier-payments'],
    queryFn: async () => {
      try {
        // Use our safe db-adapter
        const payments = await db.query<{ paid_amount: number }[]>(
          'supplier_orders',
          query => query.select('paid_amount').eq('payment_status', 'paid')
        );
        
        return Array.isArray(payments) 
          ? payments.reduce((sum, order) => sum + (order.paid_amount || 0), 0) 
          : 0;
      } catch (error) {
        console.error("Error fetching supplier payments:", error);
        return 0;
      }
    }
  });

  return {
    clientsCount,
    supplierPayments
  };
};
