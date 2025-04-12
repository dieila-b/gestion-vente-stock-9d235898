
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Client } from "@/types/Client";
import { safeGet } from "@/utils/supabase-safe-query";

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

      // Agrégation des quantités par produit
      const productSales = data.reduce((acc: DailyProductSales[], item) => {
        const productName = item.products && typeof item.products === 'object' ? 
          (item.products.name || 'Produit inconnu') : 'Produit inconnu';
        
        const existingProduct = acc.find(p => p.product_name === productName);
        
        if (existingProduct) {
          existingProduct.total_quantity += item.quantity;
        } else {
          acc.push({ product_name: productName, total_quantity: item.quantity });
        }
        
        return acc;
      }, []);

      // Tri par quantité décroissante
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
        total: acc.total + order.final_total,
        paid: acc.paid + order.paid_amount,
        remaining: acc.remaining + order.remaining_amount
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

      // Agrégation des ventes par client
      const salesByClient = data.reduce((acc: DailyClientSales[], order) => {
        if (!order.client) return acc;
        
        const client: Client = {
          ...order.client,
          status: order.client.status as 'particulier' | 'entreprise' || 'particulier'
        };
        
        const existingClient = acc.find(c => c.client.id === client.id);
        
        if (existingClient) {
          existingClient.total_amount += order.final_total;
          existingClient.paid_amount += order.paid_amount;
          existingClient.remaining_amount += order.remaining_amount;
        } else {
          acc.push({
            client,
            total_amount: order.final_total,
            paid_amount: order.paid_amount,
            remaining_amount: order.remaining_amount
          });
        }
        
        return acc;
      }, []);

      // Tri par montant total décroissant
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
