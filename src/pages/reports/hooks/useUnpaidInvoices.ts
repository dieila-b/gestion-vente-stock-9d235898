
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DateRange } from "@/types/date-range";

export function useUnpaidInvoices(date: DateRange, clientId?: string) {
  return useQuery({
    queryKey: ['unpaid-invoices', date?.from, date?.to, clientId],
    enabled: !!date?.from && !!date?.to,
    queryFn: async () => {
      if (!date?.from || !date?.to) return [];

      // Create a properly structured query for the orders table
      let query = supabase
        .from('orders')
        .select(`
          id,
          created_at,
          client_id,
          final_total as total_amount,
          paid_amount,
          remaining_amount,
          payment_status,
          client:clients(company_name)
        `)
        .in('payment_status', ['pending', 'partial'])
        .gte('created_at', date.from.toISOString())
        .lte('created_at', date.to.toISOString());

      if (clientId) {
        query = query.eq('client_id', clientId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform data to match expected structure
      return data.map(order => ({
        id: order.id,
        created_at: order.created_at,
        client: order.client,
        client_id: order.client_id,
        invoice_number: `FACT-${order.id.slice(0, 8)}`,
        total_amount: order.total_amount,
        paid_amount: order.paid_amount,
        remaining_amount: order.remaining_amount,
        payment_status: order.payment_status
      }));
    }
  });
}
