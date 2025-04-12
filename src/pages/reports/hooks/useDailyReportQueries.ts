import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { safeMap, safeGet } from "@/utils/report-utils";
import { Client } from "@/types/client_unified";
import { DailyProductSales, DailyClientSales, PeriodTotals } from "./types";

export function useDailyReportQueries(selectedDate: Date | null) {
  const formattedDate = selectedDate?.toISOString().split('T')[0];

  // Query for period totals
  const { data: periodTotals } = useQuery({
    queryKey: ['daily-report', 'period-totals', formattedDate],
    queryFn: async (): Promise<PeriodTotals> => {
      try {
        if (!formattedDate) {
          return { total: 0, paid: 0, remaining: 0 };
        }

        const { data, error } = await supabase
          .from('orders')
          .select('id, total, paid_amount, remaining_amount')
          .eq('created_at::date', formattedDate);

        if (error) throw error;

        const total = data.reduce((sum, order) => sum + (order.total || 0), 0);
        const paid = data.reduce((sum, order) => sum + (order.paid_amount || 0), 0);
        const remaining = data.reduce((sum, order) => sum + (order.remaining_amount || 0), 0);

        return { total, paid, remaining };
      } catch (error) {
        console.error('Error fetching period totals:', error);
        return { total: 0, paid: 0, remaining: 0 };
      }
    },
    enabled: !!formattedDate,
  });

  // Query for product sales
  const { data: dailyProducts } = useQuery({
    queryKey: ['daily-product-sales', formattedDate],
    queryFn: async (): Promise<DailyProductSales[]> => {
      try {
        if (!formattedDate) {
          return [];
        }

        const { data, error } = await supabase
          .from('orders')
          .select(`
            id,
            items:order_items(
              id,
              product_id,
              quantity,
              price,
              product:catalog(id, name)
            )
          `)
          .eq('created_at::date', formattedDate);

        if (error) throw error;

        const productMap = new Map<string, DailyProductSales>();
      
        data.forEach(order => {
          safeMap(order.items, (item: any) => {
            const productId = item.product_id;
            const productName = safeGet(item.product, 'name', 'Unknown Product');
            const quantity = item.quantity || 0;
            const salesAmount = (item.price || 0) * quantity;
            
            if (productMap.has(productId)) {
              const existing = productMap.get(productId)!;
              existing.total_quantity += quantity;
              existing.total_sales += salesAmount;
            } else {
              productMap.set(productId, {
                product_id: productId,
                product_name: productName,
                total_quantity: quantity,
                total_sales: salesAmount
              });
            }
          });
        });
        
        return Array.from(productMap.values());
      } catch (error) {
        console.error('Error fetching daily product sales:', error);
        return [];
      }
    },
    enabled: !!formattedDate,
  });

  // Query for client sales
  const { data: dailyClients } = useQuery({
    queryKey: ['daily-client-sales', formattedDate],
    queryFn: async (): Promise<DailyClientSales[]> => {
      try {
        if (!formattedDate) {
          return [];
        }

        const { data, error } = await supabase
          .from('orders')
          .select(`
            id,
            client_id,
            total,
            paid_amount,
            remaining_amount,
            client:clients(*)
          `)
          .eq('created_at::date', formattedDate);

        if (error) throw error;

        const clientMap = new Map<string, DailyClientSales>();
        
        data.forEach(order => {
          const clientId = order.client_id;
          if (!clientId) return;
          
          const client = safeGet(order.client, 'company_name', 'Unknown Client');
          const total = order.total || 0;
          const paidAmount = order.paid_amount || 0;
          const remainingAmount = order.remaining_amount || 0;
          
          if (clientMap.has(clientId)) {
            const existing = clientMap.get(clientId)!;
            existing.total += total;
            existing.paid_amount += paidAmount;
            existing.remaining_amount += remainingAmount;
          } else {
            clientMap.set(clientId, {
              client: client as any,
              client_id: clientId,
              total,
              paid_amount: paidAmount,
              remaining_amount: remainingAmount
            });
          }
        });
        
        return Array.from(clientMap.values());
      } catch (error) {
        console.error('Error fetching daily client sales:', error);
        return [];
      }
    },
    enabled: !!formattedDate,
  });

  return {
    periodTotals: periodTotals || { total: 0, paid: 0, remaining: 0 },
    dailyProducts: dailyProducts || [],
    dailyClients: dailyClients || []
  };
}
