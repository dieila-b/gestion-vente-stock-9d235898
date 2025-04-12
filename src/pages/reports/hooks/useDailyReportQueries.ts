
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Client } from "@/types/client";
import { isSelectQueryError, safeGet } from "@/utils/type-utils";

export interface DailyProductSales {
  product_name: string;
  total_quantity: number;
}

export interface DailyClientSales {
  client: Client;
  total_amount: number;
  paid_amount: number;
  remaining_amount: number;
}

export function useDailyReportQueries() {
  // Set today date to midnight
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Query for sales by product
  const { data: salesByProduct, isLoading: isLoadingSalesProduct } = useQuery({
    queryKey: ['daily-sales-by-product'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('order_items')
        .select(`
          quantity,
          products!inner (
            name
          )
        `)
        .gte('created_at', today.toISOString());

      if (error) throw error;

      // Process data safely
      const productSales: DailyProductSales[] = [];
      
      data.forEach(item => {
        // Safely handle product data
        if (isSelectQueryError(item.products)) {
          // Skip items with error in product relation
          return;
        }
        
        // Get product name
        const productName = Array.isArray(item.products) && item.products.length > 0 
          ? item.products.map(p => p.name).join(', ') 
          : 'No products';
        
        // Find existing or create new entry
        const existingIndex = productSales.findIndex(p => p.product_name === productName);
        
        if (existingIndex >= 0) {
          productSales[existingIndex].total_quantity += (item.quantity || 0);
        } else {
          productSales.push({
            product_name: productName,
            total_quantity: item.quantity || 0
          });
        }
      });

      // Sort by quantity descending
      return productSales.sort((a, b) => b.total_quantity - a.total_quantity);
    }
  });

  // Query for daily totals
  const { data: dailyTotals, isLoading: isLoadingTotals } = useQuery({
    queryKey: ['daily-totals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('final_total, paid_amount, remaining_amount')
        .gte('created_at', today.toISOString());

      if (error) throw error;

      return data.reduce((acc, order) => ({
        total: acc.total + (order.final_total || 0),
        paid: acc.paid + (order.paid_amount || 0),
        remaining: acc.remaining + (order.remaining_amount || 0)
      }), { total: 0, paid: 0, remaining: 0 });
    }
  });

  // Query for client sales
  const { data: clientSales, isLoading: isLoadingClients } = useQuery({
    queryKey: ['daily-client-sales'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          final_total,
          paid_amount,
          remaining_amount,
          client:clients(*)
        `)
        .gte('created_at', today.toISOString())
        .not('client_id', 'is', null);

      if (error) throw error;

      // Process safely
      const salesByClient: DailyClientSales[] = [];
      
      data.forEach(order => {
        if (!order.client || isSelectQueryError(order.client)) return;
        
        // Create a safe client object
        const safeClientData = order.client as any;
        const clientData: Client = {
          id: safeClientData.id || '',
          company_name: safeClientData.company_name || 'Unknown',
          contact_name: safeClientData.contact_name,
          email: safeClientData.email,
          phone: safeClientData.phone,
          status: safeClientData.status || 'unknown',
          created_at: safeClientData.created_at || '',
          updated_at: safeClientData.updated_at || ''
        };
        
        const existingIndex = salesByClient.findIndex(c => c.client.id === clientData.id);
        
        if (existingIndex >= 0) {
          salesByClient[existingIndex].total_amount += (order.final_total || 0);
          salesByClient[existingIndex].paid_amount += (order.paid_amount || 0);
          salesByClient[existingIndex].remaining_amount += (order.remaining_amount || 0);
        } else {
          salesByClient.push({
            client: clientData,
            total_amount: order.final_total || 0,
            paid_amount: order.paid_amount || 0,
            remaining_amount: order.remaining_amount || 0
          });
        }
      });

      // Sort by total amount descending
      return salesByClient.sort((a, b) => b.total_amount - a.total_amount);
    }
  });

  // Calculate combined loading state
  const isLoading = isLoadingSalesProduct || isLoadingTotals || isLoadingClients;

  return {
    salesByProduct,
    dailyTotals,
    clientSales,
    isLoading
  };
}
