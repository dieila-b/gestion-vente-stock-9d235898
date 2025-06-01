
import { useQuery } from "@tanstack/react-query";
import { db } from "@/utils/db-adapter";

export const useClientStats = () => {
  // Fetch clients count from the clients table
  const { data: clientsCount } = useQuery({
    queryKey: ['clients-count'],
    queryFn: async () => {
      try {
        // Use our safe db-adapter
        const result = await db.query(
          'clients',
          query => query.select('id', { count: 'exact', head: true })
        );
        
        // The result might be an object with count property or an array
        if (Array.isArray(result) && result.length > 0 && 'count' in result[0]) {
          return result[0].count || 0;
        }
        
        // If it's directly an object with count property
        if (result && typeof result === 'object' && 'count' in result) {
          return result.count || 0;
        }
        
        // Fallback: return the length of the array
        return Array.isArray(result) ? result.length : 0;
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
        // Use our safe db-adapter for the supplier_orders table
        const payments = await db.query(
          'purchase_orders',
          query => query.select('paid_amount').eq('payment_status', 'paid'),
          []
        );
        
        // If payments is an array, calculate the sum
        if (Array.isArray(payments)) {
          return payments.reduce((sum, order) => {
            // Use type assertion to handle potential undefined values
            const paidAmount = (order as any).paid_amount || 0;
            return sum + paidAmount;
          }, 0);
        }
        return 0;
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
