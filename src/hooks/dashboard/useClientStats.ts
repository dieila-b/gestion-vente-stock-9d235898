
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useClientStats = () => {
  // Fetch clients count from the clients table
  const { data: clientsCount } = useQuery({
    queryKey: ['clients-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('clients')
        .select('*', { count: 'exact', head: true });
      
      if (error) throw error;
      return count || 0;
    }
  });

  // Fetch supplier payments
  const { data: supplierPayments } = useQuery({
    queryKey: ['supplier-payments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('supplier_orders')
        .select('paid_amount')
        .eq('payment_status', 'paid');
      
      if (error) throw error;
      return data?.reduce((sum, order) => sum + (order.paid_amount || 0), 0) || 0;
    }
  });

  return {
    clientsCount,
    supplierPayments
  };
};
