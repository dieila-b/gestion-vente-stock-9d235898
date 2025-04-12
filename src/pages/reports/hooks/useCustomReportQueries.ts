
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DateRange } from "react-day-picker";
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

export function useCustomReportQueries(dateRange?: DateRange, selectedPOS: string = "all") {
  // Récupération des ventes par produit
  const { 
    data: salesByProduct, 
    isLoading: isLoadingSalesProduct 
  } = useQuery({
    queryKey: ['custom-sales-by-product', dateRange?.from?.toISOString(), dateRange?.to?.toISOString(), selectedPOS],
    enabled: !!dateRange?.from && !!dateRange?.to,
    queryFn: async () => {
      if (!dateRange?.from || !dateRange?.to) return [];

      const startDate = dateRange.from.toISOString();
      const endDate = dateRange.to.toISOString();

      // Première étape : récupérer les commandes dans la période
      let ordersQuery = supabase
        .from('orders')
        .select('id')
        .gte('created_at', startDate)
        .lte('created_at', endDate);

      if (selectedPOS !== "all") {
        ordersQuery = ordersQuery.eq('depot', selectedPOS);
      }

      const { data: orders, error: ordersError } = await ordersQuery;
      
      if (ordersError) throw ordersError;
      
      if (!orders || orders.length === 0) {
        return []; // Aucune commande dans cette période
      }

      // Extraire les IDs des commandes
      const orderIds = orders.map(order => order.id);

      // Deuxième étape : récupérer les articles des commandes
      const { data: orderItems, error: itemsError } = await supabase
        .from('order_items')
        .select(`
          quantity,
          product_id,
          products(name)
        `)
        .in('order_id', orderIds);

      if (itemsError) throw itemsError;

      // Regrouper par produit et calculer les totaux
      const productSales = orderItems.reduce((acc: DailyProductSales[], item) => {
        const productName = (item.products && typeof item.products === 'object') 
          ? (item.products.name || 'Produit inconnu') 
          : 'Produit inconnu';
          
        const existingProduct = acc.find(p => p.product_name === productName);
        
        if (existingProduct) {
          existingProduct.total_quantity += item.quantity;
        } else {
          acc.push({ product_name: productName, total_quantity: item.quantity });
        }
        
        return acc;
      }, []);

      return productSales.sort((a, b) => b.total_quantity - a.total_quantity);
    }
  });

  // Récupération des totaux pour la période
  const { 
    data: periodTotals, 
    isLoading: isLoadingTotals 
  } = useQuery({
    queryKey: ['custom-totals', dateRange?.from?.toISOString(), dateRange?.to?.toISOString(), selectedPOS],
    enabled: !!dateRange?.from && !!dateRange?.to,
    queryFn: async () => {
      if (!dateRange?.from || !dateRange?.to) return null;
      
      const startDate = dateRange.from.toISOString();
      const endDate = dateRange.to.toISOString();

      let query = supabase
        .from('orders')
        .select('final_total, paid_amount, remaining_amount')
        .gte('created_at', startDate)
        .lte('created_at', endDate);

      if (selectedPOS !== "all") {
        query = query.eq('depot', selectedPOS);
      }

      const { data, error } = await query;
      if (error) throw error;

      return data.reduce((acc, order) => ({
        total: acc.total + order.final_total,
        paid: acc.paid + order.paid_amount,
        remaining: acc.remaining + order.remaining_amount
      }), { total: 0, paid: 0, remaining: 0 });
    }
  });

  // Récupération des ventes par client
  const { 
    data: clientSales, 
    isLoading: isLoadingClients 
  } = useQuery({
    queryKey: ['custom-client-sales', dateRange?.from?.toISOString(), dateRange?.to?.toISOString(), selectedPOS],
    enabled: !!dateRange?.from && !!dateRange?.to,
    queryFn: async () => {
      if (!dateRange?.from || !dateRange?.to) return [];

      const startDate = dateRange.from.toISOString();
      const endDate = dateRange.to.toISOString();

      let query = supabase
        .from('orders')
        .select(`
          final_total,
          paid_amount,
          remaining_amount,
          client:clients(*)
        `)
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .not('client_id', 'is', null);

      if (selectedPOS !== "all") {
        query = query.eq('depot', selectedPOS);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Filter out orders without client data
      const ordersWithClient = data.filter(order => order.client);

      const salesByClient = ordersWithClient.reduce((acc: DailyClientSales[], order) => {
        if (!order.client) return acc;
        
        const client: Client = {
          ...order.client,
          status: (order.client.status as 'particulier' | 'entreprise') || 'particulier'
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

      return salesByClient.sort((a, b) => b.total_amount - a.total_amount);
    }
  });

  const isLoading = isLoadingSalesProduct || isLoadingTotals || isLoadingClients;

  return {
    salesByProduct,
    periodTotals,
    clientSales,
    isLoading,
    isLoadingSalesProduct,
    isLoadingClients
  };
}
